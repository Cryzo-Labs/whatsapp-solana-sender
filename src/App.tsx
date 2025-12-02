```typescript
import React, { useState, useEffect } from "react";
import { QRCodeDisplay } from "./components/QRCodeDisplay";
import { WalletDashboard } from "./components/WalletDashboard";
import { motion } from "framer-motion";

interface Transaction {
  signature: string;
  type: "sent" | "received" | "airdrop";
  amount: number;
  timestamp: Date;
}

export function App() {
  const [wallet, setWallet] = useState({ publicKey: "", balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      setWallet(data);
    } catch (e) {
      console.error("Failed to fetch wallet", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    // Poll for wallet updates (since transactions happen via WhatsApp now)
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAirdrop = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/airdrop", { method: "POST" });
      const data = await res.json();
      if (data.signature) {
        setTransactions((prev) => [
          {
            signature: data.signature,
            type: "airdrop",
            amount: 1,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        // Wait a bit for confirmation before refreshing balance
        setTimeout(fetchWallet, 2000);
      }
    } catch (e) {
      console.error("Airdrop failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-whatsapp-text-primary p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* Left Column: Dashboard */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Solana</h1>
              <p className="text-whatsapp-text-secondary">
                Send crypto directly from your WhatsApp.
              </p>
            </div>
            
            <WalletDashboard
              publicKey={wallet.publicKey}
              balance={wallet.balance}
              transactions={transactions}
              onRefresh={fetchWallet}
              onRequestAirdrop={handleAirdrop}
              isLoading={isLoading}
            />

            <div className="mt-8 p-4 bg-whatsapp-header rounded-lg border border-white/5 text-sm text-whatsapp-text-secondary">
              <h3 className="text-whatsapp-accent font-medium mb-2">How to use:</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Link your WhatsApp using the QR code.</li>
                <li>Send a message to <b>Yourself</b> (Note to Self).</li>
                <li>Type <span className="text-white font-mono">"Balance"</span> or <span className="text-white font-mono">"Send 0.1 to [addr]"</span>.</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Column: QR Code / Status */}
        <div className="lg:col-span-2 flex items-center justify-center order-1 lg:order-2 h-[80vh]">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <QRCodeDisplay />
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default App;
