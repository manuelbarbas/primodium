export function isValidClick(e: Phaser.Input.Pointer) {
  return e.downElement.nodeName === "CANVAS" && e.getDuration() <= 250;
}
