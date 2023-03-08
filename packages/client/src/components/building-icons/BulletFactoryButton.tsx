import { BlockType, BlockColors } from "../../util/constants";
import { BlockTypeActionComponent } from "../../util/types";

function BulletFactoryButton({ action }: BlockTypeActionComponent) {
  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: BlockColors.get(BlockType.BulletFactory) }}
      onClick={action}
    >
      Factory
    </button>
  );
}
export default BulletFactoryButton;
