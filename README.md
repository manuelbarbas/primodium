# Primodium v0.11.1

A fully onchain space-based factory-building game, built with MUD & Phaser.

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

#### Setup

Clone this repository:

```bash
git clone https://github.com/primodiumxyz/primodium.git
```

Install all dependencies:

```bash
pnpm i
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
