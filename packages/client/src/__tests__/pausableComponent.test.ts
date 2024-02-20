import { Type, defineComponent } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { extendComponent } from "src/network/components/customComponents/ExtendedComponent";
import { world } from "src/network/world";
import { expect, test } from "vitest";

const Pausable = extendComponent(defineComponent(world, { value: Type.Number }, { id: "Pause" }));

test("pausableTest", () => {
  Pausable.set({ value: 0 }, singletonEntity);
  Pausable.pauseUpdates(singletonEntity);

  Pausable.set({ value: 1 }, singletonEntity);

  expect(Pausable.get(singletonEntity)?.value).eq(0);

  Pausable.resumeUpdates(singletonEntity);
  expect(Pausable.get(singletonEntity)?.value).eq(1);
  Pausable.set({ value: 2 }, singletonEntity);
  expect(Pausable.get(singletonEntity)?.value).eq(2);
});

test("pausableTestMultipleSets", () => {
  Pausable.set({ value: 0 }, singletonEntity);
  Pausable.pauseUpdates(singletonEntity);

  Pausable.set({ value: 1 }, singletonEntity);
  Pausable.set({ value: 10 }, singletonEntity);
  Pausable.set({ value: 100 }, singletonEntity);
  Pausable.set({ value: 1000 }, singletonEntity);

  expect(Pausable.get(singletonEntity)?.value).eq(0);

  Pausable.resumeUpdates(singletonEntity);
  expect(Pausable.get(singletonEntity)?.value).eq(1000);
});

test("pausableTestMultipleSets", () => {
  Pausable.set({ value: 0 }, singletonEntity);
  Pausable.pauseUpdates(singletonEntity);

  Pausable.set({ value: 1 }, singletonEntity);
  Pausable.set({ value: 10 }, singletonEntity);
  Pausable.set({ value: 100 }, singletonEntity);
  Pausable.set({ value: 1000 }, singletonEntity);

  expect(Pausable.get(singletonEntity)?.value).eq(0);

  Pausable.resumeUpdates(singletonEntity);
  expect(Pausable.get(singletonEntity)?.value).eq(1000);
});

test("pausableTestSetonPause", () => {
  Pausable.set({ value: 0 }, singletonEntity);
  Pausable.pauseUpdates(singletonEntity, { value: 1 });

  expect(Pausable.get(singletonEntity)?.value).eq(1);
});
