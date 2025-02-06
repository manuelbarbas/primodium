import { toast } from "react-toastify";

import { PrimodiumGame } from "@primodiumxyz/game";
import { AlertContent } from "@/components/shared/AlertContent";

export const alert = async (message: string, onConfirm?: () => void, game?: PrimodiumGame) => {
  toast(() => <AlertContent message={message} onConfirm={onConfirm} />, {
    position: "top-center",
    toastId: "alert",
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    closeButton: false,
    hideProgressBar: true,
  });

  game?.ROOT.audio.play("Confirm5", "ui");
};
