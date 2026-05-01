export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "declaration-block-no-redundant-longhand-properties": null,
  },
  ignoreFiles: ["node_modules/**", "dist/**", "public/**", "src/scss/**"],
};
