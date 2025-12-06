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
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    minify: 'terser',
    modulePreload: {
      polyfill: true,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'primeng-core': ['primeng/config', 'primeng/api'],
          'primeng-form': [
            'primeng/inputtext',
            'primeng/select',
            'primeng/datepicker',
            'primeng/password',
            'primeng/textarea',
            'primeng/inputnumber'
          ],
          'primeng-ui': [
            'primeng/checkbox',
            'primeng/radiobutton'
          ],
          'angular-forms': ['@angular/forms'],
          'angular-common': ['@angular/common'],
          'angular-cdk': ['@angular/cdk/a11y']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: ['@angular/common', '@angular/forms', 'primeng/config'],
    exclude: ['@analogjs/vite-plugin-angular']
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
