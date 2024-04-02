const rankToScoreMap = new Map<number, number>(
  // define the top ten ranks
  [1000, 800, 666, 520, 450, 380, 310, 240, 170, 100].map((score, index) => [index + 1, score])
);

export const rankToScore = (rank: number): number => {
  if (rank < 1) return 0;
  if (rankToScoreMap.has(rank)) return rankToScoreMap.get(rank) as number;
  /*
  this was inspired by this:
    https://geri43.github.io/TrackmaniaSeasonPointCalculator/
*/
  const val = ((100 / 2) ^ (Math.ceil(Math.log10(rank)) - 1)) * (10 ^ ((Math.ceil(Math.log10(rank)) - 1) / rank + 0.9));
  rankToScoreMap.set(rank, val);
  return val;
};
