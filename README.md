# Primodium v0.11.1

## Overview

Primodium is a resource management game entirely on-chain. (resource mgmt/allocation is the core loop)

### In the players’ base asteroid

- Players decide to spend resources for production or for allocation in a series of resource tradeoffs
  (e.g. do I upgrade/build more miners/processing factories, or do I build more units?)

### In the wider PvP asteroid field (zoomed out map)

- Players decide on which resources to station their units and mining crew (e.g. which resource type asteroids do I
  send my mining crew to? How much army do I need to send to defend them?)
- Players can raid and kick off other crews in the asteroid fields (e.g. I can destroy this mining crew on this
  asteroid that I want to mine from)

The whole point of the game is to accumulate resources and beat others in accumulating resources. You can gang up too
with alliances.

## Setup, installation, and running the game locally

### Prerequisites

Our team uses a number of CLI tools that you may need to install to be compatible with our scripts.

- [node](https://nodejs.org/en/download/) - Our runtime environment.

  - Note: We use a specific version of node defined in our `.nvmrc` file.

    Simply run:

    ```bash
    nvm use
    ```

    in the root of the
    project to switch to the correct version.

- [nvm](https://github.com/nvm-sh/nvm) - Node version manager. Useful since we use specific (i.e. not the latest)
  versions of Node.js for compatibility with our dependencies and your system may have a different version installed.
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - The package manager to install `pnpm` (lol)
- [pnpm](https://pnpm.io/installation) - Our actual package manager. (npm but way faster)
  - Note: We use a specific version of `pnpm` defined in our `.npmrc` file, so the command to install that
    specific version would be:
    ```bash
    npm install -g pnpm
    ```
- [foundry-rs](https://book.getfoundry.sh/getting-started/installation) - Our blockchain development environment.
- [docker/docker-compose](https://docs.docker.com/get-docker/) - Our containerization tool
  - Note: You may have to add the `export PATH=$PATH:~/.docker/bin` to your `.bashrc` or `.zshrc`
    file to run docker commands from the terminal after installing Docker Desktop.
- [vercel](https://vercel.com/docs/cli) - Our serverless functions deployment tool.
  - Note: You may need to ask Emerson or someone else with executive privileges to grant you access
    to our Vercel project.
  - Note 2: You may also need to go into your browser, navigate to your new Vercel profile, and activate your
    Github/Vercel integration via Account Settings -> Authentication.
  - Note 3: It is recommended to install vercel with `pnpm`

### Installation

Clone this repository:

```bash
git clone https://github.com/primodiumxyz/primodium.git
```

Install all of the projects dependencies:

```bash
pnpm i
```

### Environment Variables

At the root of the project, create a `.env` file:

```bash
touch .env
```

In the file, add the following:

```yaml
PRI_CHAIN_ID="dev" # Sets the chain id to the foundry-rs local development chain
PRI_DEV="true" # This will grant access to the Game Tools browser (for the editor and cheat codes) and Mud Dev Tools
PRI_DEBUG=mud:* # This is a setting for the debug logging level when deploying smart contracts in production.
PRI_DEV_PKEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # The private key of the wallet for deploying smart contracts on the foundry-rs local development chain
```

Now, navigate to the `packages/contracts` directory and run the following:

```bash
echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" >> ./.env
```

This will create a `.env` file in the `packages/contracts` directory with the private key for the development account.

### Building the contracts

Navigate to `packages/contracts` and run the following:

```bash
pnpm run build
```

This will compile the contracts and generate the ABIs and typescript bindings.

### Running the game in Development Mode

To start a development server at `localhost:3000` run:

```bash
pnpm dev
```

This wil run a series of scripts in one batch process. However, it is recommended to run each process individually for
better control and debugging. To do this, we use a handy tool called `run-pty`. Use it by running:

```bash
pnpm dev:pty
```

This will run the following:

```Bash
pnpm dev:vercel # The client
pnpm dev:node # The test blockchain
pnpm dev:contracts # The contract deployer
pnpm dev:indexer # The postgres indexer
```

> NOTE: If you are running the indexer locally, docker network and volumes properly clear only on rerun of `pnpm dev:indexer`. If you would like to manually free these resources run `pnpm clean:indexer`.

## Testing and Deployment

### Testing

To run the tests for the entire project (the client, contracts, etc.), run the following in the root of the project:

```bash
pnpm test
```

If you want to run the tests for a specific package, navigate to that package directory
(for example, `packages/contracts`) and run:

```bash
pnpm test

```

Finally, if you want to test a specific test contract, navigate to the `packages/contracts` directory and run:

```bash
pnpm mud test --skipBuild --forgeOptions='--mc <contract_name>'
```

This will skip rebuilding the contracts (which is long) and run the test functions of the specified test contract.

### Deployment

For production deployment on Caldera testnet:

1. In `<top-level>/.env`:
   - Set `PRI_DEV="false"`.
   - Set `PRI_CHAIN_ID="caldera"`
2. Add your private key to the `.env` file in `packages/contracts`:
   ```bash
   echo "PRIVATEKEY=<your-private-key>" >> ./packages/contracts/.env
   ```
3. Comment out the content of the `packages/contracts/src/systems/DevSystem.sol` contract. **TODO:** fix `mud.config.ts` for `DevSystem` to automatically be excluded from production with `PRI_DEV="false"`.
4. Deploy your contracts:
   `pnpm deploy:caldera`
   **Note:** to update deployment information, modify the `[profile.caldera]` field in `packages/contracts/foundry.toml`.

The client is automatically deployed on Vercel from the main branch. The live instance is located at `testnet2.primodium.com/?worldAddress=<world_address>?chainid=caldera` with the rpc settings to the Caldera testnet.

To clean types/ and abis/ in the git diff, run `pnpm clean` in the top level directory.

### Vercel Environment Variables and testing the chat functionality

The chat functionality in the client is built on [Vercel Serverless functions](https://vercel.com/docs/functions/serverless-functions) and therefore requires Vercel
environment variables to test. If you encounter any errors with the above steps while running the client, you may use
the following:

1. In the top level directory, run `vercel pull` and setup the Vercel project with the following settings. Again, ask
   Emerson or another person with executive vercel privileges if you don't have access to Vercel.
   - Org: `primodium`
   - Project: `primodium-testnet2`
2. Check that the `.vercel` exists in the top level directory.
3. Run `pnpm dev:vercel` to start the client.

### Account Authorization testing

Authorizing an account to act on behalf of another account requires ETH in the player's main account. To test this
feature locally with the Anvil development chain, do the following:

1. Transfer ~0.1 ETH to the authorized account from the development chain faucet.
   - For simplicity, you can add the Anvil private key to your Metamask wallet and transfer the wallet balance there
     on the local RPC network. See the Metamask docs for more information.
2. Add the Anvil private key to the `PRI_DEV_PKEY` environment variable in the root directory.
   - Note that this is necessary for testing faucet drip for the external wallet in development because there is no
     faucet deployed locally for the local anvil chain.
3. Set `noExternalWallet` to false in `client/src/network/config/getNetworkConfig.ts`

See [here](https://github.com/primodiumxyz/primodium/pull/873) for more information on account authorization.

## Config

### There are four sources of configuration for the game:

1. `mud.config.ts`: Houses tables. To create/modify a table, [read here.](https://mud.dev/world/config)
2. `enums.ts`: Houses enums.
3. `terrain.csv`: Houses the terrain of the main map. Numbers correspond to terrain as follows:

```
60: "Iron"
62: "Lithium"
64: "Water"
58: "Copper"
```

4. `prototypesConfig.ts`: Houses preset entity configurations. A prototype object has the following fields:

   a. keys: the keys of the prototype. If not set, the key will be a bytes32 encoding of the name of the prototype.

   b. tables: the values of the tables on the prototype's key(s)

   c. levels: the values of the levels of the prototype, indexed by `[...keys, level: "uint256"]`. The key of each
   level should be the number of the level in question.

To regenerate solidity based on updated typescript source, run `pnpm build`.

## Dev Systems

Functions in `DevSystem` expose direct table access. We can add abstractions as necessary.

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
