# Primodium Core

Primodium Core exposes core functionality to [Primodium](primodium.com), a blockchain-based video game. This includes:

- The Core object, which contains
  - Tables, allowing user to access and update functionality. [See here](https://github.com/primodiumxyz/reactive-tables) for more details.
  - Network, an object that handles connection to the blockchain running Primodium.
  - Utils, a suite of tools that allow for ease of getting and setting data
  - Sync, a suite of tools for fetching data from an indexer
- Hooks, which expose a set of hooks for React-based use cases
- Constants and Mappings, used throughout the core package for type safety and developer experience.

## Getting Started

### Documentation

You can find details about Primodium and ways to develop on top at [developer.primodium.com](developer.primodium.com).

### Prerequisites

- [node 18.x](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)

### Installation

```
pnpm install @primodiumxyz/core
```

## Usage

```js
 import { createCore,chainConfigs  } from '@primodiumxyz/core';

  const coreConfig = {
    chain: chainConfigs.dev,
    worldAddress: '0x0',
    initialBlockNumber: BigInt(0),
    runSync: true, // runs default sync process if indexer url provided in chain config
    runSystems: true, // runs default systems to keep core table data updated as blockchain state changes
  };

 const coreConfig =
      const core = createCore(coreConfig);

 coreConfig.
```

### Node

## API

### Tables

Tables contain data. [See here](https://github.com/primodiumxyz/reactive-tables) for details on using tables to read and write data.

The Core object has the following data:
are split into contract and local tables. Contract tables correlate to onchain state, while local tables are used only in the core object and its extensions.
Contract Tables: [Documented here](https://developer.primodium.com/overview-source/tables)
