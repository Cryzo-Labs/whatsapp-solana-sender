import * as fs from "fs";
import * as path from "path";

export interface Contact {
    id: string;
    name: string;
    address: string;
}

export interface TransactionRecord {
    signature: string;
    type: "sent" | "received" | "airdrop";
    amount: number;
    timestamp: string; // ISO string
    recipient?: string;
}

export class StorageService {
    private dataDir: string;
    private contactsFile: string;
    private transactionsFile: string;

    constructor() {
        this.dataDir = path.resolve(process.cwd(), "data");
        this.contactsFile = path.join(this.dataDir, "contacts.json");
        this.transactionsFile = path.join(this.dataDir, "transactions.json");
        this.initialize();
    }

    private initialize() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
        if (!fs.existsSync(this.contactsFile)) {
            fs.writeFileSync(this.contactsFile, JSON.stringify([]));
        }
        if (!fs.existsSync(this.transactionsFile)) {
            fs.writeFileSync(this.transactionsFile, JSON.stringify([]));
        }
    }

    // Contacts
    getContacts(): Contact[] {
        try {
            const data = fs.readFileSync(this.contactsFile, "utf-8");
            return JSON.parse(data);
        } catch (e) {
            console.error("Error reading contacts:", e);
            return [];
        }
    }

    saveContact(contact: Contact) {
        const contacts = this.getContacts();
        contacts.push(contact);
        fs.writeFileSync(this.contactsFile, JSON.stringify(contacts, null, 2));
    }

    deleteContact(id: string) {
        let contacts = this.getContacts();
        contacts = contacts.filter(c => c.id !== id);
        fs.writeFileSync(this.contactsFile, JSON.stringify(contacts, null, 2));
    }

    findContactByName(name: string): Contact | undefined {
        const contacts = this.getContacts();
        return contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
    }

    // Transactions
    getTransactions(): TransactionRecord[] {
        try {
            const data = fs.readFileSync(this.transactionsFile, "utf-8");
            return JSON.parse(data);
        } catch (e) {
            console.error("Error reading transactions:", e);
            return [];
        }
    }

    addTransaction(tx: TransactionRecord) {
        const transactions = this.getTransactions();
        // Add to beginning
        transactions.unshift(tx);
        // Keep only last 50
        if (transactions.length > 50) {
            transactions.length = 50;
        }
        fs.writeFileSync(this.transactionsFile, JSON.stringify(transactions, null, 2));
    }
}
