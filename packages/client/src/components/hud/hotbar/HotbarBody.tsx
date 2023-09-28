import { Action} from "src/util/constants";
import HotbarItem from "./HotbarItem";
import { useHotbarContent } from "./useHotbarContent";
import { Card } from "src/components/core/Card";
import {  hashAndTrimKeyEntity } from "client/src/util/encode";

import {Level,MainBase } from "client/src/network/components/chainComponents";
import {Account} from "client/src/network/components/clientComponents";
import { EntityID } from "@latticexyz/recs";
import { SingletonID } from "@latticexyz/network";
import { useMemo } from "react";

const HotbarBody: React.FC<{
  activeBar: number;
  setActiveBar: (activeBar: number) => void;
}> = ({ activeBar }) => {
  const hotbarContent = useHotbarContent();
  
  
  const player = Account.use()?.value ?? SingletonID;
   const mainBaseEntity = MainBase.use(player, {
    value: "-1" as EntityID,
  }).value;
  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;

  const availbleElements = useMemo(() => {
    return hotbarContent[activeBar].items.filter((item) => {
      const buildingLevelEntity = hashAndTrimKeyEntity(item.blockType,(1 as unknown as EntityID));
      if(!Level.has(buildingLevelEntity))
      return true;
      const maineBaseLevelRequired = Level.get(buildingLevelEntity)?.value ?? 1;
      return(mainBaseLevel >= maineBaseLevelRequired);
    })
  },[mainBaseLevel, activeBar]);
  return (
    <Card className="flex flex-row gap-2">
      {
      availbleElements.map((item, index) => {
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
