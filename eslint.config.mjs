import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import pluginJsonc from "eslint-plugin-jsonc";
import pluginMarkdown from "eslint-plugin-markdown";
import pluginCss from "eslint-plugin-css";

export default defineConfig([
    // JavaScript files
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        plugins: {
            js,
            prettier: prettierPlugin
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser
        },
        extends: ["plugin:prettier/recommended", "js/recommended"],
        rules: {
            "prettier/prettier": "error",
            "no-console": "off",
            "func-names": "off",
            "no-underscore-dangle": "off"
        }
    },

    // CommonJS files
    {
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs"
        }
    },

    // React files
    pluginReact.configs.flat.recommended,

    // JSON / JSON5 files
    {
        files: ["**/*.json", "**/*.json5"],
        plugins: {
            jsonc: pluginJsonc
        },
        languageOptions: {
            parser: pluginJsonc.parsers.JSON
        },
        rules: {
            "jsonc/indent": ["error", 2],
            "jsonc/comma-dangle": ["error", "never"]
        }
    },

    // Markdown
    {
        files: ["**/*.md"],
        plugins: {
            markdown: pluginMarkdown
        },
        processor: pluginMarkdown.processors.markdown
    },

    // CSS
    {
        files: ["**/*.css"],
        plugins: {
            css: pluginCss
        },
        rules: {
            "css/no-duplicate-properties": "error"
        }
    }
]);