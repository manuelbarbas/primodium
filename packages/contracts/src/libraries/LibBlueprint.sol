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
    blueprint[5] = 1;

    blueprint[6] = 1;
    blueprint[7] = 0;

    blueprint[8] = 1;
    blueprint[9] = -1;

    blueprint[10] = 1;
    blueprint[11] = 1;

    blueprint[12] = -1;
    blueprint[13] = 0;

    blueprint[14] = -1;
    blueprint[15] = -1;

    blueprint[16] = -1;
    blueprint[17] = 1;
  }

  function get4x4Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](32);
    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = 0;
    blueprint[5] = 1;

    blueprint[6] = 1;
    blueprint[7] = 0;

    blueprint[8] = 1;
    blueprint[9] = -1;

    blueprint[10] = 1;
    blueprint[11] = 1;

    blueprint[12] = -1;
    blueprint[13] = 0;

    blueprint[14] = -1;
    blueprint[15] = -1;

    blueprint[16] = -1;
    blueprint[17] = 1;

    blueprint[18] = 0;
    blueprint[19] = -2;

    blueprint[20] = -1;
    blueprint[21] = -2;

    blueprint[22] = -2;
    blueprint[23] = -2;

    blueprint[24] = 1;
    blueprint[25] = -2;

    blueprint[26] = -2;
    blueprint[27] = 0;

    blueprint[28] = -2;
    blueprint[29] = 1;

    blueprint[30] = -2;
    blueprint[31] = -1;
  }
}
