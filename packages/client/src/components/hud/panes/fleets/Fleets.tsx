import { ComponentProps, FC, Suspense, createContext, lazy, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
const FleetsPane = lazy(() => import("./FleetsPane"));
const CreateFleet = lazy(() => import("../../modals/fleets/CreateFleet"));
const ManageFleet = lazy(() => import("./ManageFleet"));

const fleetsPanes = {
  fleets: FleetsPane,
  createFleet: CreateFleet,
  manageFleet: ManageFleet,
};

type NavButtonProps<J extends View = View> = ComponentProps<typeof Button> & {
  to: J;
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
  const navigateTo = (view: View, props = {}) => {
    const newViewState = { view, props };
    setHistory((prevHistory) => [...prevHistory, newViewState]);
  };

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  }, []);

  function NavButton({
    to,
    className,
    children,
    disabled,
    onClick,
    tooltip,
    tooltipDirection = "top",
    ...props
  }: NavButtonProps) {
    return (
      <Button
        tooltip={tooltip}
        tooltipDirection={tooltipDirection}
        className={className}
        onClick={() => {
          if (onClick) onClick();
          navigateTo(to, props);
        }}
        disabled={disabled || to === history[history.length - 1].view}
      >
        {children}
      </Button>
    );
  }

  function BackButton({ children, onClick, className, disabled = false }: ComponentProps<typeof Button>) {
    if (history.length <= 1) return <></>;

    return (
      <Button
        disabled={history.length <= 1 || disabled}
        onClick={() => {
          if (onClick) onClick();
          goBack();
        }}
        className={`${className} btn-sm border-secondary`}
      >
        {children || "Back"}
      </Button>
    );
  }

  return (
    <FleetNavContext.Provider value={{ navigateTo, NavButton, BackButton, goBack }}>
      <Suspense fallback="Loading...">
        <Component {...props} />
      </Suspense>
    </FleetNavContext.Provider>
  );
};
