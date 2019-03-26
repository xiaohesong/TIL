# 一份完整的useEffect指南

你使用[hooks](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)写了一些组件。也许只是一个小的应用。你基本上是满意的。你对这个API游刃有余，并在此过程中学会了一些技巧。你甚至做了一些[自定义Hook](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/custom-hook.md)来提取重复逻辑（300行代码消失了！）并向你的同事展示了它。他们会说，“干得好”。

但是有时候当你使用`useEffect`的时候，有些部分并不完全合适。你有一种挥之不去的感觉，觉得自己错过了什么。它似乎与类生命周期相似......但它真的如此吗？你发现自己会问这样的问题：

- 🤔 如何使用`useEffect`替代`componentDidMount`？
- 🤔 如何在`useEffect`中正确的获取数据？`[]`是什么？
- 🤔 我是否需要将函数指定为效果(effect)依赖项?
- 🤔 为什么有时会得到一个无限重复获取循环?
- 🤔 为什么我有时会在效果(effect)中获得旧的状态或prop值？

当我刚刚开始使用Hooks时，我也对所有这些问题感到困惑。即使在写最初的文档时，我也没有对其中的一些细节有一个很好的把握。从那以后，我有一些“啊哈”(豁然开朗)的时刻，我想和你们分享。**这个的深入研究将使这些问题的答案对你来说显而易见。** 

为了*看* 到答案，我们需要后退一步。本文的目的不是给你一个方法列表去用。主要是为了帮助你真正“理解”`useEffect`。没有太多要学的东西。事实上，我们需要花费大部分时间去忘记学习的东西(*unlearning*)。

**直到我不再通过熟悉的类生命周期方法来看待`useEffect` Hook之后, 这一切才融会贯通。** 

> "忘掉你学到的东西"。— Yoda

![](https://overreacted.io/static/6203a1f1f2c771816a5ba0969baccd12/5ed8a/yoda.jpg)

------

**本文假设你对[useEffect](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md)API有点熟悉。** 

**本文的确很长。就像一本迷你小书。这只是我喜欢的版式。但是如果你很忙或者不在乎，我在下面写了一个TLDR供你快速了解。**

**如果你对深度学习不怎么喜欢，你可能想等到这些解释出现在其他地方再学习。就像React在2013年推出时一样，人们需要一段时间才能认识到一种不同的思维模式并进行教学。** 

------

## TLDR

如果你不想阅读整篇文章，这里有一个快速的TLDR。如果有些部分没有意义，可以向下滚动，直到找到相关的内容。

如果你打算阅读整篇文章，可以跳过它。我会在最后链接到它。

**🤔 问题：如何使用`useEffect`替代`componentDidMount` ？**

虽然可以用`useEffect(fn, [])`，但它并不是完全等价的。与`componentDidMount`不同，它将*捕获(capture)* props和状态。所以即使在回调中，你也会看到最初的props和状态。如果你想看到“最新”的东西，你可以把它写到ref。但是通常有一种更简单的方法来构造代码，这样你就不必这样做了。请记住，效果(effect)的心理模型与`componentDidMount`和其他生命周期不同，试图找到它们的确切对等物可能会让你感到困惑，而不是有所帮助。为了提高效率，你需要“思考效果”，他们的心智模型更接近于实现同步，而不是响应生命周期事件。

**🤔 问题：如何在`useEffect`中正确获取数据？什么是 `[]`？**

[这篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)是使用`useEffect`进行数据获取的一个很好的入门读物。一定要把它读完！它不像这个那么长。`[]`表示该效果不使用参与React数据流的任何值，因此可以安全地应用一次。当实际使用该值时，它也是一个常见的bug源。你需要学习一些策略(主要是`useReducer`和`useCallback`)，这些策略可以*消除*对依赖项的需要，而不是错误地忽略它。

**🤔 问题：我是否需要将函数指定为效果依赖项？**

建议将不需要props或状态的函数提到组件外部，并将仅由效果*内部*使用的函数拉出来使用。如果在此之后，你的效果仍然使用渲染范围中的函数(包括来自props的函数)，那么将它们封装到定义它们的`useCallback`中，并重复该过程。为什么这很重要?函数可以“看到”来自props和状态的值——因此它们参与数据流。我们的常见问题解答中有[更详细的答案](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)。

**🤔 问题：为什么有时会得到一个无限重复获取循环?**

如果在没有第二个依赖项参数的情况下在一个效果中执行数据获取，则可能会发生这种情况。没有它，效果会在每次渲染后运行 - 设置状态将再次触发效果。如果指定的这个值*始终*在依赖关系数组中改变，也可能发生无限循环。你可以通过一个一个地把它们移除来辨别是哪个。但是，删除你使用的依赖项（或盲目指定`[]`）通常是错误的修复。相反，从源头解决问题。例如，函数可能会导致这个问题，将它们放在效果中、将它们提出来或使用`useCallback`包装它们会有所帮助。为避免重新创建对象，`useMemo`可用于类似目的。

**🤔 为什么我有时会在效果中获得旧的状态或props值？**

效果总是从定义的渲染中“看到”props和状态。这[有助于防止错误](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/%E5%87%BD%E6%95%B0%E7%BB%84%E4%BB%B6%E4%B8%8E%E7%B1%BB%E6%9C%89%E4%BB%80%E4%B9%88%E4%B8%8D%E5%90%8C.md)，但在某些情况下可能会令人讨厌。对于这些情况，你可以显式地在可变ref中维护一些值(链接里的文章在最后对此进行了解释)。如果你认为你从旧的渲染中看到了一些props或状态，但并不是你期望的，那么你可能错过了一些依赖项。尝试使用[lint规则](https://github.com/facebook/react/issues/14920)来锻炼自己发现它们。过几天，它就会成为你的第二天性。请参阅常见问题解答中的[此答案](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)。

------

我希望这个TLDR很有帮助！否则，我们继续吧。

## 每个渲染都有自己的props和状态

在我们谈论效果之前，我们需要讨论渲染。

这是一个counter。仔细查看突出显示的行：

```diff
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
+     <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

这是什么意思?是否`count`以某种方式“监视”状态的更改并自动更新? 当你学习React时，这可能是一个有用的第一直觉，但它不是一个准确的[心理模型](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/react%E4%BD%9C%E4%B8%BAui%E8%BF%90%E8%A1%8C.md)。

**在此示例中，`count`只是一个数字。** 它不是神奇的“数据绑定”，“观察者”，“代理”或其他任何东西。这是一个很古老的数字:

```js
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

我们的组件第一次渲染时，我们从`useState()`得到的`count`变量是`0`。当我们调用`setCount(1)`时，React再次调用我们的组件。这一次，`count`将是`1`。依此类推：

```js
// During first render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After a click, our function is called again
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After another click, our function is called again
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**每当我们更新状态时，React都会调用我们的组件。每个渲染结果“看到”它自己的`counter`状态值，这是我们函数内的常量。**

所以这一行没有做任何特殊的数据绑定：

```jsx
<p>You clicked {count} times</p>
```

**它只是在渲染输出中嵌入一个数值。** 该数字由React提供。当我们`setCount`时，React再次使用不同的`count`值调用我们的组件。然后React更新DOM以匹配我们最新的渲染输出。

关键是，任何特定渲染中的`count`常量都不会随时间变化。再次调用的是我们的组件——每个渲染都“看到”自己的`count`值，该值在渲染之间是独立的。

(有关此过程的深入概述，请查看我的帖子[React作为UI运行时](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/react%E4%BD%9C%E4%B8%BAui%E8%BF%90%E8%A1%8C.md)。)

## 每个渲染都有自己的事件处理程序

到现在为止还挺好。那么关于事件处理程序是怎样的？

看看这个例子。它会在三秒钟后显示`count`的弹框：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

假设我执行以下步骤：

- **增加** 计数到3
- **点击** “Show alert”
- **增加** 到5，在timeout触发之前

![](https://overreacted.io/counter-46c55d5f1f749462b7a173f1e748e41e.gif)

你希望弹出框显示什么？它会显示5 - 这是弹框时的计数器状态吗？或者它会显示3 - 我点击时的状态？

------

剧透

------

来吧，[亲自尝试一下]([try it yourself!](https://codesandbox.io/s/w2wxl3yo0l))！

如果这种行为对你没有意义，想象一个更实际的例子：一个聊天应用程序，当前收件人ID在状态中，并有一个发送按钮。[这篇文章](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/%E5%87%BD%E6%95%B0%E7%BB%84%E4%BB%B6%E4%B8%8E%E7%B1%BB%E6%9C%89%E4%BB%80%E4%B9%88%E4%B8%8D%E5%90%8C.md)深入探讨了原因，但正确的答案是3。

弹框(alert)将在我单击按钮时“捕获”状态。

(*有一些方法可以实现其他行为，但我现在将关注默认情况。当我们建立一个心理模型时，重要的是我们要区分“最小阻力路径”和选择进入逃生舱。*)

------

但它是如何工作的？

我们已经讨论过`count`值对于我们函数的每个特定调用都是常量。值得强调的是这一点 — **我们的函数被调用了很多次(每次渲染一次)，但是每次调用的`count`值都是常量，并被设置为一个特定的值(该渲染的状态)。** 

这不是React所特有的 - 常规函数以类似的方式工作：

```jsx
function sayHi(person) {
  const name = person.name;  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = {name: 'Dan'};
sayHi(someone);

someone = {name: 'Yuzhi'};
sayHi(someone);

someone = {name: 'Dominic'};
sayHi(someone);
```

在[此示例](https://codesandbox.io/s/mm6ww11lk8)中，外部`someone`变量被重新分配多次。(就像React中的某个地方一样，*当前* 的组件状态可以改变。) **但是，在`sayHi`中，有一个本地`name`常量与特定调用中的`person`相关联。** 那个常量是本地的，所以它在调用之间是独立的！因此，当超时触发时，每个弹框都会“记住”他自己的`name`。

这解释了我们的事件处理程序如何在单击时捕获`count`。如果我们应用相同的替换原则，每个渲染“看到”它自己的`count`：

```diff
// During first render
function Counter() {
+ const count = 0; // Returned by useState()  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// After a click, our function is called again
function Counter() {
+ const count = 1; // Returned by useState()  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// After another click, our function is called again
function Counter() {
+ const count = 2; // Returned by useState()  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

如此有效，每个渲染都返回自己“版本”的`handleAlertClick`。每个版本都“记住”自己的`count`：

```diff
// During first render
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
+     alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 0 inside
  // ...
}

// After a click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
+     alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 1 inside
  // ...
}

// After another click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
+     alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 2 inside
  // ...
}
```

这就是为什么[在这个演示](https://codesandbox.io/s/w2wxl3yo0l)中 事件处理程序“属于”特定渲染，当你点击时，它会继续使用 *该* 渲染中的`counter`状态。

**在任何特定渲染中，props和状态永远保持不变。** 但是，如果在渲染之间隔离了props和状态，那么使用它们的任何值(包括事件处理程序)都是独立的。它们也“属于”特定的渲染。因此，即使事件处理程序中的异步函数也会“看到”相同的`count`值。

*旁注：我将具体`count`值内联到上面的`handleAlertClick`函数中。这种心理替代是安全的，因为`count`不可能在特定渲染中改变。它被声明为`const`并且是一个数字。以同样的方式考虑其他值(比如对象)是安全的，但前提是我们同意避免状态的变化。使用新创建的对象调用`setSomething(newObj)`而不是对其进行修改，因为属于以前渲染的状态是完整的。*

## 每个渲染都有自己的效果(effects)

这应该是一个关于效果的论述，但我们还没有谈到效果!我们现在要纠正这个问题。事实证明，效果并没有什么不同。

让我们回到[文档中](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md)的一个例子：

```jsx
function Counter() {
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

**这里有一个问题：效果如何读取最新的`count`状态？** 

也许，有某种“数据绑定”或“观查”使得`count`更新在效果函数中生效？也许`count`是一个可变变量，React在我们的组件中设置，以便我们的效果总能看到最新值？

不。

我们已经知道`count`在特定组件渲染中是恒定(常量)的。事件处理程序从渲染中“查看”它们“所属”的`count`状态，因为`count`是它们作用域中的一个变量。效果也是如此！

**`count`变量不是以某种方式在“不变”效果中发生变化。*效果函数本身* 在每个渲染上都是不同的。**

每个版本从其“所属”的渲染中“看到”`count`值：

```jsx
// During first render
function Counter() {
  // ...
  useEffect(
    // 主要是看这里
    // Effect function from first render
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// After a click, our function is called again
function Counter() {
  // ...
  useEffect(
    // 主要是看这里
    // Effect function from second render
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// After another click, our function is called again
function Counter() {
  // ...
  useEffect(
    // 主要是看这里
    // Effect function from third render
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React会记住你提供的效果函数，刷新对DOM的更改并让浏览器绘制到屏幕后运行该函数。

因此，即使我们在这里谈到单一概念的*效果*(示例中的更新文档标题(`document.title=''`))，它也会在每个渲染上用*不同的函数* 表示 — 并且每个效果函数从它所属的特定渲染中“看到”props和状态。

**从概念上讲，你可以想象效果是 *渲染结果的一部分* 。** 

严格地说，它们不是(为了[允许Hook组合](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/Why-Do-React-Hooks-Rely-on-Call-Order.md)而没有笨拙的语法或运行时开销)。但是在我们构建的心理模型中，效果函数属于特定的渲染，就像事件处理程序一样。

------

为了确保我们有一个扎实的理解，让我们回顾一下我们的第一次渲染：

- **React:** 给我一个当状态为`0`时UI。
- **你的组件:** 
  - 这是渲染结果：`<p>You clicked 0 times</p>`。
  - 还记得在完成后运行此效果：`() => { document.title = 'You clicked 0 times' }`。
- **React:** 当然。更新UI。嘿浏览器，我正在向DOM添加一些东西。
- **Browser:** 很酷，我把它画到了屏幕上。
- **React:** 好的，现在我要运行你给我的效果了。
  - 运行 `() => { document.title = 'You clicked 0 times' }`。

------

现在让我们回顾点击后发生的事情：

- **你的组件:** 嘿React，把我的状态设置为`1`。
- **React:** 给我状态为`1`时的UI。
- **你的组件:** 
  - 这是渲染结果：`<p>You clicked 1 times</p>`。
  - 还记得在完成后运行此效果：`() => { document.title = 'You clicked 1 times' }`。
- **React:** 当然。更新UI。嘿浏览器，我改变了DOM。
- **Browser:** 很酷，我把你的更改画到了屏幕上。
- **React:** 好的，现在我将运行属于我刚刚做的渲染的效果。
  - 运行 `() => { document.title = 'You clicked 1 times' }`。

## 每个渲染都有它自己......一切

**我们现在知道在每次渲染之后运行的效果在概念上是组件输出的一部分，并且“看到”来自该特定渲染的props和状态。** 

我们来试试吧。考虑以下代码：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // 手动高亮
  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
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

如果我稍微点击几次，那么log会是什么样子？

------

剧透

------

你可能认为这是一个问题，最终结果是不直观的。不是这样的！我们将看到一系列日志 - 每个日志属于特定的渲染，因此具有自己的`count`值。你可以[自己试试](https://codesandbox.io/s/lyx20m1ol)：

![](https://overreacted.io/timeout_counter-a5727d333c270e05942f508707265378.gif)

你可能会想：“当然，这就是它的工作原理！不然它还能怎样工作？“

好吧，这不是`this.state`在类上的运作方式。很容易错误地认为这个[类的实现](https://codesandbox.io/s/kkymzwjqz3)是等价的:

```jsx
componentDidUpdate() {
  setTimeout(() => {
    console.log(`You clicked ${this.state.count} times`);
  }, 3000);
}
```

但是，`this.state.count`始终指向最新计数而不是属于特定渲染的计数。所以你会看到每次记录`5`：

![](https://overreacted.io/timeout_counter_class-264b329edc111a1973003bdf2bcacd65.gif)

我认为具有讽刺意味的是，Hook严重依赖于JavaScript闭包，然而正是类实现遭受了[典型的超时错误值的混淆](https://wsvincent.com/javascript-closure-settimeout-for-loop/)，而这种混淆通常与闭包相关。这是因为本例中混淆的实际来源是突变（react使类中的`this.state`发生突变，以指向最新状态），而不是闭包本身。

**当你相关的值永远不变时，闭包是非常棒的。这使得它们易于思考，因为你实质上是指向常量。** 正如我们所讨论的，props和状态永远不会在特定渲染中发生变化。顺便说一句，我们可以通过[使用闭包](https://codesandbox.io/s/w7vjo07055)修复类版本中的问题。

## 逆势而行(逆流而上)(Swimming Against the Tide)

在这一点上，我们明确地称之为：组件渲染中的 **每个** 函数(包括事件处理程序、效果、超时或其中的API调用)都会捕获定义它的渲染调用的props和状态。

所以这两个例子是等价的：

```diff
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
+     console.log(props.counter);    }, 1000);
  });
  // ...
}
```

```diff
function Example(props) {
+ const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
+     console.log(counter);    }, 1000);
  });
  // ...
}
```

**无论你是否在组件内部从props或状态中"提前"读取都无关紧要。** 他们不会改变！在单个渲染的作用域内，props和状态保持不变。 （解构props使这更加明显。）

当然，有时你希望在效果中定义的某些回调中读取最新而非捕获的值。最简单的方法是使用refs，如[本文](#1)最后一节所述。

注意，当你想从 *过去* 渲染的函数中读取 *未来* 的props或状态时，你是在逆潮流而上。这并没有错(在某些情况下是必要的)，但打破这种模式可能看起来不那么“干净”。这是一个有意的结果，因为它有助于突出哪些代码是脆弱的，并且依赖于时间而改变。在类上，发生这种情况时不太明显。

这是我们的[计数器示例的一个版本](https://codesandbox.io/s/rm7z22qnlp)，它复制了类的行为：

```jsx
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Set the mutable latest value
    latestCount.current = count;
    setTimeout(() => {
      // Read the mutable latest value
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![](https://overreacted.io/timeout_counter_refs-78f7948263dd13b023498b23cb99f4fc.gif)

在React中改变一些东西似乎很古怪。但是，这正是React本身在类中重新分配`this.state`的方式。与捕获的props和state不同，你无法保证读取`latestCount.current`会在任何特定回调中为你提供相同的值。根据定义，你可以随时改变它。这就是为什么它不是默认值，你必须选择它。

## 那么清理呢?

正如[文档所解释](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md#%E9%9C%80%E8%A6%81%E6%B8%85%E7%90%86%E7%9A%84%E5%89%AF%E4%BD%9C%E7%94%A8)的那样，某些effect可能会有一个清理阶段。本质上，它的目的是“撤消”订阅等情况的效果。

考虑以下代码：

```jsx
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
  };
});
```

假设`props`在第一个渲染时为`{id：10}`，在第二个渲染上为`{id：20}`。你 *可能* 认为会发生这样的事情:

- React清除`{id：10}`的效果。
- React为`{id：20}`渲染UI。
- React运行`{id：20}`的效果。

(情况并非如此。)

使用这个心理模型，你可能认为清理“看到”了旧的props，因为它在我们重新渲染之前运行，然后新的效果“看到”了新props，因为它在重新渲染之后运行。这是直接从类生命周期中提取的心智模型，**这里并不准确** 。让我们看看这是为什么。

React仅在[让浏览器绘制](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f)后运行效果。这使你的应用程序更快，因为大多数效果不需要阻止屏幕更新。效果清理也会延迟。**使用新props重新渲染*后*，前一个效果会被清除：** 

- **React为`{id：20}`渲染UI。** 
- 浏览器绘制画面。我们在屏幕上看到了`{id：20}`的用户界面。
- **React清除`{id：10}`的效果。** 
- React运行`{id：20}`的效果。

你可能想知道：但是如果在props变为`{id：20}`之后运行，那么前一效果的清理如何仍能“看到”旧的`{id：10}` props？

我们以前来过这里…🤔

![](https://overreacted.io/deja_vu-5fe238cf03a21dfa32af624124fcdcff.gif)

引用上一节：

> 组件渲染中的 **每个** 函数(包括事件处理程序、效果、超时或其中的API调用)都会捕获定义它的渲染调用的props和状态。

现在答案很明确！不管这意味着什么，效果清理不会读取“最新”的props。它读取属于它定义的渲染的props:

```jsx
// First render, props are {id: 10}
function Example() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // Cleanup for effect from first render
      // 嘿，你的关注点放在这里(手动高亮)
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Next render, props are {id: 20}
function Example() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // Cleanup for effect from second render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

王国将会升起并化为灰烬，太阳将会褪去它的外层成为一颗白矮星，最后的文明将会终结。但是除了`{id：10}`之外，没有任何东西可以使第一个渲染效果的清理“看到”props。

这就是让React在绘制后立即处理效果的原因——默认情况下让你的应用程序运行得更快。如果我们的代码需要它们，旧的props仍然存在。

## 同步，而不是生命周期

关于React，我最喜欢的一点是它统一了对初始渲染结果和更新的描述。这会使你的程序[降低熵](https://overreacted.io/the-bug-o-notation/)。

假设我的组件是这样的：

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

如果我渲染`<Greeting name ="Dan"/>`并且后面加上`<Greeting name ="Yuzhi"/>`，或者我只渲染`<Greeting name ="Yuzhi"/>`，都无关紧要。最后，我们将在两种情况下看到“Hello, Yuzhi”。

人们常说:“重要的是过程，而不是目的地。”而对于React，情况正好相反。**重要的是目的地，而不是旅程。** 这就是jQuery代码中的`$.addClass`和`$.removeClass`调用之间(我们的“旅程”)的区别，并指定了在React代码中CSS类*应该是* 什么(我们的“目的地”)。

**React根据我们当前的props和状态同步DOM。** 渲染时“mount”或“update”之间没有区别。

你应该以类似的方式思考效果。**`useEffect`允许你根据我们的props和状态*同步*React树之外的东西。** 

```jsx
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

这与熟悉的 *mount*/*update*/*unmount*  心理模型略有不同。将其内在化是非常重要的。**如果你试图编写一个根据组件是否第一次渲染而表现不同的效果，那么你就是在逆流而上!** 如果我们的结果取决于“旅程”而不是“目的地”，我们就无法同步。

无论我们是使用props A，B和C渲染，还是使用C立即渲染，都无关紧要。虽然可能会有一些暂时的差异(例如，在获取数据时)，但最终的结果应该是相同的。

当然，在每个渲染上运行所有效果可能并不是很高效。(在某些情况下，这会导致无限循环。)

那我们怎么解决这个问题呢？

## 教React去Diff你的Effects

我们已经从DOM本身吸取了教训。React只更新DOM中实际发生更改的部分，而不是在每次重新渲染时都修改它。

当你更新

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

到

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React看到两个对象：

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

它检查它们的每个props，并确定子元素已经更改，需要DOM更新，但`className`没有。所以它可以这样做:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// No need to touch domNode.className
```

**我们可以用效果做这样的事吗？如果不需要应用效果，最好避免重新运行它们。**

例如，由于状态更改，我们的组件可能会重新渲染：

```jsx
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      {/* 你的关注点在这里 */}
      {/* 原文此处是count, 实则为counter */}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

但是我们的效果不使用`counter`状态。**我们的效果将`document.title`与`name` prop同步，但`name` prop是相同的。** 在每次计数器更改时重新分配`document.title`似乎并不理想。

好吧，那么React会不会只是...差异效果(diff effects)?

```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// Can React see these functions do the same thing?
```

并不是的。React无法在不调用该函数的情况下猜测该函数的功能。(源代码实际上并不包含特定的值，它只是在`name` prop上结束。)

这就是为什么如果你想避免不必要地重新运行效果，你可以为`useEffect`提供一个依赖数组（也称为“deps”）参数：

```jsx
seEffect(() => {
  document.title = 'Hello, ' + name;
}, [name]); // Our deps
```

**就像我们告诉React一样：“嘿，我知道你看不到这个函数*内部*，但我保证它只使用`name`而不是渲染作用域中的任何其他内容。”**  

如果这个效果在当前和上次之间的每个值都相同，则无法同步，因此React可以跳过效果：

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];
```

如果甚至依赖项数组中的一个值在渲染之间是不同的，我们知道运行效果不能被跳过。同步所有的东西！

## 不要因为依赖而撒谎

在依赖关系上撒谎会带来不好的后果。从直觉上看, 这是有道理的, 但我看到几乎每个人都尝试使用`useEffect`与类中的心理模型试图欺骗规则。(一开始我也这么做了!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay? Not always -- and there's a better way to write it.

  // ...
}
```

([Hook FAQ](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)解释了应该怎么做。我们将在[下面](https://overreacted.io/a-complete-guide-to-useeffect/#moving-functions-inside-effects)回到这个例子。)

“但我只想在mount时运行它！”，你会这么说。现在，请记住：如果你指定deps，**组件内部的效果所使用的*所有* 值都 *必须* 在那里。** 包括props，状态，函数 - 组件中的任何内容。

有时，当你这样做时，它会导致问题。例如，你可能会看到一个无限重取循环，或者一个socket被重新创建得太频繁。 **该问题的解决方案不是删除依赖项。** 我们很快就会看到这些解决方案。

但在我们跳到解决方案之前，让我们更好地理解问题。

## 当依赖关系欺骗时会发生什么

如果deps(依赖项)包含了效果使用的所有值，React知道什么时候重新运行它:

```jsx
useEffect(() => {
  document.title = 'Hello, ' + name;
}, [name]); // 关注这个依赖项
```

![](https://overreacted.io/deps-compare-correct-fae247cd068eedbd4b62ba50592d2b3d.gif)

(*依赖关系是不同的，所以我们重新运行效果。*)

但是，如果我们为此效果指定了`[]`，则新效果函数将不会运行：

```jsx
useEffect(() => {
  document.title = 'Hello, ' + name;
}, []); // Wrong: name is missing in deps

```

![](https://overreacted.io/deps-compare-wrong-25f75db3f9f57ffe1426912093577445.gif)

(*依赖项是相同的，所以我们跳过这个效果。*)

在这种情况下，问题可能显而易见。但是，在其他情况下，当类解决方案从你的记忆中“跳出”时，这种直觉可能会欺骗你。

例如，假设我们正在编写一个每秒递增一次的计数器。对于类，我们的直觉是：“设置间隔(interval)一次，销毁间隔一次”。这是一个我们如何做的[例子](https://codesandbox.io/s/n5mjzjy9kl)。当我们在心理上将此代码翻译为`useEffect`时，我们本能地将`[]`添加到deps中。“我想让它跑一次”，对吗？

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); //你的关注点在这里

  return <h1>{count}</h1>;
}
```

但是，此示例[仅递增一次](https://codesandbox.io/s/91n5z8jo7r)。哎呀。

如果你的心理模型是“依赖关系让我指定何时我想重新触发效果”，这个例子可能会给你一个存在的危机。你想要触发它一次，因为它是一个间隔 - 所以它为什么会引起问题？

但是，如果你知道依赖项是我们的提示，用于对效果在渲染范围中使用的所有内容作出反应，那么这样做是有意义的。它使用`count`，但我们使用`[]`撒谎说它没有依赖。它会坑道我们，这只是时间问题!

在第一次渲染中，`count`为`0`。因此，第一个渲染效果中的`setCount(count + 1)`表示`setCount(0 + 1)`。因为`[]` deps我们永远不会重新运行效果，所以它会每秒调用`setCount(0 + 1)`：

```diff
// First render, state is 0
function Counter() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      const id = setInterval(() => {
+       setCount(0 + 1); // Always setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
+   [] // Never re-runs
  );
  // ...
}

// Every next render, state is 1
function Counter() {
  // ...
  useEffect(
+   // This effect is always ignored because
+   // we lied to React about empty deps.
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}

```

我们撒谎说我们的效果不依赖于组件内部的值，而实际上它依赖于组件内部的值!

我们的效果使用`count` - 组件内部的值（但在效果之外）：

```diff
+const count = // ...

useEffect(() => {
  const id = setInterval(() => {
+   setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

因此，将`[]`指定为依赖项将产生一个错误。React将比较依赖项，并跳过更新此效果：

![](https://overreacted.io/interval-wrong-29e53bd0c9b7d2ac70d3cd924886b030.gif)

(*依赖性是相同的，所以我们跳过这个效果。*)

像这样的问题很难想到。因此，我鼓励你将其作为一项硬性规则，始终诚实地遵循效果依赖关系，并将其全部(效果所用到的)指定。(如果你想在团队中强制执行此操作，我们会提供一个[lint规则]([lint rule](https://github.com/facebook/react/issues/14920))。)

## 诚实对待依赖关系的两种方法

有两种策略可以诚实地对待依赖关系。通常应该从第一个开始，然后根据需要应用第二个。

**第一种策略是修复依赖关系数组，以包含在效果中使用的组件内的*所有* 值。** 我们将`count`作为dep(依赖)包括：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

```

这使依赖项数组正确。它可能不太*理想*，但这是我们需要解决的第一个问题。现在改变`count`将重新运行效果，每一个下一个间隔引用`count`从其渲染在`setCount(count + 1)`:

```diff
// First render, state is 0
function Counter() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      const id = setInterval(() => {
+       setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
+   [0] // [count]
  );
  // ...
}

// Second render, state is 1
function Counter() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      const id = setInterval(() => {
+       setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
+   [1] // [count]
  );
  // ...
}
```

这样可以[解决问题](https://codesandbox.io/s/0x0mnlyq8l)，但只要`count`发生变化，我们的间隔就会被清除并再次设置。这可能是不受欢迎的：

![](https://overreacted.io/interval-rightish-5734271ddfa94d2d65ac6160515e0069.gif)

(*依赖关系是不同的，所以我们重新运行效果。*)

------

**第二种策略是更改我们的effect代码，这样它就不需要比我们想要的值频繁的更改。** 我们不想在依赖关系上撒谎——我们只是想改变我们的效果，使依赖关系*更少*。

让我们看一些删除依赖项的常用技巧。

## 使效果自给自足

我们希望摆脱效果中的`count`依赖性。

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

要做到这一点，我们需要问自己：**我们使用`count`用来做什么？** 好像我们只将它用于`setCount`调用。在这种情况下，我们实际上在作用域里根本不需要`count`。当我们想要根据以前的状态更新状态时，我们可以使用`setState`的[函数更新形式](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#%E4%BD%9C%E4%B8%BA%E5%8A%9F%E8%83%BD%E6%9B%B4%E6%96%B0)：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    // 你的关注点在这里
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

我喜欢将这些情况视为“错误(假的)依赖”。是的，`count`是一个必要的依赖项，因为我们在效果中编写了`setCount(count + 1)`。但是，我们真正的需要`count`只是去将其转换为`count + 1`并将其“发回”给React。但是React*已经知道了* 当前的`count`。**我们需要告诉React的是增加这个状态——不管它现在是什么状态。** 

这正是`setCount(c => c + 1)`的作用。你可以将其看作是向React“发送一条指令”来对状态应该如何变化做出反应。这种“更新形式”在其他情况下也有帮助，例如[批量多次更新](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/react%E4%BD%9C%E4%B8%BAui%E8%BF%90%E8%A1%8C.md#batching)时。

**请注意，我们实际上已经*完成*了删除依赖项的工作。我们没有欺骗他。我们的效果不再从渲染作用域读取`counter`值：** 

![](https://overreacted.io/interval-right-f128ad20c28317ed27a3cb68197fc906.gif)

(*依赖项是相同的，所以我们跳过这个效果。*)

你可以在[这里](https://codesandbox.io/s/q3181xz1pj)试试。

即使此效果仅运行一次，属于第一个渲染的间隔回调完全能够在每次间隔触发时发送`c => c + 1`更新指令。它不再需要知道当前的计数器状态。 React已经知道了。

## 功能更新和Google文档

还记得我们如何谈论同步是效果的心理模型吗？同步的一个有趣方面是，你经常希望保持系统之间的“消息”与其状态无关。例如，在Google Docs中编辑文档实际上并不会将*整个*页面发送到服务器。那将是非常低效的。相反，它会发送用户尝试执行操作的表示。

虽然我们的用例是不同的，但是类似的哲学适用于效果。**它只有助于将最少的必要信息从效果内部发送到组件。** 像`setCount(c => c + 1)`这样的更新形式传递的信息严格少于`setCount(count + 1)`，因为它没有被当前计数(count)“污染”。它只表示动作(“递增”)。在React中思考涉及到[找到最小的状态](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state)。这是相同的原则，但对于更新。

编码意图(而不是结果)类似于谷歌文档[解决](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682)协作编辑的方式。虽然这是延伸的类比，但功能更新在React中也扮演着类似的角色。它们确保来自多个源的更新(事件处理程序、效果订阅等)能够以可预测的方式正确地应用于批处理中。

**但是，即使是`setCount(c => c + 1)`也不是那么好。** 它看起来有点奇怪，它能做的非常有限。例如，如果我们有两个状态变量，它们的值相互依赖，或者如果我们需要根据prop来计算下一个状态，这对我们没有帮助。幸运的是，`setCount(c => c + 1)`有一个更强大的姐妹模式。它的名称是`useReducer`。

## 将更新与操作解耦

让我们修改前面的例子，让它有两个状态变量：`count`和`step`。我们的间隔将使`count`增加`step`输入的值：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

(这里是一个[例子](https://codesandbox.io/s/zxn70rnkx))

请注意，**我们没有欺骗。** 由于我开始在效果中使用step，我将它添加到依赖项中。这就是代码正确运行的原因。

此示例中的当前行为是更改`step`重新启动间隔 - 因为它是其中一个依赖项。在许多情况下，这正是你想要的！拆除一个效果并重新设置它没有错，除非我们有很好的理由，否则我们不应该避免这样做。

但是，假设我们希望间隔时钟不会在`step`更改时重置。我们如何从效果中删除`step`依赖？

**设置状态变量时，取决于另一个状态变量的当前值，你可能希望尝试使用`useReducer`替换它们。** 

当你发现自己正在编写`setSomething(something =>…)`时，是时候考虑使用reducer了。reducer允许你 **将表示组件中发生的“操作”与状态更新的响应方式解耦。**

在我们的效果中，让我们将`step`依赖关系替换为`dispatch`依赖关系:

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

(查看这里[例子](https://codesandbox.io/s/xzr480k0np))

你可能会问我：“这怎么会更好？”答案是 **React保证`dispatch`函数在整个组件生命周期内保持不变。所以上面的例子不需要重新订阅间隔。** 

我们解决了问题！

(*你可以省略deps中的`dispatch`，`setState`和`useRef`容器值，因为React保证它们是静态的。但指定它们也没有坏处。*)

它不是在效果中读取状态，而是发送一个动作来编码 *发生了什么* 的信息。这允许我们的效果保持与`step`状态解耦。我们的效果并不关心我们如何更新状态，它只是告诉我们*发生了什么*。reducer集中了更新逻辑：

```js
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

(如果你之前错过了，那么这是一个[演示](https://codesandbox.io/s/xzr480k0np))

## 为什么useReducer是Hooks的欺骗模式

我们已经看到当效果需要根据以前的状态或另一个状态变量设置状态时如何删除依赖关系。**但是如果我们需要props来计算下一个状态呢？** 例如，我们的API可能是`<Counter step = {1} />`。当然，在这种情况下，我们不能避免将`props.step`指定为依赖项？

事实上，我们可以！我们可以将*reducer本身* 放在我们的组件中来读取props： 

```jsx
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      // 你的关注点应该在这里
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

这个模式禁用了一些优化，所以尽量不要在任何地方都使用它，但是如果需要，你可以完全从reducer访问props。(这里是一个[例子](https://codesandbox.io/s/7ypm405o8q))

**即使在这种情况下，重新渲染之间仍然保证`dispatch`标识是稳定的。** 因此，如果需要，你可以从效果deps中省略它。它不会导致重新运行效果。

你可能想知道：这怎么可能有效呢？当从属于另一个渲染效果的内部调用时，reducer如何“知道”props?答案是，当你`dispatch`时，React会记住该操作 - 但它会在下一次渲染期间调用你的reducer。在那时，新的props将在作用域内，你不会在一个效果内。

**这就是为什么我喜欢将`useReducer`视为Hooks的“作弊(欺骗)模式”。它让我将更新逻辑从描述所发生的事情中解耦出来。反过来，这有助于我从我的效果中删除不必要的依赖项，并避免更频繁地重新运行它们。**  

## 移动函数到效果内

一个常见的错误是认为函数不应该是依赖关系。例如，这似乎可以工作：

```jsx
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay?
  // ...
```

(*[这个例子](https://codesandbox.io/s/8j4ykjyv0)改编自Robin Wieruch的一篇精彩文章 - [看看吧](https://www.robinwieruch.de/react-hooks-fetch-data/)！*)

需要明确的是，此代码确实有效。**但是简单地忽略局部函数的问题是，当组件增长时，很难判断我们是否在处理所有的情况!** 

想象一下，我们的代码是这样拆分的，每个函数都要大(很长，不易维护)五倍：

```jsx
function SearchResults() {
  // Imagine this function is long
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // Imagine this function is also long
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

现在让我们说我们稍后在其中一个函数中使用一些状态或prop：

```diff
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Imagine this function is also long
  function getFetchUrl() {
+   return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Imagine this function is also long
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

如果我们忘记更新调用这些函数的任何效果的deps(可能通过其他函数！)，我们的效果将无法同步来自props和state的更改。这听起来不太好。

幸运的是，这个问题有一个简单的解决方案。**如果你只在效果中使用某些函数，请将它们直接移动到该效果中：** 

```jsx
function SearchResults() {
  // ...
  useEffect(() => {
    // 你的关注点在这里
    // We moved these functions inside!
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }
    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Deps are OK
  // ...
}
```

([这里是一个示例](https://codesandbox.io/s/04kp3jwwql))

那么有什么好处呢？我们不再需要考虑“传递依赖”。我们的依赖数组不再欺骗你: **我们真的没有在我们的效果中使用来自组件外部作用域的任何东西。** 

如果我们稍后修改`getFetchUrl`以使用`query`状态，我们更有可能注意到我们在效果*中*编辑它 - 因此，我们需要向效果依赖项添加`query`：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Deps are OK

  // ...
}

```

(这里是一个[例子](https://codesandbox.io/s/pwm32zx7z7))

通过添加此依赖项，我们不仅仅是“安抚React”。当`query`发生更改时，重新获取数据是有意义的。**`useEffect`的设计迫使你注意到我们的数据流中的变化，并选择我们的效果应该如何同步它——而不是忽略它，直到我们的产品用户遇到bug。** 

感谢`eslint-plugin-react-hooks`插件中的`exhaustive-deps` lint规则，你可以[在编辑器中输入时分析效果](https://github.com/facebook/react/issues/14920)，并获得有关缺少哪些依赖项的建议。换句话说，计算机可以告诉你组件未正确处理哪些数据流更改。

![](https://overreacted.io/exhaustive-deps-04a90dcbacb01105d634964880ebed19.gif)

很甜蜜。

## 但我不能把这个函数放在一个效果中

有时你可能不想把函数移到效果*中*。例如，同一组件中的多个效果可能会调用相同的函数，并且你不希望复制和粘贴其逻辑。或许这是一个prop。

你应该在效果依赖中跳过这样的函数吗？我想不是。同样，**效果不应该在依赖关系上撒谎。** 通常有更好的解决方案。一个常见的误解是“一个函数永远不会改变”。但正如我们在整篇文章中所学到的，这不可能是事实。实际上，组件内定义的函数会在每个渲染中发生变化！

**这本身就是一个问题。** 假设两个效果调用`getFetchUrl`：

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  // ...
}
```

在这种情况下，你可能不希望在任何一个效果中移动`getFetchUrl`，因为这样你就无法共享逻辑。

另一方面，如果你对效果依赖性“诚实”，则可能会遇到问题。由于我们的效果都依赖于`getFetchUrl`（**每个渲染都不同** ），我们的依赖数组是无用的：

```jsx
function SearchResults() {
  // 🔴 Re-triggers all effects on every render
  // 你的关注点在这里
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

  // ...
}
```

一个诱人的解决方案是直接跳过deps列表中的`getFetchUrl`函数。但是，我不认为这是一个很好的解决方案。这使我们很难注意到何时向数据流添加*需要*由效果处理的更改。这会导致我们之前看到的“永不更新间隔(interval)”等错误。

相反，还有另外两种更简单的解决方案。

**首先，如果函数不使用组件范围中的任何内容，你可以将其提升到组件外部，然后在效果中自由使用它：** 

```jsx
// ✅ Not affected by the data flow
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  // ...
}
```

无需在deps中指定它，因为它不在渲染范围内，并且不受数据流的影响。它不能偶然地依赖于props或状态。

或者，你可以将其包装到[`useCallback` Hook](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usecallback)中：

```jsx
function SearchResults() {
  // ✅ Preserves identity when its own deps are the same
  // 你的关注点在这里
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

`useCallback`实际上就像添加另一层依赖性检查。它正在另一端解决问题 — **我们只在必要时更改函数本身，而不是避免函数依赖。** 

让我们看看为什么这种方法很有用。以前，我们的示例显示了两个搜索结果（针对`'react'`和`'redux'`搜索查询）。但是，假设我们要添加一个输入，以便可以搜索任意`query`。因此，`getFetchUrl`现在不会将`query`作为参数，而是从本地状态读取它。

我们会立即看到它缺少`query`依赖项：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // No query argument
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 Missing dep: query
  // ...
}
```

如果我修复了`useCallback` deps以包含`query`，那么每当`query`更改时，deps中的`getFetchUrl`的任何效果都会重新运行：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

感谢`useCallback`，如果`query`相同，则`getFetchUrl`也保持不变，并且我们的效果不会重新运行。但是如果`query`更改，`getFetchUrl`也会更改，我们将重新获取数据。这很像在Excel电子表格中更改某些单元格时，使用它的其他单元格会自动重新计算。

这只是拥抱数据流和同步思维的结果。**相同的解决方案适用于从父级传递的函数props：** 

```jsx
function Parent() {
  const [query, setQuery] = useState('react');

  // 你的关注点在这里
  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Fetch data and return it ...
  }, [query]);  // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```

由于`fetchData`只在`query`状态发生变化时才会在`Parent`内部发生变化，所以我们的`Child`在应用程序真正需要时才会重新获取数据。

## 函数是数据流的一部分吗？

有趣的是，用类打破了这种模式，真正显示了效果和生命周期范例之间的差异。考虑一下这个转换:

```jsx
class Parent extends Component {
  state = {
    query: 'react'
  };
  // 你的关注点在这里(手动高亮)
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

你可能会想：“得了吧，Dan，我们都知道`useEffect`就像`componentDidMount`和`componentDidUpdate`结合在一起，你无法继续再摇旗呐喊了！” **然而，即使使用`componentDidUpdate`，这也不起作用：** 

```jsx
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 This condition will never be true
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

当然，`fetchData`是一个类的方法！(或者，更确切地说，一个类属性——但这不会改变任何东西。)由于状态的变化，它不会有所不同。所以`this.props.fetchData`将保持等于`prevProps.fetchData`，我们将永远不会重新获取。让我们删除这个条件呢？

```js
componentDidUpdate(prevProps) {
  this.props.fetchData();
}
```

哦等等，这会在每次重新渲染时获取。(在上面的树中添加一个动画是发现它的一种有趣的方式。) 也许让我们将它绑定到特定的查询？

```jsx
render() {
  return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
}

```

但是，即使`query`没有改变，`this.props.fetchData！== prevProps.fetchData`也*始终* 为`true`！所以我们总是会重新获取。

对于类的这个难题，惟一真正的解决方案是咬紧牙关，将`query`本身传递给`Child`组件。`Child`实际上并没有最终使用`query`，但它可以在更改时触发重新获取：

```jsx
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

在多年使用React类的过程中，我已经习惯了传递不必要的props并破坏父组件的封装，直到一周前我才意识到为什么必须这样做。

**对于类，函数props本身并不是数据流的真正组成部分。** 方法过于紧密于可变的`this`变量，这样我们就不能依赖它们的标识来表示任何内容。 因此，即使我们只想要一个函数，我们也必须传递一堆其他数据，以便能够“区分”它。我们无法知道从父级传递的`this.props.fetchData`是否依赖于某种状态，以及该状态是否刚刚更改。

**使用`useCallback`，函数可以完全参与数据流。** 我们可以说，如果函数输入发生了变化，函数本身就会发生变化，但如果没有变化，它就会保持不变。由于`useCallback`提供的粒度，对`props.fetchData`等props的更改可以自动向下传播。 

同样，[useMemo](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usememo)让我们对复杂对象也这样做：

```jsx
function ColorPicker() {
  // Doesn't break Child's shallow equality prop check
  // unless the color actually changes.
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**我想强调的是，在任何地方使用`useCallback`都非常笨重。** 当一个函数传递下去并从一些子组件的效果内部调用时它很有用。或者，如果你试图阻止破坏子组件的记忆。但Hooks更适合于[避免回调完全传递下来](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)。

在上面的例子中，我更希望`fetchData`位于我的effect(它本身可以被提取到一个自定义的钩子中)或顶层导入中。我希望保持effect简单，并且其中的回调对此没有帮助。(“如果在请求运行期间某些`props.onComplete`回调发生了更改，该怎么办？”) 你可以[模拟类行为](https://overreacted.io/a-complete-guide-to-useeffect/#swimming-against-the-tide)，但这并不能解决竞争条件。

## 说说竞争条件

使用类的经典数据获取示例可能如下所示：

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

你可能知道，这段代码有些问题。它不处理更新。所以你可以在网上找到的第二个经典例子是这样的：

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

这肯定更好！但他仍然有些问题。它有问题的原因是请求顺序可能出现问题。因此，如果我正在获取`{id：10}`的数据，切换到`{id：20}`，但`{id：20}`请求首先出现，先前开始但稍后完成的请求将错误地覆盖我的状态。

这被称为竞争条件，它在代码中是典型的，将`async`/`await`（假定有东西在等待结果）与自顶向下的数据流（当我们处于异步函数的中间时，属性或状态可能会改变）混合在一起。

效果并不能神奇地解决这个问题，但是如果你试图将`async`函数直接传递给效果，它们会警告你。(我们需要改进这个警告，以便更好地解释你可能遇到的问题。)

如果你使用的异步方法支持取消，那就太棒了! 你可以在清理函数中取消异步请求。

或者，最简单的权宜之计方法是使用布尔值跟踪它：

```diff
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
+   let didCancel = false;
    async function fetchData() {
      const article = await API.fetchArticle(id);
+     if (!didCancel) {        
      	setArticle(article);
      }
    }

    fetchData();

	// 这里也是你的关注点
    return () => {      
    	didCancel = true;    
    };  
  }, [id]);

  // ...
}
```

[这篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)详细介绍了如何处理错误和加载状态，以及将该逻辑提取到自定义Hook中。如果你有兴趣了解有关使用Hooks获取数据的更多信息，我建议你查看一下。

## 提高标准

使用类生命周期思维模式，副作用与渲染输出的行为不同。渲染UI由props和state驱动，并保证与它们一致，但副作用不是。这是bug的常见来源。

使用`useEffect`的思维模式，默认情况下会同步事物。副作用成为React数据流的一部分。对于每个`useEffect`调用，一旦你做对了，你的组件就会更好地处理边缘情况。

然而，做好这件事的前期成本更高。这可能很烦人。编写能够很好地处理边缘情况的同步代码，本质上比引发与渲染不一致的一次性副作用更困难。

如果`useEffect`是你大多数时间使用的工具，这可能会令人担忧。然而，它是一个低层的构建块。现在是使用钩子的早期阶段，所以每个人都一直在使用低级别的钩子，尤其是在教程中。但是在实践中，随着好的API获得发展势头，社区很可能会开始转向更高级别的钩子。

我看到不同的应用程序创建了它们自己的钩子，比如封装了它们的一些应用程序的auth逻辑的`useFetch`或使用主题上下文的`useTheme`。一旦你有了这些工具箱，你就不会经常使用`useEffect`。但它带来的弹性使每个Hook都能在其上构建。

到目前为止，`useEffect`最常用于数据获取。但是数据提取并不是一个同步问题。这一点尤其明显，因为我们的deps经常是`[]`。我们在同步什么?

从长远来看，[数据获取的suspense](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching)将允许第三方库以一种一流的方式告诉React暂停渲染，直到异步(任何东西:代码、数据、图像)就绪。

随着suspense逐渐覆盖更多的数据获取用例，我预计当你真正想要同步props和状态到某个副作用时，`useEffect`将作为一个高级用户工具淡出背景。与数据获取不同，它可以很自然地处理这种情况，因为它是为这种情况而设计的。但在此之前，[这里所示](https://www.robinwieruch.de/react-hooks-fetch-data/)的自定义钩子是重用数据获取逻辑的好方法。

## 结束

现在你已经了解了我使用效果的所有知识，请在开始时查看[TLDR](#tldr)。有意义吗?我错过什么了吗?(我的纸还没有用完呢!)

我很想在[Twitter](https://mobile.twitter.com/search?q=https%3A%2F%2Foverreacted.io%2Fa-complete-guide-to-useeffect%2F)上收到你的来信！谢谢阅读。







## 笔者个人总结

其实这个就像前面所说的类和函数的区别了。因为在React中，props是不会改变的，而this(state)是可变的。所以造成了改变。由于props是不可变的，这样针对每次的渲染，都会有一个特定的渲染(每次的渲染)。

对于effect内使用的函数，最好是放在effect中，这样可以避免以后组件增加而未处理所有的情况。如果有复用，可以把这些函数提到effect外面，使用useCallback包裹起来。
