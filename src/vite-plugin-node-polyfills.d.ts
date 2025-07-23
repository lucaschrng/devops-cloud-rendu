declare module 'vite-plugin-node-polyfills' {
  export function nodePolyfills(options?: {
    protocolImports?: boolean;
    globals?: {
      Buffer?: boolean;
      global?: boolean;
      process?: boolean;
    };
  }): any;
}
