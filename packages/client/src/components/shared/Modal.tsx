import React, { useRef } from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-60 p-10 text-gray-800 font-mono"
          onClick={handleClickOutside}
        >
          <div
            ref={modalRef}
            className="bg-slate-900/90 w-full max-w-6xl border-4 border-b-8 border-cyan-800 max-h-full shadow-2xl flex flex-col"
          >
            <div className="bg-gray-800 flex justify-between items-center px-2 w-full text-sm">
              <div className="flex items-center text-pink-50">
                &nbsp;{title}
              </div>
              <div className="flex space-x-1">
                <button
                  className="w-3 h-3 bg-red-400"
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
