import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface Widget {
  visible: boolean;
  open: () => void;
  close: () => void;
  pinned: boolean;
  minimized: boolean;
  name: string;
  image: string;
}

interface WidgetContextType {
  widgets: Widget[];
  setWidget: (widget: Widget) => void;
  removeWidget: (widgetName: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const setWidget = useCallback((widget: Widget) => {
    setWidgets((prevWidgets) => {
      const widgetExists = prevWidgets.some((w) => w.name === widget.name);

      if (widgetExists) {
        return prevWidgets.map((w) => (w.name === widget.name ? widget : w));
      } else {
        return [...prevWidgets, widget];
      }
    });
  }, []);

  const removeWidget = useCallback((widgetName: string) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.name !== widgetName));
  }, []);

  return <WidgetContext.Provider value={{ widgets, setWidget, removeWidget }}>{children}</WidgetContext.Provider>;
};

export const useWidget = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return context;
};
