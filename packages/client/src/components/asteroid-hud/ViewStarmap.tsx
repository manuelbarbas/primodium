import { Button } from "../core/Button";

export const ViewStarmap = () => {
  return (
    <Button
      className="w-full flex gap-2 btn-warning bg-gradient-to-br from-rose-700 to-pink-600 border-2 ring-2 ring-error/30 border-rose-900 drop-shadow-2xl text-base-content pixel-images overflow-y-hidden group outline-none"
      onClick={() => {
        return;
      }}
    >
      <span className="absolute bg-orange-400/50 -right-96 -bottom-0 group-hover:-right-16 group-hover:bottom-0 h-32 w-32 rounded-full mix-blend-overlay transition-all duration-200" />
      <img src="img/icons/starmapicon.png" className="pixel-images w-8 h-8" />
      <span className="flex font-bold gap-1">OPEN STAR MAP</span>
    </Button>
  );
};
