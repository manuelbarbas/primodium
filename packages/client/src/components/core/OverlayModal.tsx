import { primodium } from "@game/api";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";
import { Button } from "./Button";

interface ModalContextType {
  isOpen: boolean;
  title?: string;
  setIsOpen: (isOpen: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  title: undefined,
  setIsOpen: () => false,
});

interface ModalProps {
  children: ReactNode;
  title?: string;
}

export const OverlayModal: React.FC<ModalProps> & {
  Button: React.FC<{ children: ReactNode }>;
  Content: React.FC<{ children: ReactNode }>;
} = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { enableInput, disableInput } = primodium.api().input;

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      disableInput();
    } else {
      enableInput();
    }

    window.addEventListener("keydown", handleEscPress);
    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [isOpen, disableInput, enableInput]);

  return <ModalContext.Provider value={{ isOpen, setIsOpen, title }}>{children}</ModalContext.Provider>;
};

OverlayModal.Button = function ModalButton({ children }) {
  const { setIsOpen } = useContext(ModalContext);
  return <Button onClick={() => setIsOpen(true)}>{children}</Button>;
};

OverlayModal.Content = function ModalContent({ children }) {
  const { isOpen, setIsOpen, title } = useContext(ModalContext);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="h-screen w-screen absolute bg-primary top-0 z-50 flex flex-col font-mono">
      <div className="w-full bg-base-100 flex justify-between p-2 items-center">
        <p>{title}</p>
        <button className="btn btn-ghost btn-sm float-right" onClick={() => setIsOpen(false)}>
          <FaTimes />
        </button>
      </div>
      <div className="grow relative">{children}</div>
    </div>,
    document.body
  );
};
