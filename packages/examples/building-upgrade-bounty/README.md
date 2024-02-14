# building-upgrade-bounty

An example of how to extend the Primodium world using namespaces, private systems, and access control.

This example will implement a bounty for an allowlist of addresses to upgrade the owner's buildings in exchange for a small reward of ETH.

## Testing

Internal testing, given that v0.10.0 is not live yet.

### Setup

For faster, easier testing, open `primodium/packages/contracts/config/prototypeConfig.ts`, search "Mines", and edit the IronMine levels such as this:

```ts
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 7n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Iron: 1 }) }, // Make this number high, as shown, for faster production
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 10 }), // Make this number low, as shown, for easy achievement
        P_Production: getResourceValues({ Iron: 11 }),
      },
      ...
```

### Launch Base Primodium World

Open up a terminal in the root Primodium directory and run:

```bash
pnpm i
pnpm build
pnpm dev:node
```

Open up a second terminal in the root Primodium directory and run:

```bash
pnpm dev:contracts
```

Open up a third terminal in the root Primodium directory and run:

```bash
pnpm dev:client
```

### Staging

Open the client at `localhost:3000/game`. Use Alice's key to connect to the game: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

Using the client as Alice, construct 3 Iron Mines on the top right plots.

### World Extension

Open a new terminal, and navigate to `primodium/packages/examples/building-upgrade-bounty`. Execute the following:

```bash
pnpm i
pnpm build
```

Navigate to `primodium/packages/examples/building-upgrade-bounty/packages/contracts`. Execute the following:

```bash
forge script script/UpgradeBountyExtension.s.sol --rpc-url http://localhost:8545 --broadcast
```

Once complete, execute the following:

```bash
forge script script/UpgrBounSystemAccess.s.sol --rpc-url http://localhost:8545 --broadcast
```

Look at the client, notice that a specific Iron Mine has been upgraded to Iron Mine II!

## TODO

TODO's

- [ ] document NatSpec
- [ ] Refactor and modularize scripts
- [ ] fix coord type in System
- [ ] set up initial script for testing
- [ ] document for external readers
- [ ] clean up and minimize necessary info from Primodium world
- [ ] Implement `AgreementMembersSystem.sol` for more readability of access permissions
