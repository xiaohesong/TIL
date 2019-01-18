# Chapter 2: Values

`array`、`string`、和 `number` 是任何程序的最基础构建块，但是 JavaScript 在这些类型上有一些或使你惊喜或使你惊讶的独特性质。

让我们看看JS中的几个内置值类型，并探索如何更全面地理解和正确利用它们的行为。

### Arrays

和其他强制类型的语言相比，JavaScript 的 `array` 只是任何类型值的容器：`string` 或者 `number` 或者 `object`，甚至是另一个 `array`（这就是你得到多维数组的方法）。

```js
var a = [ 1, "2", [3] ];

a.length;		// 3
a[0] === 1;		// true
a[2][0] === 3;	// true
```

你不需要预先指定 `array` ，你只需声明它们并按你认为合适的方式添加值：

```js
var a = [ ];

a.length;	// 0

a[0] = 1;
a[1] = "2";
a[2] = [ 3 ];

a.length;	// 3
```

**警告：** 在`array`上使用`delete`将删除这个槽位，但即使你删除了最后一个元素，它也**不会** 更新`length`属性， 所以请小心。我们会在第五章讨论 `delete` 操作符的更多细节。

注意创建“稀疏”数组（留下或创建空/缺少的插槽）：

```js
var a = [ ];

a[0] = 1;
// no `a[1]` slot set here
a[2] = [ 3 ];

a[1];		// undefined

a.length;	// 3
```

虽然这可以工作，但你留下的“空槽”可能会导致一些令人困惑的行为。虽然这样的值槽看起来拥有 `undefined` 值，但是它不会像被明确设置（`a[1] = undefined`）的值槽那样动作。更多信息可以参见第三章的“Array”。

`array` 被数字索引（正如你所想的那样），但棘手的是它们也是对象，可以在它们上面添加 `string` 键/属性（但是这些属性不会计算在 `array` 的 `length` 中）：

```js
var a = [ ];

a[0] = 1;
a["foobar"] = 2;

a.length;		// 1
a["foobar"];	// 2
a.foobar;		// 2
```

但是，需要注意的是，如果一个可以被强制转换为10进制 `number` 的 `string` 值被用作键的话，它会认为你想使用 `number` 索引而不是一个 `string` 键！

```js
var a = [ ];

a["13"] = 42;

a.length; // 14
```

通常，将`string`键/属性添加到数组并不是一个好主意。。最好使用 `object` 来做有键/属性形式的值，而将 `array` 专用于严格地数字索引的值。

### Array-Likes

在某些场景下，你需要把类似数组的值(索引是数字的值的集合)转换到数组。通常，你可以针对值集合调用数组方法(`indexOf(..)`, `concat(..)`, `forEach(..)`)

例如，各种DOM查询操作返回DOM元素的列表，这些DOM元素不是真正的数组，但是对于我们的转换目的而言类似于数组。另一个常见示例是函数公开`arguments`（类似于数组）对象（从ES6开始，不推荐使用）以作为列表访问参数。

进行此类转换的一种非常常见的方法是对值使用`slice(..)`:

```js
function foo() {
	var arr = Array.prototype.slice.call( arguments );
	arr.push( "bam" );
	console.log( arr );
}

foo( "bar", "baz" ); // ["bar","baz","bam"]
```

如果调用`slice`没有其他的参数，就像上面的代码段那样，它的参数的默认值会使它具有复制这个 `array`（或者，在这个例子中，是一个类 `array`）的效果。

在 ES6 中，还有一种称为 `Array.from(..)` 的内建工具可以执行相同的任务：

```js
...
var arr = Array.from( arguments );
...
```

**注意：** `Array.from(..)` 拥有其他几种强大的能力，将在本系列的ES6和Beyond中详细介绍。

### Strings

人们普遍认为`string`本质上只是字符`array`。虽然内部的实现可能是也可能不是 `array`，但重要的是要理解 JavaScript 的 `string` 与字符的 `array` 确实不一样。它们的相似性几乎只是表面上的。

例如，让我们考虑这两个值：

```js
var a = "foo";
var b = ["f","o","o"];
```

字符串与数组（如上所述的数组）非常相似 - 例如，它们都具有`length`属性，`indexOf(..)`方法（仅从ES5开始的数组版本）和`concat(..)`方法：

```js
a.length;							// 3
b.length;							// 3

a.indexOf( "o" );					// 1
b.indexOf( "o" );					// 1

var c = a.concat( "bar" );			// "foobar"
var d = b.concat( ["b","a","r"] );	// ["f","o","o","b","a","r"]

a === c;							// false
b === d;							// false

a;									// "foo"
b;									// ["f","o","o"]
```

所以，它们基本上都只是“字符数组”，对吧？**不完全是：**

```js
a[1] = "O";
b[1] = "O";

a; // "foo"
b; // ["f","O","o"]
```

js的`string`是不可变的，`array`是容易改变的。而且，`a [1]`字符位置访问形式并不总是广泛有效的, 较旧版本的IE不允许使用该语法（但现在他们可以这样做）。相反，正确的方法是`a.charAt(1)`。

不可变`string`的另一个结果是，改变其内容的`string`方法都不能就地修改，而是必须创建并返回新的`string`。相比之下，许多改变`array`内容的方法实际上都是就地修改的。

```js
c = a.toUpperCase();
a === c;	// false
a;			// "foo"
c;			// "FOO"

b.push( "!" );
b;			// ["f","O","o","!"]
```

另外，许多 `array` 方法在处理 `string` 时非常有用，虽然这些方法不属于 `string`，但我们可以对我们的 `string` “借用”非变化的 `array` 方法：

```js
// 这里的a就是"foo"
a.join;			// undefined
a.map;			// undefined

var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
	return v.toUpperCase() + ".";
} ).join( "" );

c;				// "f-o-o"
d;				// "F.O.O."
```

让我们看另外一个例子：翻转一个 `string`（顺带一提，这是一个 JavaScript 面试中常见的细节问题！）。`array` 拥有一个 `reverse()` 方法，但是 `string` 没有：

```js
a.reverse;		// undefined

b.reverse();	// ["!","o","O","f"]
b;				// ["!","o","O","f"]
```

不幸的是，这种“借用”不适用于数组，因为`string`是不可变的，因此无法在适当的位置进行修改：

```js
Array.prototype.reverse.call( a );
// still returns a String object wrapper (see Chapter 3)
// for "foo" :(
```

另一种解决方法（也称为hack）是将`string`转换为`array`，执行所需的操作，然后将其转换回字符串。

```js
var c = a
	// split `a` into an array of characters
	.split( "" )
	// reverse the array of characters
	.reverse()
	// join the array of characters back to a string
	.join( "" );

c; // "oof"
```

就是觉得很难看。然而，它适用于简单的`string`，所以如果你需要快速肮脏的东西，通常这样的方法可以完成你需要的。

**警告：** 当心！这种方法**不适用** 于其中包含复杂(unicode)字符的`string`（星号，多字节字符等）。需要更复杂的库实用程序，这些实用程序具有unicode感知功能，可以准确处理此类操作。请参阅Mathias Bynens关于这个方面的工作：[Esrever](https://github.com/mathiasbynens/esrever)

另一种看待这个的方法是：如果你更常在你的“字符串”上执行任务，将它们视为基本的字符数组，也许最好将它们实际存储为`array`而不是`string`。你可能每次都会省去很多从`string`转换为`array`的麻烦。每当你确实需要`string`表示时，你总是可以在字符`array`上调用`join("")`。

### Numbers

JavaScript只有一种数字类型: `number`。此类型包括“整数”值和小数十进制数。我在说“整数”时加了引号，因为长期以来JS一直被批评没有真正的整数，就像其他语言一样。这可能会在未来的某个时刻发生变化，但就目前而言，我们都是用`number`。

因此，在JS中，“整数”只是一个没有小数十进制值的值。也就是说，`42.0`和`42`一样是“整数”。

像大多数现代语言一样，包括几乎所有脚本语言，JavaScript的`number`实现基于“IEEE 754”标准，通常称为“浮点”。JavaScript 专门使用了这个标准的“双精度”（也就是“64位二进制”）格式。

关于二进制浮点数如何存储在内存中的细节以及这些选择的含义，Web上有很多很好的文章。因为理解内存中的位模式对于理解如何在JS中正确使用数字并不是绝对必要的，所以如果您想进一步深入了解IEEE 754的细节，我们将把它留作感兴趣的读者的练习。

### Numeric Syntax

在 JavaScript 中字面数字一般用十进制表达。例如：

```js
var a = 42;
var b = 42.3;
```

十进制值的前导部分(如果为0)是可选的：

```js
var a = 0.42;
var b = .42;
```

类似地，`.`之后的十进制值的尾部（小数），如果为0，则是可选的：

```js
var a = 42.0;
var b = 42.;
```

**警告:** `42.`非常罕见，如果你希望别人阅读你的代码时避免混淆，那这样做可能不是一个好方法。但它仍然是有效的。

默认情况下，大多数 `number` 将会以十进制小数的形式输出，并去掉末尾小数部分的 `0`。所以：

```js
ar a = 42.300;
var b = 42.0;

a; // 42.3
b; // 42
```

默认情况下，非常大或非常小的数字将以指数形式输出，与`toExponential()`方法的输出相同，如：

```js
var a = 5E10;
a;					// 50000000000
a.toExponential();	// "5e+10"

var b = a * a;
b;					// 2.5e+21

var c = 1 / a;
c;					// 2e-11
```

因为 `number` 值可以用 `Number` 对象包装器封装（见第三章），所以 `number` 可以访问 `Number.prototype` 中内置的方法（见第三章）。例如，`toFixed(..)` 方法允许你指定一个值在被表示时，带有多少位小数：

```js
var a = 42.59;

a.toFixed( 0 ); // "43"
a.toFixed( 1 ); // "42.6"
a.toFixed( 2 ); // "42.59"
a.toFixed( 3 ); // "42.590"
a.toFixed( 4 ); // "42.5900"
```

请注意，输出实际上是`number`的`string`表示形式，而且如果你指定的位数多于值持有的小数位数时，会在右侧补 `0`。

`toPrecision(..)` 很相似，但它指定的是有多少 *有效数字* 用来表示这个值：

```js
var a = 42.59;

a.toPrecision( 1 ); // "4e+1"
a.toPrecision( 2 ); // "43"
a.toPrecision( 3 ); // "42.6"
a.toPrecision( 4 ); // "42.59"
a.toPrecision( 5 ); // "42.590"
a.toPrecision( 6 ); // "42.5900"
```

你不必使用带有这个值的变量来访问这些方法；你可以直接在 `number` 的字面上访问这些方法。但是你必须要小心`.`的操作符。自从`.`是一个有效的数字字符，如果可能，它将首先被解释为数字文字的一部分，而不是被解释为属性访问者。

```js
// invalid syntax:
42.toFixed( 3 );	// SyntaxError

// these are all valid:
(42).toFixed( 3 );	// "42.000"
0.42.toFixed( 3 );	// "0.420"
42..toFixed( 3 );	// "42.000"
```

`42.toFixed(3)` 是不合法的语法，因为 `.` 作为 `42.` 字面（这是合法的 -- 参见上面的讨论！）的一部分被吞噬了，因此没有 `.` 属性操作符来表示 `.toFixed` 。

`42..toFixed(3)` 可以工作是因为第一个 `.` 是 `number` 的一部分而第二个 `.` 是属性操作符。但它可能看起来很奇怪，而且在实际的 JavaScript 代码中看到类似的内容确实非常罕见。实际上，在任何基本类型上直接访问方法是非常罕见的。罕见并不意味着 *坏* 或 *错* 。

**注意：** 有些库扩展了内置的`Number.prototype`（参见第3章），以便在`number`上提供额外的操作，因此在这些情况下，使用像`10..makeItRain()`这样的东西来引发一个10秒钟的下雨动画，或者其他类似的东西是完全有效的。

这在技术上来说也是有效的（注意空格）：

```js
42 .toFixed(3); // "42.000"
```

但是，特别是`number`字面量来说，这是特别 **令人困惑的编码风格** ，除了混淆其他开发人员（以后的你）之外毫无用处。避免他。

`number` 还可以使用科学计数法的形式指定，这在表示很大的 `number` 时很常见，例如：

```js
var onethousand = 1E3;						// 1 * 10^3
var onemilliononehundredthousand = 1.1E6;	// 1.1 * 10^6
```

`number`字面量也可以用其他进制表示，如二进制，八进制和十六进制。

这些格式适用于当前版本的JavaScript：

```js
0xf3; // 十六进制的 for: 243
0Xf3; // 同上

0363; // 八进制 for: 243
```

**注意：** 从ES6+的严格模式开始，不再允许使用`0363`形式的八进制文字（请参阅下面的新表单）。`0363`表单仍然允许在非严格模式下，但你应该停止使用它，拥抱未来（并且因为你现在应该使用严格模式！）。

至于 ES6，下面的新形式也是合法的：

```js
0o363;		// 八进制 for: 243
0O363;		// 同上

0b11110011;	// 二进制 for: 243
0B11110011; // 同上
```

请各位开发人员帮忙：永远不要使用`0O363`形式。把 `0` 放在大写的 `O` 旁边就是在制造困惑。始终使用小写谓词`0x`，`0b`和`0o`。

### Small Decimal Values

使用二进制浮点数的最出名的副作用（记住，对于使用IEEE 754的所有语言都是如此 - 不仅仅是JavaScript假设/假装）：

```js
0.1 + 0.2 === 0.3; // false
```

在数学上，我们知道该陈述应该是`true`。为什么这是`false`？

简单地说，二进制浮点的`0.1`和`0.2`的表示不精确，所以当它们相加时，结果不是精确的表示`0.3`。它真的很接近：`0.30000000000000004`，但如果你的比较失败，“接近”是没用的。

**注意：** JavaScript 应当切换到可以精确表达所有值的一个不同 `number` 实现吗？有些人认为应该。多年以来有许多替代方案提出来。它们都没有被接受，也许永远不会被接受。它看起来就像挥挥手然后说“已经改好那个 bug 了!”那么简单，但根本不是那么容易。如果真有那么简单，它肯定就在很久以前被改掉了。

现在，问题是，如果不能确切地说某些`number`是准确的，那是否意味着我们根本不能使用`number`？**当然不是。** 

在某些应用程序中，你需要更加小心，尤其是在处理小数十进制值时。还有很多（可能是大多数？）应用程序只处理整数（“整数”），而且，只处理数百万或最多数万亿的数字。这些应用程序使用 JS 中的数字操作已经并且始终是 **非常安全** 的。

如果我们 *确实* 需要比较两个 `number`，就像 `0.1 + 0.2` 与 `0.3`，知道简单的相等测试失败了怎么办？

最常被接受的做法是使用微小的“舍入误差”值作为比较容差。这个微小的值通常被称为“machine epsilon”，对于JavaScript中的`number`类型通常是`2^-52(2.220446049250313e-16)`。

从ES6开始，`Number.EPSILON`是使用此容差值预定义的，因此你需要使用它，但你可以安全地填充pre-ES6的定义：

```js
if (!Number.EPSILON) {
	Number.EPSILON = Math.pow(2,-52);
}
```

们可以使用这个`Number.EPSILON`比较两个`number`的“相等”（在舍入误差容限内）：

```js
function numbersCloseEnoughToEqual(n1,n2) {
	return Math.abs( n1 - n2 ) < Number.EPSILON;
}

var a = 0.1 + 0.2;
var b = 0.3;

numbersCloseEnoughToEqual( a, b );					// true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 );	// false
```

可以表示的最大浮点值大约是`1.798e + 308`（这真的非常非常大！），预定义为`Number.MAX_VALUE`。在极小值上，`Number.MIN_VALUE`大约是`5e-324`，这不是负数，但实际上接近于零！

### Safe Integer Ranges

由于`number`的表示方式，`number`“整数”有一个“安全”值范围，并且明显小于`Number.MAX_VALUE`。

可以“安全地”的表示最大整数（就是可以保证被表示的值是实际可以正确	地表示的）是`2^53 - 1`，也就是`9007199254740991`，如果你插入一些数字分隔符，可以看到它刚好超过9万亿。所以对于`number`的范围来说这是非常大的。

这个值实际上是在ES6中自动预定义的，如`Number.MAX_SAFE_INTEGER`。你可能会想到，有一个最小值，`-9007199254740991`，它在ES6中定义为`Number.MIN_SAFE_INTEGER`。

JS程序在处理如此大的数字时遇到的主要情况是处理来自数据库等的64位ID。使用`number`类型无法准确表示64位数字，因此必须使用`string`表示形式存储（并传输 到/来自）JavaScript。

谢天谢地，对如此大的ID`number`进行数值运算（除了比较之外，对于`string`也没有问题）并不是那么常见。但是如果你确实需要对这些非常大的值进行数学计算，那么现在你需要使用一个大数字工具。大数字可能会在未来的JavaScript版本中获得官方支持。

### Testing for Integers

要测试值是否为整数，可以使用ES6指定的`Number.isInteger(..)`：

```js
Number.isInteger( 42 );		// true
Number.isInteger( 42.000 );	// true
Number.isInteger( 42.3 );	// false
```

要为ES6之前添加`Number.isInteger()`(垫片)：

```js
if (!Number.isInteger) {
	Number.isInteger = function(num) {
		return typeof num == "number" && num % 1 == 0;
	};
}

```

要测试值是否为安全整数，使用ES6指定的`Number.isSafeInteger(..)`：

```js
Number.isSafeInteger( Number.MAX_SAFE_INTEGER );	// true
Number.isSafeInteger( Math.pow( 2, 53 ) );			// false
Number.isSafeInteger( Math.pow( 2, 53 ) - 1 );		// true
```

在浏览器上为ES6之前添加`Number.isSafeInteger(..)`垫片:

```js
if (!Number.isSafeInteger) {
	Number.isSafeInteger = function(num) {
		return Number.isInteger( num ) &&
			Math.abs( num ) <= Number.MAX_SAFE_INTEGER;
	};
}
```

### 32-bit (Signed) Integers

虽然整数可以安全地达到大约9万亿（53位），但是有一些数字运算（如位运算符）仅为32位`number`定义，因此以这种方式使用的`number`的“安全范围”必须得小很多。

这个范围是 `Math.pow(-2,31)`（`-2147483648`，约-21亿）到 `Math.pow(2,31)-1`（`2147483647`，约+21亿）。

要强制 `a` 中的 `number` 值是32位有符号整数，请使用 `a | 0`，这是因为 `|` 按位运算符仅适用于32位整数值（意味着它可以只能注意到32位，而其他的位将丢失）。而且，和 0 进行“或”的位操作基本上上是什么也不做。

**注意：** 某些特殊值（我们将在下一节中介绍），例如`NaN`和`Infinity`，不是“32位安全”，当这些值被传入位操作符时将会通过一个抽象操作 `ToInt32`（见第四章）并为了位操作而简单地变成 `+0` 值。

### Special Values

JS开发人员需要了解并正确使用各种类型的特殊值。

### The Non-value Values

对于`undefined`类型，他只有一个值：`undefined`。对于`null`类型，他也只有一个值：`null`。因此，对于它们两者而言，标签既是其类型又是其值。

`undefined`和`null`都经常被视为可以互换为“空”值或“没有”值。有些开发人员更喜欢区分它们的细微差别。例如：

- `null`是一个空值
- `undefined`是缺失值

或者说：

- `undefined`表示还没有值
- `null`表示之前有值，现在没有了

无论你如何选择“定义”并使用这两个值，`null`都是一个特殊的关键字，而不是标识符，因此你不能将其视为要分配的变量（为什么要去分配变量！？）。但是，`undefined`（不幸的是）是一个标识符。哦，哦。

### Undefined

在非严格模式下，实际上可以（尽管非常不明智！）为全局提供的`undefined`标识符赋值：

```js
function foo() {
	undefined = 2; // 真是一个糟糕的想法!
}

foo();
```

```js
function foo() {
	"use strict";
	undefined = 2; // TypeError!
}

foo();
```

但是，在非严格模式和严格模式下，你都可以创建名为`undefined`的局部变量。但同样，这是一个糟糕的主意！

```js
function foo() {
	"use strict";
	var undefined = 2;
	console.log( undefined ); // 2
}

foo();
```

**朋友们, 不要让朋友覆盖`undefined`。永远。**

#### `void` Operator

虽然`undefined`是一个内置的标识符，它保存（除非修改 - 见上文所述！）内置的`undefined`值，另一种获取此值的方法是`void`运算符。

表达式`void ___`“使”任何值都“空出”，因此表达式的结果始终是`undefined`。它不会修改现有值; 它只是确保运算符表达式不会返回任何值。

```js
var a = 42;

console.log( void a, a ); // undefined 42
```

按照惯例（主要来自C语言编程），通过使用`void`来表示单独的`undefined`值，你将使用`void 0`（尽管显然甚至是`void true`或任何其他`void`表达式都做同样的事情）。`void 0`，`void 1`和`undefined`之间没有实际区别。

但是，如果你需要确保表达式没有结果值（即使它有副作用），`void`操作符在这些情况下也很有用。

例如:

```js
function doSomething() {
	// 注意: `APP.ready` 是我们的应用程序提供
	if (!APP.ready) {
		// 稍后尝试
		return void setTimeout( doSomething, 100 );
	}

	var result;

	// 做一些其他的事情
	return result;
}

// 我们能马上做到吗
if (doSomething()) {
	// 处理下一个任务
}
```

这里，`setTimeout()`函数返回一个数值（定时器间隔的唯一标识符，如果你想取消它），但是我们想 `void` 它，这样我们函数的返回值不会在 `if` 语句上给出一个成立的误报。

许多开发人员更喜欢单独执行这些操作，它们的工作方式相同但不使用void运算符：

```js
if (!APP.ready) {
	// try again later
	setTimeout( doSomething, 100 );
	return;
}
```

通常，如果有个地方存在一个值（来自某个表达式）并且你发现它对于`undefined`的值才有用，请使用void运算符。这可能不会在你的程序中非常普遍，但在极少数情况下你确实需要它，它可能会非常有用。

### Special Numbers

`number`类型包括几个特殊值。我们将详细介绍每一个。

##### The Not Number, Number

如果在两个操作数都不为`number`的情况下执行任何数学运算（或可以解释为以10或16为进制的`number`的值），将导致运算无法生成有效的`number`，在这种情况下，将获得`NaN`值。

`NaN`字面意思是“不是一个`number`(not a number)”，虽然这个标签/描述非常差并且有误导，我们很快就会看到。将`NaN`视为“无效数字”，“失败数字”，甚至“数字不好”，而不是将其视为“不是数字”，这样会更准确。

例如:

```js
var a = 2 / "foo";		// NaN

typeof a === "number";	// true
```

换句话说：“非数字的类型是'数字'！”令人困惑的名字和语义。

`NaN`是一种“哨兵值”（一种赋予特殊含义的正常值），表示`number`集内的一种特殊错误条件。错误条件本质上是：“我试图执行数学运算但失败了，所以这里是失败的`number`结果。”

所以，如果你在某个变量中有一个值并想要测试它是否是这个特殊的失败数字`NaN`，你可能会认为你可以直接与`NaN`本身进行比较，就像你可以使用任何其他值进行自身比较，如`null`或`undefined`。并不是这样。

```js
var a = 2 / "foo";

a == NaN;	// false
a === NaN;	// false
```

`NaN`是一个非常特殊的值，因为它永远不会等于另一个`NaN`值（即，它永远不会等于它自己）。事实上，这是唯一的一个值，它不是反身的（没有标识特征，`x === x`）。所以，`NaN！== NaN`。有点奇怪，是吧？

那么我们如何测试它，如果我们无法与`NaN`进行比较（因为这种比较总会失败）？

```js
var a = 2 / "foo";

isNaN( a ); // true
```

够容易吧？我们使用名为`isNaN()`的内置全局实用程序，它告诉我们值是否为`NaN`。问题解决了！

没那么快。

`isNaN`有一个致命的缺陷。

似乎它试图从字面上理解`NaN`（“不是数字”）的含义 - 它的工作基本上是：“测试传入的东西要么不是`number`，要么是`number`。”但那不太准确。

```js
var a = 2 / "foo";
var b = "foo";

a; // NaN
b; // "foo"

window.isNaN( a ); // true
window.isNaN( b ); // true -- ouch!
```

显然，`"foo"`实际上不是一个`number`，但它绝对不是`NaN`值！这个bug从一开始就存在于JS中（超过19年的,哎呀）。

从ES6开始，终于提供了一个替换实用程序：`Number.isNaN()`。它是一个简单的polyfill，因此即使在ES6之前的浏览器中也可以安全地检查`NaN`值：

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return (
			typeof n === "number" &&
			window.isNaN( n )
		);
	};
}

var a = 2 / "foo";
var b = "foo";

Number.isNaN( a ); // true
Number.isNaN( b ); // false -- phew!
```

实际上，我们可以通过利用`NaN`不等于它本身的特殊事实来更容易地实现`Number.isNaN()`polyfill。`NaN`是整个语言中唯一这样的值;每个其他值总是等于它自己。

因此：

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return n !== n;
	};
}
```

很奇怪，是吗？但它的确有效！

无论是故意的还是偶然的，`NaN`都可能在许多真实的JS程序中成为现实。使用可靠的测试（如提供（或polyfilled）的`Number.isNaN()`）来正确识别它们是一个非常好的主意。

如果你现在正在程序中使用`isNaN()`，那么可悲的是你的程序有一个bug，即使你还没有被它坑过！

##### Infinities

像C这样的传统编译语言的开发人员可能习惯于查看编译器错误或运行时异常，例如“除以零”，对于以下操作：

```js
var a = 1 / 0;
```

但是，在JS中，此操作是明确定义的，并导致值`Infinity`（又名`Number.POSITIVE_INFINITY`）。不出所料：

```js
var a = 1 / 0;	// Infinity
var b = -1 / 0;	// -Infinity
```

正如你所看到的，`-Infinity`（又名`Number.NEGATIVE_INFINITY`）是由除数操作数中的任何一个（但不是两个！）为负的结果产生的。

JS使用有限数字表示（IEEE 754浮点，我们之前介绍过），所以与纯数学相反，看起来甚至可以通过加法或减法等操作溢出，在这种情况下你会得到`Infinity`或`-Infinity`。

比如：

```js
var a = Number.MAX_VALUE;	// 1.7976931348623157e+308
a + a;						// Infinity
a + Math.pow( 2, 970 );		// Infinity
a + Math.pow( 2, 969 );		// 1.7976931348623157e+308
```

根据规范，如果像加法这样的操作导致值太大而无法表示，则IEEE 754“舍入到最近”模式会指定结果应该是什么。所以粗略的意义上，`Number.MAX_VALUE + Math.pow( 2, 969 )` 更更接近于 `Number.MAX_VALUE`而不是`Infinity` ，所以它“向下舍入”，而 `Number.MAX_VALUE + Math.pow( 2, 970 )` 距离 `Infinity` 更近，所以它“向上舍入”。

如果你对此有太多的考虑，它会让你头疼。所以不要想太多。说真的，停下来！然而，一旦你溢出到任何一个无穷大，就没有回头路了。换句话说，用更具有诗意的话来说就是，你可以从有限到有无穷，但不能从无限回到有限。

有个哲学的问题，问：”无限除以无限等于什么”。我们天真的大脑可能会说“1”或“无限”。事实表明它们都不对。无论在数学上还是在 JavaScript 中，`Infinity / Infinity` 不是一个有定义的操作。在 JS 中，它的结果为 `NaN`。

但是，任何正有限`number`除以无穷大怎么样？这很简单！`0`。那么负有限`number`除以无穷大呢？继续阅读！

##### Zeros

虽然它可能会混淆数学思想的读者，但JavaScript既有正常的零`0`（也称为正零`+0`）和负零`-0`。在我们解释`-0`存在的原因之前，我们应该检查JS如何处理它，因为它可能非常令人困惑。

除了字面上指定为`-0`之外，负零也是某些数学运算的结果。例如：

```js
var a = 0 / -3; // -0
var b = 0 * -3; // -0
```

加法和减法不会导致负零。

在开发人员控制台中检查时，负零通常会显示`-0`，但直到最近才出现这种情况，因此你遇到的某些较旧的浏览器仍可能将其报告为`0`。

但是，如果你尝试将负值归零，则根据规范，它将始终报告为`“0”`。

```js
var a = 0 / -3;

// 某些浏览器可以正确的输出
a;							// -0

// 但是规范坚持忽悠你
a.toString();				// "0"
a + "";						// "0"
String( a );				// "0"

// 奇怪的是，即使json也会忽悠你
JSON.stringify( a );		// "0"
```

有趣的是，反向操作（从`string`到`number`）不是谎言：

```js
+"-0";				// -0
Number( "-0" );		// -0
JSON.parse( "-0" );	// -0
```

**警告：** 当你观察的时候，`JSON.stringify( -0 )` 产生 `"0"` 的行为特别奇怪，因为它与反向操作不符：`JSON.parse( "-0" )`将像你期望地那样是`-0`。

除了负零的字符串化是欺骗性的以隐藏其真实值之外，比较运算符也（有意地）被配置为谎言。

```js
var a = 0;
var b = 0 / -3;

a == b;		// true
-0 == 0;	// true

a === b;	// true
-0 === 0;	// true

0 > -0;		// false
a > b;		// false
```

然，如果你想在代码中区分`-0`和`0`，你不能只依赖开发人员控制台输出的内容，所以你必须更聪明一点：

```js
function isNegZero(n) {
	n = Number( n );
	return (n === 0) && (1 / n === -Infinity);
}

isNegZero( -0 );		// true
isNegZero( 0 / -3 );	// true
isNegZero( 0 );			// false
```

现在，除了学术琐事之外，为什么我们还需要负零？

在某些应用中，开发人员使用一个值的大小来表示一条信息（如每个动画帧的移动速度）和该`number`的符号来表示另一条信息（如移动方向）。

在那些应用程序中，作为一个例子，如果变量到达零并且它丢失了它的符号，那么在它到达零之前你将失去它正在移动的方向的信息。保留零的符号可防止可能不需要的信息丢失。

### Special Equality

如上所述，`NaN`值和`-0`值在进行相等比较时具有特殊的行为。`NaN`永远不会与自身相等，所以你必须使用ES6的`Number.isNaN`（或polyfill）。类似地，`-0`假装它是相等的（甚至===严格相等 - 见第4章）到正`0`，所以你必须使用我们上面建议的有点黑科技的 `isNegZero`实用程序。

ES6开始，有一个新的实用程序可用于测试两个绝对相等的值，并且没有任何异常。它叫做`Object.is`：

```js
var a = 2 / "foo";
var b = -3 * 0;

Object.is( a, NaN );	// true
Object.is( b, -0 );		// true

Object.is( b, 0 );		// false
```

对于ES6之前的环境，`Object.is`有一个非常简单的polyfill：

```js
if (!Object.is) {
	Object.is = function(v1, v2) {
		// test for `-0`
		if (v1 === 0 && v2 === 0) {
			return 1 / v1 === 1 / v2;
		}
		// test for `NaN`
		if (v1 !== v1) {
			return v2 !== v2;
		}
		// everything else
		return v1 === v2;
	};
}
```

`Object.is(..)` 可能不应当用于那些 `==` 或 `===` 已知是 *安全* 的情况（见第四章“强制转换”），因为运算符可能更有效，当然更惯用/常见。`Object.is(..)` 主要用于这些特殊的等价情况。

### Value vs. Reference

在许多其他语言中，值可以通过值复制或通过引用副本分配/传递，具体取决于你使用的语法。

例如，在 C++ 中，如果要把一个 `number` 变量传递给一个函数并更新这个变量的值，你可以用 `int& myNum` 这样的东西来声明函数参数，当你传入一个变量 `x` 时，`myNum` 将是一个 **对 x 的引用**；引用就像一个特殊形式的指针，你可以在其中获取指向另一个变量的指针（像一个 *别名（alias）*） 。如果未声明一个引用参数，则将始终复制传入的值，即使它是复杂对象也是如此。

在JavaScript中，没有指针，引用的工作方式略有不同。你不能从一个JS变量引用另一个变量。那是不可能的。

JS 中的引用指向一个（共享的） **值(value)**，所以如果你有十个不同的引用，它们都总是同一个共享值的不同引用；**它们都不是彼此的引用/指针。**

此外，在JavaScript中，没有语法提示可以控制值与引用赋值/传递。相反，值的 *类型* 仅控制是通过值复制还是通过引用副本复制该值。

让我们来说明一下：

```js
var a = 2;
var b = a; // `b` is always a copy of the value in `a`
b++;
a; // 2
b; // 3

var c = [1,2,3];
var d = c; // `d` is a reference to the shared `[1,2,3]` value
d.push( 4 );
c; // [1,2,3,4]
d; // [1,2,3,4]
```

简单值（也称为scalar primitives(标量基元)）总是由 值复制 分配/传递：`null`，`undefined`，`string`，`number`，`boolean`和ES6的`symbol`。

复合值 -`object`（包括`array`和所有盒装对象包装器 - 请参阅第3章）和`function` - 始终在赋值或传递时创建引用的副本。

在上面的代码片段中，因为`2`是标量基元，`a`持有该值的一个初始副本，并且`b`被赋予该值的另一个副本。更改`b`时，你无法更改`a`中的值。

但是 **c和d都是** 对相同共享值`[1,2,3]`的单独引用，它是一个复合值。重要的是要注意，`c`和`d`都不“拥有”`[1,2,3]`值 - 两者都只是对值的对等引用。因此，当使用任一引用来修改（`.push(4)`）实际的共享`array`值本身时，它只影响一个共享值，并且两个引用都将引用新修改的值`[1,2,3,4]`。

由于引用指向值本身而不是变量，因此你不能使用一个引用来更改指向另一个引用的位置：

```js
var a = [1,2,3];
var b = a;
a; // [1,2,3]
b; // [1,2,3]

// later
b = [4,5,6];
a; // [1,2,3]
b; // [4,5,6]
```

当我们进行赋值`b = [4,5,6]`时，我们绝对不会对`a`仍在引用的位置(`[1,2,3]`)造成任何影响。要做到这一点，`b`必须是一个指向`a`的指针，而不是对`array`的引用 - 但JS中没有这样的功能！

这种混淆最常见的方式是使用函数参数：

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x = [4,5,6];
	x.push( 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [1,2,3,4]  not  [4,5,6,7]
```

当传递参数`a`,他为`x`赋值了`a`引用的拷贝。`x`和`a`都指向相同`[1,2,3]`值的单独引用。现在，在函数内部，我们可以使用该引用来改变值本身（`push(4)`）。但是当我们进行赋值`x = [4,5,6]`时，这决不会影响初始引用`a`指向的位置 - 仍然指向（现在修改的）`[1,2,3,4]`值。

这里没有办法使用`x`引用来改变`a`指向的位置。我们只能修改`a`和`x`指向的共享值的内容。要完成更改`a`以获得`[4,5,6,7]`值内容，你无法创建新数组并分配 - 你必须修改现有数组值：

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x.length = 0; // 情况现有数组
	x.push( 4, 5, 6, 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [4,5,6,7]  not  [1,2,3,4]
```

正如你所看到的那样，`x.length = 0`和`x.push(4, 5, 6, 7)`没有创建新的`array`。但是修改了现有的共享的`array`。当然，`a`引用新的内容`[4,5,6,7]`。

请记住：你无法直接控制/覆盖值的复制与引用 - 这些语义完全由基础值的类型控制。

要通过值复制有效地传递复合值（如数组），你需要手动复制它，所以传递的引用仍然不指向原始引用。例如：

```js
foo( a.slice() );
```

默认情况下，没有参数的`slice()`会生成一个全新的（浅）拷贝版`array`。所以，我们只传入一个引用复制的`array`，因此`foo()`不能影响`a`的内容。

反之 —— 传递一个标量原始值，使它的值的变化可见，就像引用那样 —— 你必须将值包装在可以传递的另一个复合值（`object`、`array` 等等）：

```js
function foo(wrapper) {
	wrapper.a = 42;
}

var obj = {
	a: 2
};

foo( obj );

obj.a; // 42
```

这里，`obj`充当标量原始属性`a`的包装器。传递给`foo(..)`时，会传入`obj`引用的副本并设置为`wrapper`参数。我们现在可以使用`wrapper`引用来访问共享对象，并更新其属性。函数完成后，`obj.a`更新到值`42`。

你可能会想到，如果你想传入一个像`2`这样的标量原始值的引用，你可以在其`Number`对象包装器中装入该值（参见第3章）。

确实，这个`Number`对象的引用副本将被传递给函数，但不幸的是，拥有对共享对象的引用不会让你去修改共享原语值，就像你期望的那样：

```js
function foo(x) {
	x = x + 1;
	x; // 3
}

var a = 2;
var b = new Number( a ); // or equivalently `Object(a)`

foo( b );
console.log( b ); // 2, not 3
```

问题是底层标量原语值不可变（`String`和`Boolean`也是如此）。如果一个`Number`对象持有一个原始值`2`，那么这个永远不可能更改成持有其他的值；你只能使用不同的值创建一个全新的`Number`对象。

当在表达式`x + 1`中使用`x`时，基础标量原始值`2`将自动从`Number`对象中取消装箱（提取），所以`x = x + 1`行非常巧妙地将`x`作为共享引用更改为`Number`对象，由于加法运算`2 + 1`而仅保持标量原始值`3`。因此，外部的`b`仍引用持有值`2`的 未修改/不可变 的`Number`对象。

你可以在`Number`对象之上添加属性（只是不更改其内部原始值），因此你可以通过这些其他属性间接交换信息。

然而，这并不常见;它可能不被大多数开发人员认为是一个好习惯。

而不是以这种方式使用包装器对象`Number`，在早期的代码片段中使用手动对象包装器（`obj`）方法可能要好得多。这并不是说像`Number`这样的盒装对象包装器没有好的用法 - 只是你应该在大多数情况下使用标量的原始值形式。

引用非常强大，但有时会妨碍你，有时你需要它们时，它们不存在。你对引用与值复制行为的唯一控制是值本身的类型，因此你必须间接影响你选择使用的值类型的赋值/传递行为。

### Review

在JavaScript中，`array`只是数字索引的任何值类型的集合。`string`有些“类似于`array`”，但它们具有不同的行为，如果要将它们视为`array`，则必须小心。JavaScript中的数字包括“整数”和浮点值。

在基础类型中定义了几个特殊值。

`null`类型只有一个值：`null`，和`undefined`类型一样，只有一个`undefined`值。如果不存在其他值，则`undefined`基本上是任何变量或属性中的默认值。`void`运算符允许你从任何其他值创建`undefined`的值。

`number`也有几个特殊的值，比如`NaN`(据说“不是数字”，但应更恰当的称呼为“无效数字”)；`+Infinity` 和 `-Infinity`也特殊;还有`-0`。

简单的标量基元（`string`，`number`等）由值复制进行 分配/传递，而复合值（`object` 等）通过引用复制进行赋值/传递。用与其他语言中的引用/指针不同 - 它们从不指向其他变量/引用，仅指向底层的值。

