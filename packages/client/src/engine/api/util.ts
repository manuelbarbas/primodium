// import {
//   pixelCoordToTileCoord,
//   tileCoordToPixelCoord,
// } from "@smallbraingames/small-phaser";
// import { Coord } from "@latticexyz/utils";
// import { useEngineStore } from "../store/EngineStore";

// /**
//  * Converts a pixel coordinate to a game coordinate.
//  * @param {Coord} coord The pixel coordinate to convert.
//  * @returns {Coord} The game coordinate.
//  */
// export const pixelCoordToGameCoord = (coord: Coord, scene: string = "Main") => {
//   const { tileHeight, tileWidth } =
//     useEngineStore.getState().game?.sceneManager.scenes[scene]?.tilemap.map!;

//   return pixelCoordToTileCoord(
//     { x: coord.x, y: -coord.y },
//     tileWidth,
//     tileHeight
//   );
// };

// /**
//  * Converts a game coordinate to a pixel coordinate.
//  * @param {Coord} coord The game coordinate to convert.
//  * @returns {Coord} The pixel coordinate.
//  */
// export const gameCoordToPixelCoord = (coord: Coord, scene: string = "Main") => {
//   const { tileHeight, tileWidth } =
//     useEngineStore.getState().game?.sceneManager.scenes[scene]?.tilemap!;

//   const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);

//   return { x: pixelCoord.x, y: -pixelCoord.y };
// };

// /**
//  * Converts a game coordinate to a tile coordinate.
//  * @param {Coord} coord The game coordinate to convert.
//  * @returns {Coord} The tile coordinate.
//  */
// export const gameCoordToTileCoord = (coord: Coord) => {
//   return { x: coord.x, y: -coord.y };
// };

// /**
//  * Converts a game coordinate to a chunk coordinate.
//  * @param {Coord} coord The game coordinate to convert.
//  * @returns {Coord} The chunk coordinate.
//  */
// export const gameCoordtoChunkCoord = (coord: Coord, scene: string = "Main") => {
//   const { chunkSize } =
//     useEngineStore.getState().game?.sceneManager.scenes[scene]?.tilemap!;

//   return {
//     x: Math.floor(coord.x / chunkSize),
//     y: Math.floor(coord.y / chunkSize),
//   };
// };

// /**
//  * Converts a chunk coordinate to a game coordinate.
//  * @param {Coord} coord The chunk coordinate to convert.
//  * @returns {Coord} The game coordinate.
//  */
// export const chunkCoordtoGameCoord = (coord: Coord, scene: string = "Main") => {
//   const { chunkSize } =
//     useEngineStore.getState().game?.sceneManager.scenes[scene]?.tilemap!;

//   return {
//     x: coord.x * chunkSize,
//     y: coord.y * chunkSize,
//   };
// };

export {};
