原文: [How Does setState Know What to Do?](https://overreacted.io/how-does-setstate-know-what-to-do/)

译：可能看到标题的时候会想，怎么去做还不是看代码吗？react中的`setState`不就是负责更新状态码？抱着好奇心看下去了。

当你在组件中调用`setState`的时候，你认为让发生了什么？
```js
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```
当然，`react`会在下一个`{clicked: true}`状态的时候`re-render`组件并且更新`DOM`去返回`<h1>Thanks</h1>`元素。

看起来很简单，对吧？等一下，请考虑下，这个是`react`在处理？或者是`ReactDOM`在处理?

更新`DOM`听起来似乎是`React DOM`在负责处理。但是我们调用的是`this.setState`，这个`api`是来自`react`，并非是`React DOM`。并且我们的`React.Component`是定义在`React`里的。

所以`React.Component.prototype.setState()`是如何去更新`DOM`的。

**事先声明: 就像本博客[大多数](https://overreacted.io/why-do-react-elements-have-typeof-property/)的[其他](https://overreacted.io/how-does-react-tell-a-class-from-a-function/)的[文章](https://overreacted.io/why-do-we-write-super-props/)一样，你其实可以完全不用知道这些内容，一样可以很好的使用`react`。这系列的文章是针对于那些好奇`react`内部原理的一些人。所以读不读，完全取决于你。**

***
我们可能会认为`React.Component`里包含了`DOM`的一些更新逻辑。

但是如果是我们猜想的这样，那么`this.setState()`如何在其他环境中正常工作？比如在React Native中的组件也是继承于`React.Component`, React Native应用像上面一样调用`this.setState()`，但React Native可以使用Android和iOS原生的视图而不是DOM。

再比如，你可能也熟悉React Test Renderer或Shallow Renderer。这些都可以让你渲染普通组件并在其中调用`this.setState()`。但是他们都不适用于`DOM`。

如果你使用过像[React ART](https://github.com/facebook/react/tree/master/packages/react-art)这样的渲染器，你便会知道可以在页面上使用多个渲染器。(例如，ART 组件在`React DOM`中工作)。这使得全局标志或变量无法工作。

所以 **`React.Component`以某种方式委托处理状态更新到特定的平台。** 在我们理解这是如何发生之前，让我们深入了解包的分离方式和原因。

***

有一种常见的误区就是`React`“引擎(engine)”存在`React`包中。这其实是不对的。

事实上，自从[React 0.14拆分包](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages)以来，react包只是暴露了用于定义组件的API。React的大多数实现都在“渲染器(renderers)”中。

`react-dom`，`react-dom / server`，`react-native`，`react-test-renderer`，`react-art`是在`renderers`中的一些例子（你也可以[建立属于你自己的](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)）。

所以，无论在什么平台，`react`包都可以正常工作。他对外暴露的所有的内容，例如: `React.Component`，`React.createElement`，`React.Children`的作用和[Hook](https://reactjs.org/docs/hooks-intro.html)，都独立于目标平台。无论运行`React DOM`，`React DOM Server`还是`React Native`，组件都将以相同的方式导入和使用它们。

相比之下，`renderer`包对外暴露了特定于平台的`api`,像`ReactDOM.render`就可以让你把`React`的层次结构挂载到`DOM`节点。每个`renderer`都提供了像这样的`API`。理想情况下，大多数组件不需要从`renderer`导入任何内容。这使它们更轻便易用。

**大多数人都认为react的"引擎(engine)"在每个`renderer`中。** 许多`renderer`都包含相同代码的副本 - 我们将其称为“[reconciler(和解)](https://github.com/facebook/react/tree/master/packages/react-reconciler)”。[构建步骤](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler)将reconciler(和解)的代码与renderer(渲染器)代码一起成为一个高度优化的捆绑包，以获得更好的性能。(复制代码对于包大小通常不是很好，但绝大多数React用户一次只需要一个渲染器，例如react-dom。)

这里要说的是，react包只允许你使用React功能，但不知道它们是如何实现的。`renderer`包（`react-dom`，`react-native`等）提供了React功能和特定于平台的逻辑的实现。其中一些代码是共享的（“reconciler”），但这是各个渲染器的实现细节。

***
现在我们知道了为什么每次有新的功能都会同时更新`react`和`react-dom`包。例如，当`React 16.3`添加了`Context API`时，`React.createContext()`在React包上对外暴露。

但是`React.createContext`实际上并没有实现上下文功能。例如，`React DOM`和`React DOM Server`之间的实现需要有所不同。所以`createContext()`返回一些普通对象：
```js
// A bit simplified
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```
当你在代码中使用`<MyContext.Provider>` 或者 `<MyContext.Consumer>`时，这就由`renderer`去决定如何处理他们。`React DOM`可能以一种方式跟踪上下文值，但`React DOM Server`可能会采用不同的方式。

**所以如果你更新`react`到16.3+，但是没有更新`react dom`, 那么你使用的这个`renderer`将是一个无法解析`Provider`和`Consumer`类型的`renderer`。** 这就是为什么旧的`react-dom`会[失败报错这些类型无效](https://stackoverflow.com/a/49677020/458193)。

同样的警告也适用于React Native。但是，与React DOM不同，React的版本更新不会迫使React Native的版本去立即更新。他有一个自己的发布周期。几周后，更新过的`renderer`会单独同步到React Native库中。**这就是为什么React Native和React DOM可用功能的时间不一致的区别**

***

好吧，现在我们知道了React包中不包含我们感兴趣的内容，而且这些实现是存在于像`react-dom`, `react-native`这样的`renderer`中。但是这些并不能回答我们的问题 -- `React.Component`中的`setState`是如何知道他要干什么的(与对应的`renderer`协同工作)。

**答案是在每个创建`renderer`的类上设置一个特殊的字段。** 这个字段就叫做`updater`。这不是你想要设置啥就设置啥，你不可以设置他，而是要在类的实例被创建后再去设置`React DOM`，`React DOM Server`或`React Native`:
```js
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```
React DOM Server [可能想要](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448)忽略状态的更新并且给你一个警告，然而React DOM和React Native会拷贝一份`reconciler`(和解)代码去[处理他](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207)

这就是为什么`this.setState`定义在`React`的包中仍然可以更新`DOM`的原因。他通过读取`this.updater`去获取，如果是`React DOM`, 就让`React DOM`调度并处理更新。

*** 
我们现在知道了类的操作方式，那么`hooks`呢？

当大多数的人看到[`Hooks`提案的`API`](https://reactjs.org/docs/hooks-intro.html)时，他们常常想知道: `useState`是怎么'知道该去做什么’?假设他会比`this.setState`更加神奇。

但是正如我们现在所看到的这个样子，对于理解`setState`的实现一直是一种错觉。他除了会将调用作用到对应的`renderer`之外不会再做其他任何的操作。实际上`useState`这个`Hook`[做了同样的事情](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56)。

**相对于`setState`的`updater`字段而言，`Hooks`使用`dispatcher`对象。** 当调用`React.useState`，`React.useEffect`或其他内置的`Hook`时，这些调用将转发到当前调度程序(`dispatcher`)。
```js
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```
并且在渲染你的组件之前，各个`renderer`会设置`dispatcher`。
```js
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```
例如，`React DOM Server`实现在[这里](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354)，`React DOM`和`React Native`共享的`reconciler`实现就在[这里](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js)。

这就是为什么像`react-dom`这样的`renderer`需要访问你调用`Hooks`的同一个React包的原因。否则，你的组件将不会知道`dispatcher`！当在同一组件树中有[多个React副本](https://github.com/facebook/react/issues/13991)时，这可能不会如期工作。但是，这会导致一些那难以理解的错误，所以`Hook`会迫使解决包重复问题。

虽然我们不鼓励你这样做，但是对于高级工具用例，你可以在此技术上重写`dispatcher`。(我对`__currentDispatcher`这名称撒了谎，这个不是真正的名字，但你可以在`React`库中找到真正的名字。)例如，React DevTools将[使用特殊的专用dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214)程序通过捕获JavaScript堆栈跟踪来反思`Hooks`树。不要自己在家里重复这个。

这也意味着`Hooks`本身并不依赖于React。如果将来有更多的库想要重用这些原始的`Hook`，理论上`dispatcher`可以移动到一个单独的包中，并作为一个普通名称的API对外暴露。在实践中，我们宁愿避免过早抽象，直到需要它的时候再说。

`updater`字段和`__currentDispatcher`对象都是一种称为依赖注入的编程原则的形式。在这些情况下，`renderer`注入一些比如`setState`这样的功能到React的包中，这样来保持组件更具有声明性。

在使用`react`的时候，你不需要去考虑他的工作原理。我们希望React用户花更多时间考虑他们的代码而不是像依赖注入这样的抽象概念。但是如果你想知道`this.setState`或`useState`如何知道该怎么做，我希望本文会对你有所帮助。
