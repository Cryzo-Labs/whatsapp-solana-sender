import React from "react";
import { Copy, RefreshCw, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Transaction {
    signature: string;
    type: "sent" | "received" | "airdrop";
    amount: number;
    timestamp: Date;
}

interface WalletDashboardProps {
    publicKey: string;
    balance: number;
    transactions: Transaction[];
    onRefresh: () => void;
    onRequestAirdrop: () => void;
    isLoading: boolean;
}

export function WalletDashboard({
    publicKey,
    balance,
    transactions,
    onRefresh,
    onRequestAirdrop,
    isLoading,
}: WalletDashboardProps) {
    const [solPrice, setSolPrice] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
                const data = await res.json();
                setSolPrice(data.solana.usd);
            } catch (e) {
                console.error("Failed to fetch SOL price", e);
            }
        };
        fetchPrice();
        // Refresh price every minute
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicKey);
        // Could add toast here
    };

    const usdBalance = solPrice && balance ? (balance * solPrice).toFixed(2) : "---";

    return (
        <div className="space-y-6 w-full max-w-md">
            <Card className="bg-whatsapp-header border-white/10 text-whatsapp-text-primary shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-whatsapp-text-secondary uppercase tracking-wider flex justify-between items-center">
                        <span>Solana Wallet</span>
                        <Wallet size={16} />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">
                            {balance !== null ? balance.toFixed(4) : "---"} <span className="text-whatsapp-accent text-xl">SOL</span>
                        </span>
                        <span className="text-sm text-whatsapp-text-secondary font-medium">
                            ≈ ${usdBalance} USD
                        </span>
                        <div className="flex items-center gap-2 text-xs text-whatsapp-text-secondary bg-[#0b141a] p-2 rounded-md mt-2 font-mono break-all">
                            {publicKey || "Loading..."}
                            <button onClick={copyToClipboard} className="hover:text-white transition-colors">
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="bg-[#0b141a] border-white/10 hover:bg-[#0b141a]/80 text-whatsapp-accent hover:text-whatsapp-accent"
                            onClick={onRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button
                            className="bg-whatsapp-accent hover:bg-whatsapp-accent/90 text-white border-none"
                            onClick={onRequestAirdrop}
                            disabled={isLoading}
                        >
                            <ArrowDownLeft size={16} className="mr-2" />
                            Airdrop
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-whatsapp-header border-white/10 text-whatsapp-text-primary shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-whatsapp-text-secondary uppercase tracking-wider">
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-whatsapp-text-secondary text-sm">
                                No transactions yet
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.signature} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'sent' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                            }`}>
                                            {tx.type === 'sent' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                                            <p className="text-xs text-whatsapp-text-secondary">
                                                {tx.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-medium ${tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                                        }`}>
                                        {tx.type === 'sent' ? '-' : '+'}{tx.amount.toFixed(4)} SOL
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
