import AttackPage from "./AttackPage";

function AttackBox() {
  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className="mt-4 mx-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Attack Enemies</p>
        <AttackPage />
      </div>
    </div>
  );
}

export default AttackBox;
