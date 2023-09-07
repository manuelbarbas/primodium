import {
  AnyComponent,
  ComponentValue,
  Entity,
  Layers,
  Schema,
} from "@latticexyz/recs";
import { ValueEditor } from "./ValueEditor";
import { SetField } from "./types";

export const ComponentValueEditor = ({
  entity,
  component,
  componentValue,
  layers,
  setField,
}: {
  entity: Entity;
  component: AnyComponent;
  componentValue: ComponentValue<Schema>;
  layers: Layers;
  setField?: SetField<Schema>;
}) => {
  return (
    <div>
      {Object.keys(componentValue).map((propName) => {
        return (
          <ValueEditor
            key={`value-editor-${propName}-${entity}`}
            entity={entity}
            component={component}
            componentValue={componentValue}
            valueProp={propName}
            layers={layers}
            setField={setField}
          />
        );
      })}
    </div>
  );
};
