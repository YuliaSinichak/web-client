import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // disable unused vars rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // disable explicit any rule
      "@typescript-eslint/no-explicit-any": "off",

      // disable next.js anchor tag usage warning
      "@next/next/no-html-link-for-pages": "off",

      // disable react unescaped entities warning
      "react/no-unescaped-entities": "off",
    },
  },
];
