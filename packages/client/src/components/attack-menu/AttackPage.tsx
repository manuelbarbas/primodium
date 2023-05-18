import AttackActivated from "./AttackActivated";
import ChooseMunitions from "./ChooseMunitions";

function AttackPage() {
  return (
    <div>
      {/* 1. If the user doesn't have a launcher tile selected, display the following: */}
      <div>Select a launcher to open the attack menu.</div>
      {/* 2. Show the following screen if the user has the launcher tile selected: */}
      <AttackActivated />
      {/* 3. The following shows up after users click "next" in the AttackActivated screen */}
      <ChooseMunitions />
    </div>
  );
}

export default AttackPage;
