import { IconButton } from "src/components/core/Button";

type Props = {
  icon: string;
  name: string;
  onClick?: () => void;
  active?: boolean;
};

const HotbarLabel: React.FC<Props> = ({ icon, name, onClick, active }) => {
  return (
    <IconButton
      className={`btn-sm`}
      imageUri={icon}
      text={name}
      hideText={!active}
      selected={active}
      onClick={onClick}
    />
  );
};

export default HotbarLabel;
