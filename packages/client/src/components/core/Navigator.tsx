import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useCallback,
  useLayoutEffect,
} from "react";
import { Button } from "./Button";
import { Card, SecondaryCard } from "./Card";

interface NavigationContextValue {
  navigateTo: (screenTitle: string, replace?: boolean) => void;
  goBack: () => void;
  history: string[];
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

export const Navigator: FC<{ initialScreen?: string; children?: ReactNode }> & {
  Screen: typeof Screen;
  NavButton: typeof NavButton;
  BackButton: typeof BackButton;
  Breadcrumbs: typeof Breadcrumbs;
} = ({ children, initialScreen = "Home" }) => {
  const [history, setHistory] = useState<string[]>([initialScreen]);

  // Reset history when initialScreen prop changes
  useLayoutEffect(() => {
    setHistory([initialScreen]);
  }, [initialScreen]);

  const navigateTo = useCallback(
    (screenTitle: string, replace = false) => {
      if (replace) {
        const index = history.indexOf(screenTitle);
        if (index !== -1) {
          setHistory((prev) => prev.slice(0, index + 1));
        } else {
          setHistory((prev) => [...prev, screenTitle]); // fallback
        }
      } else {
        setHistory((prev) => [...prev, screenTitle]);
      }
    },
    [history]
  );

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  }, []);

  return (
    <NavigationContext.Provider value={{ navigateTo, goBack, history }}>
      <Card className={``}>{children}</Card>
    </NavigationContext.Provider>
  );
};

const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("Navigation components must be used within Navigator");
  }
  return context;
};

const Screen: FC<{
  title: string;
  className?: string;
  children?: ReactNode;
}> = ({ title, className, children }) => {
  const { history } = useNavigation();
  if (history[history.length - 1] !== title) return null;
  return <div className={className}>{children}</div>;
};

const NavButton: FC<{ to: string; children?: ReactNode }> = ({
  to,
  children,
}) => {
  const { navigateTo } = useNavigation();
  return <Button onClick={() => navigateTo(to, true)}>{children}</Button>;
};

const BackButton: FC<{ children?: ReactNode }> = ({ children }) => {
  const { goBack, history } = useNavigation();
  return (
    <Button disabled={history.length <= 1} onClick={goBack}>
      {children || "Back"}
    </Button>
  );
};

const Breadcrumbs: FC<{ children?: ReactNode }> = () => {
  const { history, navigateTo } = useNavigation();
  return (
    <SecondaryCard className="w-fit text-sm breadcrumbs pointer-events-auto">
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <button onClick={() => navigateTo(item, true)}>{item}</button>
          </li>
        ))}
      </ul>
    </SecondaryCard>
  );
};

Navigator.Screen = Screen;
Navigator.NavButton = NavButton;
Navigator.BackButton = BackButton;
Navigator.Breadcrumbs = Breadcrumbs;
