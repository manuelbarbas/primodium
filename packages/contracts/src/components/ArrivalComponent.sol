// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { Arrival, ArrivalUnit, ESendType } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.Arrival"));

contract ArrivalComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](8);
    values = new LibTypes.SchemaValue[](8);

    keys[0] = "sendType";
    values[0] = LibTypes.SchemaValue.UINT8;

    keys[1] = "unitCounts";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;

    keys[2] = "unitTypes";
    values[2] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[3] = "arrivalBlock";
    values[3] = LibTypes.SchemaValue.UINT256;

    keys[4] = "from";
    values[4] = LibTypes.SchemaValue.UINT256;

    keys[5] = "to";
    values[5] = LibTypes.SchemaValue.UINT256;

    keys[6] = "origin";
    values[6] = LibTypes.SchemaValue.UINT256;

    keys[7] = "destination";
    values[7] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, Arrival calldata arrival) public virtual {
    uint256[] memory unitCounts = new uint256[](arrival.units.length);
    uint256[] memory unitTypes = new uint256[](arrival.units.length);
    for (uint256 i = 0; i < arrival.units.length; i++) {
      unitCounts[i] = arrival.units[i].count;
      unitTypes[i] = uint256(arrival.units[i].unitType);
    }
    set(
      entity,
      abi.encode(
        arrival.sendType,
        unitCounts,
        unitTypes,
        arrival.arrivalBlock,
        arrival.from,
        arrival.to,
        arrival.origin,
        arrival.destination
      )
    );
  }

  function getValue(uint256 entity) public view virtual returns (Arrival memory) {
    // Assuming getRawValue returns the necessary values in the correct order
    (
      ESendType sendType,
      uint32[] memory unitCounts,
      uint256[] memory unitTypes,
      uint256 arrivalBlock,
      uint256 from,
      uint256 to,
      uint256 origin,
      uint256 destination
    ) = abi.decode(getRawValue(entity), (ESendType, uint32[], uint256[], uint256, uint256, uint256, uint256, uint256));
    ArrivalUnit[] memory arrivalUnits = new ArrivalUnit[](unitCounts.length);
    for (uint256 i = 0; i < unitCounts.length; i++) {
      arrivalUnits[i] = ArrivalUnit({ count: unitCounts[i], unitType: uint256(unitTypes[i]) });
    }
    return
      Arrival({
        sendType: sendType,
        units: arrivalUnits,
        arrivalBlock: arrivalBlock,
        from: from,
        to: to,
        origin: origin,
        destination: destination
      });
  }

  function getEntitiesWithValue(Arrival calldata sendType) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(sendType));
  }
}
