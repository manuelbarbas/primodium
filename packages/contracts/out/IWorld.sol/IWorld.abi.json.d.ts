declare const abi: [
  {
    type: "function";
    name: "Pri_11__abandonAsteroid";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__abandonFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__acceptRequestToJoin";
    inputs: [
      {
        name: "accepted";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__addLiquidity";
    inputs: [
      {
        name: "resourceA";
        type: "uint8";
        internalType: "enum EResource";
      },
      {
        name: "resourceB";
        type: "uint8";
        internalType: "enum EResource";
      },
      {
        name: "liquidityA";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "liquidityB";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__applyDamage";
    inputs: [
      {
        name: "battleEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "attackingPlayer";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "defender";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "damage";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [
      {
        name: "";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__attack";
    inputs: [
      {
        name: "entity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "targetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__battleRaidResolve";
    inputs: [
      {
        name: "battleEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "raider";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "target";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__build";
    inputs: [
      {
        name: "buildingType";
        type: "uint8";
        internalType: "enum EBuilding";
      },
      {
        name: "coord";
        type: "tuple";
        internalType: "struct PositionData";
        components: [
          {
            name: "x";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "y";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "parentEntity";
            type: "bytes32";
            internalType: "bytes32";
          },
        ];
      },
    ];
    outputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__buildRaidableAsteroid";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__changeHome";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__claimObjective";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "objective";
        type: "uint8";
        internalType: "enum EObjectives";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__claimPrimodium";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__claimResources";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__claimShardAsteroidPoints";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__claimUnits";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearFleetStance";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearMaxStorageIncrease";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearProductionRate";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearResources";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearUnits";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearUnitsAndResourcesFromFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__clearUtilityUsage";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__create";
    inputs: [
      {
        name: "name";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "allianceInviteMode";
        type: "uint8";
        internalType: "enum EAllianceInviteMode";
      },
    ];
    outputs: [
      {
        name: "allianceEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__createFleet";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__createSecondaryAsteroid";
    inputs: [
      {
        name: "positionData";
        type: "tuple";
        internalType: "struct PositionData";
        components: [
          {
            name: "x";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "y";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "parentEntity";
            type: "bytes32";
            internalType: "bytes32";
          },
        ];
      },
    ];
    outputs: [
      {
        name: "";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__declineInvite";
    inputs: [
      {
        name: "inviter";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__destroy";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__grantRole";
    inputs: [
      {
        name: "target";
        type: "address";
        internalType: "address";
      },
      {
        name: "role";
        type: "uint8";
        internalType: "enum EAllianceRole";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__increaseMaxStorage";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "level";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__increment";
    inputs: [];
    outputs: [
      {
        name: "";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__initAsteroidOwner";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "playerEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__invite";
    inputs: [
      {
        name: "target";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__join";
    inputs: [
      {
        name: "alliance";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__kick";
    inputs: [
      {
        name: "target";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__landFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__leave";
    inputs: [];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__mergeFleets";
    inputs: [
      {
        name: "fleets";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__moveBuilding";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "toCoord";
        type: "tuple";
        internalType: "struct PositionData";
        components: [
          {
            name: "x";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "y";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "parentEntity";
            type: "bytes32";
            internalType: "bytes32";
          },
        ];
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__payForMaxColonySlots";
    inputs: [
      {
        name: "shipyardEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "paymentAmounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [
      {
        name: "";
        type: "bool";
        internalType: "bool";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__recallFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__receiveRewards";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "objectivePrototype";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__rejectRequestToJoin";
    inputs: [
      {
        name: "rejectee";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__removeLiquidity";
    inputs: [
      {
        name: "resourceA";
        type: "uint8";
        internalType: "enum EResource";
      },
      {
        name: "resourceB";
        type: "uint8";
        internalType: "enum EResource";
      },
      {
        name: "liquidityA";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "liquidityB";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__requestToJoin";
    inputs: [
      {
        name: "alliance";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__resetFleetIfNoUnitsLeft";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__resolveBattleEncryption";
    inputs: [
      {
        name: "battleEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "targetAsteroid";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "aggressorEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__resolveConquerColonyShip";
    inputs: [
      {
        name: "asteroidTargetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "aggressorEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__revokeInvite";
    inputs: [
      {
        name: "target";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__sendFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "position";
        type: "tuple";
        internalType: "struct PositionData";
        components: [
          {
            name: "x";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "y";
            type: "int32";
            internalType: "int32";
          },
          {
            name: "parentEntity";
            type: "bytes32";
            internalType: "bytes32";
          },
        ];
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__sendFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__setAllianceInviteMode";
    inputs: [
      {
        name: "entity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "allianceInviteMode";
        type: "uint8";
        internalType: "enum EAllianceInviteMode";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__setAllianceName";
    inputs: [
      {
        name: "entity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "newName";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__setFleetStance";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "stance";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "target";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__spawn";
    inputs: [];
    outputs: [
      {
        name: "";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__spendBuildingRequiredResources";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "level";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__spendUpgradeResources";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "upgradePrototype";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "level";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__swap";
    inputs: [
      {
        name: "marketEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "path";
        type: "uint8[]";
        internalType: "enum EResource[]";
      },
      {
        name: "amountIn";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "amountOutMin";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__toggleBuilding";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [
      {
        name: "isActive";
        type: "bool";
        internalType: "bool";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__toggleBuildingUtility";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__toggleMarketplaceLock";
    inputs: [];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__toggleMaxStorage";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__toggleProductionRate";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__trainUnits";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unit";
        type: "uint8";
        internalType: "enum EUnit";
      },
      {
        name: "count";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__trainUnits";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitPrototype";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "count";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferAsteroid";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "ownerEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferResourcesFromAsteroidToFleet";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferResourcesFromFleetToAsteroid";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferResourcesFromFleetToFleet";
    inputs: [
      {
        name: "fromFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "toFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferResourcesTwoWay";
    inputs: [
      {
        name: "leftEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "rightEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "resourceCounts";
        type: "int256[]";
        internalType: "int256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsAndResourcesFromAsteroidToFleet";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsAndResourcesFromFleetToAsteroid";
    inputs: [
      {
        name: "fromFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsAndResourcesFromFleetToFleet";
    inputs: [
      {
        name: "fromFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "toFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
      {
        name: "resourceCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsAndResourcesTwoWay";
    inputs: [
      {
        name: "leftEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "rightEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "int256[]";
        internalType: "int256[]";
      },
      {
        name: "resourceCounts";
        type: "int256[]";
        internalType: "int256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsFromAsteroidToFleet";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsFromFleetToAsteroid";
    inputs: [
      {
        name: "fromFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsFromFleetToFleet";
    inputs: [
      {
        name: "fromFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "toFleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "uint256[]";
        internalType: "uint256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__transferUnitsTwoWay";
    inputs: [
      {
        name: "leftEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "rightEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unitCounts";
        type: "int256[]";
        internalType: "int256[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__uncheckedAbandonFleet";
    inputs: [
      {
        name: "fleetEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__upgradeBuilding";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__upgradeProductionRate";
    inputs: [
      {
        name: "buildingEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "level";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__upgradeRange";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__upgradeUnit";
    inputs: [
      {
        name: "asteroidEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "unit";
        type: "uint8";
        internalType: "enum EUnit";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "Pri_11__wormholeDeposit";
    inputs: [
      {
        name: "wormholeBaseEntity";
        type: "bytes32";
        internalType: "bytes32";
      },
      {
        name: "count";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "batchCall";
    inputs: [
      {
        name: "systemCalls";
        type: "tuple[]";
        internalType: "struct SystemCallData[]";
        components: [
          {
            name: "systemId";
            type: "bytes32";
            internalType: "ResourceId";
          },
          {
            name: "callData";
            type: "bytes";
            internalType: "bytes";
          },
        ];
      },
    ];
    outputs: [
      {
        name: "returnDatas";
        type: "bytes[]";
        internalType: "bytes[]";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "batchCallFrom";
    inputs: [
      {
        name: "systemCalls";
        type: "tuple[]";
        internalType: "struct SystemCallFromData[]";
        components: [
          {
            name: "from";
            type: "address";
            internalType: "address";
          },
          {
            name: "systemId";
            type: "bytes32";
            internalType: "ResourceId";
          },
          {
            name: "callData";
            type: "bytes";
            internalType: "bytes";
          },
        ];
      },
    ];
    outputs: [
      {
        name: "returnDatas";
        type: "bytes[]";
        internalType: "bytes[]";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "call";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "callData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [
      {
        name: "";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "payable";
  },
  {
    type: "function";
    name: "callFrom";
    inputs: [
      {
        name: "delegator";
        type: "address";
        internalType: "address";
      },
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "callData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [
      {
        name: "";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "payable";
  },
  {
    type: "function";
    name: "creator";
    inputs: [];
    outputs: [
      {
        name: "";
        type: "address";
        internalType: "address";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "deleteRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "getDynamicField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [
      {
        name: "";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getDynamicFieldLength";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [
      {
        name: "";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getDynamicFieldSlice";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "start";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "end";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getFieldLayout";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getFieldLength";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [
      {
        name: "";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getFieldLength";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [
      {
        name: "";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getKeySchema";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [
      {
        name: "keySchema";
        type: "bytes32";
        internalType: "Schema";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [
      {
        name: "staticData";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "encodedLengths";
        type: "bytes32";
        internalType: "EncodedLengths";
      },
      {
        name: "dynamicData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
    ];
    outputs: [
      {
        name: "staticData";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "encodedLengths";
        type: "bytes32";
        internalType: "EncodedLengths";
      },
      {
        name: "dynamicData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getStaticField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [
      {
        name: "";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "getValueSchema";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [
      {
        name: "valueSchema";
        type: "bytes32";
        internalType: "Schema";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "grantAccess";
    inputs: [
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "grantee";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "initialize";
    inputs: [
      {
        name: "initModule";
        type: "address";
        internalType: "contract IModule";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "installModule";
    inputs: [
      {
        name: "module";
        type: "address";
        internalType: "contract IModule";
      },
      {
        name: "encodedArgs";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "installRootModule";
    inputs: [
      {
        name: "module";
        type: "address";
        internalType: "contract IModule";
      },
      {
        name: "encodedArgs";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "popFromDynamicField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "byteLengthToPop";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "pushToDynamicField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "dataToPush";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerDelegation";
    inputs: [
      {
        name: "delegatee";
        type: "address";
        internalType: "address";
      },
      {
        name: "delegationControlId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "initCallData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerFunctionSelector";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "systemFunctionSignature";
        type: "string";
        internalType: "string";
      },
    ];
    outputs: [
      {
        name: "worldFunctionSelector";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerNamespace";
    inputs: [
      {
        name: "namespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerNamespaceDelegation";
    inputs: [
      {
        name: "namespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "delegationControlId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "initCallData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerRootFunctionSelector";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "worldFunctionSignature";
        type: "string";
        internalType: "string";
      },
      {
        name: "systemFunctionSignature";
        type: "string";
        internalType: "string";
      },
    ];
    outputs: [
      {
        name: "worldFunctionSelector";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerStoreHook";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "hookAddress";
        type: "address";
        internalType: "contract IStoreHook";
      },
      {
        name: "enabledHooksBitmap";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerSystem";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "system";
        type: "address";
        internalType: "contract System";
      },
      {
        name: "publicAccess";
        type: "bool";
        internalType: "bool";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerSystemHook";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "hookAddress";
        type: "address";
        internalType: "contract ISystemHook";
      },
      {
        name: "enabledHooksBitmap";
        type: "uint8";
        internalType: "uint8";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "registerTable";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
      {
        name: "keySchema";
        type: "bytes32";
        internalType: "Schema";
      },
      {
        name: "valueSchema";
        type: "bytes32";
        internalType: "Schema";
      },
      {
        name: "keyNames";
        type: "string[]";
        internalType: "string[]";
      },
      {
        name: "fieldNames";
        type: "string[]";
        internalType: "string[]";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "renounceOwnership";
    inputs: [
      {
        name: "namespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "revokeAccess";
    inputs: [
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "grantee";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "setDynamicField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "setField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "setField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "setRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "staticData";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "encodedLengths";
        type: "bytes32";
        internalType: "EncodedLengths";
      },
      {
        name: "dynamicData";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "setStaticField";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "fieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "fieldLayout";
        type: "bytes32";
        internalType: "FieldLayout";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "spliceDynamicData";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        internalType: "uint8";
      },
      {
        name: "startWithinField";
        type: "uint40";
        internalType: "uint40";
      },
      {
        name: "deleteCount";
        type: "uint40";
        internalType: "uint40";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "spliceStaticData";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        internalType: "bytes32[]";
      },
      {
        name: "start";
        type: "uint48";
        internalType: "uint48";
      },
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "storeVersion";
    inputs: [];
    outputs: [
      {
        name: "version";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "function";
    name: "transferBalanceToAddress";
    inputs: [
      {
        name: "fromNamespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "toAddress";
        type: "address";
        internalType: "address";
      },
      {
        name: "amount";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "transferBalanceToNamespace";
    inputs: [
      {
        name: "fromNamespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "toNamespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "amount";
        type: "uint256";
        internalType: "uint256";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "transferOwnership";
    inputs: [
      {
        name: "namespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "newOwner";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "unregisterDelegation";
    inputs: [
      {
        name: "delegatee";
        type: "address";
        internalType: "address";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "unregisterNamespaceDelegation";
    inputs: [
      {
        name: "namespaceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "unregisterStoreHook";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "hookAddress";
        type: "address";
        internalType: "contract IStoreHook";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "unregisterSystemHook";
    inputs: [
      {
        name: "systemId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "hookAddress";
        type: "address";
        internalType: "contract ISystemHook";
      },
    ];
    outputs: [];
    stateMutability: "nonpayable";
  },
  {
    type: "function";
    name: "worldVersion";
    inputs: [];
    outputs: [
      {
        name: "";
        type: "bytes32";
        internalType: "bytes32";
      },
    ];
    stateMutability: "view";
  },
  {
    type: "event";
    name: "HelloStore";
    inputs: [
      {
        name: "storeVersion";
        type: "bytes32";
        indexed: true;
        internalType: "bytes32";
      },
    ];
    anonymous: false;
  },
  {
    type: "event";
    name: "HelloWorld";
    inputs: [
      {
        name: "worldVersion";
        type: "bytes32";
        indexed: true;
        internalType: "bytes32";
      },
    ];
    anonymous: false;
  },
  {
    type: "event";
    name: "Store_DeleteRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        indexed: true;
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        indexed: false;
        internalType: "bytes32[]";
      },
    ];
    anonymous: false;
  },
  {
    type: "event";
    name: "Store_SetRecord";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        indexed: true;
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        indexed: false;
        internalType: "bytes32[]";
      },
      {
        name: "staticData";
        type: "bytes";
        indexed: false;
        internalType: "bytes";
      },
      {
        name: "encodedLengths";
        type: "bytes32";
        indexed: false;
        internalType: "EncodedLengths";
      },
      {
        name: "dynamicData";
        type: "bytes";
        indexed: false;
        internalType: "bytes";
      },
    ];
    anonymous: false;
  },
  {
    type: "event";
    name: "Store_SpliceDynamicData";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        indexed: true;
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        indexed: false;
        internalType: "bytes32[]";
      },
      {
        name: "dynamicFieldIndex";
        type: "uint8";
        indexed: false;
        internalType: "uint8";
      },
      {
        name: "start";
        type: "uint48";
        indexed: false;
        internalType: "uint48";
      },
      {
        name: "deleteCount";
        type: "uint40";
        indexed: false;
        internalType: "uint40";
      },
      {
        name: "encodedLengths";
        type: "bytes32";
        indexed: false;
        internalType: "EncodedLengths";
      },
      {
        name: "data";
        type: "bytes";
        indexed: false;
        internalType: "bytes";
      },
    ];
    anonymous: false;
  },
  {
    type: "event";
    name: "Store_SpliceStaticData";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        indexed: true;
        internalType: "ResourceId";
      },
      {
        name: "keyTuple";
        type: "bytes32[]";
        indexed: false;
        internalType: "bytes32[]";
      },
      {
        name: "start";
        type: "uint48";
        indexed: false;
        internalType: "uint48";
      },
      {
        name: "data";
        type: "bytes";
        indexed: false;
        internalType: "bytes";
      },
    ];
    anonymous: false;
  },
  {
    type: "error";
    name: "EncodedLengths_InvalidLength";
    inputs: [
      {
        name: "length";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_Empty";
    inputs: [];
  },
  {
    type: "error";
    name: "FieldLayout_InvalidStaticDataLength";
    inputs: [
      {
        name: "staticDataLength";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "computedStaticDataLength";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_StaticLengthDoesNotFitInAWord";
    inputs: [
      {
        name: "index";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_StaticLengthIsNotZero";
    inputs: [
      {
        name: "index";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_StaticLengthIsZero";
    inputs: [
      {
        name: "index";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_TooManyDynamicFields";
    inputs: [
      {
        name: "numFields";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "maxFields";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "FieldLayout_TooManyFields";
    inputs: [
      {
        name: "numFields";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "maxFields";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Module_AlreadyInstalled";
    inputs: [];
  },
  {
    type: "error";
    name: "Module_MissingDependency";
    inputs: [
      {
        name: "dependency";
        type: "address";
        internalType: "address";
      },
    ];
  },
  {
    type: "error";
    name: "Module_NonRootInstallNotSupported";
    inputs: [];
  },
  {
    type: "error";
    name: "Module_RootInstallNotSupported";
    inputs: [];
  },
  {
    type: "error";
    name: "Schema_InvalidLength";
    inputs: [
      {
        name: "length";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Schema_StaticTypeAfterDynamicType";
    inputs: [];
  },
  {
    type: "error";
    name: "Slice_OutOfBounds";
    inputs: [
      {
        name: "data";
        type: "bytes";
        internalType: "bytes";
      },
      {
        name: "start";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "end";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_IndexOutOfBounds";
    inputs: [
      {
        name: "length";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "accessedIndex";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidBounds";
    inputs: [
      {
        name: "start";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "end";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidFieldNamesLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidKeyNamesLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidResourceType";
    inputs: [
      {
        name: "expected";
        type: "bytes2";
        internalType: "bytes2";
      },
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "resourceIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidSplice";
    inputs: [
      {
        name: "startWithinField";
        type: "uint40";
        internalType: "uint40";
      },
      {
        name: "deleteCount";
        type: "uint40";
        internalType: "uint40";
      },
      {
        name: "fieldLength";
        type: "uint40";
        internalType: "uint40";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidStaticDataLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidValueSchemaDynamicLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidValueSchemaLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_InvalidValueSchemaStaticLength";
    inputs: [
      {
        name: "expected";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "received";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "Store_TableAlreadyExists";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "tableIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "Store_TableNotFound";
    inputs: [
      {
        name: "tableId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "tableIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "World_AccessDenied";
    inputs: [
      {
        name: "resource";
        type: "string";
        internalType: "string";
      },
      {
        name: "caller";
        type: "address";
        internalType: "address";
      },
    ];
  },
  {
    type: "error";
    name: "World_AlreadyInitialized";
    inputs: [];
  },
  {
    type: "error";
    name: "World_CallbackNotAllowed";
    inputs: [
      {
        name: "functionSelector";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
  },
  {
    type: "error";
    name: "World_DelegationNotFound";
    inputs: [
      {
        name: "delegator";
        type: "address";
        internalType: "address";
      },
      {
        name: "delegatee";
        type: "address";
        internalType: "address";
      },
    ];
  },
  {
    type: "error";
    name: "World_FunctionSelectorAlreadyExists";
    inputs: [
      {
        name: "functionSelector";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
  },
  {
    type: "error";
    name: "World_FunctionSelectorNotFound";
    inputs: [
      {
        name: "functionSelector";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
  },
  {
    type: "error";
    name: "World_InsufficientBalance";
    inputs: [
      {
        name: "balance";
        type: "uint256";
        internalType: "uint256";
      },
      {
        name: "amount";
        type: "uint256";
        internalType: "uint256";
      },
    ];
  },
  {
    type: "error";
    name: "World_InterfaceNotSupported";
    inputs: [
      {
        name: "contractAddress";
        type: "address";
        internalType: "address";
      },
      {
        name: "interfaceId";
        type: "bytes4";
        internalType: "bytes4";
      },
    ];
  },
  {
    type: "error";
    name: "World_InvalidNamespace";
    inputs: [
      {
        name: "namespace";
        type: "bytes14";
        internalType: "bytes14";
      },
    ];
  },
  {
    type: "error";
    name: "World_InvalidResourceId";
    inputs: [
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "resourceIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "World_InvalidResourceType";
    inputs: [
      {
        name: "expected";
        type: "bytes2";
        internalType: "bytes2";
      },
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "resourceIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "World_ResourceAlreadyExists";
    inputs: [
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "resourceIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "World_ResourceNotFound";
    inputs: [
      {
        name: "resourceId";
        type: "bytes32";
        internalType: "ResourceId";
      },
      {
        name: "resourceIdString";
        type: "string";
        internalType: "string";
      },
    ];
  },
  {
    type: "error";
    name: "World_SystemAlreadyExists";
    inputs: [
      {
        name: "system";
        type: "address";
        internalType: "address";
      },
    ];
  },
  {
    type: "error";
    name: "World_UnlimitedDelegationNotAllowed";
    inputs: [];
  },
];
export default abi;
