interface ImportMetaEnv {
  PRI_ACCOUNT_LINK_VERCEL_URL: string;
  PRI_CHAIN_ID: string;
  PRI_DEV: string;
  PRI_WALLETCONNECT_PROJECT_ID: string;
  PRI_DEV_PKEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
