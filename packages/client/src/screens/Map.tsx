import { useEffect } from "react";
import { TxQueue } from "@latticexyz/network";
import { EntityIndex, World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { useComponentValue } from "@latticexyz/react";
import { components } from "..";

import { getBlockAtPosition, getTerrainBlock } from "../layers/network/api";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

// Read the terrain state of the current coordinate
export default function Map({ systems, components }: Props) {
  const position = useComponentValue(components.Position, 0 as EntityIndex);

  const fetchDemoBlockState = async () => {
    // getBlockAtPosition(context);
  };

  useEffect(() => {
    fetchDemoBlockState();
  }, []);

  return (
    <>
      <p>Test Page</p>
      {position ? position : "??"}
    </>
  );
}
