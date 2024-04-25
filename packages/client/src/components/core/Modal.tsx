import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { KeybindActionKeys } from "@/game/lib/constants/keybinds";
import { usePrimodium } from "@/hooks/usePrimodium";
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

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
  keybind?: KeybindActionKeys;
  keybindClose?: boolean;
}

export const Modal: React.FC<ModalProps> & {
  Button: React.FC<React.ComponentProps<typeof Button>>;
  CloseButton: React.FC<React.ComponentProps<typeof Button>>;
  Content: React.FC<{ children: ReactNode; className?: string }>;
} = ({ children, title, keybind, keybindClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const primodium = usePrimodium();
  const {
    audio,
    input: { addListener },
  } = useRef(primodium.api("UI")).current;

  useEffect(() => {
    const handleEscPress = () => {
      if (!isOpen) return;
      audio.play("Sequence2", "ui");
      setIsOpen(false);
    };

    const handleOpenPress = () => {
      if (!isOpen) setIsOpen(true);
      if (isOpen && keybindClose) setIsOpen(false);
    };

    if (isOpen) {
      primodium.disableGlobalInput();
    } else {
      primodium.enableGlobalInput();
    }

    const escListener = addListener("Esc", handleEscPress);
    const openListener = keybind ? addListener(keybind, handleOpenPress) : null;

    return () => {
      escListener.dispose();
      openListener?.dispose();

      primodium.enableGlobalInput();
    };
  }, [isOpen, audio, keybind, keybindClose, addListener, primodium]);

  return <ModalContext.Provider value={{ isOpen, setIsOpen, title }}>{children}</ModalContext.Provider>;
};

Modal.Button = function ModalButton(props: React.ComponentProps<typeof Button>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <Button
      {...props}
      clickSound={props.clickSound ?? "Sequence"}
      onClick={(e) => {
        setIsOpen(true);
        props.onClick?.(e);
      }}
    />
  );
};

Modal.CloseButton = function ModalButton(props: React.ComponentProps<typeof Button>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <Button
      {...props}
      clickSound={props.clickSound ?? "Sequence"}
      onClick={(e) => {
        if (props.onClick) props.onClick(e);
        setIsOpen(false);
      }}
    />
  );
};

Modal.Content = function ModalContent({ children, className }) {
  const { isOpen, setIsOpen, title } = useContext(ModalContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const primodium = usePrimodium();
  const { audio } = primodium.api();

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      audio.play("Sequence2", "ui");
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="absolute top-0 w-screen h-screen bg-secondary/10 backdrop-blur-md flex items-center justify-center animate-in fade-in ease-in-out"
      onClick={handleClickOutside}
    >
      <div className={`max-w-screen max-h-screen space-y-2 ${className} p-5 pt-12`} ref={modalRef}>
        <Card className="w-full h-full shadow-2xl pointer-events-auto" noMotion>
          <div className="absolute top-0 -translate-y-full w-full flex justify-between items-center p-2">
            <p className="font-bold uppercase pr-2 text-accent">{title}</p>
            <Button
              onClick={() => {
                audio.play("Sequence2", "ui");
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
    </div>,
    document.getElementById("modal-root")!
  );
};
