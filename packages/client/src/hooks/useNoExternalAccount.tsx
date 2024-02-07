import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// Define the shape of the context
interface NoExternalAccountContextType {
  noExternalAccount: boolean;
  setNoExternalAccount: (value: boolean) => void;
  removeNoExternalAccount: () => void;
}

// Create a context with a default dummy implementation to ensure type-safety
const NoExternalAccountContext = createContext<NoExternalAccountContextType>({
  noExternalAccount: false,
  setNoExternalAccount: () => {},
  removeNoExternalAccount: () => {},
});

type Props = {
  children: ReactNode;
};

export const NoExternalAccountContextProvider = ({ children }: Props) => {
  const [noExternalAccount, setNoExternalAccountState] = useState<boolean>(
    localStorage.getItem("noExternalAccount") === "true"
  );

  useEffect(() => {
    console.log("noExternalAccount", noExternalAccount);
  }, [noExternalAccount]);

  const setNoExternalAccount = (value: boolean) => {
    localStorage.setItem("noExternalAccount", value.toString());
    setNoExternalAccountState(value);
  };

  const removeNoExternalAccount = () => {
    localStorage.removeItem("noExternalAccount");
    setNoExternalAccountState(false);
  };

  return (
    <NoExternalAccountContext.Provider value={{ noExternalAccount, setNoExternalAccount, removeNoExternalAccount }}>
      {children}
    </NoExternalAccountContext.Provider>
  );
};

export const useNoExternalAccount = () => {
  const context = useContext(NoExternalAccountContext);
  if (context === undefined) {
    throw new Error("useNoExternalAccount must be used within a NoExternalAccountContextProvider");
  }
  return context;
};
