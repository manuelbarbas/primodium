import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url);
const filePath = path.resolve(__dirname, "../../../terrain.csv");

const numberBase = {
  60: "IronID",
  62: "LithiumID",
  64: "WaterID",
  58: "CopperID",
  66: "SulfurID",
};

function csvToJsonCoords(csvUrl) {
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
        coord: { x: i, y: j },
        value: value,
      });
    }
  }

  return result;
}

const jsonData = csvToJsonCoords(filePath);
// console.log("json data:", jsonData);
fs.writeFileSync("coords.json", JSON.stringify(jsonData));
