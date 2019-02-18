# You Don't Know JS: Scope & Closures

# Appendix B: Polyfilling Block Scope

在第3章中，我们探讨了块级作用域。我们看到`with`和`catch`都是JavaScript块级作用域中的小例子，至少从ES3的引入开始就存在于JavaScript中。

但是ES6的`let`引入让我们最终为代码提供了完整的，不受约束的块级作用域功能。有许多令人兴奋的事情，无论是功能上还是代码风格上，这个块级作用域将启用。

但是，如果我们想在ES6之前的环境中使用块级作用域呢？

考虑下面的代码：

```js
{
	let a = 2;
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

这在ES6环境中很好的工作。但是我们可以在ES6之前这样做吗？`catch`就是答案。

```js
try{throw 2}catch(a){
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

哇！这是一些丑陋，怪异的代码。我们看到一个`try/catch`似乎强行抛出一个错误，但它抛出的“错误”只是一个值`2`，然后接收它的变量声明在`catch(a)`中。心灵：受伤。

这是正确的，`catch`具有块级作用域，这意味着它可以在ES6之前的环境中用作块填充。

“但是......”，你说。 “......没有人愿意编写像那样难看的代码！”确实如此。也没有人写（部分）由coffeescript编译器输出的代码。这不是重点。

关键是工具可以将ES6代码转译为在ES6之前的环境中工作。这可以使用块级作用域编写代码，并从这些功能中受益，并让构建步骤工具负责生成在部署时实际工作的代码。

这实际上是所有（大多数）ES6的首选迁移路径：在从ES6之前到ES6的过渡期间，使用代码转译器来获取ES6代码并生成与ES5兼容的代码。

## Traceur

Google维护了一个名为“Traceur”[^ note-traceur]的项目，该项目的任务是将ES6功能转换为ES6之前（主要是ES5，但不是全部！）以供使用。TC39委员会依赖此工具（和其他人）来测试他们指定的功能的语义。

Traceur从我们的片段中产生了什么？你猜到了！

```js
{
	try {
		throw undefined;
	} catch (a) {
		a = 2;
		console.log( a );
	}
}

console.log( a );
```

因此，通过使用这些工具，我们可以开始利用块级作用域，无论我们是否针对ES6，因为`try/catch`已经从ES3开始（并且以这种方式工作）。

## Implicit vs. Explicit Blocks

在第3章中，我们在引入块级作用域时发现了代码可维护性/可重构性的一些潜在缺陷。有没有其他方法可以利用块级作用域但减少这种缺点？

考虑这种替代形式的`let`，称为“let 块”或“let语句”（与之前的“let声明”形成对比）。

```js
let (a = 2) {
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

let语句不是隐式劫持现有块，而是为其作用域绑定创建一个显式块。显式块不仅更突出，并且可能在代码重构中更加强大，它还通过语法将所有声明强制放在块的顶部来生成更干净的代码。这样可以更容易地查看任何块，并知道它的作用域是什么，而不是什么。

作为一种模式，它反映了许多人在手动将所有`var`声明移动/提升到函数顶部时采用函数作用域的方法。let语句故意将它们放在块的顶部，如果不使用遍布各处块中的`let`声明，则块级作用域声明更容易识别和维护。

但是，有一个问题。 ES6中不包含let语句形式。官方Traceur编译器也不接受这种形式的代码。

我们有两种选择。我们可以使用ES6有效的语法和一些代码规则进行格式化：

```js
/*let*/ { let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

但是，工具旨在解决我们的问题。所以另一个选择是编写显式的let语句块，让工具将它们转换为有效的工作代码。

所以，我构建了一个名为“let-er”[^ note-let_er]的工具来解决这个问题。let-er是一个构建步骤代码转换器，但它唯一的任务是找到let语句形式并将它们转换。它将不涉及你的任何其他代码，包括任何let声明。你可以安全地使用let-er作为第一个ES6转换器步骤，然后在必要时将代码传递给Traceur之类的东西。

而且，let-er有一个配置标志`--es6`，它在打开时（默认关闭）会改变生成的代码类型。代替ES3的黑科技填充`try/Catch`  ，*let-er* 获取我们的代码片段并生成完全符合ES6的非黑科技：

```js
{
	let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

因此，你可以立即开始使用 *let-er*，并针对所有ES6之前的环境，当你只关心ES6时，你可以添加标记并立即仅针对ES6。

最重要的是，**你可以使用更优选和更明确的let语句形式** ，即使它不是任何ES版本的官方部分（尚未）。

## Performance

让我最后加上一个关于`try/catch`性能的简短说明，和/或解决这个问题，“为什么不使用IIFE来创建作用域？”

首先，`try/catch`的性能较慢，但是没有合理的假设认为它必须是这样，或者甚至永远是这样。由于TC39批准的官方ES6转译器使用`try/catch`，Traceur团队已经要求Chrome改进`try/catch`的性能，他们显然有这样做的动机。

其次，IIFE与`try/catch`不是一个公平的比较，因为包含任意代码的函数会改变该代码内部，`this`, `return`, `break`, 和 `continue`。IIFE不是合适的通用替代品。它只能在某些情况下手动使用。

问题变成了：你是否想要块级作用域。如果是的，这些工具为你提供了选择；如果不是，请继续使用`var`继续编码。

[^note-traceur]: [Google Traceur](http://google.github.io/traceur-compiler/demo/repl.html)

[^note-let_er]: let-er(https://github.com/getify/let-er)

