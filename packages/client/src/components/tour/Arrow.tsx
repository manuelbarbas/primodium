import { FaArrowDown } from "react-icons/fa";
import { SimpleCardinal } from "../../util/types";
import { useGameStore } from "../../store/GameStore";

const Arrow = ({
  direction,
  bounce = false,
  className = "",
}: {
  direction: SimpleCardinal;
  bounce?: boolean;
  className?: string;
}) => {
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  let rotation;

  switch (direction) {
    case "up":
      rotation = "rotate-180";
      break;
    case "down":
      rotation = "rotate-0";
      break;
    case "left":
      rotation = "rotate-90";
      break;
    case "right":
      rotation = "rotate-[-90deg]";
      break;
  }

  // don't return tooltip if transaction is loading, because nothing to click on
  if (transactionLoading) {
    return <></>;
  } else {
    return (
      <div className={`${rotation} ${className} pointer-events-none`}>
        <div
          className={`text-yellow-300 shadow-2xl text-4xl ${
            bounce ? "animate-bounce" : ""
          }`}
        >
          <FaArrowDown />
        </div>
      </div>
    );
  }
};

export default Arrow;
