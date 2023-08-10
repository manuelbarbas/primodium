import jsonData from "./deploy.json" assert { type: "json" };
import fs from "fs";

const isDevOrDebug = (string) => {
  const toRemove = /debug|dev/i.test(string);
  if (toRemove) console.log("\x1b[32m%s\x1b[0m", `removing ${string}`);

  return !toRemove;
};
function removeDebugAndDev(data) {
  data.components = data.components.filter((component) => {
    return isDevOrDebug(component);
  });
  data.initializers = data.initializers.filter((initializer) => {
    return isDevOrDebug(initializer);
  });
  data.systems = data.systems.filter((system) => {
    return isDevOrDebug(system.name);
  });
  return data;
}

const cleanedData = removeDebugAndDev(jsonData);
fs.writeFileSync("deploy-live.json", JSON.stringify(cleanedData, null, 2));
