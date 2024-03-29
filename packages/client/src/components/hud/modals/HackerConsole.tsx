/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "src/components/core/Button";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import createConsoleApi from "src/util/console/consoleApi";
import consoleApiDescriptions from "src/util/console/consoleApiDescriptions";

function stringify(obj: unknown) {
  if (typeof obj === "string") return obj;
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}

const HackerConsole: React.FC = () => {
  const primodium = usePrimodium();
  const mud = useMud();

  const api = createConsoleApi(mud, primodium);

  Object.entries(api).forEach(([key, value]) => ((window as any)[key] = value));

  return (
    <div className="flex gap-4 p-2 h-full w-full overflow-hidden font-mono">
      <div className="flex-1 h-full w-full overflow-hidden flex flex-col col-span-4">
        <p className="text-xs uppercase opacity-50 font-bold pb-2">command line</p>
        <Console />
      </div>
      <div className="flex-1 overflow-hidden col-span-3">
        <p className="text-xs uppercase opacity-50 font-bold pb-2">primodium api</p>
        <div className="overflow-y-scroll scrollbar h-full">
          <Dropdown data={api} />
        </div>
      </div>
    </div>
  );
};

const Console = () => {
  const [commandHistory, setCommandHistory] = usePersistentStore((state) => [
    state.consoleHistory,
    state.setConsoleHistory,
  ]);
  useEffect(() => {
    setCommandHistory([]);
  }, []);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [input, setInput] = useState<string>("");
  const primodium = usePrimodium();
  const asteroidInput = primodium.api("ASTEROID").input;
  const starmapInput = primodium.api("STARMAP").input;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleConsoleCommand = () => {
    try {
      const result = eval(input);
      const out = stringify(result);
      if (!out) return;
      setCommandHistory([...commandHistory, { input, output: out }]); // Add input to history
    } catch (error) {
      if (error instanceof Error) {
        setCommandHistory([...commandHistory, { input, output: `Error: ${error.message}` }]);
      }
    } finally {
      setHistoryIndex(-1); // Reset history index
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (inputRef.current && e.key === "Escape") {
      inputRef.current.blur();
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConsoleCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length - 1;
      if (newIndex >= 0) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex].input);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      if (newIndex >= 0) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex].input);
      } else {
        setInput("");
      }
      setHistoryIndex(newIndex);
    }
  };
  const handleInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if the key pressed is Up arrow, Down arrow, or Enter
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter") {
      return; // Do nothing and return early
    }

    // Handle other keys normally
    setInput(e.currentTarget.value);
  };

  return (
    <>
      <div className="relative flex overflow-hidden">
        <textarea
          ref={inputRef}
          className="border p-2 text-sm border-secondary bg-white/10 w-full h-full"
          value={input}
          placeholder="Enter a command... "
          onKeyDown={handleKeyPress}
          onInput={handleInput}
          onFocus={() => {
            console.log("focus");
            asteroidInput.disableInput();
            starmapInput.disableInput();
          }}
          onBlur={() => {
            console.log("blur");
            asteroidInput.enableInput();
            starmapInput.enableInput();
          }}
        />
        <Button className="btn-primary btn-xs absolute bottom-2 right-2" onClick={handleConsoleCommand}>
          Run
        </Button>
      </div>
      <p className="text-xs italic opacity-50">e.g. priComponents.Home.get(priPlayerAccount.entity).value</p>
      <div className="mt-4 overflow-y-scroll overflow-x-hidden scrollbar h-full text-sm w-full">
        {commandHistory.map((line, index) => (
          <div key={`output-${index}`} className="mr-1 w-full">
            <div className={`whitespace-normal`}>
              {`>`} {line.input}
            </div>
            <div
              style={{ wordWrap: "break-word" }}
              className={`whitespace-pre-wrap text-wrap ${line.output?.startsWith("Error") ? "bg-error/70" : ""}`}
            >
              {line.output}
            </div>
            <br />
          </div>
        ))}
      </div>
    </>
  );
};
// eslint-disable-next-line @typescript-eslint/ban-types
const getFunctionParameters = (func: Function): string => {
  const funcString = func.toString();
  const params = funcString
    .replace(/[/][/].*$/gm, "") // remove single-line comments
    .replace(/\s+/g, "") // remove spaces
    .replace(/[/][*][^/*]*[*][/]/g, "") // remove multi-line comments
    .split(")")[0]
    .replace(/^[^(]*[(]/, "") // extract the parameters
    .replace(/=[^,]+/g, "") // remove default values
    .split(",")
    .filter(Boolean); // split & filter empty strings
  if ((params.length > 0 && params[0] === "mud") || params[0] == "primodium") {
    params.shift();
  }
  const paramsStr = params.length > 0 ? `(${params.join(", ")})` : "None";

  return paramsStr;
};

type Props = {
  data: Record<string, any>;
};

const Dropdown: React.FC<Props> = ({ data }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) => {
    setOpen({ ...open, [key]: !open[key] });
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      {Object.entries(data).map(([key, value]) => {
        const description = consoleApiDescriptions[key];
        const functionParams = typeof value === "function" ? getFunctionParameters(value) : null;
        return (
          <div key={`dropdown-${key}`} className="border border-primary p-2 mr-1 ">
            <button
              onClick={() => toggleDropdown(key)}
              className="w-full text-left overflow-hidden pre-whitespace-wrap"
              style={{ wordWrap: "break-word" }}
            >
              <p className="whitespace-normal">{key}</p>
              {description && <p className="text-xs opacity-70 italic">{description}</p>}
            </button>
            {open[key] && (
              <div className="pl-4 pt-2 text-xs">
                {typeof value === "function" ? (
                  <div className="flex gap-1 opacity-50">
                    <p className="uppercase font-bold">Parameters:</p> <p>{functionParams}</p>
                  </div>
                ) : typeof value === "object" ? (
                  <Dropdown data={value} />
                ) : (
                  <p>{value.toString()}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HackerConsole;
