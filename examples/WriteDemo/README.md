# Primodium Extension - Write Demo

This demo finds an open resource tile on your main base, and calls the `BuildSystem` to build an Iron Mine on it. It introduces resource enumerations, prototypes, blueprints, and other Primodium game structures. You'll be reading heavily from game `Table`s, and working with various game Types.

## Quickstart

### The demo includes four important files:

- System Contract: `src/WriteDemoSystem.sol`
- System Tests: `test/WriteDemoSystem.t.sol`
- Deployment Script: `scripts/RegisterWriteDemoSystem.s.sol`
- Interaction Script: `scripts/BuildIronMine.s.sol`

### Actions

- Change your active directory:
  - `cd examples/WriteDemo/packages/contracts`
- Install the necessary packages:
  - `pnpm i`
- Build the project:
  - `pnpm build`
- Test the project:
  - `forge test`
- Do a dry-run of deployment:
  - `forge script script/RegisterWriteDemoSystem.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http`
- Deploy the System:
  - `forge script script/RegisterWriteDemoSystem.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast`
- Use a script to interact with the system:
  - `forge script script/BuildIronMine.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast`

## Getting Started (Walkthrough)

- WORLD_ADDRESS: `0x46c1e9dd144fcf5477a542d3152d28bc0cfba0b6`
- MUD Version: `2.0.1`
- Primodium Game Source: `packages/contracts/primodium`

## Create the System

The commented code can be found in `packages/contracts/src/systems/WriteDemoSystem.sol`

The code should compile with `pnpm build`.

This system is quite a bit more involved.

We start by finding out home asteroid, as seen in the ReadDemo.

### Enumerations

Next we need to select the building we want to build. Primodium stores lits of entity lookup keys in `common.sol`. Here we can find buildings, resources, units, etc. The enums are used to lookup prototypes and blueprints later, in their specific `System`s. We're going to build an `EBuilding.IronMine` for now.

### Map Interactions

Each asteroid has a bounded set of tiles where buildings can be placed. We need to find the bounds for this specific map (our Home Base in this case). These bounds change as you increase your expansion level, so we get the level, and save the `DimensionData` range. From there, we use an `P_AsteroidData` struct to manage the data, calculate the bounds, and return them.

Finally, we step through each tile and check if it is the correct type. Next we check if it is empty, and we use a `P_Blueprint` to check if the building fits within the bounds. If all of this is successful, we return the tile position.

### Calling a Game System

Lastly, we want our expansion system to call a system on the Primodium world. If all of this is successful, we return the buildingEntity.

`System` contracts are created in `packages/contracts/src/systems`. They are fairly standard smart contracts that only need to import the critical functionality from MUD or the `World` you are interacting with.

The contract itself is a `System` so we need to import that MUD library. We also need to tell the contract our `Store` target. In this case, we aren't interacting with any local `Table`s since we have none. `StoreSwitch` allows us to specify the `World` address where our target `Table`s reside. The `_world()` function allows us to get the address of the calling `World`, which is the Primodium world in this case.

We import the necessary `Table` libraries from the target `World`. These libraries are constructed by MUD scripts during `pnpm build`, and include the specific `tableId`s and `fieldLayout`s, with appropriate setters and getters. They handle the encoding and decoding of the underlying storage records for us.

## Testing the World Extension

The commented code can be found in `packages/contracts/test/WriteDemoSystem.t.sol`

The test should execute by running `forge test` within the `packages/contracts/` folder. If you want to see additional details, you can run `forge test -vvvv` with 1-5 `v`s to increase verbosity. I generally recommend 4 or 5 for debug.

## Deploying the World Extension

The commented code can be found in `packages/contracts/scripts/RegisterWriteDemoSystem.s.sol`

You can do a simulation of a deployment with the following command:

```bash
forge script script/RegisterWriteDemoSystem.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http
```

When you are CERTAIN you are ready to deploy, add the --broadcast option:

```bash
forge script script/RegisterWriteDemoSystem.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast
```

## Testing the Deployment

The commented code can be found in `packages/contracts/scripts/BuildIronMine.s.sol`

Now that the code is live, we can use a script that largely replicates the function we wrote in the test.

Simulation:

```bash
forge script script/BuildIronMine.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http
```

Live:

```bash
forge script script/BuildIronMine.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast
```
