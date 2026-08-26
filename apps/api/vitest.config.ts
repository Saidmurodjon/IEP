import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Sof funksiyalar sinovi — Workers muhiti kerak emas.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
