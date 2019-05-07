这里主要记录下，升级babel到7遇到的改变。

- @babel/core

  之前是`babel-core`，对应的新版本是`@babel/core`
  
- @babel/plugin-transform-runtime

  之前是`babel-plugin-transform-runtime`，现在是`@babel/plugin-transform-runtime`。
  
   https://babeljs.io/docs/en/babel-plugin-transform-runtime
  
- @babel/preset-env

  之前是`babel-preset-es2015`,现在是`@babel/preset-env`
  
  https://babeljs.io/docs/en/env
  
- @babel/preset-react

  之前是`babel-preset-react`，现在是`@babel/preset-react`
  
- @babel/preset-typescript

  之前配置ts的时候，使用的是`ts-loader`。不过现在就不需要了，直接使用`@babel/preset-typescript`就好了。
  
对应的配置，[之前的配置方式](https://github.com/xiaohesong/react-by-webpack4/blob/master/webpack.config.js#L43-L66)将改变成下面这样：
```js
{
  test: /\.(js|ts|tsx)$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
   
    "presets": [
      // https://babeljs.io/docs/en/babel-preset-react
      "@babel/preset-react",
      // es2015 to env https://babeljs.io/docs/en/env
      "@babel/preset-env",
      // https://babeljs.io/docs/en/babel-preset-typescript
      "@babel/preset-typescript",

      // https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets
    ],
    "plugins": [
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      ["@babel/plugin-transform-runtime", {
        "helpers": false, // defaults to true
      }],
    ] // End plugins
  },
},
```

可以发现，对应的提案阶段被移除了，具体可以看这里 https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets

因为今天在配置这个，所以记录下，后面可能还会碰到问题，会补上来，不过希望不要碰到问题吧。
