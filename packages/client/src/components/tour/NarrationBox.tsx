import { useRef } from "react";
// import ReactDOMServer from "react-dom/server";
// import Typewriter from "typewriter-effect";

import { useTourStore } from "../../store/TourStore";

const NarrationBox = () => {
  const [currStep] = useTourStore((state) => [state.currStep]);
  const desc = useRef<JSX.Element | null>(null);

  switch (currStep) {
    case 1:
      desc.current = (
        <p>
          Welcome to Primodium, a dense and resource-rich planet. Your goal is
          to set up base, export materials, and defeat other parties.
          <br />
          <br />
          First, <b>open the building menu.</b>
        </p>
      );
      break;
    case 3:
      desc.current = (
        <p>
          Great work. You can access all your buildings in the building menu,
          for now, focus on building a base. Remember, location of our base is
          important. Let's start by placing it near iron.
          <br />
          <br />
          Click on the <b>Base</b> button and place it down on the highlighted
          part of the map.
        </p>
      );
      break;
    case 6:
      desc.current = (
        <p>
          Great work. You can access all your buildings in the building menu,
          for now, focus on building a base. Remember, location of our base is
          important. Let's start by placing it near iron.
          <br />
          <br />
          Click on the <b>Base</b> button and place it down on the highlighted
          part of the map.
        </p>
      );
      break;
    case 8:
      desc.current = (
        <p>
          <p>Great work. I’ve given you 200 iron to get you started.</p>
          <br />
          <br />
          <p>
            To see it, open the Inventory tab. This is where all of your
            resources will be stored.
          </p>
        </p>
      );
    default:
      break;
  }

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
      <div className="text-sm">{desc.current}</div>
    </div>
  );
};

export default NarrationBox;
