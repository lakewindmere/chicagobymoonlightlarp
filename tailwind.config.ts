// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        // This maps 'font-banner' to the CSS variable we created in step 1
        banner: ["var(--font-cinzel-decorative)", "serif"],
      },
    },
  },
  // ... rest of config
};
export default config;