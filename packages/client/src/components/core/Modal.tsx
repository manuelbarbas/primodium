import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";
import { usePrimodium } from "src/hooks/usePrimodium";
import { Button, IconButton } from "./Button";
import { Card } from "./Card";

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
  keybind?: KeybindActions;
  keybindClose?: boolean;
}

export const Modal: React.FC<ModalProps> & {
  Button: React.FC<React.ComponentProps<typeof Button>>;
  CloseButton: React.FC<React.ComponentProps<typeof Button>>;
  Content: React.FC<{ children: ReactNode; className?: string }>;
  IconButton: React.FC<React.ComponentProps<typeof IconButton>>;
} = ({ children, title, keybind, keybindClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const primodium = usePrimodium();
  const {
    audio,
    input: { disableInput, enableInput, addListener },
  } = useRef(primodium.api(Scenes.UI)).current;

  useEffect(() => {
    const handleEscPress = () => {
      if (!isOpen) return;
      audio.play(AudioKeys.Sequence2, "ui");
      setIsOpen(false);
    };

    const handleOpenPress = () => {
      if (!isOpen) setIsOpen(true);
      if (isOpen && keybindClose) setIsOpen(false);
    };

    if (isOpen) {
      disableInput();
    } else {
      enableInput();
    }

    const escListener = addListener(KeybindActions.Esc, handleEscPress);
    const openListener = keybind ? addListener(keybind, handleOpenPress) : null;

    return () => {
      escListener.dispose();
      openListener?.dispose();

      enableInput();
    };
  }, [isOpen, disableInput, enableInput, audio, keybind, keybindClose, addListener]);

  return <ModalContext.Provider value={{ isOpen, setIsOpen, title }}>{children}</ModalContext.Provider>;
};

Modal.Button = function ModalButton(props: React.ComponentProps<typeof Button>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <Button
      {...props}
      clickSound={props.clickSound ?? AudioKeys.Sequence}
      onClick={() => {
        if (props.onClick) props.onClick();
        setIsOpen(true);
      }}
    />
  );
};

Modal.CloseButton = function ModalButton(props: React.ComponentProps<typeof Button>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <Button
      {...props}
      clickSound={props.clickSound ?? AudioKeys.Sequence}
      onClick={() => {
        if (props.onClick) props.onClick();
        setIsOpen(false);
      }}
    />
  );
};

Modal.IconButton = function ModalIconButton(props: React.ComponentProps<typeof IconButton>) {
  const { setIsOpen } = useContext(ModalContext);

  return (
    <IconButton
      {...props}
      onClick={() => {
        if (props.onClick) props.onClick();
        setIsOpen(true);
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
      audio.play(AudioKeys.Sequence2, "ui");
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="top-0 w-screen h-screen absolute z-50 bg-neutral/25 backdrop-blur-md flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className={`max-w-screen max-h-screen space-y-2 ${className} p-5 pt-12`} ref={modalRef}>
        <Card className="relative w-full h-full block">
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
    </div>,
    document.getElementById("modal-root")!
  );
};
