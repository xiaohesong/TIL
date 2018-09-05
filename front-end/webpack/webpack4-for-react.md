前几天用webpack4配置了下react,这里主要说下碰到的一些问题。[源代码](https://github.com/xiaohesong/react-by-webpack4)

### 一些小问题

- hash缓存

  js和css都使用了**chunkhash**缓存，但是出现一个问题就是，无论修改css文件或者js文件，都会导致chunkhash改变，这显然不是我们需要的。
  
  然后用`mini-css-extract-plugin`将css提取出来之后使用`contenthash`，这样对内容进行hash命名。
  
  但是出现一个问题就是[每次css改变，js的chunkhash也会改变](https://github.com/webpack/webpack/issues/7138)，不知道这个是一个bug还是一个feature.
  因为其他的版本是不存在这个问题的，但是我目前这个版本出现了这个问题，[之前整了个demo没有这个问题](https://github.com/xiaohesong/webpack-4-tutrial)，查看github代码库的说法是推荐contenthash，chunkhash的保留只是为了兼容。
  **所以对js也进行contenthash命令, 这样每次css修改都不会影响js的hash命名。**
  
  [关于hash命名的区别请前往](https://github.com/xiaohesong/TIL/blob/master/front-end/webpack/hash.md)
  

- 资源压缩

  代码没有被很好的压缩，压缩了js发现css没有压缩.`mini-css-extract-plugin`并没有给我压缩css，所以css压缩使用了`optimize-css-assets-webpack-plugin`.
  
  但是用了这个之后，发现js没有压缩，fuck中。。然后再重新手动压缩(webpack4约定大于配置嘛，好耳熟).引入`uglifyjs-webpack-plugin`去压缩`js`.
  
  
- SplitChunks

  这个默认是拆分`异步加载的代码`，如果改成`init`或者`all`，会增大js文件，这个可能需要在项目差不多的时候，权衡之后再做使用。[可以参考这里的对比](https://github.com/xiaohesong/react-by-webpack4/issues/1)
  
  目前是加上了preload这个功能，这样第三方没有抽出来的代码会预加载。
  
  
- typescript code splitting

  这边折腾了不少时间，按照文档加上在`tsconfig.json`加上了`"module": "esnext"`,发现还是报错，不能正常解析，最后通过添加了`es2015`在`lib`里。
  
  
### tips

- [ignore plugin](https://webpack.js.org/plugins/ignore-plugin/)

  moment这个包有个问题，那就是语言和核心部分捆绑在一起了，用这个可以忽略对应的部分。

- [preload](https://github.com/GoogleChromeLabs/preload-webpack-plugin)

  可以对资源进行预加载，这个视情况而定，也许你其他的模块打包出来体积很小，可以不用做这个。我是因为没有对第三方的包进行提取，为了首次加载的速度，所以对后面的进行预加载.
  
  
