import React, { createContext, useState, ReactNode } from "react";

interface IndexContextProps {
  indices: { [key: string]: number };
  updateIndices: (id: string) => void;
  registerChild: (id: string) => void;
}

export const IndexContext = createContext<IndexContextProps | undefined>(
  undefined
);

export const IndexProvider: React.FC<{ children: ReactNode | ReactNode[] }> = ({
  children,
}) => {
  const [indices, setIndices] = useState<{ [key: string]: number }>({});

  const registerChild = (id: string) => {
    setIndices((prevIndices) => {
      return { ...prevIndices, [id]: parseInt(id) };
    });
  };

  const updateIndices = (removedId: string) => {
    setIndices((prevIndices) => {
      const newIndices = Object.fromEntries(
        Object.entries(prevIndices)
          .filter(([id]) => id !== removedId)
          .sort(([idA], [idB]) => parseInt(idA) - parseInt(idB))
          .map(([id], index) => [id, index])
      );
      return newIndices;
    });
  };

  return (
    <IndexContext.Provider value={{ indices, registerChild, updateIndices }}>
      {children}
    </IndexContext.Provider>
  );
};
