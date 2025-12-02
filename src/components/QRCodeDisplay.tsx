import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, CheckCircle } from "lucide-react";

export function QRCodeDisplay() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("connecting");
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/whatsapp/status");
                const data = await res.json();
                setStatus(data.status);
            } catch (e) {
                console.error("Failed to fetch status", e);
            }
        };

        const fetchQR = async () => {
            try {
                const res = await fetch("/api/whatsapp/qr");
                const data = await res.json();
                if (data.qr && data.qr !== qrCode) {
                    setQrCode(data.qr);
                    const url = await QRCode.toDataURL(data.qr);
                    setQrDataUrl(url);
                }
            } catch (e) {
                console.error("Failed to fetch QR", e);
            }
        };

        const interval = setInterval(() => {
            if (status === "open") return;
            fetchStatus();
            fetchQR();
        }, 3000);

        return () => clearInterval(interval);
    }, [qrCode, status]);

    if (status === "open") {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-whatsapp-header rounded-xl border border-white/10 text-center h-[400px]">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Connected</h2>
                <p className="text-whatsapp-text-secondary">
                    You can now send commands to your own number or this bot's number.
                </p>
                <div className="mt-6 p-4 bg-[#0b141a] rounded-lg text-left text-sm text-whatsapp-text-secondary">
                    <p className="mb-2">Try sending:</p>
                    <code className="block text-whatsapp-accent">Balance</code>
                    <code className="block text-whatsapp-accent">Address</code>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-white/10 text-center h-[400px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Link WhatsApp</h2>
            <p className="text-gray-500 mb-6">
                Open WhatsApp on your phone, go to Linked Devices, and scan this code.
            </p>

            {qrDataUrl ? (
                <div className="relative">
                    <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-64 h-64" />
                    {status === "connecting" && !qrCode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Loader2 className="animate-spin text-whatsapp-accent" size={40} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Loader2 className="animate-spin text-gray-400" size={40} />
                </div>
            )}

            <p className="mt-4 text-xs text-gray-400">
                Status: <span className="uppercase font-medium">{status}</span>
            </p>
        </div>
    );
}
