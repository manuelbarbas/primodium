const RENDER_RESOLUTION = 1;

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: "phaser-container",
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio * RENDER_RESOLUTION,
  height: window.innerHeight * window.devicePixelRatio * RENDER_RESOLUTION,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  autoFocus: true,
  desynchronized: true,
  preserveDrawingBuffer: true,
  autoRound: true,
  transparent: true,
  pixelArt: true,
};

export default gameConfig;
