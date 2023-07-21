import { getDefaultProvider } from "ethers";
import { createClient } from "wagmi";

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

export default wagmiClient;
