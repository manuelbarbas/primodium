# Primodium Extension - Read Demo

This demo will show you how to read `Table` data from the Primodium `World` using a World Extension contract.

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

You may need to update your MUD version before running this tutorial. It was built against `2.0.0-next.17`. The command to update to the latest MUD version is:

```bash
pnpm mud set-version --mudVersion 2.0.0-main && pnpm i && pnpm build
```

The world address for v0.11.x is `0xbcc5fbba516733d9947025bb959cb44a272756b4`

The `WORLD_ADDRESS` and `BLOCK_NUMBER` are pre-configured in the `.env.example`. You should copy this to `.env`, and make any desired changes there. This guide was written before the world was deployed, so the `BLOCK_NUMBER` will need to be updated.

The `.gitignore` is already configured to not upload your `.env`, but it is always good practice to confirm the ignores in your `.gitignore` for yourself. Anything pushed to Git lives there forever and can be retrieved by anyone even if you delete it in later commits. Check twice (maybe 3 times), push once. NEVER push live private keys or .env files to Git.

## Extending the World

Since we are interacting with an existing World (Primodium), we will need to know what `Tables` and `Systems` are currently deployed for that World. We have included them in this demo at `packages/contracts/primodium`.

## Setting up mudConfig

The code can be found in `packages/contracts/mud.config.ts`

Every plugin will need a mudConfig, which is stored in `mud.config.ts`. Plugins must exist in a `namespace`. Multiple `Systems` can exist in a namespace.

Since this demo only deploys a system for reading data, we will not need any new `Tables`, but we will need to declare a `Namespace` and `System`.

## Create the System

The commented code can be found in `packages/contracts/src/systems/ReadDemoSystem.sol`

`System` contracts are created in `packages/contracts/src/systems`. They are fairly standard smart contracts that only need to import the critical functionality from MUD or the `World` you are interacting with.

The contract itself is a `System` so we need to import that MUD library. We also need to tell the contract our `Store` target. In this case, we aren't interacting with any local `Table`s since we have none. `StoreSwitch` allows us to specify the `World` address where our target `Table`s reside. The `_world()` function allows us to get the address of the calling `World`, which is the Primodium world in this case.

We import the necessary `Table` libraries from the target `World`. These libraries are constructed by MUD scripts during `pnpm build`, and include the specific `tableId`s and `fieldLayout`s, with appropriate setters and getters. They handle the encoding and decoding of the underlying storage records for us.

The code should compile with `pnpm build`.

## Testing the World Extension

The commented code can be found in `packages/contracts/test/ReadDemoSystem.t.sol`

Before we deploy this system, we should run some tests. We'll be using `forge test` in this example, to test against a live deployment. `pnpm mud test` is another option, which spins up an anvil instance, deploys the world, and then runs runs `forge test` for you. However, there are some complexities to this for testing world extensions, so we will keep it simple for now.

Tests have a lot of imports.

We need `MudTest`, which extends the standard forge `Test` with MUD specific setUp. We override these in our example, as needed.

`console2` is a newer console.log feature of foundry, which outputs things in a manner easier to see.

There are number of MUD specific imports, necessary for registering our system with the root World, and accessing key parameters. You'll notice that the import part is different between MUD version `2.0.0-main-9ef3f9a7` and `2.0.0-next.17`. Primodium is using the former for v0.10.x, and the latter for v0.11.x+, so uncomment the appropriate version for whatever is live for you now.

Lastly, we need the imports specific to our World Extension. These are found in `../src/codegen/`.

The test should execute by running `forge test` within the `packages/contracts/` folder. If you want to see additional details, you can run `forge test -vvvv` with 1-5 `v`s to increase verbosity. I generally recommend 4 or 5 for debug.

MUD worlds only allow a single instance of a namespace, so if someone has already used a namespace, you can't also use it. The revert should say something like `World_ResourceAlreadyExists()` if there is a namespace collision.

## Deploying the World Extension

The commented code can be found in `packages/contracts/scripts/RegisterReadDemoSystem.s.sol`

Deploying your extension looks much like testing your extension, but occurs in a script. Most of the code is identical to the test, which is kind of the point. Test thoroughly before deploying; deployments are permanent.

Key differences are:

- This is a `Script`, not a `MudTest`.
- We must declare and specify the `WORLD_ADDRESS` variable; it is not inherited from `MudTest`.
- When deploying, you must use a `PRIVATE_KEY` in `.env`, since this action will cost gas.
- Writing to the chain requires startBroadcast() instead of startPrank()

When you are CERTAIN you are ready to deploy, you can use the command:

```bash
forge script script/RegisterReadDemoSystem.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast
```

## Testing the Deployment

The commented code can be found in `packages/contracts/scripts/ReadMainBaseLevel.s.sol`

Now that the code is live, we can use a script that largely replicates the function we wrote in the test.

```bash
forge script script/ReadMainBaseLevel.s.sol --fork-url https://primodium-sepolia.rpc.caldera.xyz/http --broadcast
```
