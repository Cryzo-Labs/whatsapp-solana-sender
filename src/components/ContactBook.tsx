import React, { useState, useEffect } from "react";
import { Plus, Trash2, User, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Contact {
    id: string;
    name: string;
    address: string;
}

export function ContactBook() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [newName, setNewName] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/contacts");
            const data = await res.json();
            setContacts(data);
        } catch (e) {
            console.error("Failed to fetch contacts", e);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleAdd = async () => {
        if (!newName || !newAddress) return;
        setIsLoading(true);
        try {
            await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, address: newAddress })
            });
            await fetchContacts();
            setNewName("");
            setNewAddress("");
            setIsAdding(false);
        } catch (e) {
            console.error("Failed to add contact", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
            setContacts(contacts.filter(c => c.id !== id));
        } catch (e) {
            console.error("Failed to delete contact", e);
        }
    };

    return (
        <Card className="bg-whatsapp-header border-white/10 text-whatsapp-text-primary shadow-xl h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-whatsapp-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <User size={16} />
                    <span>Contacts</span>
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-whatsapp-accent hover:text-whatsapp-accent/80 hover:bg-transparent"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus size={20} />
                </Button>
            </CardHeader>
            <CardContent>
                {isAdding && (
                    <div className="mb-4 p-3 bg-[#0b141a] rounded-lg border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Input
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-[#202c33] border-none text-white placeholder:text-gray-500 h-8 text-sm"
                        />
                        <Input
                            placeholder="Solana Address"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="bg-[#202c33] border-none text-white placeholder:text-gray-500 h-8 text-sm font-mono"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsAdding(false)}
                                className="h-7 text-xs text-gray-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAdd}
                                className="h-7 text-xs bg-whatsapp-accent hover:bg-whatsapp-accent/90 text-white"
                                disabled={!newName || !newAddress || isLoading}
                            >
                                {isLoading ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Save size={12} className="mr-1" />}
                                Save
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {contacts.length === 0 ? (
                        <div className="text-center py-8 text-whatsapp-text-secondary text-sm italic">
                            No contacts saved
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div key={contact.id} className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                                    <p className="text-xs text-whatsapp-text-secondary font-mono truncate w-full max-w-[180px]">
                                        {contact.address.slice(0, 6)}...{contact.address.slice(-6)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(contact.id)}
                                    className="h-6 w-6 text-gray-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
