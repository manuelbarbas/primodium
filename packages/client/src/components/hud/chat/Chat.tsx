import { FormEvent, useEffect, useRef, useState } from "react";
import PusherJS from "pusher-js";
import { FaMinus } from "react-icons/fa";
import { uuid } from "@latticexyz/utils";
import { useMud } from "src/hooks";
import { entityToAddress, isPlayer, shortenAddress } from "src/util/common";
import { Entity } from "@latticexyz/recs";

interface ChatProps {
  className?: string;
}

type message = {
  user: string;
  message: string;
  time: number;
  pending?: boolean;
  uuid?: string;
};

export const client = new PusherJS(import.meta.env.PRI_PUSHER_APP_KEY!, {
  wsHost: import.meta.env.PRI_PUSHER_APP_HOST!,
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  cluster: "NA",
});

export const Chat = ({ className }: ChatProps) => {
  const {
    network: { walletClient, playerEntity },
  } = useMud();
  const [isMinimized, setIsMinimized] = useState(true);
  const [unread, setUnread] = useState(0);
  const [chatScroll, setChatScroll] = useState(false);
  const [chat, setChat] = useState<Map<string, message>>(new Map());
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputRef.current) return;

    if (inputRef.current.value.length === 0) return;

    const messageId = uuid();

    const signedMessage = await walletClient.signMessage({
      message: inputRef.current.value,
      // account: entityToAddress(playerEntity),
    });

    fetch("/api/chat", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        user: playerEntity,
        message: inputRef.current.value,
        signature: signedMessage,
        uuid,
        channel: "chat",
      }),
    });

    setChat(
      new Map(
        Array.from(
          chat.set(messageId, {
            user: playerEntity ?? "unknown",
            message: inputRef.current.value,
            time: Date.now(),
            pending: true,
            uuid: messageId,
          })
        ).slice(-100)
      )
    );

    inputRef.current.value = "";
  };

  useEffect(() => {
    const channel = client.subscribe("chat");

    channel.bind("pusher:subscription_succeeded", () => {
      setChat(
        new Map(
          Array.from(
            chat.set(uuid(), {
              user: "SYSTEM",
              message: "Connected to chat.",
              time: Date.now(),
            })
          ).slice(-100)
        )
      );
    });

    channel.bind("message", (data: message) => {
      setChat(new Map(Array.from(chat.set(uuid(), data)).slice(-100)));
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe("chat");
    };
  }, []);

  useEffect(() => {
    if (!chatRef.current) return;

    if (chatScroll) {
      //if fully scrolled reset scroll flag
      if (chatRef.current.scrollHeight - chatRef.current.scrollTop - 20 <= chatRef.current.clientHeight) {
        setChatScroll(false);
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
      }
      return;
    }

    if (isMinimized) setUnread(Math.min(unread + 1, chat.size));

    //scroll to bottom
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chat]);

  useEffect(() => {
    setUnread(0);

    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    setChatScroll(false);
  }, [isMinimized]);

  return (
    <div
      onClick={() => {
        if (isMinimized) setIsMinimized(!isMinimized);
      }}
      className={`${className} p-5 m-5 bg-neutral border border-accent rounded-xl duration-300 transition-all pointer-events-auto text-xs ${
        isMinimized ? "w-20 scale-75 cursor-pointer" : " max-w-[30rem]"
      }`}
    >
      <div className="absolute top-0 right-0 bg-pink-700 p-2 px-3 translate-x-1/2 -translate-y-1/2 rounded-full text-sm">
        {unread}
      </div>
      <div className="relative flex">
        <button
          onClick={() => {
            setIsMinimized(!isMinimized);
          }}
          className={`btn btn-circle absolute -right-[2.9rem] -top-10 border border-accent ${
            isMinimized ? "hidden" : ""
          }`}
        >
          <FaMinus />
        </button>

        <div className={`${isMinimized ? "" : "hidden"}`} style={{ imageRendering: "pixelated" }}>
          {/* <img src={`/images/web/chat.png`} alt="miao-music" width={40} height={40} /> */}
        </div>

        <div className={` ${isMinimized ? "hidden" : "flex flex-col"}`}>
          <button
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 bg-pink-700 p-1 rounded drop-shadow-2xl z-50 transition-opacity ${
              chatScroll ? "opacity-100" : "opacity-0 pointer-events-none"
            } `}
            onClick={() => {
              setChatScroll(false);
              chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
            }}
          >
            JUMP TO NEWEST
          </button>
          <div className="flex flex-col h-44 w-[27rem] justify-end" onWheel={() => setChatScroll(true)}>
            <div ref={chatRef} className="overflow-y-scroll scroll-smooth">
              {Array.from(chat).map(([uuid, message], index) => {
                return (
                  <div key={uuid} className={`flex ${index % 2 === 0 ? "bg-base-100/50" : ""} rounded px-3 py-1`}>
                    <p
                      className={`${message.user === "unknown" ? "opacity-50" : ""} ${
                        message.pending ? " opacity-25 animate-pulse" : ""
                      } `}
                    >
                      <b>
                        {isPlayer(message.user as Entity)
                          ? shortenAddress(entityToAddress(message.user))
                          : message.user}
                      </b>
                      : {message.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <form
            className="flex items-center space-x-2 mt-3"
            onSubmit={async (e) => {
              await sendMessage(e);
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              ref={inputRef}
              maxLength={128}
              height={32}
              className="w-full rounded bg-base-100 outline-none p-2 placeholder:opacity-50"
            />
            <button className="btn"> SEND </button>
          </form>
        </div>
      </div>
    </div>
  );
};
