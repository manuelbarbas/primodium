// For analytics or human-scale user parameters (e.g. building levels) that are known to never exceed the range of a number
function bigintToNumber(value: bigint | number) {
  if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
    return Number(value);
  } else {
    return 0;
  }
}
