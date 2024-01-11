import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import fs from "fs";
import path from "path";

type JsonCoords = ReturnType<typeof csvToJsonCoords>;

export async function terraingen(csvSrc: string, outputBaseDirectory: string) {
  const json = csvToJsonCoords(csvSrc);
  const content = generateContent(json);
  const finalContent = addContext(content);
  const fullOutputPath = path.join(outputBaseDirectory, `scripts/CreateTerrain.sol`);
  await formatAndWriteSolidity(finalContent, fullOutputPath, `Generated terrain`);
}

const numberBase: Record<string, string> = {
  60: "Iron",
  62: "Lithium",
  64: "Water",
  58: "Copper",
  66: "Sulfur",
};

function csvToJsonCoords(csvUrl: string) {
  const csv = fs.readFileSync(csvUrl, "utf-8");
  const lines = csv.split("\n");
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i]
      .replace(/\s+/g, "")
      .split(",")
      .filter((x) => !!x);
    for (let j = 0; j < currentLine.length; j++) {
      if (currentLine[j] == "0") continue;
      const value = numberBase[currentLine[j]];
      if (!value) throw new Error(`Invalid value ${currentLine[j]} at line ${i}, column ${j}`);
      result.push({
        coord: { x: j, y: i },
        value: value,
      });
    }
  }

  return result;
}

function generateContent(jsonContent: JsonCoords) {
  return jsonContent
    .map((elem) => `P_Terrain.set(${elem.coord.x}, ${elem.coord.y}, uint8(EResource.${elem.value}));`)
    .join("");
}

function addContext(str: string) {
  return `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { P_Terrain } from "codegen/index.sol";
import { EResource } from "codegen/common.sol";

  function createTerrain() {
    ${str}
}
`;
}
