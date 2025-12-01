import { serve } from "bun";
import index from "./index.html";
import { SolanaService } from "./lib/solana";
import { ChatParser, ParsedCommand } from "./lib/chatParser";

// In-memory state for the demo
let solanaService: SolanaService | null = null;
let pendingCommand: ParsedCommand | null = null;

// Initialize Solana Service (lazy load or on start)
// For this demo, we'll initialize it when the server starts if we want a persistent wallet,
// but to allow the user to "create" it, we might want to wait.
// Let's just create one on startup for simplicity of the demo.
solanaService = new SolanaService();
console.log("Wallet initialized:", solanaService.getPublicKey());

const server = serve({
  routes: {
    "/*": index,

    "/api/wallet": {
      async GET(req) {
        if (!solanaService) solanaService = new SolanaService();
        const balance = await solanaService.getBalance();
        return Response.json({
          publicKey: solanaService.getPublicKey(),
          balance,
        });
      },
      async POST(req) {
        // Reset wallet
        solanaService = new SolanaService();
        return Response.json({
          publicKey: solanaService.getPublicKey(),
          balance: 0,
        });
      }
    },

    "/api/airdrop": {
      async POST(req) {
        if (!solanaService) return new Response("No wallet", { status: 400 });
        try {
          const signature = await solanaService.requestAirdrop();
          return Response.json({ signature });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }
    },

    "/api/chat": {
      async POST(req) {
        const { message } = await req.json();
        if (!solanaService) solanaService = new SolanaService();

        const command = ChatParser.parse(message);
        let responseText = "";
        let actionTaken = null;

        // State Machine for Chat
        if (pendingCommand) {
          if (command.intent === "CONFIRM_YES") {
            if (pendingCommand.intent === "SEND") {
              try {
                responseText = "Processing transaction... ⏳";
                // In a real app, we'd stream this update. For now, we'll just wait (blocking) or return "Processing" and let the client poll.
                // Let's just wait for the demo, it might timeout but Devnet is usually fast enough.
                const sig = await solanaService.transferSOL(pendingCommand.recipient!, pendingCommand.amount!);
                responseText = `✅ Transaction Sent!\nSignature: ${sig.slice(0, 8)}...`;
                actionTaken = { type: "sent", amount: pendingCommand.amount, signature: sig };
              } catch (e) {
                responseText = `❌ Transaction Failed: ${e.message}`;
              }
            }
            pendingCommand = null;
          } else if (command.intent === "CONFIRM_NO") {
            responseText = "Transaction cancelled. ❌";
            pendingCommand = null;
          } else {
            responseText = "Please type 'yes' to confirm or 'no' to cancel the pending transaction.";
          }
        } else {
          switch (command.intent) {
            case "BALANCE":
              const bal = await solanaService.getBalance();
              responseText = `Your current balance is ${bal.toFixed(4)} SOL. 💰`;
              break;
            case "ADDRESS":
              responseText = `Your wallet address is:\n${solanaService.getPublicKey()} 🔑`;
              break;
            case "SEND":
              pendingCommand = command;
              responseText = `Are you sure you want to send ${command.amount} SOL to ${command.recipient?.slice(0, 6)}...? (yes/no) 🤔`;
              break;
            case "HELP":
              responseText = "I can help you manage your Solana wallet! 🤖\n\nTry saying:\n- 'Balance'\n- 'Address'\n- 'Send 0.1 to [address]'";
              break;
            default:
              responseText = "I didn't understand that. 😕 Try 'Help' to see what I can do.";
              break;
          }
        }

        return Response.json({
          text: responseText,
          action: actionTaken
        });
      }
    }
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
