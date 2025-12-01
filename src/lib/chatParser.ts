export type Intent = "SEND" | "BALANCE" | "ADDRESS" | "HELP" | "UNKNOWN" | "CONFIRM_YES" | "CONFIRM_NO";

export interface ParsedCommand {
    intent: Intent;
    amount?: number;
    recipient?: string;
}

export class ChatParser {
    static parse(message: string): ParsedCommand {
        const lowerMsg = message.toLowerCase().trim();

        if (lowerMsg === "yes" || lowerMsg === "y" || lowerMsg === "confirm") {
            return { intent: "CONFIRM_YES" };
        }

        if (lowerMsg === "no" || lowerMsg === "n" || lowerMsg === "cancel") {
            return { intent: "CONFIRM_NO" };
        }

        if (lowerMsg.includes("balance") || lowerMsg.includes("how much")) {
            return { intent: "BALANCE" };
        }

        if (lowerMsg.includes("address") || lowerMsg.includes("key") || lowerMsg.includes("wallet")) {
            return { intent: "ADDRESS" };
        }

        if (lowerMsg.includes("help")) {
            return { intent: "HELP" };
        }

        // Regex for "Send 0.1 to [Address]"
        // Matches: send, transfer, pay
        // Matches: amount (decimal or int)
        // Matches: to (optional)
        // Matches: address (base58-like string, simplistic check)
        const sendRegex = /(?:send|transfer|pay)\s+(\d+(?:\.\d+)?)\s*(?:sol)?\s*(?:to)?\s*([a-zA-Z0-9]{32,44})/i;
        const match = message.match(sendRegex);

        if (match) {
            return {
                intent: "SEND",
                amount: parseFloat(match[1]),
                recipient: match[2],
            };
        }

        return { intent: "UNKNOWN" };
    }
}
