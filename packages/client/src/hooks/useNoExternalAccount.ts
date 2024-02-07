import { useState } from "react";

export const useNoExternalAccount = () => {
  const [noExternalAccount, set] = useState<boolean>(localStorage.getItem("noExternalAccount") === "true");

  const setNoExternalAccount = (value: boolean) => {
    localStorage.setItem("noExternalAccount", value.toString());
    set(value);
  };

  return { noExternalAccount, setNoExternalAccount };
};
