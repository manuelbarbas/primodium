import { useState } from "react";
import { BrowserContainer, ComponentTitle } from "./StyledComponents";
import { Cheatcodes } from "./types";

const CheatcodesList: React.FC<{ cheatcodes: Cheatcodes }> = ({
  cheatcodes,
}) => {
  const [params, setParams] = useState<Record<string, Record<string, unknown>>>(
    {}
  );

  const handleParamChange = (
    funcName: string,
    paramKey: string,
    value: unknown
  ) => {
    setParams((prevParams) => ({
      ...prevParams,
      [funcName]: {
        ...(prevParams[funcName] || {}),
        [paramKey]: value,
      },
    }));
  };

  const executeFunction = (funcName: string) => {
    const func = cheatcodes[funcName].function;
    if (func) {
      const funcParams = params[funcName] || {};
      const args = Object.values(funcParams);
      func(...args);
    }
  };

  const getTypeInput = (type: string) => {
    switch (type) {
      case "number":
        return "number";
      case "boolean":
        return "checkbox";
      default:
        return "text";
    }
  };

  return (
    <BrowserContainer style={{ padding: "6px" }}>
      {Object.entries(cheatcodes).map(([funcName], i) => {
        return (
          <div key={funcName + i} className="border-b-1 border-white">
            <ComponentTitle className="text-sm mb-2">{funcName}</ComponentTitle>
            {(cheatcodes[funcName].params || []).map((param, index) => (
              <div key={index} className="mb-2 flex items-center">
                <p className="mr-2">{param.name}</p>
                <input
                  type={getTypeInput(param.type)}
                  placeholder={param.name}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  value={params[funcName]?.[param.name] ?? ""}
                  onChange={(e) =>
                    handleParamChange(
                      funcName,
                      param.name,
                      e.target.type === "checkbox"
                        ? e.target.checked
                        : e.target.value
                    )
                  }
                  className="border rounded py-1 px-2 focus:outline-none focus:ring focus:border-blue-300 text-black"
                />
              </div>
            ))}
            <button
              onClick={() => executeFunction(funcName)}
              className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
            >
              Submit
            </button>
          </div>
        );
      })}
    </BrowserContainer>
  );
};

export default CheatcodesList;
