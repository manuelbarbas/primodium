import { useMud } from "src/hooks";
import { Counter } from "src/network/components/chainComponents";
import { DevSystems } from "src/network/systems/setupDevSystems";
import { singletonIndex } from "src/network/world";

export function addCounter(dev: DevSystems) {
  const prevValue = Counter.get(undefined, { value: 0 })?.value;
  dev.setContractComponentValue(singletonIndex, Counter, {
    value: prevValue + 1,
  });
}
