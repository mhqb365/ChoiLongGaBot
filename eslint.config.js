const js = require("@eslint/js");
const globals = require("globals");

// Cấu hình lint chỉ áp dụng cho mã nguồn Node.js trong src.
module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
      ".env",
      ".env.*",
      "!.env.example",
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      ".pnpm-store/**",
      ".agent/**",
      ".codex/**",
      "AGENTS.md",
      "GEMINI.md"
    ]
  },
  js.configs.recommended,
  {
    files: ["eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["public/dashboard/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser
      }
    }
  }
];
