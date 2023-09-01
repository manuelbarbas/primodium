import { useState } from "react";

export type Cheatcodes = Record<string, Cheatcode>;

export type Cheatcode = {
  function: (...args: any[]) => any;
  params: { name: string; type: "number" | "string" | "boolean" }[];
};
const FunctionListComponent: React.FC<{ cheatcodes: Cheatcodes }> = ({
  cheatcodes,
}) => {
  const [params, setParams] = useState<Record<string, Record<string, any>>>({});

  const handleParamChange = (
    funcName: string,
    paramKey: string,
    value: any
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
    <div className="w-full h-full mx-auto mt-8 p-4 bg-gray-700 text-white rounded shadow overflow-y-auto">
      {Object.entries(cheatcodes).map(([funcName]) => (
        <div key={funcName} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{funcName}</h3>
          {(cheatcodes[funcName].params || []).map((param, index) => (
            <div key={index} className="mb-2 flex items-center">
              <p className="mr-2">{param.name}</p>
              <input
                type={getTypeInput(param.type)}
                placeholder={param.name}
                value={params[funcName]?.[param.name] || ""}
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
      ))}
    </div>
  );
};

export default FunctionListComponent;
