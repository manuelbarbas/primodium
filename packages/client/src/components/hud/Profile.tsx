import { FaHandshake, FaHandshakeSlash, FaUser } from "react-icons/fa";
import { useMud } from "src/hooks";
import { Modal } from "../core/Modal";
import { Tooltip } from "../core/Tooltip";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Account } from "../transfer/Account";
import { Card } from "../core/Card";
import { Score } from "./Score";

export const Profile = () => {
  const {
    playerAccount: { entity: playerEntity },
    sessionAccount,
  } = useMud();
  const delegate = sessionAccount?.entity;

  return (
    <Card className="ml-2 border-t-0 !p-0 items-center">
      <div className="flex gap-2 items-center justify-center p-2 text-success">
        <FaUser />
        <AccountDisplay player={playerEntity} />
      </div>
      <Score />
      <Modal title="account">
        <Modal.Button className="absolute -bottom-8 btn-xs btn-ghost flex gap-2 m-auto text-accent mt-1 w-fit">
          <Tooltip text={`${delegate ? "" : "not"} delegating`} direction="bottom">
            <div>
              {delegate ? (
                <FaHandshake className="text-success w-4 h-4" />
              ) : (
                <FaHandshakeSlash className="text-error w-4 h-4" />
              )}
            </div>
          </Tooltip>
          <p>MANAGE ACCOUNT</p>
        </Modal.Button>
        <Modal.Content className="w-[40rem] h-[50rem]">
          <Account />
        </Modal.Content>
      </Modal>
    </Card>
  );
};
