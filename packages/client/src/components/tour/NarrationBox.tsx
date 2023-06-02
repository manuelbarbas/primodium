import { useEffect, useRef } from "react";
import { useTourStore } from "../../store/TourStore";

const NarrationBox = () => {
  const [currentStep] = useTourStore((state) => [state.currentStep]);
  const narration = useRef<JSX.Element | undefined>(undefined);

  useEffect(() => {
    if (!currentStep?.narration) return;

    narration.current = currentStep.narration;
  }, [currentStep]);

  if (!currentStep?.narration && !narration.current) return null;

  return (
    <div className="bg-gray-700 text-white p-5 font-mono rounded-2xl mt-4 w-72 shadow-2xl">
      <div className="flex space-x-2">
        <img className="pixel-images" src="/img/tutorial/langeman.png" />
        <div>
          <div className="text-xs font-bold opacity-50">
            INCOMING TRANSMISSION
          </div>
          <div className="text-xl font-bold">Col. Langeman</div>
        </div>
      </div>
      <br />
      <div className="text-sm">
        {currentStep?.narration ?? narration.current}
      </div>
    </div>
  );
};

export default NarrationBox;
