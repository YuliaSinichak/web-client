import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

const eslintConfig = {
  extends: [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
  ],
  rules: {
    "no-unused-vars": "off",  // Disable the unused variables rule
  },
};

export default eslintConfig;
