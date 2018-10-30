之前我们介绍了[使用hooks的原因](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)，在开始介绍api之前，现在我们先来整体的预览下这些`api`。
从上篇的介绍可以知道，`Hook`是向后兼容的，有`react`开发经验的你看起来会更顺畅。

是一个快节奏的概述。如果你感到困惑，可以看下上面提到的介绍里的动机：
> **详细说明** [阅读动机](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md#%E5%8A%A8%E6%9C%BA)以了解我们为何将Hooks引入React。

### State Hook
看下面的例子，他是一个计数器
```js
import { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
在这里`useState`是一个`Hook`（我们将在稍后讨论这意味着什么）。可以看到，在这个函数组件里，我们向他添加一些本地状态。`React`将在重新渲染之间保留这状态。 `useState`返回一对：当前状态值(`count`)和允许你更新状态的函数(`setCount`)。你可以从事件处理程序或其他位置调用此函数。这个函数类似于类中的`this.setState`，但是它不会将旧状态和新状态合并在一起。（我们将在[使用State Hook](https://reactjs.org/docs/hooks-state.html)中显示一个将`useState`与`this.state`进行比较的示例。）

**`useState`的唯一参数是初始状态。** 在上面的例子中，它是0，因为我们的计数器从零开始。请注意，与`this.state`不同，此处的状态不必是对象 - 尽管可以是任何你想要的。**初始状态参数仅在第一次渲染期间使用。**

##### 声明多个`state`
你可以在一个组件中多次使用`State Hook`：
```js
function ExampleWithManyStates() {
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  // ...
}
```
[数组解构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring)语法允许我们为通过调用`useState`声明的状态变量赋予不同的名称。这些名称不是`useState API`的一部分。相反，`React`假定如果多次调用`useState`，则在每次渲染期间以相同的顺序执行。我们将回到为什么这种方法有效以及何时有用。

##### 什么是`Hook`
钩子是允许从功能组件(function component)“挂钩”React状态和生命周期功能的功能。**钩子在类内部不起作用 - 它们允许你在没有类的情况下使用`React`。** (我们[不建议](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md#%E9%80%90%E6%AD%A5%E9%87%87%E7%94%A8%E7%AD%96%E7%95%A5)你在一夜之间重写现有组件，但如果你愿意，可以开始在新组件中使用`Hook`。）

`React`提供了一些像`useState`这样的内置`Hook`。你还可以创建自定义`Hook`以在不同组件之间重用有状态行为。我们先来看看内置的`Hooks`。

> **详细说明** 你可以在[使用State Hook](https://reactjs.org/docs/hooks-state.html)中了解更多信息。

### Effect Hook
你之前可能已经从`React`组件执行数据提取，订阅或手动更改`DOM`。我们将这些操作称为“副作用”（或简称为“效果”），因为它们会影响其他组件，并且在渲染过程中无法完成。

`Effect Hook`中的`useEffect`增加了在功能组件执行副作用的功能。它与`React`类中的`componentDidMount`，`componentDidUpdate`和`componentWillUnmount`具有相同的用途，但统一为单个API。(我们将在[使用`Effect Hook`](https://reactjs.org/docs/hooks-effect.html)时显示将`useEffect`与这些方法进行比较的示例。）

例如，下面的组件将在`React`更新`DOM`后设置文档标题：
```js
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 类似componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
当你调用`useEffect`时，你就在告诉`react`运行你的‘效果’函数当刷新对`DOM`的更改后(你可以认为是`render`之后)。
效果在组件内声明，因此可以访问其`props`和`state`。默认情况下，`React`在每次渲染后运行效果 - 包括第一次渲染。 （我们将更多地讨论[使用effect hook](https://reactjs.org/docs/hooks-effect.html)与类生命周期的比较。）

`Effects`还可以通过指定返回函数来清理他们。看下面的这个例子：
```js
import { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```
在这个示例中，当组件卸载时，以及在由于后续渲染而重新运行效果之前，`React`将取消订阅我们的`ChatAPI`。（如果你愿意的话，如果我们传递给`ChatAPI`的`props.friend.id`没有改变，有办法[告诉`React`跳过重新订阅](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)。）

就像使用`useState`一样， 你也可以在组件中使用多个效果：
```js
function FriendStatusWithCounter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }
  // ...
}
```
`Hooks`允许你通过哪些部分相关（例如添加和删除订阅）来组织组件中的副作用，而不是基于生命周期方法强制拆分。 

> **详细说明** 你可以在[使用Effect Hook](https://reactjs.org/docs/hooks-effect.html)中了解更多信息。

### `Hooks`的规则
钩子是`JavaScript`函数，但它们强加了两个额外的规则：
- **只能在顶层调用`Hooks`。不要在循环，条件或嵌套函数中调用`Hook`**
- **仅从`React`功能组件调用`Hooks`。** 不要从常规`JavaScript`函数中调用`Hook`。 （还有另一个有效的地方叫`Hooks` - 你自己的定制`Hooks`。我们马上就会了解它们。）

> **详细说明** 你可以在[Rules Hook](https://reactjs.org/docs/hooks-rules.html)中了解更多信息。

###  Custom Hooks
有时，我们希望在组件之间重用一些有状态逻辑的部分。传统上，这个问题有两个流行的解决方案：[高阶组件](https://reactjs.org/docs/higher-order-components.html)和[渲染道具](https://reactjs.org/docs/render-props.html)。`Custom Hooks`允许你执行这样的操作，并且无需向树中添加更多组件。在上面我们介绍了一个调用`useState`和`useEffect Hooks`的`FriendStatus`组件来订阅朋友的在线状态。假设我们还希望在另一个组件中重用此订阅逻辑。
首先，我们将这个逻辑提取到一个名为`useFriendStatus`的自定义`Hook`中：
```js
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```
它将`friendID`作为参数，并返回我们的朋友是否在线。
现在我们可以从两个组件中使用它：
```js
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```
```js
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
这些组件的状态是完全独立的。**钩子是重用有状态逻辑的一种方式，而不是状态本身。** 事实上，每次调用`Hook`都有一个完全隔离的状态 - 所以你甚至可以在一个组件中使用相同的自定义`Hook`两次。

`custom hook`更像是一种约定而非功能。如果函数的名称以`use`开头并且它调用其他`Hook`，我们说它是一个`Custom Hook`。`useSomething`命名约定是`linter`插件如何使用`Hooks`在代码中查找错误的。

> **详细说明** 你可以在[Writing Custom Hooks](https://reactjs.org/docs/hooks-custom.html)中了解更多信息。


### Other Hooks
你可能会发现一些不太常用的内置`Hook`很有用。例如，[useContext](https://reactjs.org/docs/hooks-reference.html#usecontext)允许订阅`React`上下文而不引入嵌套：
```js
function Example() {
  const locale = useContext(LocaleContext);
  const theme = useContext(ThemeContext);
  // ...
}
```
[useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer)允许使用`reducer`管理复杂组件的本地状态：
```js
function Todos() {
  const [todos, dispatch] = useReducer(todosReducer);
  // ...
}
```

> **详细说明** 你可以在 [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html).中了解更多信息。

[`hooks`系列地址](https://github.com/xiaohesong/TIL/tree/master/front-end/react/hooks),欢迎watch

[本文原文档](https://reactjs.org/docs/hooks-overview.html)
