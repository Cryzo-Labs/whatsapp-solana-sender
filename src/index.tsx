import { serve } from "bun";
import index from "./index.html";
import { SolanaService } from "./lib/solana";
import { WhatsAppBot } from "./lib/whatsapp";

// Initialize Services
const solanaService = new SolanaService();
console.log("Wallet initialized:", solanaService.getPublicKey());

const whatsAppBot = new WhatsAppBot(solanaService);

const server = serve({
  routes: {
    "/*": index,

    "/api/wallet": {
      async GET(req) {
        const balance = await solanaService.getBalance();
        return Response.json({
          publicKey: solanaService.getPublicKey(),
          balance,
        });
      },
    },

    "/api/airdrop": {
      async POST(req) {
        try {
          const signature = await solanaService.requestAirdrop();
          return Response.json({ signature });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }
    },

    // WhatsApp Endpoints
    "/api/whatsapp/qr": {
      async GET(req) {
        const qr = whatsAppBot.getQR();
        return Response.json({ qr });
      },
    },

    "/api/whatsapp/status": {
      async GET(req) {
        const status = whatsAppBot.getStatus();
        return Response.json({ status });
      },
    }
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
