import { Network } from "../../network/layer";
import { init as _init } from "../scripts";
import * as hooks from "./hooks";
import * as components from "./components";

const init = async (address: string | undefined, network: Network) => {
  //expose api to window for debugging
  // @ts-ignore
  if (import.meta.env.VITE_DEV === "true") window.mudNetwork = network;

  await _init(address, network);
};

export const api = { init, hooks, components };

//expose api to window for debugging
// @ts-ignore
if (import.meta.env.VITE_DEV === "true") window.primodium = api;
