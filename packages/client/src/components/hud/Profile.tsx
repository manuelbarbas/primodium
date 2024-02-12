import { FaHandshake, FaHandshakeSlash, FaUser } from "react-icons/fa";
import { useMud } from "src/hooks";
import { Card } from "../core/Card";
import { Modal } from "../core/Modal";
import { Tooltip } from "../core/Tooltip";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Account } from "../transfer/Account";
import { Score } from "./Score";

export const Profile = () => {
  const {
    playerAccount: { entity: playerEntity },
    sessionAccount,
  } = useMud();
  const delegate = sessionAccount?.entity;

  return (
    <Card className="border-t-0 !p-0 items-center">
      <div className="flex gap-2 items-center justify-center p-2 text-success">
        <FaUser />
        <AccountDisplay player={playerEntity} />
      </div>
      <Score player={playerEntity} />
      <Modal title="account">
        <Modal.Button className="btn-xs btn-ghost flex gap-2 m-auto text-accent w-fit">
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
