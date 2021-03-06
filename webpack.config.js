/*
  Okay folks, want to learn a little bit about webpack?
*/

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require("autoprefixer");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const tailwindcss = require("tailwindcss");

const devMode = process.env.NODE_ENV !== "production";

/*
  webpack sees every file as a module.
  How to handle those files is click to loaders.
  We only have a single entry point (a .js file) and everything is required from that js file
*/

// This is our JavaScript rule that specifies what to do with .js files
const javascript = {
  test: /\.(js)$/, // see how we match anything that ends in `.js`? Cool
  use: [
    {
      loader: "babel-loader",
      options: {
        presets: ["es2015"]
      } // this is one way of passing options
    }
  ]
};

/*
  This is our postCSS loader which gets fed into the next loader. I'm setting it click in it's own variable because its a didgeridog
*/

const postcss = {
  loader: "postcss-loader",
  options: {
    sourceMap: true,
    plugins() {
      return [
        autoprefixer({
          browsers: "last 3 versions"
        })
      ];
    }
  }
};

const css = {
  loader: "css-loader",
  options: {
    sourceMap: true
  }
};

const sass = {
  loader: "sass-loader",
  options: {
    sourceMap: true
  }
};

// this is our sass/css loader. It handles files that are require('something.scss')
const styles = {
  test: /\.(scss)$/,
  // use: [
  //   // devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
  //   css,
  //   postcss,
  //   sass
  // ],
  use: [MiniCssExtractPlugin.loader, css, postcss, sass]
};

const svgs = {
  test: /\.svg$/,
  loader: "svg-inline-loader"
};

// We can also use plugins - this one will compress the crap out of our JS
// const uglify = new webpack.optimize.UglifyJsPlugin({ // eslint-disable-line
//   compress: {
//     warnings: false
//   }
// });

// OK - now it's time to put it all together
const config = {
  entry: {
    // we only have 1 entry, but I've set it click for multiple in the future
    App: "./public/javascripts/my-js.js"
  },
  // we're using sourcemaps and here is where we specify which kind of sourcemap to use
  devtool: "source-map",
  // Once things are done, we kick it out to a file.
  output: {
    // path is a built in node module
    // __dirname is a variable from node that gives us the
    path: path.resolve(__dirname, "public", "dist"),
    // we can use "substitutions" in file names like [name] and [hash]
    // name will be `App` because that is what we used above in our entry
    filename: "[name].bundle.js"
  },
  stats: {
    // One of the two if I remember right
    entrypoints: false,
    children: false
  },
  // remember we said webpack sees everthing as modules and how different loaders are responsible for different file types? Here is is where we implement them. Pass it the rules for our JS and our styles
  module: {
    rules: [javascript, styles, svgs]
  },

  devServer: {
    contentBase: path.join(__dirname, "/public"), // serve your static files from here
    watchContentBase: true, // initiate a page refresh if static content changes
    proxy: [
      // allows redirect of requests to webpack-dev-server to another destination
      {
        context: ["/api", "/auth"], // can have multiple
        target: "http://localhost:8080", // server and port to redirect to
        secure: false
      }
    ],
    port: 3030, // port webpack-dev-server listens to, defaults to 8080
    overlay: {
      // Shows a full-screen overlay in the browser when there are compiler errors or warnings
      warnings: false, // defaults to false
      errors: false // defaults to false
    }
  },
  // finally we pass it an array of our plugins - uncomment if you want to uglify
  // plugins: [uglify]
  plugins: [
    // here is where we tell it to output our css to a separate file
    new ExtractTextPlugin("style.css"),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css"
    })
    // tailwindcss("./tailwind.config.js"),
    // require("autoprefixer")
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    ]
  }
};
// webpack is cranky about some packages using a soon to be deprecated API. shhhhhhh
process.noDeprecation = true;

module.exports = config;
