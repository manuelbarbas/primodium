import { Coord } from "../../types";
import type { createCamera } from "./createCamera";

export class ChunkManager {
  private camera;
  private chunkSize;
  private onEnterChunk;
  private onExitChunk;
  private visibleChunks: Set<string>;
  private worldViewUnsub;

  constructor(
    camera: ReturnType<typeof createCamera>,
    chunkSize: number,
    onEnterChunk: (chunkCoord: Coord) => void,
    onExitChunk: (chunkCoord: Coord) => void
  ) {
    this.camera = camera;
    this.chunkSize = chunkSize;
    this.onEnterChunk = onEnterChunk;
    this.onExitChunk = onExitChunk;
    this.visibleChunks = new Set();
    this.worldViewUnsub = camera.worldView$.subscribe(() => this.update());
  }

  private _getVisibleChunks(): Set<string> {
    const cam = this.camera.phaserCamera;
    const chunks = new Set<string>();

    const startX = Math.floor(cam.worldView.x / this.chunkSize);
    const startY = Math.floor(cam.worldView.y / this.chunkSize);
    const endX = Math.ceil((cam.worldView.x + cam.worldView.width) / this.chunkSize);
    const endY = Math.ceil((cam.worldView.y + cam.worldView.height) / this.chunkSize);

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        chunks.add(this.getKeyForChunk({ x, y }));
      }
    }

    return chunks;
  }

  private update(): void {
    const currentVisible = this._getVisibleChunks();

    // Find chunks that have just become visible
    currentVisible.forEach((chunkKey) => {
      if (!this.visibleChunks.has(chunkKey)) {
        const [x, y] = chunkKey.split(":").map(Number);
        this.onEnterChunk({ x, y });
      }
    });

    // Find chunks that are no longer visible
    this.visibleChunks.forEach((chunkKey) => {
      if (!currentVisible.has(chunkKey)) {
        const [x, y] = chunkKey.split(":").map(Number);
        this.onExitChunk({ x, y });
      }
    });
    this.visibleChunks = currentVisible;
  }
  private getKeyForChunk({ x, y }: Coord): string {
    return `${x}:${y}`;
  }

  isVisible(chunkCoord: Coord): boolean {
    return this.visibleChunks.has(this.getKeyForChunk(chunkCoord));
  }

  getVisibleChunks(): Set<string> {
    return this.visibleChunks;
  }

  dispose(): void {
    this.worldViewUnsub.unsubscribe();
  }
}
