import {
  ReactNode,
  memo,
  createContext,
  useContext,
  useState,
  FC,
} from "react";
import { Button as _Button, IconButton as _IconButton } from "./Button";
import { Card } from "./Card";

interface TabProps {
  children?: ReactNode;
  defaultIndex?: number;
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

  return <Card className={`${className}`}>{children}</Card>;
});

const Button: FC<{
  index: number;
  children: ReactNode;
}> = memo(({ index, children }) => {
  const { index: currIndex, setIndex } = useIndex();

  const selected = currIndex === index;

  return (
    <_Button
      selected={selected}
      onClick={() => setIndex(selected ? undefined : index)}
    >
      {children}
    </_Button>
  );
});

export const IconButton: FC<{
  index: number;
  text: string;
  imageUri: string;
}> = memo(({ index, text, imageUri }) => {
  const { index: currIndex, setIndex } = useIndex();

  const selected = currIndex === index;

  return (
    <_IconButton
      text={text}
      selected={selected}
      imageUri={imageUri}
      hideText={!selected}
      onClick={() => setIndex(selected ? undefined : index)}
    />
  );
});

export const Tabs: FC<TabProps> & {
  Button: typeof Button;
  IconButton: typeof IconButton;
  Pane: typeof Pane;
} = ({ children, defaultIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    defaultIndex
  );

  return (
    <IndexContext.Provider
      value={{ index: currentIndex, setIndex: setCurrentIndex }}
    >
      <div className="space-y-1">{children}</div>
    </IndexContext.Provider>
  );
};

Tabs.Button = Button;
Tabs.IconButton = IconButton;
Tabs.Pane = Pane;
