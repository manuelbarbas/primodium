import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Account } from "src/components/transfer/Account";

export const AccountSettings = () => {
  return (
    <Navigator.Screen title="account">
      <SecondaryCard className="w-full space-y-5">
        <Account />
      </SecondaryCard>
      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
