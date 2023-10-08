import { useEffect, useState } from "react";

export const getNow = () => {
  return BigInt(Date.now() / 1000);
};

export const useNow = () => {
  const [now, setNow] = useState(getNow());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNow());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
};
