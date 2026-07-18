/// <reference types="vite/client" />

// Vite resolves an imported asset to its final URL string; vite/client covers
// the common media types but not PDFs, so declare it here.
declare module "*.pdf" {
  const src: string;
  export default src;
}
