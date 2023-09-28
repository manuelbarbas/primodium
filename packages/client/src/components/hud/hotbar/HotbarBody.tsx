import { Action } from "src/util/constants";
import HotbarItem from "./HotbarItem";
import { useHotbarContent } from "./useHotbarContent";
import { Card } from "src/components/core/Card";

const HotbarBody: React.FC<{
  activeBar: number;
  setActiveBar: (activeBar: number) => void;
}> = ({ activeBar }) => {
  const hotbarContent = useHotbarContent();

  return (
    <Card className="flex flex-row gap-2">
      {hotbarContent[activeBar].items.map((item, index) => {
        return (
          <HotbarItem
            key={index}
            index={index}
            blockType={item.blockType}
            action={item.action ?? Action.PlaceBuilding}
          />
        );
      })}
    </Card>
  );
};

export default HotbarBody;
