import React, { useEffect, useRef } from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (show && event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscPress);
    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [onClose, show]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-60 p-10 text-gray-800 font-mono"
          onClick={handleClickOutside}
        >
          <div
            ref={modalRef}
            className="bg-slate-900/90 max-w-6xl border-4 border-cyan-400 ring ring-cyan-700 max-h-full shadow-2xl flex flex-col rounded-xl overflow-hidden"
          >
            <div className="bg-gray-800 flex justify-between items-center px-2 py-2 w-full text-sm bg-gradient-to-b from-transparent to-slate-900/20">
              <div className="flex items-center text-white">&nbsp;{title}</div>
              <div className="flex space-x-1">
                <button
                  className="w-3 h-3 bg-red-400 rounded-full"
                  onClick={() => onClose()}
                />
              </div>
            </div>

            <div className="p-6 w-full overflow-y-auto scrollbar flex-grow">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
