import { TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";

import { SystemTypes } from "contracts/types/SystemTypes";
import { components } from "..";

import { DisplayTile } from "./constants";

export type MudRouterProps = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

export type MudComponentMapTileProps = MudRouterProps & {
  selectedTile: DisplayTile;
  setSelectedTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
};

export type MudComponentTileProps = MudRouterProps & {
  selectedTile: DisplayTile;
};

export type BlockTypeActionComponent = {
  action: () => void;
};
