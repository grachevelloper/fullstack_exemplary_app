const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const isDev = true;
const FE_PORT = 5173;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    };
    if (!isDev) {
        config.minimize = true;
        config.minimizer = [
            new CssMinimizerPlugin(),
            new TerserWebpackPlugin(),
        ];
    }
    return config;
};

const filename = (extension) => {
    if (isDev) {
        return `[name].${extension}`;
    } else {
        return `[name].[contenthash].${extension}`;
    }
};

const cssLoaders = (extra) => {
    const loaders = [
        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: isDev ? 'development' : 'production',
    entry: {
        main: './main.tsx',
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',
    },

    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx', '.jsx'],
        alias: {
            '@/pages': path.resolve(__dirname, './src/pages'),
            '@/todos': path.resolve(__dirname, './src/units/todos'),
            '@/users': path.resolve(__dirname, './src/units/users'),
            '@/tests': path.resolve(__dirname, './src/__test__'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/shared': path.resolve(__dirname, './src/shared'),
            '@/locales': path.resolve(__dirname, './src/locales'),
            '@/public': path.resolve(__dirname, './public'),
        },
    },
    optimization: optimization(),
    devServer: {
        port: FE_PORT || 5173,
        hot: isDev,
        historyApiFallback: true,
        static: [
            {
                directory: path.join(__dirname, 'dist'),
            },
            {
                directory: path.join(__dirname, 'public'),
                publicPath: '/',
            },
        ],
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            minify: {
                collapseWhitespace: !isDev,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
        }),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        }),
        isDev && new ReactRefreshWebpackPlugin(),
        new Dotenv(),
    ].filter(Boolean),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders(),
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader'),
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif)$/,
                type: 'asset/resource',
                exclude: [path.resolve(__dirname, 'public')],
                generator: {
                    filename: 'images/[hash][ext][query]',
                },
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules[\\/]/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript',
                            [
                                '@babel/preset-react',
                                {
                                    runtime: 'automatic',
                                    development: isDev,
                                },
                            ],
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            isDev && [
                                'react-refresh/babel',
                                {skipEnvCheck: true},
                            ],
                        ].filter(Boolean),
                    },
                },
            },
        ],
    },
};
