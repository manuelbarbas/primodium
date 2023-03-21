// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatrixTraversal {
  function traverseMatrix(uint256[][] memory matrix) internal pure returns (uint256[] memory) {
    uint256 i = matrix.length;
    uint256 j = matrix[0].length;
    uint256 totalElements = i * j;

    uint256[] memory traversalOrder = new uint256[](totalElements);

    uint256 index = 0;
    uint256 radius = 0;
    while (index < totalElements) {
      for (uint256 r = radius; r <= radius && index < totalElements; r++) {
        uint256 row = i / 2;
        uint256 col = j / 2;
        for (uint256 k = 0; k < r && index < totalElements; k++) {
          row--;
          traversalOrder[index] = matrix[row][col];
          index++;
        }
        for (uint256 k = 0; k < r && index < totalElements; k++) {
          col++;
          traversalOrder[index] = matrix[row][col];
          index++;
        }
        for (uint256 k = 0; k < r && index < totalElements; k++) {
          row++;
          traversalOrder[index] = matrix[row][col];
          index++;
        }
        for (uint256 k = 0; k < r && index < totalElements; k++) {
          col--;
          traversalOrder[index] = matrix[row][col];
          index++;
        }
      }
      radius++;
    }
    return traversalOrder;
  }
}
