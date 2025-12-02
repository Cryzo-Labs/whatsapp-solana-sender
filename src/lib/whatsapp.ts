import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    type WASocket,
    type ConnectionState,
    type AnyMessageContent,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as fs from "fs";
import { ChatParser } from "./chatParser";
import { SolanaService } from "./solana";

export class WhatsAppBot {
    private sock: WASocket | null = null;
    private qrCode: string | null = null;
    private connectionStatus: "open" | "connecting" | "close" = "connecting";
    private solanaService: SolanaService;
    // Map to track pending confirmations: userId -> PendingCommand
    private pendingCommands: Map<string, any> = new Map();

    constructor(solanaService: SolanaService) {
        this.solanaService = solanaService;
        this.initialize();
    }

    async initialize() {
        const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true, // Useful for debugging logs
        });

        this.sock.ev.on("connection.update", (update: ConnectionState) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qrCode = qr;
                console.log("New QR Code generated");
            }

            if (connection === "close") {
                const shouldReconnect =
                    (lastDisconnect?.error as Boom)?.output?.statusCode !==
                    DisconnectReason.loggedOut;
                console.log(
                    "Connection closed due to ",
                    lastDisconnect?.error,
                    ", reconnecting ",
                    shouldReconnect
                );
                if (shouldReconnect) {
                    this.initialize();
                }
            } else if (connection === "open") {
                console.log("Opened connection");
                this.connectionStatus = "open";
                this.qrCode = null;
            }
        });

        this.sock.ev.on("creds.update", saveCreds);

        this.sock.ev.on("messages.upsert", async ({ messages }) => {
            const m = messages[0];
            if (!m.message) return;

            // Ignore status updates
            if (m.key.remoteJid === "status@broadcast") return;

            // Only respond to self (Note to Self) or if you want it to be a public bot, remove this check.
            // For a "Sender" tool, usually you want to control it.
            // Let's allow any chat for now but log it.

            const msgBody =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";

            if (!msgBody) return;

            const remoteJid = m.key.remoteJid!;
            console.log(`Received message from ${remoteJid}: ${msgBody}`);

            await this.handleMessage(remoteJid, msgBody);
        });
    }

    async handleMessage(jid: string, text: string) {
        if (!this.sock) return;

        const command = ChatParser.parse(text);
        const pending = this.pendingCommands.get(jid);

        if (pending) {
            if (command.intent === "CONFIRM_YES") {
                await this.sendMessage(jid, "Processing transaction... ⏳");
                try {
                    const sig = await this.solanaService.transferSOL(pending.recipient!, pending.amount!);
                    await this.sendMessage(jid, `✅ Transaction Sent!\nSignature: ${sig}`);
                } catch (e: any) {
                    await this.sendMessage(jid, `❌ Transaction Failed: ${e.message}`);
                }
                this.pendingCommands.delete(jid);
            } else if (command.intent === "CONFIRM_NO") {
                await this.sendMessage(jid, "Transaction cancelled. ❌");
                this.pendingCommands.delete(jid);
            } else {
                await this.sendMessage(jid, "Please type 'yes' to confirm or 'no' to cancel the pending transaction.");
            }
            return;
        }

        switch (command.intent) {
            case "BALANCE":
                const bal = await this.solanaService.getBalance();
                await this.sendMessage(jid, `Your current balance is ${bal.toFixed(4)} SOL. 💰`);
                break;
            case "ADDRESS":
                await this.sendMessage(jid, `Your wallet address is:\n${this.solanaService.getPublicKey()} 🔑`);
                break;
            case "SEND":
                this.pendingCommands.set(jid, command);
                await this.sendMessage(jid, `Are you sure you want to send ${command.amount} SOL to ${command.recipient?.slice(0, 6)}...? (yes/no) 🤔`);
                break;
            case "HELP":
                await this.sendMessage(jid, "I can help you manage your Solana wallet! 🤖\n\nTry saying:\n- 'Balance'\n- 'Address'\n- 'Send 0.1 to [address]'");
                break;
            // Don't respond to UNKNOWN to avoid spamming normal chats
        }
    }

    async sendMessage(jid: string, text: string) {
        if (this.sock) {
            await this.sock.sendMessage(jid, { text });
        }
    }

    getQR() {
        return this.qrCode;
    }

    getStatus() {
        return this.connectionStatus;
    }
}
