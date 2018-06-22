[原文: A tale of Webpack 4 and how to finally configure it in the right way](https://hackernoon.com/a-tale-of-webpack-4-and-how-to-finally-configure-it-in-the-right-way-4e94c8e7e5c1)

#### 基本构建

开始新的项目
```shell
mkdir webpack-4-tutorial
cd webpack-4-tutorial

npm init
```

上下会初始化一个项目，接下来添加webpack4.
```javascript
npm install webpack webpack-cli --save-dev
```
确定装的webpack版本是4.

接下来修改package.json

```javascript
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack"
 },
```
保存之后，`npm run dev`会出现一个错误.

```javascript
Insufficient number of arguments or no entry found.
Alternatively, run 'webpack(-cli) --help' for usage info.

Hash: 4442e3d9b2e071bd19f6
Version: webpack 4.12.0
Time: 62ms
Built at: 2018-06-22 14:44:34

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/

ERROR in Entry module not found: Error: Can't resolve './src' in '~/workspace/webpack-4-tutorial'
```

两个问题，第一个出错的意思是说，没有设置`mode`,默认会认为是`production`模式。第二个是说`src`下没有找到入口模块。

我们来改下，再次打开`package.json`
```javascript
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack --mode development"
  },
```
在项目下新建`src`文件夹，然后`src`下新建`index.js`.
```javascript
console.log(“hello, world”);
```
保存后再次运行`npm run dev`.

这时候成功打包，发现项目里多了一个`dist`文件夹. 这是因为webpack4是号称0配置，所以很多东西都给你配置好了，比如默认的入口文件，默认的输出文件。
在webpack中配置环境，基本都是两个配置文件(`development`, `production`).在`webpack4`中，有这两个模式来区分。

```javascript
"scripts": {
  "dev": "webpack --mode development",
  "build": "webpack --mode production"
}
```

保存后运行`npm run build`,你会发现`main.js`文件小了很多。

上面很多东西都是通过默认配置来的，尝试去重写配置，在不使用配置文件的情况下。

```javascript
"scripts": {
     "dev": "webpack --mode development ./src/index.js --output ./dist/main.js",
   "build": "webpack --mode production ./src/index.js --output ./dist/main.js"
 },

```

#### 编译转换你的代码
`es6`就是未来，可是现在的浏览器对他的支持不是很好，我们需要`babel`来转换他。

```shell
npm install babel-core babel-loader babel-preset-env --save-dev
```

bable的配置，需要创建一个文件去配置。
新建`.babelrc`文件，写入如下内容
```javascript
{
  "presets": [
    "env"
  ]
}
```
接下来需要配置`babel-loader`,可以在`package.json`文件配置，但是还是独立出去好，比较好维护。项目下新建一个`webpack.config.js`.加入一些基础配置。

```javascript
// webpack v4
const path = require('path');
module.exports = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
```

然后`package.json`的脚本可以去除一些配置.
```javascript
"scripts": {
    "dev": "webpack --mode development",
  "build": "webpack --mode production"
  },
```

然后再运行编译，也是可以正常编译。

#### Html && Css

在`dist`文件夹下新建一个`index.html`的文件.
```html
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div>Hello, world!</div>
    <script src="main.js"></script>
  </body>
</html>
```
上面这段代码，使用到了`style.css`. 接来下去处理`css`的问题.
`src`文件夹下新建`style.css`。
```css
div {
  color: red;
}
```
然后在js文件中引入css.,打开`index.js`文件
```javascript
import "./style.css";
console.log("hello, world");
```
解析来我们就需要配置`css`的规则，打开`webpack.config.js`
```javascript
// webpack v4
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); //新加入

module.exports = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: ['css-loader']
          })
      }// 新加的css 规则
    ]
  }
};

```
上面我们用了一些插件和加载器.需要去安装.
```shell
npm install extract-text-webpack-plugin --save-dev
npm install style-loader css-loader --save-dev
```
上面我们提出css来编译，你可以看到他的规则， 规则可以这样认为

```javascript
{
        test: /\.拓展名$/,
        exclude: /不需要执行的文件夹/,
        use: {
          loader: "你的加载器"
        }
}
```

我们需要`extract-text-webpack-plugin`这个提取插件，因为`webpack`只会辨别`js`.这里需要通过`ExtractTextPlugin `获取css文本进行压缩。

我们再次尝试编译，`npm run dev`发现会有报错，这个是因为这个提取器在新版本的原因。[相关报错Webpack 4 compatibility](https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/701)
可以解决这个问题，那就是换个版本。
```javascript
npm install -D extract-text-webpack-plugin@next
```
然后再编译，发现可以来，同时再`dist`下有一个style.css文件。

这时候`package.json`的依赖文件如下

```javascript
"devDependencies": {
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.4",
    "babel-preset-env": "^1.6.1",
    "css-loader": "^0.28.11",
    "extract-text-webpack-plugin": "^4.0.0-beta.0",
    "style-loader": "^0.20.3",
    "webpack": "^4.4.1",
    "webpack-cli": "^2.0.12"
  }
```

下面我们来配置支持`scss`
```shell
npm install node-sass sass-loader --save-dev
```

我们在`src`下新建一个`index.html`

```html
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div>Hello, world!</div>
    <script src="main.js"></script>
  </body>
</html>
```

安装`html`插件
```shell
npm install html-webpack-plugin --save-dev
```
安装完成之后来修改`webpack.config.js`
```javascript
// webpack v4
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');// 新加

module.exports = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: ['css-loader']
          })
      }// 新加
    ]
  },
  plugins: [
    new ExtractTextPlugin({filename: 'style.css'}),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/index.html',
      filename: 'index.html'
    })// 新加

  ]
};

```
这个是最终的html的一个模版. 现在`html`,`css`,`js`基本配置的差不多，我们删除`dist`来试试。
```shell
rm -rf dist/
npm run dev
```
这时候会发现`dist`下存在`js,css,html`文件.
