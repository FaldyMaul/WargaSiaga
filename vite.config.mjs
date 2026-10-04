import { resolve } from "node:path";
import { defineConfig } from "vite";

const page = (name) => resolve(import.meta.dirname, name);

export default defineConfig({
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: page("index.html"),
        modus: page("modus.html"),
        "modus-detail": page("modus-detail.html"),
        konsultasi: page("konsultasi.html"),
        "bantu-orang-lain": page("bantu-orang-lain.html"),
        "bantuan-darurat": page("bantuan-darurat.html"),
        laporan: page("laporan.html"),
        lapor: page("lapor.html"),
        "status-laporan": page("status-laporan.html"),
        tentang: page("tentang.html")
      }
    }
  }
});
