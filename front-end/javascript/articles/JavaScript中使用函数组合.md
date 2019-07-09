![在JavaScript中使用函数组合](https://process.filestackapi.com/cache=expiry:max/resize=width:700/niDQcIiAThijM57L5FBJ)

前提条件：我在本文中使用柯里化，所以如果你不知道这货，我推荐你先阅读我上一个文章：[JavaScript中的柯里化](https://www.codementor.io/michelre/currying-in-javascript-g6212s8qv)

> 译者：关于柯里化，译者推荐你阅读这一篇[curry](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/higher-order-function/curry.md)。当然，如果你对函数式编程的概念也模糊，推荐在看下这一篇[什么是函数式编程](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/what-is-function-program.md)

## 什么是函数式组合？

函数组合是将多个简单函数组合在一起以构建更复杂的函数的机制。每个函数的结果都传递给下一个函数。在数学中，我们会经常这样写: `f(g(x))`。所以这个`g(x)`的结果被传递了`f`。在编程中，我们可以通过写类似的东西来实现组合。

让我们举一个简单的例子。

假设我需要做如下运算来做一些算术: `2 + 3 * 5`。正如你所知的那样，乘法计算优先于加法运算。所以你先计算`3 * 5`，然后在结果中加`2`。让我们用JavaScript来写。最主要、当然也是最简单的方法可能是:

```js
const add = (a, b) => a + b;
const mult = (a, b) => a * b;
add(2, mult(3, 5))
```

这是函数组合的一种形式，这是把乘法的结果传递给`add`函数。让我们更进一步，看看另一个案例，在这里函数组合显得非常有用。现在假设我有一个用户列表，我需要提取所有成人用户的名字。我个人会这样写:

```js
const users = [
  { name: "Jeff", age: 14 },
  { name: "Jack", age: 18 }, 
  { name: "Milady", age: 22 },
]
const filter = (cb, arr) => arr.filter(cb);
const map = (cb, arr) => arr.map(cb);

map(u => u.name, filter(u => u.age >= 18, users)); //["Jack", "Milady"]
```

这很好，但是如果我们能够自动化组合，效果会更好。至少它可能更具可读性。

## 自动化函数组合

所以我们在本节中的目标是创建一个高阶函数，它接受两个或多个函数并组合它们。那么就让我们来定义我们未来函数的最终签名:

```js
compose(function1, function2, ... , functionN): Function
```

> 译者： 术语： [函数签名](https://developer.mozilla.org/zh-CN/docs/Glossary/Signature/Function)

例如，我们想这样调用函数:

```js
compose(add1, add2)(3) //6
```

所以这样一个函数的实现可以是这样：

```js
const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);
```

那不是很棒吗?这个只有一行的函数允许你组合任何函数来构建复杂的转换。让我解释一下这里发生的事情：

- `compose`  是一个高阶函数。它是一个返回另一个函数的函数。
- `compose`  携带多个函数作为参数，我们使用扩展运算符：`...` 将函数集转为数组。
- 然后我们在这些函数上简单的应用了`reduceRight`。回调的第一个参数是当前参数。第二个参数是当前的函数。然后我们调用每个函数时携带当前参数，其结果用于下一个调用。

现在我们可以在上个例子里使用这个函数了。改造之后会更具可读性：

```js
const filter = cb => arr => arr.filter(cb);
const map = cb => arr => arr.map(cb);

compose(
  map(u => u.name),
  filter(u => u.age >= 18)
)(users) //["Jack", "Milady"]
```

我给你们举最后一个例子。让我们实现传统的MapReduce。

## 带有函数组合的MapReduce

MapReduce的原理很简单。它只是在一组数据上应用`map`并`reduce`结果以产生单个结果。这通常是函数组合的原理。因此，例如，我们可以实现传统的单词计数器来计算多个单词。当`map`遇到一个值时，它只负责发送`1`,`reduce`将对最终数组进行求和，生成结果:

```js
const reduce = cb => arr => arr.reduce(cb); //Just currify the reduce function

const mapWords = map(() => 1);
const reduceWords = reduce((acc, curr) => acc += curr)(0)

compose(reduceWords, mapWords)(['foo', 'bar', 'baz']); //3
```

## 管道还是组合？

我添加了这部分，因为[Yeiber Cano](https://www.codementor.io/yeibercano)提到我第一次实现是`pipe`而不是`compose`。你可以在本文下方阅读他的评论。

> Great writing Rémi +1,
>
> One observation, for `f(g(x))` signature to hold true, compose may need `reduceRight` instead. Composition starts from right to left:

因此，`compose`和`pipe`之间的主要区别在于组合的顺序。组合执行从右到左的函数组合，因为管道执行从左到右的组合。我们来写一下管道的高阶函数:

```js
const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);
```

所以在这种情况下，我们使用`reduce`而不是`reduceRight`来从左到右执行组合。

然后，我们可以将新创建的函数应用于前面的示例：

```js
pipe(
  filter(u => u.age >= 18),
  map(u => u.name),
)(users) //["Jack", "Milady"]

pipe(mapWords, reduceWords)(['foo', 'bar', 'baz']);
```

有些人更喜欢使用`pipe`而不是`compose`，因为他们发现它更具可读性。至少，我们都同意这样更自然!

## 总结

这是一个简单的例子，但是要注意，你可以在更复杂的例子中使用它。函数组合在大多数函数库(如lodash或ramda)上都有实现。你甚至可以找到函数组合的变种。例如，Ramda提出了一个`composeP`函数，允许你组合返回promise的函数: http://ramdajs.com/docs/#composeP



> 译者：函数组合和函数管道的区别就是组合的顺序。`pipe`执行的是从左到右(`reduce`)，``compose`执行的是从右到左(reduceRight)。



> 原文： [Use function composition in JavaScript](https://www.codementor.io/michelre/use-function-composition-in-javascript-gkmxos5mj)

