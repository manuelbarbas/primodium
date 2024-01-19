import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { ResourceEnumLookup } from "./constants";

export function getOutAmount(inAmount: bigint, path: Entity[]) {
  if (path.length < 2 || inAmount == 0n) return 0n;
  let amountOut = inAmount;
  for (let i = 0; i < path.length - 1; i++) {
    const [resourceA, resourceB] = getResourcePair(path[i], path[i + 1]);
    const reserves = components.Reserves.getWithKeys({ resourceA, resourceB });
    console.log("reserves", reserves);
    if (!reserves?.amountA || !reserves?.amountB) return 0n;
    amountOut = getOutAmountTrade(amountOut, reserves.amountA, reserves.amountB);
    console.log("amount out", amountOut);
  }
  return amountOut;
}

export function getInAmount(outAmount: bigint, path: Entity[]) {
  return getOutAmount(outAmount, path.reverse());
}

// Assuming P_MarketplaceConfig.getSlippageThousandths() is a function that returns a BigNumber
function getOutAmountTrade(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  const slippage = components.P_MarketplaceConfig.get()?.slippageThousandths ?? 0n;
  const amountInWithFee = amountIn * (1000n - slippage);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;

  return numerator / denominator;
}

function getResourcePair(entityA: Entity, entityB: Entity) {
  const resourceA = ResourceEnumLookup[entityA];
  const resourceB = ResourceEnumLookup[entityB];
  return resourceA < resourceB ? [resourceA, resourceB] : [resourceB, resourceA];
}
