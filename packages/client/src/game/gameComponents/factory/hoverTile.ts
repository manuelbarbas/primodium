import { BlockType } from "src/util/constants";
import { GameObjectComponent } from "../../../engine/types";
import { EntityID } from "@latticexyz/recs";

export const createHoverTile = (
  x: number,
  y: number,
  tileHeight: number,
  tileWidth: number,
  selectedBuilding: EntityID
): GameObjectComponent<"Graphics"> => {
  function setPosition(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.x = Math.floor(x / tileWidth) * tileWidth;
    gameObject.y = Math.floor(y / tileHeight) * tileHeight;
  }

  function drawHoverTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.clear();

    gameObject.fillStyle(0xffff00, 0.3);
    gameObject.lineStyle(1, 0xffff00);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  function drawDemolishPathTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.clear();

    gameObject.fillStyle(0xffa500, 0.3);
    gameObject.lineStyle(1, 0xffa500);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  function drawDemolishBuildingTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.clear();

    gameObject.fillStyle(0xff0000, 0.3);
    gameObject.lineStyle(1, 0xff0000);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  function drawPathTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.clear();

    gameObject.fillStyle(0xff00ff, 0.3);
    gameObject.lineStyle(1, 0xff00ff);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  function drawAttackTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.clear();

    gameObject.fillStyle(0xffff00, 0.3);
    gameObject.lineStyle(1, 0xffff00);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  return {
    id: "hoverTile",
    once: (gameObject) => {
      setPosition(gameObject);
    },
    update: (gameObject) => {
      gameObject.clear();

      switch (selectedBuilding) {
        case BlockType.DemolishPath:
          drawDemolishPathTile(gameObject);
          break;
        case BlockType.DemolishBuilding:
          drawDemolishBuildingTile(gameObject);
          break;
        case BlockType.Conveyor:
          drawPathTile(gameObject);
          break;
        case BlockType.SelectAttack:
          drawAttackTile(gameObject);
          break;
        default:
          drawHoverTile(gameObject);
      }
    },
  };
};
