import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [
    'proxies/ssh-proxy.mjs',
    'proxies/telnet-proxy.mjs'
  ],
  loader: {
    '.node': 'file'
  },
  outdir: '../../webui',
  platform: 'node',
  bundle: true,
  minify: true,
  preserveSymlinks: true
});
