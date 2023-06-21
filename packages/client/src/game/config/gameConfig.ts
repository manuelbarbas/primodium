const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-container",
  fps: {
    target: 120,
    min: 30,
    limit: 120,
  },
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio,
  height: window.innerHeight * window.devicePixelRatio,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  dom: {
    createContainer: true,
  },
  autoFocus: true,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  pixelArt: true,
};

export default gameConfig;
