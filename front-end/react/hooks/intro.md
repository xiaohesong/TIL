`Hooks`是新的功能提案，出现在`v16.7.0-alpha`版本中，使用`Hooks`可以让你在不适用类的情况下使用状态和其他的一些`react`功能。[可在此讨论](https://github.com/reactjs/rfcs/pull/68)

看下面代码：
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
可以看到上面有个`useState`,这个就是我们将要学习的第一个`Hook`.

在具体了解之前，先得知道这些变化对你的影响。

## 无重大改变
- **完全选择加入：** 你可以在几个组件中尝试`Hooks`，而无需重写任何现有代码。但是如果你不想这样，你现在可以不用学习或使用`Hooks`。
- **100％向后兼容:** `Hooks`不包含任何重大更改。
- **现在可使用:** `Hook`目前处于`alpha`版本，更希望在收到社区反馈后将它们包含在`React 16.7`中

**没有计划从`React`中删除`class`。** 你可以在[本页底部](https://reactjs.org/docs/hooks-intro.html#gradual-adoption-strategy)阅读有关Hooks逐步采用策略的更多信息。

**`Hook`不会取代你对React概念的了解。** 相反，`Hooks`为你已经知道的`React`概念提供了更直接的`API`：`props`，`state`，`context`，`refs`和`lifecycle`。正如我们稍后将展示的，`Hooks`还提供了一种新的强大方式来组合它们。

**如果只是想开始学习`Hooks`，直接[跳到下一页](https://reactjs.org/docs/hooks-overview.html)。** 你仍然可以继续阅读此页面，详细了解为什么要添加`Hooks`，以及如何在不重写应用程序的情况下开始使用它们。

## 动机
`Hook`解决了`React`中各种看似无关的问题，我们在编写和维护数以万计的组件时遇到了这些问题。无论你是在学习`React`，每天使用它，还是更喜欢使用具有类似组件模型的不同库，你都可能会发现其中的一些问题。

#### 在组件之间重用有状态逻辑很困难
`React`没有提供将可重用行为“附加”到组件的方法（例如，将其连接到`store`）。如果你已经使用`React`一段时间，你可能熟悉[渲染道具](https://reactjs.org/docs/render-props.html)和[高阶组件](https://reactjs.org/docs/higher-order-components.html)等模式，试图解决这个问题。但是这些模式要求你在使用它们时重构组件，这可能很麻烦并且使代码更难以遵循。如果你看一下`React DevTools`中一个典型的`React`应用程序，你可能会发现一个由包含提供者，消费者，高阶组件，渲染道具和其他抽象层的组件组成的“包装器地狱”。虽然我们可以在[`DevTools`中过滤它们](https://github.com/facebook/react-devtools/pull/503)，但这指出了一个更深层次的基本问题：`React`需要一个更好的原语来共享有状态逻辑。

使用`Hook`，你可以从组件中提取有状态逻辑，以便可以独立测试并重用。**Hook允许您在不更改组件层次结构的情况下重用有状态逻辑。** 这样可以轻松地在许多组件之间或与社区共享`Hook`。

我们将在[编写自定义钩子](https://reactjs.org/docs/hooks-custom.html)中进行更多讨论。

#### 复杂的组件变得难以理解
我们经常不得不维护一些开始简单的组件，但最后却变成了无法管理的状态逻辑和副作用的情况。每个生命周期方法通常包含不相关逻辑的混合。例如，组件可能会在`componentDidMount`和`componentDidUpdate`中执行一些数据提取。并且，相同的`componentDidMount`方法可能还包含一些设置事件侦听器的无关逻辑，并在`componentWillUnmount`中执行清理。这样，相互关联的代码被拆分，但完全不相关的代码最终组合在一个方法中。这很容易引入错误和不一致。

在许多情况下，不可能将这些组件分解为较小的组件，因为状态逻辑遍布整个地方。测试它们也很困难。这是许多人更喜欢将`React`与单独的状态管理库相结合的原因之一。但是，这通常会引入太多的抽象，要求在不同的文件之间跳转，并使重用组件变得更加困难。

为了解决这个问题，**`Hooks`允许根据相关的部分（例如设置订阅或获取数据）将一个组件拆分为较小的函数，** 而不是基于生命周期方法强制拆分。你还可以选择使用`reducer`管理组件的本地状态，以使其更具可预测性。

更多地关于[Effect Hook](https://reactjs.org/docs/hooks-effect.html#tip-use-multiple-effects-to-separate-concerns)讨论

#### class混淆了人和机器
在我们的观察中，`class`是学习`React`的最大障碍。你必须了解`this`在`JavaScript`中是如何工作的，这与它在大多数语言中的工作方式有很大不同。你必须记住`bind`事件处理程序。没有不稳定的[语法提议](https://babeljs.io/docs/en/babel-plugin-transform-class-properties/)，代码非常冗长。开发者可以很好地理解`props`，`state`和自上而下的数据流，但仍然很难与类斗争。`React`中的函数和类组件之间的区别以及何时使用每个组件导致即使在经验丰富的`React`开发人员之间也存在分歧。

此外，`React`已经推出了大约五年，我们希望确保它在未来五年内保持相关性。正如[Svelte](https://svelte.technology/)，[Angular](https://angular.io/)，[Glimmer](https://glimmerjs.com/)和其他人所表明的那样，[提前编译组件](https://en.wikipedia.org/wiki/Ahead-of-time_compilation)在未来有很大潜力。特别是如果它不限于模板。最近，我们一直在尝试使用[Prepack](https://prepack.io/)进行[组件折叠](https://github.com/facebook/react/issues/7323)，我们已经看到了有希望的早期结果。但是，我们发现类组件可能会增长无意识的模式，使这些优化回归到较慢的路径。类也为今天的工具提出了问题。例如，类不会很好地缩小，并且它们使得热加载片状和不可靠。我们希望提供一种`API`，使代码更有可能保持可优化途径。

为了解决这些问题，**`Hooks`允许你在没有类的情况下使用更多React的功能。** 从概念上讲，`React`组件一直更接近功能(`function`)。 `Hooks`拥抱功能，但不会牺牲`React`的实践精神。钩子提供了对命令式逃生舱口的访问，并且不需要你学习复杂的功能或反应式编程技术。

> [`Hooks`概览](https://reactjs.org/docs/hooks-overview.html)是开始学习`Hooks`的好地方。


## 逐步采用策略
> **没有计划从React中删除类。**

我们知道`React`开发人员专注于发布产品，没有时间研究正在发布的每个新`API`。钩子是非常新的，在考虑学习或采用它们之前等待更多示例和教程可能会更好。

我们也理解为React添加新东西的标准非常高。对于好奇的读者，我们已经准备了一个[详细的RFC](https://github.com/reactjs/rfcs/pull/68)，其中包含更多细节的动机，并提供有关特定设计决策和相关现有技术的额外视角。

**至关重要的是，`Hooks`与现有代码并行工作，因此您可以逐步采用它们。** 我们正在分享这个实验性的`API`，以便从社区中那些有兴趣塑造React未来的人那里获得早期反馈 - 我们将在公开场合迭代`Hooks`。

最后，没有急于迁移到Hooks。我们建议避免任何“重大改写”，特别是对于现有的复杂类组件。根据我们的经验，最好先在新的和非关键组件中练习使用Hooks，并确保团队中的每个人都对它们感到满意。在尝试`Hooks`之后，请随时向我们[发送反馈](https://github.com/facebook/react/issues/new)，无论是好的还是不好的。

我们打算让Hooks涵盖所有现有的类用例，但 **我们将在可预见的未来继续支持类组件。** 在`Facebook`，我们有数万个组件作为类编写，我们绝对没有计划重写它们。相反，我们开始在新代码中使用`Hooks`与类并排。

后续将继续介绍对应的`api`,如需了解，可[`watch`仓库](https://github.com/xiaohesong/TIL/new/master/front-end/react)。

[本文原始出处](https://reactjs.org/docs/hooks-intro.html#classes-confuse-both-people-and-machines)




