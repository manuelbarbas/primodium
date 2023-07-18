const wrap = (index: number, length: number) => {
  return ((index % length) + length) % length;
};
export default wrap;
