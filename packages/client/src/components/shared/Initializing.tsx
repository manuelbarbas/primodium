import { Progress } from "../core/Progress";

export const Initializing = () => (
  <div className="bg-black h-screen">
    <div className="absolute w-full h-full star-background opacity-40" />
    <div className="relative">
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-white">
            <span className="font-mono">Initializing</span>
            <span>&hellip;</span>
          </p>
          <Progress value={100} max={100} className="animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);
