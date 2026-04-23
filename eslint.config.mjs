import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default config;
