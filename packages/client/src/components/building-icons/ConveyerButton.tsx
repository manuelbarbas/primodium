import { BlockType, BlockColors } from "../../util/constants";
import { BlockTypeActionComponent } from "../../util/types";

function ConveyerButton({ action }: BlockTypeActionComponent) {
  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: BlockColors.get(BlockType.Conveyer) }}
      onClick={action}
    >
      Path
    </button>
  );
}
export default ConveyerButton;
