`Effect Hook`可以使得你在函数组件中执行一些带有副作用的方法。
```js
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
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
上面这段代码是基于上个[state hook计数器的例子](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/state-hook.md)，但是现在添加了新的功能: 我们将文档标题设置为自定义消息，包括点击次数。

数据获取，设置订阅以及手动更改`React`组件中的`DOM`都是副作用的示例。无论你是否习惯于将这些操作称为“副作用”（或仅仅是“效果”），但你之前可能已经在组件中执行了这些操作。

> **提示：**   如果你熟悉`React`类生命周期方法，则可以将`useEffect Hook`视为`componentDidMount`，`componentDidUpdate`和`componentWillUnmount`的组合。

React组件中有两种常见的副作用：那些不需要清理的副作用，以及那些需要清理的副作用。让我们更详细地看一下这种区别。

## 无需清理的副作用
有时，我们希望在 **`React`更新`DOM`之后运行一些额外的代码。** 网络请求，手动改变`DOM`和日志记录是不需要清理的效果(副作用，简称'效果')的常见示例。我们这样说是因为我们可以运行它们并立即忘记它们。让我们比较一下`class`和`hooks`如何让我们表达这样的副作用。

#### 使用class的例子
在`React`类组件中，`render`方法本身不应该导致副作用。这太早了 - 我们通常希望在`React`更新`DOM`之后执行我们的效果。

这就是为什么在`React`类中，我们将副作用放入`componentDidMount`和`componentDidUpdate`中。回到我们的示例，这里是一个`React`计数器类组件，它在`React`对`DOM`进行更改后立即更新文档标题：

```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
  }

  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```
请注意**我们如何在类中复制这两个生命周期方法之间的代码。**

这是因为在许多情况下，我们希望执行相同的副作用，无论组件是刚安装还是已更新。从概念上讲，我们希望它在每次渲染之后发生 - 但是React类组件没有这样的方法(render方法应该避免副作用)。我们可以提取一个单独的方法，但我们仍然需要在两个地方调用它。

现在让我们看看我们如何使用`useEffect Hook`做同样的事情。

#### 使用Hooks的例子
```js
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
**`useEffect`有什么作用？** 通过使用这个`Hook`，你告诉`React`你的组件需要在渲染后执行某些操作。`React`将记住你传递的函数（我们将其称为“效果”），并在执行`DOM`更新后稍后调用它。在这个效果中，我们设置文档标题，但我们也可以执行数据提取或调用其他命令式`API`。

**为什么在组件内调用`useEffect`？** 在组件中使用`useEffect`让我们可以直接从效果中访问状态变量（如`count`或任何道具）。我们不需要特殊的`API`来读取它 - 它已经在函数范围内了。**`Hooks`拥抱`JavaScript`闭包**，并避免在`JavaScript`已经提供解决方案的情况下引入特定于`React`的`API`。

**每次渲染后useEffect都会运行吗？** 是的。默认情况下，它在第一次渲染之后和每次更新之后运行。 （我们稍后会讨论如何自定义它。）你可能会发现更容易认为效果发生在“渲染之后”，而不是考虑“挂载”和“更新”。`React`保证`DOM`在运行‘效果’时已更新。

### 详细说明
现在我们对这个`hook`更加的了解了，那让我们再看看下面的例子：
```js
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
}
```
我们声明了`count`状态变量，然后告诉`React`我们需要使用效果。我们将一个函数传递给`useEffect Hook`，这个函数就是效果（副作用）。在我们的效果中，我们使用`document.title`浏览器`API`设置文档标题。我们可以读取效果中的最新`count`，因为它在我们的函数范围内。当`React`渲染我们的组件时，它会记住我们使用的效果，然后在更新`DOM`后运行我们的效果。每次渲染都会发生这种情况，包括第一次渲染。

有经验的`JavaScript`开发人员可能会注意到，传递给`useEffect`的函数在每次渲染时都会有所不同。这是有意的。事实上，这就是让我们从效果中读取计数值而不用担心它没有改变的原因。每次我们重新渲染时，我们都会安排一个不同的效果，取代之前的效果。在某种程度上，这使得效果更像是渲染结果的一部分 - 每个效果“属于”特定渲染。我们将在[本页后面](https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update)更清楚地看到为什么这有用。

> **注意：**  与`componentDidMount`或`componentDidUpdate`不同，使用`useEffect`的效果不会阻止浏览器更新屏幕。这使应用感觉更具响应性。大多数效果不需要同步发生。在他们这样做的不常见情况下（例如测量布局），有一个[单独的useLayoutEffect Hook](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)，其`API`与`useEffect`相同。

## 需要清理的副作用
之前，我们研究了如何表达不需要任何清理的副作用。但是，有些效果需要清理。例如，我们可能希望设置对某些外部数据源的订阅。在这种情况下，清理是非常重要的，这样我们就不会引入内存泄漏！让我们比较一下我们如何使用类和`Hooks`来实现它。

#### 使用`class`的例子
在`React`类中，通常会在`componentDidMount`中设置订阅，并在`componentWillUnmount`中清除它。例如，假设我们有一个`ChatAPI`模块，可以让我们订阅朋友的在线状态。以下是我们如何使用类订阅和显示该状态：
```js
class FriendStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOnline: null };
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  handleStatusChange(status) {
    this.setState({
      isOnline: status.isOnline
    });
  }

  render() {
    if (this.state.isOnline === null) {
      return 'Loading...';
    }
    return this.state.isOnline ? 'Online' : 'Offline';
  }
}
```
请注意`componentDidMount`和`componentWillUnmount`如何相互作用。生命周期方法迫使我们拆分这个逻辑，即使它们中的概念代码都与相同的效果有关。

> **注意：** 眼尖的你可能会注意到这个例子还需要一个`componentDidUpdate`方法才能完全正确。我们暂时忽略这一点，但会在本页的后面部分再回过头来讨论它。

#### 使用`hooks`的例子
你可能认为我们需要单独的效果来执行清理。但是添加和删除订阅的代码是如此紧密相关，以至于`useEffect`旨在将它保持在一起。如果你的效果返回一个函数，React将在清理时运行它：
```js
import { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // Specify how to clean up after this effect:
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```
**为什么我们从效果中返回一个函数？** 这是效果的可选清理机制。每个效果都可能返回一个在它之后清理的函数。这使我们可以保持添加和删除彼此接近的订阅的逻辑。

**React什么时候清理效果？** 当组件卸载时，`React`执行清理。但是，正如我们之前所了解的那样，效果会针对每个渲染运行而不仅仅是一次。这就是`React`在下次运行效果之前还清除前一渲染效果的原因。我们将讨论[为什么这有助于避免错误](https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update)以及如何在以后[发生性能问题时选择退出此行为](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)。

> **注意** 我们不必从效果中返回命名函数。我们在这里只是为了说明才加的命名，但你可以返回箭头函数。

## 概括
我们已经了解到`useEffect`让我们在组件渲染后表达不同类型的副作用。某些效果可能需要清理，因此它们返回一个函数：
```js
useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
});
```
其他效果可能没有清理阶段，也不会返回任何内容。比如：
```js
useEffect(() => {
    document.title = `You clicked ${count} times`;
});
```
如果你觉得你对`Effect Hook`的工作方式有了很好的把握，或者你感到不知所措，那么现在就可以跳转到关于`Hooks`规则。

## 使用效果的提示
我们将继续深入了解使用`React`用户可能会产生好奇心的`useEffect`的某些方面。

#### 提示：使用多重效果分离问题
这是一个组合了前面示例中的计数器和朋友状态指示器逻辑的组件:
```js
class FriendStatusWithCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0, isOnline: null };
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  handleStatusChange(status) {
    this.setState({
      isOnline: status.isOnline
    });
  }
  // ...
```
请注意设置`document.title`的逻辑如何在`componentDidMount`和`componentDidUpdate`之间拆分。订阅逻辑也在`componentDidMount`和`componentWillUnmount`之间传播。`componentDidMount`包含两个任务的代码。

那么，`Hooks`如何解决这个问题呢？就像你可以多次使用状态挂钩一样，你也可以使用多种效果。这让我们将不相关的逻辑分成不同的效果：
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
`Hooks`允许我们根据它正在做的事情而不是生命周期方法名称来拆分代码。 `React`将按照指定的顺序应用组件使用的每个效果。

#### 说明：为什么效果在每个更新上运行
如果你习惯了类，你可能想知道为什么每次重新渲染后效果的清理阶段都会发生，而不是在卸载过程中只发生一次。让我们看一个实际的例子，看看为什么这个设计可以帮助我们创建更少bug的组件。

在上面介绍了一个示例`FriendStatus`组件，该组件显示朋友是否在线。我们的类从`this.props`读取`friend.id`，在组件挂载后订阅朋友状态，并在卸载期间取消订阅：
```js
componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
```
**但是如果`friend prop`在组件出现在屏幕上时发生了变化，会发生什么？**  我们的组件将继续显示不同朋友的在线状态。这是一个错误。卸载时我们还会导致内存泄漏或崩溃，因为取消订阅会使用错误的朋友ID。

在类组件中，我们需要添加`componentDidUpdate`来处理这种情况:
```js
componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentDidUpdate(prevProps) {
    // Unsubscribe from the previous friend.id
    ChatAPI.unsubscribeFromFriendStatus(
      prevProps.friend.id,
      this.handleStatusChange
    );
    // Subscribe to the next friend.id
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
```
忘记正确处理`componentDidUpdate`是`React`应用程序中常见的`bug`漏洞。

现在考虑使用Hooks的这个组件的版本：
```js
function FriendStatus(props) {
  // ...
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
```
它不会受到这个`bug`的影响。 （但我们也没有对它做任何改动。）

没有用于处理更新的特殊代码，因为默认情况下useEffect会处理它们。它会在应用下一个效果之前清除之前的效果。为了说明这一点，这里是一个订阅和取消订阅调用的序列，该组件可以随着时间的推移产生：
```js
// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange);     // Run first effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange); // Clean up previous effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange);     // Run next effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange); // Clean up previous effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange);     // Run next effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange); // Clean up last effect
```
此行为默认确保一致性，并防止由于缺少更新逻辑而导致类组件中常见的错误。

#### 提示：通过跳过效果优化性能
在某些情况下，在每次渲染后清理或应用效果可能会产生性能问题。在类组件中，我们可以通过在`componentDidUpdate`中编写与`prevProps`或`prevState`的额外比较来解决这个问题：
```js
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    document.title = `You clicked ${this.state.count} times`;
  }
}
```
这个要求很常见，它被内置到`useEffect Hook API`中。如果在重新渲染之间没有更改某些值，则可以告诉`React`跳过应用效果。为此，将数组作为可选的第二个参数传递给`useEffect`：
```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 当count改变的时候回再次运行这个效果
```
在上面的例子中，我们传递`[count]`作为第二个参数。这是什么意思？如果`count`为5，然后我们的组件重新渲染，`count`仍然等于5，则`React`将比较前一个渲染的[5]和下一个渲染的[5]。因为数组中的所有项都是相同的（`5 === 5`），所以`React`会跳过这个效果。这是我们的优化。

当我们使用`count`更新为6渲染时，`React`会将前一渲染中[5]数组中的项目与下一渲染中[6]数组中的项目进行比较。这次，`React`将重新运行效果，因为`5！== 6`。**如果数组中有多个项目，`React`将重新运行效果，即使其中只有一个不同。**

这也适用于具有清理阶段的效果：
```js
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
}, [props.friend.id]); // Only re-subscribe if props.friend.id changes
```
**将来，** 第二个参数可能会通过构建时转换自动添加。

> **注意** 如果使用此优化，请确保该数组包含外部作用域中随时间变化且效果使用的任何值，换句话说就是要在这个效果函数里有意义。
否则，代码将引用先前渲染中的旧值。我们还将讨论[`Hooks API`参考](https://reactjs.org/docs/hooks-reference.html)中的其他优化选项。
>
> 如果要**运行效果并仅将其清理一次（在装载和卸载时），则可以将空数组（[]）作为第二个参数传递。** 这告诉`React`你的效果不依赖于来自`props`或
`state`的任何值，所以它永远不需要重新运行。这不作为特殊情况处理 - 它直接遵循输入数组的工作方式。虽然传递[]更接近熟悉的`componentDidMount`和
`componentWillUnmount`生命周期，但我们建议不要将它作为一种习惯，因为它经常会导致错误，除非你明确你自己在做什么，
[如上所述](https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update)。 
不要忘记`React`推迟运行`useEffect`直到浏览器绘制完成后，所以做额外的工作不是问题。




