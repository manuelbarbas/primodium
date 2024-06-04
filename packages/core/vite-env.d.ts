interface ImportMetaEnv {
  PRI_ACCOUNT_LINK_VERCEL_URL: string;
  PRI_DEV_PKEY: string;
  // add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
