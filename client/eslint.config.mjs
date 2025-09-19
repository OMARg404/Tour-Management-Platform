import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
// eslint-disable-next-line no-unused-vars



export default defineConfig([
    { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser } },
    pluginReact.configs.flat.recommended, {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        ...js.configs.recommended,
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            }
        }
    },

    // تكوين React
    {
        files: ["**/*.{jsx,js}"],
        plugins: {
            react: pluginReact
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "operator-linebreak": ["error", "after"],
            "space-infix-ops": "error",
            "no-unexpected-multiline": "error"
        },
        settings: {
            react: {
                version: "detect"
            }
        }
    },

    // قواعد خاصة بالخادم (Node.js)
    {
        files: ["server/**/*.js"],
        languageOptions: {
            globals: globals.node
        }
    }
]);