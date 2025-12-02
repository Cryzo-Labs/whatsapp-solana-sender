import React from "react";
import { Copy, RefreshCw, Wallet, ArrowUpRight, ArrowDownLeft, QrCode, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

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
    const [showReceive, setShowReceive] = React.useState(false);
    const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

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
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (showReceive && publicKey) {
            QRCode.toDataURL(publicKey)
                .then(setQrDataUrl)
                .catch(console.error);
        }
    }, [showReceive, publicKey]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicKey);
    };

    const usdBalance = solPrice && balance ? (balance * solPrice).toFixed(2) : "---";

    return (
        <div className="space-y-6 w-full max-w-md">
            <Card className="bg-whatsapp-header border-white/10 text-whatsapp-text-primary shadow-xl relative overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-whatsapp-text-secondary uppercase tracking-wider flex justify-between items-center">
                        <span>Solana Wallet</span>
                        <Wallet size={16} />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {showReceive ? (
                        <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in duration-200">
                            <div className="absolute top-4 right-4">
                                <Button variant="ghost" size="icon" onClick={() => setShowReceive(false)} className="h-8 w-8 text-whatsapp-text-secondary hover:text-white hover:bg-white/10">
                                    <X size={18} />
                                </Button>
                            </div>
                            <h3 className="text-white font-medium mb-4">Scan to Receive</h3>
                            {qrDataUrl && (
                                <div className="bg-white p-2 rounded-lg mb-4">
                                    <img src={qrDataUrl} alt="Wallet QR" className="w-48 h-48" />
                                </div>
                            )}
                            <p className="text-xs text-whatsapp-text-secondary text-center break-all max-w-[80%]">
                                {publicKey}
                            </p>
                        </div>
                    ) : (
                        <>
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

                            <div className="grid grid-cols-3 gap-2">
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
                                <Button
                                    className="bg-[#202c33] hover:bg-[#2a3942] text-white border border-white/10"
                                    onClick={() => setShowReceive(true)}
                                >
                                    <QrCode size={16} className="mr-2" />
                                    Receive
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-whatsapp-header border-white/10 text-whatsapp-text-primary shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-whatsapp-text-secondary uppercase tracking-wider flex justify-between items-center">
                        <span>Recent Activity</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-whatsapp-accent hover:text-whatsapp-accent/80 hover:bg-transparent p-0"
                            onClick={() => {
                                const headers = ["Signature", "Type", "Amount", "Timestamp"];
                                const rows = transactions.map(tx => [
                                    tx.signature,
                                    tx.type,
                                    tx.amount.toString(),
                                    tx.timestamp.toISOString()
                                ]);
                                const csvContent = [
                                    headers.join(","),
                                    ...rows.map(row => row.join(","))
                                ].join("\n");

                                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                                const link = document.createElement("a");
                                const url = URL.createObjectURL(blob);
                                link.setAttribute("href", url);
                                link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            disabled={transactions.length === 0}
                        >
                            Export CSV
                        </Button>
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
