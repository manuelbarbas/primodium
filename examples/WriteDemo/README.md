# Primodium Extension - Write Demo

This demo will show you how to write `Table` data to the Primodium `World` using a World Extension contract. It is a continuation of the Read Demo.

## Getting Started

It is assumed you have scanned the resources available here:

- https://mud.dev/guides/extending-a-world
- https://developer.primodium.com/world-extension/setup

You shouldn't need it, but the chain config for the Primodium Testnet is:

- Chain ID: 10017
- RPC: https://primodium-sepolia.rpc.caldera.xyz/http
- Block Explorer: https://primodium-sepolia.explorer.caldera.xyz/
- Native Symbol and Currency Name: ETH

## MUD Versions

You may need to update your MUD version before running this tutorial. It was built against `2.0.1`. The command to update to the latest MUD version is:

```bash
pnpm mud set-version --mudVersion 2.0.1 && pnpm i && pnpm build
```

The extension developer testnet world address for v0.11.x is `0x46c1e9dd144fcf5477a542d3152d28bc0cfba0b6`

The `WORLD_ADDRESS` and `BLOCK_NUMBER` are pre-configured in the `.env.example`. You should copy this to `.env`, and make any desired changes there. This guide was written before the world was deployed, so the `BLOCK_NUMBER` will need to be updated.

The `.gitignore` is already configured to not upload your `.env`, but it is always good practice to confirm the ignores in your `.gitignore` for yourself. Anything pushed to Git lives there forever and can be retrieved by anyone even if you delete it in later commits. Check twice (maybe 3 times), push once. NEVER push live private keys or .env files to Git.

## Extending the World

Since we are interacting with an existing World (Primodium), we will need to know what `Tables` and `Systems` are currently deployed for that World. We have included them in this demo at `packages/contracts/primodium`.

## Setting up mudConfig

The code can be found in `packages/contracts/mud.config.ts`

Every plugin will need a mudConfig, which is stored in `mud.config.ts`. Plugins must exist in a `namespace`. Multiple `Systems` can exist in a namespace.

Since this demo only deploys a system for reading data, we will not need any new `Tables`, but we will need to declare a `Namespace` and `System`.

## Create the System
