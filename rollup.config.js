import resolve from "@rollup/plugin-node-resolve";
// import terser from "@rollup/plugin-terser";

export default {
  input: "src/hatch-card.js",
  output: {
    file: "hatch-card.js",
    format: "es",
  },
  plugins: [
    resolve(),
    // terser(),
  ],
};
