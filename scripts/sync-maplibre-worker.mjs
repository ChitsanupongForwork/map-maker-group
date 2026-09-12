import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * MapLibre หา worker ของตัวเองจาก import.meta.url
 * พอ Turbopack รวมไฟล์ใหม่ URL นั้นชี้ไปที่ /_next/static/chunks/ ซึ่งไม่มีไฟล์ worker อยู่
 * ทางออกที่นิ่งที่สุดคือ copy worker (กับ shared ที่มันเรียก) มาไว้ใน public/
 * แล้วบอก MapLibre ตรง ๆ ด้วย setWorkerUrl()
 *
 * สคริปต์นี้ถูกเรียกอัตโนมัติจาก predev / prebuild / postinstall
 */
const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const target = path.join(process.cwd(), "public", "maplibre");

const resolveDist = (file) =>
  fileURLToPath(import.meta.resolve(`maplibre-gl/dist/${file}`));

await mkdir(target, { recursive: true });

for (const file of FILES) {
  await copyFile(resolveDist(file), path.join(target, file));
}

const { version } = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve("maplibre-gl/package.json")), "utf8"),
);

await writeFile(
  path.join(target, "VERSION"),
  `maplibre-gl ${version}\nไฟล์ในโฟลเดอร์นี้ถูก copy อัตโนมัติ อย่าแก้ด้วยมือ\n`,
  "utf8",
);

console.log(`[maplibre] copied worker files for v${version} -> public/maplibre`);
