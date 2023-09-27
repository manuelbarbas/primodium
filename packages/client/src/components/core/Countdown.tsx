export const Countdown: React.FC<{ value: number }> = ({ value }) => {
  return (
    <span className="countdown">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <span style={{ "--value": value }}></span>
    </span>
  );
};
