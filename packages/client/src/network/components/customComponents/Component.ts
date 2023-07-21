import {
  ComponentValue,
  EntityID,
  Has,
  HasValue,
  Component as MUDComponent,
  Metadata,
  NotValue,
  Schema,
  Type,
  World,
  defineComponent,
  getComponentValue,
  overridableComponent,
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { useComponentValue } from "src/hooks/useComponentValue";
import { singletonIndex, world } from "../../world";

export interface Options<M extends Metadata> {
  id?: string;
  metadata?: M;
  indexed?: boolean;
  overridable?: boolean;
}

class Component<S extends Schema, M extends Metadata, T = undefined> {
  public component: MUDComponent<S, M>;
  constructor(world: World, schema: S, options?: Options<M>) {
    if (options?.overridable) {
      this.component = defineComponent(world, schema, options);
    } else {
      this.component = overridableComponent(
        defineComponent(world, schema, options)
      );
    }
  }

  public get update$() {
    return this.component.update$;
  }
  public get id() {
    return this.component.id;
  }
  public get metadata() {
    return this.component.metadata;
  }
  public get entities() {
    return this.component.entities;
  }
  public get schema() {
    return this.component.schema;
  }
  public get values() {
    return this.component.values;
  }
  public get world() {
    return this.component.world;
  }

  private getEntity(entityID: EntityID) {
    const entity = world.entityToIndex.get(entityID);
    if (!entity) throw new Error(`${this.component.id}: no entity registered`);
    return entity;
  }

  // Actual method implementation:
  public set(value: ComponentValue<S, T>, entityID?: EntityID) {
    // This is the (entityID, value) overload
    const entity = entityID ? this.getEntity(entityID) : singletonIndex;
    setComponent(this.component, entity, value);
  }

  public get(): ComponentValue<S> | undefined;
  public get(entityID: EntityID): ComponentValue<S> | undefined;
  public get(
    entityID: EntityID,
    defaultValue?: ComponentValue<S>
  ): ComponentValue<S>;

  public get(entityID?: EntityID, defaultValue?: ComponentValue<S>) {
    const entity = entityID ? this.getEntity(entityID) : singletonIndex;
    const value = getComponentValue(this.component, entity)?.value;
    return value ?? defaultValue;
  }

  public getAll = () => {
    const entities = runQuery([Has(this.component)]);
    return [...entities].map((entity) => world.entities[entity]);
  };

  public getAllWith = (value: Partial<ComponentValue<S>>) => {
    const entities = runQuery([HasValue(this.component, value)]);
    return [...entities].map((entity) => world.entities[entity]);
  };

  public getAllWithout = (value: Partial<ComponentValue<S>>) => {
    const entities = runQuery([NotValue(this.component, value)]);
    return [...entities].map((entity) => world.entities[entity]);
  };

  public remove = (entityID?: EntityID) => {
    const entity = entityID ? this.getEntity(entityID) : singletonIndex;
    return removeComponent(this.component, entity);
  };

  public clear = () => {
    const entities = runQuery([Has(this.component)]);
    entities.forEach((entity) => removeComponent(this.component, entity));
  };

  public use(): ComponentValue<S> | undefined;
  public use(entityID: EntityID): ComponentValue<S> | undefined;
  public use(
    entityID: EntityID,
    defaultValue?: ComponentValue<S>
  ): ComponentValue<S>;

  public use(entityID?: EntityID, defaultValue?: ComponentValue<S>) {
    const entity = entityID ? this.getEntity(entityID) : singletonIndex;
    const value = useComponentValue(this.component, entity);
    return value ?? defaultValue;
  }

  public update(value: Partial<ComponentValue<S, T>>, entityID?: EntityID) {
    const entity = entityID ? this.getEntity(entityID) : singletonIndex;
    updateComponent(this.component, entity, value);
  }

  public has() {
    return Has(this.component);
  }

  public hasValue(value: Partial<ComponentValue<S>>) {
    return HasValue(this.component, value);
  }
}

export default Component;

export class NumberComponent<M extends Metadata> extends Component<
  { value: Type.Number },
  M
> {
  constructor(world: World, options?: Options<M>) {
    super(world, { value: Type.Number }, options);
  }
}

export class StringComponent<M extends Metadata> extends Component<
  { value: Type.String },
  M
> {
  constructor(world: World, options?: Options<M>) {
    super(world, { value: Type.String }, options);
  }
}

export class CoordComponent<M extends Metadata> extends Component<
  { x: Type.Number; y: Type.Number },
  M
> {
  constructor(world: World, options?: Options<M>) {
    super(world, { x: Type.Number, y: Type.Number }, options);
  }
}

export class BoolComponent<M extends Metadata> extends Component<
  { value: Type.Boolean },
  M
> {
  constructor(world: World, options?: Options<M>) {
    super(world, { value: Type.Boolean }, options);
  }
}
