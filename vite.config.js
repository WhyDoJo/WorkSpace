import { resolve } from "path";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import Typograf from "typograf";
import spriteSvg from "./scripts/sprite-svg";

function htmlTypograf() {
  const tp = new Typograf({ locale: ["ru", "en-US"] });

  return {
    name: "html-typograf",
    apply: "build",
    transformIndexHtml(html) {
      return tp.execute(html);
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    open: "/",
  },
  build: {
    outDir: "dist",
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: { drop_console: true },
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    spriteSvg(),
    handlebars({
      partialDirectory: [
        resolve(__dirname, "src/html/partials"),
        resolve(__dirname, "src/html/sections"),
      ],
      reloadOnPartialChange: true,
    }),
    htmlTypograf(),
  ],
});
