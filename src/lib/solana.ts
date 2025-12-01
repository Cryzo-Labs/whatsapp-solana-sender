import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

export class SolanaService {
    private connection: Connection;
    private keypair: Keypair;

    constructor(privateKey?: string) {
        this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        if (privateKey) {
            this.keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        } else {
            this.keypair = Keypair.generate();
        }
    }

    getPublicKey(): string {
        return this.keypair.publicKey.toString();
    }

    getPrivateKey(): string {
        return bs58.encode(this.keypair.secretKey);
    }

    async getBalance(): Promise<number> {
        const balance = await this.connection.getBalance(this.keypair.publicKey);
        return balance / LAMPORTS_PER_SOL;
    }

    async requestAirdrop(): Promise<string> {
        try {
            const signature = await this.connection.requestAirdrop(
                this.keypair.publicKey,
                1 * LAMPORTS_PER_SOL
            );
            await this.connection.confirmTransaction(signature);
            return signature;
        } catch (error) {
            console.error("Airdrop failed:", error);
            throw new Error("Airdrop failed. Devnet might be busy.");
        }
    }

    async transferSOL(toAddress: string, amount: number): Promise<string> {
        try {
            const toPublicKey = new PublicKey(toAddress);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.keypair.publicKey,
                    toPubkey: toPublicKey,
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.keypair]
            );
            return signature;
        } catch (error) {
            console.error("Transfer failed:", error);
            throw error;
        }
    }

    static isValidAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
}
