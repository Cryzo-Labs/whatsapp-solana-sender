# WhatsApp Solana Sender

## Introduction

WhatsApp Solana Sender is a proof-of-concept application that demonstrates the integration of blockchain technology with familiar messaging interfaces. It allows users to perform Solana blockchain transactions directly through a simulated WhatsApp interface using natural language commands. This project bridges the gap between complex crypto wallets and everyday communication tools, making digital asset transfer accessible, fast, and secure.

## Features

### Core Functionality
- **Natural Language Processing**: The system parses conversational commands to execute blockchain actions (e.g., "Send 0.1 SOL to [Address]").
- **Real-time Simulation**: A high-fidelity WhatsApp-like interface that provides immediate feedback and transaction status updates.
- **Solana Devnet Integration**: Fully functional integration with the Solana Devnet for risk-free testing and demonstration.
- **Wallet Management**: Automatic wallet generation and persistent management within the application session.

### User Interface
- **Dark Mode Aesthetic**: A premium, dark-themed UI modeled after popular messaging applications for a familiar user experience.
- **Live Dashboard**: A real-time dashboard displaying wallet balance, public key, and transaction history.
- **Interactive Feedback**: Visual cues for typing status, message delivery, and transaction confirmations.

### Technical Capabilities
- **Secure Key Management**: Local handling of cryptographic keys (demonstration mode).
- **Transaction Confirmation**: Two-step verification process for all outgoing transfers to prevent accidental transactions.
- **Airdrop Functionality**: Built-in faucet integration to fund test wallets on the Devnet.

## Architecture

The application is built using a modern tech stack designed for performance and developer experience:

- **Runtime**: Bun (Fast JavaScript runtime)
- **Frontend**: React 19
- **Styling**: Tailwind CSS 4
- **Blockchain**: @solana/web3.js
- **Animation**: Framer Motion

### Directory Structure

- `src/lib/solana.ts`: Handles all blockchain interactions including connection, keypair management, and transaction signing.
- `src/lib/chatParser.ts`: Implements the logic for interpreting user messages and extracting transaction intent.
- `src/components/WhatsAppSimulator.tsx`: Renders the chat interface and manages message state.
- `src/components/WalletDashboard.tsx`: Visualizes wallet data and transaction history.
- `src/index.tsx`: Serves as the backend API, handling requests and bridging the frontend with the Solana service.

## Installation

### Prerequisites
- Bun runtime installed on your machine.
- Node.js (optional, for compatibility).

### Setup Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd whatsapp-solana-sender
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Usage Guide

1. **Initialization**: Upon loading the application, a new Solana wallet is automatically generated for you.
2. **Funding**: Click the "Airdrop" button on the dashboard to receive Devnet SOL.
3. **Checking Balance**: Type "Balance" or "How much do I have?" in the chat window.
4. **Sending Funds**:
   - Type a command like "Send 0.1 SOL to [Recipient_Address]".
   - The bot will ask for confirmation.
   - Type "Yes" or "Confirm" to proceed.
   - The transaction signature will be displayed upon completion.
5. **Viewing History**: All transactions are logged in the "Recent Activity" panel on the left.

## API Documentation

The backend exposes the following endpoints:

### `GET /api/wallet`
Retrieves the current wallet's public key and balance.

### `POST /api/wallet`
Resets the current wallet and generates a new keypair.

### `POST /api/airdrop`
Requests an airdrop of 1 SOL to the current wallet.

### `POST /api/chat`
Processes a user message.
- **Body**: `{ "message": "string" }`
- **Response**: `{ "text": "string", "action": "object" }`

## Roadmap

### Phase 1: Prototype (Current)
- Basic chat interface.
- Devnet transaction support.
- In-memory wallet management.

### Phase 2: Enhanced Security & Persistence
- Integration with browser wallets (Phantom, Solflare).
- Encrypted local storage for session persistence.
- Transaction history export.

### Phase 3: Real-world Integration
- WhatsApp Business API integration.
- Mainnet support.
- Contact book management.
- QR code scanning for addresses.

### Phase 4: Advanced Features
- SPL Token support (USDC, etc.).
- NFT viewing and transfer.
- Multi-signature wallet support.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
