import { Account } from "@/components/transfer/Account";
import { Navigator } from "@/components/core/Navigator";

export const AccountSettings = () => {
  return (
    <Navigator.Screen title="account">
      <Account />
      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
