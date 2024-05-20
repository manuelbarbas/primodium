import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";

export const AlertContent: React.FC<{ message: string; onConfirm?: () => void }> = ({ message, onConfirm }) => {
  return (
    <div className="flex flex-col gap-4 text-md">
      <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />
      <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
        <FaExclamationTriangle size={24} className="text-warning" />
        {message}
      </div>

      <div className="flex justify-center w-full gap-2">
        <button
          className="btn btn-secondary btn-xs"
          onClick={() => {
            toast.dismiss("alert");
            onConfirm?.();
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => {
            toast.dismiss("alert");
          }}
          className="btn btn-primary btn-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
