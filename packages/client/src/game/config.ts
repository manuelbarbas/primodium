const config = {
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    gridSize: 500,
    buffer: 1000,
  },
  assetKeys: {
    tilesets: {
      terrain: "terrain-tileset",
      resource: "resource-tileset",
    },
  },
  network: {
    gasLimit: 500_000,
    retryCount: 2,
  },
  camera: {
    minZoom: 1,
    maxZoom: 5,
    pinchSpeed: 1,
    scrollSpeed: 1,
  },
};

export default config;
