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
    <Transition in={showUI} timeout={duration}>
      {(state: TransitionStatus) => {
        if (state === "exited") {
          return null;
        }

        return (
          <div
            className="z-[20000] viewport-container fixed bottom-4 left-4 w-64 flex flex-col bg-slate-900/90 text-yellow-400 font-mono border border-cyan-600"
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
            onClick={hideNotificationBoxHelper}
          >
            <div className="flex flex-col">
              <div className="flex flex-row border-b border-cyan-600 p-2 gap-2">
                <LinkIcon icon={<AiFillWarning size="16" />} />
                <p className="inline-block align-middle font-bold">{title}</p>
              </div>
              <div className="text-sm p-2">{message}</div>
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
