# WriteBlock 📝

Decentralized Content Management System (CMS) built on Sui blockchain with Walrus distributed storage.

## 🌟 Features

### ⛓️ Blockchain-Based
- Metadata management on Sui blockchain
- Secure permission control via capability pattern
- Immutable version history

### 🐋 Distributed Storage
- Permanent content storage on Walrus
- BLOB-based content addressing
- Censorship-resistant infrastructure

### 👥 Role-Based Access
- **Admin**: Author authorization and system management
- **Author**: Content creation and updates
- **Viewer**: Public content access for everyone

## 📁 Project Structure

```
WriteBlock/
├── contract/              # Sui Move smart contract
│   ├── sources/
│   │   └── contract.move # Main contract file
│   ├── tests/            # Test suite
│   └── Move.toml         # Move configuration
│
├── frontend/             # Next.js web application
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Dashboard
│   │   ├── [slug]/       # Article pages
│   │   ├── author/       # Writer view
│   │   └── admin/        # Admin view
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
│
└── CONTRACT_SUMMARY.md   # Contract documentation
```

## 🚀 Quick Start

### Smart Contract

```bash
cd contract

# Build
sui move build

# Test
sui move test

# Deploy (Sui testnet/mainnet)
sui client publish --gas-budget 100000000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:3000
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Viewer  │ │  Author  │ │  Admin   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Sui Blockchain (Smart Contract)       │
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ CMS_Registry │  │  Page_Metadata      │ │
│  ├──────────────┤  ├─────────────────────┤ │
│  │ Admin_Cap    │  │  - page_id          │ │
│  │ Author_Cap   │  │  - walrus_blob_id   │ │
│  └──────────────┘  │  - version          │ │
│                    │  - author           │ │
│                    └─────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Walrus Storage (Content BLOBs)        │
│         Distributed & Permanent             │
└─────────────────────────────────────────────┘
```

## 🔑 Core Concepts

### Capability Pattern

WriteBlock uses Sui's capability pattern for permission management:

- **Admin_Capability**: System administrator authority
  - Grant author permissions
  - Create pages
  
- **Author_Capability**: Content writer authority
  - Create pages
  - Update content

These capabilities are:
- ✅ Non-copyable
- ✅ Non-droppable
- ✅ Transferable
- ✅ No address-based checks required

### Version Control

Each content update:
1. New content uploaded to Walrus → New BLOB ID
2. Page_Metadata updated
3. Version number auto-incremented
4. Update timestamp recorded

### Content Flow

**Reading (Viewer)**:
```
Page_Metadata.walrus_blob_id → Walrus → Content → HTML
```

**Writing (Author)**:
```
Markdown Content → Walrus → BLOB ID → Sui TX → Page_Metadata Updated
```

## 📚 Documentation

- [Smart Contract Details](./CONTRACT_SUMMARY.md)
- [Frontend Guide](./frontend/README.md)
- [UI/UX Design System](./UI_UX_REDESIGN.md)
- [Setup Instructions](./SETUP.md)
- [Abstraction Layer](./ABSTRACTION_LAYER_SUMMARY.md)

## 🧪 Tested Scenarios

### Smart Contract Tests ✅
- Admin capability grant
- Author capability grant (multiple)
- Page creation
- Page content update
- Version incrementation
- Multiple pages
- View functions
- Full workflow integration

### Frontend Tests (Manual)
- ✅ Dashboard: Article list and navigation
- ✅ Article Reader: Markdown rendering
- ✅ Author: Editor and publishing simulation
- ✅ Admin: Author authorization simulation
- ✅ Responsive design
- ✅ Dark mode

## 🎨 Demo Features

Current frontend is **demo/mockup** and includes:

- ✅ Mock Sui addresses
- ✅ Mock Walrus BLOB ID generation
- ✅ Simulated blockchain transactions
- ✅ Complete UI/UX flow
- ❌ No real Sui wallet connection
- ❌ No real Walrus upload/download

## 🚧 Production Requirements

To run frontend on real blockchain:

1. **Sui Wallet Integration**
   ```typescript
   import { WalletKitProvider } from '@mysten/wallet-kit';
   ```

2. **Sui SDK Usage**
   ```typescript
   import { SuiClient } from '@mysten/sui.js/client';
   import { TransactionBlock } from '@mysten/sui.js/transactions';
   ```

3. **Walrus API Integration**
   - Upload endpoint
   - Download endpoint
   - BLOB ID validation

4. **Contract Deployment & Addresses**
   - Package ID
   - CMS_Registry object ID
   - Admin capability transfer

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'feat: Add new feature'`)
4. Push branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📝 Commit Conventions

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Adding/fixing tests
- `chore:` - Maintenance

## 🔐 Security

For security vulnerabilities, please contact directly instead of opening an issue.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sui Foundation](https://sui.io/) - Blockchain infrastructure
- [Walrus](https://docs.walrus.site/) - Distributed storage
- [Next.js](https://nextjs.org/) - Frontend framework

## 📞 Contact

Open an issue for questions or feedback.

---

**⚠️ Note**: This project is for demo/educational purposes. Comprehensive testing and security audits should be conducted before production use.
