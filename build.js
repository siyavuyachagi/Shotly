"use strict";

const esbuild = require('esbuild');

// Bundle extension (Node.js)
esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  external: ['vscode'],
  format: 'cjs',
});

// Bundle webview (browser)
esbuild.buildSync({
  entryPoints: ['webview/index.js'],
  bundle: true,
  outdir: 'dist/webview',
  platform: 'browser',
  format: 'esm',
});