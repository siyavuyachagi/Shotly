"use strict";

const esbuild = require('esbuild');

// Extension (Node.js) - outputs to dist/
esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  external: ['vscode'],
  format: 'cjs',
});

// Webview (browser) - outputs to src/assets/js/dist/
esbuild.buildSync({
  entryPoints: ['src/assets/js/index.js'],
  bundle: true,
  outdir: 'dist/webview',
  platform: 'browser',
  format: 'esm',
  define: {
    acquireVsCodeApi: 'acquireVsCodeApi'
  }
});


const { copyFile, mkdir } = require('fs/promises');


const copyAssets = async () => {
  await mkdir('dist/webview', { recursive: true });
  
  await copyFile('src/views/index.html', 'dist/webview/index.html');
  await copyFile('src/assets/css/styles.css', 'dist/webview/styles.css');
}
copyAssets();