# You Don't Know JS: Scope & Closures

# Chapter 5: Scope Closure

我们到达这一点时，希望对作用域如何工作有一个非常健康、坚实的理解。

我们将注意力转向一种非常重要但却难以捉摸的，几乎是神话般的部分：**闭包(closure)** 。如果到目前为止你一直在关注我们关于词法作用域的讨论，那么其结果是，闭包将在很大程度上几乎是显而易见的。巫师的幕后有个男人，我们正要去见他。不，他的名字不是Crockford！

如果你对词法作用域有疑问，现在是时候回顾第二章了。

## Enlightenment

对于那些在JavaScript方面有一定经验但可能从未完全掌握闭包概念的人来说，*理解闭包* 似乎是一个必须努力和牺牲才能实现的涅槃。

我记得几年前，我对JavaScript有了很好的了解，但不知道什么是闭包。暗示这门语言还有另外一面，那就是它比我已经拥有的能力还要强大，这让我觉得可笑和嘲弄。我记得读过早期框架的源代码，试图理解它是如何工作的。我记得第一次“模块模式”出现在我的脑海中。我记得 *啊哈* ！瞬间非常生动。

当时我不知道的是，我花了多年时间才明白，以及我希望现在传达给你的是这个秘密：**在JavaScript中，闭包无处不在，你只需要认识并接受它。** 闭包不是一个你必须学习新的语法和模式才能使用的特殊的可选的工具。不，闭包甚至不是你必须学会使用和掌握的武器，就像卢克在原力中训练的那样。

由于编写依赖于词法作用域的代码，闭包产生。他们就这么发生了。你甚至不必故意创建闭包来利用它们。闭包在你的代码中一直被创建和利用。你 *缺少* 的是根据自己的意愿识别，拥抱和利用闭包的正确心理背景。

启蒙时刻应该是：**哦，我的代码已经发生了闭包，我现在终于可以看到了。** 理解闭包就像Neo第一次看到Matrix一样。

## Nitty Gritty

好吧，夸张和对电影的无耻引用够多了。

这里有一个关于理解和识别闭包需要了解的内容的简单定义：

> 闭包是指函数能够记住并访问其词法作用域，即使该函数在其词法作用域之外执行也是如此。

让我们跳到一些代码来说明这个定义。

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a ); // 2
	}

	bar();
}

foo();
```

从我们对嵌套作用域的讨论中看，这段代码应该很熟悉。由于词法作用域查找规则（在这种情况下，它是RHS引用查找），函数`bar()`可以访问外部封闭范围中的变量`a`。

这是“闭包”吗？

嗯，技术上......也许吧。但是根据我们上面你需要知道的定义……*不完全是这样* 。我认为解释`bar()`引用`a`的最准确的方法是通过词法作用域查找规则，这些规则只是（一个重要的！）闭包的 **一部分** 。

从纯学术的角度来看，上面所说的代码片段是函数`bar()`在`foo()`的作用域上有一个闭包（实际上，甚至在它可以访问的其他作用域上，例如在我们的例子中的全局作用域）。换句话说，`bar()`在`foo()`的作用域内关闭。为什么？因为`bar()`嵌套在`foo()`中。简单明了。

但是，以这种方式定义的闭包不是直接可观察的，我们也看不到在那个片段中执行的闭包。我们清楚地看到了词法作用域，但闭包仍然是代码背后的一个神秘的阴影。

然后让我们考虑使闭包充分发挥作用的代码：

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a );
	}

	return bar;
}

var baz = foo();

baz(); // 2 -- Whoa, closure was just observed, man.
```

函数`bar()`具有对`foo()`内部作用域的词法作用域访问。但是，我们采用`bar()`，函数本身，并将其作为值传递。在这种情况下，我们`return`了`bar`引用的函数对象本身。

我们执行`foo()`之后，我们将它返回的值（我们的内部`bar()`函数）赋给一个名为`baz`的变量，然后我们实际是调用`baz()`，这当然是通过一个不同的标识符引用来调用内部函数`bar()`。

`bar()`肯定会被执行。但在这种情况下，它在声明的词法作用域之外执行。

执行`foo()`之后，通常我们会期望`foo()`的整个内部作用域消失，因为我们知道引擎使用了垃圾收集器，并且一旦它不再使用就会释放内存。因为看起来`foo()`的内容已经不再使用，所以很自然的会认为它们已经消失了。

但闭包的“魔力”不会让这种情况发生。事实上，内部作用域仍在“使用中”，因此不会消失。

谁在使用它？**函数`bar()`本身。**

根据声明的位置，`bar()`在`foo()`的内部作用域上有一个词法作用域闭包，使该作用域保持活动状态，以便`bar()`后续随时引用。

**`bar()`仍然有对该作用域的引用，该引用称为闭包。**

因此，几微秒之后，当调用变量`baz`（调用我们最初标记为`bar`的内部函数）时，它可以正常访问在编写时确定的词法作用域，因此它可以像我们期望的那样访问变量`a`。

该函数在其编写时确定的词法作用域之外被很好地调用。**闭包** 让函数继续访问在编写时定义的词法作用域。

当然，函数可以作为值传递，甚至在其他位置调用的各种方法中的任何一种都是观察/执行闭包的例子。

```js
function foo() {
	var a = 2;

	function baz() {
		console.log( a ); // 2
	}

	bar( baz );
}

function bar(fn) {
	fn(); // look ma, I saw closure!
}
```

我们将内部函数`baz`传递给`bar`，并调用该内部函数（现在标记为`fn`），当我们这样做时，通过访问`a`来观察它对`foo()`内部作用域的闭包。

这些函数的传递也可以是间接的。

```js
var fn;

function foo() {
	var a = 2;

	function baz() {
		console.log( a );
	}

	fn = baz; // assign `baz` to global variable
}

function bar() {
	fn(); // look ma, I saw closure!
}

foo();

bar(); // 2
```

无论我们使用什么工具来将内部函数 *传输* 到它的词法作用域之外，它都将维护对它最初声明的位置的作用域引用，无论我们在哪里执行它，这个闭包都将被执行。

## Now I Can See

前面的代码片段有点学术性，并且是人为构造的，以说明使用 *闭包*。但是我向你承诺，这不仅仅是一些很酷的新东西。我承诺在你现有的代码中，闭包肯定是存在的。现在让我们看看真相。

```js
function wait(message) {

	setTimeout( function timer(){
		console.log( message );
	}, 1000 );

}

wait( "Hello, closure!" );
```

我们携带一个内部函数(名为`timer`)并将其传递给`setTimeout(..)`。但是`timer`在`wait(..)`作用域内有一个作用域闭包，确实保留并使用对变量`message`的引用。

在我们执行了`wait(..)`之后的一千毫秒，它的内部作用域应该早就消失了，这个内部函数`timer`在这个作用域上仍然有闭包。

在引擎内部深处，内置实用程序`setTimeout(..)`引用了一些参数，可能称为`fn`或`func`或类似的参数。引擎会调用该函数，该函数调用我们的内部`timer`函数，并且词法作用域引用仍然完好无损。

**Closure.**

或者，如果你是jQuery信徒（或任何JS框架，就此而言）：

```js
function setupBot(name,selector) {
	$( selector ).click( function activator(){
		console.log( "Activating: " + name );
	} );
}

setupBot( "Closure Bot 1", "#bot_1" );
setupBot( "Closure Bot 2", "#bot_2" );
```

我不确定你写的是什么代码，但我通常写一些代码来制整个全球无人机部队的闭包机器人，这完全是真实的！

(有些)开玩笑地说，实际上无论何时何地，只要你将函数(访问它们各自的词法作用域)视为一级值并将其传递，你就会看到这些函数正在执行闭包。无论是计时器、事件处理程序、Ajax请求、跨窗口消息传递、web workers，还是任何其他异步(或同步!)任务，在传递回调函数时，准备抛出一些闭包!

**注意：** 第3章介绍了IIFE模式。虽然人们常说, IIFE (单独) 是观察闭包的一个例子, 但按照我们上面的定义, 我有些不同意。

```js
var a = 2;

(function IIFE(){
	console.log( a );
})();
```

这段代码“有效”，但并不是严格意义上的闭包。为什么？因为函数（我们在这里命名为“IIFE”）不在其词法作用域之外执行。它仍然在声明的相同作用域（也包含`a`的封闭/全局作用域）中被调用。`a`通过正常的词法作用域查找，而不是真正的闭包。

虽然从技术上讲，闭包可能发生在声明时，但并不是严格可见的，因此，正如他们所说，*这是一棵树在森林中倒下，周围没有人听到它* 。

虽然 IIFE 本身并不是闭包的示例, 但它绝对创建了作用域, 并且它是我们用来创建可关闭的作用域的最常见工具之一。因此，IIFE确实与闭包密切相关，即使它们本身不进行闭包。

亲爱的读者，现在就把这本书放下。我有个任务要交给你。打开一些你最近的JavaScript代码。寻找函数作为值，并确定你已经在哪些地方使用闭包，甚至以前可能不知道它。

我会等你。

现在......你明白了！

## Loops + Closure

最常见的用于说明闭包的规范示例涉及到简单的for循环。

```js
for (var i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

**注意：** 当你将函数放入循环中时，Linters经常会抱怨，因为不理解闭包的错误 **在开发人员中非常常见** 。我们在这里解释如何正确地做到这一点，充分利用闭包的全部功能。Linter 通常不理解这样的微妙之处，它们总是会去抱怨，假设你 *实际上* 不知道你在做什么。

这段代码的核心思想是，我们通常期望数字"1","2", .. "5"将被打印出来，一次一个，每秒一个。

实际上，如果运行此代码，则会以1秒的间隔打印出5次“6”。

**啊哈？**

首先，让我们解释一下`6`是怎么来的。循环的终止条件是当`i` *不* `<= 5`时。首先满足的情况为`i`是`6`。因此，输出反映了循环终止后`i`的最终值。

这实际上在第二眼看上去很明显。循环完成后，超时函数回调都运行良好。实际上，随着定时器的运行，即使每次迭代都是`setTimeout(.., 0)`，所有这些函数回调仍然会在循环完成后严格运行，因此每次都打印`6`。

但是这里有一个更深层次的问题。我们的代码中 *缺少* 了什么来让它像我们语义上暗示的那样运行?

缺少的是，我们试图 *暗示* 循环的每个迭代在迭代时“捕获”自己的`i`副本。但是，作用域的工作方式，所有这些函数中的5个，虽然它们是在每个循环迭代中单独定义的，但它们 **都在相同的共享全局作用域内关闭** ，实际上只有一个`i`在其中。

换句话说，当然所有函数都共享对同一个`i`的引用。关于循环结构的一些东西往往会让我们迷惑，认为还有其他更复杂的东西在起作用。那倒不是。如果5个超时回调中的每一个都是一个接一个地声明的，并且根本没有循环，则没有区别。

好的，那么，回到我们的问题。少了什么东西？我们需要更多的 ~~牛铃~~闭包作用域。具体来说，我们需要为循环的每次迭代创建一个新的闭包作用域。

我们在第3章中了解到，IIFE通过声明一个函数并立即执行它来创建作用域。

让我们试一下：

```js
for (var i=1; i<=5; i++) {
	(function(){
		setTimeout( function timer(){
			console.log( i );
		}, i*1000 );
	})();
}
```

这个可以工作吗？试试吧。我会再一次的等待你。

我会为你结束这个悬念。**不能如期工作**。但是为什么? 我们现在显然有了更多的词法作用域。每个超时函数回调实际上都是关闭每个IIFE分别创建的每个迭代作用域。

**如果作用域为空** ，那么仅仅关闭作用域是不够的。仔细看。我们的IIFE只是一个空无所事事的作用域。它需要一些对我们有用的东西。

它需要自己的变量，每次迭代都有一个`i`值的副本。

```js
for (var i=1; i<=5; i++) {
	(function(){
		var j = i;
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})();
}
```

**找到了！可以工作！**

有些人更喜欢的一个小变化是:

```js
for (var i=1; i<=5; i++) {
	(function(j){
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})( i );
}
```

当然，由于这些IIFE只是函数，我们可以传入`i`，如果我们愿意，我们可以称之为`j`，或者我们甚至可以再称它为`i`。无论哪种方式，代码现在都可以使用。

在每个迭代中使用一个IIFE为每个迭代创建了一个新的作用域，这给了超时函数回调关闭每个迭代的一个新作用域的机会，该作用域中有一个变量，其中每个迭代都有一个正确的值供我们访问。

问题解决！

### Block Scoping Revisited

仔细查看我们对先前解决方案的分析。我们使用IIFE来创建每次迭代的新作用域。换句话说，我们实际上需要一个每次迭代的 **块作用域** 。第3章向我们展示了`let`声明，它劫持了一个块并在块中声明了一个变量。

**它本质上把一个块转换成一个我们可以关闭的作用域。** 因此，下面的代码“就很好用”：

```js
for (var i=1; i<=5; i++) {
	let j = i; // yay, block-scope for closure!
	setTimeout( function timer(){
		console.log( j );
	}, j*1000 );
}
```

*但是，这还不是全部！*（用我最棒的Bob Barker声音）。为for循环的头部中使用的`let`声明定义了一个特殊的行为。这种行为表明变量将不仅仅为循环声明一次，**而是每次迭代** 。并且，它将有助于在每次后续迭代中使用上一次迭代结束时的值进行初始化。

```js
for (let i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

这有多酷?块级作用域和闭包携手合作，解决世界上所有的问题。我不知道你是怎么想的，但这让我成为一个快乐的javascript程序员。

## Modules

还有其他代码模式可以利用闭包的功能，但表面上看起来并不是回调。让我们来看看它们中最强大的：*模块* 。

```js
function foo() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}
}
```

正如这段代码所显示的，没有可观察到的闭包发生。我们只是有一些私有数据变量`something`和`another`以及一些内部函数`doSomething()`和`doAnother()`，它们都在`foo()`的内部范围内具有词法范围（因而也就是闭包！）。

但现在考虑下面代码：

```js
function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

这个模式在JavaScript中我们称之为*模块*。实现模块模式的最常见方法通常称为“揭示模块”，这是我们在这里介绍的变体。

我们来看看有关这段代码的一些事情。

首先，`CoolModule()`只是一个函数，但必须调用它才能创建模块实例。如果不执行外部函数，则不会发生内部作用域和闭包的创建。

其次，`CoolModule()`函数返回一个对象，由对象字面量语法`{key: value, ...}`表示。我们返回的对象是对它的内部函数引用，但对内部数据变量没有引用。我们保持这些隐藏和私有。将此对象返回值视为我们 **模块的公共API** 。

此对象返回值最终分配给外部变量`foo`，然后我们可以访问API上的那些属性方法，如`foo.doSomething()`。

**注意：** 我们不需要从模块返回实际对象（字面）。我们可以直接返回一个内部函数。关于这一点，jQuery实际上是一个很好的例子。`jQuery`和`$`标识符是jQuery“模块”的公共API，但它们本身只是一个函数（它本身可以具有属性，因为所有函数都是对象）。

`doSomething()`和`doAnother()`函数对模块“实例”的内部作用域具有闭包(通过实际调用`CoolModule()`而得到)。当我们通过返回的对象上的属性引用将这些函数传输到词法作用域之外时，我们现在已经设置了一个条件，通过该条件可以观察和执行闭包。

更简单地说，模块模式有两个“要求”：

1. 必须有一个外部封闭函数，并且必须至少调用一次(每次创建一个新的模块实例)。
2. 封闭函数必须返回至少一个内部函数，以便该内部函数具有对私有作用域的闭包，并且可以访问和/或修改该私有状态。

仅在其上具有函数属性的对象 *实际上* 不是模块。从函数调用返回的对象只有数据属性，没有闭包的函数，从可观察的意义上说，它不是 *真正* 的模块。

面的代码片段显示了一个名为`CoolModule()`的独立模块创建者，每次创建一个新模块实例时都可以调用它。这种模式的一个细微变化是当你只关心一个实例，一个“单例”的种类：

```js
var foo = (function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
})();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

在这里，我们将模块函数转换为IIFE（参见第3章），我们立即调用它并将其返回值直接分配给我们的单个模块实例标识符`foo`。

模块只是函数，因此它们可以接收参数：

```js
function CoolModule(id) {
	function identify() {
		console.log( id );
	}

	return {
		identify: identify
	};
}

var foo1 = CoolModule( "foo 1" );
var foo2 = CoolModule( "foo 2" );

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```

模块模式的另一个微小但强大的变化是将返回的对象命名为公共API：

```js
var foo = (function CoolModule(id) {
	function change() {
		// modifying the public API
		publicAPI.identify = identify2;
	}

	function identify1() {
		console.log( id );
	}

	function identify2() {
		console.log( id.toUpperCase() );
	}

	var publicAPI = {
		change: change,
		identify: identify1
	};

	return publicAPI;
})( "foo module" );

foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```

通过在模块实例中保留对公共API对象的内部引用，你可以从内部修改该模块实例，包括添加和删除方法，属性以及更改其值。

### Modern Modules

各种模块依赖性加载器/管理器基本上将这种模块定义模式包装成友好的API。不要检查任何一个特定的库，让我提供一个非常简单的概念证明，**仅用于说明目的（仅）：**

```js
var MyModules = (function Manager() {
	var modules = {};

	function define(name, deps, impl) {
		for (var i=0; i<deps.length; i++) {
			deps[i] = modules[deps[i]];
		}
		modules[name] = impl.apply( impl, deps );
	}

	function get(name) {
		return modules[name];
	}

	return {
		define: define,
		get: get
	};
})();
```

这段代码的关键部分是`modules[name] = impl.apply(impl, deps)`。这是调用模块的定义包装函数（传入任何依赖项），并将返回值（模块的API）存储到按名称跟踪的模块的内部列表中。

以下是我如何使用它来定义一些模块：

```js
MyModules.define( "bar", [], function(){
	function hello(who) {
		return "Let me introduce: " + who;
	}

	return {
		hello: hello
	};
} );

MyModules.define( "foo", ["bar"], function(bar){
	var hungry = "hippo";

	function awesome() {
		console.log( bar.hello( hungry ).toUpperCase() );
	}

	return {
		awesome: awesome
	};
} );

var bar = MyModules.get( "bar" );
var foo = MyModules.get( "foo" );

console.log(
	bar.hello( "hippo" )
); // Let me introduce: hippo

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

“foo”和“bar”模块都使用返回公共API的函数定义。“foo”甚至接收“bar”的实例作为依赖参数，并可以相应地使用它。

花点时间检查这些代码片段，以充分理解闭包的强大功能，这些功能可给我们带来好处。关键在于，模块管理器并没有任何特殊的“魔力”。它们满足上面列出的模块模式的两个特征：调用函数定义包装器，并将其返回值保持为该模块的API。

换句话说，模块只是模块，即使你在它们上面放置了一个友好的包装工具。

### Future Modules

ES6为模块概念添加了一流的语法支持。通过模块系统加载时，ES6将文件视为单独的模块。每个模块都可以导入其他模块或特定的API成员，也可以导出自己的公共API成员。

**注意：** 基于函数的模块不是静态识别的模式（编译器知道的模式），因此直到运行时才考虑它们的API语义。也就是说，你可以在运行时去修改模块的API（请参阅前面的`publicAPI`讨论）。

相比之下，ES6模块API是静态的（API在运行时不会更改）。由于编译器知道这一点，它可以（并且确实！）在（文件加载和）编译期间检查对导入模块的API成员的引用实际存在。如果API引用不存在，编译器会在编译时抛出“早期”错误，而不是等待传统的动态运行时解析（以及错误，如果有的话）。

ES6模块 **没有** “内联”格式，必须在单独的文件中定义（每个模块一个）。浏览器/引擎有一个默认的“模块加载器”（可以覆盖，但这超出了我们的讨论范围），它在导入时同步加载模块文件。

考虑下面代码：

**bar.js**

```js
function hello(who) {
	return "Let me introduce: " + who;
}

export hello;
```

**foo.js**

```js
/ import only `hello()` from the "bar" module
import hello from "bar";

var hungry = "hippo";

function awesome() {
	console.log(
		hello( hungry ).toUpperCase()
	);
}

export awesome;
```



```js
// import the entire "foo" and "bar" modules
module foo from "foo";
module bar from "bar";

console.log(
	bar.hello( "rhino" )
); // Let me introduce: rhino

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

**注意：** 需要创建单独的文件“ **foo.js** ”和“ **bar.js** ”，其内容分别如前两个片段所示。然后，你的程序将加载/导入这些模块以使用它们，如第三个片段所示。

`import`将一个或多个成员从模块的API导入当前作用域，每个成员都绑定到一个绑定变量（在我们的例子中是`hello`）。`module`将整个模块API导入绑定变量（在我们的例子中为`foo`，`bar`）。 `export`将标识符（变量，函数）导出到当前模块的公共API。 这些运算符可以根据需要在模块的定义中多次使用。

*模块* 文件中的内容被视为包含在作用域闭包中，就像前面看到的函数闭包模块一样。

## Review (TL;DR)

在未开化的人看来，闭包就像JavaScript内部的一个神秘世界，只有少数最勇敢的灵魂才能到达。它实际上只是我们如何在词法作用域的环境中编写代码的标准且几乎显而易见的事实，其中函数是值并且可以随意传递。

**闭包是函数可以记住并访问其词法作用域，即使它在词法作用域之外被调用。**

如果我们不小心识别它们以及它们是如何工作的，闭包可能会使我们绊倒，例如使用循环。但它们也是一个非常强大的工具，能够以各种形式实现模块之类的模式。

模块需要两个关键特性：1) 调用外部包装函数，以创建封闭作用域 2) 包装函数的返回值必须包含对至少一个内部函数的引用，该函数然后在包装器的私有内部范围内具有闭包。

现在我们可以看到现有代码周围的闭包，我们有能力识别并利用它们来实现我们想要的东西！