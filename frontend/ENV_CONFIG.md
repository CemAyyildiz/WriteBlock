# Environment Configuration

Create a `.env.local` file in the frontend directory with the following configuration:

```bash
# WriteBlock Environment Configuration

# ===========================================
# Provider Selection
# ===========================================
# Options: 'mock' | 'walrus' | 'sui'
# Use 'mock' for development/demo
# Use 'walrus'/'sui' for production

NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock

# ===========================================
# Walrus Configuration (when using real Walrus)
# ===========================================
# NEXT_PUBLIC_WALRUS_API_URL=https://walrus-api.example.com
# NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus.site

# ===========================================
# Sui Configuration (when using real Sui)
# ===========================================
# NEXT_PUBLIC_SUI_NETWORK=testnet
# Options: 'mainnet' | 'testnet' | 'devnet' | 'localnet'

# Smart Contract Addresses (after deployment)
# NEXT_PUBLIC_PACKAGE_ID=0x...
# NEXT_PUBLIC_REGISTRY_ID=0x...
# NEXT_PUBLIC_ADMIN_CAP_ID=0x...

# ===========================================
# Feature Flags
# ===========================================
# NEXT_PUBLIC_ENABLE_RICH_MEDIA=false
# NEXT_PUBLIC_ENABLE_AUTO_REFRESH=false

# ===========================================
# Development
# ===========================================
# NEXT_PUBLIC_DEBUG=true
```

## Usage

### For Development (Mock)
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock
```

### For Production (Real)
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui

NEXT_PUBLIC_WALRUS_API_URL=https://your-walrus-api.com
NEXT_PUBLIC_SUI_NETWORK=mainnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID
```

## Switching Providers

No code changes needed! Just update `.env.local` and restart the dev server.

