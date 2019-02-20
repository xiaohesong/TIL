# You Don't Know JS: *this* & Object Prototypes

# Chapter 1: `this` Or That?

JavaScript中最使人困惑的机制之一是`this`关键字。它是一个特殊的标识符关键字，自动定义在每个函数的作用域中，但是它所指代的东西甚至会困扰经验丰富的JavaScript开发人员。

> 任何足够先进的技术都与魔术无法区分。 --Arthur C. Clarke

Javascript的`this`机制实际上并没有那么先进，但是开发人员经常在自己的头脑中通过插入“复杂”或“混乱”来解释这句话，毫无疑问，如果没有明确的理解，在 *你的* 困惑中，`this`看起来完全是不可思议的。

**注意：** “this”这个词在一般话语中是一个非常普遍的代名词。因此，确定我们是使用“this”作为代词，还是使用它来指代实际的关键字标识符是非常困难的，尤其是在口头上。为了清楚起见，我将始终使用`this`来引用特殊的关键字，“this”或 *this* 或 this。

## Why `this`?

如果`this`机制是如此令人困惑，甚至对于经验丰富的JavaScript开发人员来说也是一样，人们可能会好奇为什么它还那么有用？这是不是太麻烦了?在我们讨论 *如何做* 之前，我们应该先研究一下 *为什么* 。

让我们试着说明`this`的动机和效用：

```js
function identify() {
	return this.name.toUpperCase();
}

function speak() {
	var greeting = "Hello, I'm " + identify.call( this );
	console.log( greeting );
}

var me = {
	name: "Kyle"
};

var you = {
	name: "Reader"
};

identify.call( me ); // KYLE
identify.call( you ); // READER

speak.call( me ); // Hello, I'm KYLE
speak.call( you ); // Hello, I'm READER
```

如果这个片段是因为 *如何做* 让你感到困惑，请不要担心！我们很快就会谈到这一点。只是暂时将这些问题放在一边，这样我们就可以更清楚地了解 *为什么* 。

此代码片段允许对多个上下文（`me`和`you`）对象复用`identify()`和`speak()`函数，而不需要为每个对象使用单独的函数版本。

你可以将上下文对象显式传递给`identify()`和`speak()`，而不是依赖于`this`。

```js
function identify(context) {
	return context.name.toUpperCase();
}

function speak(context) {
	var greeting = "Hello, I'm " + identify( context );
	console.log( greeting );
}

identify( you ); // READER
speak( me ); // Hello, I'm KYLE
```

但是，`this`机制提供了一种更优雅的方式来隐式“传递”对象引用，从而实现更清晰的API设计和更容易的重用。

你的使用模式越复杂，你就会越清楚地看到，作为显式参数传递上下文通常比传递`this`上下文更加混乱。当我们研究对象和原型时，你将看到一组函数能够自动引用适当的上下文对象，这对你很有帮助。

## Confusions

我们很快就会开始解释`this`是如何运作的，但首先我们必须消除一些关于它的误解：它是如何不起作用的。

当开发人员尝试从字面上考虑它时，“this”这个名称会造成混乱。通常假设有两种含义，但两者都是不正确的。

### Itself

第一个常见的诱导是假设`this`指的是函数本身。至少，这是一个合理的语法推断。

你为什么要从内部引用一个函数？最常见的原因是递归（从内部调用函数）或者有一个事件处理程序，它可以在第一次调用时解除绑定。

新接触JS机制的开发人员通常认为将函数作为对象引用（JavaScript中的所有函数都是对象！）允许你在函数调用之间存储状态（属性中的值）。虽然这当然是可能的，并且用途有限，但本书的其余部分将阐述许多其他模式，以便在函数对象之外更好的存储状态。

但在这一刻，我们将探讨这个模式，以说明`this`不会让一个函数像我们假设的那样获得对自身的引用。

考虑以下代码，我们尝试跟踪调用函数（`foo`）的次数：

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 0 -- WTF?
```

`foo.count`仍为`0`，即使四个`console.log`语句清楚地表明`foo(..)`实际上被调用了四次。这种挫折源于对`this`（在`this.count++`中）的含义的过于直白的解释。

当代码执行`foo.count = 0`时，实际上它正在向函数对象`foo`添加属性`count`。但是对于函数内部的`this.count`引用，`this`实际上并不是指向该函数对象，因此即使属性名称相同，根对象也会不同，并且会产生混淆造成混乱。

**注意：** 一个负责任的开发人员应该问到这一点，“如果我正在增加一个`count`属性，但它不是我所期望的，我在增加哪个`count`？” 事实上，如果她深入挖掘，她会发现她不小心创建了一个全局变量`count`（参见第2章，了解它是 *如何* 发生的！），它目前的值为`NaN`。当然，一旦她发现了这种奇特的结果，她就会有另外一套问题：“它是如何导致全局性的，为什么它最终会导致NaN而不是一些适当的计数值呢？” （见第2章）。

许多开发人员没有停留在这一点上，深入探究为什么`this`引用的行为不像 *预期* 的那样，也没有回答那些棘手但重要的问题，而是完全避免了这个问题，并尝试其他解决方案，例如创建另一个对象来保存`count`属性：

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	data.count++;
}

var data = {
	count: 0
};

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( data.count ); // 4
```

虽然这种方法确实“解决”了这个问题，但不幸的是它忽略了真正的问题 -- 缺乏理解`this`意味着什么以及它是如何工作的 -- 而是回到了一个更熟悉的机制的舒适区：词法作用域。

**注意：** 词法作用域是一个非常精细和有用的机制;无论如何，我并没有贬低它的使用（参见本书系列的“*Scope & Closures*”标题）。但是不断地猜测如何使用`this`，而且通常是 *错误* 的，这并不是一个退回到词法作用域的好理由，并且永远不会知道为什么`this`会让你失望。

要从内部引用函数对象，`this`本身通常是不够的。你通常需要通过指向它的词法标识符（变量）来引用函数对象。

考虑这两个函数:

```js
function foo() {
	foo.count = 4; // `foo` refers to itself
}

setTimeout( function(){
	// anonymous function (no name), cannot
	// refer to itself
}, 10 );
```

在第一个函数中，称为“命名函数”，`foo`是一个可用于从内部引用函数的引用。

但是在第二个例子中，传递给`setTimeout(..)`的函数回调没有名称标识符（所谓的“匿名函数”），所以没有正确的方法来引用函数对象本身。

**注意：** 旧的方法，但现在已弃用，不赞成使用`arguments.callee`的引用 *也* 指向当前正在执行的函数的函数对象。此引用通常是从内部访问匿名函数对象的唯一方法。然而，最好的方法是完全避免使用匿名函数，至少对于那些需要自引用的函数，而是使用命名函数（表达式）。`arguments.callee`已弃用，不应使用。

因此，我们运行示例的另一个解决方案是在每个地方使用`foo`标识符作为函数对象引用，而根本不使用`this`，这*有效* ：

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	foo.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

然而，这种方法同样也回避了对`this`的实际理解，并且完全依赖于变量`foo`的词法作用域。

另一种解决问题的方法是强制`this`去指向`foo`函数对象：

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	// Note: `this` IS actually `foo` now, based on
	// how `foo` is called (see below)
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		// using `call(..)`, we ensure the `this`
		// points at the function object (`foo`) itself
		foo.call( foo, i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

**我们并没有回避`this`，而是接受它。** 我们将稍微解释一下这种技术是 *如何* 更全面地工作的，因此，如果你仍然感到有点困惑，请不要担心！

### Its Scope

关于`this`含义的下一个最常见的误解是它以某种方式引用了函数的作用域。这是一个棘手的问题，因为在某种意义上说是正确的，但从另一个意义上说，它是相当误导人的。

要明确的是，`this`并不以任何方式引用函数的 **词法作用域** 。确实，在内部，作用域有点像具有每个可用标识符的属性的对象。但是JavaScript代码无法访问作用域“对象”。它是引擎实现的内部部分。

考虑那些试图(并且失败了!)跨越边界的代码，并使用它隐式地引用函数的词法作用域:

```js
function foo() {
	var a = 2;
	this.bar();
}

function bar() {
	console.log( this.a );
}

foo(); //undefined
```

这个片段中有不止一个错误。虽然看起来有些做作，但是你看到的这个代码是在公共社区帮助论坛中交换的真实代码的精华。这是一个极好的(如果不是悲哀的话)例证，说明这种假设可能会多么误导人。

首先，尝试通过`this.bar()`引用`bar()`函数。几乎可以肯定它是 *碰巧* 有效的，但我们很快就会解释它是*如何*工作的。调用`bar()`最自然的方法就是省略前面的`this.`并只是对标识符进行词法引用。

但是，编写此类代码的开发人员正在尝试使用`this`来创建`foo()`和`bar()`的词法作用域之间的桥梁，以便`bar()`可以访问`foo()`内部作用域内的变量`a`。**这样的桥梁是可能的。** 不能使用`this`引用在词法作用域内查找内容。这不可能。

每当你觉得自己试图将词法作用域查找与`this`混合时，请提醒自己：*没有桥梁*。

## What's `this`?

抛开各种不正确的假设，现在让我们把注意力转向`this`机制是如何工作的。

我们之前说过，`this`不是编写时绑定，而是运行时绑定。它是基于函数调用条件的上下文。`this`绑定与声明函数的位置无关，而是与调用函数的方式有关。

调用函数时，会创建激活记录，也称为执行上下文。此记录包含有关调用函数的位置（调用堆栈），调用函数的 *方式* ，传递的参数等信息。这个记录的一个属性是`this`引用，它将在函数执行期间使用。

在下一章中，我们将学习如何找到一个函数的 **调用端** 来确定它的执行将如何绑定`this`。

## Review (TL;DR)

对于没有花时间了解`this`机制实际工作原理的JavaScript开发人员来说，`this`绑定是一个造成困惑的常见原因。对于 `this` 这么重要的机制来说，猜测、试错、或者盲目地从 Stack Overflow 的回答中复制粘贴，都不是有效或正确利用它的方法。

要学习`this`，你首先必须了解`this`不是什么，尽管任何假设或误解可能会引导你走上那些道路。`this`既不是函数本身的引用，也不是对函数 *词法作用域* 的引用。

`this`实际上是一个在调用函数时产生的绑定，它引用的内容完全由调用函数的调用端决定。