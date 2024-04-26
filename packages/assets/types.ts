export type PackConfig = {
  image: Array<{
    key: string;
    url: string;
  }>;
  audioSprite: Array<{
    key: string;
    urls: string[];
    jsonURL: string;
  }>;
  atlas: Array<{
    key: string;
    textureURL: string;
    atlasURL: string;
  }>;
  tilemapTiledJSON: Array<{
    key: string;
    url: string;
  }>;
  bitmapFont: Array<{
    key: string;
    textureURL: string;
    fontDataURL: string;
  }>;
};
