import { FaTimes } from "react-icons/fa";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";

export const ErrorScreen = () => {
  return (
    <Navigator.Screen
      title="error"
      className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto"
    >
      <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50 text-error">
        <FaTimes />
        ERROR SYNCING ALLIANCE DATA
      </SecondaryCard>
    </Navigator.Screen>
  );
};
