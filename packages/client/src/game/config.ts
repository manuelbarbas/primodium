const config = {
  tilemap: {
    tileWidth: 200,
    tileHeight: 200,
    gridSize: 1000,
    buffer: 100,
  },
  assetKeys: {
    tileset: "tilemap",
  },
  network: {
    gasLimit: 500_000,
    retryCount: 2,
  },
  camera: {
    minZoom: 0.5,
    maxZoom: 2,
    pinchSpeed: 1,
    scrollSpeed: 1,
  },
};

export default config;
