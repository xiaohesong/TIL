### `yarn`和`npm`的对比
- 版本控制
`npm`的版本控制不够精确,会存在误差.而且每次都不会去`创建/更新`版本.
只有在`npm-shrinkwrap.json`存在的时候,他才会去更新. 默认是不会创建`npm-shrinkwrap.json`

    `yarn`则不同,他会去创建`yarn.lock`,每次执行都是`创建/更新`相关版本号.

- 安全问题
`npm`在安装的时候会运行代码.

- 效率问题
`npm`是一个个的往下执行.
`yarn`是并行.安装的效率会大大提高.

- install
    1, `npm install`是从`package.json`安装依赖或者添加新的包.
    2. `yarn install`只会根据`yarn.lock`或者`package.json`去安装依赖,却不会添加新的包.
    3. `yarn install`和`yarn add`相当于`npm install`的作用.

- 相似之处
1.  `yarn upgrade`相似于`npm update`

- 不同之处
1. `yarn licenses ls`可以查看包的相关信息.

- 对应命令行差异

[commands-comparison](https://yarnpkg.com/en/docs/migrating-from-npm#toc-cli-commands-comparison)

[参考地址](https://www.sitepoint.com/yarn-vs-npm/)

- shrinkwrap install
```shell
npm install npm-shrinkwrap-install
npm install
npm prune
npm dedupe
npm install
npm shrinkwrap --dev
```

### 有不对的地方还望指出.有更好的结论欢迎提出.
