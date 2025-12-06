/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: './node_modules/.vite/angular-21',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  
  esbuild: {
    legalComments: 'none' as const,
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: false,
    mangleProps: /^_/,
    mangleQuoted: false,
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    cssCodeSplit: true,
    cssMinify: 'lightningcss' as const,
    minify: 'terser' as const,
    reportCompressedSize: false,
    sourcemap: false,
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        return deps.filter(dep => !dep.includes('primeng'));
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        inline: 3,
        hoist_funs: true,
        hoist_vars: true,
      },
      mangle: {
        toplevel: true,
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // PrimeNG - split by category
            if (id.includes('primeng')) {
              if (id.includes('/inputtext') || id.includes('/select') || 
                  id.includes('/datepicker') || id.includes('/password') ||
                  id.includes('/textarea') || id.includes('/inputnumber')) {
                return 'vendor-primeng-forms';
              }
              if (id.includes('/checkbox') || id.includes('/radiobutton')) {
                return 'vendor-primeng-ui';
              }
              if (id.includes('/config') || id.includes('/api')) {
                return 'vendor-primeng-core';
              }
              return 'vendor-primeng-other';
            }
            
            // Angular - group by package
            if (id.includes('@angular/forms')) return 'vendor-angular-forms';
            if (id.includes('@angular/common')) return 'vendor-angular-common';
            if (id.includes('@angular/cdk')) return 'vendor-angular-cdk';
            if (id.includes('@angular/animations')) return 'vendor-angular-animations';
            if (id.includes('@angular/')) return 'vendor-angular-core';
            
            // Other large vendors
            if (id.includes('rxjs')) return 'vendor-rxjs';
            if (id.includes('@primeng/themes')) return 'vendor-primeng-themes';
            
            return 'vendor-other';
          }
        },
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          // Only include woff2 fonts
          if (/woff2?|ttf|eot|svg/.test(extType)) {
            if (extType === 'woff2') {
              return 'fonts/[name]-[hash][extname]';
            }
            return 'fonts/unused/[name][extname]';
          }
          if (/png|jpe?g|gif|webp|avif/.test(extType)) {
            return 'images/[name]-[hash][extname]';
          }
          return '[name]-[hash][extname]';
        },
        experimentalMinChunkSize: 20000,
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: ['@angular/common', '@angular/forms', 'primeng/config'],
    exclude: ['@analogjs/vite-plugin-angular'],
    esbuildOptions: {
      treeShaking: true,
      minify: true,
      target: 'es2022'
    }
  },
  
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    name: 'angular-21',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage/angular-21',
      provider: 'v8' as const,
    },
  },
}));
