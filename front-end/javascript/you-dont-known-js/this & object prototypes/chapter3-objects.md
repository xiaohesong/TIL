# You Don't Know JS: *this* & Object Prototypes

# Chapter 3: Objects

在第1章和第2章中，我们解释了`this`绑定如何根据函数调用的调用位置指向各种对象。但究竟什么是对象，为什么我们需要指向它们呢？我们将在本章详细探讨对象。

## Syntax

对象有两种形式：声明性（字面量）形式和构造形式。

对象的字面量语法如下所示：

```js
var myObj = {
	key: value
	// ...
};
```

构造形式如下所示：

```js
var myObj = new Object();
myObj.key = value;
```

构造的形式和字面量形式产生完全相同的对象。唯一的区别是你可以向字面量声明的添加一个或多个键/值对，而对于构造形式对象，你必须逐个添加属性。

**注意：** 使用“构造的形式”来创建对象是非常罕见的。你几乎总是希望使用字面量语法形式。大多数内置对象也是如此（见下文）。

## Type

对象是构建JS的大部分构建块。它们是JS中的6种主要类型（规范中称为“语言类型”）之一：

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `object`

请注意，简单基本类型（`string`、`number`、`boolean`、`null`、和 `undefined`）本身 **不是** `object`。`null`有时被称为对象类型，但是这种误解源于语言中的错误，该错误导致`typeof null`错误地（并且容易混淆地）返回字符串`"object"`。实际上，`null`是它自己的原始类型。

**这是一个常见的错误陈述，“JavaScript中的所有东西都是一个对象”。这显然不是真的。**

相比之下，*有* 一些特殊的对象子类型，我们可以称之为 *复杂的原始类型* 。

`function`是对象的子类型（技术上是“可调用对象”）。JS中的函数被称为“第一类(first class)”，因为它们基本上只是普通对象（附带了可调用行为语义），因此可以像其他普通对象一样处理它们。

数组也是一种对象形式，具有额外的行为。数组中的内容组织比一般对象更有条理。

### Built-in Objects

还有其他几个对象子类型，通常称为内置对象。对于其中的一些来说，他们的名字似乎暗示他们与他们简单的原语类型对应部分直接相关，但事实上，它们的关系更复杂，我们一会儿就开始探索。

- `String`
- `Number`
- `Boolean`
- `Object`
- `Function`
- `Array`
- `Date`
- `RegExp`
- `Error`

如果你依赖于与其他语言(如Java的String类)的相似性，那么这些内建函数看起来就是实际的类型，甚至是类。

但在JS中，这些实际上只是内置函数。这些内置函数中的每一个都可以用作构造函数（即，使用`new`运算符的函数调用 - 参见第2章），结果是所讨论的子类型的新 *构造* 对象。例如：

```js
var strPrimitive = "I am a string";
typeof strPrimitive;							// "string"
strPrimitive instanceof String;					// false

var strObject = new String( "I am a string" );
typeof strObject; 								// "object"
strObject instanceof String;					// true

// inspect the object sub-type
Object.prototype.toString.call( strObject );	// [object String]
```

我们将在后面的章节中详细介绍`Object.prototype.toString...`的工作原理，但简单地说，我们可以通过借用基本的默认`toString()`方法来检查内部子类型，你可以看到它揭示了`strObject`实际上是由`String`构造函数创建的对象。

原始值`"I am a string"`不是一个对象，它是一个原始的字面量和不可变的值。要对其执行操作，例如检查其长度，访问其各自的字符内容等，需要`String`对象。

幸运的是，语言会在必要时自动将`"string"`原始值强制转换为`String`对象，这意味着你几乎不需要显式创建对象形式。

考虑下面代码：

```js
var strPrimitive = "I am a string";

console.log( strPrimitive.length );			// 13

console.log( strPrimitive.charAt( 3 ) );	// "m"
```

在这两种情况下，我们在字符串原始值上调用属性或方法，引擎会自动将其强制转换为`String`对象，以便属性/方法访问起作用。

当使用诸如`42.359.toFixed(2)`之类的方法时，在数字字面量的原始值`42`和`new Number(42)`对象包装器之间发生相同类型的强制。同样还有对于`"boolean"`基本类型的`Boolean`对象形式。

`null`和`undefined`没有对象包装器形式，只有它们的原始值。相比之下，`Date`值 *只能* 用它们构造的对象形式创建，因为它们没有对应的字面量形式的部分。

`Object`, `Array`, `Function`, 和 `RegExp`(正则表达式)，无论他们使用字面量形式还是构造形式，这些都是对象。在某些情况下，构造的形式在创建时提供的选项确实比对应的字面量形式多。因为对象可以被任意一种方式创建，更简单的字面形式几乎是所有人的首选。**只有在需要额外选项时才使用构造的形式。**

`Error`对象很少在代码中显式创建，但通常在抛出异常时自动创建。它们可以使用构造的形式`new Error(..)`创建，但它通常是不必要的。

## Contents

如前所述，对象的内容由存储在特定命名 *位置* 的值（任何类型）组成，我们称之为属性。

重要的是要注意，虽然我们说“内容”意味着这些值 *实际* 存储在对象内部，但这仅仅是一种外观。引擎以依赖于实现的方式存储值，并且很可能不将它们存储 *在* 某个对象容器中。存储在容器中的 *是* 这些属性名称，它们作为存储值的指针（技术上是 *引用* ）。

考虑下面代码：

```js
var myObject = {
	a: 2
};

myObject.a;		// 2

myObject["a"];	// 2
```

要访问`myObject`中位置`a`的值，我们需要使用`.`运算符或`[]`运算符。`.a`语法通常称为“属性”访问，而`["a"]`语法通常称为“键”访问。实际上，它们都访问相同的 *位置* ，并且将拉出相同的值`2`，因此这些术语可以互换使用。从这里开始，我们将使用最常用的术语“属性访问”。

两种语法之间的主要区别在于`.`运算符后面需要一个与`Identifier`兼容的属性名称，而`[".."]`语法基本上可以将任何UTF-8 / unicode兼容的字符串作为属性的名称。例如，要引用名称`"Super-Fun!"`的属性，你必须使用`["Super-Fun!"]`访问语法，`Super-Fun!`不是有效的`Identifier`属性名称。

此外，由于`[".."]`语法使用字符串的 **值** 来指定位置，这意味着程序可以通过编程方式建立字符串的值，例如：

```js
var wantA = true;
var myObject = {
	a: 2
};

var idx;

if (wantA) {
	idx = "a";
}

// later

console.log( myObject[idx] ); // 2
```

在对象中，属性名称 **始终** 是字符串。如果你使用除`string`(原始类型)之外的任何其他值作为属性，它将首先转换为字符串。这甚至包括通常用作数组索引的数字，因此请注意不要混淆对象和数组之间的数字使用。

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];				// "foo"
myObject["3"];					// "bar"
myObject["[object Object]"];	// "baz"
```

### Computed Property Names

如果需要使用计算表达式值作为键名，如`myObject[prefix+name]`，我们刚才描述的`myObject[..]`属性访问语法非常有用。但是在使用对象字面量语法声明对象时，这并不是很有用。

ES6添加了计算属性名称，你可以在对象字面量声明的键名位置指定由`[]`对包围的表达式：

```js
var prefix = "foo";

var myObject = {
	[prefix + "bar"]: "hello",
	[prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

*计算属性名称* 的最常见用法可能是ES6的`symbol`，我们在本书中不会详细介绍。简而言之，它们是一种新的原始数据类型，具有不透明的不可预测值(技术上是`string`值)。强烈建议你不要使用`Symbol`的 *实际值*（从理论上讲，不同的JS引擎之间可能存在差异），因此`Symbol`的名称，如`Symbol.something`（只是一个名称！），将是你使用的内容：

```js
var myObject = {
	[Symbol.Something]: "hello world"
};
```

### Property vs. Method

一些开发人员喜欢在谈论对象的属性访问时做出区分，如果被访问的值恰好是一个函数。因为很容易把函数看作是 *属于* 对象的，在其他语言中，属于对象的函数（又称“类”）被称为“方法”，所以经常听到“方法访问”而不是“属性访问”。

有趣的是，**规范有同样的区别** 。

从技术上讲，函数从来不“属于”对象，所以说一个恰好在对象引用上被访问的函数自动的成为“方法”，这似乎有点语义学的延伸。

确实 *有* 些函数在其中有`this`引用，*有时* `this`引用 引用了调用端的对象引用。但这种用法实际上并不会使该函数比任何其他函数都更像是一个“方法”，因为`this`在运行时、调用端动态绑定，因此它与对象的关系最多是间接的。

次访问对象上的属性时，都是 **属性访问** ，无论你返回什么类型的值。如果你 *碰巧* 从该属性访问中获得了一个函数，那么在这一点上它并不是一个神奇的“方法”。关于来自属性访问的函数，没有什么特别的（除了前面解释的可能隐含的`this`绑定之外）。

例如：

```js
function foo() {
	console.log( "foo" );
}

var someFoo = foo;	// variable reference to `foo`

var myObject = {
	someFoo: foo
};

foo;				// function foo(){..}

someFoo;			// function foo(){..}

myObject.someFoo;	// function foo(){..}
```

`somefoo`和`myobject.somefoo`只是对同一个函数的两个独立引用，两者都不意味着函数是特殊的或由任何其他对象“拥有”的。如果上面的`foo()`被定义为在其中包含`this`引用，则`myObject.someFoo` *隐式绑定* 将是两个引用之间 **唯一** 可观察的差异。这两种引用都不适合称为“方法”。

**也许有人会说** ，函数不是在定义时 *变成* 方法的，而是在运行时变成方法的，这取决于它在调用端的调用方式(是否使用对象引用上下文——请参阅第2章了解更多细节)。即使这样的解释也有点牵强。

最安全的结论可能是“函数”和“方法”在JavaScript中是可互换的。

**注意：** ES6添加了一个`super`引用，通常将与`class`一起使用（参见附录A）。`super`行为的方式（静态绑定而不是后期`this`绑定）这进一步强调了这样一种观点，即某个地方`super`绑定的函数更像是“方法”而不是“函数”。但同样，这些只是微妙语义(和刻板)的细微差别。

即使你将一个函数表达式声明为对象字面量的一部分，该函数也不会神奇地 *属于* 该对象 - 仍然只是对同一个函数对象的多个引用：

```js
var myObject = {
	foo: function foo() {
		console.log( "foo" );
	}
};

var someFoo = myObject.foo;

someFoo;		// function foo(){..}

myObject.foo;	// function foo(){..}
```

**注意：** 在第6章中，我们将在我们的对象字面量中为`foo: function foo() {..}`声明语法覆盖ES6的简写。

### Arrays

数组也使用`[]`访问形式，但是就像上面所提到的，对于值的存储方式和存储位置，它们的组织结构稍微更为结构化（尽管对存储的值 *类型* 仍然没有限制）。数组假定 *数字索引* ，这意味着值存储在非负整数（如`0`和`42`）的位置（通常称为 *索引* ）。

```js
var myArray = [ "foo", 42, "bar" ];

myArray.length;		// 3

myArray[0];			// "foo"

myArray[2];			// "bar"
```

数组*是*对象，因此即使每个索引都是正整数，你 *也* 可以在数组中添加属性：

```js
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length;	// 3

myArray.baz;	// "baz"
```

请注意，添加命名属性（不管`.`或`[]`运算符语法）不会更改的数组`length`。

你 *可以* 将数组用作普通键/值对象，并且永远不添加任何数字索引，但这是一个坏主意，因为数组具有特定于其预期用途的行为和优化，同样，对于普通对象也是如此。使用对象存储键/值对，使用数组在数字索引处存储值。

**小心** ：如果你尝试向数组添加属性，但属性名称 *看起来* 像数字，它将最终作为数字索引（从而修改数组内容）：

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length;	// 4

myArray[3];		// "baz"
```

### Duplicating Objects

当开发人员开始使用JavaScript语言时，最常需要的特性之一是如何复制对象。看起来应该只需要一个内置的`copy()`方法，对吧？事实证明它比这更复杂，因为默认情况下，复制算法应该是什么并不完全清楚。

例如，考虑以下对象：

```js
function anotherFunction() { /*..*/ }

var anotherObject = {
	c: true
};

var anotherArray = [];

var myObject = {
	a: 2,
	b: anotherObject,	// reference, not a copy!
	c: anotherArray,	// another reference!
	d: anotherFunction
};

anotherArray.push( anotherObject, myObject );
```

`myObject`的 *拷贝* 表示形式究竟应该是什么?

首先，我们应该回答它是 *浅拷贝* 还是 *深拷贝* 。一个 *浅拷贝* 将以新对象上的`a`作为`2`这个值的拷贝而结束，但是`b`、`c`和`d`属性仅作为与原始对象中的引用相同位置的引用。*深拷贝(deep copy)* 不仅会复制`myObject`，还会复制`anotherObject`和`anotherArray`。但是我们有一个问题，即`anotherArray`在其中引用了`anotherObject`和`myObject`，所以 *这些* 对象也应该被复制，而不是保留引用。现在由于循环引用，我们有一个无限循环复制问题。

我们是否应该检测一个循环引用并中断循环遍历(保留深度元素没有完全拷贝)?我们应该出错并完全退出吗?介于二者之间?

此外，还不清楚“拷贝”一个函数意味着什么？有一些技巧，比如提取函数源代码的`toString()`序列化(在不同的实现中有所不同，甚至在所有引擎中都不可靠，这取决于要检查的函数的类型)。

那么我们如何解决所有这些棘手的问题呢？各种JS框架都有自己的解释和决定。但JS应采用哪些（如果有的话）作为 *标准* ？很长一段时间，没有明确的答案。

一个子集解决方案是JSON安全的对象(即，可以序列化为JSON字符串，然后重新解析为具有相同结构和值的对象)可以很容易地使用以下方法复制:

```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

当然，这需要确保你的对象是JSON安全的。在某些情况下，这是小事情。对于其他人来说，这还不够。

同时，浅拷贝是可以理解的并且问题少得多，所以ES6现在已经为此任务定义了`Object.assign(..)`。`Object.assign(..)`将 *目标* 对象作为其第一个参数，并将一个或多个 *源* 对象作为其后续参数。它遍历 *源* 对象上的所有 *可枚举的(enumerable)* (见下文)、*拥有的键(key)* ( **直接呈现的** )并将它们(仅通过`=`赋值)拷贝到 *目标* 。它也很有帮助的返回了 *目标* 对象，可以看下面：

```js
var newObj = Object.assign( {}, myObject );

newObj.a;						// 2
newObj.b === anotherObject;		// true
newObj.c === anotherArray;		// true
newObj.d === anotherFunction;	// true
```

**注意：** 在下一节中，我们将描述“属性描述符(property descriptors)”（属性特征）并显示`Object.defineProperty(..)`的用法。然而，`Object.assign(..)`发生的拷贝纯粹是`=`样式风格的赋值，因此源对象上的属性（如可写）的任何特殊特性 **都不会保留** 在目标对象上。

### Property Descriptors

在ES5之前，JavaScript语言没有为代码提供直接的方式来检查或区分属性的特性，例如属性是否为只读。

但是，从ES5开始，所有属性都是用 **属性描述符** 描述的。

考虑以下代码：

```js
var myObject = {
	a: 2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//    value: 2,
//    writable: true,
//    enumerable: true,
//    configurable: true
// }
```

如你所见，我们的普通对象属性`a`的属性描述符（由于它只用于保存数据值，所以称为“数据描述符”）呈现的内容远不止`value`是`2`的这个。它包括3个其他特征：`writable`, `enumerable`, 和 `configurable`。

虽然我们可以在创建普通属性时看到属性描述符特征的默认值，但是我们可以使用`Object.defineProperty(..)`来添加新属性，或者修改具有所需特征的现有属性(如果它是`configurable`!)

例如：

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: true,
	enumerable: true
} );

myObject.a; // 2
```

使用`defineProperty(..)`，我们以手动的显式方式向`myObject`添加了普通的`a`属性。但是，除非你想要从其正常行为中修改其中一个描述符特征，否则通常不会使用此手动方法。

#### Writable

你更改属性值的能力由`writable`控制。

考虑:

```js
Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3;

myObject.a; // 2
```

如你所见，我们对值的修改就这样默默地失败了。如果我们在`strict mode`下尝试，我们得到了一个错误：

```js
"use strict";

var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3; // TypeError
```

`TypeError`告诉我们不能更改不可写的属性。

**注意：** 我们将在稍后讨论getter/setter，但简单地说，你可以观察到`writable: false`意味着不能更改值，这在某种程度上相当于你定义了一个无操作的setter。实际上，你的无操作的setter在调用时需要抛出一个`TypeError`，才能真正符合`writable: false`。

#### Configurable

只要一个属性当前是可配置的，我们就可以使用相同的`defineproperty(..)`实用程序修改其描述符定义。

```js
var myObject = {
	a: 2
};

myObject.a = 3;
myObject.a;					// 3

Object.defineProperty( myObject, "a", {
	value: 4,
	writable: true,
	configurable: false,	// not configurable!
	enumerable: true
} );

myObject.a;					// 4
myObject.a = 5;
myObject.a;					// 5

Object.defineProperty( myObject, "a", {
	value: 6,
	writable: true,
	configurable: true,
	enumerable: true
} ); // TypeError
```

如果你试图更改不可配置属性的描述符定义，则无论`strict mode`如何，最终的`defineProperty(..)`调用都会导致类型错误。注意：正如您所看到的，将`configurable`更改为`false`是 **单向操作，无法撤消！** 

**注意：** 有一个细微差别的异常需要注意:即使属性已经是`configurable:false`，`writable`总是可以从`true`更改为`false`而不会出错，但如果已经为`false`，则不能变回`true`。

`configurable:false`所做的另一件事是阻止`delete`操作符删除存在的属性。

```js
var myObject = {
	a: 2
};

myObject.a;				// 2
delete myObject.a;
myObject.a;				// undefined

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: false,
	enumerable: true
} );

myObject.a;				// 2
delete myObject.a;
myObject.a;				// 2
```

如你所见，最后一次`delete`调用失败（静默），因为我们使`a`属性不可配置。

`delete`仅用于直接从相关对象中删除对象属性（可以删除）。如果对象属性是对某个对象/函数的最后剩余 *引用* ，并且你将其删除，则会`delete`该引用，现在可以对未引用的 对象/函数 进行垃圾回收。但是，将`delete`视为释放已分配内存的工具(如C/ c++)是 **不** 合适的。`delete`只是一个对象属性删除操作 - 仅此而已。

#### Enumerable

我们将在这里提到的最后的描述符特征（还有另外两个，我们在讨论getter/setter时会很快处理）是`enumerable`。

这个名称可能很明显，但是这个特性控制了属性是否会出现在某些对象属性枚举中，例如`for..in`循环。设置为`false`以防止它显示在此类枚举中，即使它仍然完全可访问。设置为`true`以使其保持存在，可枚举。

所有正常的用户定义的属性都默认为`enumerable`，因为这通常是你所想要的。但是，如果你想要一个特殊属性去隐藏枚举的，请将其设置为`enumerable: false`。

稍后我们将更详细地演示枚举性，因此请在脑海中对这个主题做一个书签。

### Immutability

有时需要无法改变的属性或对象（无论是偶然还是故意）。ES5增加了对各种不同细微差别处理方式的支持。

值得注意的是，**所有** 这些方法都会产生浅的不变性。也就是说，它们仅影响对象及其直接属性特征。如果一个对象具有对另一个对象（数组，对象，函数等）的引用，则该对象的 *内容* 不会受到影响，并且仍然是可变的。

```js
myImmutableObject.foo; // [1,2,3]
myImmutableObject.foo.push( 4 );
myImmutableObject.foo; // [1,2,3,4]
```

我们假设在这个片段中`myImmutableObject`已经被创建并保护为不可变的。但是，也要保护`myImmutableObject.foo`的内容(它自己的对象——数组)，你还需要使`foo`不可变，就要使用以下一个或多个功能。

**注意：** 在JS程序中创建根深蒂固的不可变对象并不十分常见。特殊情况当然需要这样做，但是作为一种通用的设计模式，如果你发现你自己想要密封或冻结所有的对象，你可能需要后退一步，重新考虑你的程序设计，以便对对象值的潜在变化更为稳健。

#### Object Constant

通过组合`writable:false`和`configure:false`，你实际上可以将常量(不能更改、重新定义或删除)创建为对象属性，如:

```js
var myObject = {};

Object.defineProperty( myObject, "FAVORITE_NUMBER", {
	value: 42,
	writable: false,
	configurable: false
} );
```

#### Prevent Extensions

如果要阻止对象添加新属性，但另外保留对象的其余属性，请调用`Object.preventExtensions()`：

```js
var myObject = {
	a: 2
};

Object.preventExtensions( myObject );

myObject.b = 3;
myObject.b; // undefined
```

在`non-strict mode`下，`b`的创建会静默失败；在`strict mode`下，他会抛出`TypeError`。

#### Seal

`object.seal()`创建一个“密封”对象，这意味着它接受一个现有的对象，并在其上调用`object.preventextensions()`，但也将其所有现有属性标记为`configurable:false`。

因此，你不仅不能再添加任何属性，而且还无法重新配置或删除任何现有属性（尽管你仍然可以修改它们的值）。

#### Freeze

`object.freeze()`创建一个冻结对象，这意味着它接受一个现有的对象并在其上调用`object.seal(..)`，但它也将所有“数据访问器”属性标记为`writable: false`，这样它们的值就不会被更改。

这种方法是你可以为对象本身获得的最高级别的不变性，因为它可以防止对对象或其任何直接属性的任何更改(不过，如上所述，任何引用的其他对象的内容都不受影响)。

您可以通过在对象上调用`object .freeze(..)`来“深度冻结”一个对象，然后递归地遍历它引用的所有对象(到目前为止还没有受到影响)，并在它们上调用`object .freeze(..)`。但要小心，因为这可能会影响到你不打算影响的其他（共享）对象。

### `[[Get]]`

关于如何执行属性访问，有一个微妙但重要的细节。

考虑下面代码：

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

`myObject.a`是一个属性访问，但它 *不仅仅* 在`myObject`中查找名称为`a`的属性，就像它看起来一样。

根据规范，上面的代码实际上在`myObject`上执行`[[Get]]`操作（有点像函数调用：`[[Get]]()`）。对象的默认内置`[[Get]]`操作首先检查对象是否有所请求名称的属性，如果找到它，它将相应地返回该值。

但是，`[[Get]]`算法定义了其他重要行为，如果它找 *不* 到所请求名称的属性。我们将在第5章中研究接下来会发生什么（遍历`[[Prototype]]`链，如果有的话）。

但是这个`[[Get]]`操作的一个重要结果是，如果它不能通过任何方式为请求的属性提供一个值，它将返回`undefined`的值。

```js
var myObject = {
	a: 2
};

myObject.b; // undefined
```

此行为与通过标识符名称引用 *变量* 时不同。如果引用在适用的词法作用域查找中无法解析的变量，则结果不会像对象属性那样`undefined`，而是抛出`ReferenceError`。

```js
var myObject = {
	a: undefined
};

myObject.a; // undefined

myObject.b; // undefined
```

从 *值* 的角度来看，这两个引用之间没有区别——它们都会导致`undefined`。然而，下面的`[[Get]]`操作虽然看起来很微妙，但可能对引用`myObject.b`执行的“工作”比对引用`myObject.a`执行的“工作”要多一些。

仅检查值结果，你无法区分属性是否存在并显示保留`undefined`值，或者在`[[Get]]`显式返回某些内容失败后，属性是否不存在且`undefined`为默认返回值。但是，我们将很快看到 *如何* 区分这两个场景。

### `[[Put]]`

由于内部定义的`[[Get]]`操作用于从属性获取值，因此显然还有默认的`[[Put]]`操作。

可能会有人认为，对对象上的属性的赋值只会调用`[[Put]]`来设置或创建相关对象上的属性。但情况比这更微妙。

在调用`[[Put]]`时，它的行为方式因许多因素而异，包括（影响最大）属性是否已存在于对象上。

如果属性存在，则`[[Put]]`算法将粗略的检查：

1. 属性是否是访问器描述符(参见下面的“Getter & Setter”部分)? **如果有，调用setter(如果有的话)。** 
2. 属性是否是`writable`为`false`的数据描述符？**如果是这样，则在`non-strict mode`下静默失败，或在`strict mode`下引发`TypeError`。** 
3. 否则，像平时一样设置现有属性的值。

如果上面提到的问题中的对象上还没有该属性，则`[[Put]]`操作将更加细微和复杂。当我们讨论`[[Prototype]]`时，我们将在第5章重新讨论这个场景，以使其更清晰。

### Getters & Setters

对象的默认`[[Put]]`和`[[Get]]`操作完全控制如何分别将值设置为现有属性、新属性或从现有属性检索值。

**注意：** 使用该语言的未来/高级功能，可以覆盖整个对象（不仅仅是每个属性）的默认[[Get]]或[[Put]]操作。这超出了我们在本书中讨论的范围，但稍后将在“你不了解JS”系列中介绍。

ES5引入了一种方法来覆盖这些默认操作的一部分，而不是在对象级别，而是通过使用getter和setter来实现每个属性级别。Getters是实际调用隐藏的函数来检索值的属性。Setter是实际调用的隐藏函数来设置值的属性。

当你将属性定义为具有getter或setter或两者皆有时，其定义将成为“访问者描述符”（而不是“数据描述符”）。对于访问器描述符，描述符的`value`和`writable`特征没有实际意义并被忽略，而是JS考虑了属性的`set`和`get`特性（以及`configurable`和`enumerable`）。

考虑下面代码：

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

Object.defineProperty(
	myObject,	// target
	"b",		// property name
	{			// descriptor
		// define a getter for `b`
		get: function(){ return this.a * 2 },

		// make sure `b` shows up as an object property
		enumerable: true
	}
);

myObject.a; // 2

myObject.b; // 4
```

要么通过对象字面量语法与`get () {..}`或者通过`defineProperty(..)`的显式定义，在这两种情况下，我们都在对象上创建了一个属性，该属性实际上并不包含值，但是它的访问会自动导致对getter函数的隐式函数调用，它返回的任何值都是属性访问的结果。

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

myObject.a = 3;

myObject.a; // 2
```

由于我们只为`a`定义了getter，如果我们稍后尝试设置`a`的值，set操作不会抛出错误，而只是静默地放弃赋值。即使有一个有效的setter，我们的自定义getter也被硬编码为只返回`2`，所以set操作将是无意义的。

为了使这个场景更合理，还应该使用setter定义属性，setter会覆盖每个属性的默认`[[Put]]`操作(即赋值)，正如你所期望的那样。几乎可以肯定的是，你总是希望同时声明getter和setter(只有其中一个通常会导致意外/令人惊讶的行为):

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return this._a_;
	},

	// define a setter for `a`
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

**注意：** 在这个例子中，我们实际上将赋值（`[[Put]]`操作）的指定值`2`存储到另一个变量`_a_`中。对于这个例子，`_a_`名称纯粹是按惯例的，并且对于它的行为没有任何特别之处 - 它是一个像其他任何一样的普通属性。

### Existence

我们之前说过，如果显式`undefined`存储在那里或者根本不存在`a`属性，那么像`myObject.a`这样的属性访问可能会导致`undefined`的值。那么，如果两种情况下的值相同，我们如何区分它们呢？

我们可以询问一个对象是否有某个属性而 *没有* 要求获得该属性的值：

```js
var myObject = {
	a: 2
};

("a" in myObject);				// true
("b" in myObject);				// false

myObject.hasOwnProperty( "a" );	// true
myObject.hasOwnProperty( "b" );	// false
```

`in`运算符将检查属性是否在对象中，或者它是否存在于`[[Prototype]]`链对象遍历的任何更高级别（参见第5章）。相比之下，`hasOwnProperty(..)`检查是否 *只有* `myObject`具有该属性，并且 *不会* 查询`[[Prototype]]`链。我们将在第5章详细探讨`[[Prototype]]`时，再回头来讨论这两个操作之间的重要区别。

`hasOwnProperty(..)`可以通过对象委托访问所有`Object.prototype`(见第5章)。但是可以创建一个不链接到`Object.prototype`的对象（通过`Object.create(null)` - 参见第5章）。在这种情况下，像`myObject.hasOwnProperty()`这样的方法调用将失败。

在那种情况下，执行这种检查的更健壮的方法是`Object.prototype.hasOwnProperty.call(myObject, "a")`，它借用了基础的`hasOwnProperty(..)`方法并使用 *显式的`this`绑定* （参见第2章）来将它应用于我们的`myObject`。

**注意：** `in`运算符表面看起来是它将检查容器内是否存在 *值* ，但它实际上检查是否存在属性名称。对于数组而言，这种差异很重要，因为在数组中尝试像`4 in [2,4,6]`这样的检查的误导性很强，但这不会像预期的那样表现。

#### Enumeration

之前，我们在查看`enumerable`属性描述符特征时简要解释了“可枚举性”的概念。让我们重新审视一下，并更详细地研究它。

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` NON-enumerable
	{ enumerable: false, value: 3 }
);

myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty( "b" ); // true

// .......

for (var k in myObject) {
	console.log( k, myObject[k] );
}
// "a" 2
```

你会注意到`myObject.b`实际上 **存在** 且具有可访问的值，但它不会出现在`for..in`循环中（但令人惊讶的是，它 **由** `in`运算符显示存在性检查）。这是因为“可枚举”的基本意思是“如果遍历对象的属性，则会被包含进来”。

**注意：** `for..in`在应用于数组的循环中，可能会产生一些意外的结果，因为数组的枚举将不仅包括所有数值索引，还包括任何可枚举的属性。最好 *只* 在对象上使用`for..in`循环，对于存储在数组中的值使用传统的`for`循环来进行数字索引迭代。

可以区分可枚举和不可枚举属性的另一种方法：

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` non-enumerable
	{ enumerable: false, value: 3 }
);

myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false

Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

`propertyIsEnumerable(..)`测试给定的属性名称是否 *直接* 存在于对象上，并且也是`enumerable:true`。

`Object.keys(..)`返回所有可枚举属性的数组，而`Object.getOwnPropertyNames()`返回所有属性的数组，无论是否可枚举。

而`in`与`hasownProperty(..)`的比较中，它们区别为是否查询`[[Prototype]]`链、`Object.keys(..)`和`object.getownPropertynames(..)`都 *只* 检查指定的直接对象。

(目前)没有内置的方法来获取 **所有属性** 的列表，这些属性等同于`in`运算符测试将查询的内容（遍历整个`[[Prototype]]`链上的所有属性，如第5章所述）。你可以通过递归地遍历对象的`[[Prototype]]`链，并从`Object.keys(..)` ——仅可枚举的属性——获取每个级别的列表，来近似使用这样的实用程序。

## Iteration

`for..in`循环遍历对象（包括其`[[Prototype]]`链）上的可枚举属性列表。但是，如果你想要迭代值，该怎么办？

使用数字索引数组，迭代值通常使用标准`for`循环完成，如：

```js
var myArray = [1, 2, 3];

for (var i = 0; i < myArray.length; i++) {
	console.log( myArray[i] );
}
// 1 2 3
```

但是，这不会迭代值，而是迭代索引，然后使用索引来引用值，如`myArray[i]`。

ES5还为数组添加了几个迭代帮助函数(助手)，包括`forEach(..)`，`every(..)`和`some(..)`。这些助手中的每一个都接受一个函数回调以应用于数组中的每个元素，区别仅在于它们如何分别响应回调中的返回值。

`forEach(..)`将迭代数组中的所有值，并忽略任何回调返回值。`every()`一直持续到结束或回调返回`false`（或“falsy”）值，而`some()`继续直到结束或回调返回`true`（或“truthy”）值。

`every()`和`some()`中的这些特殊返回值有点像正常`for`循环中的`break`语句，因为它们在到达结束之前就提前停止迭代。

如果使用`for..in`循环迭代对象，则也只是间接获取值，因为它实际上仅迭代对象的可枚举属性，让你手动访问属性以获取值。

**注意：** 与以数字顺序（`for`循环或其他迭代器）对数组索引进行迭代相比，对象属性的迭代顺序 **没有保证** ，并且可能在不同的JS引擎之间有所不同。不要依赖于任何观察到的顺序，因为任何观察到的一致性都是不可靠的。

但是如果你想直接迭代值而不是数组索引（或对象属性）呢？有用的是，ES6添加了`for..of`循环语法，用于迭代数组（和对象，如果对象定义了自己的自定义迭代器）：

```js
var myArray = [ 1, 2, 3 ];

for (var v of myArray) {
	console.log( v );
}
// 1
// 2
// 3
```

`for..of`循环要求迭代器对象(从一个默认的内部函数`@@iterator`中)迭代要迭代的 *东西* ，然后循环遍历从迭代器对象的`next()`方法调用的连续返回值，每次循环迭代一次。

数组有一个内置的`@@iterator`，因此`for..of`可以很容易地对它们起作用，如上所示。但是让我们使用内置的`@@iterator`手动迭代数组，看看它是如何工作的：

```js
var myArray = [ 1, 2, 3 ];
var it = myArray[Symbol.iterator]();

it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { done:true }
```

**注意：** 我们使用ES6 `Symbol`：`Symbol.iterator`获取对象的`@@iterator`内部属性。我们在本章前面简要提到了`Symbol`语义（参见“计算属性名称(Computed Property Names)”），因此同样的推理也适用于此。你总是希望通过`Symbo`名称引用而不是它可能包含的特殊值来引用这些特殊属性。此外，尽管名称有其含义, 但`@@iterator` **不是迭代器对象** 本身，而是一个 **函数返回** 的迭代器对象 - 一个微妙但重要的细节！

正如上面的代码片段所示，迭代器的`next()`调用的返回值是`{value: .., done: ..}`形式的对象，其中`value`是当前的迭代值，`done`是一个`boolean`，表示是否还有更多的迭代。

请注意，值`3`返回时带有`done: false`，乍一看似乎很奇怪。你必须第四次调用`next()`（前一个代码片段中的`for..of`循环自动完成）才能`done: true`并且知道你真的完成了迭代。这个怪癖的原因超出了我们在这里讨论的范围，但它来自ES6生成器(generator)函数的语义。

虽然数组会自动迭代`for..of`循环，但常规对象 **没有内置的`@@iterator`** 。这种故意遗漏的原因比我们在这里讨论的要复杂得多，但一般来说，最好不要包括一些可能会对未来对象类型造成麻烦的实现。

*可以* 为你要迭代的任何对象定义自己的默认`@@iterator`。例如：

```js
var myObject = {
	a: 2,
	b: 3
};

Object.defineProperty( myObject, Symbol.iterator, {
	enumerable: false,
	writable: false,
	configurable: true,
	value: function() {
		var o = this;
		var idx = 0;
		var ks = Object.keys( o );
		return {
			next: function() {
				return {
					value: o[ks[idx++]],
					done: (idx > ks.length)
				};
			}
		};
	}
} );

// iterate `myObject` manually
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }

// iterate `myObject` with `for..of`
for (var v of myObject) {
	console.log( v );
}
// 2
// 3
```

**注意：** 我们使用`Object.defineProperty(..)`来定义我们的自定义`@@iterator`（主要是因为我们可以设置它不可枚举），但是使用`Symbol`作为 *计算属性名称* （本章前面已经介绍过），我们可以直接声明它，比如：`var myObject = { a:2, b:3, [Symbol.iterator]: function(){ /* .. */ } }`。

每次`for..of`循环调用`myObject`的迭代器对象上的`next()`时，迭代内部指针将前进并返回对象属性列表中的下一个值（请参阅前面有关对象属性/值的迭代排序的注释）。

我们刚刚演示的迭代是一个简单的逐值迭代，但你可以根据需要为自定义数据结构定义任意复杂的迭代。结合ES6 `for..of`循环的自定义迭代器是一种强大的新语法工具，用于操作用户定义的对象。

例如，`Pixel`对象列表（具有`x`和`y`坐标值）可以决定基于与`(0,0)`原点的线性距离来对其迭代进行排序，或者过滤掉“太远”的点等。只要你的迭代器从`next()`调用返回预期的`{value: ..}`返回值，并在迭代完成后返回`{done: true}`，ES6的`for..of`就可以迭代它。

实际上，你甚至可以生成“无限”迭代器，它永远不会“完成”并且总是返回一个新值（例如随机数、递增值、唯一标识符等），尽管你可能不会使用具有无限`for..of`循环的迭代器，因为它永远不会结束并挂起你的程序。

```js
var randoms = {
	[Symbol.iterator]: function() {
		return {
			next: function() {
				return { value: Math.random() };
			}
		};
	}
};

var randoms_pool = [];
for (var n of randoms) {
	randoms_pool.push( n );

	// don't proceed unbounded!
	if (randoms_pool.length === 100) break;
}
```

这个迭代器将“永远”生成随机数，所以我们只小心提取100个值，这样我们的程序就不会挂起。

## Review (TL;DR)

JS中的对象既有字面量形式（如`var a = {..}`）又有构造形式（如`var a = new Array()`）。字面量形式几乎总是首选，但在某些情况下，构造的形式提供了更多的创作选项。

许多人错误地声称“JavaScript中的所有东西都是对象”，但这是不正确的。对象是6种（或7种，取决于你的观点）原始类型之一。对象具有子类型，包括`function`，也可以是行为专用的，例如`[object Array]`作为表示数组对象子类型的内部标签。

对象是键/值对的集合。这些值可以作为属性访问，通过`.propName`或`["propName"]`语法。每当访问一个属性时，引擎实际上调用内部默认的`[[Get]]`操作（和设置值的`[[Put]]`），它不仅直接在对象上查找属性，而且如果找不到属性，它将遍历`[[Prototype]]`链（参见第5章）。

属性具有可通过属性描述符控制的某些特征，例如`writable`和`configurable`。此外，对象可以使用`Object.preventExtensions()`，`Object.seal()`和`Object.freeze()`将其可变性（以及它们的属性）控制到不同的不可变性级别。

属性不必包含值 - 它们也可以是“访问者属性”，具有getter / setter。它们也可以是可枚举的，例如，它们控制是否出现在`for..in`循环迭代中。

你还可以使用ES6 `for..of`语法对数据结构（数组、对象等）中的 **值** 进行迭代，该语法查找由`next()`方法组成的内置或自定义`@@iterator`对象，以便一次一个地遍历数据值。