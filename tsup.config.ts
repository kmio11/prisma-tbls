import { defineConfig } from 'tsup'

export default defineConfig([
  // CLI build with shebang
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    bundle: true,
    platform: 'node',
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Generator build with shebang
  {
    entry: ['src/generator.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: false,
    bundle: true,
    platform: 'node',
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library build without shebang
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: false,
    bundle: true,
    platform: 'node',
    target: 'node18',
  },
])