import { ReactNode, memo, createContext, useContext, useState, FC, useEffect, useRef } from "react";
import { Button as _Button } from "./Button";
import { SecondaryCard } from "./Card";

interface TabProps {
  children?: ReactNode;
  defaultIndex?: number;
  className?: string;
  onChange?: () => void;
  persistIndexKey?: string;
}

interface IndexContextValue {
  index: number | undefined;
  setIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  persistIndexKey?: string;
}

//TODO: Works for now. Move into a simple localStorage hook down the line.
const persistedIndexMap = new Map<string, number | undefined>();
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
    <SecondaryCard className={`overflow-y-auto scrollbar ${className}`}>{children}</SecondaryCard>
  );
});

const Button: FC<React.ComponentProps<typeof _Button> & { index: number; togglable?: boolean }> = memo(
  ({ togglable = false, index, ...props }) => {
    const { index: currIndex, setIndex, persistIndexKey } = useIndex();
    const selected = currIndex === index;

    return (
      <_Button
        {...props}
        selected={selected}
        onClick={(e) => {
          const _index = selected && togglable ? undefined : index;
          setIndex(_index);
          if (props.onClick) props.onClick(e);
          if (persistIndexKey) persistedIndexMap.set(persistIndexKey, _index);
        }}
      />
    );
  }
);

export const Tabs: FC<TabProps> & {
  Button: typeof Button;
  Pane: typeof Pane;
} = ({ children, defaultIndex = 0, className, onChange, persistIndexKey }) => {
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    persistedIndexMap.has(persistIndexKey ?? "") ? persistedIndexMap.get(persistIndexKey ?? "") : defaultIndex
  );

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
    <IndexContext.Provider value={{ index: currentIndex, setIndex: setCurrentIndex, persistIndexKey }}>
      <div className={`${className}`}>{children}</div>
    </IndexContext.Provider>
  );
};

Tabs.Button = Button;
Tabs.Pane = Pane;
