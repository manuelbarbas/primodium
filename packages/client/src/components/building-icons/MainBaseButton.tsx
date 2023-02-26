import { BlockType, BlockColors } from "../../util/constants";
import { BlockTypeActionComponent } from "../../util/types";

function MainBaseButton({ action }: BlockTypeActionComponent) {
  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: BlockColors.get(BlockType.MainBase) }}
      onClick={action}
    >
      Base
    </button>
  );
}
export default MainBaseButton;
