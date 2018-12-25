原文: [Master the JavaScript Interview: What is Functional Programming?](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0)

![](https://cdn-images-1.medium.com/max/1760/1*1OxglOpkZHLITbIKEVCy2g.jpeg)

> “掌握JavaScript面试”是一系列帖子，旨在帮助候选人准备他们在申请中高级JavaScript职位时可能遇到的常见问题。这些是我经常在现实面试中使用的问题。

函数式编程已成为js领域里一个非常热门的话题。就在几年前，甚至很少有JavaScript程序员知道函数式编程是什么，但是我在过去3年中看到的每个大型应用程序代码库都大量使用了函数式编程思想。

**函数式编程**（通常缩写为FP）是通过编写**纯函数，避免共享状态、可变数据、副作用** 来构建软件的过程。数式编程是**声明式** 的而不是**命令式** 的，应用程序的状态是通过纯函数流动的。与面向对象编程形成对比，面向对象中应用程序的状态通常与对象中的方法共享和共处。

函数式编程是一种**编程范式** ，这意味着它是一种基于一些基本的定义原则（如上所列）思考软件构建的方式。当然，编程范示的其他示例也包括面向对象编程和过程编程。

函数式的代码往往比命令式或面向对象的代码更简洁，更可预测，更容易测试 - 但如果不熟悉它以及与之相关的常见模式，函数式的代码也可能看起来更密集杂乱，并且 相关文献对新人来说是不好理解的。

如果你开始使用谷歌搜索功能性编程术语，你将很快发现学术术语的一堵墙，对于初学者来说这可能是望而生畏的。说它有一个学习曲线是一个严重的轻描淡写。但是如果你已经用JavaScript编程了一段时间，很可能你在真实程序中使用了很多函数式编程概念和实用程序。

**不要让所有的新词汇吓到你。它比听起来容易得多。**

最难的部分是那些你不熟悉的词汇。在你开始掌握函数式编程的思想之前，上面定义中有很多想法需要去理解：
- Pure functions（纯函数）
- Function composition（函数组合）
- Avoid shared state（避免状态共享）
- Avoid mutating state（避免状态改变）
- Avoid side effects（避免副作用）

换句话说，如果你想知道函数式编程在实践中有什么意义，你必须首先理解这些核心概念。

`pure function`(纯函数)是这样一个函数：
- 输入的参数相同，返回的结果相同
- 无副作用的

纯函数在函数式编程中有许多重要的属性，包括引用透明性（就是可以使用其结果值替换函数调用而不更改程序的含义）。阅读 [“什么是纯函数?”](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976) 获取更多信息。

### 共享状态
享状态是存在于共享作用域中的任何变量，对象或内存空间，或者是在作用域之间传递的属性。共享范围可以包括全局范围或闭包范围。通常，在面向对象的编程中，通过向其他对象添加属性来在此范围之间共享对象。

例如，计算机游戏可能具有主游戏对象，其中角色和游戏物品存储为该对象拥有的属性。函数式编程避免了共享状态 - 而是依赖于不可变数据结构和单纯计算来从现有数据中获取新数据。有关功能软件如何处理应用程序状态的更多详细信息，请参阅[10个更好的Redux架构提示](https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44)。

共享状态的问题在于，为了理解函数的效果，必须得知道函数使用或影响的每个共享变量的完整历史记录。

想象下，你有一个需要保存的用户对象。你有一个`saveUser`函数去请求服务端API。当发生这种情况时，用户使用`updateAvatar`方法更改其个人资料图片并触发另一个`saveUser`请求。在保存时，服务器返回一个规范的用户对象，该对象应该替换内存中的任何内容，以便与服务器上发生的更改或响应其他API调用同步。

不幸的是，第二个响应在第一个响应之前被接收，所以当第一个（现在过时的）响应被返回时，新的内容在内存中被清除并被旧的替换。这是竞争条件的一个示例 - 与共享状态相关的非常常见的错误。

与共享状态相关的另一个常见问题是，更改调用函数的顺序可能会导致级联失败，因为作用于共享状态的函数与时序有关：
```js
// With shared state, the order in which function calls are made
// changes the result of the function calls.
const x = {
  val: 2
};

const x1 = () => x.val += 1;

const x2 = () => x.val *= 2;

x1();
x2();

console.log(x.val); // 6

// This example is exactly equivalent to the above, except...
const y = {
  val: 2
};

const y1 = () => y.val += 1;

const y2 = () => y.val *= 2;

// ...the order of the function calls is reversed...
y2();
y1();

// ... which changes the resulting value:
console.log(y.val); // 5
```
当您避免共享状态时，函数调用的时间和顺序不会更改调用函数的结果。使用纯函数，给定相同的输入，您将始终获得相同的输出。这使得函数调用完全独立于其他函数调用，这可以从根本上简化更改和重构。一个函数的更改或函数调用的时间不会波动并破坏程序的其他部分。
```js
const x = {
  val: 2
};

const x1 = x => Object.assign({}, x, { val: x.val + 1});

const x2 = x => Object.assign({}, x, { val: x.val * 2});

console.log(x1(x2(x)).val); // 5


const y = {
  val: 2
};

// Since there are no dependencies on outside variables,
// we don't need different functions to operate on different
// variables.

// this space intentionally left blank


// Because the functions don't mutate, you can call these
// functions as many times as you want, in any order, 
// without changing the result of other function calls.
x2(y);
x1(y);

console.log(x1(x2(y)).val); // 5
```
> 笔者: 看完这个例子你可能觉得不是很恰当，因为最后都是调用的时候的区别，上面的这个例子如果改变调用顺序也是不可行的。`x2(x1(y)).val ==> 6`. 但是这个只是用来阐述一个状态共享区别的思想。下面有解释。

在上面的示例中，我们使用`Object.assign`并传入一个空对象作为第一个参数来复制`x`的属性而不是将其改变。在这种情况下，它只相当于从头开始创建一个新对象，没有`Object.assign`，但这是JavaScript中常见的模式，用于创建现有状态的副本而不是使用突变。

如果你仔细观察这个例子中的console.log（）语句，你应该注意到我已经提到过的东西：函数组合。回想一下之前，函数组成如下所示：`f(g(x))`。在这种情况下，我们用组合的`x1`和`x2`替换`f`和`g`：`x1 .  X2`。

当然，如果更改组合的顺序，输出将会改变。运行秩序仍然很重要。`f(g(x))`并不总是等于`g(f(x))`，但是现在无关紧要的是函数之外的变量会发生什么，这很重要。使用非纯函数，除非你知道使用函数影响的每个变量的完整历史记录，否则无法完全理解函数的作用。

删除函数调用时序依赖性，并消除整个类的潜在错误。

### 不可变性
不可变对象是在创建后无法修改的对象。相反，可变对象是可以在创建后修改的任何对象。

不可变性是函数式编程的核心概念，因为没有它，程序中的数据流是有损的。状态历史被抛弃，奇怪的错误可能会蔓延到的软件中。有关不变性的重要性的更多信息，请参阅[不可变性之道](https://medium.com/javascript-scene/the-dao-of-immutability-9f91a70c88cd)。

在JavaScript中，要提醒的是不要将`const`与不可变性混淆。 `const`创建一个变量名绑定，在创建后无法重新分配。`const`不会创建不可变对象。不能更改绑定引用的对象，但仍然可以更改对象的属性，这意味着使用`const`创建的绑定是可变的，而不是不可变的。(笔者认为：这个看情况，对于对象是这样的，但是对于原始类型的就不是这样的说法了。)

不可变对象根本无法更改。你可以通过深度冻结对象来使值真正不可变。JavaScript有一个冻结对象深度的方法(笔者：[推荐这个链接查看freeze](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/prototype/Property-Descriptors.md#%E5%85%B6%E4%BB%96%E5%AE%9E%E7%94%A8%E6%96%B9%E6%B3%95))：
```js
const a = Object.freeze({
  foo: 'Hello',
  bar: 'world',
  baz: '!'
});

a.foo = 'Goodbye';
// Error: Cannot assign to read only property 'foo' of object Object
```
但冻结的对象只是表面上不可变的。例如，以下对象是可变的：
```js
const a = Object.freeze({
  foo: { greeting: 'Hello' },
  bar: 'world',
  baz: '!'
});

a.foo.greeting = 'Goodbye';

console.log(`${ a.foo.greeting }, ${ a.bar }${a.baz}`);
```
从上面可知，冻结对象的顶级原始属性不能更改，但任何属性为对象的（包括数组等）仍然可以更改。因此，即使冻结对象也不是不可变的，除非遍历整个对象树并冻结每个对象属性。

在许多函数式编程语言中，有一些特殊的不可变数据结构称为**trie数据结构** （发音为“tree”），它们被有效地深度冻结 - 意味着无论属性层次中的属性级别如何，都不能更改任何属性。

`trie`使用结构共享来共享对象的所有部分的引用内存位置，这些部分在操作复制对象之后保持不变，这使用较少的存储器，并且对于某些类型的操作实现性能改进。

例如，可以在对象树的根处使用标识进行比较。如果标识相同，则不必遍历整个树来检查差异。

JavaScript中有几个库利用了尝试，包括[Immutable.js](https://github.com/facebook/immutable-js)和[Mori](https://github.com/swannodette/mori)。

我已经对两者进行了实验，并且倾向于在需要大量不可变状态的大型项目中使用Immutable.js。如需要了解更多，请查阅[更好的Redux架构的10个技巧](https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44)。

### 副作用
副作用是在被调用函数之外可以观察到的除了返回值之外的任何应用程序的状态更改。副作用包括：
- 修改任何外部变量或对象属性（例如，全局变量或父函数作用域链中的变量）
- 在控制台log
- 写入屏幕
- 写入文件
- 网络请求
- 触发外部的程序
- 调用带有副作用的函数

在函数式编程中尽量避免副作用，这使得程序更容易理解，并且更容易测试。

Haskell和其他函数式语言经常使用[monad](https://en.wikipedia.org/wiki/Monad_%28functional_programming%29)来隔离和封装来自纯函数的副作用。monads的主题足够深入，可以写一本书，所以我们将保存以供日后使用。

你现在需要知道的是，副作用操作需要与其他部分隔离开来。如果将副作用与程序逻辑的其余部分分开，则软件将更容易扩展，重构，调试，测试和维护。

这就是大多数前端框架鼓励用户在单独的，松散耦合的模块中管理状态和组件呈现的原因。

### 通过高阶函数的可重用性
函数式编程倾向于重用一组通用的函数来处理数据。面向对象的编程倾向于在对象中共存方法和数据。这些方法只能对它们设计用于操作的数据类型进行操作，并且通常只对该特定对象实例中包含的数据进行操作。

在函数式编程中，任何类型的数据都是公平的。相同的`map()`函数可以映射对象，字符串，数字或任何其他数据类型，因为它将函数作为适当处理给定数据类型的参数。FP使用高阶函数来实现。

avaScript有一等函数，它允许我们将函数视为数据 - 将它们分配给变量，将它们传递给其他函数，从函数返回等等......

高阶函数是将函数作为参数，返回函数或两者的任何函数。高阶函数通常用于：
- 使用回调函数，promise，monad等抽象或隔离动作，作用(指副作用)或异步流控制......
- 创建可以处理各种数据类型的工具
- 部分将函数应用于其参数或创建curried函数以用于重用或函数组合
- 获取函数列表并返回这些输入函数的一些组合

### 容器(宿主)，Functors, 列表和流
仿函数(Functors)是可以映射的东西。换句话说，它是一个宿主，它有一个接口，可用于将函数应用于其中的值。**当你看到functor这个词时，你应该想到“可映射”。**

之前我们了解到相同的`map`可以对各种数据类型起作用。它通过提升映射操作以使用仿函数API来实现。map使用的重要流控制操作利用了该接口。对于Array.prototype.map（），宿主是一个数组，但其他数据结构也可以是仿函数 - 只要它们提供映射API。

我们看看Array.prototype.map（）如何允许您从映射实用程序中抽象数据类型，以使map（）可用于任何数据类型。我们将创建一个简单的double（）映射，简单地将任何传入的值乘以2：

```js
const double = n => n * 2;
const doubleMap = numbers => numbers.map(double);
console.log(doubleMap([2, 3, 4])); // [ 4, 6, 8 ]
```
如果我们想要对游戏中的目标进行操作以使其获得的点数翻倍，该怎么办？们所要做的就是对我们传递给`map`的`double`函数进行细微的更改，一切仍然有效：
```js
const double = n => n.points * 2;

const doubleMap = numbers => numbers.map(double);

console.log(doubleMap([
  { name: 'ball', points: 2 },
  { name: 'coin', points: 3 },
  { name: 'candy', points: 4}
])); // [ 4, 6, 8 ]
```
在函数式编程中，使用仿函数和高阶函数等抽象来使用通用实用函数来操作任意数量的不同数据类型的概念非常重要。你可以看到类似的概念以[不同的方式应用](https://github.com/fantasyland/fantasy-land)。

> “随着时间的推移,所表达的列表是一个流。”

### 声明与命令
函数式编程是一种声明式范例，意味着在没有明确描述流控制的情况下表达程序逻辑。

命令式程序花费一些代码来描述用于实现所需结果的特定步骤 - **流程控制** ：**如何** 做事。

声明性程序抽象流程控制过程，而是花费一行代码来描述**数据流** ：做**什么** 。如何抽象出来。

例如，这个**命令式** 映射采用数组并返回一个新数组，每个数字乘以2：
```js
const doubleMap = numbers => {
  const doubled = [];
  for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
  }
  return doubled;
};

console.log(doubleMap([2, 3, 4])); // [4, 6, 8]
```

此**声明性** 映射执行相同的操作，但使用Array.prototype.map抽象出流控制，这使您可以更清楚地表达数据流：
```js
const doubleMap = numbers => numbers.map(n => n * 2);

console.log(doubleMap([2, 3, 4])); // [4, 6, 8]
```
**命令式** 代码经常使用语句。**语句** 是执行某些操作的一段代码。常用语句的示例包括for，if，switch，throw等...

**声明性** 代码更多地依赖于表达式。**表达式** 是一段代码，其值为某个值。表达式通常是函数调用，值和运算符的某种组合，它们被计算以产生结果值。

这些都是表达式的例子：
```js
2 * 2
doubleMap([2, 3, 4])
Math.max(4, 3, 2)
```
通常在代码中，将看到表达式被分配给标识符，从函数返回或传递给函数。在分配，返回或传递之前，首先计算表达式，然后使用结果值。

### 总结
- 纯函数而不是共享状态和副作用
- 使用不可变性而不是可变性
- 函数组合而不是命令式流程控制
- 许多通用的，可重用的，它们使用更高阶的函数来处理许多数据类型，而不是只对其处理数据进行操作的方法
- 声明性而非命令性代码（做什么，而不是如何做）
- 表达式而不是语句
- 宿主和高阶函数优于ad-hoc多态

