export function hasCommonElement(setA: Set<any>, setB: Set<any>) {
  for (let element of setA) {
    if (setB.has(element)) {
      return true; // Found a common element
    }
  }
  return false; // No common elements found
}

export function clampedIndex(index: number, length: number) {
  if (index < 0) {
    return 0;
  }
  if (index >= length) {
    return length - 1;
  }
  return index;
}
