import { KeybindActions } from "src/game/lib/mappings";
import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface Widget {
  visible: boolean;
  open: () => void;
  close: () => void;
  reset: () => void;
  pinned: boolean;
  minimized: boolean;
  name: string;
  image: string;
  active: boolean;
  hotkey?: KeybindActions;
}

interface WidgetContextType {
  widgets: Widget[];
  setWidget: (widget: Widget) => void;
  updateWidget: (name: string, update: Partial<Widget>) => void;
  removeWidget: (widgetName: string) => void;
  useWidget: (name: string) => Widget | undefined;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const setWidget = useCallback(
    (widget: Widget) => {
      const widgetExists = widgets.some((w) => w.name === widget.name);
      if (widgetExists) return;
      setWidgets((prevWidgets) => [...prevWidgets, widget]);
    },
    [widgets]
  );

  const updateWidget = useCallback(
    (name: string, update: Partial<Widget>) => {
      setWidgets((prevWidgets) => prevWidgets.map((w) => (w.name === name ? { ...w, ...update } : w)));
    },
    [setWidgets]
  );

  const removeWidget = useCallback((widgetName: string) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.name !== widgetName));
  }, []);

  //listen for changes on a specific widget
  const useWidget = (name: string) => {
    const { widgets } = useWidgets();
    const widget = useMemo(() => widgets.find((w) => w.name === name), [widgets, name]);

    return widget;
  };

  return (
    <WidgetContext.Provider value={{ widgets, setWidget, updateWidget, removeWidget, useWidget }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return context;
};
