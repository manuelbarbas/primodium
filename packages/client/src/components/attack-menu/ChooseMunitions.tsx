function ChooseMunitions() {
  return (
    <div className="pr-4">
      <div className="mb-3">Select munition used for launch </div>
      <button className="w-16 h-16 ">
        <img
          className="w-16 h-16 pixel-images"
          src="/img/crafted/kineticmissile.png"
        ></img>
        <div className="h-2"></div>
        12
      </button>
      <button className="w-16 h-16 ">
        <img
          className="w-16 h-16 pixel-images"
          src="/img/crafted/penetratingmissile.png"
        ></img>
        <div className="h-2"></div>4
      </button>

      <button className="w-16 h-16 ">
        <img
          className="w-16 h-16 pixel-images"
          src="/img/crafted/thermobaricmissile.png"
        ></img>
        <div className="h-2"></div>
        19
      </button>
      <button className="absolute bottom-4 right-4 text-center h-10 w-24 bg-red-600 hover:bg-red-700 font-bold rounded text-sm">
        Fire
      </button>

      <button className="absolute bottom-4 left-4 text-center h-10 w-24 bg-blue-600 hover:bg-blue-700 font-bold rounded text-sm">
        Back
      </button>
    </div>
  );
}

export default ChooseMunitions;
