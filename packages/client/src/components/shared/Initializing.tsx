import { Progress } from "../core/Progress";

export const Initializing = ({ message = "Loading", className }: { message?: string; className?: string }) => (
  <div className={`bg-black h-screen ${className}`}>
    <div className="absolute w-full h-full star-background opacity-40" />
    <div className="flex flex-col items-center gap-4 h-screen justify-center">
      <p className="text-lg text-white">
        <span className="font-mono">{message}</span>
        <span>&hellip;</span>
      </p>
      <Progress value={100} max={100} className="animate-pulse w-48" />
    </div>
  </div>
);
