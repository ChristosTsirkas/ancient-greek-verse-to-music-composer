// Declares the global injected by vite.config.ts's `define` option --
// see that file for why GDPR_DPO_EMAIL (server env var, un-prefixed)
// is exposed to client code this way instead of via import.meta.env.
declare const __GDPR_DPO_EMAIL__: string;
