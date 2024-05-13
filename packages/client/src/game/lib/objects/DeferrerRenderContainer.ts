import { Entity } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "engine/lib/util/coords";
import { Coord } from "engine/types";
import { IPrimodiumGameObject } from "@/game/lib/objects/interfaces";
import { PrimodiumScene } from "@/game/api/scene";

/**
 * @notice Create a wrapper for the future object at the provided coord, to prevent rendering it on launch/init and causing stutter
 *
 * This is useful for objects rendered inside an enter system (probably on initial load), at is will create this basic object at the coords, which when
 * entering the visible chunk will be spawned, effectively creating the actual intended object, which will be rendered as well as the container is destroyed
 * This is nothing more than a placeholder that delays running the provided callback until the object is actually visible
 *
 * @param args.id The id of the corresponding entity
 * @param args.scene The Primodium scene object
 * @param args.coord The coord where the object should be rendered
 * @param args.spawnCallback The callback to run when the object is spawned
 */
export class DeferredRenderContainer extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private id: Entity;
  private coord: Coord;
  private _scene: PrimodiumScene;
  private spawned = false;
  private spawnCallback: () => unknown;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord; spawnCallback: () => void }) {
    const { id, scene, coord, spawnCallback } = args;
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;
    this.coord = coord;
    this._scene = scene;
    this.spawnCallback = spawnCallback;

    this._scene.objects.deferredRenderContainer.add(id, this, true);
  }

  spawn() {
    this.spawned = true;
    return this.spawnCallback();
  }

  isSpawned() {
    return this.spawned;
  }
}
