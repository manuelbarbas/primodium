import { AlertContent } from "@/components/shared/AlertContent";
import { toast } from "react-toastify";

export const alert = async (message: string, onConfirm?: () => void) => {
  toast(() => <AlertContent message={message} onConfirm={onConfirm} />, {
    position: "top-center",
    toastId: "alert",
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    closeButton: false,
    hideProgressBar: true,
  });
};
