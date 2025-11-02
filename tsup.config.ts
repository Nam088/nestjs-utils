import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Build both CommonJS and ESM
    dts: true, // Generate .d.ts files
    splitting: false,
    sourcemap: true,
    clean: true, // Clean output directory before build
    treeshake: true, // Remove unused code
    minify: false, // Don't minify for better debugging
    external: [
        // Mark peer dependencies as external (won't be bundled)
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/swagger',
        'reflect-metadata',
        'rxjs',
    ],
    // Keep dependencies as external (won't be bundled)
    noExternal: [],
    esbuildOptions(options) {
        options.banner = {
            js: '"use strict";',
        };
    },
    // Skip node_modules
    skipNodeModulesBundle: true,
    target: 'es2022',
    outDir: 'dist',
    tsconfig: 'tsconfig.build.json',
});
