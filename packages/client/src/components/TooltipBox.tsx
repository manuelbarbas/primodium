function TooltipBox() {
  return (
    <div className="z-[1000] fixed bottom-4 right-4 h-72 w-96 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
      <div className=" mt-4 ml-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Tile Info</p>
        <div className="grid grid-cols-1 gap-1.5 overflow-y-scroll scrollbar">
          <div className="flex flex-col">
            <div className="flex align-center">
              <div className="inline-block w-16 h-16">
                <img
                  src={
                    "https://mindustrygame.github.io/wiki/images/block-unit-cargo-loader-ui.png"
                  }
                ></img>
              </div>
              <div className="ml-4 flex flex-col my-auto">
                <div className="font-bold mb-1">Iron Drill 2×2</div>
                <div>20 gold 20 Carbon</div>
              </div>
            </div>
            <div className="mt-4 text-base font-bold">
              Output Efficiency: 90%
            </div>

            <div className="mt-4">
              <p>Drills iron at 10/tile/block</p>
              <p>Input water for 1.5× speed</p>
              <p>Input coolant for 2× speed</p>
              <p>Input lava for 0.2× speed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default TooltipBox;
