import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [
    'proxies/assistant-proxy.mjs',
    'proxies/ssh-proxy.mjs'
  ],
  loader: {
    '.node': 'file',
    '.txt': 'text'
  },
  outdir: '../../webui',
  platform: 'node',
  bundle: true,
  minify: true,
  preserveSymlinks: true
});
