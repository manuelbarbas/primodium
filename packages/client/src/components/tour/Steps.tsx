import { CardinalOrientation, Step } from "walktour";
import Arrow from "./Arrow";

export const steps: Step[] = [
  {
    title: "Welcome to Primodium",
    description: "Let's Build a base to get started",
    selector: ".screen-container",
    customTooltipRenderer: (tour) => {
      return (
        <div className="bg-gray-700 text-white p-5 font-mono rounded-2xl mt-4 w-96 shadow-2xl flex flex-col justify-center items-center">
          <div className="text-2xl font-bold">Primodium</div>
          <br />
          <div className="text-md">Build a factory entirely on-chain</div>
          <br />
          <button
            className="bg-green-500 p-4 rounded w-full"
            onClick={() => tour?.next()}
          >
            {" "}
            Set up a Base
          </button>
        </div>
      );
    },
    disableCloseOnClick: true,
    disableClose: true,
    orientationPreferences: [CardinalOrientation.CENTER],
  },
  {
    // title: "Welcome to Primodium",
    description: "Click here to get started",
    selector: "#build",
    disableCloseOnClick: true,
    disableClose: true,
    customTooltipRenderer: () => {
      return <Arrow direction="left" />;
    },
    nextOnTargetClick: true,
    orientationPreferences: [
      CardinalOrientation.CENTER,
      CardinalOrientation.EAST,
    ],
  },
  {
    // title: "Welcome to Primodium",
    description: "Click here to get started",
    selector: "#base",
    disableCloseOnClick: true,
    disableClose: true,
    customTooltipRenderer: () => {
      return <Arrow direction="left" />;
    },
    nextOnTargetClick: true,
    orientationPreferences: [
      CardinalOrientation.CENTER,
      CardinalOrientation.EAST,
    ],
  },
  {
    // title: "Welcome to Primodium",
    description: "Click here to get started",
    selector: "#mainbase",
    disableCloseOnClick: true,
    disableClose: true,
    nextOnTargetClick: true,
    customTooltipRenderer: () => {
      return <Arrow direction="left" />;
    },
    orientationPreferences: [
      CardinalOrientation.CENTER,
      CardinalOrientation.EAST,
    ],
  },
  {
    // title: "Welcome to Primodium",
    description: "Click here to get started",
    selector: ".select-tile",
    disableCloseOnClick: true,
    disableClose: true,
    nextOnTargetClick: true,
    customTooltipRenderer: () => {
      return <Arrow direction="left" />;
    },
    orientationPreferences: [
      CardinalOrientation.CENTER,
      CardinalOrientation.EAST,
    ],
  },
];
