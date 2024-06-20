export type Cheatcodes = CheatcodeSection[];

export type CheatcodeSection = {
  title: string;
  content: Record<string, Cheatcode>;
};

export type ParamType = "number" | "string" | "boolean" | "dropdown";

type ParamBase = {
  name: string;
};

type NumberParam = ParamBase & {
  type: "number";
};

type StringParam = ParamBase & {
  type: "string";
};

type BooleanParam = ParamBase & {
  type: "boolean";
};

type DropdownParam = ParamBase & {
  type: "dropdown";
  dropdownOptions: string[];
};

export type CheatcodeParam = NumberParam | StringParam | BooleanParam | DropdownParam;

export type Cheatcode = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (...args: any[]) => any;
  params: CheatcodeParam[];
};
