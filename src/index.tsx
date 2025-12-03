import { serve } from "bun";
import index from "./index.html";
import { SolanaService } from "./lib/solana";
import { WhatsAppBot } from "./lib/whatsapp";
import { StorageService } from "./lib/storage";

// Initialize Services
const solanaService = new SolanaService();
const storageService = new StorageService();
console.log("Wallet initialized:", solanaService.getPublicKey());

const whatsAppBot = new WhatsAppBot(solanaService, storageService);

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
          // Record airdrop
          storageService.addTransaction({
            signature,
            type: "airdrop",
            amount: 1,
            timestamp: new Date().toISOString(),
          });
          return Response.json({ signature });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }
    },

    "/api/transactions": {
      async GET(req) {
        const transactions = storageService.getTransactions();
        return Response.json(transactions);
      }
    },

    "/api/contacts": {
      async GET(req) {
        return Response.json(storageService.getContacts());
      },
      async POST(req) {
        const body = await req.json();
        if (!body.name || !body.address) {
          return new Response("Missing name or address", { status: 400 });
        }
        const contact = {
          id: crypto.randomUUID(),
          name: body.name,
          address: body.address
        };
        storageService.saveContact(contact);
        return Response.json(contact);
      },
      async DELETE(req) {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return new Response("Missing id", { status: 400 });
        storageService.deleteContact(id);
        return new Response("Deleted", { status: 200 });
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
