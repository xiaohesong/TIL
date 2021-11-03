### webpack5

#### 依赖升级

Mini-css node最低版本10.13

- moment-locales-webpack-plugin - 1.2.0

  支持w5 https://github.com/iamakulov/moment-locales-webpack-plugin/releases/tag/v1.2.0

- Fork-ts-checker-webpack-plugin 5.0.0

  支持w5 https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v5.0.0

  changelog https://openbase.com/js/fork-ts-checker-webpack-plugin/versions

- mini-css-extract-plugin 1.0.0

  https://github.com/webpack-contrib/mini-css-extract-plugin/blob/master/CHANGELOG.md#100-2020-10-09

- speed-measure-webpack-plugin 1.4.2

  https://github.com/stephencookdev/speed-measure-webpack-plugin/releases/tag/v1.4.2

  说是支持了，但是对其他的有影响:

  - Terser-webpack-plugin

    `TypeError: Cannot read property 'JavascriptModulesPlugin' of undefined`

  - Mini-css-extract-plugin

    `TypeError: Class extends value undefined is not a constructor or null`

  所以暂时就不在`optimization`里直接使用terser了，而是用默认的。



### spiltChunks

- name

  使用默认的false就好，删除common这个名称 

  https://webpack.js.org/plugins/split-chunks-plugin/#splitchunksname

### 报错

1. fully specified

```js
The request './xxxFile' failed to resolve only because it was resolved as fully specified
(probably because the origin is a '*.mjs' file or a '*.js' file where the package.json contains '"type": "module"').
The extension in the request is mandatory for it to be fully specified.
Add the extension to the request.
```

解决方案在@babel/runtime版本解决：https://github.com/webpack/webpack/issues/11467#issuecomment-706726490

不晓得为啥，升级了runtime竟然还不行，那就在`module.rules`加上配置：

```js
{
  test: /\.m?js/,
  resolve: {
    fullySpecified: false
  }
}
```

2. include polyfills

```js
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

其实下面也有解决方案：

```js
If you want to include a polyfill, you need to:
	- add a fallback 'resolve.fallback: { "path": require.resolve("path-browserify") }'
	- install 'path-browserify'
If you don't want to include a polyfill, you can use an empty module like this:
	resolve.fallback: { "path": false }
```

就是直接加上就行了：

```js
{
  resolve: {
    alias: {...},
    fallback: {
      path: false
    }
  }
}
```

造成这个原因主要还是因为webpack5默认不在添加一些node的绑定。

之前的一些绑定可以查看：https://github.com/webpack/webpack/pull/8460/commits/a68426e9255edcce7822480b78416837617ab065

如果不想一个个的去添加，可以使用 https://www.npmjs.com/package/node-polyfill-webpack-plugin

- Terser-webpack-plugin

  该版本的5.1.1和speed-measure-webpack-plugin支持webpack5的版本有冲突，造成错误：

  ```js
  const hooks = compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);
                                                  ^
  
  TypeError: Cannot read property 'JavascriptModulesPlugin' of undefined
      at Proxy.compiler.hooks.compilation.tap.compilation (...
  ```

  这个倒还好，如果没有特殊要求就使用webpack5默认配置的terser压缩(就是你没办法自己写入参数)。

- mini-css-extract-plugin@1.3.9

  该版本的1.3.9和speed-measure-webpack-plugin支持的webpack5的版本有冲突，造成：

  ```js
  TypeError: Class extends value undefined is not a constructor or null
  ```

  去里面debug下可以发现是获取不到webpack的Module。改成1.3.4版本可用。

- splitChunks.name

```js
BREAKING CHANGE: webpack < 5 used to allow to use an entrypoint as splitChunk. This is no longer allowed when the entrypoint is not a parent of the selected modules.
Remove this entrypoint and add modules to cache group's 'test' instead. If you need modules to be evaluated on startup, add them to the existing entrypoints (make them arrays). See migration guide of more info.
```



默认的配置：

Webpack4: https://v4.webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

Webpack5: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

webpack文档有毒啊。。。sideEffects的配置竟然跳到了v4，但是v5是米有的。

- css失效(css modules的情况下)

css-loader升级到5之后，`esModule: false`的情况下，有些css没有生效，是由于姿势有问题

`import * as styles from 'xxx.module.css'`

上面这样就不行，修改下：

`import styles from 'xxx.module.css'`

这样就可以，看了webpack5 changelog并没有指出。

匹配一下

```js
// 直接匹配*
^import \* as \w+ from '\.+/\w+.css
// 直接匹配import {xxx} from 'xx.css'
^import \{(.+?)\} from '\.+/\w+.css
```

或者直接搜索替换：

```js
^import \* as (\w+) from ('\.+/\w+.css')
```

替换一下:

```js
import $1 from $2
```

相关issue：https://github.com/webpack-contrib/css-loader/issues/1276

另外一种支持`import * as xx from 'xx.css'`的方式也在里面，不过比较坑，会导出一些关键字。

- 生产环境和本地环境chunk id不一致的问题

> 这个情况你可能不需要关注，因为项目原因，本地加载的文件是根据线上的文件来。

这个设置下`optimization.chunkIds:'deterministic' `

可以看下，他是有改变的：

https://webpack.js.org/migrate/5/#update-outdated-options

https://v4.webpack.js.org/configuration/mode/#mode-development

https://webpack.js.org/configuration/mode/#mode-development

https://v4.webpack.js.org/configuration/optimization/#optimizationchunkids



根据项目来排查，项目之前webpack4是没有设置mode的，所以，[默认是production的mode](https://v4.webpack.js.org/configuration/mode/#usage)，后面的设置就根据production来。

因为我在本地加了`mode: 'development'` 所以会出现这个问题，简单粗暴点，去除了就好。

但是去除之后，本地是可以开发了，但是会

```js
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

直接告诉我，不要用production模式，所以最后还是换成`mode: 'development'`。

dev配置如下：

```js
optimization: {
  minimize: false,
  removeAvailableModules: false,
  removeEmptyChunks: false,
  moduleIds: 'deterministic',
  chunkIds: 'deterministic',
  // splitChunks: false,
  runtimeChunk: 'single'
},
```

> https://github.com/webpack/webpack/releases/tag/v5.26.0 在5.26版本修复了内存泄露问题

- _jsxDevRuntime.jsxDEV is not function

这个就是比较操蛋了，基本就是给升级到webpack5出现了这个情况，不晓得是哪里出现的问题。

问题是这样的(本地开启`development: true`会出现问题)：

```js
presets: [
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
      development: process.env.BABEL_ENV !== 'production'
    }
  ],
]
```

```js
// example.js
export default class Example extends React.Component {
  render() {
    return <div />
  }
}
// a.js
const example = <Example />
```

会抛出一个错误: 

```js
Uncaught TypeError: (0 , _jsxDevRuntime.jsxDEV) is not a function
```

这个可能是由于多个react版本引起的问题，可以check下react版本。

如果是多个react版本导致的，固定下：

```js
resolve: {
  alias: {
    react: path.resolve(__dirname, './node_modules/react')
  }
}
```

- Uncaught ReferenceError: process is not defined 

react-markdown依赖了process，所以需要做下处理

`yarn add process -D`

```js
module.exports = {
  ...
  plugins: [
      new webpack.ProvidePlugin({
             process: 'process/browser',
      }),
  ],
}
```

- ```
  Error: write EPIPE
  ```

虽说网上很多都说是内存的关系，但是由于项目是升级的，如果可能也是由于持久缓存的缘故吧。。。

- ```
  UnhandledPromiseRejectionWarning: RpcIpcMessagePortClosedError: Process 30488 exited [SIGKILL]
  ```

  来自fork-ts-checker-webpack-plugin的提示，有理由怀疑是由于持久缓存的问题。。

  

感觉webpack5本地开发的时候有些慢啊。。。

splitchunks最好不要被禁用 https://github.com/webpack/webpack/issues/8644#issuecomment-457195102

Webpack5 很慢很慢！！

https://github.com/webpack/webpack/issues/12102

https://github.com/webpack/webpack/issues/12102#issuecomment-738665508



```js
compiler.hooks.afterPlugins.tap(pluginName, () => {
	tsCheckerHooks.serviceBeforeStart.tapPromise(pluginName, () => {
    // ...
  })
})

```





项目庞大，项目代码冗余较多，升级webpack到最新版支持新的技术迭代，使得项目相对解藕，更好的组织项目代码，便于拓展维护。	
