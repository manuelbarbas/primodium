import { ReactNode, memo, createContext, useContext, useState, FC, useEffect, useRef } from "react";
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
  fragment?: boolean;
}> = memo(({ index, children, className, fragment = false }) => {
  const { index: currIndex } = useIndex();

  if (index === undefined || currIndex !== index) {
    return null;
  }

  return fragment ? <>{children}</> : <Card className={`overflow-y-auto scrollbar ${className} `}>{children}</Card>;
});

const Button: FC<React.ComponentProps<typeof _Button> & { index: number; togglable?: boolean; showActive?: boolean }> =
  memo((props) => {
    const { index: currIndex, setIndex } = useIndex();
    const { togglable = false, index, showActive = false } = props;

    const selected = currIndex === index;

    return (
      <_Button
        {...props}
        selected={selected && showActive}
        onClick={(e) => {
          setIndex(selected && togglable ? undefined : index);
          if (props.onClick) props.onClick(e);
        }}
      />
    );
  });

export const IconButton: React.FC<React.ComponentProps<typeof _IconButton> & { index: number }> = memo((props) => {
  const { index: currIndex, setIndex } = useIndex();
  const { index } = props;

  const selected = currIndex === index;

  return (
    <_IconButton
      {...props}
      selected={selected}
      onClick={() => {
        setIndex(selected ? undefined : index);
        if (props.onClick) props.onClick();
      }}
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
  }, [currentIndex, onChange]);

  return (
    <IndexContext.Provider value={{ index: currentIndex, setIndex: setCurrentIndex }}>
      <div className={`gap-1 ${className}`}>{children}</div>
    </IndexContext.Provider>
  );
};

Tabs.Button = Button;
Tabs.IconButton = IconButton;
Tabs.Pane = Pane;
