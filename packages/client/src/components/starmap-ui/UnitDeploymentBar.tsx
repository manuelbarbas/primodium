const availableUnits = [
  {
    name: "Drone",
    remaining: 100,
    total: 100,
  },
  {
    name: "Drone",
    remaining: 100,
    total: 100,
  },
  {
    name: "Drone",
    remaining: 100,
    total: 100,
  },
];

export const UnitDeploymentBar: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-full w-96 pointer-events-auto">
      <div className="relative flex flex-col justify-between bg-slate-900/90 pixel-images border border-cyan-400 p-2">
        <div className="flex space-x-2">
          {availableUnits.map((unit, index) => {
            return (
              <div key={index} className="relative flex flex-col items-center">
                <img
                  src="/img/icons/debugicon.png"
                  className="border border-cyan-400 w-[64px] h-[64  px]"
                />
                <p className="absolute -bottom-2 text-xs bg-slate-900">
                  {unit.name}
                </p>
                <p className="absolute right-0 font-bold text-[.6rem] bg-slate-900">
                  {unit.remaining}/{unit.total}
                </p>
              </div>
            );
          })}
        </div>
        <div className="w-full flex justify-end">
          <button className="p-1 px-2 border border-cyan-400 text-xs">
            DEPLOY UNITS
          </button>
        </div>
      </div>
    </div>
  );
};
