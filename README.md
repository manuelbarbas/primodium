# Primodium v0.11.1

A fully onchain space-based factory-building game, built with MUD & Phaser.

- [Introduction](#introduction)
  - [Overview](#overview)
  - [Installation](#installation)
  - [Environment](#environment)
  - [Structure](#structure)
- [Development](#development)
  - [Running the game](#running-the-game)
  - [Building](#building)
  - [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Introduction

### Overview

In this game, players can:

- Mine resources from asteroids
- Build and upgrade processing factories to convert mined resources into other resources
- Build and upgrade fleets of ships to raid other players' bases and asteroids
- Build and upgrade defenses to protect their bases and asteroid fields from raids
- Create and join alliances to form a community (or gang up on other players)
- Compete to raid special shard asteroids for rare resources during events
- Trade resources with other players

This monorepo contains the entire stack for running Primodium, including the React client and Phaser game, the local postgres indexer (that can be deployed to a cloud provider as well) and all the contracts.

### Installation

#### Prerequisites

There are a few CLI tools to install to be compatible with the entire monorepo.

- [node](https://nodejs.org/en/download/) v20.x - Tested with node v20.18.2.
  - You can use [nvm](https://github.com/nvm-sh/nvm) to install and manage multiple versions of node.
- [pnpm](https://pnpm.io/installation) v8.x - Tested with pnpm v8.15.9.
- [Foundry](https://book.getfoundry.sh/getting-started/installation) - This will get installer during the "prepare" script.
- [Docker](https://docs.docker.com/get-docker/) - Or any other containerization tool.

#### Setup

Clone this repository:

```bash
git clone https://github.com/primodiumxyz/primodium.git
```

Install all dependencies:

```bash
pnpm i
```

### Environment

Create a `.env` file in the root of the project, and follow the instructions in the `.env.example` file to set the environment variables.

```bash
cp .env.example .env
```

You will also need to write the deployer's private key in some environment variable in the contracts package.

```bash
# The default anvil private key
echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" >> ./packages/contracts/.env
```

### Structure

```ml
examples - "Examples and boilerplate for adding extensions to the game"
packages - "Components of the entire stack for running Primodium"
├── assets - "All ingame assets and atlas"
├── client - "React client that integrates other components and supercharges with a browser UI"
├── contracts - "MUD contracts, configuration and infrastructure—basically the whole state and conditions of the game"
├── core - "Core logic, systems, hooks and utilities for the client"
├── engine - "Game engine for managing Phaser scenes and user inputs"
└── game - "Core Phaser infrastructure for the game; objects, scenes, systems, input controls, etc."
```

## Development

### Running the game

The whole stack can be run with the following command:

```bash
pnpm dev
```

This will run a series of scripts each in a separate window, including the client, the development chain (on which contracts get deployed) and the local postgres indexer.

> NOTE: When running the indexer locally, docker network and volumes properly clear only on rerun of `pnpm dev:indexer`. If you would like to manually free these resources run `pnpm clean:indexer`.

### Building

You can build the entire monorepo with the following command:

```bash
pnpm build
```

This will build the client and core packages, and compile the contracts as well as generate the ABIs and TypeScript bindings.

### Testing

To run the tests for every package, run the following:

```bash
pnpm test
```

Or if you want to run the tests for a specific package, navigate to that package directory and run the same command.

## Deployment

To deploy the contracts on a specific chain, follow these steps:

1. Update [`.env`](./.env):
   - `PRI_DEV`: set to `"false"` if you don't want to deploy the `DevSystem` contract.
   - `PRI_CHAIN_ID`: set to the chain you want to deploy to; you will also need to add or update the `[profile.<chain_id>]` field in [`packages/contracts/foundry.toml`](./packages/contracts/foundry.toml).
2. Add the private key of the deployer to [`packages/contracts/.env`](./packages/contracts/.env):
   ```bash
   echo "PRIVATE_KEY=<your-private-key>" >> ./packages/contracts/.env
   ```
3. Deploy the contracts:
   ```bash
   pnpm deploy:<chain_id> # if the command doesn't exist, create it in both `packages/contracts/package.json` and `package.json`
   ```

## Contributing

If you wish to contribute to the package, please open an issue first to make sure that this is within the scope of the repository, and that it is not already being worked on.

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

While the codebase is published under the MIT license, all sprites and artwork remain the intellectual property of Primodium Inc. Commercial use of these assets is strictly prohibited unless explicit written permission is granted.

Furthermore, at the artist’s request, the sprites and artwork may not be used for training any machine learning models.
