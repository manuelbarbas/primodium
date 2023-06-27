import { Network } from "../../network/layer";
import { init as _init } from "../scripts";
import * as hooks from "./hooks";

const init = async (network: Network) => {
  await _init(network);
};

export const api = { init, hooks };
