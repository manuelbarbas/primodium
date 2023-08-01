export function safeIndex<Element extends any>(
  index: number,
  arr: Array<Element>
): Element {
  if (index < 0) {
    index = 0;
  }
  if (index >= arr.length) {
    index = arr.length - 1;
  }
  return arr[index];
}
