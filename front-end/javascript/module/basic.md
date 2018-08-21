[Learn the basics of the JavaScript module system and build your own library](https://medium.freecodecamp.org/anatomy-of-js-module-systems-and-building-libraries-fadcd8dbd0e)

js中的模块类型主要有下面这几种

### CommonJS

- 通过node实现
- 通过`require`加载
- 通过`module.exports`导出
- 没有运行时/异步模块加载
- `require`得到的是一个对象
- 无静态分析，因为你得到的是一个对象，所以属性查找实在运行时
- 得到的是一个副本，模块本身不会发生实际更改

### AMD: Async Module Definition

- 通过RequireJs实现
- 用户浏览器端动态加载模块
- 通过require引入

### UMD: Universal Module Definition
- Commonjs的语法和AMD的异步加载的组合
- 可用于AMD/CommonJs 环境
- 可在客户端和服务端使用

### es6

- 用户客户端和服务端
- 支持模块的运行时和静态加载
- import得到具体的绑定数据
- import加载，export导出
- 静态分析,编译的时候就可以检查，没有必要去运行。
- 模块修改，获取实时修改的数据

