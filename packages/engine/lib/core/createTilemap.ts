import type Phaser from "phaser";

export const createTilemap = (scene: Phaser.Scene, tileWidth: number, tileHeight: number, defaultKey?: string) => {
  const renderTilemap = (key: string) => {
    currentMap?.destroy();
    const mapData = scene.cache.tilemap.get(key).data as Phaser.Tilemaps.MapData;

    const map = scene.add.tilemap(key);

    const tilesets = mapData.tilesets.map((tileset) =>
      map.addTilesetImage(tileset.name, tileset.name)
    ) as Phaser.Tilemaps.Tileset[];

    (mapData.layers as Phaser.Tilemaps.LayerData[]).forEach((layer) =>
      map.createLayer(layer.name, tilesets, -19 * 32, -50 * 32)
    );

    currentMap = map;
    return map;
  };

  let currentMap: Phaser.Tilemaps.Tilemap | null = defaultKey ? renderTilemap(defaultKey) : null;

  const dispose = () => {
    currentMap?.destroy();
  };

  const getMap = () => currentMap;

  return { render: renderTilemap, getMap, tileHeight, tileWidth, dispose };
};
