import { createContext, ReactNode, useContext, useState } from "react";

interface TransactionLoadingContextInterface {
  transactionLoading: boolean;
  setTransactionLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TransactionLoadingContext =
  createContext<TransactionLoadingContextInterface>({
    transactionLoading: false,
    setTransactionLoading: () => {},
  });

const TransactionLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [transactionLoading, setTransactionLoading] = useState(false);

  return (
    <TransactionLoadingContext.Provider
      value={{
        transactionLoading,
        setTransactionLoading,
      }}
    >
      {children}
    </TransactionLoadingContext.Provider>
  );
};

export default TransactionLoadingProvider;

export function useTransactionLoading() {
  return useContext(TransactionLoadingContext);
}
