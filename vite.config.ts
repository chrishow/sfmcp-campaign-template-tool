import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // vite-plugin-handlebars is not strictly needed here
    // as we import .hbs?raw and compile manually.
  ],
  server: {
    port: 5173, // Keep your port consistent
    cors: true, // Allow requests from any origin
    // Optional: Allow network access if injecting from another device/VM
    // host: '0.0.0.0',
  },
});
