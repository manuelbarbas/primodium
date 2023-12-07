import { useEffect, useRef, useState } from "react";
import PusherJS from "pusher-js";
import { uuid } from "@latticexyz/utils";
import { useMud } from "src/hooks";
import { isPlayer } from "src/util/common";
import { Entity } from "@latticexyz/recs";
import { Card, SecondaryCard } from "src/components/core/Card";
import { TextInput } from "src/components/core/TextInput";
import { Button } from "src/components/core/Button";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { censorText } from "src/util/profanity";
import { components } from "src/network/components";
import { useFetch } from "src/hooks/useFetch";
import { Loader } from "src/components/core/Loader";

const COOLDOWN = 1.5;

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
  const [chatScroll, setChatScroll] = useState(false);
  const [chat, setChat] = useState<Map<string, message>>(new Map());
  const message = useRef("");
  const [channel, setChannel] = useState("general");
  const { data, loading } = useFetch<message[]>(`/api/chatHistory/${channel}`);
  const chatRef = useRef<HTMLDivElement>(null);
  const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance;
  const [isCooldown, setIsCooldown] = useState(false);

  const sendMessage = async () => {
    if (!message.current) return;

    const messageId = uuid();
    const signedMessage = await walletClient.signMessage({
      message: message.current,
    });

    fetch("/api/chat", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        user: playerEntity,
        message: message.current,
        signature: signedMessage,
        uuid: messageId,
        channel,
      }),
    });

    setChat((prevChat) => {
      const newChat = new Map(prevChat);
      newChat.set(messageId, {
        user: playerEntity ?? "unknown",
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
  }, [channel]); // Ensure this effect only runs when 'channel' changes

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
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 bg-pink-700 p-1 drop-shadow-2xl z-50 transition-opacity ${
          chatScroll ? "opacity-100" : "opacity-0 pointer-events-none"
        } `}
        onClick={() => {
          setChatScroll(false);
          chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
        }}
      >
        JUMP TO NEWEST
      </button>
      <SecondaryCard className="grid grid-cols-2 gap-1">
        <Button
          className={`btn-xs ${channel === "general" ? "border-accent" : ""}`}
          onClick={() => setChannel("general")}
        >
          GENERAL
        </Button>
        <Button
          className={`btn-xs ${channel === playerAlliance ? "border-accent" : ""}`}
          onClick={() => setChannel(playerAlliance ?? "")}
          disabled={!playerAlliance}
        >
          ALLIANCE
        </Button>
      </SecondaryCard>
      <SecondaryCard className="flex flex-col h-72 w-96 items-center justify-center">
        {!loading && (
          <div
            ref={chatRef}
            className="overflow-y-auto scrollbar w-full scroll-smooth"
            onWheel={() => setChatScroll(true)}
          >
            {Array.from(chat).map(([uuid, message], index) => {
              return (
                <div key={uuid} className={`flex ${index % 2 === 0 ? "bg-neutral/50" : ""} px-3 py-1`}>
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
