import { useCallback } from "react";
import { EntityID, EntityIndex } from "@latticexyz/recs";

import { useMud } from "../../context/MudContext";
import useResourceCount from "../../hooks/useResourceCount";
import { ResourceImage } from "../../util/constants";

function MunitionsButton({
  resourceId,
  entityIndex,
  attackAction,
}: {
  resourceId: EntityID;
  entityIndex?: EntityIndex;
  attackAction: (weaponKey: EntityID) => void;
}) {
  const { components } = useMud();

  const resourceCount = useResourceCount(
    components.Item,
    resourceId,
    entityIndex
  );

  const executeAttackAction = useCallback(() => {
    attackAction(resourceId);
  }, []);

  return (
    <button
      className="w-16 h-16 hover:brightness-75"
      onClick={executeAttackAction}
    >
      <img
        className="w-16 h-16 pixel-images"
        src={ResourceImage.get(resourceId)}
      ></img>
      <div className="h-2"></div>
      {resourceCount}
    </button>
  );
}

export default MunitionsButton;
