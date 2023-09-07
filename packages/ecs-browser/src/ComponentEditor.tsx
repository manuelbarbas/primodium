import { useComponentValue } from "@latticexyz/react";
import { Layers, removeComponent } from "@latticexyz/recs";
import {
  Component,
  Entity,
  Metadata,
  Schema,
} from "@latticexyz/recs/src/types";
import { ComponentValueEditor } from "./ComponentValueEditor";
import {
  ComponentBrowserButton,
  ComponentEditorContainer,
  ComponentTitle,
} from "./StyledComponents";
import { SetField, hasContract } from "./types";

export const ComponentEditor = ({
  entity,
  component,
  layers,
  setField,
}: {
  entity: Entity;
  component: Component<Schema, Metadata, unknown>;
  layers: Layers;
  setField?: SetField<Schema>;
}) => {
  const value = useComponentValue(component, entity);
  if (!value) return null;

  return (
    <ComponentEditorContainer>
      <ComponentTitle>
        {(component.metadata?.componentName as string) ?? component.id}
        <ComponentBrowserButton
          onClick={() => {
            removeComponent(component, entity);

            if (setField && hasContract(component))
              setField(entity, component, {});
          }}
        >
          Remove
        </ComponentBrowserButton>
      </ComponentTitle>
      <ComponentValueEditor
        entity={entity}
        component={component}
        componentValue={value}
        layers={layers}
        setField={setField}
      />
    </ComponentEditorContainer>
  );
};
