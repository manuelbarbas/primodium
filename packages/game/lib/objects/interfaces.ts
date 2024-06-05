export interface IPrimodiumGameObject {
  readonly id: string;
  spawn(): void;
  isSpawned(): boolean;
}
