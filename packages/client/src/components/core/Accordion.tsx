import { createContext, useContext, useState, ReactNode, FC } from 'react';

interface AccordionContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

const useAccordion = (): AccordionContextValue => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return context;
};

const AccordionItem: FC<{ index: number, children?: ReactNode }> = ({ index, children }) => {
  const { activeIndex, setActiveIndex } = useAccordion();
  const isActive = activeIndex === index;
  const handleToggle = () => setActiveIndex(isActive ? -1 : index);

  return (
    <div className="collapse collapse-arrow join-item border border-base-300">
      <input type="radio" name="my-accordion" checked={isActive} onChange={handleToggle} />
      {children}
    </div>
  );
};

const AccordionTitle: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className="collapse-title text-xl font-medium">
    {children}
  </div>
);

const AccordionContent: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className="collapse-content">
    {children}
  </div>
);

const Accordion: FC<{ children?: ReactNode }> & {
  Item: typeof AccordionItem;
  Title: typeof AccordionTitle;
  Content: typeof AccordionContent;
} = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(-1);  // -1 indicates no active accordion item

  return (
    <AccordionContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="join join-vertical w-full">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.Item = AccordionItem;
Accordion.Title = AccordionTitle;
Accordion.Content = AccordionContent;
