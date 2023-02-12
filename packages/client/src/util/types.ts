import { useState, useCallback, useEffect, useRef } from "react";
import { TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";

import { SystemTypes } from "contracts/types/SystemTypes";
import { components } from "..";

export type MudRouterProps = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};
