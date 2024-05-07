import { createAudioApi } from "@/game/api/audio";
import { Scene } from "engine/types";
import { toast, ToastContent, ToastOptions } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning";
export const createNotificationApi = (scene: Scene) => {
  const notify = (type: ToastType, content: ToastContent, options?: ToastOptions) => {
    const volume = 0.2;
    const audio = createAudioApi(scene);
    if (type === "success") {
      audio.play("Confirm4", "ui", {
        volume,
        detune: 400,
      });
      toast.success(content, options);
    } else if (type === "error") {
      toast.error(content, options);
      audio.play("Confirm4", "ui", {
        volume,
        detune: -400,
      });
    } else if (type === "info") {
      toast.info(content, options);
      audio.play("Confirm4", "ui", {
        volume,
      });
    } else if (type === "warning") {
      toast.warning(content, options);
      audio.play("Confirm4", "ui", {
        volume,
        detune: -200,
      });
    }
  };

  return notify;
};
