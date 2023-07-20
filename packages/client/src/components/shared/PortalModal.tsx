import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const PortalModal: React.FC<ModalProps> = ({
  show,
  onClose,
  children,
  title,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [el] = useState(document.createElement("div"));

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (show && event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscPress);
    document.body.appendChild(el);
    return () => {
      window.removeEventListener("keydown", handleEscPress);
      document.body.removeChild(el);
    };
  }, [el, onClose, show]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <>
      {show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-60 p-10 text-white font-mono"
          onClick={handleClickOutside}
        >
          <div
            ref={modalRef}
            className="bg-slate-900/90 max-w-6xl border-4 border-b-8 border-cyan-600 max-h-full shadow-2xl flex flex-col"
          >
            <div className="bg-gray-800 flex justify-between items-center px-2 w-full text-sm">
              <div className="flex items-center text-pink-50">
                &nbsp;{title}
              </div>
              <div className="flex space-x-1">
                <button className="w-3 h-3 bg-red-400" onClick={onClose} />
              </div>
            </div>

            <div className="p-6 w-full overflow-y-auto scrollbar flex-grow">
              {children}
            </div>
          </div>
        </div>
      )}
    </>,
    el
  );
};

export default PortalModal;
