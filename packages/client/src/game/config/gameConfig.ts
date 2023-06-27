const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-container",
  fps: {
    target: 60,
    min: 30,
    limit: 60,
  },
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio,
  height: window.innerHeight * window.devicePixelRatio,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  autoFocus: true,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  desynchronized: true,
  preserveDrawingBuffer: true,
  pixelArt: true,
};

export default gameConfig;
