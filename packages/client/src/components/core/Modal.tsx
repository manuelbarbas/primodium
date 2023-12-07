import React, { useState, createContext, useContext, ReactNode, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Button, IconButton } from "./Button";
import { primodium } from "@game/api";
import { FaTimes } from "react-icons/fa";
import { Card } from "./Card";
import { AudioKeys } from "@game/constants";

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

export const Modal: React.FC<ModalProps> & {
  Button: React.FC<{ children: ReactNode; className?: string }>;
  Content: React.FC<{ children: ReactNode; className?: string }>;
  IconButton: React.FC<React.ComponentProps<typeof IconButton>>;
} = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { enableInput, disableInput } = primodium.api().input;
  const { audio } = primodium.api();

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        audio.play(AudioKeys.Sequence2, "ui");
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
  }, [isOpen, disableInput, enableInput, audio]);

  return <ModalContext.Provider value={{ isOpen, setIsOpen, title }}>{children}</ModalContext.Provider>;
};

Modal.Button = function ModalButton({ children, className }) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <Button
      className={className}
      clickSound={AudioKeys.Sequence}
      onClick={() => {
        setIsOpen(true);
      }}
    >
      {children}
    </Button>
  );
};

Modal.IconButton = function ModalButton(props: React.ComponentProps<typeof IconButton>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <IconButton
      {...props}
      onClick={() => {
        setIsOpen(true);
        if (props.onClick) props.onClick();
      }}
    />
  );
};

Modal.Content = function ModalContent({ children, className }) {
  const { isOpen, setIsOpen, title } = useContext(ModalContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const { audio } = primodium.api();

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      audio.play(AudioKeys.Sequence2, "ui");
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="top-0 w-screen h-screen absolute z-50 bg-neutral/75 backdrop-blur-sm font-mono flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className={`relative max-w-screen max-h-screen ${className} p-5 pt-12`}>
        <div className="space-y-2 w-full h-full" ref={modalRef}>
          <Card className="relative w-full h-full">
            <div className="absolute top-0 -translate-y-full w-full flex justify-between items-center p-2">
              <p className="font-bold uppercase pr-2 text-accent">{title}</p>
              <Button
                onClick={() => {
                  audio.play(AudioKeys.Sequence2, "ui");
                  setIsOpen(false);
                }}
                className="btn-sm ghost"
              >
                <FaTimes />
              </Button>
            </div>
            {children}
          </Card>
        </div>
      </div>
    </div>,
    document.body
  );
};
