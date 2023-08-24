import { useState } from "react";

export type Cheatcodes = Record<
  string,
  {
    function: (...args: any[]) => any;
    params: { name: string; type: "number" | "string" | "boolean" }[];
  }
>;
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
      const result = func(...args);

      console.log("result:", result);
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
    <div className="w-full h-full mx-auto mt-8 p-4 bg-gray-100 rounded shadow">
      {Object.entries(cheatcodes).map(([funcName]) => (
        <div key={funcName} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{funcName}</h3>
          {(cheatcodes[funcName].params || []).map((param, index) => {
            const value = params[funcName][param.name] ?? "";
            return (
              <div key={index} className="mb-2 flex">
                <p className="mr-2">{param.name}</p>
                <input
                  type={getTypeInput(param.type)}
                  placeholder={param.name}
                  value={value}
                  onChange={(e) =>
                    handleParamChange(
                      funcName,
                      param.name,
                      e.target.type === "checkbox"
                        ? e.target.checked
                        : e.target.value
                    )
                  }
                  className="border rounded py-1 px-2 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            );
          })}
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
