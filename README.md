# WriteBlock

A decentralized blogging platform built on Sui blockchain with Walrus storage.

## 🚀 Live Demo

- **Production**: [writeblock.vercel.app](https://writeblock.vercel.app)
- **Walrus Sites**: writeblock.trwall.app *(experimental - see known issues)*

## Features

- 📝 Write and publish articles on-chain
- 🔐 Role-based access control (Admin, Author, Viewer)
- 💾 Permanent storage via Walrus Protocol
- ✏️ Edit request system for collaborative writing
- 🔗 Content addressable via blockchain metadata

## Tech Stack

- **Smart Contracts**: Move (Sui)
- **Storage**: Walrus Protocol
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Authentication**: Sui Wallet Standard

## Getting Started

### Prerequisites

- Node.js 18+
- Sui CLI
- Sui Wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/CemAyyildiz/WriteBlock.git
cd WriteBlock

# Deploy contract
cd contract
sui move build
sui move test
sui client publish --gas-budget 100000000

# Setup frontend
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`

## Architecture

```
┌──────────────┐
│   Frontend   │  Next.js app with Sui Wallet integration
└──────┬───────┘
       │
┌──────▼────────┐
│ Sui Contract  │  Move smart contracts for metadata & permissions
└──────┬────────┘
       │
┌──────▼────────┐
│    Walrus     │  Distributed storage for article content
└───────────────┘
```

## Smart Contract

The Move contract implements:
- Capability-based access control
- Page metadata management
- Edit request workflow
- Version tracking

**Deployed on Sui Testnet:**
- Package: `0x5b6df9d...281ab1`
- Registry: `0x3296db1...5ef033`

## Known Issues

**Walrus Sites Deployment**: The app is deployed to `writeblock.trwall.app` but experiencing CORS issues due to expired testnet blobs. This is a testnet infrastructure limitation. Use the Vercel deployment for full functionality.

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT

---

Built for Sui Overflow Hackathon 2024
