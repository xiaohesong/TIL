# Chapter 4: Generators

在第2章中，我们确定了使用回调表示异步流控制的两个主要缺点：

- 基于回调的异步不适合我们的大脑计划任务的步骤。
- 由于*控制反转*，回调不可信也不可组合。

在第三章中，我们详细介绍了promise如何反转回调的*控制反转*，恢复可信任/可组合性。

现在我们将注意力转向以顺序，同步的方式表达异步流控制。 使之成为可能的“魔法”是ES6的 **generators** 。

## 打破运行到完成

在第1章中，我们解释了JS开发人员在他们的代码中几乎普遍依赖的一个期望:一旦一个函数开始执行，它就会一直运行到它完成，在这期间没有其他代码可以中断和运行。

尽管看起来很奇怪，但ES6引入了一种新类型的函数，它不具有运行到完成行为。这种新类型的函数叫做“generator(生成器)”。

为了理解其中的含义，让我们来看看这个例子:

```js
var x = 1;

function foo() {
	x++;
	bar();				// <-- what about this line?
	console.log( "x:", x );
}

function bar() {
	x++;
}

foo();					// x: 3
```

在本例中，我们确定`bar()`运行在`x++`和`console.log(x)`之间。但是如果没有`bar()`呢?显然，结果是`2`而不是`3`。

现在让我们来激发你的大脑。如果`bar()`不存在，但是它仍然可以在`x++`和`console.log(x)`语句之间运行，那会怎么样? 这怎么可能呢？

在 **抢占式(preemptive)** 多线程语言中，`bar()`基本上可以“中断”并在这两个语句之间的恰当时刻运行。但是JS不是抢占式的，也不是(目前)多线程的。然而，这种“中断”(并发)的 **协作(cooperative)** 形式是可能的，如果`foo()`本身能够以某种方式表示代码中该部分的“暂停”。

**注意：** 我使用“协作”这个词不仅是因为它与经典并发术语的关联(请参阅第1章)，还因为在下一个代码片段中你将看到，用于指示代码中暂停点的ES6语法是yield——这意味着一种礼貌的协作式控制让步。

面是实现这种协同并发的ES6代码:

```js
var x = 1;

function *foo() {
	x++;
	yield; // pause!
	console.log( "x:", x );
}

function bar() {
	x++;
}
```

**注意：** 你可能会看到大多数其他JS文档/代码将generator声明格式化为`function* foo() {..}`而不是像我在这里用`function *foo() { .. }`——唯一的区别是`*`的定位。这两种形式在功能/语法上是相同的，第三个`function*foo() { .. }`(无空格)形式。这里的论点都只是风格而已，但我基本上更喜欢`function *foo..`因为当我用`*foo()`引用一个generator(生成器)时，它更匹配一点。如果我只说`foo()`，你就不能很清楚的知道我说的是generator(生成器)还是普通函数了。这纯粹是一种风格偏好。

现在，我们如何运行前面代码片段中的代码，使`bar()`在`*foo()`内的`yield`处执行?

```js
// 构造一个名为`it`的iterator去控制generator
var it = foo();

// 在这里开始`foo()`!
it.next();
x;						// 2
bar();
x;						// 3
it.next();				// x: 3
```

好的，在这两个代码片段中有相当多的新内容，可能会让人感到困惑，所以我们有很多东西要学习。但是在我们解释ES6generator的不同机制/语法之前，让我们先看看行为流:

1. `it = foo()`操作还*没有运行* `*foo()` generator，但是他构造了一个*iterator* 去控制执行。有关*iterator*的更多信息(译：后面会介绍)。
2. 第一个`it.next()`开始了`*foo()` generator，并在`*foo()`的第一行运行`x++`。
3. `*foo()`在`yield`语句处暂停，此时第一次`it.next()`调用结束。目前，`*foo()`仍在运行并处于活动状态，但它处于暂停状态。
4. 我们检查`x`的值，现在是`2`。
5. 我们调用`bar()`，再次经过`x++`对`x`进行累加。
6. 我们检查`x`的值，现在是`3`。
7. 最后的`it.next()`调用从暂停的地方恢复`*foo()` generator，并运行`console.log(..)`语句，他使用现在的值为`3`的`x`。

很明显，`*foo()`开始后，但是并*没有*运行到完成 -- 在`yield`处暂停了。稍后我们恢复`*foo()`，并让它完成，但这甚至不是必需的。

因此一个generator是一个特殊类型的函数，他可以开始和停止一次或多次，甚至没有必要去结束。虽然为什么它如此强大还不是那么明显，但随着本章其余部分的深入，它将成为我们代码的模式用来构造generator作为异步流控制的基本构建块。

### 输入和输出

Generator函数是一个特殊的函数，我们刚才提到了新的处理模型。但它仍然是一个函数，这意味着它仍然有一些基本的原则没有改变 -- 他仍然接收参数(也就是“输入”)，并且仍然可以返回一个值(也就是“输出”)。

```js
function *foo(x,y) {
	return x * y;
}

var it = foo( 6, 7 );

var res = it.next();

res.value;		// 42
```

我们传递参数`6`和`7`分别作为`*foo()`的`x`,`y`参数。并且`*foo(..)`返回了一个值`42`。

我们现在看到与正常函数相比调用generator的方式有所不同。`foo(6,7)`看起来很眼熟。但有意思的是，`*foo(..)` generator还没有像普通函数那样实际运行。反而是我们只是创建了一个*iterator*对象，他赋值给变量`it`去控制`*foo()`generator函数。然后我们调用`it.next()`,，它指示`*foo(..)`generator从当前位置前进，在generator的下一个`yield`点或结束点停止。

`next(..)`调用的结果是一个存在`value`属性的对象，这个属性保存了从`*foo()`返回的任意值(如果有返回)。换句话说，`yield`导致一个值在generator执行过程中从generator发出，有点像中间`return`。

同样，现在还不清楚为什么我们需要整个间接*iterator*对象来控制generator。我们会了解到那里的，我保证。

#### 迭代消息

除了generator接受参数并具有返回值之外，通过`yield`和`next(..)`，generator还内置了更强大、更引人注目的输入/输出消息传递功能。

考虑下面代码：

```js
function *foo(x) {
	var y = x * (yield);
	return y;
}

var it = foo( 6 );

// start `foo(..)`
it.next();

var res = it.next( 7 );

res.value;		// 42
```

首先，我们传递了`6`作为参数`x`。然后我们调用`it.next()`，他开始了`*foo()`。

`*foo(..)`的内部，`var y = x ..`语句开始被处理，但随后它运行在一个`yield`表达式中。此时，他暂停了`*foo()`(在赋值语句的中间暂停了!)，并请求调用代码为`yield`表达式提供结果值。接下来我们调用`it.next(7)`，它将返回值`7`作为暂停的`yield`表达式的结果。因此，此时，赋值语句基本上是`var y = 6 * 7`。现在，`return y`返回了值`42`作为`it.next(7)`调用的结果。

注意一些非常重要但也容易混淆的东西，即使对经验丰富的JS开发人员也是如此:根据你的观察，yield和next(..)调用之间存在不匹配。通常，你将比`yield`语句多调用一个`next(..)`调用——前面的代码片段有一个`yield`和两个`next(..)`调用。

为什么不匹配？

因为第一个`next(..)`总是去开始一个generator，并运行到第一个`yield`之后暂停。但是第二个`next(..)`调用将完成第一个暂停的`yield`表达式，第三个`next(..)`调用将完成第二个`yield`，依此类推。

##### 两个问题的故事

实际上，你主要考虑哪些代码影响到你是否存在感知上的不匹配。

只考虑generator代码：

```js
var y = x * (yield);
return y;
```

**第一个** `yield`基本上是*问* :“我应该在这里插入什么值?”

谁来回答这个问题? 好的，**第一个** `next()`已经运行了，以使generator运行到这一点，所以显然它不能回答这个问题。因此，**第二个** `next(..)`调用必须回答 **第一个** `yield` *提出* 的问题。

看到第二对第一的不匹配了吗?

但让我们换个角度来看看。让我们不从generator的角度，而是从iterator的角度来看它。

为了恰当地说明这个观点，我们还需要解释消息可以双向传递——`yield ..`。因为表达式可以发送消息响应`next(..)`调用，而`next(..)`可以向暂停的`yield`表达式发送值。考虑一下这个稍微调整过的代码:

```js
function *foo(x) {
	var y = x * (yield "Hello");	// <-- yield一个值!
	return y;
}

var it = foo( 6 );

var res = it.next();	// 第一个 `next()`, 没有传递任何东西
res.value;				// "Hello"

res = it.next( 7 );		// 传递 `7` 到等待的 `yield`
res.value;				// 42
```

`yield ..`和`next(..)` **在generator执行期间** 作为双向消息传递系统配对。

所以，只需要看*iterator*代码：

```js
var res = it.next();	// 第一个 `next()`, 没有传递任何东西
res.value;				// "Hello"

res = it.next( 7 );		// 传递 `7` 到等待的 `yield`
res.value;				// 42
```

**注意：** 我们没有给第一个`next()`调用传递值，这是故意的。只有暂停的`yield`才能接受`next(..)`传递的这样一个值，在generator的开头，当我们调用第一个`next()`时，没有暂停的`yield`来接受这样一个值。该规范和所有兼容的浏览器只是静静地 **丢弃** 传递给第一个`next()`的任何内容。传递一个值仍然是一个糟糕的主意，因为你只是创建一个令人困惑的静默“失败”的代码。因此，始终使用无参数`next()`启动generator。

第一个`next()`调用(没有传递参数的)基本就是*问*一个问题:"`*foo()`generator不得不给我的*下一个*值是什么？" 谁来回答这个问题？第一个`yield "hello"`表达式来回答。

看到没有？没有不匹配。

取决于你认为是谁问的这个问题，`yield`和`next()`调用要么匹配要么不匹配。

但是等一下！与`yield`语句的数量相比，仍然有一个额外的`next()`。因此，最后的`it.next(7)`调用再次问了一个generator将产生的*下一个*值的问题。但是这里没有更多的`yield`语句去回答，对吗？所以谁来回答？

`return`语句回答了这个问题。

如果在generator中 **没有`return`** ——generator中对`return`的要求肯定不像常规函数中那么需要——这里总有一个假设/隐式`return;`(又名`return undefined;`)，这是为了默认回答最终`it.next(7)`调用*提出*的问题。

这些问题和答案——带有`yield`和`next(..)`的双向消息传递——非常强大，但是根本不清楚这些机制如何与异步流控制相联系。我们这就去了解他!

### 多个迭代器

从语法用法来看，当你使用*iterator*控制generator时，你可能会控制声明的generator函数本身。但是有一个细微之处很容易被忽略:每次构造*iterator(迭代器)*时，你都在隐式地构造generator的一个实例，该generator将由*iterator*控制。

你可以让同一个generator的多个实例同时运行，它们甚至可以相互作用:

```js
function *foo() {
	var x = yield 2;
	z++;
	var y = yield (x * z);
	console.log( x, y, z );
}

var z = 1;

var it1 = foo();
var it2 = foo();

var val1 = it1.next().value;			// 2 <-- yield 2
var val2 = it2.next().value;			// 2 <-- yield 2

val1 = it1.next( val2 * 10 ).value;		// 40  <-- x:20,  z:2
val2 = it2.next( val1 * 5 ).value;		// 600 <-- x:200, z:3

it1.next( val2 / 2 );					// y:300
										// 20 300 3
it2.next( val1 / 4 );					// y:10
										// 200 10 3
```

**警告：** 同时运行的同一generator的多个实例的最常见用法不是这种交互，而是当generator在没有输入的情况下生成自己的值时，可能来自一些独立连接的资源。我们将在下一节中详细讨论值的产生。

让我们简要介绍一下处理过程：

1. `*foo()`的两个实例同时启动，两个`next()`的调用分别从`yield 2`语句中得到一个值`2`。
2. `val2 * 10`是`2 * 10`，它被传递到第一个generator实例`it1`中，因此`x`得到值`20`。`z`从`1`累加到`2`，然后就是`yield`了`20 * 2`，设置`val1`为`40`。
3. `val1 * 5`是`40 * 5`，它被传递到第二个generator实例`it2`中，所以`x`得到值`200`。`z`再次累加，从`2`到`3`，然后就是`yield`了`200 * 3`，设置`val2`为`600`。
4. `val2 / 2`是`600 / 2`，它被传递到第一个generator实例`it1`中，因此`y`得到值`300`，然后分别为`x,y,z`打印出`20 300 3`。
5. `val1 / 4`是`40 / 4`，它被传递到第二个generator实例`it2`中，因此`y`得到值`10`，然后分别为`x,y,z`打印出`200 10 3`。

这是一个“有趣”的例子。和你脑海里想的答案是一样的吗?

#### 交错

回想一下第1章“Run-to-completion”一节中的这个场景:

```js
var a = 1;
var b = 2;

function foo() {
	a++;
	b = b * a;
	a = b + 3;
}

function bar() {
	b--;
	a = 8 + b;
	b = a * 2;
}
```

当然，对于普通的JS函数，要么`foo()`可以先完全运行，要么`bar()`可以先完全运行，但是`foo()`不能将其单独的语句与`bar()`交织在一起。因此，前面的程序只有两种可能的结果。

但是，使用generator，显然可以交错(甚至在语句中间):

```js
var a = 1;
var b = 2;

function *foo() {
	a++;
	yield;
	b = b * a;
	a = (yield b) + 3;
}

function *bar() {
	b--;
	yield;
	a = (yield 8) + b;
	b = a * (yield 2);
}
```

根据控制`*foo()`和`*bar()`的*iterator*调用的顺序，上面的程序可能会产生几个不同的结果。换句话说，通过将两个generator迭代交叉放在相同的共享变量上，我们实际上可以(以一种假的方式)说明第1章中讨论的理论“线程竞争条件”环境。

首先，让我们创建一个`step(..)`来控制*iterator*：

```js
function step(gen) {
	var it = gen();
	var last;

	return function() {
		// whatever is `yield`ed out, just
		// send it right back in the next time!
		last = it.next( last ).value;
	};
}
```

`step(..)`初始化了一个generator，创建了generator的`it` *iterator*。并返回了一个函数，当被调用的时候，*iterator*被前进了一步。此外，前面`yield`的值将在*下一*步直接返回。因此，`yield8`将变为`8`，`yieldb`将仅为`b`(无论`yield`是多少)。

现在，为了好玩，让我们来试验一下`*foo()`和`*bar()`这两个不同的块交错的效果。我们将从枯燥的基础案例开始，确保`*foo()`完全在`*bar()`之前完成(就像我们在第1章所做的那样):

```js
// make sure to reset `a` and `b`
a = 1;
b = 2;

var s1 = step( foo );
var s2 = step( bar );

// run `*foo()` completely first
s1();
s1();
s1();

// now run `*bar()`
s2();
s2();
s2();
s2();

console.log( a, b );	// 11 22
```

最终的结果是`11`和`22`，就像在第一章的版本中一样。现在让我们混合交错排序，看看它如何改变`a`和`b`的最终值:

```js
// make sure to reset `a` and `b`
a = 1;
b = 2;

var s1 = step( foo );
var s2 = step( bar );

s2();		// b--;
s2();		// yield 8
s1();		// a++;
s2();		// a = 8 + b;
			// yield 2
s1();		// b = b * a;
			// yield b
s1();		// a = b + 3;
s2();		// b = a * 2;
```

在我告诉你结果之前，你能算出在上一个程序之后`a`和`b`是什么吗?诚实的说出来!

```js
console.log( a, b );	// 12 18
```

**注意：** 作为读者的练习，试着看看你可以得到多少其他结果，通过组合来重新排列`s1()`和`s2()`调用的顺序。不要忘记你总是需要三个`s1()`调用和四个`s2()`调用。回想一下前面关于将next()与yield匹配的讨论。

几乎可以肯定的是，你不希望故意造成这种层次的交错混乱，因为这会造成难以理解的代码。但是，要了解更多关于多个generator如何在同一个共享范围内并发运行的知识，这个练习很有趣，也很有指导意义，因为在某些地方这种功能非常有用。

在本章的最后，我们将更详细地讨论generator并发性。

## Generator'ing 值

在上一节中，我们提到了generator的一个有趣的用途，作为一种产生值的方式。这 **不是** 本章的主要焦点，但如果我们没有涵盖基础知识，我们就会失职，特别是因为这个用例本质上是名称的起源：generator。

我们将稍微转移一下*iterators*的话题，但我们将回过头来讨论它们与generator的关系以及使用generator来*生成(generate)*值。

### 生产者和迭代器

假设你正在生成一系列值，其中每个值都与前一个值具有可定义的关系。要做到这一点，你需要一个有状态的生产者来记住它给出的最后一个值。

你可以使用函数闭包直接实现类似的东西（请参阅本系列的Scope＆Closures标题）：

```js
var gimmeSomething = (function(){
	var nextVal;

	return function(){
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		return nextVal;
	};
})();

gimmeSomething();		// 1
gimmeSomething();		// 9
gimmeSomething();		// 33
gimmeSomething();		// 105
```

**注意：** 这里的`nextVal`计算逻辑可能已被简化,但从概念上讲,我们不想计算*下一个值*(又名`nextVal`)直到下一次`gimmeSomething()`调用,因为通常这可能是资源泄漏设计的生产者 比简单`number`更持久或资源有限的值。

生成任意数字系列并不是一个非常现实的例子。 但是，如果从数据源生成记录呢？ 你可以想象很多相同的代码。

事实上，这个任务是一个非常常见的设计模式，通常由iterator(迭代器)解决。*iterator*是一个定义良好的接口，用于逐步执行生产者的一系列值。与大多数语言一样，用于迭代器的JS接口是在每次需要generator的下一个值时调用`next()`。

我们可以为我们的数字系列生产者实现标准迭代器接口：

```js
var something = (function(){
	var nextVal;

	return {
		// needed for `for..of` loops
		[Symbol.iterator]: function(){ return this; },

		// standard iterator interface method
		next: function(){
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			return { done:false, value:nextVal };
		}
	};
})();

something.next().value;		// 1
something.next().value;		// 9
something.next().value;		// 33
something.next().value;		// 105
```

**注意：** 我们将在“Iterables”部分解释为什么我们需要此代码段的`[Symbol.iterator]: ..`部分。从语法上来说，有两个ES6特性在发挥作用。首先，`[ .. ]`语法叫做*计算机属性名称*(见此系列的*this & Object Prototypes*标题)。这是对象字面量定义中指定表达式并使用表达式的结果作为属性名称的一种方法。接下来，`Symbol.iterator`是ES6预定义的特殊符号值之一（请参阅本书系列的ES6和Beyond标题）。

`next()`调用返回了含有两个属性的对象：`done`是一个`boolean`值表示*iterator*的完成状态；`value`存储了迭代的值。

ES6还添加了`for .. of`循环，这意味着一个标准的迭代器可以自动使用原生循环语法:

```js
for (var v of something) {
	console.log( v );

	// don't let the loop run forever!
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**注意：** 因为我们的`something` *iterator* 总是返回`down: false`，这个`for .. of`循环会一直跑，这就是为什么我们放一个`break`条件在里面。迭代器没有结束是完全可以的，但是也有这样的情况，*iterator*会运行有限的一组值，并最终返回`done:true`。

`for..of`循环会自动为每次迭代调用`next()` - 它不会将任何值传递给`next()` - 它会在收到`done: true`时自动终止。它对于循环一组数据非常方便。

当然，你可以手动遍历迭代器，调用`next()`并检查`done: true`条件，以知道何时停止:

```js
for (
	var ret;
	(ret = something.next()) && !ret.done;
) {
	console.log( ret.value );

	// don't let the loop run forever!
	if (ret.value > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**注意：** 这个手写的方法肯定比ES6 `for .. of`循环语法更加丑陋，但它的优点是它可以让你有机会在必要时将值传递给`next(..)`调用。

除了创建自己的*iterators*，JS(截至ES6)中的许多内置数据结构(如`array`)也有默认的*iterators*:

```js
var a = [1,3,5,7,9];

for (var v of a) {
	console.log( v );
}
// 1 3 5 7 9
```

`for..of`循环询问`a`的*iterator*，并自动使用它迭代`a`的值。

**注意：** ES6似乎有一个奇怪的遗漏，但是常规`object`不像`array`那样带有默认*iterator*。原因要比我们在这里讨论的更深。如果你想要的只是迭代一个对象的属性（没有特别的顺序保证），`Object.keys(..)` 返回一个 `array`，然后他可以像`for (var k of Object.keys(obj)) { ..`这样使用。对象的键上的这种`for..of`循环类似于`for..in`循环，除了`Object.keys(..)`不包含来自`[[Prototype]]`链的属性，而`for..in`却包含（ 请参阅本系列的this＆Object Prototypes标题。

### Iterables

在我们运行的示例中，`something`对象被称为*iterator*，因为它的接口上有`next()`方法。但是一个密切相关的术语是*iterable*，它是一个`object`，其中 **包含** 一个*iterator*，可以迭代它的值。

对于ES6，从*iterable*检索*iterator*的方法是*iterable*必须有一个函数，其名称是特殊的ES6符号值`symbol .iterator`。当这个函数被调用，他返回一个*iterator*。虽然不是必需的，但是通常每个调用都应该返回一个新的*iterator*。

上个代码片段中的`a`是一个*iterable*。`for..of`循环自动调用他的`Symbol.iterator`函数去构造一个*iterator*。但我们当然可以手动调用函数，并使用它返回的*iterator*:

```js
var a = [1,3,5,7,9];

var it = a[Symbol.iterator]();

it.next().value;	// 1
it.next().value;	// 3
it.next().value;	// 5
..
```

在前面定义`something`的代码清单中，你可能注意到了这一行:

```js
[Symbol.iterator]: function(){ return this; }
```

这段有点让人困惑的代码使得`something`值——`something` *iterator* 的接口——也是*iterable*的;现在他既是*iterable*也是*iterator*。然后我们传递`something`到`for .. of`循环。

```js
for (var v of something) {
	..
}
```

`for..of`循环期望`something`是*iterable*的，因此它会查找并调用其`Symbol.iterator`函数。我们定义了这个函数来简单地`return this`，所以它只是返回他本身，并且`for..of`循环是不知道的。

### Generator Iterator

现在把注意力移回到generator，在*iterator*的上下文中移回去。generator可以被视为值的生产者，我们通过*iterator*接口的`next()`调用一次提取一个值。

因此，generator本身在技术上并不是*iterable*的，尽管它非常相似 - 当你执行generator时，你会得到一个*iterator*：

```js
function *foo(){ .. }

var it = foo();
```

我们可以使用generator实现早期的`something`无限数字系列生产者，如下所示：

```js
function *something() {
	var nextVal;

	while (true) {
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		yield nextVal;
	}
}
```

**注意：** 在真正的js编程里使用`while..true`循环通常是一件非常糟糕的事情，至少在它没有`break`或`return`的情况下是这样，因为它很可能永远同步运行，并阻塞/锁定浏览器UI。但是，在generator中，如果它具有`yield`，这样的循环通常是完全正常的，因为generator将在每次迭代时暂停，`yield`返回主程序和/或事件循环队列。说得好听点，“generator把`while..true`带回到JS编程!”

那就更清洁简单，对吧？因为generator在每次`yield`时都会暂停，所以函数`*something()`的状态(作用域)保持不变，这意味着不需要闭包在调用之间保存变量状态。

它不仅是代码更简单——我们不必创建自己的*iterator*接口——实际上代码更合理，因为它更清楚地表达了意图。例如，`while..true循环告诉我们generator将永远运行——只要我们不断地询问值，就会一直*generating*值。

现在我们可以使用带有`for..of`循环的新`* something()`generator，你会看到它工作原理基本相同：

```js
for (var v of something()) {
	console.log( v );

	// 不让这个循环一直运行
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

但是不要跳过`for (var v of something()) ..`! 我们不只是像前面的例子那样引用`something`作为值，而是调用`*something()`generator来获取`for..of`循环的*iterator*去使用。

如果你仔细观察，generator和loop循环之间的相互作用可能会产生两个问题:

- 为什么我们不能说`for (var v of something) ..`? 因为`something`在这里是一个generator，他不是一个*iterable*。我们不得不调用`something()`来构造一个`for .. of`循环的生产者去迭代他。
- `something()`调用产生了一个*iterator*，但是`for .. of`循环想要一个*iterable*，对吧？是的。generator的*iterator*有一个`Symbol.iterator`函数在上面，他基本上就是`return this`，就像我们早前定义的`something` *iterable*。换句话说，generator的*iterator*也是一个*iterable*。

#### 停止 Generator

在前面的示例中，在调用循环中的`break`之后，`*something()`generator的*iterator*实例基本上永远处于挂起状态。

但是那里有一个隐藏的行为会照顾到你。`for..of`循环的“异常完成”(即“提前终止”) - 通常由`break`, `return`或未捕获的异常引起 - 向generator的*iterator*发送信号以使其终止。

**注意：** 从技术上讲，`for..of`循环还会在循环正常完成时将此信号发送到*iterator*。对于generator，这实际上是一个模拟操作，因为generator的*iterator*必须首先完成，`for..of`循环 才能完成。但是，自定义*iterators*可能希望从`for..of`循环使用者接收此额外信号。

虽然`for..of`循环会自动发送此信号，但你可能希望手动将信号发送到*iterator*;你通过调用`return(..)`来做到这一点。

如果指定`try..finally`子句在generator内部，即使generator在外部完成，它也将始终运行。这对于你需要清除一些资源的时候很有用处(数据库连接等)。

```js
function *something() {
	try {
		var nextVal;

		while (true) {
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			yield nextVal;
		}
	}
	// cleanup clause
	finally {
		console.log( "cleaning up!" );
	}
}
```

在`for..of`循环中使用`break`的早期示例将触发`finally`子句。但是你可以从外部使用`return(..)`手动终止generator的*iterator*实例。

```js
var it = something();
for (var v of it) {
	console.log( v );

	// 不让这个循环一直运行！
	if (v > 500) {
		console.log(
			// 完成generator的iterator
			it.return( "Hello World" ).value
		);
		// 这里没有`break`被需要
	}
}
// 1 9 33 105 321 969
// cleaning up!
// Hello World

```

当我们调用`it.return(..)`时，它立即终止generator，generator当然去运行`finally`子句。此外，它将返回`value`设置为你传入`return(..)`的任何值，这就是`"Hello World"`返回的方式。我们现在也不需要包含一个`break`，因为generator的*iterator*设置为`done: true`，因此`for..of`循环将在下一次迭代时终止。

generator的名称主要来自于所使用的 *消费生成的值* 。但是，这只是generator的用途之一，坦白地说，甚至不是我们在本书中关注的主要用途。

但是现在我们已经更全面地了解了它们如何工作的一些机制，接下来我们可以将注意力转向generator如何应用于异步并发。

## 异步迭代Generators

generator与异步编码模式、修复回调问题等有什么关系?让我们来回答那个重要的问题。

我们应该重温第3章中的一个场景。让我们回忆一下回调方法:

```js
function foo(x,y,cb) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		cb
	);
}

foo( 11, 31, function(err,text) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( text );
	}
} );
```

如果我们想用generator来表达同样的任务流控制，我们可以这样做:

```js
function foo(x,y) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		function(err,data){
			if (err) {
				// 抛出一个错误到 `*main()`
				it.throw( err );
			}
			else {
				// 用接收到的`data`来恢复`*main()`
				it.next( data );
			}
		}
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

var it = main();

// 开始运行所有!
it.next();
```

乍一看，这个片段比之前的回调片段更长，可能看起来更复杂一些。但不要让这种印象让你偏离轨道。generator代码段实际上要好 **很多** !但我们还有很多需要解释。

首先，让我们看看这部分代码，这是最重要的:

```js
var text = yield foo( 11, 31 );
console.log( text );
```

考虑一下代码是如何工作的。们正在调用一个普通函数`foo(..)`，我们显然能够从Ajax调用中获取`text`，即使它是异步的。这怎么可能呢?如果你还记得第一章的开头，我们有几乎相同的代码:

```js
var data = ajax( "..url 1.." );
console.log( data );
```

而这段代码不管用!你能看出区别吗?这是因为用于generator的`yield`。

这才是神奇的！这就是为什么我们可以有看起来是阻塞的，同步的代码，但它实际上不会阻塞整个程序;它只会暂停/阻止generator本身的代码。

在`yield foo(11, 31)`，首先发生了`foo(11, 31)`调用，他没有任何返回(也就是`undefined`)，因此我们产生了一个调用去请求数据，但实际上我们正在执行`yield undefined`。这是可以的，因为代码目前并不依赖于`yield`的值来做任何有趣的事情。我们将在本章后面重新讨论这一点。

在这里，我们不是在消息传递的意义上使用`yield`，而是在流控制的意义上来暂停/阻塞。实际上，在恢复generator之后，它将有消息传递，但只向一个方向传递。

因此，generator在`yield`处暂停，本质上是在问，“我应该返回什么值来为变量`text`赋值?”谁来回答这个问题?

看看`foo(..)`。如果Ajax请求成功，会调用：

```JS
it.next( data );
```

这是使用响应的数据去恢复generator，这意味着我们的暂停`yield`表达式直接接收该值，然后当它重新启动generator代码时，该值被分配给本地变量`text`。

很酷，对吧？

退一步想想其中的含义。我们在generator中有完全同步的代码(除了`yield`关键字本身)，但是隐藏在幕后，在`foo(..)`中，操作可以异步完成。

**这很伟大！** 这几乎完美地解决了前面提到的回调无法以顺序的、同步的方式表示异步的问题，而我们的大脑可以与之关联。

本质上，我们将异步作为实现细节抽象出来，以便我们可以同步/顺序地推理我们的流控制：“发出Ajax请求，并在完成时打印响应”。当然，我们只是在流程控制中表达了两个步骤，但同样的功能无限延伸，想要多少步骤就表达多少步骤。

**提示：** 这是一个非常重要的认识，回头再读一遍最后三段就能让你理解了!

### 同步错误处理

但是前面的generator代码*对*我们有更多的好处。 让我们把注意力转向generator内的`try..catch`：

```js
try {
	var text = yield foo( 11, 31 );
	console.log( text );
}
catch (err) {
	console.error( err );
}
```

这是如何工作的？`foo(..)`调用完全是异步完成的，而且不是正如我们第三章看到的那样，`try..catch`无法捕获异步错误？

我们已经看到了`yield`如何让赋值语句暂停，等待`foo(..)`完成，以便将完成的响应分配给`text`。令人敬畏的是，这种`yield`暂停*还*允许generator`catch`错误。我们将该错误抛出到generator中：

```js
if (err) {
	// throw an error into `*main()`
	it.throw( err );
}
```

Generator的`yield`暂停特性意味着我们不仅可以从异步函数调用中获得具有同步效果的`return`值，而且还可以同步`catch`那些异步函数调用的错误！

我们已经看到我们可以抛出错误*进* generator，但是把错误扔出generator呢?正如你所期望的:

```js
function *main() {
	var x = yield "Hello World";

	yield x.toLowerCase();	// cause an exception!
}

var it = main();

it.next().value;			// Hello World

try {
	it.next( 42 );
}
catch (err) {
	console.error( err );	// TypeError
}
```

当然，我们可以用`throw..`手动抛出错误而不是导致异常。

我们甚至可以`catch`同样的错误，我们`throw(..)`到generator，本质上给generator一个机会来处理它，但如果它没有，*iterator*代码必须处理它:

```js
function *main() {
	var x = yield "Hello World";

	// never gets here
	console.log( x );
}

var it = main();

it.next();

try {
	// will `*main()` handle this error? we'll see!
	it.throw( "Oops" );
}
catch (err) {
	// nope, didn't handle it!
	console.error( err );			// Oops
}
```

异步代码的同步错误处理(通过`try..catch`)是可读性和推理能力的巨大胜利。

## Generators + Promises

在前面的讨论中，我们展示了如何异步地迭代generator，这在顺序推理能力方面是一个巨大的进步，而不是像意大利面条一样混乱的回调。但是我们失去了一些非常重要的东西:Promise的可信赖性和可组合性(参见第3章)！

别担心，我们会找回来的。ES6中最好的功能是将generator(看上去同步的异步代码)与Promise(可靠且可组合)结合起来。

但是怎么搞？

回想一下第3章中我们基于promise运行的Ajax示例的方法:

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then(
	function(text){
		console.log( text );
	},
	function(err){
		console.error( err );
	}
);
```

在我们早期的运行Ajax示例的generator代码中，`foo(..)`没有返回任何内容(`undefined`)，并且我们的*iterator*控制代码并不关心那个`yield`的值。

但是在这里，具有promise意识的`foo(..)`在发出Ajax调用后返回一个promise。这表明我们可以使用`foo(..)`构造一个promise，然后从generator中`yield`它，然后*iterator*控制代码将接收该promise。

但是*iterator*应该如何处理这个promise呢？

它应该侦听promise去解析(实现或拒绝)，然后要么用完成的消息去恢复generator，要么用拒绝原因向generator抛出一个错误。

让我再说一遍，因为它非常重要。充分利用Promises和generators的自然方法是 **`yield`一个Promise** ，然后连接Promise来控制generator的*iterator*。

试一试吧！首先，我们将Promise `foo(..)`与generator `* main()`放在一起：

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}
```

这个重构中最强大的启示是`*main()`中的代码 **根本不需要更改!** generator内部，无论`yield`什么值，都只是一个不透明的实现细节，所以我们甚至不知道它正在发生，也不需要担心它。

但是现在我们如何运行`*main()`呢?我们仍然有一些管道实现的工作要做，接收并连接已`yield`的promise，以便在解决问题后重新恢复generator。我们首先尝试手动：

```js
var it = main();

var p = it.next().value;

// 等待 `p` promise 去解析
p.then(
	function(text){
		it.next( text );
	},
	function(err){
		it.throw( err );
	}
);
```

事实上，这一点都不麻烦，不是吗?

这个代码段应该与我们前面使用由错误优先回调控制的手动连接generator所做的非常相似。与`if (err) {.throw..`不同，promise已经为我们划分了完成(成功)和拒绝(失败)，但是*iterator*控制是相同的。

现在，我们忽略了一些重要的细节。

最重要的是，我们利用了这样一个事实：我们知道`*main()`里面只有一个Promise相关的步骤。如果我们想要能用Promise驱动一个generator而不管它有多少步骤呢？我们当然不想为每一个generator手动编写不同的Promise链！果有一种方法可以重复迭代控制(也称为“循环”)，并且每次出现一个promise，在继续之前等待它的解析，那就更好了。

另外，如果generator在`it.next()`调用期间(有意或无意地)抛出一个错误怎么办？我们是该退出，还是应该`catch`它并把它送回去？相似地，要是我们`it.throw(..)`一个Promise拒绝给generator，但是没有被处理，又直接回来了呢？

### Promise-Aware Generator Runner

你越是探索这条道路，你就越会意识到，“哇，如果能有一些实用工具为我做这件事就好了。” 你这样是完全正确的意识。这是一个非常重要的模式，你不希望出错(或者让你自己一遍又一遍地重复它)，所以你最好使用一个方法，该方法专门设计为按照我们所演示的方式*运行*有希望产生`yield` promise的generator。

几个Promise抽象库提供了这样一个实用程序，包括我的*asynquence*库及其`runner(..)`，这将在本书的附录a中讨论。

但为了学习和说明，让我们定义我们自己的程序，我们将称之为`run(..)`:

```js
// 感谢Benjamin Gruenbaum (GitHub上的@benjamingr) 为这里做出的大的改进
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	// 在当前上下文初始化generator
	it = gen.apply( this, args );

	// 为完成的generator返回一个promise
	return Promise.resolve()
		.then( function handleNext(value){
			// 运行到下一个yield的值(run to the next yielded value)
			var next = it.next( value );

			return (function handleResult(next){
				// generator已运行完成?
				if (next.done) {
					return next.value;
				}
				// 否则继续保持
				else {
					return Promise.resolve( next.value )
						.then(
                        	// 成功就恢复异步循环，发送解析的值回到generator
							handleNext,

							// 如果 `value` 是一个拒绝的promise，
                        	// error返回到generator自己的错误处理
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})(next);
		} );
}
```

你可以看到，它可能比你所希望自己编写的代码要复杂得多，而且你尤其不希望对使用的每个generator重复这段代码。因此，工具/库的帮助程序绝对是可行的方法。尽管如此，我还是建议你花几分钟时间研究这段代码，以便更好地理解如何管理generator+Promise协商。

在Ajax示例*运行中*，如何使用`run(..)`和`*main() `?

```js
function *main() {
	// ..
}

run( main );
```

是这样的！按照我们连接`run(..)`的方式，它将自动推进你传递给它的generator，异步地直到完成。

**注意：** 我们定义的`run(..)`返回一个promise，一旦generator完成，这个promise将被连接起来解析，如果generator不处理它，则接收一个未捕获的异常。我们在这里没有展示这种能力，但是我们将在本章的后面再讨论它。

#### ES7: `async` 和 `await`?

前面的模式 - generators去yield Promise然后控制generator的*iterator*以使其完成 - 这是一个非常强大且有用的方法，如果我们能够在不使用库帮助(又名`run(..)`)的情况下完成它，那就更好了。

这方面可能有好消息。在写作这本书的时候，有一个早期但强有力的提案，ES6后，ES7时间表上已经出现了语法支持。显然，现在保证细节还为时过早，但很有可能会出现如下情况:

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

async function main() {
	try {
		var text = await foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

main();
```

你可以看到，这里没有`run(..)`调用(意味着不需要帮助方法库)来去的和调用`main()` -- 他只是像一个普通函数被调用。此外，`main()`不再声明为generator函数;这是一种新的函数：`async function`。最后，相对于`yield` Promise，我们只是`await`他去解析。

如果`await`一个Promise，`async function` 会自动知道该做什么——它会暂停函数(就像使用generator一样)，直到Promise解析。我们没有在这个代码片段中演示它，但是调用像`main()`这样的异步函数会自动返回一个promise，这个promise在函数完成时就会被解析。

**提示：** 具有c#经验的读者应该非常熟悉`async` / `wait`语法，因为它基本上是相同的。

该提议本质上将对我们已经派生的模式的支持编码为一种语法机制:将Promise与看起来同步的流控制代码结合起来。这是两个方面的最佳组合，可以有效地解决我们在回调中概述的所有主要问题。

事实上，这样一个ES7提案已经存在并且具有支持和热情，这是对这种异步模式未来重要性的重大信任投票。

### Generators中的Promise并发

到目前为止，我们只演示了一个带有promise +generator的单个异步流。但是实际代码通常有很多异步步骤。

如果不小心，看起来像同步风格的generator可能会使你对如何构造异步并发感到自满，从而导致性能模式不太理想。所以我们想花点时间来探索这些。

假设你需要从两个不同的源获取数据，然后将这些response组合起来发出第三个请求，最后打印出最后的response。我们在第3章中用Promise探讨了类似的场景，但是让我们在generator上下文中重新考虑一下。

你的第一反应可能是:

```js
function *foo() {
	var r1 = yield request( "http://some.url.1" );
	var r2 = yield request( "http://some.url.2" );

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

这个代码会工作，但在我们的场景中，它不是最优的。你能找出原因吗?

因为`r1`和`r2`请求可以 - 并且出于性能原因 -- *应该*同时运行，但是在这段代码中它们将按顺序运行;直到`"http://some.url.1"`请求完成之后，`"http://some.url.2"`URL才会被获取。这两个请求是独立的，因此对于性能而言更好的方法可能是同时运行它们。

但是你如何用一个generator和`yield`来做到这一点呢?我们知道`yield`只是代码中的一个暂停点，所以不能同时执行两个暂停。

最自然和有效的解决方案是将异步流建立在promise的基础上，特别是基于它们以独立于时间的方式管理状态的能力(参见第3章中的“Future Value”)。

最简单的方法：

```js
function *foo() {
	// make both requests "in parallel"
	var p1 = request( "http://some.url.1" );
	var p2 = request( "http://some.url.2" );

	// wait until both promises resolve
	var r1 = yield p1;
	var r2 = yield p2;

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

为什么这个和上一个片段不同？看看`yield`在哪里或不在哪里。`p1`和`p2`是一对并发发出的Ajax请求的Promise(也称为“并行”)。首先完成哪一个并不重要，因为只要有必要，promise将保持其解决状态。

然后，我们使用两个后续的`yield`语句来等待和检索promise中的解析(分别为`r1`和`r2`)。如果`p1`首先解析，那么`yield p1`首先恢复，然后等待`yield p2`恢复。如果`p2`首先解析，它会耐心地保持该解析值直到被询问，但是`yield p1`将先保持，直到`p1`解析。

无论哪种方式，`p1`和`p2`都将同时运行，并且都必须在`r3 = yield request..`之前按任意顺序完成，这样才会发出Ajax请求。

如果流控制处理模型听起来很熟悉，那么它基本上与我们在第3章中确定的“gate(门闩)”模式相同，由`Promise.all([ .. ])`启用。所以，我们也可以这样表达流控制:

```js
function *foo() {
	// make both requests "in parallel," and
	// wait until both promises resolve
	var results = yield Promise.all( [
		request( "http://some.url.1" ),
		request( "http://some.url.2" )
	] );

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

**注意：** 正如我们在第3章中讨论的那样，我们甚至可以使用ES6解构赋值来简化`var r1 = .. var r2 = ..`赋值`var [r1,r2] = results`。

换句话说，在generator+Promise方法中，Promise的所有并发功能都是可用的。因此，在任何地方，如果你需要比顺序 这-然后-那 异步流控制步骤更多的步骤，那么Promise可能是你的最佳选择。

#### Promises, 隐藏

作为代码风格的警告要说一句，要注意 **你的generator内部** 包含了多少Promise逻辑。按照我们描述的方式为异步使用generator的全部意义在于创建简单的、顺序的、同步的代码，并尽可能多地将异步的细节隐藏在代码之外。

例如，这可能是一个更清爽的方法:

```js
// note: normal function, not generator
function bar(url1,url2) {
	return Promise.all( [
		request( url1 ),
		request( url2 )
	] );
}

function *foo() {
	// hide the Promise-based concurrency details
	// inside `bar(..)`
	var results = yield bar(
		"http://some.url.1",
		"http://some.url.2"
	);

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

在`*foo()`中，我们所做的只是请求`bar(..)`给我们一些`results`，我们将会`yield`他——等待这一切发生。我们不必关心`Promise.all([..])`，Promise组合将用于实现这一目标。

**我们将异步，甚至Promises视为实现细节。** 

如果你要做一种复杂的序列流控制，那么将你的Promise逻辑隐藏在一个仅仅从你的generator中调用的函数里特别有用。举个例子：

```js
function bar() {
	return	Promise.all( [
		  baz( .. )
		  .then( .. ),
		  Promise.race( [ .. ] )
		] )
		.then( .. )
}
```

这种逻辑有时是必需的，如果你将它直接转储到generator中，那么你就已经克服了首先需要使用generator的大部分原因。我们*应该*有意地将这些细节从generator代码中抽象出来，这样它们就不会扰乱高级任务表达式。

除了创建功能和性能兼备的代码外，还应该努力使代码尽可能地合理和可维护。

**注意：** 抽象对于编程来说并不*总是*一件健康的事情——很多时候它是增加复杂性来换取简洁。但是在这种情况下，我相信对于generator+Promise 异步代码来说，它比其他选择更健康。与所有这些建议一样，要注意你的具体情况，为你和你的团队做出正确的决定。

## Generator 代理

在上一节中，我们展示了如何从generator内部调用常规函数，以及如何使用这种方法抽象实现细节(如异步 Promise流程)。但是，将普通函数用于此任务的主要缺点是，它必须遵循普通函数规则，这意味着它不能像generator那样使用`yield`来暂停自己。

然后，你可能会想到，你可以尝试使用我们的`run(..)帮助方法从另一个generator调用一个generator，例如:

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// "delegating" to `*foo()` via `run(..)`
	var r3 = yield run( foo );

	console.log( r3 );
}

run( bar );
```

我们再次使用`run(..)`实用程序在`*bar()`中运行`*foo()`。我们在这里利用了这样一个事实，即我们之前定义的`run(..)`返回一个promise，当它的generator运行完成（或错误输出）时解析，所以如果我们得到`run(..)`实例， 从另一个`run(..)`调用中保证，它会自动暂停`* bar()`直到`* foo()`结束。

但是有一种更好的方法可以将`*foo()`调用集成到`*bar()`中，它被称为`yield`代理。`yield`代理的特殊语法是：`yield * __`(注意`*`)。在前面的例子中，我们先来看一个更简单的场景:

```js
function *foo() {
	console.log( "`*foo()` starting" );
	yield 3;
	yield 4;
	console.log( "`*foo()` finished" );
}

function *bar() {
	yield 1;
	yield 2;
	yield *foo();	// `yield`-delegation!
	yield 5;
}

var it = bar();

it.next().value;	// 1
it.next().value;	// 2
it.next().value;	// `*foo()` starting
					// 3
it.next().value;	// 4
it.next().value;	// `*foo()` finished
					// 5
```

**注意：** 类似于前面我解释为什么我更喜欢`function *foo() ..`而不是`function* foo() ..`，我还喜欢使用`yield *foo()`而不是`yield* foo()`，这与该主题的大多数其他文档不同。`*`的位置纯粹是风格上的东西，取决于你的判断。但我觉得风格一致性很棒。

`yield *foo()`代理是如何工作的？

首先，调用`foo()`去创建了一个*iterator*，正如我们看到的这样。然后，`yield *` 委托/传递*iterator*实例控制(当前`*bar()` generator的)到另一个`*foo()`*iterator*。

所以，前两个`it.next()`调用是控制`* bar()`，但是当我们调用第三个`it.next()`时，现在`* foo()`就启动了，现在我们控制的是`* foo()`而不是` *bar()`。这就是为什么它被称为委托 - `*bar()`将其迭代控制委托给`*foo()`。

一旦`it`*iterator*控制耗尽整个`*foo()` *iterator*，它就自动返回去控制 `*bar()`。

现在回到上一个带有三个连续Ajax请求的示例：

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// "delegating" to `*foo()` via `yield*`
	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

这个代码段与前面使用的版本之间的唯一区别是使用`yield *foo()`，而不是前面的`yield run(foo)`。

**注意：** `yield *`是让出迭代的控制，不是generator控制；当你调用`*foo()`generator时，你现在是`yield`委托到它的*iterator*。但你实际上可以`yield`任何*iterable*的委托；`yield *[1,2,3]`将使用`[1,2,3]`数组值的默认*iterator*。

### 为什么代理？

`yield`代理的目的主要是代码组织，这样就与正常的函数调用是对称的。

假设有两个模块分别提供`foo()`和`bar()`方法，其中`bar()`调用`foo()`。这两者分开的原因通常是因为程序的适当代码组织要求它们位于单独的函数中。例如，在某些情况下，`foo()`被单独调用，而在其他情况下，`bar()`调用`foo()`。

由于所有这些完全相同的原因，保持generator在程序可读性、维护性和可调试性方面的独立性。在这方面，`yield *`是一个语法快捷方式，可以在`*bar()`内部手动迭代`*foo()`的步骤。

如果`*foo()`中的步骤是异步的，那么这种手动方法将特别复杂，这就是为什么你可能需要使用`run(..)`帮助方法/库来完成此操作。正如我们所展示的，`yield *foo()`消除了对`run(..)`方法子实例的需要(如`run(foo)`)。

### 代理消息

你可能想知道这种`yield`代理不仅在*iterator*控制中工作，而且也想知道在双向消息传递中是如何工作的。通过`yield`代理仔细地跟踪消息的流入和流出:

```js
function *foo() {
	console.log( "inside `*foo()`:", yield "B" );

	console.log( "inside `*foo()`:", yield "C" );

	return "D";
}

function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`代理!
	console.log( "inside `*bar()`:", yield *foo() );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// inside `*foo()`: 3
// inside `*bar()`: D
// outside: E

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: 4
// outside: F
```

特别注意一下`it.next(3)`调用之后的处理步骤：

1. `3`(通过`*bar`里的`yield`代理)传递到`*foo()`中的等待`yield "C"`表达式中。
2. `*foo()`然后调用`return "D"`，但是这个值不会一直返回到外部的`it.next(3)`调用。
3. 相反的，`"D"`这个值是作为`*bar()`内部的等待`yield *foo()`表达式的结果发送的，当所有`*foo()`被耗尽时，这个`yield`代理表达式实际上已经暂停。因此，`"D"`在`*bar()`内部结束并打印出来。
4. `yield "E"`在`*bar()`内部被调用，并且作为`it.next(3)`的结果，`"E"`值被输出到外面。

从外部*iterator*(`it`)的角度来看，控制初始的generator和代理的generator之间并没有什么不同。事实上，`yield代理甚至不需要指向另一个generator;它可以直接指向非generator，通常是*iterable*的。例如:

```js
function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`代理到一个非generator(iterable)的！
	console.log( "inside `*bar()`:", yield *[ "B", "C", "D" ] );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// outside: C

console.log( "outside:", it.next( 3 ).value );
// outside: D

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: undefined
// outside: E

console.log( "outside:", it.next( 5 ).value );
// inside `*bar()`: 5
// outside: F
```

请注意此示例和前一个示例在接收/报告消息的位置上的差异。

最值得关注的是，默认`array` *iterator*不关心通过`next(..)`调用发送的任何消息，因此值`2`、`3`和`4`基本上被忽略。此外，因为*iterator*没有显式`return`值(与之前使用的`* foo()`不同)，`yield *`表达式在完成时会得到一个`undefined`。

#### 异常也有委托

与`yield代理透明地在两个方向传递消息相同，错误/异常也在两个方向传递:

```js
function *foo() {
	try {
		yield "B";
	}
	catch (err) {
		console.log( "error caught inside `*foo()`:", err );
	}

	yield "C";

	throw "D";
}

function *bar() {
	yield "A";

	try {
		yield *foo();
	}
	catch (err) {
		console.log( "error caught inside `*bar()`:", err );
	}

	yield "E";

	yield *baz();

	// note: can't get here!
	yield "G";
}

function *baz() {
	throw "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// outside: B

console.log( "outside:", it.throw( 2 ).value );
// error caught inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// error caught inside `*bar()`: D
// outside: E

try {
	console.log( "outside:", it.next( 4 ).value );
}
catch (err) {
	console.log( "error caught outside:", err );
}
// error caught outside: F
```

从这段代码中可以注意到:

1. 当我们调用`it.throw(2)`，他发送了一个消息`2`到`*bar()`，而且`*bar()`把它委托到了`*foo()`，然后就会优雅的`catch`并处理他。然后`yield "C"`发送`"C"`作为从`it.throw(2)`调用的返回`value`。
2. 接下来从`*foo()`内部抛出的`"D"`值会传播到`*bar()`，后者会`catch`它并优雅地处理它。然后`yield "E"`发送`"E"`作为从`it.throw(3)`调用的返回`value`。
3. 接下来，从`*baz()`的异常`throw`在`*bar()`中没有被捕获，我们在外面`catch`到它，因此`*baz()`和`*bar()`被设置成完成状态。在此代码段之后，你将无法使用任何后续的`next(..)`调用提取`"G"`值——它们将返回`undefined` 作为`value`。

### 异步代理

最后，让我们回到前面的`yield`委托示例，使用多个顺序Ajax请求:

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

我们只是调用`yield *foo()`，而不是在`*bar()`内部调用`yield run(foo)`。

在本例的前一个版本中，Promise机制(由`run(..)`控制)用于将值从`*foo()`中的`return r3`传输到`*bar()`中的局部变量`r3`。现在，该值直接通过`yield *`机制返回。

否则，行为几乎是相同的。

### 代理"递归"

当然，`yield`代理可以在你连接时遵循尽可能多的委派步骤。你甚至可以使用`yield`代理来支持异步generator“递归” - 一个generator `yield` - 委托给自己：

```js
function *foo(val) {
	if (val > 1) {
		// generator recursion
		val = yield *foo( val - 1 );
	}

	return yield request( "http://some.url/?v=" + val );
}

function *bar() {
	var r1 = yield *foo( 3 );
	console.log( r1 );
}

run( bar );
```

**注意：** 我们的`run(..)`方法可以用`run(foo, 3)`来调用，因为它支持传递给generator初始化的附加参数。但是，我们在这里使用了无参数`* bar()`来突出`yield *`的灵活性。

该代码的处理步骤是什么?等等，这将是相当复杂的描述细节:

1. `run(bar)`启动`*bar()`generator。
2. `foo(3)`为`*foo()`创建了一个*iterator*并且传递`3`作为`val`参数。
3. 因为`3 > 1`，`foo(2)`创建了另外一个*iterator*并传递`2`作为`val`参数。
4. 因为`2 > 1`，`foo(1)`也创建了另外一个*iterator*并传递`1`作为`val`参数。
5. `1 > 1`是`false`，所以我们接下来用`1`这个值调用`request(..)`，并从第一个Ajax调用得到一个promise。
6. 这个promise被`yield`出来，回到`*foo(2)`generator实例。
7. `yield *`传递这个promise回到`*foo(3)`generator实例。另外一个`yield *`传递promise到`*bar()`generator实例。同样，另一个`yield *`将promise传递给`run(..)`，将等待该promise(为第一个Ajax请求)继续执行。
8. 当这个promise解析时，它的完成消息会被发送以继续`*bar()`，`*bar()`通过`yield *`把消息传递进`*foo(3)`实例，`*foo(3)`实例通过`yield *`把消息传递进`*foo(2)`generator实例，`*foo(2)`实例通过`yield *`把消息传给那个在`*foo(3)`generator实例中等待的一般的`yield`。
9. 这第一个Ajax调用的应答现在立即从`*foo(3)`generator实例中被`return`，作为`*foo(2)`实例中`yield *`表达式的结果发送回来，并赋值给本地`val`变量。
10. `*foo(2)`内部，第二个Ajax请求用`request(..)`发起，它的promise被`yield`回到`*foo(1)`实例，然后一路`yield *`传播到`run(..)`（回到第7步）。当promise解析时，第二个Ajax应答一路传播回到`*foo(2)`generator实例，并赋值到他本地的`val`变量。
11. 最终，第三个Ajax请求用`request(..)`发起，它的promise走出到`run(..)`，然后它的解析值一路返回，最后被`return`到在`*bar()`中等待的`yield *`表达式。

啊!这疯狂的精神杂耍，是吧?你可能想多读几遍，然后去吃点零食来清醒一下头脑!

## Generator 并发

正如我们在第1章和本章前面所讨论的，两个同时运行的“进程”可以协作地交错它们的操作，并且很多时候这会产生(双关语)非常强大的异步表达式。

坦白地说，我们前面的多个generator并发交错的例子说明了如何使它真正令人困惑。但是我们已经暗示过，在某些地方这种能力是非常有用的。

回想一下我们在第1章中看到的一个场景，其中两个不同的同步Ajax响应处理程序需要相互协调，以确保数据通信不是竞争条件。我们将响应插入res数组，如下所示:

```js
function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}
```

但是，我们如何在这种情况下同时使用多个generator呢？

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

function *reqData(url) {
	res.push(
		yield request( url )
	);
}
```

**注意：** 我们将在这里使用两个`*reqData(..)`generator的实例，但是这和分别使用两个不同generator的一个实例没有区别；这两种方式在道理上完全一样的。我们过一会儿就会看到两个generator的协调操作。

与不得不将`res[0]`和`res[1]`赋值手动排序不同，我们将使用协调过的顺序，让`res.push(..)`以可预见的顺序恰当地将值放在预期的位置。如此被表达的逻辑会让人感觉更干净。

但是我们将如何实际安排这种互动呢？首先，让我们手动实现它：

```js
var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1
.then( function(data){
	it1.next( data );
	return p2;
} )
.then( function(data){
	it2.next( data );
} );
```

`*reqData(..)`的两个实例都开始发起它们的Ajax请求，然后用`yield`暂停。之后我们再`p1`解析时继续运行第一个实例，而后来的`p2`的解析将会重启第二个实例。以这种方式，我们使用Promise的安排来确保`res[0]`将持有第一个应答，而`res[1]`持有第二个应答。

但坦白地说，这是可怕的手动，而且它没有真正让generator组织它们自己，而那才是真正的力量。让我们用不同的方法试一下：

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

function *reqData(url) {
	var data = yield request( url );

	// transfer control
	yield;

	res.push( data );
}

var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1.then( function(data){
	it1.next( data );
} );

p2.then( function(data){
	it2.next( data );
} );

Promise.all( [p1,p2] )
.then( function(){
	it1.next();
	it2.next();
} );
```

好吧，这看起来好些了（虽然仍然是手动），因为现在两个`*reqData(..)`的实例真正地并发运行了，而且（至少是在第一部分）是独立的。

在前一个代码段中，第二个实例在第一个实例完全完成之前没有给出它的数据。但是这里，只要它们的应答一返回这两个实例就立即分别收到他们的数据，然后每个实例调用另一个`yield`来传送控制。最后我们在`Promise.all([ .. ])`的处理器中选择用什么样的顺序继续它们。

可能不太明显的是，这种方式因其对称性启发了一种可复用工具的简单形式。让我们想象使用一个称为`runAll(..)`的工具：

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

runAll(
	function*(){
		var p1 = request( "http://some.url.1" );

		// transfer control
		yield;

		res.push( yield p1 );
	},
	function*(){
		var p2 = request( "http://some.url.2" );

		// transfer control
		yield;

		res.push( yield p2 );
	}
);
```

**注意：** 我们没有包含`runAll(..)`的实现代码，不仅因为它太长，也因为它是一个我们已经在先前的 `run(..)`中实现的逻辑的扩展。所以，作为留给读者的一个很好的补充性练习，请你自己动手改进`run(..)`的代码，来使它像想象中的`runAll(..)`那样工作。另外，我的 *asynquence* 库提供了一个前面提到过的`runner(..)`工具，它内建了这种能力，我们将在本书的附录A中讨论它。

这是`runAll(..)`内部的处理将如何操作：

1. 第一个generator得到一个代表从`"http://some.url.1"`来的Ajax应答，然后将控制权`yield`回到`runAll(..)`工具。
2. 第二个generator运行，并对`"http://some.url.2"`做相同的事，将控制权`yield`回到`runAll(..)`工具。
3. 第一个generator继续，然后`yield`出他的promise`p1`。在这种情况下`runAll(..)`工具和我们前面的`run(..)`做同样的事，它等待promise解析，然后继续这同一个generator（没有控制传递！）。当`p1`解析时，`runAll(..)`使用解析值再一次继续第一个generator，而后`res[0]`得到它的值。在第一个generator完成之后，有一个隐式的控制权传递。
4. 第二个generator继续，`yield`出它的promise`p2`，并等待它的解析。一旦`p2`解析，`runAll(..)`使用这个解析值继续第二个generator，于是`res[1]`被设置。

在这个例子中，我们使用了一个称为`res`的外部变量来保存两个不同的Ajax应答的结果——这是我们的并发协调。

但是这样做可能十分有帮助：进一步扩展`runAll(..)`使它为多个generator实例提供 *分享的* 内部的变量作用域，比如一个我们将在下面称为`data`的空对象。另外，它可以接收被`yield`的非Promise值，并把它们交给下一个generator。

考虑这段代码：

```js
// `request(..)` is a Promise-aware Ajax utility

runAll(
	function*(data){
		data.res = [];

		// transfer control (and message pass)
		var url1 = yield "http://some.url.2";

		var p1 = request( url1 ); // "http://some.url.1"

		// transfer control
		yield;

		data.res.push( yield p1 );
	},
	function*(data){
		// transfer control (and message pass)
		var url2 = yield "http://some.url.1";

		var p2 = request( url2 ); // "http://some.url.2"

		// transfer control
		yield;

		data.res.push( yield p2 );
	}
);
```

在这个公式中，两个generator不仅协调控制传递，实际上还互相通信：通过`data.res`，和交换`url1`与`url2`的值的`yield`消息。这强大到不可思议！

这样的认识也是一种更为精巧的称为CSP（Communicating Sequential Processes——通信顺序处理）的异步技术的概念基础，我们将在本书的附录B中讨论它。

## Thunks

到目前为止，我们假设从generator去`yield`一个Promise——并让该Promise通过`run(..)`之类的帮助工具恢复generator——是使用generator管理异步的最佳可能方法。要清楚，确实是这样。

但是我们跳过了另一种稍微广泛采用的模式，因此出于完整性的考虑，我们将简要介绍它。

在一般的计算机科学中，有一个旧的JS之前概念称为“thunk”。在不追及历史的情况下，JS中对thunk的一个狭义表达式是一个函数，它没有任何参数，但是连接起来调用另一个函数。

换句话说，你将函数定义封装在函数调用周围(包含它需要的任何参数)，以*延迟*该调用的执行，而这个包装用的函数就是thunk。当稍后执行thunk时，最终调用原始函数。

如下：

```js
function foo(x,y) {
	return x + y;
}

function fooThunk() {
	return foo( 3, 4 );
}

// later

console.log( fooThunk() );	// 7
```

因此，一个同步的thunk非常简单明了。但是异步thunk呢?本质上，我们可以扩展狭窄的thunk定义，使其包括接收回调。

考虑下面代码：

```js
function foo(x,y,cb) {
	setTimeout( function(){
		cb( x + y );
	}, 1000 );
}

function fooThunk(cb) {
	foo( 3, 4, cb );
}

// later

fooThunk( function(sum){
	console.log( sum );		// 7
} );
```

如你所见，`fooThunk(..)`仅需要一个`cb(..)`参数，因为它已经预先制定了值`3`和`4`（分别为`x`和`y`）并准备传递给`foo(..)`。一个thunk只是在外面耐心地等待着它开始工作所需的最后一部分信息：回调。

但是你不会想要手动制造thunk。那么，让我们发明一个工具来为我们进行这种包装。

考虑这段代码：

```js
function thunkify(fn) {
	var args = [].slice.call( arguments, 1 );
	return function(cb) {
		args.push( cb );
		return fn.apply( null, args );
	};
}

var fooThunk = thunkify( foo, 3, 4 );

// 稍后

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

**提示：** 这里我们假定原始的（`foo(..)`）函数签名希望它的回调的位置在最后，而其它的参数在这之前。这是一个异步JS函数的相当普遍的“标准”。你可以称它为“回调后置风格”。如果因为某些原因你需要处理“回调优先风格”的签名，你只需要制造一个使用`args.unshift(..)`而非`args.push(..)`的工具。

前面的`thunkify(..)`公式接收`foo(..)`函数的引用，和任何它所需的参数，并返回thunk本身（`fooThunk(..)`）。然而，这并不是你将在JS中发现的thunk的典型表达方式。

与`thunkify(..)`制造thunk本身相反，典型的——可能有点儿让人困惑的——`thunkify(..)`工具将产生一个制造thunk的函数。

呃......是的。

考虑这段代码：

```js
function thunkify(fn) {
	return function() {
		var args = [].slice.call( arguments );
		return function(cb) {
			args.push( cb );
			return fn.apply( null, args );
		};
	};
}
```

这里主要的不同之处是有一个额外的`return function() { .. }`。下面是它的用法的不同之处:

```js
var whatIsThis = thunkify( foo );

var fooThunk = whatIsThis( 3, 4 );

// later

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

明显地，这段代码隐含的最大的问题是，`whatIsThis`叫什么合适？它不是thunk，它是一个从`foo(..)`调用生产thunk的东西。它是一种“thunk”的“工厂”。而且看起来没有任何标准的意见来命名这种东西。

所以，我的提议是“thunkory”（"thunk" + "factory"）。于是，`thunkify(..)`制造了一个thunkory，而一个thunkory制造thunks。这个道理与第三章中我的“promisory”提议是对称的：

```js
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// later

fooThunk1( function(sum) {
	console.log( sum );		// 7
} );

fooThunk2( function(sum) {
	console.log( sum );		// 11
} );
```

**注意：** 这个例子中的`foo(..)`期望的回调不是“错误优先风格”。当然，“错误优先风格”更常见。如果`foo(..)`有某种合理的错误发生机制，我们可以改变而使它期望并使用一个错误优先的回调。后续的`thunkify(..)`不会关心回调被预想成什么样。用法的唯一区别是`fooThunk1(function(err,sum){..`。

暴露thunkory方法——而不是早期的`thunkify(..)`隐藏这个中间步骤—似乎是不必要的复杂化。但是一般来讲，在你的程序一开始就制造一些thunkory来包装既存API的方法是十分有用的，然后你就可以在你需要thunk的时候传递并调用这些thunkory。这两个区别开的步骤保证了功能上更干净的分离。

来说明下：

```js
// cleaner:
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// instead of:
var fooThunk1 = thunkify( foo, 3, 4 );
var fooThunk2 = thunkify( foo, 5, 6 );
```

无论你是否愿意明确地处理thunkories，thunk（`fooThunk1(..)`和`fooThunk2(..)`）的用法还是一样的。

### s/promise/thunk/

那么所有这些thunk的东西与generator有什么关系？

一般性地比较一下thunk和promise：它们不能直接互换的，因为它们在行为上并不等的。比起单纯的thunk，Promise可用性更广泛，而且更可靠。

但从另一种意义上讲，它们都可以被看作是对一个值的请求，这个请求可能被异步地应答。

回忆第三章，我们定义了一个工具来promise化一个函数，我们称之为`Promise.wrap(..)`——我们本来也可以叫它`promisify(..)`的！这个Promise化包装工具不会生产Promise；它生产那些继而生产Promise的promisories。这和我们当前讨论的thunkory和thunk是完全对称的。

为了描绘这种对称性，让我们首先将`foo(..)`的例子改为假定一个“错误优先风格”回调的形式：

```js
function foo(x,y,cb) {
	setTimeout( function(){
		// assume `cb(..)` as "error-first style"
		cb( null, x + y );
	}, 1000 );
}
```

现在，我们将比较`thunkify(..)`和`promisify(..)`（也就是第三章的`Promise.wrap(..)`）：

```js
// symmetrical: constructing the question asker
var fooThunkory = thunkify( foo );
var fooPromisory = promisify( foo );

// symmetrical: asking the question
var fooThunk = fooThunkory( 3, 4 );
var fooPromise = fooPromisory( 3, 4 );

// get the thunk answer
fooThunk( function(err,sum){
	if (err) {
		console.error( err );
	}
	else {
		console.log( sum );		// 7
	}
} );

// get the promise answer
fooPromise
.then(
	function(sum){
		console.log( sum );		// 7
	},
	function(err){
		console.error( err );
	}
);
```

thunkory和promisory实质上都是在问一个问题（一个值），thunk的`fooThunk`和promise的`fooPromise`分别代表这个问题的未来的答案。这样看来，对称性就清楚了。

带着这个视角，我们可以看到为了异步而`yield`Promise的generator，也可以为异步而`yield`thunk。我们需要的只是一个更聪明的`run(..)`工具（就像以前一样），它不仅可以寻找并连接一个被`yield`的Promise，而且可以给一个被`yield`的thunk提供回调。

考虑这段代码：

```js
function *foo() {
	var val = yield request( "http://some.url.1" );
	console.log( val );
}

run( foo );
```

在这个例子中，`request(..)`既可以是一个返回一个promise的promisory，也可以是一个返回一个thunk的thunkory。从generator的内部代码逻辑的角度看，我们不关心这个实现细节，这就它强大的地方！

因此，`request(..)`可以使以下任何一种形式：

```js
// promisory `request(..)` (see Chapter 3)
var request = Promise.wrap( ajax );

// vs.

// thunkory `request(..)`
var request = thunkify( ajax );
```

最后，作为一个让我们早先的`run(..)`工具支持thunk的补丁，我们需要这样的逻辑：

```js
// ..
// did we receive a thunk back?
else if (typeof next.value == "function") {
	return new Promise( function(resolve,reject){
		// call the thunk with an error-first callback
		next.value( function(err,msg) {
			if (err) {
				reject( err );
			}
			else {
				resolve( msg );
			}
		} );
	} )
	.then(
		handleNext,
		function handleErr(err) {
			return Promise.resolve(
				it.throw( err )
			)
			.then( handleResult );
		}
	);
}
```

现在，我们generator既可以调用promisory来`yield`Promise，也可以调用thunkory来`yield`thunk，而不论那种情况，`run(..)`都将处理这个值并等待它的完成，以继续generator。

在对称性上，这两个方式是看起来相同的。然而，我们应当指出这仅仅从Promise或thunk表示延续generator的未来值的角度讲是成立的。

从更高的角度讲，与Promise被设计成的那样不同，thunk没有提供，它们本身也几乎没有任何可靠性和可组合性的保证。在这种特定的generator异步模式下使用一个thunk作为Promise的替代品是可以工作的，但与Promise提供的所有好处相比，这应当被看做是一种次理想的方法。

如果你有选择，那就偏向`yield pr`而非`yield th`。但是使`run(..)`工具可以处理两种类型的值本身没有什么问题。

**注意：** 在我们将要在附录A中讨论的，我的 *asynquence* 库中的`runner(..)`工具，可以处理`yield`的Promise，thunk和 *asynquence* 序列。

## ES6之前的Generators

希望你现在已经确信generator是异步编程工具箱的一个非常重要的补充。但它是ES6中的一个新语法，这意味着你不能像Promise那样只使用polyfill generator(这只是一个新的API)。那么，如果我们不能忽略es6之前的浏览器，我们该如何将generator带到浏览器JS中呢?

对所有ES6中的新语法的扩展，有一些工具——称呼他们最常见的名词是转译器（transpilers），也就是转换编译器（trans-compilers）——它们会拿起你的ES6语法，并转换为前ES6时代的等价代码（但是明显地变难看了！）。所以，generator可以被转译为具有相同行为但可以在ES5或以下版本进行工作的代码。

但是怎么做呢？`yield`的“魔力”听起来不像是那么容易转换的代码。在我们早先的基于闭包的 *iterators* 例子中，实际上提示了一种解决方法。

### 手动转型

在我们讨论转译器之前，让我们延伸一下，在generator的情况下如何手动转译。这不仅仅是一项学术活动，因为这样做实际上有助于进一步加强它们的工作方式。 

考虑这段代码：

```js
// `request(..)` is a Promise-aware Ajax utility

function *foo(url) {
	try {
		console.log( "requesting:", url );
		var val = yield request( url );
		console.log( val );
	}
	catch (err) {
		console.log( "Oops:", err );
		return false;
	}
}

var it = foo( "http://some.url.1" );
```

首先要注意的是，我们仍然需要一个可以调用的普通`foo()`函数，它仍然需要返回一个*iterator*。那么，我们来画出非generator的变换:

```js
function foo(url) {

	// ..

	// make and return an iterator
	return {
		next: function(v) {
			// ..
		},
		throw: function(e) {
			// ..
		}
	};
}

var it = foo( "http://some.url.1" );
```

接下来要注意的是，generator通过挂起它的作用域/状态来实现它的“魔力”，但是我们可以使用函数闭包来模拟它(请参阅本系列的作用域和闭包标题)。为了理解如何编写这样的代码，我们将首先用状态值注释generator的不同部分:

```js
// `request(..)` is a Promise-aware Ajax utility

function *foo(url) {
	// STATE *1*

	try {
		console.log( "requesting:", url );
		var TMP1 = request( url );

		// STATE *2*
		var val = yield TMP1;
		console.log( val );
	}
	catch (err) {
		// STATE *3*
		console.log( "Oops:", err );
		return false;
	}
}
```

**注意：** 为了更准去地讲解，我们使用`TMP1`变量将`val = yield request..`语句分割为两部分。`request(..)`发生在状态`*1*`，而将完成值赋给`val`发生在状态`*2*`。在我们将代码转换为非generator的等价物后，我们就可以摆脱中间的`TMP1`。

换句话所，`*1*`是初始状态，`*2*`是`request(..)`成功的状态，`*3*`是`request(..)`失败的状态。你可能会想象额外的`yield`步骤将如何编码为额外的状态。

回到我们被转译的generator，让我们在这个闭包中定义一个变量`state`，用它来追踪状态：

```js
function foo(url) {
	// manage generator state
	var state;

	// ..
}
```

现在，让我们在闭包内部定义一个称为`process(..)`的内部函数，它用`switch`语句来处理各种状态。

```js
// `request(..)` is a Promise-aware Ajax utility

function foo(url) {
	// manage generator state
	var state;

	// generator-wide variable declarations
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// ..
}
```

在我们的generator中每种状态都在`switch`语句中有它自己的`case`。每当我们需要处理一个新状态时，`process(..)`就会被调用。我们一会就回来讨论它如何工作。

对任何generator范围的变量声明（`val`），我们将它们移动到`process(..)`外面的`var`声明中，这样它们就可以在`process(..)`的多次调用中存活下来。但是“块儿作用域”的`err`变量仅在`*3*`状态下需要，所以我们将它留在原处。

在状态`*1*`，与`yield request(..)`相反，我们`return request(..)`。在终结状态`*2*`，没有明确的`return`，所以我们仅仅`return;`也就是`return undefined`。在终结状态`*3*`，有一个`return false`，我们保留它。

现在我们需要定义 *迭代器* 函数的代码，以便人们恰当地调用`process(..)`：

```js
function foo(url) {
	// manage generator state
	var state;

	// generator-wide variable declarations
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// make and return an iterator
	return {
		next: function(v) {
			// initial state
			if (!state) {
				state = 1;
				return {
					done: false,
					value: process()
				};
			}
			// yield resumed successfully
			else if (state == 1) {
				state = 2;
				return {
					done: true,
					value: process( v )
				};
			}
			// generator already completed
			else {
				return {
					done: true,
					value: undefined
				};
			}
		},
		"throw": function(e) {
			// the only explicit error handling is in
			// state *1*
			if (state == 1) {
				state = 3;
				return {
					done: true,
					value: process( e )
				};
			}
			// otherwise, an error won't be handled,
			// so just throw it right back out
			else {
				throw e;
			}
		}
	};
}
```

这段代码如何工作？

1. 第一个对 *迭代器* 的`next()`调用将把gtenerator从未初始化的状态移动到状态`1`，然后调用`process()`来处理这个状态。`request(..)`的返回值是一个代表Ajax应答的promise，它作为`value`属性从`next()`调用被返回。
2. 如果Ajax请求成功，第二个`next(..)`调用应当送进Ajax的应答值，它将我们的状态移动到`2`。`process(..)`再次被调用（这次它被传入Ajax应答的值），而从`next(..)`返回的`value`属性将是`undefined`。
3. 然而，如果Ajax请求失败，应当用错误调用`throw(..)`，它将状态从`1`移动到`3`（而不是`2`）。`process(..)`再一次被调用，这词被传入了错误的值。这个`case`返回`false`，所以`false`作为`throw(..)`调用返回的`value`属性。

从外面看——也就是仅仅与 *迭代器* 互动——这个普通的`foo(..)`函数与`*foo(..)`generator的工作方式是一样的。所以我们有效地将ES6 generator“转译”为前ES6可兼容的！

然后我们就可以手动初始化我们的generator并控制它的迭代器——调用`var it = foo("..")`和`it.next(..)`等等——或更好地，我们可以将它传递给我们先前定义的`run(..)`工具，比如`run(foo,"..")`。

### 自动转译

前面的练习——手动编写从ES6 generator到ES6之前的等价物的转换过程——教会了我们generator在概念上是如何工作的。但是这种变形真的是错综复杂，而且不能很好地移植到我们代码中的其他generator上。手动做这些工作是不切实际的，而且将会把generator的好处完全抵消掉。

但走运的是，已经存在几种工具可以自动地将ES6 generator转换为我们在前一节延伸出的东西。它们不仅帮我们做力气活儿，还可以处理几种我们敷衍而过的情况。

一个这样的工具是regenerator（[https://facebook.github.io/regenerator/），由Facebook的聪明伙计们开发的。](https://facebook.github.io/regenerator/%EF%BC%89%EF%BC%8C%E7%94%B1Facebook%E7%9A%84%E8%81%AA%E6%98%8E%E4%BC%99%E8%AE%A1%E4%BB%AC%E5%BC%80%E5%8F%91%E7%9A%84%E3%80%82)

如果我们用regenerator来转译我们前面的generator，这就是产生的代码（在编写本文时）：

```js
// `request(..)` is a Promise-aware Ajax utility

var foo = regeneratorRuntime.mark(function foo(url) {
    var val;

    return regeneratorRuntime.wrap(function foo$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
            context$1$0.prev = 0;
            console.log( "requesting:", url );
            context$1$0.next = 4;
            return request( url );
        case 4:
            val = context$1$0.sent;
            console.log( val );
            context$1$0.next = 12;
            break;
        case 8:
            context$1$0.prev = 8;
            context$1$0.t0 = context$1$0.catch(0);
            console.log("Oops:", context$1$0.t0);
            return context$1$0.abrupt("return", false);
        case 12:
        case "end":
            return context$1$0.stop();
        }
    }, foo, this, [[0, 8]]);
});
```

这和我们的手动推导有明显的相似性，比如`switch`/`case`语句，而且我们甚至可以看到，`val`被拉到了闭包外面，正如我们做的那样。

当然，一个代价是这个generator的转译需要一个帮助工具库`regeneratorRuntime`，它持有全部管理一个普通generator/*迭代器* 所需的可复用逻辑。它的许多模板代码看起来和我们的版本不同，但即便如此，概念还是可以看到的，比如使用`context$1$0.next = 4`追踪generator的下一个状态。

主要的结论是，generator不仅限于ES6+的环境中才有用。一旦你理解了它的概念，你可以在你的所有代码中利用他们，并使用工具将代码变形为旧环境兼容的。

这比使用`Promise`API的填补来实现前ES6的Promise要做更多的工作，但是努力完全是值得的，因为对于以一种可推理的，合理的，看似同步的顺序风格来表达异步流程控制来说，generator实在是好太多了。

一旦你迷上了generator，就再也不想回到异步意大利面条回调的地狱了!

## Review

Generator是一种新的ES6函数类型，它不像普通函数那样运行到完成。相反，可以在完成过程中暂停generator (完全保留其状态)，稍后可以从停止的地方恢复generator 。

这种暂停/继续的互换是一种协作而非抢占，这意味着generator拥有的唯一能力是使用`yield`关键字暂停它自己，而且控制这个generator的 *迭代器* 拥有的唯一能力是继续这个generator（通过`next(..)`）。

`yield`/`next(..)`的对偶不仅是一种控制机制，它实际上是一种双向消息传递机制。一个`yield ..`表达式实质上为了等待一个值而暂停，而下一个`next(..)`调用将把值（或隐含的`undefined`）传递回这个暂停的`yield`表达式。

`yield` / `next(..)`不仅仅是一种控制机制，它实际上是一种双向消息传递机制。`yield ..`表达式本质上暂停等待一个值，下一个`next(..)`调用将值（或隐式未定义）传递回暂停的yield表达式。

与异步流控制相关的generator的主要好处是，generator中的代码以自然同步/顺序的方式表示任务的一系列步骤。诀窍在于，本质上我们将潜在的异步隐藏在`yield`关键字后面——将异步移动到控制generator *iterator*的代码中。

换句话说，generator为异步代码保留了顺序的，同步的，阻塞的代码模式，这允许我们的大脑更自然地推理代码，解决了基于回调的异步产生的两个主要缺点之一。

### 译者总结

你也可以看之前`Understanding ES6`的[generator和iterator介绍](https://github.com/xiaohesong/til/blob/master/front-end/es6/understanding-es6/iterators%26generators.md)

- 接收参数

```js
function *run() {
    console.log(yield 'xiaohesong')
}

r = run()
r.next(1)
r.next(2)
```

你觉得上面的代码会返回或输出什么？

```js
r.next(1) // {done: false, value: 'xiaohesong'}
r.next(2) // 2
```

为什么会这样输出？第一个`next`(就是`r.next(1)`)的时候，碰到`yield`就暂停且返回`yield`的值(`'xiaohesong'`)，到这里，第一次`next`就这样结束了，但是generator没有结束，所以返回的是`{done: false, value: 'xiaohesong'}`，接下来就是`r.next(2)`这个第二次的next了，他会进行赋值，有`yield 'xiaohesong'`去接收这个`2`的赋值，所以打印出来是`2。`

和你想的一样吗？如果和你想的不一样，那你可以尝试这样思考：

```js
function *run() {
    const xiaohesong = yield xiaohesong
    console.log(xiaohesong)
}

r = run()
r.next(1)
r.next(2)
```

这样是不是稍微好理解一点啦？

所以知道为啥第一次`next`传递的参数都会丢失了吧。

- 终止generator

一个generator的iterator可以被从外部通过`return`来终止当前的iterator实例，当然，终止了，那返回的对象就是`done: true`了。

```js
function *run() {
  console.log(yield 'xiaohesong')
}
r = run()
r.return('didmehh@163.com') //{value: "didmehh@163.com", done: true}
```