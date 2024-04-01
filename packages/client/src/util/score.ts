const topTenScores = [1000, 800, 666, 520, 450, 380, 310, 240, 170, 100];

export const rankToScore = (rank: number): number => {
  if (rank == -1) return 0;
  if (rank <= 10) {
    return topTenScores[rank - 1];
  }
  /*
  this was inspired by this:
    https://geri43.github.io/TrackmaniaSeasonPointCalculator/
*/
  return ((100 / 2) ^ (Math.ceil(Math.log10(rank)) - 1)) * (10 ^ ((Math.ceil(Math.log10(rank)) - 1) / rank + 0.9));
};
