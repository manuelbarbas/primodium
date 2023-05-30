import { FaArrowDown } from "react-icons/fa";

const Arrow = ({
  direction,
}: {
  direction: "up" | "down" | "left" | "right";
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
    <div className={`${rotation}`}>
      <div className="animate-bounce text-yellow-300 text-4xl">
        <FaArrowDown />
      </div>
    </div>
  );
};

export default Arrow;
