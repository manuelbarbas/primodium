import fs from "fs";
import rawContent from "./coords.json" assert { type: "json" };
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url);
const filePath = path.resolve(__dirname, "../../../src/libraries/LibInitTerrain.sol");

function generateContent(jsonContent) {
  // terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(0, 0, 0)), uint256(1));
  return jsonContent
    .map(
      (elem) =>
        `terrainComponent.set(LibEncode.hashKeyCoord(TerrainKey, Coord(${elem.coord.x}, ${elem.coord.y}, 0)), ${elem.value});`
    )
    .join("\n");
}

function addContext(str) {
  return `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { P_TerrainComponent, ID as P_TerrainComponentID } from "components/P_TerrainComponent.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Coord } from "src/types.sol";
import "src/prototypes.sol";

library LibInitTerrain {
  function init(IWorld world) internal {
    P_TerrainComponent terrainComponent = P_TerrainComponent(world.getComponent(P_TerrainComponentID));
    ${str}
  }
}
`;
}

function testContext(jsonContent) {
  return `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";

import { MainBaseID, WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testTerrain() public {
${jsonContent
  .map(
    (elem) =>
      `    assertEq(LibTerrain.getResourceByCoord(world, Coord(${elem.coord.x}, ${elem.coord.y}, 0)), ${elem.value});`
  )
  .join("\n")}
  }
}`;
}
const content = generateContent(rawContent);
const finalContent = addContext(content);

fs.writeFileSync(filePath, finalContent);
fs.writeFileSync(path.resolve(__dirname, "../../../src/test/systems/TerrainSystem.sol"), testContext(rawContent));
