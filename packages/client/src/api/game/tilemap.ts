import config from "../../game/config";
import { getTopLayerKeyPair } from "../../util/tile";
import { Coord, CoordMap } from "@latticexyz/utils";
import { createPerlin } from "@latticexyz/noise";
import { useGameStore } from "../../store/GameStore";
import { EntityIdtoTilesetId, Tileset } from "../../game/constants";

const perlin = await createPerlin();
const chunkCache = new CoordMap<boolean>();

export const renderChunk = (coord: Coord) => {
  const { tilemap } = useGameStore.getState().game?.mainScene!;
  const { chunkSize } = config.tilemap;

  //don't render if already rendered
  if (chunkCache.get(coord)) return;

  for (let x = coord.x * chunkSize; x < coord.x * chunkSize + chunkSize; x++) {
    for (
      let y = coord.y * chunkSize;
      y < coord.y * chunkSize + chunkSize;
      y++
    ) {
      const coord = { x, y: -y };

      const { terrain, resource } = getTopLayerKeyPair(coord, perlin);
      // const { terrain, resource } = { terrain: 1, resource: 1 };

      try {
        //lookup and place terrain
        const terrainId = EntityIdtoTilesetId[terrain];

        //lookup and place resource
        tilemap.map.putTileAt(
          { x, y },
          terrainId ?? Tileset.Alluvium,
          "Terrain"
        );
      } catch (e) {
        // console.log(e);
      }

      try {
        if (!resource) continue;
        const resourceId = EntityIdtoTilesetId[resource!];
        tilemap.map.putTileAt({ x, y }, resourceId, "Resource");
      } catch (e) {
        // console.log(e);
      }
    }
  }

  chunkCache.set(coord, true);
};
