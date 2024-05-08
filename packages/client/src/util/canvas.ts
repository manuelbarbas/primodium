export const isDomInteraction = (pointer: Phaser.Input.Pointer, type: "down" | "up") => {
  const element = type === "down" ? pointer.downElement : pointer.upElement;

  return element.tagName === "BUTTON" || Boolean(element.closest("button"));
};
