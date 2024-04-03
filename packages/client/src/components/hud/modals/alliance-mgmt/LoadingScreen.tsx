import { SecondaryCard } from "src/components/core/Card";
import { Loader } from "src/components/core/Loader";
import { Navigator } from "src/components/core/Navigator";

export const LoadingScreen = () => {
  return (
    <Navigator.Screen
      title="loading"
      className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto"
    >
      <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
        <Loader />
        LOADING ALLIANCE DATA
      </SecondaryCard>
    </Navigator.Screen>
  );
};
