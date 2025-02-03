# Primodium Game

The game objects and scenes for Primodium. This includes all of the Phaser classes for various objects, as well as their associated rendering systems for initialization and update, as well as setting up user inputs. This package also contains the game initialization logic, which will return the global API for the game.

## Setup

Follow the [README](../../README.md) in the root of the monorepo to install the necessary dependencies and configure the environment.

## Organization

This package is used as a library for the [client package](../../client).

```ml
(* ./src *)
api - "Consumer-facing API for the game"
lib - "Internal logic for the engine"
├── config - "Configuration of the various scenes"
├── constants - "Game constants and keybindings"
├── objects - "Game objects"
└── render - "Rendering systems for asteroids and fleets"
scenes - "Phaser scenes; each including initialization, user-input setup, rendering and systems"
├── asteroid - "Asteroid scene"
├── command-center - "Command center scene"
├── common - "Camera and miscellaneous"
├── root - "Root scene (game mode, effects)"
├── starmap - "Starmap scene"
└── ui - "UI systems (notifications, invites)"
stores - "Zustand persistent store for managing user preferences and shortcuts"
```
