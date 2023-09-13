import { renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StaticAbiType } from "@latticexyz/schema-type";
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

export const renderSetLevelRecord = (
  config: StoreConfig,
  tableName: string,
  value: { [k: string]: number },
  level: string,
  i: number
) => {
  const { schema } = config.tables[tableName];

  // Iterate through the keys in the original schema to preserve ordering
  const formattedValues = Object.keys(schema).map((fieldName) => {
    const fieldValue = value[fieldName];

    const variableName = `${tableName.toLowerCase()}_${fieldName}_level_${level}`;
    const fieldType = schema[fieldName];
    const isArray = Array.isArray(fieldValue);

    if (isArray) {
      const declaration = `${fieldType} memory ${variableName} = new ${fieldType}(${fieldValue.length});`;
      const assignments = fieldValue.map((v, i) => `${variableName}[${i}] = ${formatValue(config, fieldType, v)};`);

      return {
        declaration: [declaration, ...assignments].join(""),
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

  return `${formattedValues.find((v) => v.declaration) ? formattedValues.map((v) => v.declaration).join("") : ""}
  values[${i}] = ${tableName}.encode(${formattedValues.map((v) => (v.name ? v.name : v.formattedValue)).join(",")});`;
};

export function renderLevelPrototype(config: StoreConfigWithPrototypes, name: string) {
  const prototype = config.prototypes[name];

  const keys: Record<string, StaticAbiType> = prototype.keys
    ? prototype.keys
    : name == "World"
    ? {}
    : { prototypeId: "bytes32" };
  keys["level"] = "uint32";
  const values = prototype.levels;
  if (!values) return undefined;

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
  const renderLevels = Object.entries(values)
    .map(([level, value]) => {
      return `
    /* ----------------------------- LEVEL ${level} ----------------------------- */
    levelKeys = ${name}LevelKeys(${level});
    tableIds = new bytes32[](${Object.keys(value).length});
    values = new bytes[](${Object.keys(value).length});

    ${Object.keys(value)
      .map((key, i) => `tableIds[${i}] = ${key}TableId;`)
      .join("")}

    ${Object.entries(value)
      .map(([tableName, v], i) => (v ? renderSetLevelRecord(config, tableName, v, level, i) : ""))
      .join("")}

    createPrototype(store, levelKeys, tableIds, values);
    `;
    })
    .join("");

  return {
    levelKeys: `function ${name}LevelKeys(uint32 level) pure returns (bytes32[] memory) {
    ${keyTupleDefinition}
        return _keyTuple;
  }`,
    levels: `
    bytes32[] memory levelKeys; 
    ${renderLevels} 
`,
  };
}
export const renderSetRecord = (config: StoreConfig, tableName: string, value: { [k: string]: number }, i: number) => {
  const { schema } = config.tables[tableName];

  // Iterate through the keys in the original schema to preserve ordering
  const formattedValues = Object.keys(schema).map((fieldName) => {
    const fieldValue = value[fieldName];

    const variableName = `${tableName.toLowerCase()}_${fieldName}`;
    const fieldType = schema[fieldName];
    const isArray = Array.isArray(fieldValue);

    if (isArray) {
      const declaration = `${fieldType} memory ${variableName} = new ${fieldType}(${fieldValue.length});`;
      const assignments = fieldValue.map((v, i) => `${variableName}[${i}] = ${formatValue(config, fieldType, v)};`);

      return {
        declaration: [declaration, ...assignments].join(""),
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

  return `${formattedValues.find((v) => v.declaration) ? formattedValues.map((v) => v.declaration).join("") : ""}
  values[${i}] = ${tableName}.encode(${formattedValues.map((v) => (v.name ? v.name : v.formattedValue)).join(",")});`;
};

export function renderPrototype(config: StoreConfigWithPrototypes, name: string) {
  const prototype = config.prototypes[name];
  const keys = prototype.keys ? prototype.keys : name == "World" ? {} : { prototypeId: "bytes32" };
  const values = prototype.tables ?? {};
  const levelTables = Object.values(prototype.levels ?? {})
    .map((v) => {
      return Object.keys(v);
    })
    .flat();
  const allImportedTableIds = [...Object.keys(prototype.tables ?? {}), ...levelTables]
    .map((tableName) => `${tableName}, ${tableName}TableId`)
    .join(",");
  const levelPrototype = renderLevelPrototype(config, name);
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
  import {${allImportedTableIds}} from "../Tables.sol";
  
  bytes32 constant prototypeId = "${name}";
  bytes32 constant ${name}PrototypeId = prototypeId;
  uint256 constant LENGTH = ${Object.keys(values).length};

  function ${name}Keys() pure returns (bytes32[] memory) {
    ${keyTupleDefinition}
        return _keyTuple;
  }

  ${levelPrototype ? levelPrototype.levelKeys : ""}
  function ${name}Prototype(IStore store) {
    bytes32[] memory keys = ${name}Keys();
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    bytes[] memory values = new bytes[](LENGTH);
    
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId;`)
      .join("")}

    ${Object.entries(values)
      .map(([tableName, value], i) => (value ? renderSetRecord(config, tableName, value, i) : ""))
      .join("")}

    createPrototype(store, keys, tableIds, values);
    ${levelPrototype ? levelPrototype.levels : ""}
  }
`;
}

export function renderValueTypeToBytes32(
  name: string,
  { typeUnwrap, internalTypeId }: { typeUnwrap: string; internalTypeId: string }
): string {
  const innerText = typeUnwrap.length ? `${typeUnwrap}(${name})` : name;
  if (internalTypeId === "bytes32") {
    return innerText.startsWith("0x") ? innerText.slice(2) : innerText;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    return `bytes32(${innerText})`;
  } else if (internalTypeId.match(/^uint\d{1,3}$/)) {
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
