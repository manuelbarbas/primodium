import PusherJS from "pusher-js";
export const client = new PusherJS(import.meta.env.PRI_PUSHER_APP_KEY ?? "", {
  wsHost: import.meta.env.PRI_PUSHER_APP_HOST ?? "",
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  cluster: "NA",
});
