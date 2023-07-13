import { EntityID, EntityIndex } from "@latticexyz/recs";
import useResourceCount from "../../hooks/useResourceCount";
import { ResourceImage } from "../../util/constants";
import { useMud } from "../../context/MudContext";

export default function ResourceLabel({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) {
  const { components } = useMud();

  const resourceCount = useResourceCount(
    components.Item,
    resourceId,
    entityIndex
  );
  const storageCount = useResourceCount(
    components.StorageCapacity,
    resourceId,
    entityIndex
  );

  const production = useResourceCount(components.Mine, resourceId, entityIndex);

  const resourceIcon = ResourceImage.get(resourceId);

  if (storageCount > 0) {
    return (
      <div className="flex mb-1">
        <p className="w-40 my-auto text-sm">
          {resourceCount} / {storageCount}
        </p>
        <img className="w-4 h-4 ml-2 my-auto" src={resourceIcon}></img>
        <p className="w-20 ml-2 my-auto text-sm">{name}</p>
        <p className="w-4 ml-1 my-auto text-sm">{production}</p>
      </div>
    );
  } else {
    return <></>;
  }
}
