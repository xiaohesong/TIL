编译的时候，需要设置缓存的失效策略，这个就是根据`hash`值来决定，`webpack`中的`hash`有以下集中类型。

- hash

这个是编译的时候形成的。他针对的范围比较大，是整个webpack打包的时候生成的，比如有一个文件更改，其他的文件没有更改，那么其他的文件编译之后，hash值也会改变。

这样的方式显然不是我们想要的，并不能带来缓存的效果.

- chuckhash

这个是针对具体的chuck(模块)，粒度比较细，如果有模块内容改变，那么就会改变chuckhash值，如果其他的没有更改，那就不会影响到其他的，只会作用在自身。

- contenthash

webpack是以js为主的，只认识js,不认识css, img. 所以我们需要一些文件去提取webpack识别不了的内容(mini-css-extract-plugin, ...).

一个js文件模块在进行编译的时候使用的是chuckhash算法，因为js引用了css,所以在chuck计算的时候，会把css也算在里面，这就导致了一个问题：

**无论修改css或者js，这个chuck的hash都会改变**

为了避免**修改js影响css**这个问题，一些提取css的插件里出了`contenthash`,就是把css内容和js分开，为css内容单独使用contenthash.

不过这(mini-css-extract-plugin)也也存在一个问题：

**每次修改css文件都会影响js**, 也不知道是不是一个bug还是一个feature. 这个也有处理的方法: **处理的办法就是把js output 的 [chuckhash 也变成 contenthash](https://github.com/webpack/webpack/issues/7138).**

至于老旧的[extract-text-webpack-plugin](extract-text-webpack-plugin)就不需要从chuckhash到contenthash.没有亲自尝试。

