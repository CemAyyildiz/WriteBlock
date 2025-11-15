import { PageMetadata, Author, UserSession } from '@/types';

// Mock Sui addresses
export const MOCK_ADDRESSES = {
  admin: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  author1: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  author2: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  viewer: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
};

// Mock page data
export const MOCK_PAGE: PageMetadata = {
  page_id: 0,
  walrus_blob_id: 'mock_walrus_blob_abc123xyz',
  version: 3,
  author: MOCK_ADDRESSES.author1,
  created_at: 1699564800000, // Nov 10, 2024
  updated_at: 1731110400000, // Nov 9, 2025
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

## Technical Architecture

\`\`\`
┌─────────────┐
│   Viewer    │
│  (Anyone)   │
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│   Sui Smart Contract        │
│   - Page Metadata           │
│   - Version: ${3}            │
│   - Author: 0x...           │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│   Walrus Storage            │
│   - Actual Content (BLOB)   │
│   - Distributed & Permanent │
└─────────────────────────────┘
\`\`\`

## Why WriteBlock?

- **Censorship Resistant**: No central authority can modify or delete content
- **Transparent**: All changes are tracked on blockchain
- **Permanent**: Content stored on Walrus is immutable
- **Cost Effective**: Pay once, store forever

---

*This page was created using WriteBlock's decentralized CMS.*
`,
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
      };
    case 'author':
      return {
        address: MOCK_ADDRESSES.author1,
        role: 'author',
        hasAdminCap: false,
        hasAuthorCap: true,
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

