import type Phaser from "phaser";
export const createTilemap = (scene: Phaser.Scene, tileWidth: number, tileHeight: number, defaultKey?: string) => {
  const _renderTilemap = (key: string) => {
    const mapData = scene.cache.tilemap.get(key).data as Phaser.Tilemaps.MapData;

    const map = scene.add.tilemap(key);

    const tilesets = mapData.tilesets.map((tileset) =>
      map.addTilesetImage(tileset.name, tileset.name)
    ) as Phaser.Tilemaps.Tileset[];

    (mapData.layers as Phaser.Tilemaps.LayerData[]).forEach((layer) =>
      map.createLayer(layer.name, tilesets, -19 * 32, -50 * 32)
    );

    return map;
  };

  let map = defaultKey ? _renderTilemap(defaultKey) : null;

  const renderTilemap = (key: string) => {
    map?.destroy();
    map = _renderTilemap(key);
  };

  const dispose = () => {
    map?.destroy();
  };

  return { render: renderTilemap, map, tileHeight, tileWidth, dispose };
};
