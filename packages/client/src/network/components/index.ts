import chainComponents from "./chainComponents";
import clientComponents from "./clientComponents";

export type PrimodiumComponents = typeof components;
const components = { ...chainComponents, ...clientComponents };

export default components;
