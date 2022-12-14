const path = require("path");
const webpack = require('webpack');
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const runtimeConfig = require("./webpack.runtime");


const publisherConfig = {
    mode: "development",
    target: "node",
    node: {
        __dirname: false,
        __filename: false
    },
    entry: {
        "index": ["./src/startup.publish.ts"]
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, "dist/publisher")
    },
    externals: {
        "firebase-admin": "firebase-admin"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { url: false } },
                    { loader: "postcss-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    allowTsInNodeModules: true
                }
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                options: {
                    esModule: true,
                    sources: false,
                    minimize: {
                        removeComments: false,
                        collapseWhitespace: false
                    }
                }
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.(raw|liquid)$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /canvas/ }, { resourceRegExp: /jsdom$/ }),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
        new CopyWebpackPlugin({
            patterns: [
                { from: `./src/data/demo.json`, to: `./data/demo.json` },
                { from: `./src/config.publish.json`, to: `config.json` },
                { from: `./src/config.runtime.json`, to: `assets/config.json` },
                { from: `./src/scripts/custom.js`, to: "./scripts/custom.js" }
            ]
        })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".html", ".scss"]
    }
};

const publisherRuntimeConfig = merge(runtimeConfig, {
    entry: { "styles/theme": `./src/themes/website/styles/styles.scss` },
    output: { "path": path.resolve(__dirname, "dist/publisher/assets") }
});

module.exports = {
    default: [publisherConfig, publisherRuntimeConfig],
    publisherConfig,
    publisherRuntimeConfig
}