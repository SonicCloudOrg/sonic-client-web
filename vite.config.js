import { defineConfig } from 'vite';
import { join } from 'path';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3002,
  },
  build: {
    chunkSizeWarningLimit: 600 * 1024, // 设置警告阈值为600KiB，因为element-plus超过500kb导致打包失败
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
});
