export function getEnvVariable(name: keyof ImportMetaEnv): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    // Node.js environment
    return process.env[name];
  } else if (typeof import.meta !== "undefined" && import.meta.env) {
    // Vite environment
    return import.meta.env[name];
  }
  return undefined;
}
