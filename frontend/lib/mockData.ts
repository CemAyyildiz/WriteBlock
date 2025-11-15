import { PageMetadata, Author, UserSession } from '@/types';

// Mock Sui addresses
export const MOCK_ADDRESSES = {
  admin: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  author1: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  author2: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  viewer: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
};

// Mock pages/posts
export const MOCK_PAGES: PageMetadata[] = [
  {
    page_id: 0,
    walrus_blob_id: 'mock_walrus_blob_abc123xyz',
    version: 3,
    author: MOCK_ADDRESSES.author1,
    created_at: 1699564800000, // Nov 10, 2024
    updated_at: 1731110400000, // Nov 9, 2025
    title: 'WriteBlock: Decentralized Content Management',
    slug: 'writeblock-decentralized-cms',
    excerpt: 'Welcome to WriteBlock, a revolutionary decentralized CMS built on Sui blockchain with Walrus storage.',
    markdown_content: `# WriteBlock: Decentralized Content Management

Welcome to **WriteBlock**, a revolutionary decentralized CMS built on Sui blockchain with Walrus storage.

## Features

### 🔒 Secure & Decentralized
- Content stored on Walrus distributed storage
- Metadata managed via Sui smart contracts
- Capability-based permission system

### ✍️ Author-Friendly
- Simple Markdown editor
- Version control for every update
- Transparent content history

### 🎯 Admin Controls
- Grant author capabilities to trusted addresses
- Manage content permissions
- Track all system activities

## How It Works

1. **Admin** grants Author_Capability to writers
2. **Authors** create and update content with Markdown
3. **Content** is stored on Walrus as BLOBs
4. **Metadata** is tracked on Sui blockchain
5. **Everyone** can view published content

---

*This page was created using WriteBlock's decentralized CMS.*`,
  },
  {
    page_id: 1,
    walrus_blob_id: 'mock_walrus_blob_def456uvw',
    version: 1,
    author: MOCK_ADDRESSES.author2,
    created_at: 1720000000000, // Jul 3, 2024
    updated_at: 1720000000000,
    title: 'Getting Started with Sui Blockchain',
    slug: 'getting-started-sui-blockchain',
    excerpt: 'Learn the basics of Sui blockchain and how to build decentralized applications.',
    markdown_content: `# Getting Started with Sui Blockchain

Sui is a next-generation smart contract platform with high throughput, low latency, and an asset-oriented programming model powered by Move.

## Why Sui?

- **Fast**: Parallel transaction execution
- **Secure**: Move programming language
- **Scalable**: Horizontal scaling
- **Developer-friendly**: Modern tooling

## Key Concepts

### Objects
Everything in Sui is an object. Objects can be owned, shared, or immutable.

### Move Language
Sui uses Move, a safe and expressive language for smart contracts.

### Capabilities
Sui's capability pattern enables secure and flexible permission systems.

## Getting Started

\`\`\`bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git sui

# Create a new project
sui move new my_project
\`\`\`

Happy building! 🚀`,
  },
  {
    page_id: 2,
    walrus_blob_id: 'mock_walrus_blob_ghi789rst',
    version: 2,
    author: MOCK_ADDRESSES.author1,
    created_at: 1725000000000, // Aug 30, 2024
    updated_at: 1728000000000, // Oct 4, 2024
    title: 'Understanding Walrus Storage',
    slug: 'understanding-walrus-storage',
    excerpt: 'Walrus provides decentralized storage for blobs with high availability and performance.',
    markdown_content: `# Understanding Walrus Storage

Walrus is a decentralized storage network optimized for large binary objects (BLOBs).

## Features

### 📦 Blob Storage
- Store any type of content
- Permanent and immutable
- Efficient encoding

### 🔗 Integration
- Native Sui integration
- Simple APIs
- Walrus Sites hosting

### 💰 Cost-Effective
- Pay once, store forever
- Erasure coding efficiency
- No recurring fees

## Use Cases

1. **NFT Metadata**: Store images, videos, and metadata
2. **Decentralized Websites**: Host static sites
3. **Content Management**: Store blog posts and articles
4. **Archive Storage**: Long-term data preservation

## Architecture

\`\`\`
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────────────┐
│  Walrus Publishers  │
│  (Upload endpoint)  │
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  Storage Nodes      │
│  (Distributed)      │
└─────────────────────┘
\`\`\`

Start using Walrus today! 🐋`,
  },
];

// Get single page by slug
export const getPageBySlug = (slug: string): PageMetadata | undefined => {
  return MOCK_PAGES.find(page => page.slug === slug);
};

// Get single page by ID
export const getPageById = (id: number): PageMetadata | undefined => {
  return MOCK_PAGES.find(page => page.page_id === id);
};

// Get all pages (for dashboard)
export const getAllPages = (): PageMetadata[] => {
  return MOCK_PAGES.sort((a, b) => b.updated_at - a.updated_at);
};

// Mock authorized authors list
export const MOCK_AUTHORS: Author[] = [
  {
    address: MOCK_ADDRESSES.author1,
    name: 'Alice Writer',
    granted_at: 1699564800000,
  },
  {
    address: MOCK_ADDRESSES.author2,
    name: 'Bob Editor',
    granted_at: 1704067200000,
  },
];

// Simulate user sessions
export const getUserSession = (role: 'admin' | 'author' | 'viewer' = 'viewer'): UserSession => {
  switch (role) {
    case 'admin':
      return {
        address: MOCK_ADDRESSES.admin,
        role: 'admin',
        hasAdminCap: true,
        hasAuthorCap: true,
        name: 'Admin User',
      };
    case 'author':
      return {
        address: MOCK_ADDRESSES.author1,
        role: 'author',
        hasAdminCap: false,
        hasAuthorCap: true,
        name: 'Alice Writer',
      };
    default:
      return {
        address: MOCK_ADDRESSES.viewer,
        role: 'viewer',
        hasAdminCap: false,
        hasAuthorCap: false,
      };
  }
};

// Note: Mock transaction functions moved to lib/mock/ implementations
// Use getStorageClient() and getBlockchainClient() instead
