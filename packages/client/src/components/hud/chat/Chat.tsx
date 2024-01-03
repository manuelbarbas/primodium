import { Entity } from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import PusherJS from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { Button } from "src/components/core/Button";
import { Card, SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Loader } from "src/components/core/Loader";
import { Tabs } from "src/components/core/Tabs";
import { TextInput } from "src/components/core/TextInput";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { useFetch } from "src/hooks/useFetch";
import { components } from "src/network/components";
import { isPlayer } from "src/util/common";
import { censorText } from "src/util/profanity";

const COOLDOWN = 1.5;

type message = {
  user: string;
  message: string;
  time: number;
  pending?: boolean;
  uuid?: string;
};

export const client = new PusherJS(import.meta.env.PRI_PUSHER_APP_KEY ?? "", {
  wsHost: import.meta.env.PRI_PUSHER_APP_HOST ?? "",
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  cluster: "NA",
});

export const Channel: React.FC<{ className?: string; channel: string }> = ({ className, channel }) => {
  const { playerAccount } = useMud();
  const [chatScroll, setChatScroll] = useState(false);
  const [chat, setChat] = useState<Map<string, message>>(new Map());
  const message = useRef("");
  const { data, loading } = useFetch<message[]>(`/api/chatHistory/${channel}`);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const sendMessage = async () => {
    if (!message.current) return;

    const messageId = uuid();
    const signedMessage = await playerAccount.walletClient.signMessage({
      message: message.current,
    });

    fetch("/api/chat", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        user: playerAccount.entity,
        message: message.current,
        signature: signedMessage,
        uuid: messageId,
        channel,
      }),
    });

    setChat((prevChat) => {
      const newChat = new Map(prevChat);
      newChat.set(messageId, {
        user: playerAccount.entity ?? "unknown",
        message: message.current,
        time: Date.now(),
        pending: true,
        uuid: messageId,
      });
      message.current = "";
      return newChat;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCooldown) {
      await sendMessage();
      setIsCooldown(true);
      (e.target as HTMLFormElement).reset();
    }
  };

  useEffect(() => {
    const pusherChannel = client.subscribe(channel);
    chat.clear();

    pusherChannel.bind("pusher:subscription_succeeded", () => {
      // Append system message without clearing existing chat
      setChat((prevChat) =>
        new Map(prevChat).set(uuid(), {
          user: "SYSTEM",
          message: "Connected to chat.",
          time: Date.now(),
        })
      );
    });

    pusherChannel.bind("message", (data: message) => {
      // Append new message without clearing existing chat
      setChat((prevChat) => new Map(prevChat).set(data.uuid ?? uuid(), data));
    });

    return () => {
      pusherChannel.unbind_all();
      client.unsubscribe(channel);
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

    //scroll to bottom
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chat]);

  useEffect(() => {
    if (!data) return;

    setChat((prevChat) => {
      const newChat = new Map(prevChat);
      for (const message of data) {
        newChat.set(message.uuid!, message);
      }
      return newChat;
    });
  }, [data]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown) {
      timer = setTimeout(() => {
        setIsCooldown(false);
      }, COOLDOWN * 1000); // Convert seconds to milliseconds
    }
    return () => clearTimeout(timer); // Cleanup the timer
  }, [isCooldown]);

  return (
    <div className={`${className} duration-300 transition-all pointer-events-auto text-xs`}>
      <button
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 bg-pink-700 p-1 z-50 transition-opacity ${
          chatScroll ? "opacity-100" : "opacity-0 pointer-events-none"
        } `}
        onClick={() => {
          setChatScroll(false);
          chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
        }}
      >
        JUMP TO NEWEST
      </button>
      <SecondaryCard className={`"flex flex-col h-72 w-96 items-center ${loading ? "justify-center" : "justify-end"}`}>
        {!loading && (
          <div
            ref={chatRef}
            className="overflow-y-auto scrollbar w-full scroll-smooth"
            onWheel={() => setChatScroll(true)}
          >
            {Array.from(chat).map(([uuid, message], index) => {
              return (
                <div key={uuid} className={`flex ${index % 2 === 0 ? "bg-neutral/50" : ""} px-3 py-1 items-end`}>
                  <div
                    className={`${message.user === "unknown" ? "opacity-50" : ""} flex ${
                      message.pending ? " opacity-25 animate-pulse" : ""
                    } `}
                  >
                    <div className="break-all  font-bold">
                      {isPlayer(message.user as Entity) ? (
                        <AccountDisplay player={message.user as Entity} />
                      ) : (
                        message.user
                      )}
                      :<span className="opacity-80 ml-1 font-normal hyphens-auto">{censorText(message.message)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {loading && (
          <Card className="items-center">
            <Loader />
            LOADING MESSAGES
          </Card>
        )}
      </SecondaryCard>

      <form className="flex items-center space-x-2 relative pr-2" onSubmit={handleSubmit}>
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        <TextInput
          placeholder="Type a message..."
          onChange={(e) => {
            message.current = e.target.value;
          }}
          maxLength={128}
          className="w-full placeholder:opacity-50 input-sm bg-neutral border-accent active:ring-0 z-10"
        />
        <Button className="btn-sm btn-secondary flex-grow" disabled={isCooldown}>
          {" "}
          SEND{" "}
        </Button>
      </form>
    </div>
  );
};

export const Chat = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance;

  return (
    <Tabs defaultIndex={0}>
      <Join className="w-full border border-secondary/25 border-b-0">
        <Tabs.Button showActive index={0} className="w-1/2">
          GENERAL
        </Tabs.Button>
        <Tabs.Button showActive index={1} disabled={!playerAlliance} className="w-1/2">
          ALLIANCE
        </Tabs.Button>
      </Join>

      <Tabs.Pane index={0} fragment>
        <Channel channel="general" />
      </Tabs.Pane>
      {playerAlliance && (
        <Tabs.Pane index={1} fragment>
          <Channel channel={playerAlliance} />
        </Tabs.Pane>
      )}
    </Tabs>
  );
};
