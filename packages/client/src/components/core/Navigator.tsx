import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useCallback,
} from "react";
import { Button } from "./Button";

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
      {children}
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

const Screen: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children,
}) => {
  const { history } = useNavigation();
  if (history[history.length - 1] !== title) return null;
  return <>{children}</>;
};

const NavButton: FC<{ to: string; children?: ReactNode }> = ({
  to,
  children,
}) => {
  const { navigateTo } = useNavigation();
  return <button onClick={() => navigateTo(to)}>{children}</button>;
};

const BackButton: FC<{ children?: ReactNode }> = ({ children }) => {
  const { goBack } = useNavigation();
  return <Button onClick={goBack}>{children || "Back"}</Button>;
};

const Breadcrumbs: FC<{ children?: ReactNode }> = () => {
  const { history, navigateTo } = useNavigation();
  return (
    <div className="text-sm breadcrumbs">
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <button onClick={() => navigateTo(item, true)}>{item}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

Navigator.Screen = Screen;
Navigator.NavButton = NavButton;
Navigator.BackButton = BackButton;
Navigator.Breadcrumbs = Breadcrumbs;
