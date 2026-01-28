// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

import netlify from '@astrojs/netlify';

export default defineConfig({
  // Make sure 'tailwind()' is in this list!
  integrations: [tailwind()],
  output: 'server',
  adapter: netlify(),
});