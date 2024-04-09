# Primodium Extension Template

This is am empty template to help you quickly get started developing your own World Extensions.

### Important File Locations:

- MUD Config: `packages/contracts/mud.config.ts`
- System Contracts: `packages/contracts/src/*.sol`
- System Tests: `packages/contracts/test/*.t.sol`
- Deployment and Interaction Scripts: `packages/contracts/scripts/*.s.sol`

### Actions

- Change your active directory:
  - `cd template/packages/contracts`
- Install the necessary packages:
  - `pnpm i`
- Build the project:
  - `pnpm build`
- Test the project:
  - `forge test`
- Update namespaces in scripts (choose your own to avoid collision).
- Update addresses and private keys in `.env`
- Do a dry-run of deployment:
  - `forge script script/[scriptname].s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http`
- Deploy and Interact the System:
  - `forge script script/[scriptname].s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast`

## World Details

- WORLD_ADDRESS: `0x46c1e9dd144fcf5477a542d3152d28bc0cfba0b6`
- MUD Version: `2.0.1`
- Primodium Game Libraries: `packages/contracts/primodium`
