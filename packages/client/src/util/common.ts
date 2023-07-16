export function hasCommonElement(setA: Set<any>, setB: Set<any>) {
  for (let element of setA) {
    if (setB.has(element)) {
      return true; // Found a common element
    }
  }
  return false; // No common elements found
}
