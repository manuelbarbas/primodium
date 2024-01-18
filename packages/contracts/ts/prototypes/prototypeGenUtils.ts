import { StaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { EResource, MUDEnums } from "../../config/enums";
import encodeBytes32 from "../../config/util/encodeBytes32";

export const SCALE = 1e18;
export const encodeArray = (names: string[]) => names.map(encodeBytes32);
export const indexifyResourceArray = (resources: string[]) =>
  resources.map((resource) => MUDEnums.EResource.indexOf(resource));

/**
 * Generates a supply table for a marketplace given a resource and its ratio to gold.
 *
 * @param {EResource} resource - The specific resource for which to generate the supply table.
 * @param {number} ratio - The ratio of the resource to gold. The larger the number, the more expensive the resource.
 * @returns An object containing keys and tables for the marketplace supply.
 *          The keys array contains objects with resource types and their corresponding data types.
 *          The tables object includes 'Reserves' with 'amountB' and 'amountA', calculated based on the provided ratio.
 */
const BASE_RESERVE = 100000;
export const marketplaceSupplyTable = (resource: EResource, ratio: number) => ({
  keys: [{ [resource]: "uint8" }, { [EResource.Gold]: "uint8" }] as { [x: string]: "uint8" }[],
  tables: { Reserves: { amountB: BigInt(BASE_RESERVE * SCALE), amountA: BigInt(BASE_RESERVE * SCALE * ratio) } },
});

export const upgradesByLevel = (name: string, upgrades: Record<number, Record<string, number>>) =>
  Object.entries(upgrades).reduce((prev, [level, upgrades]) => {
    const name32 = encodeBytes32(name);
    const upgradesObject = Object.entries(upgrades).reduce((prev, [resource, max]) => {
      prev[`${name}${resource}L${level}Upgrade`] = {
        keys: [{ [name32]: "bytes32" }, { [MUDEnums.EResource.indexOf(resource)]: "uint8" }, { [level]: "uint32" }],
        tables: { P_ByLevelMaxResourceUpgrades: { value: max } },
      };
      return prev;
    }, {} as Record<string, { keys: { [x: string]: StaticAbiType }[]; tables: { P_ByLevelMaxResourceUpgrades: { value: number } } }>);
    return { ...prev, ...upgradesObject };
  }, {});

export const getResourceValue = (resourceValue: { [x: string]: number }) => {
  const [resource, amount] = Object.entries(resourceValue)[0];
  return { resource: MUDEnums.EResource.indexOf(resource), amount: BigInt(amount * SCALE) };
};

export const getResourceValues = (resourceValues: Record<string, number>, noScale?: boolean) => {
  // unzip the array
  const [resources, amounts] = Object.entries(resourceValues).reduce(
    (acc, [resource, amount]) => {
      acc[0].push(MUDEnums.EResource.indexOf(resource));
      acc[1].push(BigInt(amount * (noScale ? 1 : SCALE)));
      return acc;
    },
    [[], []] as [number[], bigint[]]
  );
  return { resources, amounts };
};
export const getPirateObjectiveResourceValues = (resourceValues: Record<string, number>) => {
  const amounts = getResourceValues(resourceValues);
  return { ...amounts, resourceAmounts: amounts.amounts };
};

export const getUnitValues = (unitValues: Record<string, number>) => {
  const [units, amounts] = Object.entries(unitValues).reduce(
    (acc, [resource, amount]) => {
      acc[0].push(encodeBytes32(resource));
      acc[1].push(BigInt(amount));
      return acc;
    },
    [[], []] as [Hex[], bigint[]]
  );
  return { units, amounts };
};

export const upgradesToList = (upgrades: Record<string, number>) => {
  return Object.keys(upgrades).map((resource) => MUDEnums.EResource.indexOf(resource));
};

export const idsToPrototypes = (ids: string[]) =>
  ids
    .map((building, i) => ({
      [i]: {
        P_EnumToPrototype: { value: encodeBytes32(building) },
      },
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
