const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  // {
  //   entry: "./src/content/index.tsx",
  //   target: "web",
  //   mode: "production",
  //   output: {
  //     path: path.join(__dirname, "dist"),
  //     filename: "js/content.js",
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /\.tsx?$/,
  //         use: [
  //           {
  //             loader: "ts-loader",
  //             options: {
  //               compilerOptions: { noEmit: false },
  //             },
  //           },
  //         ],
  //         exclude: /node_modules/,
  //       },
  //     ],
  //   },
  //   resolve: {
  //     extensions: [".ts", ".tsx", ".js"],
  //   },
  // },
  {
    entry: "./src/background/index.ts",
    target: "web",
    mode: "production",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "background/index.js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: { noEmit: false },
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
  },
  {
    entry: {
      index: "./src/window/index.tsx",
    },
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: { noEmit: false },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          exclude: /node_modules/,
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: "public", to: ".." }],
      }),
      ...getHtmlPlugins(["index"]),
    ],
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src/"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.join(__dirname, "dist/window"),
      filename: "[name].js",
    },
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  },
];

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HTMLPlugin({
        title: "Jambonz Webphone",
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
