# Primodium v0.7.1

## Installation

Clone this repository:

```
git clone https://github.com/primodiumxyz/primodium.git
```

Initialize with `pnpm i`.

## Quickstart

Run the following command in your terminal:

```bash
echo "PRI_CHAIN_ID=\"dev\"" >> ./.env && echo "PRI_DEV=\"true\"" >> ./.env
```

This adds a `.env` file to the top level with the following values:

```
PRI_CHAIN_ID="dev"
PRI_DEV="true"
```

To start a development server at `localhost:3000` run:

```bash
pnpm dev
```

_Recommended:_ To run development processes with run-pty, run `pnpm dev:pty`.

Or you can run each process individually:

```
pnpm dev:node
pnpm dev:contracts
pnpm dev:client
```

# Testing and Deployment

To run in dev mode, set `PRI_DEV` to true. This will grant access to the Game Tools browser (for the editor and cheatcodes) and Mud Dev Tools (for chain and transaction information).
To build packages, run `pnpm build`

For production deployment on Caldera testnet:

1. In `.env`:
   - Set `PRI_DEV="false"`
   - Set `PRI_CHAIN_ID="caldera"`
2. Add a `.env` file in `<toplevel>/packages/contracts` with your private key:
   ```bash
   echo "PRIVATEKEY="<your-private-key" >> ./packages/contracts.env
   ```
3. deploy your contracts:
   `pnpm deploy:caldera`
   \*\*\*Note: to update deployment information, modify the `[profile.caldera]` field in `packages/contracts/foundry.toml`

The client is automatically deployed on Vercel from the main branch. The live instance is located at `testnet2.primodium.com/?worldAddress=<world_address>?chainid=caldera>` with the rpc settings to the Caldera testnet.

To clean types/ and abis/ in the git diff, run `pnpm clean` in the top level directory.

# Config

## There are four sources of configuration for the game:

1. `mud.config.ts`: Houses tables. To create/modify a table, [read here.](https://mud.dev/world/config)
2. `enums.ts`: Houses enums.
3. `terrain.csv`: Houses the terrain of the main map. Numbers correspond to terrain as follows:

```
  60: "Iron"
  62: "Lithium"
  64: "Water"
  58: "Copper"
  66: "Sulfur"
```

4. `prototypesConfig.ts`: Houses preset entity configurations. A prototype object has the following fields:
   a. keys?: the keys of the prototype. If not set, the key will be a bytes32 encoding of the name of the prototype.
   b. tables: the values of the tables on the prototype's key(s)
   c. levels: the values of the levels of the prototype, indexed by `[...keys, level: "uint256"]`. The key of each level should be the number of the level in question.

# Dev Systems

- Functions in `DevSystem` expose direct table access. We can add abstractions as necessary.

### Contracts

- To set field data of a table:
  `DevSystem.devSetRecord(tableId, key, data, valueSchema)`
- To remove a record:
  `devDeleteRecord(tableId, key, valueSchema)`

### Client

- To set field data of a recs contract component:
  `mud.contractCalls.setComponentValue(<component>, <entity>, <fields>)`
- To remove a recs contract component:
  `mud.contractCalls.removeComponent(<component>, <entity>)`
