import { UnitBreakdown } from "./UnitBreakdown";

export const TargetInfo: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 pointer-events-auto">
      <div className="relative flex pixel-images h-32 w-fit bg-slate-900/90">
        <div className="relative">
          <img
            src="/img/asteroid-titanium.png"
            className="border border-r-0 border-cyan-400 h-full w-auto object-cover"
          />
          <p className="absolute bottom-1 right-1 bg-slate-900/90 text-xs">
            [10, 10]
          </p>
        </div>
        <div className="border border-cyan-400 text-xs grid grid-rows-3">
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">NAME</b>
            <p>Titanium Motherlode</p>
          </div>
          <div className="w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">OWNER</b>
            <p>Neutral</p>
          </div>
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">QTY</b>
            <p>100 TITANIUM</p>
          </div>
        </div>
      </div>
      <UnitBreakdown />
    </div>
  );
};
