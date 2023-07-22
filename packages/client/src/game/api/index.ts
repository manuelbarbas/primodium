import { BlockType } from "src/util/constants";
import { Address } from "wagmi";
import { Network } from "../../network/layer";
import { init as _init } from "../lib/scripts";
import * as camera from "./camera";
import * as components from "./components";
import { debug } from "./debug";
import * as game from "./game";
import * as hooks from "./hooks";
import * as input from "./input";

const init = async (
  address: Address,
  network: Network,
  version: string = "v1"
) => {
  const asciiArt = `
                                                                          
                                                                          
  ██████╗ ██████╗ ██╗███╗   ███╗ ██████╗ ██████╗ ██╗██╗   ██╗███╗   ███╗  
  ██╔══██╗██╔══██╗██║████╗ ████║██╔═══██╗██╔══██╗██║██║   ██║████╗ ████║  
  ██████╔╝██████╔╝██║██╔████╔██║██║   ██║██║  ██║██║██║   ██║██╔████╔██║  
  ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██║   ██║██║  ██║██║██║   ██║██║╚██╔╝██║  
  ██║     ██║  ██║██║██║ ╚═╝ ██║╚██████╔╝██████╔╝██║╚██████╔╝██║ ╚═╝ ██║  
  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝  
                                                                          
                                                                          `;

  console.log("%c" + asciiArt, "color: white; background-color: brown;");

  console.log(
    `%cPrimodium ${version}`,
    "color: white; background-color: black;",
    "https://twitter.com/primodiumgame"
  );

  //expose api to window for debugging
  // @ts-ignore
  if (import.meta.env.VITE_DEV === "true") window.network = network;

  await _init(address, network);
  components.gameReady(network).set(true);
};

export const api = { init, hooks, components, camera, debug, input, game };

//expose api to window for debugging
if (import.meta.env.VITE_DEV === "true") {
  // @ts-ignore
  window.primodium = api;
  // @ts-ignore
  window.BlockType = BlockType;
}
