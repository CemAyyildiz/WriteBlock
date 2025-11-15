# WriteBlock Deployment Information

## 📅 Deployment Date
November 15, 2024

## 🌐 Network
Sui Testnet

## 📦 Contract Details

### Package ID
```
0x6fb7eca07ddbf4ae014116b6f44e35ed647af02b905a1e8c827d298f8e1c0027
```

### CMS Registry (Shared Object)
```
0x0cbf0decdfba5117d9eb2c9a7af7f49512a497d85e19f9359eded739c09ef848
```

### Admin Capability
```
0x3f85227a4a2d624cc1b43be98bb29593e46c277f90a559f4a1e8e22caa82b034
```
**Owner:** `0xb3900e01dbd1b9b66794053d9237145739c37398df07b15b55c2d47a6bb73f24`

### Upgrade Capability
```
0x87e1fd77bff5e3668bfb6926a5c7869c306b8cbf3a5cf09076ab125fd1cca4e8
```

### Transaction Digest
```
AGzPA2fbJkPExHgjRNsENZZJkChRED4w6ew4YmDzRpaE
```

## 🔗 Explorer Links

### Package
https://suiscan.xyz/testnet/object/0x6fb7eca07ddbf4ae014116b6f44e35ed647af02b905a1e8c827d298f8e1c0027

### Transaction
https://suiscan.xyz/testnet/tx/AGzPA2fbJkPExHgjRNsENZZJkChRED4w6ew4YmDzRpaE

### Registry
https://suiscan.xyz/testnet/object/0x0cbf0decdfba5117d9eb2c9a7af7f49512a497d85e19f9359eded739c09ef848

### Admin Capability
https://suiscan.xyz/testnet/object/0x3f85227a4a2d624cc1b43be98bb29593e46c277f90a559f4a1e8e22caa82b034

## 💰 Gas Cost
- **Storage Cost:** 19,167,200 MIST (0.0191 SUI)
- **Computation Cost:** 1,000,000 MIST (0.001 SUI)
- **Storage Rebate:** 978,120 MIST
- **Total Cost:** ~19,189,080 MIST (0.0192 SUI)

## ✅ Deployment Status
- **Status:** Success ✓
- **Tests Passed:** 10/10 ✓
- **Module:** contract ✓

## 📋 Available Functions

### Admin Functions
- `grant_author_capability(admin_cap, recipient_address)` - Grant author permission

### Author Functions
- `create_page(author_cap, registry, walrus_blob_id)` - Create new page
- `update_page_content(author_cap, page, new_walrus_blob_id)` - Update page content

### View Functions
- `get_page_info(page)` - Get page metadata
- `get_registry_stats(registry)` - Get registry statistics
- `get_walrus_blob_id(page)` - Get page BLOB ID
- `get_version(page)` - Get page version
- `get_page_id(page)` - Get page ID
- `get_author(page)` - Get page author

## 🎯 Next Steps

1. ✅ Contract deployed
2. ✅ ENV variables configured
3. ⏳ Restart frontend with Sui connection
4. ⏳ Connect wallet and test
5. ⏳ Grant author capabilities
6. ⏳ Create test pages

## 🔐 Security Notes

- Admin capability is owned by: `0xb3900e01dbd1b9b66794053d9237145739c37398df07b15b55c2d47a6bb73f24`
- Keep private keys secure
- This is testnet deployment - for production, redeploy to mainnet
- Upgrade capability stored for future contract upgrades

