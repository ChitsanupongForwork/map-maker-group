import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * กฎที่บังคับด้วยเครื่องมือไม่ได้ = กฎที่ไม่มีอยู่จริง
 * สองกฎด้านล่างคือสิ่งที่ทำให้โครงสร้าง feature-based อยู่รอดในระยะยาว
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "feature", pattern: "src/features/*/**", capture: ["name"] },
        { type: "shared", pattern: "src/shared/**" },
        { type: "server", pattern: "src/server/**" },
        { type: "config", pattern: "src/config/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: {
                to: {
                  element: { types: { anyOf: ["feature", "shared", "server", "config"] } },
                },
              },
            },
            {
              // ฟีเจอร์พึ่งพาฟีเจอร์อื่นได้ แต่ต้องผ่าน index เท่านั้น
              // (กฎ no-restricted-imports ด้านล่างเป็นตัวบังคับข้อนั้น)
              from: { element: { type: "feature" } },
              allow: {
                to: {
                  element: { types: { anyOf: ["feature", "shared", "server", "config"] } },
                },
              },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { types: { anyOf: ["shared", "config"] } } } },
            },
            {
              from: { element: { type: "server" } },
              allow: { to: { element: { types: { anyOf: ["server", "config"] } } } },
            },
            {
              from: { element: { type: "config" } },
              allow: { to: { element: { type: "config" } } },
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // อนุญาตแค่สองประตู: @/features/<name> และ @/features/<name>/server
              group: ["@/features/*/*", "!@/features/*/server"],
              message:
                "import ผ่าน @/features/<name> หรือ @/features/<name>/server เท่านั้น",
            },
            {
              group: ["../../../*"],
              message: "ใช้ alias @/ แทน relative import ลึก ๆ",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
