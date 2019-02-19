# You Don't Know JS: Scope & Closures

# Chapter 3: Function vs. Block Scope

正如我们在第2章中所探讨的那样，作用域由一系列“气泡”组成，每个气泡都充当容器或桶，其中声明了标识符（变量，函数）。这些气泡整齐地嵌套在彼此之内，这种嵌套在编写时定义。

但到底是什么造成了新的气泡呢？它只是函数吗？ JavaScript中的其他结构可以创建作用域气泡吗？

## Scope From Functions

这些问题最常见的答案是JavaScript具有基于函数的作用域。也就是说，你声明的每个函数都会为自己创建一个气泡，但没有其他结构会创建自己的作用域气泡。正如我们稍后会看到的，这不完全正确。

但首先，让我们探讨函数作用域及其含义。

考虑以下代码：

```js
function foo(a) {
	var b = 2;

	// some code

	function bar() {
		// ...
	}

	// more code

	var c = 3;
}
```

在此代码段中，`foo(..)`的作用域气泡包括标识符`a`，`b`，`c`和`bar`。无论声明在作用域的何处出现，这都 **无关紧要** ，变量或函数都属于包含他的作用域气泡。我们将在下一章探讨它是如何工作的。

`bar(..)`有他自己的作用域气泡。全局作用域也是如此，它只附加了一个标识符：`foo`。

因为`a`，`b`，`c`和`bar`都属于`foo(..)`的作用域气泡，所以它们不能在`foo(..)`之外访问。也就是说，以下代码都会导致`ReferenceError`错误，因为标识符不可用于全局作用域：

```js
bar(); // fails

console.log( a, b, c ); // all 3 fail
```

但是，所有这些标识符（`a`，`b`，`c`，`foo`和`bar`）都可以在`foo(..)`中访问，并且实际上也可以在`bar(..)`中使用（假设`bar(..)`内没有阴影标识符声明）。

函数作用域鼓励将所有变量都属于函数，并且可以在整个函数中使用和重用（甚至可以访问嵌套作用域）。这种设计方法非常有用，当然可以充分利用JavaScript变量的“动态”特性，根据需要采用不同类型的值。

另一方面，如果不采取谨慎的预防措施，跨整个作用域存在的变量可能会导致一些意想不到的坑。

## Hiding In Plain Scope

传统的函数思考方式是声明一个函数，然后在其中添加代码。但反向思维同样强大和有用：接受你编写的任意代码段，并在其周围包装一个函数声明，这实际上“隐藏”了代码。

实际结果是围绕所讨论的代码创建一个作用域气泡，这意味着该代码中的任何声明（变量或函数）现在都将绑定到新包装函数的作用域，而不是以前的封闭作用域。换句话说，你可以通过将变量和函数包含在函数作用域内来“隐藏”它们。

为什么“隐藏”变量和函数是一种有用的技术？

推动这种基于作用域的隐藏有多种原因。它们往往源于软件设计原则“最小特权原则”【注：最小特权】，有时也称为“最小权威”或“最小暴露”。这个原则指出，在软件设计中，例如模块/对象的API，你应该只暴露所需要的最低限度的东西，并“隐藏”其他一切。

该原则扩展到可以选择包含变量和函数的范围。如果所有变量和函数都在全局范围内，那么它们当然可以被任何嵌套范围访问。但这将违反“最少…”原则，因为你（可能）暴露了许多变量或函数，而这些变量或函数在其他情况下应保持私有，因为正确使用代码将不鼓励访问这些变量/函数。

例如：

```js
function doSomething(a) {
	b = a + doSomethingElse( a * 2 );

	console.log( b * 3 );
}

function doSomethingElse(a) {
	return a - 1;
}

var b;

doSomething( 2 ); // 15
```

在这个片段中，`b`变量和`doSomethingElse(..)`函数可能是`doSomething(..)`如何完成其工作的“私有”细节。给予封闭作用域“访问”`b`和`dosomethingelse(..)`不仅是不必要的，而且可能是“危险的”，因为它们可能会以意想不到的方式使用，无论是有意还是无意，这可能违反`dosomething(..)`假设的前提条件。

更“正确”的设计会将这些私有细节隐藏在`doSomething(..)`的作用域内，例如：

```js
function doSomething(a) {
	function doSomethingElse(a) {
		return a - 1;
	}

	var b;

	b = a + doSomethingElse( a * 2 );

	console.log( b * 3 );
}

doSomething( 2 ); // 15
```

现在，`b`和`doSomethingElse(..)`不受任何外部影响，只能由`doSomething(..)`控制。功能和最终结果没有受到影响，但是设计保持细节私有，这通常被认为是更好的软件。

### Collision Avoidance

在作用域内“隐藏”变量和函数的另一个好处是避免两个具有相同名称但不同的预期用法的不同标识符之间的意外冲突。碰撞结果通常会意外地覆盖值。

例如下面代码：

```js
function foo() {
	function bar(a) {
		i = 3; // changing the `i` in the enclosing scope's for-loop
		console.log( a + i );
	}

	for (var i=0; i<10; i++) {
		bar( i * 2 ); // oops, infinite loop ahead!
	}
}

foo();
```

`bar(..)`内部的`i = 3`赋值意外地覆盖了在for循环中在`foo(..)`中声明的`i`。在这种情况下，它将导致无限循环，因为`i`被设置为固定值`3`并且将永远保持`<10`。

`bar(..)`内的赋值需要声明一个局部变量去使用，无论你选择什么名字的标识符。`var i = 3;`将解决这个问题（并将为`i`创建前面提到的“阴影变量”声明）。另一个选项是选择另一个标识符名称，例如`var j = 3;`。但是你的软件设计可能会自然地要求使用相同的标识符名称，因此在这种情况下，利用作用域“隐藏”你的内部声明是你的最佳/唯一选择。

#### Global "Namespaces"

一个特别强的(可能的)变量冲突的例子发生在全局作用域内。加载到程序中的多个库如果没有正确隐藏其内部/私有函数和变量，则很容易相互冲突。

此类库通常将在全局作用域内创建单个变量声明，通常是对象，具有足够唯一的名称。然后，该对象被用作该库的“名称空间”，其中所有特定的功能公开都作为该对象（名称空间）的属性，而不是作为顶级词法作用域标识符本身。

例如下面代码：

```js
var MyReallyCoolLibrary = {
	awesome: "stuff",
	doSomething: function() {
		// ...
	},
	doAnotherThing: function() {
		// ...
	}
};
```

#### Module Management

另一种避免冲突的方法是更现代的“模块”方法，使用各种依赖关系管理器。使用这些工具，没有库可以向全局作用域添加任何标识符，而是需要通过使用依赖关系管理器的各种机制将其标识符显式导入到另一个特定作用域。

应该可以看到，这些工具并不拥有可以避免于词法作用域规则的“魔法”功能。他们只是使用此处所述的作用域规则来强制执行没有标识符注入任何共享作用域，而是保存在私有的，不易碰撞的范围内，这可以防止任何意外的作用域冲突。

因此，如果你愿意，你可以进行防御性编码并获得与依赖项管理器相同的结果，而无需实际使用它们。有关模块模式的更多信息，请参见第5章。

## Functions As Scopes

我们已经看到，我们可以获取任何代码片段并在其周围包装一个函数，并且有效地“隐藏”来自该函数内部作用域内的外部作用域的任何变量或函数声明。

例如下面代码：

```js
var a = 2;

function foo() { // <-- insert this

	var a = 3;
	console.log( a ); // 3

} // <-- and this
foo(); // <-- and this

console.log( a ); // 2
```

虽然这种技术“可以工作”，但它并不一定非常理想。它引入了一些问题。第一个是我们必须声明一个命名函数`foo()`，这意味着标识符名称`foo`本身“污染”封闭范围（在本例中为全局）。我们还必须明确的通过名称调用这个函数(`foo()`)，以便包装的代码执行。

如果函数不需要名称（或者更确切地说，名称没有污染封闭范围），并且函数可以自动执行，那将更为理想。

幸运的是，JavaScript为这两个问题提供了解决方案。

```js
var a = 2;

(function foo(){ // <-- insert this

	var a = 3;
	console.log( a ); // 3

})(); // <-- and this

console.log( a ); // 2
```

让我们分析这里发生了什么。

首先，请注意包装函数语句 以`(function...`而不是`function...`开头。虽然这可能看起来像一个小细节，但它实际上是一个重大变化。该函数不是将函数视为标准声明，而是被视为函数表达式。

**注意：** 区分声明与表达式的最简单方法是在语句中使用"function"一词的位置（不仅仅是一行，而是一个不同的语句）。如果"function"是语句中的第一位，那么它就是一个函数声明。否则，它是一个函数表达式。

在这里，我们可以看到函数声明和函数表达式之间的键差异与将其名称绑定为标识符的位置有关。

比较前两个片段。在第一个片段中，名称`foo`绑定在封闭范围内，我们直接用`foo()`调用它。在第二个片段中，名称`foo`未绑定在封闭范围内，而是仅绑定在其自己的函数内部。

换句话说，函数`foo(){..})`作为表达式，表示标识符`foo`仅在`..`中被找到，而不在外部作用域中。隐藏名称`foo`本身意味着它不会不必要地污染封闭(外围)范围。

### Anonymous vs. Named

你可能最熟悉函数表达式作为回调参数，例如：

```js
setTimeout( function(){
	console.log("I waited 1 second!");
}, 1000 );
```

这称为“匿名函数表达式”，因为`function()...`上没有名称标识符。函数表达式可以是匿名的，但函数声明不能省略名称 - 这将是非法的JS语法。

匿名函数表达式可以快速轻松地键入，许多库和工具都倾向于鼓励这种惯用的代码风格。但是，他们有几个要考虑的缺点：

1. 匿名函数没有在堆栈跟踪中显示的有用名称，这会使调试更加困难。
2. 如果没有名称，如果函数需要引用自身，递归等，则不幸的是需要使用 **弃用** 的`arguments.callee`引用。需要自引用的另一个例子是事件处理函数在触发后想要解除绑定。
3. 匿名函数省略了一个通常有助于提供更易读/可理解的代码的名称。描述性名称有助于自我记录相关代码。

**内联函数表达式** 功能强大且有用 -- 匿名与命名的问题并没有减损这一点。为函数表达式提供一个名称可以非常有效地处理所有这些回调，但没有明显的缺点。最佳做法是始终命名函数表达式：

```js
setTimeout( function timeoutHandler(){ // <-- Look, I have a name!
	console.log( "I waited 1 second!" );
}, 1000 );
```

### Invoking Function Expressions Immediately

```js
var a = 2;

(function foo(){

	var a = 3;
	console.log( a ); // 3

})();

console.log( a ); // 2
```

现在我们通过将它包装在一个`()`中作为表达式，我们可以通过在末尾添加另一个`()`来执行该函数，如`(function foo() {..})()`。第一个封闭`()`使函数成为表达式，第二个`()`执行函数。

这种模式非常普遍，几年前社区同意了一个术语：**IIFE** ，代表立即调用函数表达式(**I**mmediately **I**nvoked **F**unction **E**xpression)。

当然，IIFE不需要名称 - IIFE最常见的形式是使用匿名函数表达式。虽然肯定不太常见，但命名IIFE与匿名函数表达式相比具有上述所有优点，因此采用它是一种很好的做法。

```js
var a = 2;

(function IIFE(){

	var a = 3;
	console.log( a ); // 3

})();

console.log( a ); // 2
```

传统的IIFE形式略有不同，有些人更喜欢:`(function() {..}())`。仔细观察看看差异。在第一种形式中，函数表达式包装在`()`中，然后调用`()`位于它之外的右侧。在第二种形式中，调用`()`移动到外部`()`包装对的内部。

这两种形式的功能相同。**这纯粹是你喜欢的风格选择。**

IFE的另一个变体很常见，就是使用它们实际上只是函数调用并传入参数的事实。

例如：

```js
var a = 2;

(function IIFE( global ){

	var a = 3;
	console.log( a ); // 3
	console.log( global.a ); // 2

})( window );

console.log( a ); // 2
```

我们传入`window`对象引用，但是我们将参数命名为`global`，以便我们对全局引用和非全局引用有明确的风格描述。当然，你可以从所需的封闭范围传入任何内容，并且可以将参数命名为适合你的任何内容。这主要是风格选择。

此模式的另一个应用程序解决了一个小问题，即默认的`undefined`标识符可能会错误地覆盖其值，从而导致意外结果。通过命名参数`undefined`，但不传递该参数的任何值，我们可以保证`undefined`的标识符实际上是代码块中的未定义值：

```js
undefined = true; // setting a land-mine for other code! avoid!

(function IIFE( undefined ){

	var a;
	if (a === undefined) {
		console.log( "Undefined is safe here!" );
	}

})();
```

IIFE的另一种变体反转了事物的顺序，其中执行的函数在调用之后被赋予第二个，并且参数传递给它。此模式用于UMD（Universal Module Definition —— 统一模块定义）项目。有些人觉得理解起来更简洁，虽然它稍微冗长一点。 

```js
var a = 2;

(function IIFE( def ){
	def( window );
})(function def( global ){

	var a = 3;
	console.log( a ); // 3
	console.log( global.a ); // 2

});
```

`def`函数表达式在片段的后半部分中定义，然后作为参数（也称为`def`）传递给片段前半部分中定义的IIFE函数。最后，调用参数`def`（函数），将`window` 作为`global`参数传递。

## Blocks As Scopes

虽然函数是最常见的作用域单元，当然也是大多数JS中最广泛使用的设计方法，但是其他作用域单元是可能的，使用这些其他作用域单元可以得到更好、更干净的代码维护。

JavaScript以外的许多语言都支持块级作用域，因此这些语言的开发人员习惯于思维模式，而那些主要只使用JavaScript的人可能会发现这个概念略显陌生。

但是，即使你从未以块级作用域的方式编写过一行代码，你可能仍然熟悉JavaScript中这一极其常见的习惯用法：

```js
for (var i=0; i<10; i++) {
	console.log( i );
}
```

我们直接在for循环上声明了变量`i`，很可能是因为我们的意图是仅在for循环的上下文中使用`i`，并且基本上忽略了变量实际上将其自身作用域限定为封闭范围（函数或全局）的事实。

这就是块级作用域内的全部内容。尽可能地将变量声明为尽可能接近其使用位置的局部变量。另一个例子：

```js
var foo = true;

if (foo) {
	var bar = foo * 2;
	bar = something( bar );
	console.log( bar );
}
```

我们只在if语句的上下文中使用`bar`变量，所以我们会在if块中声明它是有道理的。但是，当使用`var`时，我们声明变量的位置并不相关，因为它们总是属于封闭范围。由于风格上的原因，这个代码片段本质上是“伪”块作用域，并依赖于自我实现，以避免在该作用域的其他地方意外使用`bar`。

块范围是一种工具，用于将早期的“最小 ~~特权~~ 暴露原则”[^ note-leastprivilege]从隐藏信息中扩展到函数中，以隐藏代码块中的信息。

再次考虑for循环示例：

```js
for (var i=0; i<10; i++) {
	console.log( i );
}
```

为什么用只用于for循环（或者至少只用于for循环）的`i`变量污染函数的整个作用域？

但更重要的是，开发人员可能更喜欢自己检查，以防意外地（重新）使用超出其预期用途的变量，例如，如果尝试在错误的位置使用未知变量，则会对其发出错误消息。`i`变量的块作用域（如果可能的话）将使`i`仅用于for循环，如果在函数中的其他位置访问`i`，则会导致错误。这有助于确保变量不会以令人困惑或难以维护的方式重复使用。

但是，可悲的现实是，从表面上看，JavaScript没有块作用域的功能。

也就是说，直到你进一步挖掘(深入)。

### `with`

我们在第2章中学到了`with`。虽然它是一个不受欢迎的构造，但它是块作用域(一种形式)的一个例子，因为从对象创建的作用域仅存在于`with`语句的生命周期中，而不存在于封闭作用域中。

### `try/catch`

ES3中的javascript在`try/catch`的`catch`子句中指定了变量声明，该声明的块作用域为`catch`块。

例如：

```js
try {
	undefined(); // illegal operation to force an exception!
}
catch (err) {
	console.log( err ); // works!
}

console.log( err ); // ReferenceError: `err` not found
```

如你所见，`err`仅存在于`catch`子句中，并在你尝试在其他位置引用时抛出错误。

**注意：** 虽然已经指定了这种行为，并且几乎适用于所有标准JS环境（可能是旧的IE除外），但是如果在同一作用域内有两个或多个`catch`子句，每个子句都用相同的标识符名称声明其错误变量，那么许多linter似乎仍然会抱怨。这实际上不是一个重新定义，因为变量是安全的块作用域的，但是linters似乎仍然在抱怨这个事实，这很烦人。

为了避免这些不必要的警告，一些开发人员会将其捕获变量命名为`err1`，`err2`等。其他开发人员将关闭对重复变量名的linting检查。

`catch`的块作用域特性看起来似乎是一个无用的学术事实，但是有关它到底有多有用的更多信息，请参见附录B。

### `let`

到目前为止，我们已经看到JavaScript只有一些奇怪的小众行为，它们暴露了块作用域功能。如果这就是我们所拥有的，并且已经存在了很多年，那么块作用域界定对于JavaScript开发人员来说并不是非常有用。

幸运的是，ES6对此进行了更改，并引入了一个新的关键字`let`，它与`var`一起作为声明变量的另一种方式。

`let`关键字将变量声明附加到它包含的任何块（通常是`{..}`对）的作用域内。换句话说，`let`隐式劫持任何块作用域的变量声明。

```js
var foo = true;

if (foo) {
	let bar = foo * 2;
	bar = something( bar );
	console.log( bar );
}

console.log( bar ); // ReferenceError
```

使用`let`将变量附加到现有块有点含蓄。如果你没有仔细注意哪些块的变量作用域仅限于这些块，并且在开发和演进代码时习惯于四处移动块，将它们包装在其他块中，那么你可能会感到困惑。

为块作用域创建显式块可以解决其中一些问题，使得变量附加的位置更加明显。通常，显式代码优于隐式或细微代码。这种显式的块作用域风格很容易实现，并且更自然地适用于块作用域在其他语言中的工作方式：

```js
var foo = true;

if (foo) {
	{ // <-- explicit block
		let bar = foo * 2;
		bar = something( bar );
		console.log( bar );
	}
}

console.log( bar ); // ReferenceError
```

我们可以创建一个任意块, `let`绑定到只需包含` {..} `，任何语句都是有效的语法。在这种情况下，我们已经在if语句中创建了一个显式块，在重构过程中，它作为一个整体块更容易移动，而不会影响封闭if语句的位置和语义。

**注意：** 有关表达显式块作用域的另一种方法，请参阅附录B.

在第4章中，我们将讨论提升问题，该问题涉及声明在其发生的整个作用域内存在。

但是，使用`let`进行的声明不会提升到它们出现的块的整个作用域。在声明语句之前，此类声明不会在块中明显“存在”。

```js
{
   console.log( bar ); // ReferenceError!
   let bar = 2;
}
```

#### Garbage Collection

块作用域很有用的另一个原因是与闭包和回收内存的垃圾收集有关。我们将在这里简要说明，但关闭机制将在第5章中详细解释。

考虑下面代码：

```js
function process(data) {
	// do something interesting
}

var someReallyBigData = { .. };

process( someReallyBigData );

var btn = document.getElementById( "my_button" );

btn.addEventListener( "click", function click(evt){
	console.log("button clicked");
}, /*capturingPhase=*/false );
```

`click`函数单击处理程序回调根本不需要`someReallyBigData`变量。这意味着，理论上，在`process`运行之后，这个消耗巨大内存的数据结构可被作为垃圾回收。但是，JS引擎很可能（尽管这依赖于实现）仍然必须保持结构，因为`click`函数在整个作用域内都有一个闭包。

块作用域可以解决这个问题，使引擎更清楚，它不需要保持`someReallyBigData`：

```js
function process(data) {
	// do something interesting
}

// anything declared inside this block can go away after!
{
	let someReallyBigData = { .. };

	process( someReallyBigData );
}

var btn = document.getElementById( "my_button" );

btn.addEventListener( "click", function click(evt){
	console.log("button clicked");
}, /*capturingPhase=*/false );
```

为要本地绑定到的变量声明显式块是一个功能强大的工具，可以添加到代码工具箱中。

#### `let` Loops

正如我们之前讨论的那样，使`let`发光的特殊情况是for-loop情况。

```js
for (let i=0; i<10; i++) {
	console.log( i );
}

console.log( i ); // ReferenceError
```

for循环头中的`let`不仅将`i`绑定到for循环体，而且事实上，它将 **重新绑定** 到循环的每个迭代，确保从它的末尾重新赋值为前一个循环迭代的值。

这是说明发生的每次迭代绑定行为的另一种方式：

```js
{
	let j;
	for (j=0; j<10; j++) {
		let i = j; // re-bound for each iteration!
		console.log( i );
	}
}
```

当我们讨论闭包时，第5章将清楚地说明这种每次迭代绑定的有趣之处。

因为`let`声明附加到任意块上，而不是附加到封闭函数的作用域(或全局)上，所以存在这样的问题:现有代码隐藏地依赖于函数作用域的`var`声明，用`let`替换`var`在重构代码时可能需要额外的小心。

考虑下面代码：

```js
var foo = true, baz = 10;

if (foo) {
	var bar = 3;

	if (baz > bar) {
		console.log( baz );
	}

	// ...
}
```

此代码很容易重新考虑为：

```js
var foo = true, baz = 10;

if (foo) {
	var bar = 3;

	// ...
}

if (baz > bar) {
	console.log( baz );
}
```

但是，在使用块作用域变量时要小心这些更改：

```js
var foo = true, baz = 10;

if (foo) {
	let bar = 3;

	if (baz > bar) { // <-- don't forget `bar` when moving!
		console.log( baz );
	}
}
```

有关替代（更明确）的块作用域样式，请参阅附录B，这样可以提供更易于维护/重构的代码，这些代码对这些场景更加健壮。

### `const`

除了`let`之外，ES6还引入了`const`，它也创建了一个块作用域的变量，但其值是固定的（常量）。任何在创建以后更改该值的尝试都会导致错误。

```js
var foo = true;

if (foo) {
	var a = 2;
	const b = 3; // block-scoped to the containing `if`

	a = 3; // just fine!
	b = 4; // error!
}

console.log( a ); // 3
console.log( b ); // ReferenceError!
```

## Review (TL;DR)

函数是JavaScript中最常见的作用域单位。在另一个函数中声明的变量和函数本质上是“隐藏”在任何封闭的“范围”中的，这是良好软件的一个有意设计原则。

但函数绝不是作用域的唯一单位。块作用域指的是变量和函数可以属于任意块（通常是任何`{..}`对）的代码，而不仅仅是封闭(外围)函数。

从ES3开始，`try/catch`结构在`catch`子句中具有块作用域。

在ES6中，引入了`let`关键字（`var`关键字的表兄弟）以允许在任意代码块中声明变量。`if (..) { let a = 2; }`声明了一个变量`a`，它基本上劫持了`if`的`{..}`块的作用域并将其自身附加到那里。

虽然有些人似乎相信，但不应将块作用域视为`var`函数作用域的彻底替代。这两种功能共存，开发人员可以而且应该使用函数作用域和块作用域技术，分别适合生成更好，更易读/可维护的代码。

[^note-leastprivilege]: [Principle of Least Privilege](http://en.wikipedia.org/wiki/Principle_of_least_privilege)

