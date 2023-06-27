import { Network } from "../../network/layer";
import { init as _init } from "../scripts";

const init = async (network: Network) => {
  await _init(network);
};

export const api = { init };
