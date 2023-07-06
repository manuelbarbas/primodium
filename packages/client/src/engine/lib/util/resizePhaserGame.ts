export const resizePhaserGame = (game: Phaser.Game) => {
  const resize = () => {
    const w = window.innerWidth * window.devicePixelRatio;
    const h = window.innerHeight * window.devicePixelRatio;
    game.scale.resize(w, h);
    for (const scene of game.scene.scenes) {
      if (scene.scene.settings.active) {
        scene.cameras.main.setViewport(0, 0, w, h);
      }
    }
  };
  window.addEventListener("resize", resize.bind(this));

  const dispose = () => {
    window.removeEventListener("resize", resize.bind(this));
  };

  return { dispose };
};
