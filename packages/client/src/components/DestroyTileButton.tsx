import { BlockTypeActionComponent } from "../util/types";

function DestroyTileButton({ action }: BlockTypeActionComponent) {
  return (
    <button
      className="absolute bottom-4 right-4 h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
      onClick={action}
    >
      <p className="inline-block ml-1">Destroy</p>
    </button>
  );
}

export default DestroyTileButton;
