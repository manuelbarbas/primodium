import { CardinalOrientation, Step, WalktourLogic } from "walktour";
import { EntityID } from "@latticexyz/recs";
import { primodium } from "@game/api";

import { SimpleCardinal, TourStep } from "../../util/types";
import { BlockType } from "../../util/constants";
import { useTourStore } from "../../store/TourStore";
import Arrow from "./Arrow";
import { hashKeyEntityAndTrim } from "../../util/encode";

import { Network } from "src/network/layer";
import { Item } from "src/network/components/chainComponents";
import { Marker } from "src/network/components/clientComponents";

const isQueryString = (selector: string) => {
  try {
    document.querySelector(selector);
  } catch (e) {
    return false;
  }
  return true;
};

const addCanvasListener = (tour: WalktourLogic) => {
  const canvas = document.querySelector("#phaser-container canvas");
  canvas?.addEventListener(
    "pointerdown",
    async () => {
      //sleep for 200 ms to allow objects to be placed
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (await tour?.stepContent?.validateNextOnTargetClick?.())
        tour?.stepContent?.customNextFunc?.(tour) ?? tour?.next();
    },
    {
      once: true,
    }
  );
};

const buildRoute = (_route: {
  route: (string | EntityID)[];
  narration?: (JSX.Element | undefined)[];
  arrowDirection?: SimpleCardinal;
  orientation?: CardinalOrientation[];
}) => {
  const defaults = {
    narration: [],
    arrowDirection: "left" as SimpleCardinal,
    orientation: [CardinalOrientation.CENTER, CardinalOrientation.EAST],
  };
  const { route, narration, arrowDirection, orientation } = {
    ...defaults,
    ..._route,
  };

  const steps: Step[] = route.map((selector, index) => {
    if (isQueryString(selector)) {
      return buildStep({
        name: `routing to ${selector}`,
        selector,
        narration: narration[index],
        customTooltipRenderer: () => {
          return <Arrow direction={arrowDirection} bounce />;
        },
        validate: async () => {
          return true;
        },
        orientation,
      });
    }

    //!! does not work, mud network is undefined here
    return buildStep({
      name: `routing to ${selector}`,
      selector: "#phaser-container",
      narration: narration[index],
      hideUI: true,
      customTooltipRenderer: () => {
        // const spawn = useTourStore.getState().spawn;

        //mud context not ava

        // primodium.components
        //   .marker(ctx!)
        //   .target(route[index] as EntityID, spawn, 10, 2, { x: 1, y: 0 });

        return <></>;
      },
      orientation,
    });
  });

  return steps;
};

const buildStep = (step: {
  name: string;
  selector: string;
  checkpoint?: boolean;
  customTooltipRenderer: (tour: WalktourLogic | undefined) => JSX.Element;
  validate?: () => Promise<boolean>;
  revertOnValidationFail?: boolean;
  onNext?: () => void;
  narration?: JSX.Element | undefined;
  orientation?: CardinalOrientation[];
  disableMask?: boolean;
  hideUI?: boolean;
  ctx?: Network;
}): TourStep => {
  const defaults = {
    checkpoint: false,
    onNext: () => {},
    revertOnValidationFail: false,
    narration: undefined,
    orientation: [CardinalOrientation.CENTER],
    disableMask: false,
    hideUI: false,
  };

  const {
    name,
    selector,
    checkpoint,
    customTooltipRenderer,
    validate,
    onNext,
    narration,
    orientation,
    disableMask,
    hideUI,
  } = { ...defaults, ...step };

  let _step: TourStep = {
    description: `${checkpoint ? "Checkpoint" : "Step"}: ${name}`,
    selector: selector,
    disableMask: disableMask,
    narration,
    hideUI,
    customNextFunc: async (tour) => {
      const setCurrentStep = useTourStore.getState().setCurrentStep;
      const setCheckpoint = useTourStore.getState().setCheckpoint;

      //need this since we are overriding the next function
      if (checkpoint) setCheckpoint(tour.allSteps[tour.stepIndex]);

      //call custom onNext function
      onNext();

      //set current step to next step
      setCurrentStep(tour.allSteps[tour.stepIndex + 1]);

      //move to next step
      tour?.next();
    },
    customTooltipRenderer: (tour) => {
      return customTooltipRenderer(tour);
    },
    nextOnTargetClick: true,
    orientationPreferences: orientation,
  };

  if (validate) {
    _step.validateNextOnTargetClick = async () => {
      return await validate();
    };
  }

  return _step;
};

export default function buildTourSteps(ctx: Network, player: EntityID) {
  return [
    // CHECKPOINT 0: START
    buildStep({
      name: "start",
      selector: "#game-container",
      customTooltipRenderer: (tour) => {
        return (
          <div className="bg-gray-700 text-white p-5 font-mono rounded-2xl mt-4 w-96 shadow-2xl flex flex-col justify-center items-center">
            <div className="text-2xl font-bold mb-4">Primodium</div>
            <div className="text-md mb-4">
              Build a factory entirely on-chain
            </div>
            <button
              className="bg-green-500 p-4 rounded w-full"
              onClick={() => tour?.next()}
            >
              Set up a Base
            </button>
          </div>
        );
      },
      onNext: () => {
        const spawn = useTourStore.getState().spawn;

        primodium.camera.pan(spawn!);
      },
    }),
    //ROUTE TO MAIN BASE BUILDING ICON
    ...buildRoute({
      route: ["#build", "#base", "#mainbase"],
      narration: [
        <p>
          Welcome to Primodium, a dense and resource-rich planet. Your goal is
          to set up base, export materials, and defeat other parties.
          <br />
          <br />
          First, <b>open the building menu.</b>
        </p>,
        <p>
          Great work. You can access all your buildings in the building menu,
          for now, focus on building a base. Remember, location of our base is
          important. Let's start by placing it near <b>Iron</b> resources.
          <br />
          <br />
          Click on the <b>Base</b> button and place it down on the highlighted
          part of the map.
        </p>,
        undefined,
      ],
    }),
    // CHECKPOINT 1: PLACE DOWN MAIN BASE
    buildStep({
      name: "place down main base",
      selector: "#phaser-container > canvas",
      // disableMask: true,
      checkpoint: true,
      hideUI: true,
      narration: (
        <p>
          Time to build your first base. Let's start by placing it near the
          indication on the map.
          <br />
          <br />
          Remember, it is important that you start near iron deposits.
        </p>
      ),
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;
        Marker.setWithCoord(spawn, BlockType.ArrowMarker);
        addCanvasListener(tour!);

        return <></>;
      },
    }),

    //CHECKPOINT 3: PLACED DOWN MINER
    buildStep({
      name: "place down miner",
      selector: "#phaser-container",
      checkpoint: true,
      hideUI: true,
      narration: (
        <p>Place the miner on any of the highlighted iron deposits.</p>
      ),
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.target(
          ctx.perlin,
          BlockType.Iron,
          BlockType.ArrowMarker,
          spawn,
          10,
          2
        );
        addCanvasListener(tour!);

        return <></>;
      },
    }),
    //ROUTE TO NODE
    ...buildRoute({
      route: ["#build", "#transport", "#node"],
      narration: [
        <p>
          Great work. Now that you have a miner, you need to transport the iron
          back to your base.
          <br />
          <br />
          To do this, you need to build <b>Two Nodes</b> to send and receive the
          iron from the miner to your base. Let's start by building the sending
          node adjacent to the miner.
        </p>,
      ],
    }),
    //CHECKPOINT 4: PLACE DOWN MINER NODE
    buildStep({
      name: "place down miner node",
      selector: "#phaser-container",
      checkpoint: true,
      hideUI: true,
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.target(
          ctx.perlin,
          BlockType.BasicMiner,
          BlockType.ArrowMarker,
          spawn,
          10,
          2,
          {
            x: 1,
            y: 0,
          }
        );
        addCanvasListener(tour!);

        //we set spawn in previous step
        return <></>;
      },
    }),
    //ROUTE TO NODE
    ...buildRoute({
      route: ["#build", "#transport", "#node"],
      narration: [
        <p>
          One more node to go. This time, place it adjacent to your base.
          <br />
          <br />
          Remember, you need to place it adjacent to your base.
        </p>,
      ],
    }),
    //CHECKPOINT 5: PLACE DOWN BASE NODE
    buildStep({
      name: "place down base node",
      selector: "#phaser-container",
      checkpoint: true,
      hideUI: true,
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.target(
          ctx.perlin,
          BlockType.MainBase,
          BlockType.ArrowMarker,
          spawn,
          10,
          2,
          {
            x: 1,
            y: 0,
          }
        );
        addCanvasListener(tour!);

        return <></>;
      },
    }),
    //ROUTE TO PATH/CONVEYOR
    ...buildRoute({
      route: ["#build", "#transport", "#conveyor"],
      narration: [
        <p>
          Now that you have your nodes, you need to connect them. To do this,
          you need to build a <b>Conveyor</b> between the two nodes.
          <br />
          <br />
          To build a conveyor, open the <b>building menu again</b>.
        </p>,
      ],
    }),
    //PLACE DOWN START NODE OF CONVEYOR
    buildStep({
      name: "place down conveyor",
      selector: "#phaser-container",
      hideUI: true,
      narration: (
        <p>
          First, let's place the start of the conveyor on the miner node.
          <br />
          <br />
          Place the start of the conveyor on the highlighted map tile.
        </p>
      ),
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.target(
          ctx.perlin,
          BlockType.BasicMiner,
          BlockType.ArrowMarker,
          spawn,
          10,
          2,
          {
            x: 1,
            y: 0,
          }
        );
        addCanvasListener(tour!);

        return <></>;
      },
    }),
    //CHECKPOINT 6: PLACE DOWN END NODE OF CONVEYOR
    buildStep({
      name: "place down conveyor",
      selector: "#phaser-container",
      checkpoint: true,
      hideUI: true,
      narration: (
        <p>
          Now, place the end of the conveyor on the base node.
          <br />
          <br />
          Place the end of the conveyor on the highlighted map tile.
        </p>
      ),
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.target(
          ctx.perlin,
          BlockType.MainBase,
          BlockType.ArrowMarker,
          spawn,
          10,
          2,
          {
            x: 1,
            y: 0,
          }
        );
        addCanvasListener(tour!);

        return <></>;
      },
    }),
    buildStep({
      name: "select main base",
      selector: "#phaser-container",
      hideUI: true,
      customTooltipRenderer: (tour) => {
        const spawn = useTourStore.getState().spawn;

        Marker.setWithCoord(spawn, BlockType.ArrowMarker);
        addCanvasListener(tour!);

        return <></>;
      },
      narration: (
        <p>
          Now that you have your conveyor, you need to claim the iron from the
          miner.
          <br />
          <br />
          To do this, first select your base on the map, then open the{" "}
          <b>storage menu</b> from the tooltip in the bottom right.
          <br />
          <br />
          Let's get <b>30</b> iron. We will need this for the next step.
        </p>
      ),
    }),
    //ROUTE TO CLAIM STORAGE
    ...buildRoute({
      route: ["#minimize-button-tooltip-box"],
      arrowDirection: "down",
      orientation: [CardinalOrientation.NORTH, CardinalOrientation.EAST],
    }),
    // CHECKPOINT 7: GATHER IRON
    buildStep({
      name: "gather iron",
      selector: "#claim-button",
      checkpoint: true,
      customTooltipRenderer: () => {
        return <Arrow direction="right" bounce />;
      },
      validate: async () => {
        // Check if user has enough iron without using hooks

        const ironEntity = hashKeyEntityAndTrim(BlockType.Iron, player);

        if (!ironEntity) {
          return false;
        }

        const addressIronValue = Item.get(ironEntity);

        if (addressIronValue && addressIronValue.value >= 30) {
          return true;
        } else {
          return false;
        }
      },
      orientation: [CardinalOrientation.WEST],
    }),
    //ROUTE TO COPPER RESEARCH
    ...buildRoute({
      route: ["#research"],
      narration: [
        <p>
          Great work. Now that you have your iron, you need to research copper.
          <br />
          <br />
          To do this, open the <b>research menu</b> from the side menu.
        </p>,
      ],
    }),
    //CHECKPOINT 8: RESEARCH COPPER
    buildStep({
      name: "research copper",
      selector: "#Copper-research",
      checkpoint: true,
      customTooltipRenderer: () => {
        return <Arrow direction="right" bounce />;
      },
      narration: (
        <p>
          Now, click the <b>Research</b> button to research copper. You now can
          mine copper!
        </p>
      ),
      validate: async () => {
        return true;
      },
      orientation: [CardinalOrientation.WEST],
    }),
    // END
    buildStep({
      name: "end screen",
      selector: "#game-container",
      customTooltipRenderer: (tour) => {
        return (
          <div className="bg-gray-700 text-white p-5 font-mono rounded-2xl mt-4 w-96 shadow-2xl flex flex-col justify-center items-center">
            <div className="text-2xl font-bold mb-4">
              You are ready recruit!
            </div>
            <div className="text-md text-center mb-4">
              It's time to expand your empire.
            </div>
            <div className="text-md text-center mb-4">
              Use your newfound knowledge to gather more advanced resources,
              research new factories.
            </div>
            <button
              className="bg-green-500 p-4 rounded w-full"
              onClick={() => {
                tour?.close();
              }}
            >
              Start Building!
            </button>
          </div>
        );
      },
    }),
  ];
}
