import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration simplifiée pour éviter la récursion
const eslintConfig = [
  // Configuration de base
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "public/**"],
  },
  
  // Configuration pour tous les fichiers
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        },
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "import": importPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "prettier": prettierPlugin
    },
    rules: {
      // Règles générales
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      
      // Règles TypeScript
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // Règles React
      "react/react-in-jsx-scope": "off", // Non nécessaire dans Next.js
      "react/prop-types": "off", // Utiliser TypeScript à la place
      "react/jsx-props-no-spreading": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      
      // Règles d'importation
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      "import/no-duplicates": "error",
      
      // Règles d'accessibilité
      "jsx-a11y/anchor-is-valid": ["error", {
        "components": ["Link"],
        "specialLink": ["hrefLeft", "hrefRight"],
        "aspects": ["invalidHref", "preferButton"]
      }],
      
      // Règles de formatage (via Prettier)
      "prettier/prettier": ["error", {
        "singleQuote": true,
        "trailingComma": "es5",
        "tabWidth": 2,
        "semi": true,
        "printWidth": 100,
        "bracketSpacing": true,
        "arrowParens": "avoid"
      }]
    },
    settings: {
      react: {
        version: "detect"
      },
      "import/resolver": {
        typescript: {}
      }
    }
  },
  
  // Règles spécifiques pour les tests
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  }
];

export default eslintConfig;
