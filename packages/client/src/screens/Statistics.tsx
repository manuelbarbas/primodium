import { components } from "src/network/components";

export const Statistics = () => {
  const data = components.Leaderboard.use();
  console.log(data);

  return (
    <div>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};
