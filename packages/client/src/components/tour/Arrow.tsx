import { FaArrowDown } from "react-icons/fa";
import { SimpleCardinal } from "../../util/types";

const Arrow = ({
  direction,
  bounce = false,
  className = "",
}: {
  direction: SimpleCardinal;
  bounce?: boolean;
  className?: string;
}) => {
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
};

export default Arrow;
