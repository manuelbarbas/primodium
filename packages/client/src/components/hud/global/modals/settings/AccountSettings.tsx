import { Navigator } from "@/components/core/Navigator";
import { Account } from "@/components/transfer/Account";

export const AccountSettings = () => {
  return (
    <Navigator.Screen title="account">
      <Account />
      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
