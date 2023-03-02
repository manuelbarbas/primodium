import { BlockType, BlockColors } from "../../util/constants";
import { BlockTypeActionComponent } from "../../util/types";

function MinerButton({ action }: BlockTypeActionComponent) {
  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: BlockColors.get(BlockType.Miner) }}
      onClick={action}
    >
      Miner
    </button>
  );
}
export default MinerButton;
