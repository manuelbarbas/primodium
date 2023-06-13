const config = {
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    gridSize: 100,
    buffer: 1000,
  },
  assetKeys: {
    tilesets: {
      terrain: "terrain-tileset",
      ore: "ore-tileset",
    },
  },
  network: {
    gasLimit: 500_000,
    retryCount: 2,
  },
  camera: {
    minZoom: 0.5,
    maxZoom: 10,
    pinchSpeed: 1,
    scrollSpeed: 1,
  },
};

export default config;
