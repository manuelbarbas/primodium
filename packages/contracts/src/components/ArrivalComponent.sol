// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { Arrival, ESendType } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.Arrival"));

contract ArrivalComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "sendType";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "count";
    values[1] = LibTypes.SchemaValue.UINT32;

    keys[2] = "arrivalBlock";
    values[2] = LibTypes.SchemaValue.UINT256;

    keys[3] = "sender";
    values[3] = LibTypes.SchemaValue.UINT256;

    keys[4] = "destination";
    values[4] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, Arrival calldata arrival) public virtual {
    set(entity, abi.encode(arrival.sendType, arrival.count, arrival.arrivalBlock, arrival.sender));
  }

  function getValue(uint256 entity) public view virtual returns (Arrival memory) {
    // Assuming getRawValue returns the necessary values in the correct order
    (ESendType sendType, uint32 count, uint256 arrivalBlock, uint256 sender, uint256 destination) = abi.decode(
      getRawValue(entity),
      (ESendType, uint32, uint256, uint256, uint256)
    );
    return Arrival(sendType, count, arrivalBlock, sender, destination);
  }

  function getEntitiesWithValue(Arrival calldata sendType) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(sendType));
  }
}
