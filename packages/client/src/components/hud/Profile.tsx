import { FaHandshake, FaHandshakeSlash } from "react-icons/fa";
import { useMud } from "src/hooks";
// import { Card } from "../core/Card";
import { Scenes } from "@game/constants";
import { components } from "src/network/components";
import { getRandomRange } from "src/util/common";
import { Modal } from "../core/Modal";
import { Tooltip } from "../core/Tooltip";
import { Widget } from "../core/Widget";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Account } from "../transfer/Account";
import { Score } from "./Score";
import { SpectatingDetails } from "./SpectatingDetails";

const ProfileContent = () => {
  const {
    playerAccount: { entity: playerEntity },
    sessionAccount,
  } = useMud();
  const sessionEntity = sessionAccount?.entity;

  return (
    <>
      <div className="flex gap-2 w-full items-center justify-center p-1.5 text-success text-md">
        <span className="text-white/50 text-xs">id:</span>
        <AccountDisplay player={playerEntity} />
        <Modal title="account">
          <Modal.Button className="btn-sm btn-neutral border-secondary !p-1 flex gap-2 text-accent text-xs w-fit">
            <Tooltip text={`${sessionEntity ? "" : "not"} authorizing`} direction="right">
              <div>
                {sessionEntity ? (
                  <FaHandshake className="text-success w-4 h-4" />
                ) : (
                  <FaHandshakeSlash className="text-error w-4 h-4" />
                )}
              </div>
            </Tooltip>
            <p>MANAGE</p>
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-fit">
            <Account />
          </Modal.Content>
        </Modal>
      </div>

      <Score player={playerEntity} />
    </>
  );
};
export const Profile = () => {
  const isSpectating = components.ActiveRock.use()?.value !== components.BuildRock.use()?.value;

  return (
    <Widget
      id="account"
      title="account"
      icon="/img/icons/debugicon.png"
      defaultCoord={{
        x: window.innerWidth / 2 + getRandomRange(-50, 50),
        y: window.innerHeight / 2 + getRandomRange(-50, 50),
      }}
      scene={Scenes.UI}
      minOpacity={0.5}
      defaultLocked
      defaultVisible
      lockable
      draggable
      persist
    >
      {isSpectating && <SpectatingDetails />}
      {!isSpectating && <ProfileContent />}
    </Widget>
  );
};
