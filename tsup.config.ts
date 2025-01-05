import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // your entry file(s)
  outDir: 'dist', // the output directory for built files
  format: ['cjs'], // CommonJS and ESM output formats
  dts: true, // generate declaration files
  sourcemap: false, // generate sourcemaps for debugging
  clean: true, // clean the output directory before building
  external: ['tsconfig-paths', 'express','argon2'], // mark tsconfig-paths as external (don't bundle it)
  minify: true, // enable minification
  treeshake: true, // enable treeshaking
});
