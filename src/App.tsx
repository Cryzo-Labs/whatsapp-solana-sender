import React, { useState, useEffect } from "react";
import { WhatsAppSimulator } from "./components/WhatsAppSimulator";
import { WalletDashboard } from "./components/WalletDashboard";
import { motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

interface Transaction {
  signature: string;
  type: "sent" | "received" | "airdrop";
  amount: number;
  timestamp: Date;
}

export function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 I'm your Solana Assistant. You can ask me to check your balance, show your address, or send SOL to a friend.",
      sender: "bot",
      timestamp: new Date(),
      status: "read",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
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
  }, []);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // Simulate network delay for realism
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "delivered" } : m));
    }, 1000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      // Simulate reading delay
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "read" } : m));
      }, 1500);

      // Bot response delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: data.text,
            sender: "bot",
            timestamp: new Date(),
            status: "read",
          },
        ]);

        if (data.action) {
          fetchWallet();
          if (data.action.type === "sent") {
            setTransactions((prev) => [
              {
                signature: data.action.signature,
                type: "sent",
                amount: data.action.amount,
                timestamp: new Date(),
              },
              ...prev,
            ]);
          }
        }
      }, 2000);

    } catch (e) {
      setIsTyping(false);
      console.error("Chat error", e);
    }
  };

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
                Send crypto as easily as sending a message.
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
                <li>Request an Airdrop to get Devnet SOL.</li>
                <li>Type <span className="text-white font-mono">"Balance"</span> to check funds.</li>
                <li>Type <span className="text-white font-mono">"Send 0.1 to [address]"</span> to transfer.</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Simulator */}
        <div className="lg:col-span-2 flex items-center justify-center order-1 lg:order-2 h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <WhatsAppSimulator
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default App;
