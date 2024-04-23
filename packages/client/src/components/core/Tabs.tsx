import { ReactNode, memo, createContext, useContext, useState, FC, useEffect, useRef } from "react";
import { Button as _Button } from "./Button";
import { SecondaryCard } from "./Card";

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

  return fragment ? (
    <>{children}</>
  ) : (
    <SecondaryCard className={`overflow-y-auto scrollbar ${className} t`}>{children}</SecondaryCard>
  );
});

const Button: FC<React.ComponentProps<typeof _Button> & { index: number; togglable?: boolean }> = memo(
  ({ togglable = false, index, ...props }) => {
    const { index: currIndex, setIndex } = useIndex();
    const selected = currIndex === index;

    return (
      <_Button
        {...props}
        selected={selected}
        onClick={(e) => {
          setIndex(selected && togglable ? undefined : index);
          if (props.onClick) props.onClick(e);
        }}
      />
    );
  }
);

export const Tabs: FC<TabProps> & {
  Button: typeof Button;
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
      <div className={`${className}`}>{children}</div>
    </IndexContext.Provider>
  );
};

Tabs.Button = Button;
Tabs.Pane = Pane;
