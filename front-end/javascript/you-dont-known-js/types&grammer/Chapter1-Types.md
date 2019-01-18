# You Dont Known Js -- types&grammer

### Build-in Types

JavaScript定义了七种内置类型：

- `null`
- `undefined`
- `string`
- `number`
- `boolean`
- `symbol` — ES6中添加的
- `object`

**注意：** 除`object`之外的所有这些类型都称为“primitives(基元, 基础的)”。

`typeof`运算符检查给定值的类型，并始终返回七个字符串值中的一个 - 令人惊讶的是，与我们刚刚列出的七种内置类型没有精确的一对一匹配。

```js
typeof undefined     === "undefined"; // true
typeof true          === "boolean";   // true
typeof 42            === "number";    // true
typeof "42"          === "string";    // true
typeof { life: 42 }  === "object";    // true

// added in ES6!
typeof Symbol()      === "symbol";    // true
```

这六种列出的类型具有相应类型的值，并返回相同名称的字符串值，如上所示。`symbol`是ES6的新数据类型，将在第3章中介绍。

你可能已经注意到，我从上面的列表中排除了`null`。这是特别的 - 特别是在与`typeof`运算符结合时它是错误的：

```js
typeof null === "object"; // true
```

它会很好（并且正确！）如果它返回`"null"`，但JS中的这个bug已持续了将近二十年，并且可能永远不会被修复，因为现有的Web内容过多依赖于其错误的行为，“修复”错误会产生更多“错误”并打破很多网络软件。

如果你想要使用 `null` 类型来测试 `null` 值，你需要一个复合条件：

```js
var a = null;

(!a && typeof a === "object"); // true
```

`null`是唯一一个原始类型`falsy`并且`typeof`检查返回`"object"`的值。

那么 `typeof` 可以返回的第七种字符串值是什么？

```js
typeof function a(){ /* .. */ } === "function"; // true
```

很容易认为`function`是JS中的顶层内置类型，特别是考虑到`typeof`运算符的这种行为。但是，如果你阅读规范，你会发现它实际上是对象的“子类型”。具体来说，一个函数被称为“可调用对象” - 一个具有允许调用它的内部`[[Call]]`属性的对象。

函数实际上是对象的事实是非常有用的。最重要的是，他们可以拥有属性。例如：

```js
function a(b,c) {
	/* .. */
}
```

函数对象的`length`属性设置为声明它的形参的数量。

```js
a.length; // 2
```

由于你使用两个正式命名参数（`b`和`c`）声明了该函数，因此“函数的长度”为`2`。

数组怎么样？它们是JS的原生，它们是特殊类型的吗？

```js
typeof [1,2,3] === "object"; // true
```

不，他只是对象。将它们视为对象的“子类型”是最合适的（见第3章），在这种情况下，具有数字索引的附加特征（与仅像普通对象一样的字符串键），并维护自动更新的`.length`属性。

### Values as Types

在JavaScript中，变量没有类型 -- **值有类型。** 变量可以随时保存任何值。

考虑JS类型的另一种方法是JS没有“类型强制”，因为引擎并不坚持保持他会与开始时的类型一致。变量可以在一个赋值语句中保存一个字符串，并在下一个中保存一个数字，依此类推。

`42`这个是有固定的`number`类型，并且这个类型不会被改变。比如另一个值`"42"`是一个`string`类型，可以通过**强制转换** 的过程从`number`值42创建而来。

如果对变量使用`typeof`，他不会像表面看起来那样询问“变量的类型是什么？”，因为js的变量是没有类型的。相反，他会询问“变量里值的类型是什么？”

```js
var a = 42;
typeof a; // "number"

a = true;
typeof a; // "boolean"
```

typeof运算符始终返回一个字符串。所以：

```js
typeof typeof 42; // "string"
```

首先 `typeof 42` 返回 `"number"`, 然后 `typeof "number"` 就是 `"string"`.

### `undefined` vs "undeclared"

当前不存在值的变量，实际上有个`undefined`值。对这个变量使用`typeof`，会返回`"undefined"`:

```js
var a;

typeof a; // "undefined"

var b = 42;
var c;

// later
b = c;

typeof b; // "undefined"
typeof c; // "undefined"
```

大多数的开发者会把“undefined”这个认为是同义词的“undeclared”，这似乎很诱人。但是，在js中，这两个概念完全不同。

"undefined"变量是指他在可访问的范围内已经声明了变量，但是此时还没有其他的值。相比之下，“undeclared”变量是指未在可访问范围内正式声明的变量。

考虑下:

```js
var a;

a; // undefined
b; // ReferenceError: b is not defined
```

令人讨厌的混淆是浏览器为此条件分配的错误消息。正如你所看到的，消息是“b is not defined”，当然，这就很容易使得混淆“b is undefined”变得非常容易且合理。再次声明，“undefined”和“is not defined”是完全不同的东西。如果浏览器说“b is not found”或“b is not declared”这样的话，可以减少这种困惑！

还有一种与`typeof`相关的特殊行为, 与未声明的变量有关，甚至进一步加剧了混乱。

```js
var a;

typeof a; // "undefined"

typeof b; // "undefined"
```

`typeof`操作符返回"undefined"即使这个变量是"undeclared"(或"not defined")。注意，当我们执行`typeof b`的时候，即使`b`是未声明的变量，他也不会抛出错误消息。这是 `typeof` 的一种特殊的安全防卫行为。

和上面类似地，要是 `typeof` 与未声明变量一起使用时返回“undeclared”就好了，而不是把结果值与不同的“undefined”情况混在一起。

### `typeof` Undeclared

然而，当在浏览器中处理JavaScript时，这个安全防护是一个有用的功能，其中多个脚本文件可以将变量加载到共享的全局命名空间中。

**注意:** 许多开发人员认为全局命名空间中永远不应该有任何变量，并且所有内容都应该包含在模块和私有/独立命名空间中。这在理论上是伟大的，但在实践中几乎是不可能的;这还得作为一个目标继续努力！幸运的是，ES6增加了对模块的更好的支持，最终将使这个理论这更加实用。

举个简单的例子，假设程序中有一个“调试模式”，它由一个名为DEBUG的全局变量（标志）控制。在执行调试任务（如将消息记录到控制台）之前，你需要检查是否已声明该变量。顶层的全局变量`var DEBUG = true`声明仅包含在“debug.js”文件中，你只在开发/测试时加载到浏览器中，而不是在生产中。

但是，你必须注意如何在其余的应用程序代码中检查全局`DEBUG`变量，以便不抛出`ReferenceError`。在这种情况下，`typeof`上的安全防护就显得很友好。

```js
// 这里会抛出错误!
if (DEBUG) {
	console.log( "Debugging is starting" );
}

// 这个是否存在的检查是安全的
if (typeof DEBUG !== "undefined") {
	console.log( "Debugging is starting" );
}
```

即使你没有处理用户定义的变量（如DEBUG），这种检查也很有用。如果你正在对内置API进行功能检查，你可能会发现在不抛出错误的情况下进行检查很有帮助：

```JS
if (typeof atob === "undefined") {
	atob = function() { /*..*/ };
}
```

**注意：** 如果你需要为不存在的功能添加一个“polyfill”，你可能想避免使用`var`去声明`atob`。如果你在`if`语句里声明`var atob`,这个声明会提升(查看本系列的 *Scope & Closures*)到作用域顶层，即使这个`if`条件不通过(因为全局的atob已经存在！)。在某些浏览器和某些特殊类型的全局内置变量（通常称为“主机对象”）中，此重复声明可能会引发错误。`var`可以阻止这个提升的声明。

另一种不带有 `typeof` 的安全保护特性而对全局变量进行这些检查的方法是，将所有的全局变量作为全局对象的属性来观察，在浏览器中这个全局对象基本上是 `window` 对象。所以，上面的检查可以这样完成(非常安全)：

```js
if (window.DEBUG) {
	// ..
}

if (!window.atob) {
	// ..
}
```

这与引用未声明的变量不同，如果尝试访问不存在的对象属性（甚至在全局`window`对象上），不会引发`ReferenceError`。

另一方面，一些开发人员希望避免使用`window`手动引用全局变量，特别是当你的代码需要运行在多种 JS 环境中时（例如不仅是在浏览器中，还在服务器端的 node.js 中），全局对象可能并不都是`window`。

在技术上，`typeof`的安全保护也很有用，即使你没有使用全局变量。尽管这些情况不常见，而且一些开发人员可能会发现这种设计方法不太理想。想象下你有个工具函数，你希望他人复制黏贴到他们的程序或模块中，你想要检查这个程序(模块中)是否已经包含了某个变量(这样你可以直接使用)：

```js
function doSomethingCool() {
	var helper =
		(typeof FeatureXYZ !== "undefined") ?
		FeatureXYZ :
		function() { /*.. 自己默认的功能 ..*/ };

	var val = helper();
	// ..
}
```

`doSomethingCool()`对`FeatureXYZ`变量进行了检测，如果存在，就使用它，如果不存在，就使用自己的。现在，如果有人在他们的模块/程序中包含此实用程序，它会安全地检查是否已定义`FeatureXYZ`：

```js
// an IIFE (see "Immediately Invoked Function Expressions"
// discussion in the *Scope & Closures* title of this series)
(function(){
	function FeatureXYZ() { /*.. my XYZ feature ..*/ }

	// include `doSomethingCool(..)`
	function doSomethingCool() {
		var helper =
			(typeof FeatureXYZ !== "undefined") ?
			FeatureXYZ :
			function() { /*.. default feature ..*/ };

		var val = helper();
		// ..
	}

	doSomethingCool();
})();
```

这里，`FeatureXYZ`并不是一个全局变量，但是我们仍然使用`typeof`去进行安全的检测保证安全，而且重要的是，这里没有我们可以使用的对象(就像我们使用 `window.___` 对全局变量做的那样),所以`typeof`十分的有帮助。

其他开发人员更喜欢称为“依赖注入”的设计模式，而不是在`doSomethingCool()`隐式检查`FeatureXYZ`是否在其外部/周围定义，它需要显式传入依赖，如：

```js
function doSomethingCool(FeatureXYZ) {
	var helper = FeatureXYZ ||
		function() { /*.. default feature ..*/ };

	var val = helper();
	// ..
}
```

设计此类功能时有很多的选择。这里没有一种模式是“正确的”或“错误的” - 每种方法都有各种权衡。但总的来说，`typeof` 的未声明安全保护给了我们更多选项，这还是很不错的。

### Review

JavaScript有七种内置类型：`null`, `undefined`, `string`, `number`, `boolean`, `symbol`, `object`。他们可以通过`typeof`来识别。

变量没有类型，但变量中的值有。这些类型定义值的内有行为。

许多开发人员会认为“undefined”和“undeclared”大致相同，但在JavaScript中，它们却完全不同。`undefined`可以是一个声明的变量所持有的值，“Undeclared”表示变量还没有被声明。

不幸的是，JavaScript有点混淆了这两个术语，不仅包括它的错误消息（“ReferenceError：a is not defined”），还包括`typeof`的返回值，对于这两种情况都是`"undefined"`。

但是，在某些情况下，使用`typeof`针对未声明变量的类型的安全防护（防止错误）可能会有所帮助。