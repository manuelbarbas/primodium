import { Coord } from "@latticexyz/utils";
import api from "../../api";
import { RENDER_INTERVAL, Scenes } from "../constants";

const createChunkManager = () => {
  const game = api.getGame();
  const { chunks } = game?.scenes[Scenes.Main].tilemap!;
  let chunkStream: ReturnType<typeof chunks.addedChunks$.subscribe>;

  const renderQueue: Coord[] = [];
  let lazyChunkLoader: ReturnType<typeof setInterval>;

  const renderInitialChunks = () => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      api.game.tilemap.renderChunk(chunk);
    }
  };

  const startChunkRenderer = () => {
    chunkStream = chunks.addedChunks$.subscribe((chunk) => {
      renderQueue.push(chunk);
    });

    // distrube chunk rendering over time
    lazyChunkLoader = setInterval(() => {
      // get chunks to render. prioritize chunks that are closer to the player/just added
      const chunk = renderQueue.pop();
      if (!chunk) return;

      //check if chunk is still visible
      if (!chunks.visibleChunks.current.get(chunk)) return;

      api.game.tilemap.renderChunk(chunk);
    }, RENDER_INTERVAL);
  };

  const dispose = () => {
    chunkStream.unsubscribe();
    clearInterval(lazyChunkLoader);
  };

  return { renderInitialChunks, startChunkRenderer, dispose };
};

export default createChunkManager;
