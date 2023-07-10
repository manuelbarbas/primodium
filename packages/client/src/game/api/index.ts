import { Network } from "../../network/layer";
import { init as _init } from "../lib/scripts";
import * as hooks from "./hooks";
import * as components from "./components";
import * as camera from "./camera";
import * as game from "./game";
import * as input from "./input";

const init = async (
  address: string,
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
  if (import.meta.env.VITE_DEV === "true") window.mudNetwork = network;

  await _init(address, network);
};

export const api = { init, hooks, components, camera, game, input };

//expose api to window for debugging
// @ts-ignore
if (import.meta.env.VITE_DEV === "true") window.primodium = api;
