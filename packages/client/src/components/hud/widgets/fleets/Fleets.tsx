import { ComponentProps, FC, Suspense, createContext, lazy, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "src/components/core/Button";

const fleetsPanes = {
  fleets: lazy(() => import("./FleetsPane")),
  manageFleet: lazy(() => import("./ManageFleet")),
};

type NavButtonProps<J extends View = View> = ComponentProps<typeof Button> & {
  goto: J;
} & Props<J>;

type View = keyof typeof fleetsPanes;
type Props<J extends View = View> = ComponentProps<(typeof fleetsPanes)[J]>;

const FleetNavContext = createContext<{
  navigateTo: <J extends View>(view: J, props?: Props<J>) => void;
  goBack: () => void;
  NavButton: <J extends View>(props: NavButtonProps<J>) => ReturnType<FC>;
  BackButton: typeof Button;
}>({
  navigateTo: () => {}, // Initial dummy function
  goBack: () => {},
  NavButton: () => <></>,
  BackButton: () => <></>,
});

export const useFleetNav = () => {
  const context = useContext(FleetNavContext);
  if (!context) {
    throw new Error("Fleet nav components must be used within fleet navigator");
  }
  return context;
};

export const Fleets = ({ initialState = "fleets", ...initialProps }: { initialState?: View } & Props) => {
  const [history, setHistory] = useState<{ view: View; props: Props }[]>([
    { view: initialState, props: initialProps ?? {} },
  ]);

  const { Component, props } = useMemo(
    () => ({
      Component: fleetsPanes[history[history.length - 1].view],
      props: history[history.length - 1].props,
    }),
    [history]
  );
  const navigateTo = useCallback((view: View, props = {}) => {
    const newViewState = { view, props };
    setHistory((prevHistory) => [...prevHistory, newViewState]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  }, []);

  const NavButton = useCallback(
    ({ goto, className, children, disabled, onClick, tooltip, tooltipDirection = "top", ...props }: NavButtonProps) => {
      return (
        <Button
          tooltip={tooltip}
          tooltipDirection={tooltipDirection}
          className={className}
          onClick={() => {
            if (onClick) onClick();
            navigateTo(goto, props);
          }}
          disabled={disabled || goto === history[history.length - 1].view}
        >
          {children}
        </Button>
      );
    },
    [history, navigateTo]
  );

  const BackButton = useCallback(
    ({ children, onClick, className, disabled = false }: ComponentProps<typeof Button>) => {
      if (history.length <= 1) return <></>;

      return (
        <Button
          disabled={history.length <= 1 || disabled}
          onClick={(e) => {
            if (onClick) onClick(e);
            goBack();
          }}
          className={`${className} btn-sm border-secondary`}
        >
          {children || "Back"}
        </Button>
      );
    },
    [goBack, history.length]
  );

  return (
    <FleetNavContext.Provider value={{ navigateTo, NavButton, BackButton, goBack }}>
      <Suspense fallback="Loading...">
        <Component {...props} />
      </Suspense>
    </FleetNavContext.Provider>
  );
};
