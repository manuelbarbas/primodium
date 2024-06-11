/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ["main", {
    name: "release*",
    channel: "alpha",
    prerelease: "alpha"
  }],
  extends: "semantic-release-monorepo"
}