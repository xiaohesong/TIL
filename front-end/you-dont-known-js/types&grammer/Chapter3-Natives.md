# Chapter 3: Natives

在第1章和第2章中，我们多次提到了各种内置函数，通常称为“原生的”，如`String`和`Number`。我们现在详细研究一下。

下面的是一个最常用的原生的列表：

- `String()`
- `Number()`
- `Boolean()`
- `Array()`
- `Object()`
- `Function()`
- `RegExp()`
- `Date()`
- `Error()`
- `Symbol()` —— ES6中新加入的

如你所见，这些原生的实际上是内置函数。

如果你是从Java这样的语言来到JS，JavaScript的`String()`看起来就像你用来创建字符串值的`String()`构造函数。所以，你会很快发现你可以做以下事情：

```js
var s = new String( "Hello World!" );

console.log( s.toString() ); // "Hello World!"
```

确实，这些原生中的每一个都可以用作原生构造函数。但是正在构建的内容可能与你所想象的不同。

```js
var a = new String( "abc" );

typeof a; // "object" ... not "String"

a instanceof String; // true

Object.prototype.toString.call( a ); // "[object String]"
```

创建值的构造器形式（`new String("abc")`）的结果是一个基本类型值（`"abc"`）的包装器对象。

重要的是，`typeof`表明这些对象不是它们自己的特殊类型，但更恰当的说法是它们是`object`类型的子类型。

可以通过以下方式进一步观察此对象包装：

```js
console.log( a );
```

该语句的输出因浏览器而异，因为开发人员控制台可以自由选择，但是他们觉得将对象序列化以供开发人员检查是合适的。

**注意：** 在撰写本文时，最新的Chrome打印出如下内容：`String {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}`。但旧版本的Chrome曾经打印过这个版本：`String {0: "a", 1: "b", 2: "c"}`。最新的Firefox目前打印出: `String ["a","b","c"]`, 但曾经以斜体打印“abc”，可点击以打开对象检查器。当然，这些结果会经常变化，并且你的经验可能会有所不同。

关键是，`new String("abc")`为`"abc"`创建了一个字符串包装器对象，而不仅仅是原始的`"abc"`值本身。

### Internal `[[Class]]`

`typeof`为`"object"`的值（例如数组）是用内部`[[Class]]`属性另外标记（把它看成内部分类，而不是与传统的面向类编码的类相关）。此属性不能直接访问，但通常可以通过借用针对该值调用的默认`Object.prototype.toString()`方法间接显示。例如：

```js
Object.prototype.toString.call( [1,2,3] );			// "[object Array]"

Object.prototype.toString.call( /regex-literal/i );	// "[object RegExp]"
```

因此，对于此示例中的数组，内部`[[Class]]`值为`"Array"`,对于正则表达式，它是`"RegExp"`。在大多数情况下，这个内部`[[Class]]`值对应于与值相关的内置原生构造函数（见下文），但情况并非总是如此。

原始值会怎么样？首先，`null`和`undefined`：

```js
Object.prototype.toString.call( null );			// "[object Null]"
Object.prototype.toString.call( undefined );	// "[object Undefined]"
```

你可能会注意到没有`Null()`和`Undefined()`的原生的构造函数，但是，`"Null"`和`"Undefined"`是暴露出来的内部`[[Class]]`值。

但对于其他简单的原始类型，如`string`，`number`和`boolean`，另一种行为实际上通常称为"封箱"（参见下面的“封箱包装”部分）：

```js
Object.prototype.toString.call( "abc" );	// "[object String]"
Object.prototype.toString.call( 42 );		// "[object Number]"
Object.prototype.toString.call( true );		// "[object Boolean]"
```

在这个片段中，每个简单的基元都由它们各自的对象包装器自动装箱，这就是为什么`"String"`, `"Number"`, 和 `"Boolean"`被显示为相应的内部`[[Class]]`值。

**注意：** 此处所示的`toString()`和`[[Class]]`的行为从ES5到ES6中有了部分更改，但我们将在本系列的 ES6&Beyond 标题中介绍这些细节。

### Boxing Wrappers

这些对象包装器起着非常重要的作用。原始值没有属性或方法，因此要访问`.length`或`.toString()`，你需要值的对象包装器。值得庆幸的是，JS将自动封装（也称为包装）原始值以实现此类的访问。

```js
var a = "abc";

a.length; // 3
a.toUpperCase(); // "ABC"
```

因此，如果你要经常访问字符串值的这些属性/方法，例如`for`循环中的`i <a.length`条件，从一开始就拥有值的对象形式似乎是有意义的，因此JS引擎不需要为你隐式创建它。

但结果证明这是一个坏主意。浏览器在很久以前就 性能优化 了常见的情况，如`.length`，意味着如果你试图通过直接使用对象形式（没有被优化）来“预优化”，那么你的程序实际上会变慢。

通常，基本上没有理由直接使用对象形式。最好让封箱在必要时隐式发生。换句话说，就是永远不要做`new String('abc')`, `new Number(42)`类似这样的事情，而是更偏向于使用原始值文字字面量, 如`"abc"`和`42`。

### Object Wrapper Gotchas

如果你确实选择使用对象形式，你应该知道有一些直接使用对象包装器的问题。

例如，考虑`Boolean`包装值：

```js
var a = new Boolean( false );

if (!a) {
	console.log( "Oops" ); // never runs
}
```

问题是你为`false`创建了一个对象封装，但是对象本身是`truthy`的，所以使用对象的行为与使用底层的`false`本身相反，这与正常的期望完全相反。

如果要手动设置原始值，可以使用`Object()`函数（无`new`关键字）：

```js
var a = "abc";
var b = new String( a );
var c = Object( a );

typeof a; // "string"
typeof b; // "object"
typeof c; // "object"

b instanceof String; // true
c instanceof String; // true

Object.prototype.toString.call( b ); // "[object String]"
Object.prototype.toString.call( c ); // "[object String]"
```

同样，通常不鼓励直接使用对象包装器（如上面的`b`和`c`）,但是在某些罕见的情况下你会遇到它们可能有用的地方。

### Unboxing

如果你有一个对象包装器，并且你想要得到他的底层的原始值，你可以使用`valueOf()`方法:

```js
var a = new String( "abc" );
var b = new Number( 42 );
var c = new Boolean( true );

a.valueOf(); // "abc"
b.valueOf(); // 42
c.valueOf(); // true
```

当你需要原始值的方式使用对象包装器值时，取消装箱也可以隐式发生。这个过程（强制）将在第4章中详细介绍，但简要说明：

```js
var a = new String( "abc" );
var b = a + ""; // `b` has the unboxed primitive value "abc"

typeof a; // "object"
typeof b; // "string"
```

### Natives as Constructors

对于`array`, `object`, `function`和正则表达式的值，几乎普遍优先使用字面量形式来创建值，但是字面量形式创建了与构造函数表单相同类型的对象（即，没有未包装的值）。

就像我们上面看到的其他原生的一样，这些构造函数表单通常应该避免，除非你真的知道你需要它们干什么，主要是因为它们引入了你可能并不真正想要处理的异常和陷阱。

##### `Array(..)`

```js
var a = new Array( 1, 2, 3 );
a; // [1, 2, 3]

var b = [1, 2, 3];
b; // [1, 2, 3]
```

**注意:** `Array()`构造函数并不需要在他的前面使用`new`关键字。如果省略这个关键字，它的行为就像你已经使用它一样。所以`Array(1,2,3)`与`new Array(1,2,3)`的结果相同。

`Array`构造函数有一个特殊的形式，如果只传递一个`number`参数，而不是将该值作为数组的内容提供，则将其作为“预先确定数组”的长度（好吧，八九不离十）。

这是一个糟糕的主意。首先，你可以不小心碰到那个形式，因为它很容易忘记。

但更重要的是，没有实际预设数组的东西。相反，你正在创建的是一个空数组，但将数组的`length`属性设置为指定的那个数值。

一个数组在其插槽中没有显式值，但有一个`length`属性暗示存在插槽，这是JS中一种奇怪的奇特类型的数据结构，带有一些非常奇怪和混乱的行为。创建这样一个值的能力纯粹来自旧的，已弃用的历史功能（“类似于数组的对象”，如`arguments`对象）。

**注意：** 其中至少有一个“空槽”的数组通常称为“稀疏数组”。

这是另一个例子，这是浏览器开发者控制台在如何表示这样一个对象方面的变化，这会产生更多混乱。

例如：

```js
var a = new Array( 3 );

a.length; // 3
a;
```

Chrome中`a`的序列化是（在撰写本文时）: `[ undefined x 3 ]`。**这真的很不幸。** 这意味着在这个数组的插槽中有三个`undefined`的值，实际上插槽不存在（所谓的“空插槽” - 也是一个坏名称！）。

要想象差异，请尝试以下方法：

```js
var a = new Array( 3 );
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;

a;
b;
c;
```

**注意：** 可以看到本例中的`c`,  创建数组后，数组中的空槽可能会发生。将数组的 `length` 改变为超过它实际定义的槽值的数目，你就隐含地引入了空值槽。事实上，你甚至可以在上面的代码段中调用 `delete b[1]`，这样会在 `b`的中间引入一个空值槽。

对于`b`（目前在Chrome中）,你会发现`[undefined，undefined，undefined]`作为序列化, 对于`a`和`c`，与`[undefined x 3]`相对。困惑？是的，其他人也一样。

更糟糕的是，在撰写本文时，Firefox对于`a`和`c`输出了`[ , , ,] `。你有没有理解为什么那么混乱？仔细看。三个逗号意味着四个插槽，而不是我们期望的三个插槽。

**什么！？** Firefox在序列化结束时添加了额外的`,`，因为从ES5开始，允许列表中的结尾尾随逗号（数组值，属性列表等）（因此被删除和忽略）。因此，如果你若在程序或控制台中键入 `[ , , , ]` 值，你实际上得到的是一个底层为 `[ , , ]`的值（也就是，一个带有三个空值槽的数组）。这种选择虽然在阅读开发者控制台时会引起混淆，但却可以防止复制粘贴行为的准确性。

如果你现在摇头或翻白眼，不只是你！耸耸肩。

不幸的是，它变得更糟。不仅仅是混淆控制台输出，上面的代码片段中的`a`和`b`在某些情况下实际上表现相同，**但在其他情况下则不同：**

```js
a.join( "-" ); // "--"
b.join( "-" ); // "--"

a.map(function(v,i){ return i; }); // [ undefined x 3 ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```

**啊哈**

`a.map(..)`调用调用 *失败* ，因为这些卡槽并不是真实的存在，所以`map()`没有什么好迭代的。`join()`的工作方式有所不同。基本上，我们可以认为它的实现类似于下面这样：

```js
function fakeJoin(arr,connector) {
	var str = "";
	for (var i = 0; i < arr.length; i++) {
		if (i > 0) {
			str += connector;
		}
		if (arr[i] !== undefined) {
			str += arr[i];
		}
	}
	return str;
}

var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```

正如你所看到的，`join()`的工作只需要 *假设* 插槽存在并且循环至数组长度。无论`map()`的内部在做什么，他显然没有做出这样的假设。因此奇怪的“空槽”数组的结果是意外的并且可能导致失败。

所以，如果你想真正创建一个实际`undefined`值的数组（不只是“空槽”），你怎么样才可以做到（除了手动）？

```js
var a = Array.apply( null, { length: 3 } );
a; // [ undefined, undefined, undefined ]
```

困惑？是啊。以下是它的工作原理。

`apply(..)`可以用于所有函数，它以一种特殊的方式调用它所使用的函数。 

第一个参数是一个`this`对象绑定（在本系列的this＆Object Prototypes标题中有所介绍），我们在这里并不关心，所以我们将它设置为`null`。第二个参数应该是一个数组（或类似于数组的东西 - 也就是“类似数组的对象”）。这个“数组”的内容作为函数的参数“传播”。

因此，`Array.apply(..)`调用`Array(..)`函数并将值（`{length：3}`对象值）扩展为其参数。

`apply(..)`内部，我们可以设想还有另一个`for`循环（有点像上面的`join(..)`），从`0`到长度（但不包括长度, 在我们的例子中为`3`）。

对于每个索引，它从对象中检索该键。因此，如果数组对象参数在`apply(..)`函数内部命名为`arr`，则属性访问实际上是`arr [0]`，`arr [1]`和`arr [2]`。当然，`{length：3}`对象值上不存在这些属性，因此所有这三个属性访问都将返回`undefined`的值。换句话说，它最终调用`Array(..)`基本上像这样：`Array(undefined,undefined,undefined)`, 这就是我们如何最终得到一个充满`undefined`值的数组，而不仅仅是那些（令人发疯的）空插槽。

虽然`Array.apply( null, { length: 3 } )`是一种奇怪并且冗长的方式来定义充满`undefined`值得数组，但是他比使用`Array(3)`空插槽获得的数据要好得多，也更可靠。

结论：**永远不要，在任何情况下，**  你都不应该有意创建和使用这些奇特的空槽数组。只是不要这样做就行。他们会让人发疯。

### `Object(..)`, `Function(..)`, 和 `RegExp(..)`

`Object(..)`/`Function(..)`/`RegExp(..)`构造函数通常也是可选的，因此通常应该避免，除非有特别的需要。

```js
var c = new Object();
c.foo = "bar";
c; // { foo: "bar" }

var d = { foo: "bar" };
d; // { foo: "bar" }

var e = new Function( "a", "return a * 2;" );
var f = function(a) { return a * 2; };
function g(a) { return a * 2; }

var h = new RegExp( "^a*b+", "g" );
var i = /^a*b+/g;
```

实际上没有理由使用`new Object()`构造函数表示形式，特别是因为它强制你在对象文字形式中逐个添加属性而不是一次添加多个属性。

`Function`构造函数仅在最罕见的情况下才有用，那时你需要动态定义函数的参数和/或函数体。 **不要只将`Function(..)`视为`eval(..)`的替代形式。** 你几乎不需要以这种方式动态定义函数。

以文字形式 (`/^a*b+/g`)定义的正则表达式是强烈推荐的，不仅仅是为了方便语法而且出于性能原因 - JS引擎在代码执行之前预编译并缓存它们。与我们到目前为止看到的其他构造函数形式不同，`RegExp(..)`具有一些合理的实用性：动态定义正则表达式的模式。

```js
var name = "Kyle";
var namePattern = new RegExp( "\\b(?:" + name + ")+\\b", "ig" );

var matches = someText.match( namePattern );
```

种情况合法地在JS程序中不时发生，因此你需要使用`new RegExp("pattern","flags")`形式。

### `Date(..)` 和 `Error(..)`

`Date(..)`和`Error(..)`的原生构造函数比其他的构造函数有用太多了，因为两者都没有文字形式。

要创建日期对象值，必须使用`new Date()`。`Date()`构造函数接受可选参数来指定要使用的日期/时间，但如果省略，则假定当前日期/时间。

到目前为止，构造日期对象的最常见原因是获取当前时间戳值（自1970年1月1日以来的有符号整数毫秒数）。可以通过在日期对象实例上调用`getTime()`来完成此操作。

但更简单的方法是调用ES5定义的静态帮助函数：`Date.now()`。对于预填充ES5非常简单：

```js
if (!Date.now) {
	Date.now = function(){
		return (new Date()).getTime();
	};
}
```

**注意：** 如果不使用`new`调用`Date()`,你会得到当时日期/时间的字符串表示。虽然浏览器倾向于就以下内容达成一致意见，但在语言规范中未指定此表示形式的确切形式：`"Fri Jul 18 2014 00:31:02 GMT-0500 (CDT)"`。

`Error(..)`构造函数（很像上面的`Array()`）与`new`关键字的存在或省略行为相同。

想要创建错误对象的主要原因是它将当前执行堆栈上下文捕获到对象中（在大多数JS引擎中，一旦构造就显示为只读`.stack`属性）。此堆栈上下文包括函数调用堆栈和创建错误对象的行号，这使得调试该错误更加容易。

通常会使用`throw`运算符使用这样的错误对象：

```js
function foo(x) {
	if (!x) {
		throw new Error( "x wasn't provided" );
	}
	// ..
}
```

错误对象实例通常至少具有`message`属性，有时还有其他属性（你应将其视为只读），如`type`。但是，除了检查上面提到的`stack`属性之外，通常最好只在错误对象上调用`toString()`（显式或隐式地通过强制 - 参见第4章）来获取友好格式的错误消息。

**提示:** 从技术上讲，除了`Error()`原生构造函数之外，还有其他几种特定错误类型的原生构造函数：`EvalError(..)`, `RangeError(..)`, `ReferenceError(..)`, `SyntaxError(..)`, `TypeError(..)`, 和 `URIError(..)`。但是手动使用这些非常罕见。如果你的程序实际上遇到了真正的异常（例如引用未声明的变量并获得`ReferenceError`错误），则会自动使用它们。

### `Symbol(..)`

从ES6开始，添加了一个额外的原始值类型，称为“Symbol”。符号是特殊的“唯一”（非严格保证！）值，可以用作对象的属性，几乎不用担心任何重复。它们主要用于ES6构造的特殊内置行为，但你也可以定义自己的符号。

符号可用作属性名称，但你无法从程序或开发人员控制台查看或访问符号的实际值。如果你在开发者控制台中评估符号，则显示的内容如`Symbol(Symbol.create)`。

ES6中有几个预定义符号，作为`Symbol`函数对象的静态属性访问，比如: `Symbol.create`, `Symbol.iterator`,等。要使用他们，只需要这样做：

```js
obj[Symbol.iterator] = function(){ /*..*/ };
```

要定义你自己的符号，请使用原生的`Symbol(..)`， 符号的原生的“构造函数”是唯一的，因为不允许使用`new`，因为这样做会引发错误。

```js
var mysym = Symbol( "my own symbol" );
mysym;				// Symbol(my own symbol)
mysym.toString();	// "Symbol(my own symbol)"
typeof mysym; 		// "symbol"

var a = { };
a[mysym] = "foobar";

Object.getOwnPropertySymbols( a );
// [ Symbol(my own symbol) ]
```

虽然符号实际上不是私有的（`Object.getOwnPropertySymbols()`反射在对象上并且非常公开地显示符号），但将它们 用于私有或特殊属性 可能是它们的主要用例。对于大多数开发人员来说，他们可以用`_`下划线前缀代替属性名称，这些前缀几乎总是按照惯例信号来说，“嘿，这是私有/特殊/内部属性，所以不管它！”

**注意：** `Symbol`不是`object`，它们是简单的标量基元(原始类型)。

### Native Prototypes

每个内置的原生构造函数都有自己的`.prototype`对象 - `Array.prototype`, `String.prototype`等等。

这些对象包含其特定对象子类型特有的行为。

例如，所有字符串对象和扩展（通过装箱）`string`原始值都可以访问作为`String.prototype`对象上定义的方法的默认行为。

**注意：** 根据文档约定，`String.prototype.XYZ`缩写为`String＃XYZ`，同样适用于所有其他`.prototype`。

- `String#indexOf(..)`：在一个字符串中找出一个子串的位置
- `String#charAt(..)`：访问一个字符串中某个位置的字符
- `String#substr(..)`、`String#substring(..)` 和 `String#slice(..)`：将字符串的一部分抽取为一个新字符串
- `String#toUpperCase()` 和 `String#toLowerCase()`：创建一个转换为大写或小写的新字符串
- `String#trim()`：创建一个截去开头或结尾空格的新字符串。

没有任何方法可以修改字符串。这里的修改（如大小写转换或修剪）是指从现有值中创建新的值。

凭借原型委派（参见本系列中的this＆Object Prototypes标题），任何字符串值都可以访问这些方法：

```js
var a = " abc ";

a.indexOf( "c" ); // 3
a.toUpperCase(); // " ABC "
a.trim(); // "abc"
```

其他构造函数原型包含符合其类型的行为，例如`Number#toFixed(..)`（用固定数字的十进制数字进行字符串化）和`Array#concat(..)`（合并数组）。所有的函数都可以访问`apply(..)`, `call(..)`, and `bind(..)`,因为`Function.prototype`中定义了他们。

但是，一些原生原型不仅仅是普通的对象：

```js
typeof Function.prototype;			// "function"
Function.prototype();				// it's an empty function!

RegExp.prototype.toString();		// "/(?:)/" -- empty regex
"abc".match( RegExp.prototype );	// [""]
```

一个特别糟糕的想法，你甚至可以修改这些原生原型（而不仅仅是添加你可能熟悉的属性）：

```js
Array.isArray( Array.prototype );	// true
Array.prototype.push( 1, 2, 3 );	// 3
Array.prototype;					// [1,2,3]

// don't leave it that way, though, or expect weirdness!
// reset the `Array.prototype` to empty
Array.prototype.length = 0;
```

正如你所见，`Function.prototype`是一个函数，`RegExp.prototype`是一个正则表达式，`Array.prototype`是一个数组。有趣也很酷，对吧？

#### Prototypes As Defaults

`Function.prototype`是一个空函数，`RegExp.prototype`是一个"空"正则，`Array.prototype`是一个空数组，如果这些变量不具有正确类型的值，则将它们设置为变量“默认”值。

看下面的例子：

```js
function isThisCool(vals,fn,rx) {
	vals = vals || Array.prototype;
	fn = fn || Function.prototype;
	rx = rx || RegExp.prototype;

	return rx.test(
		vals.map( fn ).join( "" )
	);
}

isThisCool();		// true

isThisCool(
	["a","b","c"],
	function(v){ return v.toUpperCase(); },
	/D/
);					// false
```

**注意:** 从ES6开始，我们不需要使用`vals = vals || ..`这种默认设置值的语法技巧（见第4章）了，因为可以通过函数声明中的原生语法为参数设置默认值（参见第5章）。

这种方法的一个小的好处是`.prototype`已经创建并内置，因此只创建一次。想比之下，使用 `[]`, `function(){}`, 和 `/(?:)/`这些默认值的值本身(有可能，取决于引擎实现) 将为 `isThisCool (..)` 的每个调用重新创建这些值 (并可能在后面进行垃圾回收)。这可能是 内存/cpu 的浪费。

另外，请务必小心不要将`Array.prototype`用作 **随后将被修改** 的默认值。在这个例子中，`vals`是以只读方式使用的，但如果你要对`vals`进行就地更改，那么实际上你将修改`Array.prototype`本身，这将导致前面提到的陷阱！

**注意:** 虽然我们指出了这些原生原型和一些用处，但要谨慎依赖它们，更加谨慎地以任何方式修改它们。有关更多讨论，请参见附录A“原生原型”。

### Review

javaScript对基本类型提供了对象包装，称为原生(`String`, `Number`, `Boolean`,..)。这些对象包装器使值可以访问适用于每个对象子类型的行为（`String#trim()`和`Array#concat(..)`）。

如果你有一个简单的基本类型值，如`"abc"`，你可以访问它的`length`属性或一些`String.prototype`方法，JS自动“装箱”该值（将其包装在各自的对象包装器中），以便可以实现 属性/方法 访问。