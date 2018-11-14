原文: [Eric Elliott - Curry and Function Composition](https://medium.com/javascript-scene/curry-and-function-composition-2c208d774983)

之前看到有文章说柯里化函数，大致看了下，就是高阶函数，只是名字听起来比较高大上一点，今天逛`medium`又发现了这个，看了下感觉还不错，有涉及到闭包，涉及到`point-free style`, 并不是一股脑的安利`demo`了事，这个得记录下。

## 什么是`curried` 函数
**`curried`函数是个一次一个的去获取多个参数的函数。** 再明白点，就是比如 给定一个带有3个参数的函数，`curried`版的函数将接受一个参数并返回一个接受下一个参数的函数，该函数返回一个接受第三个参数的函数。最后一个函数返回将函数应用于其所有参数的结果。

看下面的例子，例如，给定两个数字，`a`和`b`为`curried`形式，返回`a`和`b`的总和：
```js
// add = a => b => Number
const add = a => b => a + b;
```
然后就可以直接调用了:
```js
const result = add(2)(3); // => 5
```
首先，函数接受`a`作为参数，然后返回一个新的函数，然后将`b`传递给这个新的函数，最后返回`a`和`b`的和。每次只传递一个参数。如果函数有更多参数，不止上面的`a,b`两个参数，它可以继续像上面这样返回新的函数，直到最后结束这个函数。

`add`函数接受一个参数之后，然后在这个闭包的范围内返回固定的一部分功能。闭包就是与词法范围捆绑在一起的函数。在运行函数创建时创建了闭包，可以在[这里了解更多](https://github.com/xiaohesong/til/blob/master/front-end/javascript/%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87.md#%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87%E8%AF%A6%E8%A7%A3)。`固定`的意思是说变量在闭包的绑定范围内赋值。

在来看看上面的代码: `add`用参数`2`去调用，返回一个部分应用的函数，并且固定`a`为`2`。我们不是将返回值赋值给变量或以其他方式使用它，而是通过在括号中将`3`传递给它来立即调用返回的函数，从而完成整个函数并返回`5`。

## 什么是部分功能
部分应用程序( **partial application** )是一个已应用于某些但并不是全部参数的函数。直白的来说就是一个在闭包范围内固定了(不变)的一些参数的函数。具有一些参数被固定的功能被认为是部分应用的。

## 有什么不同？
部分功能(partial application)可以根据需要一次使用多个或几个参数。
柯里化函数(curried function)每次返回一个一元函数: 每次携带一个参数的函数。

所有`curried`函数都返回部分应用程序，但并非所有部分应用程序都是`curried`函数的结果。

对于`curried`来说，**一元函数的这个要求是一个重要的特征。**

## 什么是`point-free`风格
`point-free`是一种编程风格，其中函数定义不引用函数的参数。

我们先来看看`js`中函数的定义:
```js
function foo (/* parameters are declared here*/) {
  // ...
}
const foo = (/* parameters are declared here */) => // ...
const foo = function (/* parameters are declared here */) {
  // ...
}
```
如何在不引用所需参数的情况下在`JavaScript`中定义函数？好吧，我们不能使用`function`这个关键字，我们也不能使用箭头函数（`=>`），因为它们需要声明形式参数（引用它的参数）。所以我们需要做的就是 **调用一个返回函数的函数。**

创建一个函数，使用`point-free`增加传递给它的任何数字。记住，我们已经有一个名为`add`的函数，它接受一个数字并返回一个部分应用(partial application)的函数，其第一个参数固定为你传入的任何内容。我们可以用它来创建一个名为`inc()`的新函数：
```js
/ inc = n => Number
// Adds 1 to any number.
const inc = add(1);
inc(3); // => 4
```
这作为一种泛化和专业化的机制变得有趣。返回的函数只是更通用的`add()`函数的专用版本。我们可以使用`add()`创建任意数量的专用版本：
```js
const inc10 = add(10);
const inc20 = add(20);
inc10(3); // => 13
inc20(3); // => 23
```
当然，这些都有自己的闭包范围（闭包是在函数创建时创建的 - 当调用`add()`时），因此原来的`inc()`继续保持工作：
```js
inc(3) // 4
```

当我们使用函数调用`add(1)`创建`inc()`时，`add()`中的`a`参数在返回的函数内被固定为`1`，该函数被赋值给`inc`。

然后当我们调用`inc(3)`时，`add()`中的`b`参数被替换为参数值`3`，并且应用程序完成，返回`1`和`3`之和。

所有`curried`函数都是高阶函数的一种形式，它允许你为手头的特定用例创建原始函数的专用版本。

## 为什么要`curry`
`curried`函数在函数组合的上下文中特别有用。

在代数中，给出了两个函数`f`和`g`：
```js
f: a -> b
g: b -> c
```
我们可以将这些函数组合在一起创建一个新的函数(`h`)，`h`从`a`直接到`c`：
```js
//代数定义，借用`.`组合运算符 
//来自Haskell
h: a -> c
h = f . g = f(g(x))
```
在`js`中：
```js
const g = n => n + 1;
const f = n => n * 2;
const h = x => f(g(x));
h(20); //=> 42
```

代数的定义:
```js
f . g = f(g(x))
```

可以翻译成`JavaScript`：
 ```js
const compose = (f, g) => f(g(x));
```
但那只能一次组成两个函数。在代数中，可以写：
```js
g . f . h
```
我们可以编写一个函数来编写任意数量的函数。换句话说，`compose()`创建一个函数管道，其中一个函数的输出连接到下一个函数的输入。
这是我经常写的方法：
```js
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
```

此版本接受任意数量的函数并返回一个取初始值`x`的函数，然后使用`reduceRight()`在`fns`中从右到左迭代每个函数`f`，然后将其依次应用于累积值`y` 。我们在累加器中积累的函数，`y`在此函数中是由`compose()`返回的函数的返回值。

现在我们可以像这样编写我们的组合：
```js
const g = n => n + 1;
const f = n => n * 2;
// replace `x => f(g(x))` with `compose(f, g)`
const h = compose(f, g);
h(20); //=> 42
```

## 代码追踪(`trace`)
使用`point-free`风格的函数组合创建了非常简洁，可读的代码，但是他不易于调试。如果要检查函数之间的值，该怎么办？ `trace()`是一个方便实用的函数，可以让你做到这一点。它采用`curried`函数的形式：
```js
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
```
现在我们可以使用这个来检查函数了:
```js
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
/*
Note: function application order is
bottom-to-top:
*/
const h = compose(
  trace('after f'),
  f,
  trace('after g'),
  g
);
h(20);
/*
after g: 21
after f: 42
*/
```
`compose()`是一个很棒的实用程序，但是当我们需要编写两个以上的函数时，如果我们能够按照从上到下的顺序读取它们，这有时会很方便。我们可以通过反转调用函数的顺序来做到这一点。还有另一个名为`pipe()`的组合实用程序，它以相反的顺序组成：
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
```
现在我们可以用`pipe`把上面的重写下:
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
/*
Now the function application order
runs top-to-bottom:
*/
const h = pipe(
  g,
  trace('after g'),
  f,
  trace('after f'),
);
h(20);
/*
after g: 21
after f: 42
*/
```

## curry和功能组合一起
即使在函数组合的上下文之外，`curry`无疑是一个有用的抽象，可以来做一些特定的事情。例如，一个`curried`版本的`map()`可以专门用于做许多不同的事情：
```js
const map = fn => mappable => mappable.map(fn);
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const log = (...args) => console.log(...args);
const arr = [1, 2, 3, 4];
const isEven = n => n % 2 === 0;
const stripe = n => isEven(n) ? 'dark' : 'light';
const stripeAll = map(stripe);
const striped = stripeAll(arr); 
log(striped);
// => ["light", "dark", "light", "dark"]
const double = n => n * 2;
const doubleAll = map(double);
const doubled = doubleAll(arr);
log(doubled);
// => [2, 4, 6, 8]
```
但是，`curried`函数的真正强大之处在于它们简化了函数组合。函数可以接受任意数量的输入，但只能返回单个输出。为了使函数可组合，输出类型必须与预期的输入类型对齐：
```js
f: a => b
g:      b => c
h: a    =>   c
```
如果上面的`g`函数预期有两个参数，则`f`的输出不会与`g`的输入对齐：
```js
f: a => b
g:     (x, b) => c
h: a    =>   c
```
在这种情况下我们如何获得`x`？通常，答案是`curry g`。

记住`curried`函数的定义是一个函数，它通过获取第一个参数并返回一系列的函数一次获取一个参数并且每个参数都采用下一个参数，直到收集完所有参数。

这个定义中的**关键词** 是“一次一个”。`curry`函数对函数组合如此方便的原因是它们将期望多个参数的函数转换为可以采用单个参数的函数，允许它们适合函数组合管道。以`trace()`函数为例，从前面开始：
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
const h = pipe(
  g,
  trace('after g'),
  f,
  trace('after f'),
);
h(20);
/*
after g: 21
after f: 42
*/
```
`trace`定义了两个参数，但是一次只接受一个参数，允许我们专门化内联函数。如果`trace`不是`curry`，我们就不能以这种方式使用它。我们必须像这样编写管道：
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = (label, value) => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
const h = pipe(
  g,
  // `trace`调用不再是`point-free`风格，
  // 引入中间变量, `x`.
  x => trace('after g', x),
  f,
  x => trace('after f', x),
);
h(20);
```
但是简单的`curry`函数是不够的，还需要确保函数按正确的参数顺序来专门化它们。看看如果我们再次`curry trace()`会发生什么，但是翻转参数顺序：
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = value => label => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
const h = pipe(
  g,
  // the trace() calls can't be point-free,
  // because arguments are expected in the wrong order.
  x => trace(x)('after g'),
  f,
  x => trace(x)('after f'),
);
h(20);
```
如果不想这样，可以使用名为`flip()`的函数解决该问题，该函数只是翻转两个参数的顺序：
```js
const flip = fn => a => b => fn(b)(a);
```
现在我们可以创建一个`flippedTrace `函数:
```js
const flippedTrace = flip(trace);
```
再这样使用这个`flippedTrace`：
```js
const flip = fn => a => b => fn(b)(a);
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = value => label => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const flippedTrace = flip(trace);
const g = n => n + 1;
const f = n => n * 2;
const h = pipe(
  g,
  flippedTrace('after g'),
  f,
  flippedTrace('after f'),
);
h(20);
```
可以发现这样也可以工作，**但是** 首先就应该以正确的方式去编写函数。这个样式有时称为“数据最后”，这意味着你应首先获取特殊参数，并获取该函数最后作用的数据。

看看这个函数的最初的形式:
```js
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
```
`trace`的每个应用程序都创建了一个在管道中使用的`trace`函数的专用版本，其中`label`被固定在返回的`trace`部分应用程序中。所以这：
```js
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
const traceAfterG = trace('after g');
```
等同于下面这个:
```js
const traceAfterG = value => {
  const label = 'after g';
  console.log(`${ label }: ${ value }`);
  return value;
};
```
如果我们为`traceAfterG`交换`trace('after g')`，那就意味着同样的事情：
```js
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const trace = label => value => {
  console.log(`${ label }: ${ value }`);
  return value;
};
// The curried version of trace()
// saves us from writing all this code...
const traceAfterG = value => {
  const label = 'after g';
  console.log(`${ label }: ${ value }`);
  return value;
};
const g = n => n + 1;
const f = n => n * 2;
const h = pipe(
  g,
  traceAfterG,
  f,
  trace('after f'),
);
h(20);
```

## 总结
`curried`函数是一个函数，通过取第一个参数，一次一个地获取多个参数，并返回一系列函数，每个函数接受下一个参数，直到所有参数都已修复，并且函数应用程序可以完成，此时返回结果值。

部分应用程序( **partial application** )是一个已经应用于某些 - 但尚未全部参数参与的函数。函数已经应用的参数称为固定参数。

`point-free style`是一种定义函数而不引用其参数的方法。通常，通过调用返回函数的函数（例如`curried`函数）来创建`point-free`函数。

**`curried`函数非常适合函数组合** ，因为它们允许你轻松地将`n元`函数转换为函数组合管道所需的一元函数形式：管道中的函数必须只接收一个参数。

**数据最后** 的功能便于功能组合，因为它们可以轻松地用于`point-free style`。
