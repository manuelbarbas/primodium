import { FaHandshake, FaHandshakeSlash } from "react-icons/fa";
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
    <Card className="!p-0 items-center drop-shadow-hard">
      <div className="flex gap-2 items-center justify-center p-2 text-success">
        <Modal title="account">
          <Modal.Button className="btn-sm !p-1 !m btn-ghost flex gap-2 text-accent w-fit">
            <Tooltip text={`${delegate ? "" : "not"} delegating`} direction="right">
              <div>
                {delegate ? (
                  <FaHandshake className="text-success w-4 h-4" />
                ) : (
                  <FaHandshakeSlash className="text-error w-4 h-4" />
                )}
              </div>
            </Tooltip>
            {/* <p>MANAGE ACCOUNT</p> */}
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-fit">
            <Account />
          </Modal.Content>
        </Modal>
        <AccountDisplay player={playerEntity} />
      </div>

      <Score player={playerEntity} />
    </Card>
  );
};
