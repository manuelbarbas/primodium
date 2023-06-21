const config = {
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    gridSize: 16,
    chunkSize: 32,
    buffer: 1000,
  },
  assetKeys: {
    tilesets: {
      terrain: "terrain-tileset",
      resource: "resource-tileset",
    },
  },
  camera: {
    minZoom: 2,
    maxZoom: 5,
    zoomStep: 0.5,
    pinchSpeed: 1,
    scrollSpeed: 0.5,
  },
};

export default config;
