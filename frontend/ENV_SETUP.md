# Environment Setup Guide

## Creating Your Environment File

Create a `.env.local` file in the `frontend` directory with the following content:

```bash
# WriteBlock Frontend - Environment Configuration

# ==================== Provider Selection ====================
# Options: 'mock' or 'sui' (for blockchain/wallet), 'mock' or 'walrus' (for storage)
# Start with 'mock' for testing, then switch to real providers
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock

# ==================== Sui Network Configuration ====================
# Network: 'mainnet', 'testnet', 'devnet', or 'localnet'
NEXT_PUBLIC_SUI_NETWORK=testnet

# ==================== Deployed Contract IDs ====================
# Package ID: The address of your deployed smart contract package
NEXT_PUBLIC_PACKAGE_ID=

# Registry ID: The object ID of the CMS_Registry shared object
NEXT_PUBLIC_REGISTRY_ID=

# Admin Capability ID: The object ID of the Admin_Capability
NEXT_PUBLIC_ADMIN_CAP_ID=

# ==================== Walrus Storage Configuration ====================
# Walrus Publisher URL (for storing BLOBs)
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space

# Walrus Aggregator URL (for reading BLOBs)
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Walrus Aggregator Fallback URL (optional)
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL_FALLBACK=

# ==================== Development Settings ====================
NEXT_PUBLIC_DEBUG=true
```

## Quick Start Commands

```bash
# Create the environment file
cd frontend
touch .env.local

# Copy the template above and paste it into .env.local
```

## Configuration Steps

### Phase 1: Testing with Mock Providers

For initial development and testing:

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock
```

This allows you to test the frontend without deploying contracts or connecting to real networks.

### Phase 2: Deploy Contract

1. **Deploy the smart contract:**
   ```bash
   cd contract
   sui client publish --gas-budget 100000000
   ```

2. **Note the deployment output:**
   - **Package ID**: The published package object ID
   - **Registry ID**: Look for the `CMS_Registry` shared object
   - **Admin Capability**: Look for the `Admin_Capability` transferred to your address

3. **Update `.env.local`:**
   ```bash
   NEXT_PUBLIC_PACKAGE_ID=0x... # Your package ID
   NEXT_PUBLIC_REGISTRY_ID=0x... # Your registry object ID
   NEXT_PUBLIC_ADMIN_CAP_ID=0x... # Your admin cap object ID
   ```

### Phase 3: Switch to Real Providers

Once your contract is deployed and configured:

```bash
# Switch to real blockchain
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui

# Optionally, switch to Walrus storage
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
```

## Finding Your Contract Object IDs

### Method 1: From Deployment Output

When you deploy your contract, the output will show:

```
Created Objects:
  - ID: 0xabc...  , Owner: Shared
    Type: 0x[package]::contract::CMS_Registry
  - ID: 0xdef...  , Owner: Account Address [your-address]
    Type: 0x[package]::contract::Admin_Capability
```

### Method 2: Using Sui Explorer

1. Go to [Sui Explorer](https://suiexplorer.com/)
2. Switch to your network (testnet/devnet)
3. Search for your package ID
4. Look for objects of type `CMS_Registry` and `Admin_Capability`

### Method 3: Using Sui CLI

```bash
# Get your address
sui client active-address

# List objects owned by you
sui client objects

# Look for Admin_Capability object
sui client object <object-id>
```

To find the Registry (shared object):

```bash
# Query for shared objects from your package
sui client call --package <PACKAGE_ID> --module contract --function get_registry_stats --args <REGISTRY_ID>
```

## Environment Variables Reference

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `NEXT_PUBLIC_STORAGE_PROVIDER` | `mock \| walrus` | Storage backend | Yes |
| `NEXT_PUBLIC_BLOCKCHAIN_PROVIDER` | `mock \| sui` | Blockchain backend | Yes |
| `NEXT_PUBLIC_WALLET_PROVIDER` | `mock \| sui` | Wallet provider | Yes |
| `NEXT_PUBLIC_SUI_NETWORK` | `mainnet \| testnet \| devnet \| localnet` | Sui network | When using Sui |
| `NEXT_PUBLIC_PACKAGE_ID` | Address | Deployed contract package | When using Sui |
| `NEXT_PUBLIC_REGISTRY_ID` | Address | CMS Registry object | When using Sui |
| `NEXT_PUBLIC_ADMIN_CAP_ID` | Address | Admin capability object | Optional (for reference) |
| `NEXT_PUBLIC_WALRUS_PUBLISHER_URL` | URL | Walrus publisher endpoint | When using Walrus |
| `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` | URL | Walrus aggregator endpoint | When using Walrus |
| `NEXT_PUBLIC_DEBUG` | `true \| false` | Enable debug logging | Optional |

## Testing Your Configuration

After setting up your environment:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for provider initialization messages:
   - `🎭 Using Mock Storage` or `🐋 Using Walrus Storage`
   - `🎭 Using Mock Blockchain` or `⛓️ Using Sui Blockchain`
   - `🎭 Using Mock Wallet` or `👛 Using Sui Wallet`

3. **Test connectivity:**
   - With mock: Everything should work immediately
   - With Sui: Try connecting your wallet and checking capabilities

## Common Issues

### "Package ID not configured"

Make sure `NEXT_PUBLIC_PACKAGE_ID` is set and correct.

### "Registry ID not found"

Make sure `NEXT_PUBLIC_REGISTRY_ID` is set. You can find it in the deployment output.

### "Wallet not connected"

For Sui wallet, you need to:
1. Have a Sui wallet browser extension installed (Sui Wallet, Suiet, etc.)
2. Connect your wallet in the UI
3. Make sure your wallet is on the correct network

### "Failed to fetch page metadata"

Check that:
1. The page object ID exists
2. You're connected to the correct network
3. The object is of the correct type

## Migration from Mock to Production

1. **Test thoroughly with mock providers**
2. **Deploy contract to testnet**
3. **Update environment variables**
4. **Test with testnet**
5. **Deploy to mainnet when ready**
6. **Update environment variables for production**

## Security Notes

- Never commit `.env.local` to git
- Use different values for development and production
- Keep your admin capability object ID secure
- For production deployments, use environment variables provided by your hosting platform

