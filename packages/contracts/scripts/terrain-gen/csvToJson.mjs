import fs from "fs";

const csvUrl = "./terrain.csv";
function csvToJsonCoords(csvUrl) {
  const csv = fs.readFileSync(csvUrl, "utf-8");
  const lines = csv.replace(/\s+/g, "").split("\n");
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    console.log("line", i, lines[i]);
    const currentLine = lines[i].split(",");

    for (let j = 0; j < currentLine.length; j++) {
      if (currentLine[j] == "0") continue;
      result.push({
        coord: { x: i, y: j },
        value: currentLine[j],
      });
    }
  }

  return result;
}

const jsonData = csvToJsonCoords(csvUrl);
console.log("json data:", jsonData);
fs.writeFileSync("coords.json", JSON.stringify(jsonData));
