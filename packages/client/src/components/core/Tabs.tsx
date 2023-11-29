import { FC, ReactNode, createContext, memo, useContext, useEffect, useRef, useState } from "react";
import { Button as _Button, IconButton as _IconButton } from "./Button";
import { Card } from "./Card";

interface TabProps {
  children?: ReactNode;
  defaultIndex?: number;
  className?: string;
  onChange?: () => void;
}

interface IndexContextValue {
  index: number | undefined;
  setIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const IndexContext = createContext<IndexContextValue | undefined>(undefined);

const useIndex = (): IndexContextValue => {
  const context = useContext(IndexContext);
  if (!context) {
    throw new Error("useIndex must be used within Tabs");
  }
  return context;
};

const Pane: FC<{
  index?: number;
  className?: string;
  children: ReactNode;
}> = memo(({ index, children, className }) => {
  const { index: currIndex } = useIndex();

  if (index === undefined || currIndex !== index) {
    return null;
  }

  return <Card className={`overflow-y-auto scrollbar ${className} `}>{children}</Card>;
});

const Button: FC<{
  index: number;
  children: ReactNode;
  className?: string;
  togglable?: boolean;
}> = memo(({ index, children, className, togglable = false }) => {
  const { index: currIndex, setIndex } = useIndex();

  const selected = currIndex === index;

  return (
    <_Button
      selected={selected}
      className={className}
      onClick={() => setIndex(selected && togglable ? undefined : index)}
    >
      {children}
    </_Button>
  );
});

export const IconButton: FC<{
  index: number;
  text: string;
  imageUri: string;
  hideText?: boolean;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  tooltipText?: string;
  onClick?: () => void;
}> = memo(({ index, text, imageUri, hideText = false, tooltipDirection = "right", tooltipText, onClick }) => {
  const { index: currIndex, setIndex } = useIndex();

  const selected = currIndex === index;

  return (
    <_IconButton
      text={text}
      selected={selected}
      imageUri={imageUri}
      hideText={hideText || !selected}
      onClick={() => {
        setIndex(selected ? undefined : index);
        if (onClick) onClick();
      }}
      tooltipDirection={tooltipDirection}
      tooltipText={tooltipText}
    />
  );
});

export const Tabs: FC<TabProps> & {
  Button: typeof Button;
  IconButton: typeof IconButton;
  Pane: typeof Pane;
} = ({ children, defaultIndex = 0, className, onChange }) => {
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(defaultIndex);

  // Ref to check if it's the first render
  const initialRender = useRef(true);

  useEffect(() => {
    // If it's the first render, skip calling onChange
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (onChange) onChange();
  }, [currentIndex]);

  return (
    <IndexContext.Provider value={{ index: currentIndex, setIndex: setCurrentIndex }}>
      <div className={`gap-1 ${className}`}>{children}</div>
    </IndexContext.Provider>
  );
};

Tabs.Button = Button;
Tabs.IconButton = IconButton;
Tabs.Pane = Pane;
