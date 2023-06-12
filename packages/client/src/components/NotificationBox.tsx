import { AiFillWarning } from "react-icons/ai";

function NotificationBox() {
  return (
    <div className="z-[1000] viewport-container fixed top-52 left-4 pb-4 pr-4 w-64 flex flex-col bg-gray-700 text-yellow-400 drop-shadow-xl font-mono rounded">
      <div className="mt-4 ml-5 flex flex-col">
        <div className="flex flex-row">
          <LinkIcon icon={<AiFillWarning size="16" />} />
          <p className="ml-2 inline-block align-middle font-bold">Warning</p>
        </div>
        <div className="mt-2 text-sm">text here</div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);

export default NotificationBox;
