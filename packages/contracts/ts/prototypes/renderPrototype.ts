import { renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig } from "@latticexyz/store";
import { StoreConfigWithPrototypes } from "./prototypeConfig";

const formatValue = (config: StoreConfig, fieldType: string, value: number | string) => {
  if (fieldType in config.enums) {
    return `${fieldType}(uint8(${value}))`;
  } else if (typeof value === "string" && value.includes("0x")) {
    return `${value}`;
  } else if (fieldType.includes("bytes")) {
    return `"${value}"`;
  }
  return `${value}`;
};

export const renderSetRecord = (config: StoreConfig, tableName: string, value: { [k: string]: number }, i: number) => {
  const { schema } = config.tables[tableName];

  // Iterate through the keys in the original schema to preserve ordering
  const formattedValues = Object.keys(schema).map((fieldName) => {
    const fieldValue = value[fieldName];

    const variableName = `${tableName.toLowerCase()}_${fieldName}`;
    const fieldType = schema[fieldName];
    const isArray = Array.isArray(fieldValue);

    if (isArray) {
      const declaration = `${fieldType} memory ${variableName} = new ${fieldType}(${fieldValue.length})`;
      const assignments = fieldValue.map((v, i) => `${variableName}[${i}] = ${formatValue(config, fieldType, v)}`);

      return {
        declaration: [declaration, ...assignments].join(";"),
        name: variableName,
        formattedValue: null,
      };
    }

    return {
      declaration: null,
      name: null,
      formattedValue: formatValue(config, fieldType, fieldValue),
    };
  });

  return `${formattedValues.find((v) => v.declaration) ? formattedValues.map((v) => v.declaration).join(";") + ";" : ""}
  values[${i}] = ${tableName}.encode(${formattedValues.map((v) => (v.name ? v.name : v.formattedValue)).join(",")});`;
};

export function renderPrototype(config: StoreConfigWithPrototypes, name: string) {
  const prototype = config.prototypes[name];
  const keys = prototype.keys ? prototype.keys : { prototypeId: "bytes32" };
  const values = prototype.tables;

  const keyTupleDefinition = `
    bytes32[] memory _keyTuple = new bytes32[](${Object.entries(keys).length});
    ${renderList(
      Object.entries(keys),
      (key, index) =>
        `_keyTuple[${index}] = ${renderValueTypeToBytes32(key[0], {
          typeUnwrap: "",
          internalTypeId: key[1],
        })};`
    )}
  `;
  return `
  ${renderedSolidityHeader}
  
  import { IStore } from "@latticexyz/store/src/IStore.sol";
  import { createPrototype } from "../../libraries/prototypes/createPrototype.sol";
  ${
    Object.keys(config.enums).length > 0
      ? `import { ${Object.keys(config.enums)
          .map((e) => e)
          .join(",")} } from "../Types.sol";`
      : ""
  }

  ${
    Object.keys(values).length > 0
      ? `import {${Object.keys(values)
          .map((key) => `${key}, ${key}TableId`)
          .join(",")}} from "../Tables.sol";`
      : ""
  }
  
  bytes32 constant prototypeId = "${name}";
  bytes32 constant ${name}PrototypeId = prototypeId;
  uint256 constant LENGTH = ${Object.keys(values).length};

  function ${name}Keys() pure returns (bytes32[] memory) {
    ${keyTupleDefinition}
        return _keyTuple;
  }

  function ${name}Prototype(IStore store) {
    bytes32[] memory keys = ${name}Keys();
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    bytes[] memory values = new bytes[](LENGTH);
    
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId`)
      .join(";")};

    ${Object.entries(values)
      .map(([tableName, value], i) => (value ? renderSetRecord(config, tableName, value, i) : ""))
      .join("")}

    createPrototype(store, keys, tableIds, values);
  }
`;
}

export function renderValueTypeToBytes32(
  name: string,
  { typeUnwrap, internalTypeId }: { typeUnwrap: string; internalTypeId: string }
): string {
  const innerText = typeUnwrap.length ? `${typeUnwrap}(${name})` : name;
  console.log("internalTypeId", internalTypeId);
  if (internalTypeId === "bytes32") {
    return innerText;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    return `bytes32(${innerText})`;
  } else if (internalTypeId.match(/^uint\d{1,3}$/)) {
    console.log("hello!");
    return `bytes32(uint256(${innerText}))`;
  } else if (internalTypeId.match(/^int\d{1,3}$/)) {
    return `bytes32(uint256(int256(${innerText})))`;
  } else if (internalTypeId === "address") {
    return `bytes32(uint256(uint160(${innerText})))`;
  } else if (internalTypeId === "bool") {
    return `_boolToBytes32(${innerText})`;
  } else {
    throw new Error(`Unknown value type id ${internalTypeId}`);
  }
}
