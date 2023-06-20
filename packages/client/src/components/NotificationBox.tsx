import { useCallback, useEffect } from "react";
import { AiFillWarning } from "react-icons/ai";
import { Transition, TransitionStatus } from "react-transition-group";
import { useNotificationStore } from "../store/NotificationStore";

function NotificationBox() {
  const [title, message, showUI, setShowUI] = useNotificationStore((state) => [
    state.title,
    state.message,
    state.showUI,
    state.setShowUI,
  ]);

  const duration = 300;

  const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
  };

  const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
    unmounted: { opacity: 0 },
  };

  const hideNotificationBoxHelper = useCallback(() => {
    setShowUI(false);
  }, [setShowUI]);

  useEffect(() => {
    const timeoutId = showUI
      ? setTimeout(() => setShowUI(false), 3000)
      : undefined;
    return () => clearTimeout(timeoutId);
  }, [showUI, setShowUI]);

  return (
    <Transition in={showUI} timeout={duration} unmountOnExit>
      {(state: TransitionStatus) => {
        if (state === "exited") {
          return null;
        }

        return (
          <div
            className="z-[1000] viewport-container fixed top-52 left-4 pb-4 pr-4 w-64 flex flex-col bg-gray-700 text-yellow-400 drop-shadow-xl font-mono rounded"
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
            onClick={hideNotificationBoxHelper}
          >
            <div className="mt-4 ml-5 flex flex-col">
              <div className="flex flex-row">
                <LinkIcon icon={<AiFillWarning size="16" />} />
                <p className="ml-2 inline-block align-middle font-bold">
                  {title}
                </p>
              </div>
              <div className="mt-2 text-sm">{message}</div>
            </div>
          </div>
        );
      }}
    </Transition>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);

export default NotificationBox;
