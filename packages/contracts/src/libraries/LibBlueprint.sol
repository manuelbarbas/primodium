// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { P_BlueprintComponent } from "components/P_BlueprintComponent.sol";

library LibBlueprint {
  function get1x1Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](2);
    blueprint[0] = 0;
    blueprint[1] = 0;
  }

  function get2x2Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](8);

    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = -1;
    blueprint[5] = 0;

    blueprint[6] = -1;
    blueprint[7] = -1;
  }

  function get3x3Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](18);
    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = 0;
    blueprint[5] = -2;

    blueprint[6] = 1;
    blueprint[7] = 0;

    blueprint[8] = 1;
    blueprint[9] = -1;

    blueprint[10] = 1;
    blueprint[11] = -2;

    blueprint[12] = 2;
    blueprint[13] = 0;

    blueprint[14] = 2;
    blueprint[15] = -1;

    blueprint[16] = 2;
    blueprint[17] = -2;
  }
}
