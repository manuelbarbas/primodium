function AttackActivated() {
  return (
    <div className="pr-4">
      <div className="mb-3">
        Choose an enemy tile on the map and select "Lock on target" to attack
        the tile.
      </div>
      <button className="bg-green-600 h-10 px-6 rounded font-bold">
        Lock on target
      </button>
      <button className="absolute bottom-4 right-4 text-center h-10 w-24 bg-blue-600 hover:bg-blue-700 font-bold rounded text-sm">
        Next
      </button>
    </div>
  );
}

export default AttackActivated;
