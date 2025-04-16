import { defineConfig } from 'vite';
import { campaignDataPlugin } from './vite-plugin-campaign-data'; // Adjust path if needed
import * as path from 'path'; // Needed if using __dirname in plugin path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    campaignDataPlugin(), // Add our custom plugin
    // ... other plugins if you have any
  ],
  resolve: { // Ensure Vite can resolve '.ts' correctly if issues arise
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    port: 5173,
    cors: true,
    // host: '0.0.0.0', // Optional
  },
});