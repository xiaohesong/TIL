原文: [Codebase Overview](https://reactjs.org/docs/codebase-overview.html)

> 本文主要是概述react代码的组织，约定和实现。

如果你想为react做出一份贡献，请阅读[贡献指南](https://reactjs.org/docs/how-to-contribute.html)，这将会使你更便捷的做出贡献。

不是我们一定要在react应用中推行这些约定，很大部分的原因是因为历史包袱，随着时间的改变，这些都会改变。

### 外部的依赖
React几乎没有任何的外部依赖。通常`require`都是引入的react内部的文件。当然，也有极个别的例外情况。

[fbjs代码库](https://github.com/facebook/fbjs)是个意外，因为React与像Relay之类的库需要共享一些小的实用程序，我们会保持它的同步。我们不会依赖node生态系统中可用的类似的库，如果真的有需要，会对这些库进行更改之后使用。fbjs库中的一些工具类都不会作为公开的API去，仅仅是给像React这样的fb的项目去使用。

### 顶层的文件夹
在你clone了[react代码库](https://github.com/facebook/react)之后，就会看到一些顶层的文件夹:
- [packages](https://github.com/facebook/react/tree/master/packages)
  这个包含了代码所有包的一些基础信息(比如: package.json)和源码(src目录)。**如果你要修改代码，那么`src`下的代码将是你花费时间精力的地方。**
- [fixtures](https://github.com/facebook/react/tree/master/fixtures)
  这个是针对贡献的代码的一个测试程序。
- build
  build是React的构建输出。它不在存储库中，但是在第一次[构建](https://reactjs.org/docs/how-to-contribute.html#development-workflow)它之后它将出现在你clone的React中。

还有一些其他顶层文件夹，但它们主要作为工具使用，你做的贡献可能并不需要这些。

### 测试
我们没有单元测试的顶级目录。相反，我们将它们放入一个名为__tests__的目录中，该目录就是相对于它们测试的文件。

### Warnings 和 Invariants
React使用warning模块来展示警告信息。
```js
var warning = require('warning');

warning(
  2 + 2 === 4,
  'Math is not working today.'
);
```
**触发这个警告的条件是当条件为`false`时。**

之所以这样是因为条件是应该反应成正常情况而不是针对特殊情况。
> 笔者认为: 不是为了警告而警告，语意以条件为主，而不是以警告为主。

对于在`console`里重复的发送垃圾信息，这或许是个好的想法:
```js
var warning = require('warning');

var didWarnAboutMath = false;
if (!didWarnAboutMath) {
  warning(
    2 + 2 === 4,
    'Math is not working today.'
  );
  didWarnAboutMath = true;
}
```
警告仅仅在开发环境下可用。在生成环境中，就不再使用。如果你想根据条件禁止执行代码，请使用`invariant`:
```js
var invariant = require('invariant');

invariant(
  2 + 2 === 4,
  'You shall not pass!'
);
```
同样的，**当条件为`false`的时候，会触发。**

保持开发和生产环境行为的一致性非常重要，因此在开发和生产中都可以使用这个。错误消息会自动替换为生产中的错误代码，以避免对字节大小产生影响。

### Development and Production
你可以使用`__DEV__`来判断环境，进行针对开发环境的开发。

它在编译步骤中关联，并在CommonJS构建中变为`process.env.NODE_ENV !== 'production'`检查。

对于独立部署，在`unminified build`的时候是`true`, 在`minified build`的时候通过`if`块来去除。
```js
if (__DEV__) {
  // This code will only run in development.
}
```

### Flow
我们最近开始向代码库引入Flow检查。让标题注释中标有@flow注释的文件进行类型检查。

我们接受将`flow`注释[添加到现有代码](https://github.com/facebook/react/pull/7600/files)的PR。流注释看起来像这样：
```js
ReactRef.detachRefs = function(
  instance: ReactInstance,
  element: ReactElement | string | number | null | false,
): void {
  // ...
}
```
尽可能的在新加的代码里添加Flow，然后可以运行`yarn flow`检查。

### 动态注入
React在一些模块中使用动态注入。虽然总是看起来很清晰，但它仍然是不够好，因为它阻碍了对代码的理解。因为以前在React中只考虑到DOM,。之后React Native fork了React的代码进行扩展。所以添加了动态注入让React Native 覆盖一些行为。

你可能会看到一些模块声明的动态注入，类似这样:
```js
// Dynamically injected
var textComponentClass = null;

// Relies on dynamically injected value
function createInstanceForText(text) {
  return new textComponentClass(text);
}

var ReactHostComponent = {
  createInstanceForText,

  // Provides an opportunity for dynamic injection
  injection: {
    injectTextComponentClass: function(componentClass) {
      textComponentClass = componentClass;
    },
  },
};

module.exports = ReactHostComponent;
```
注射部分没有任何特殊处理。但按照惯例，这意味着该模块希望在运行时将一些（可能是平台特定的）依赖项注入其中。

代码库中有多个注入点。在未来，我们打算摆脱动态注入机制，并在构建过程中静态地连接所有碎片。

### 多个包
React是一个[monorepo](http://danluu.com/monorepo/)。它的存储库包含多个独立的包，以便它们的更改可以协调在一起，并在一个地方发布。


### React核心
“核心”包括React的[顶层API](https://reactjs.org/docs/top-level-api.html#react),例如:
- React.createElement()
- React.Component
- React.Children

**注意：React核心仅包含定义组件的API。** 它不包括[reconciler](https://reactjs.org/docs/reconciliation.html)算法或任何特定于平台的代码。它由React DOM和React Native组件使用。
> 对上面核心理解有不明白的，可以[查看这篇文章](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/How-Does-setState-Know-What-to-Do.md) -- Dan

React的核心代码在[packages/react](https://github.com/facebook/react/tree/master/packages/react)下面，作为react npm包。对外暴露全局的React。

### Renderers
React最初是为DOM而构建的，但是后来又开始支持React Native。于是乎就像React内部引入了renderers的概念。

**renderer负责React树如何被底层平台调用。**

`renderer`同样存在[packages/](https://github.com/facebook/react/tree/master/packages/)下面：
- [React Dom Renderer](https://github.com/facebook/react/tree/master/packages/react-dom)负责把react组件渲染成DOM。它实现了顶级的[ReactDOM API](https://reactjs.org/docs/react-dom.html)，可作为[react-dom](https://www.npmjs.com/package/react-dom)的npm包使用。他也可以被浏览器单独使用，叫做`react-dom.js`,他对外暴露一个全局的ReactDOM
- [React Native Renderer](https://github.com/facebook/react/tree/master/packages/react-native-renderer)把react组件渲染成原生的视图。是由React Native在内部使用。

- [React Test Renderer](https://github.com/facebook/react/tree/master/packages/react-test-renderer)负责把组件渲染成JSON树， 他由[Jest](https://facebook.github.io/jest)的 [Snapshot Testing](https://facebook.github.io/jest/blog/2016/07/27/jest-14.html)使用，可作为[react-test-renderer](https://www.npmjs.com/package/react-test-renderer) npm包使用。

唯一正式支持的渲染器是[react art](https://github.com/facebook/react/tree/master/packages/react-art)。它曾经在一个单独的GitHub存储库中，但我们现在将它移动到主源代码树中。

> 从技术上讲，[react-native-renderer](https://github.com/facebook/react/tree/master/packages/react-native-renderer)是一个非常薄的层，使React与React Native实现进行交互。事实上，原生视图特定于平台的代码管理是和组件一起在[React native 仓库](https://github.com/facebook/react-native)中。

### Reconcilers
即使是像React DOM和React Native这样极为不同的渲染器也需要分享很多逻辑。特别是[reconciliation](https://reactjs.org/docs/reconciliation.html)算法应该尽可能的相似，以便声明性呈现，自定义组件，状态，生命周期方法和ref在不同平台上一样的工作。

为了解决这个问题，不同的渲染器在它们之间共享一些代码。我们将React的这一部分称为“reconciler(协调者)”。当类似`setState`这样的更新时，`reconciler`在组件上调用`render`方法，并且mounts, updates或者 unmounts.

Reconcilers没有单独拆分成包，因为没有公共的API。相反，它们仅由React DOM和React Native等渲染器使用。

### Stack Reconciler
stack(堆栈) reconciler是react 15版本及更早的实现。我们已经停止使用他了，但是我们会在[下一节](https://reactjs.org/docs/implementation-notes.html)详细的介绍他。

### Fiber Reconciler
“fiber” reconciler 是最近努力的成果，主要是解决‘stack reconciler’中的问题以及其他一直存在的问题。他在react16之前一直是默认的reconciler。
Fiber reconciler 主要的目标是:
- 能够以块的形式分割可中断的工作
- 能够在处理的时候确定优先级，重新定位和重用的工作。
- 能够在父子任务之间从容切换（yield back and forth），以支持React的布局刷新
- 能够从render返回多个元素
- 更好地支持error boundary

你可以在[此处](https://github.com/acdlite/react-fiber-architecture)和[此处]([here](https://blog.ag-grid.com/index.php/2018/11/29/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
)阅读有关React Fiber 构建的更多信息。虽然它已随React 16一起提供，但默认情况下尚未启用异步功能。

他的源码在 [`packages/react-reconciler`](https://github.com/facebook/react/tree/master/packages/react-reconciler).

### Event System
React实现了一个合成事件系统，它与渲染器无关，并且与React DOM和React Native一起工作。他的源码在 [`packages/events`](https://github.com/facebook/react/tree/master/packages/events)。

这里有个关于[深入事件系统的视频](https://www.youtube.com/watch?v=dRo_egw7tBc)(66分钟)

### What Next?
阅读[下一章节](https://reactjs.org/docs/implementation-notes.html)关于pre-React 16 reconciler更详细的实现。我们目前还没有关于reconciler的内部的文档。



