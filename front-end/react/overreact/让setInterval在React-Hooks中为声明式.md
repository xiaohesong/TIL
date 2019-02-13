# Making setInterval Declarative with React Hooks

> 原文： [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/#closing-thoughts)

如果你玩[React Hooks](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)有一些时间，你可能会遇到一个有趣的问题：使用`setInterval`并[不会](https://stackoverflow.com/questions/53024496/state-not-updating-when-using-react-state-hook-within-setinterval)按照你的预期工作。

用Ryan Florence的[话](https://mobile.twitter.com/ryanflorence)说：

> 我听到有很多人指责hooks里的`setInterval`，就像往React的脸上扔鸡蛋一样啪啪啪打脸。

老实说，我认为这些人都有一个点，首先就是令人困惑。

但我也认为它不是Hooks的缺陷，而是[React编程模型](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/react%E4%BD%9C%E4%B8%BAui%E8%BF%90%E8%A1%8C.md)和`setInterval`之间的不匹配。钩子比类更接近react编程模型，这使得这种不匹配更加突出。

**有一种方法可以使它们很好地协同工作，但这有点不直观。**

在这篇文章中，我们将看看如何使间隔和Hooks很好地结合在一起，为什么这个解决方案有意义，以及它可以为你提供哪些新功能。

------

## 只需要给我展示代码

不用多说，这是一个每秒递增的计数器：

```diff
import React, { useState, useEffect, useRef } from 'react';

function Counter() {
  let [count, setCount] = useState(0);

+  useInterval(() => {    
+  	// Your custom logic here
+    setCount(count + 1);
+   }, 1000);
  return <h1>{count}</h1>;
}
```

(这里是一个[CodeSandbox Demo](https://codesandbox.io/s/105x531vkq))

这个`useInterval`没有内置在React的Hook里；这是我写的一个[自定义的Hook](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/custom-hook.md):

```jsx
import React, { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```

(这里有一个[CodeSandbox的demo](https://codesandbox.io/s/105x531vkq))

**我的`useInterval` Hook设置一个间隔并在卸载后清除它。** 它是与组件生命周期相关的`setInterval`和`clearInterval`的组合。

你可以随意将其粘贴到项目中或将其放在npm上。

**如果你不在乎它是如何工作的，你现在就可以停止阅读了！文章的其余部分是为那些准备深入了解React Hooks的人们准备的。**

------

## 还等什么?! 🤔

我知道你在想什么：

> 丹，这段代码没有任何意义。 “Just JavaScript”发生了什么？承认React用hooks跳过了鲨鱼！

**我也这么想，但是我改变了主意，我要改变你的想法。** 在解释这个代码为什么有意义之前，我想先展示一下它能做什么。

------

## 为什么`useInterval()`是一个更好的API

提醒你，我的`useInterval` Hook接受一个函数和一个延迟时间：

```jsx
useInterval(() => {
  // ...
}, 1000);
```

这看起来很像`setInterval`：

```jsx
setInterval(() => {
  // ...
}, 1000);
```

**那么为什么不直接使用`setInterval`呢？**

这可能一开始并不明显，但是你知道的`setInterval`和我的`useInterval` Hook之间的区别在于 **它的参数是“动态的”。** 

我将用一个具体的例子说明这一点。

------

假设我们希望间隔延迟可调：

![](https://overreacted.io/counter_delay-35e4f35a8585255b11c090aed9f72433.gif)

虽然你不必用 *输入* 来控制延迟，但动态调整它可能很有用 - 例如，当用户切换到不同的选项卡时，可以减少对某些Ajax更新的轮询。

那么你如何在类中使用`setInterval`呢？我最终得到了这个：

```jsx
class Counter extends React.Component {
  state = {
    count: 0,
    delay: 1000,
  };

  componentDidMount() {
    this.interval = setInterval(this.tick, this.state.delay);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.delay !== this.state.delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, this.state.delay);
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  
  tick = () => {
    this.setState({
      count: this.state.count + 1
    });
  }

  handleDelayChange = (e) => {
    this.setState({ delay: Number(e.target.value) });
  }

  render() {
    return (
      <>
        <h1>{this.state.count}</h1>
        <input value={this.state.delay} onChange={this.handleDelayChange} />
      </>
    );
  }
}
```

(这里是一个[CodeSandbox demo](https://codesandbox.io/s/mz20m600mp))

这不是太糟糕！

Hook版本的看起来会如何？

<font size="60">🥁</font><font size="60">🥁</font><font size="60">🥁</font>

```jsx
function Counter() {
  let [count, setCount] = useState(0);
  let [delay, setDelay] = useState(1000);

  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, delay);

  function handleDelayChange(e) {
    setDelay(Number(e.target.value));
  }

  return (
    <>
      <h1>{count}</h1>
      <input value={delay} onChange={handleDelayChange} />
    </>
  );
}
```

(这里是[CodeSandbox Demo](https://codesandbox.io/s/329jy81rlm))

是的，这就是全部。

与类版本不同，在“升级”`useInterval` hook示例时，没有复杂度差距，可以动态调整延迟：

```jsx
  // Constant delay
  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  // Adjustable delay
  useInterval(() => {
    setCount(count + 1);
  }, delay);

```

当`useInterval` Hook看到不同的延迟时间时，它会再次设置间隔。

**我可以声明一个具有特定延迟的间隔，而不是编写代码来设置和清除间隔 - 我们的`useInterval` Hook使它成为可能。**

如果我想暂时 *暂停* 间隔怎么办？我也可以用状态这样做：

```jsx
const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```

([demo](https://codesandbox.io/s/l240mp2pm7)在这里)

这让我对Hooks和React再次感到兴奋。我们可以包装现有的命令式API并创建能表达我们意图的声明性API。就像渲染一样，我们可以 **在所有时间点同时描述该过程** ，而不是小心地发出命令来操纵它。

------

我希望通过这个你在useInterval（）上出售Hook是一个更好的API - 至少当我们从一个组件做它时。

我希望通过这一点，你可以在`useInterval()` Hooks上，让API有个更好的卖相 ——至少当我们从一个组件进行此操作时。

**但是为什么使用`setInterval()`和`clearInterval()`会让Hook很讨厌呢？** 让我们回到我们的计数器示例并尝试手动实现它。

------

## 第一次尝试

我将从一个简单的示例开始，它只是呈现初始状态：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <h1>{count}</h1>;
}
```

现在我想要一个每秒递增一次的间隔。这是一个[需要清理的副作用](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md#%E9%9C%80%E8%A6%81%E6%B8%85%E7%90%86%E7%9A%84%E5%89%AF%E4%BD%9C%E7%94%A8)，所以我将使用`useEffect()`并返回一个清理函数：

```jsx
function Counter() {
  let [count, setCount] = useState(0);

  useEffect(() => {
    let id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  });

  return <h1>{count}</h1>;
}
```

(查看[CodeSandbox Demo](https://codesandbox.io/s/7wlxk1k87j))

看起来很简单？这种工作。

**但是，这段代码有一种奇怪的行为。**

默认情况下，React会在每次渲染后重新应用效果。这是有意的，有助于避免React类组件中存在的[整个类存在的错误](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md#%E8%AF%B4%E6%98%8E%E4%B8%BA%E4%BB%80%E4%B9%88%E6%95%88%E6%9E%9C%E5%9C%A8%E6%AF%8F%E4%B8%AA%E6%9B%B4%E6%96%B0%E4%B8%8A%E8%BF%90%E8%A1%8C)。

这通常很好，因为许多订阅API可以随时愉快地删除旧的和添加新的监听器。但是，`setInterval`不是其中之一。当我们运行`clearInterval`和`setInterval`时，它们的时序会发生变化。如果我们重新渲染和重新应用效果太频繁，则间隔永远不会有机会发射！

我们可以通过在 *较小* 的间隔内重新渲染我们的组件来查看错误：

```jsx
setInterval(() => {
  // Re-renders and re-applies Counter's effects
  // which in turn causes it to clearInterval()
  // and setInterval() before that interval fires.
  ReactDOM.render(<Counter />, rootElement);
}, 100);
```

(看看关于这个bug得[demo](https://codesandbox.io/s/9j86r218y4))

------

## Second Attempt

你可能知道`useEffect()`让我们可以[选择退出](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md#%E6%8F%90%E7%A4%BA%E9%80%9A%E8%BF%87%E8%B7%B3%E8%BF%87%E6%95%88%E6%9E%9C%E4%BC%98%E5%8C%96%E6%80%A7%E8%83%BD) 重新应用效果。你可以将依赖关系数组指定为第二个参数，如果该数组中的某些内容发生更改，React将重新运行该效果：

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

如果我们想只在挂载的时候运行效果，在卸载的时候移除效果，我们可以传递一个空的`[]`依赖数组。

但是，如果你不太熟悉JavaScript闭包，这是常见的错误源。我们现在要犯这个错误！ （我们也正在建立一个[lint规则](https://github.com/facebook/react/pull/14636)来尽早展示这些漏洞，但还没有准备好。）

在第一次尝试中，我们的问题是重新运行效果导致我们的超时被过早清除。我们可以尝试通过永不重新运行来修复它：

```jsx
function Counter() {
  let [count, setCount] = useState(0);

  useEffect(() => {
    let id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <h1>{count}</h1>;
}
```

但是，现在我们的计数器更新为`1`并保持在那里。 （参见[action中的错误](https://codesandbox.io/s/jj0mk6y683)。）

发生了什么！？

**问题是`useEffect`从第一次渲染中获得`count`。** 它等于`0`。我们从不重新应用效果，因此`setInterval`中的闭包始终引用第一个渲染的`count`，而`count + 1`始终为`1`.糟糕！

**我能听到你磨牙的声音。Hooks太烦人了吧？**

[另一个修复](https://codesandbox.io/s/00o9o95jyv)的方法就是使用[useReducer](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usereducer)。这种方法给你更多的灵活性。在reducer内部，你可以访问当前状态和新的props。`dispatch`函数本身永远不会改变，所以你可以从任何闭包中向它注入数据。`useReducer()`的一个限制是你不能在其中发出副作用。 （但是，你可以返回新状态 - 触发一些效果。）

**但为什么它变得如此复杂？**

------

## 阻抗不匹配

这个术语有时被滥用，[Phil Haack](https://haacked.com/archive/2004/06/15/impedance-mismatch.aspx/)解释如下：

> 有人可能会说数据库来自火星，对象来自金星。数据库不能自然地映射到对象模型。这很像是把两块磁铁的北极推到一起(笔： 互斥)。

我们的“阻抗不匹配”不在数据库和对象之间。它位于React编程模型和命令式`setInterval` API之间。

**一个react组件可能被挂载一段时间并经历许多不同的状态，但是它的渲染结果同时描述了所有这些状态。**

```jsx
// Describes every render
  return <h1>{count}</h1>
```

Hooks让我们对效果应用相同的声明方法：

```jsx
// Describes every interval state
  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```

我们不设置间隔，但指定是否设置间隔以及延迟时间。我们的Hooks让它发生。以离散术语描述连续过程。

**相比之下，`setInterval`没有及时描述过程 - 一旦设置了间隔，除了清除它之外，你不能改变它的任何内容。**

这是React模型和`setInterval` API之间的不匹配。

------

props和React组件的状态是可变的。 React将重新渲染它们并“忘记”有关前一个渲染结果的所有内容。它变得无关紧要。

`useEffect()` Hook“忘记”前一个渲染。它清除最后一个效果并设置下一个效果。下一个效果将关闭新的props和状态。这就是为什么我们的[第一次尝试](https://codesandbox.io/s/7wlxk1k87j)适用于简单的案例。

**但是`setInterval()`不会“忘记”。** 它将永远引用旧的props和状态直到你更换它 - 如果不重置时间你就做不到。

或者等等，可以吗？

------

## 用Refs来拯救

问题归结为：

- 我们使用第一次渲染的`callback1`进行`setInterval(callback1, delay)`。
- 我们有来自下一个渲染的`callback2`，它关闭了新的props和状态。
- 但是我们不能在不重置时间的情况下替换现有的间隔！

**那么如果我们根本没有替换间隔，而是引入一个指向 *最新* 间隔回调的可变`savedCallback`变量呢？**

现在我们可以看到解决方案：

- 我们 `setInterval(fn, delay)` ， `fn`调用 `savedCallback`.
- 在第一次渲染后将`savedCallback`设置为`callback1`。
- 在下一次渲染后将`savedCallback`设置为`callback2`。
- ???
- 收益

这个可变的`savedCallback`需要在重新渲染中“持久”。所以它不能是常规变量。我们想要更像实例字段的东西。

[正如我们可以从Hooks FAQ中学到的那样](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)，`useRef()`给出了我们的确切结果：

```jsx
const savedCallback = useRef();
// { current: null }
```

(你可能熟悉React中的[DOM refs](https://reactjs.org/docs/refs-and-the-dom.html)。Hooks使用 *相同的概念* 来保存任何可变值。*ref* 像一个“盒子”，你可以放 *任何东西* 。 )

`useRef()`返回一个普通对象，该对象具有在渲染之间共享的可变`current`属性。我们可以将最新的间隔回调保存到它：

```jsx
function callback() {
    // Can read fresh props, state, etc.
    setCount(count + 1);
  }

  // After every render, save the latest callback into our ref.
  useEffect(() => {
    savedCallback.current = callback;
  });
```

然后我们可以从我们的间隔内读取并调用它：

```jsx
useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
```

感谢`[]`，我们的效果永远不会重新执行，并且间隔不会被重置。但是，由于`savedCallback` 这个ref，我们总是可以读取我们在最后一次渲染后设置的回调，并从间隔中调用它。

这是一个完整的可以工作的解决方案：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const savedCallback = useRef();

  function callback() {
    setCount(count + 1);
  }

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

(查看[CodeSandbox Demo](https://codesandbox.io/s/3499qqr565))

------

## 提取一个Hook

不可否认，上面的代码可能令人迷惑。混合相反的范例令人费解。还有可能弄乱可变refs。

**我认为Hooks提供了比类更低级的原语 - 但它们的美妙之处在于它们使我们能够编写和创建更好的声明性抽象。**

理想情况下，我只想写这个：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useInterval(() => {    setCount(count + 1);  }, 1000);
  return <h1>{count}</h1>;
}
```

我将我的ref机制的主体复制并粘贴到自定义Hook中：

```jsx
function useInterval(callback) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}
```

目前，1000延迟是硬编码的。我想把它作为一个参数：

```jsx
function useInterval(callback, delay) {
```

我在设置间隔时会使用它：

```jsx
let id = setInterval(tick, delay);
```

既然`delay`可以在渲染之间改变，我需要在我的间隔效果的依赖关系中声明它：

```jsx
useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
```

等等，我们不是要避免重置间隔效果，并专门通过`[]`来避免它吗？不完全是。我们只想避免在 *回调* 发生变化时重置它。但是当`delay`改变时，我们想重新启动计时器！

让我们检查一下我们的代码是否有效：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

(在[CodeSandbox](https://overreacted.io/making-setinterval-declarative-with-react-hooks/#extracting-a-hook)中尝试)

是的！我们现在可以在任何组件中`useInterval()`，而不必过多地考虑它的实现细节。

## 加分: 暂停 Interval

假设我们希望能够通过传递`null`作为`delay`来暂停我们的间隔：

```jsx
const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```

我们如何实现这个？答案是：不设置间隔。

```jsx
useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
```

(看[CodeSandbox Demo](https://codesandbox.io/s/l240mp2pm7))

就是这样。此代码处理所有可能的转换：更改延迟、暂停或恢复间隔。`useEffect()` API要求我们花费更多的前期工作来描述设置和清理 - 但添加新案例很容易。

## 加分：有趣的Demo

这个`useInterval()` Hook非常有趣。当副作用是声明性的时，将复杂的行为编排在一起要容易得多。

**例如，我们可以`delay`一个间隔由另一个间隔控制：**

![](https://overreacted.io/counter_inception-10cfc4b38497a46980d3a13048a56e36.gif)

```jsx
function Counter() {
  const [delay, setDelay] = useState(1000);
  const [count, setCount] = useState(0);

  // Increment the counter.
  useInterval(() => {
    setCount(count + 1);
  }, delay);
  
  // Make it faster every second!
  useInterval(() => {
    if (delay > 10) {
      setDelay(delay / 2);
    }
  }, 1000);

  function handleReset() {
    setDelay(1000);
  }

  return (
    <>
      <h1>Counter: {count}</h1>
      <h4>Delay: {delay}</h4>
      <button onClick={handleReset}>
        Reset delay
      </button>
    </>
  );
}
```

(例子请看 [CodeSandbox demo](https://codesandbox.io/s/znr418qp13))

## Closing Thoughts

Hooks需要适应，尤其是在命令和声明性代码的边界。你可以像[React Spring](http://react-spring.surge.sh/hooks)一样创建强大的声明性抽象，但它们肯定会让你紧张。

对于Hooks来说，这是一个早期的阶段，而且我们还需要确定并比较一些模式。如果你习惯于遵循众所周知的“最佳实践”，不要急于采用Hooks。还有很多值得尝试和发现的东西。

我希望这篇文章可以帮助你理解与使用带有Hooks的`setInterval()`等API相关的常见陷阱，可以帮助你克服它们的模式，以及在它们之上创建更具表现力的声明性API的甜蜜成果。

