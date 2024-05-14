import { Entity } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "engine/lib/util/coords";
import { Coord } from "engine/types";
import { IPrimodiumGameObject } from "@/game/lib/objects/interfaces";
import { PrimodiumScene } from "@/game/api/scene";
import { PrimodiumGameObject } from "engine/lib/core/StaticObjectManager";

/**
 * @notice Create a wrapper for the future object at the provided coord, to prevent rendering it on launch/init and causing stutter
 *
 * This is useful for objects rendered inside an enter system (probably on initial load), at is will create this basic object at the coords, which when
 * entering the visible chunk will be spawned, effectively creating the actual intended object.
 *
 * The target object will be rendered as the container is destroyed.
 *
 * This is nothing more than a placeholder that delays running the provided callback until the object is actually visible.
 *
 * @param args.id The id of the corresponding entity
 * @param args.scene The Primodium scene object
 * @param args.coord The coord where the object should be rendered
 * @param args.spawnCallback The callback to run when the object is spawned
 * @param args.render A function to call to render the object
 * @param args.register Whether to register the object on creation (can be useful to delay registration, for instance after intializing the superclass)
 */
export class DeferredRenderContainer<SpawnedObject extends PrimodiumGameObject = PrimodiumGameObject>
  extends Phaser.GameObjects.Container
  implements IPrimodiumGameObject
{
  protected id: Entity;
  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected spawned = false;
  private spawnCallback: () => SpawnedObject | undefined;
  render: () => SpawnedObject | undefined;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    spawnCallback: () => SpawnedObject | undefined;
    render: () => SpawnedObject | undefined;
    register?: boolean;
  }) {
    const { id, scene, coord, spawnCallback, render, register = true } = args;
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;
    this.coord = coord;
    this._scene = scene;
    this.spawnCallback = spawnCallback;
    this.render = render;

    if (register) this.register();
  }

  register() {
    this._scene.objects.deferredRenderContainer.add(this.id, this, true);
  }

  spawn() {
    this.spawned = true;
    const obj = this.spawnCallback();
    if (!obj) return undefined;

    // we need to manually spawn and set the object, since at this point (during `onEnterChunk`) the visible chunks were not yet updated
    // meaning that it might not consider it visible yet, so it won't actually enter it
    if (!obj.isSpawned()) obj.spawn();
    obj.setActive(true).setVisible(true);

    // we don't need this object anymore: remove, destroy and decrement the count since it won't do it when exiting the chunk as it will not exist anymore
    // TODO: we can't do this right now as we need it for fleets, as long as they are not decoupled from asteroids
    // this._scene.objects.deferredRenderContainer.remove(this.id, true, true);

    return obj;
  }

  isSpawned() {
    return this.spawned;
  }
}
