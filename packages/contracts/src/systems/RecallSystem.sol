// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { ESendType } from "src/Types.sol";
import { LibRecall } from "codegen/Libraries.sol";

contract RecallSystem is PrimodiumSystem {
  /**
   * @dev Recalls stationed units.
   * @param rockEntity The identifier of the target rock.
   */
  function recallStationedUnits(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRecall.recallStationedUnits(playerEntity, rockEntity);
  }

  /**
   * @dev Recalls the target arrival id.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to recall.
   */
  function recallArrival(bytes32 rockEntity, bytes32 arrivalId) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRecall.recallArrival(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls all units sent by a player to a specific rock of the sendType.
   * @param rockEntity The identifier of the target rock.
   * @param sendType the type of send to recall
   */
  function recallAllOfSendType(bytes32 rockEntity, ESendType sendType) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRecall.recallAllArrivalsOfSendType(playerEntity, rockEntity, sendType);
  }

  /**
   * @dev Recalls all units sent by a player to a specific rock.
   * @param rockEntity The identifier of the target rock.
   */
  function recallAll(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRecall.recallAllArrivals(playerEntity, rockEntity);
  }
}
