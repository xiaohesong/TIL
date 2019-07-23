# Chapter 3: Promises

在第2章中，我们使用回调来表示程序异步和管理并发性，确定了两大类缺陷：缺乏顺序性和缺乏可信性。现在我们更加密切地理解这些问题，现在是时候将注意力转向可以解决这些问题的模式了。

我们首先要解决的问题是*控制权倒置*，这种信任如此脆弱地维系着，又如此容易失去。

回想一下，我们将程序的延续封装在回调函数中，并将回调传递给另一方(甚至可能是外部代码)，然后祈祷它在调用回调时能做正确的事情。

我们之所以这样做，是因为我们想说，“这是 *稍后* 将要发生的事，在当前的步骤完成之后。”

但如果我们能逆转这种 *控制反转* 呢?如果我们不将程序的延续交付给另一方，而是期望它返回一个知道任务何时完成的功能，然后我们的代码就可以决定下一步做什么?

这种范式称为 **Promises** 。

Promise开始席卷JS世界，开发人员和规范编写人员都在拼命地去除代码/设计中回调地狱的疯狂之处。事实上，大多数添加到JS/DOM平台的新异步api都是基于promise构建的。所以，深入研究并学习它们可能是个好主意，你不这么认为吗?

**注意：** “立即”一词将在本章中频繁使用，一般指一些Promise 解析(resolution )动作。然而，实际上在所有情况下，“立即”都是指作业队列行为(参见第1章)，而不是严格意义上的*现在*同步。

## What Is a Promise?

当开发人员决定学习一项新技术或模式时，通常他们的第一步是“向我展示代码!”我们很自然地会先跳起来，边走边学。

但事实证明，一些抽象仅看api就会丢失。Promise是其中一种工具，从人们如何使用它可以很明显地看出他们是否理解它的用途，还是学习和使用API。

考虑到这一点，我们来看看关于Promise的两个不同的类比。

### Future Value

想象一下这个场景:我走到一家快餐店的柜台前，点了一个芝士汉堡。我递给收银员1.47美元。通过下订单和付款，我提出了一个要回 *价值* 的要求(芝士汉堡)。我已经开始交易了。

但通常情况下，我并不能马上吃到芝士汉堡。收银员递给我一些东西代替我的芝士汉堡:上面有一个订单号的收据。这个订单号是一个借据(“我欠你的”)的*promise*，确保我最终能收到我的芝士汉堡。

所以我保留着收据和订单号。我知道它代表着我*即将到来*的汉堡，所以我不用再担心它了——除了有点饿!

在我等待的时候，我可以做其他事情，比如给朋友发一条短信说，“嘿，你能来和我一起吃午饭吗?”我要吃一个汉堡。”

我已经在考虑我即将到来的吉士汉堡了，尽管我还没有拿在手里。我的大脑之所以能够做到这一点，是因为它将订单号作为芝士汉堡的占位符。占位符本质上使值 *与时间无关* 。这是 **未来的值** 。

最后，我听到“113号订单!”我高兴地走到柜台，把手里的收据递给收银员，拿回我的吉士汉堡。

换句话说，一旦我的 *未来值* 准备好了，我就把我的值的Promise换成了值本身。

但还有另一种可能的结果。他们叫我的订单号，但当我去取我的芝士汉堡时，收银员遗憾地告诉我，“对不起，我们的芝士汉堡卖完了。” 暂且将此场景中的客户的遗憾放在一边，我们可以看到 *未来值* 的一个重要特征:它们可以表示成功或失败。

每次我点一个芝士汉堡的时候，我知道我要么最终会得到一个芝士汉堡，要么我会得到一个关于芝士汉堡短缺的坏消息，然后我就得想办法吃点别的午餐。

**注意:** 在代码中，事情没有那么简单，因为存在订单号可能永远不会被叫到的情况，在这种情况下，我们将无限期地处于未解决的状态。

#### 现在的值和以后的值

这听起来太抽象了，不适合应用到代码中。让我们更具体一点。

但是，在我们介绍Promise如何以这种方式工作之前，我们将借用我们已经理解的代码 - 回调！ - 如何处理这些 *未来的值* 。

当你编写代码来推理一个值时，比如对一个`number`进行数学运算，不管你是否意识到，你都已经假设了这个值的一些非常基本的东西，那就是它*现在*已经是一个具体的值了:

```js
var x, y = 2;

console.log( x + y ); // NaN  <-- because `x` isn't set yet
```

`x + y`操作假定`x`和`y`都已设置。我们很快就会详细说明，我们假设x和y值已经被解析(*resolved*)。

期望`+`运算符本身能够神奇地检测和等待`x`和`y`都被解析(也就是准备好)，然后再执行操作，这是毫无意义的。如果不同的语句*现在*完成，而其他语句*稍后*完成，这将导致程序很混乱，对吗?

如果两个语句中的一个(或两个)可能还没有完成，那你如何推断它们之间的关系呢? 如果语句2依赖语句1才能完成，那么只有两个结果：语句1现在完成并且一切正常，或者语句1还没有完成，因此语句2将失败。

如果这类事情听起来很像第1章的内容，很好!

继续回到`x + y`的数学运算。想象一下，如果有一种方法说，“把`x`和`y`相加，但是如果它们都还没有准备好，就等它们准备好。尽快把它们加进去。”

你的大脑可能已经跳到回调。好吧,所以…

```js
function add(getX,getY,cb) {
	var x, y;
	getX( function(xVal){
		x = xVal;
		// both are ready?
		if (y != undefined) {
			cb( x + y );	// send along sum
		}
	} );
	getY( function(yVal){
		y = yVal;
		// both are ready?
		if (x != undefined) {
			cb( x + y );	// send along sum
		}
	} );
}

// `fetchX()` and `fetchY()` are sync or async
// functions
add( fetchX, fetchY, function(sum){
	console.log( sum ); // that was easy, huh?
} );
```

花一点时间，让你感受这段的美秒(或不那么每秒)(耐心地吹口哨)。

虽然丑陋是存在的，但是这个异步模式有一些非常重要的地方需要注意。

在该代码片段中，我们将`x`和`y`视为未来值，并表示一个操作`add(..)`，该操作(从外部)并不关心`x`或`y`或两者是否立即可用。换句话说，它规范了*现在*和*以后*，以便我们可以依赖`add(..)`操作的可预测结果。

通过使用一个暂时一致的`add(..)`——它在*现在*和*以后*的时间内的行为是相同的——异步代码更容易推理。

更简单地说:为了一致地处理*现在*和*以后*的操作，我们将它们都放在以后: 所有操作都变成异步的。

当然，这种粗略的基于回调的方法还有很多需要改进的地方。这只是实现对未来值进行推理的好处的第一步，而不用担心时间方面的问题。

#### Promise值

我们肯定会在本章后面的部分更详细地介绍Promise——所以如果有些让你困惑，也不用担心——但是让我们简要地看一下如何通过`Promise`来表达`x + y`的例子:

```js
function add(xPromise,yPromise) {
	// `Promise.all([ .. ])` takes an array of promises,
	// and returns a new promise that waits on them
	// all to finish
	return Promise.all( [xPromise, yPromise] )

	// when that promise is resolved, let's take the
	// received `X` and `Y` values and add them together.
	.then( function(values){
		// `values` is an array of the messages from the
		// previously resolved promises
		return values[0] + values[1];
	} );
}

// `fetchX()` and `fetchY()` return promises for
// their respective values, which may be ready
// *now* or *later*.
add( fetchX(), fetchY() )

// we get a promise back for the sum of those
// two numbers.
// now we chain-call `then(..)` to wait for the
// resolution of that returned promise.
.then( function(sum){
	console.log( sum ); // that was easier!
} );
```

此代码段中有两层Promise。

直接调用`fetchX()`和`fetchY()`，并将它们返回的值(promise !)传递给`add(..)`。这些Promise所表示的底层值可能*现在*就准备好了，也可能*稍后*才准备好，但是无论如何，每个Promise都将行为规范化为相同。我们用一种与时间无关的方式推导`X`和`Y`的值。它们是*未来的值*。

第二层是`add(..)`创建的Promise(通过`Promise.all([ .. ])`)并返回，我们通过调用`then(..)`来等待。当`add(..)`操作完成时，`sum`这个*未来值*已经准备好了，我们可以将其打印出来。我们隐藏在`add(..)`逻辑中，用于等待`X`和`Y`的*未来值*。

**注意：** 在`add()`内部，`Promise.all([..])`调用创建一个promise(他等待`promiseX`和`promiseY`被解析)。对`.then(..)`的链式调用创建另一个promise，`return values[0] + values[1]`行立即解析(带有加法的结果)。因此，我们在`add(..)`调用末尾的`then(..)`调用——在代码段最后——实际上是在第二个被返回的promise上进行操作，而非被`Promise.all([ .. ])`创建的第一个promise。另外，虽然我们没有在这第二个`then(..)`的末尾链接任何操作，它也已经创建了另一个promise，我们可以选择监听/使用它。这类Promise链的细节将会在本章后面进行讲解。

就像芝士汉堡的订单一样，Promise的解决可能是拒绝而不是履行。与已实现的Promise不同，拒绝值(通常称为“拒绝原因”)可以由程序逻辑直接设置，也可以由运行时异常隐式地生成。

对于Promise，`then()`调用实际上可以携带两个函数作为参数，第一个函数用于实现(如前所示)，第二个函数用于拒绝:

```js
add( fetchX(), fetchY() )
.then(
	// fulfillment handler
	function(sum) {
		console.log( sum );
	},
	// rejection handler
	function(err) {
		console.error( err ); // bummer!
	}
);
```

如果在获取`X`或`Y`时出现错误，或者在添加过程中出现某种失败，`add(..)`返回的Promise将被拒绝，传递给`then(..)`的第二个回调错误处理程序将从该Promise接收拒绝值。

因为Promise从外部封装了依赖于时间的状态——等待底层值的实现或拒绝——因此Promise本身是与时间无关的，因此可以以可预测的方式组合(组合)Promise，而不考虑底层的时间或结果。

此外，一旦一个Promise被解析，它就会永远保持这种状态——在那个时候它就变成了一个*不可变*的值——然后可以根据需要多次*观察*它。

**注意：** 因为一个Promise一旦被解析，那么在外部就是不可变的，所以现在可以安全地将该值传递给任何一方，并且知道它不能被意外或恶意地修改。对于遵守Promise解决方案的多方来说尤其如此。一方不可能影响另一方遵守Promise解析的能力。不变性听起来像是一个学术话题，但它实际上是Promise设计中最基本、最重要的方面之一，不应该被轻易忽略。

这是理解Promise最强大和重要的概念之一。通过大量的工作，你就可以用丑陋的回调组合来临时创建相同的效果，但这并不是一个真正有效的策略，尤其是因为你必须一遍又一遍地这样做。

Promise是一种易于重用的机制，用于封装和组合*未来的值*。

### 完成事件

正如我们刚才看到的，单个Promise表现为*未来值*。但是，还有另一种方法来考虑Promise的解析:作为一个流控制机制——一个临时的*这个然后那个*(this-then-that)——用于异步任务中的两个或多个步骤。

让我们假设调用函数`foo(..)`来执行某个任务。我们不知道它的任何细节，也不在乎。它可能马上完成任务，也可能需要一段时间。

我们只需要知道`foo(..)`何时完成，以便我们可以继续下一个任务。换句话说，我们希望得到`foo(..)`完成的通知，以便我们可以*继续*。

在典型的JavaScript方式中，如果需要监听通知，你可能会将其视为事件。因此，我们可以将通知的需要重新定义为监听`foo(..)`发出的*完成*(或*延续*)事件的需要。

**注意：** 你是否将其称为“完成事件”或“延续事件”取决于你的视角。更关注的是`foo(..)`发生了什么，还是`foo(..)`结束后发生了什么?这两种观点都是准确和有用的。事件通知告诉我们`foo(..)`已经完成，但是还可以继续下一步。实际上，传递给事件通知调用的回调本身就是我们之前所称的延续。因为完成事件更聚焦于`foo(..)`，而`foo(..)`目前更受我们的关注，所以在本文的其余部分中，我们稍微倾向于*完成事件*。

使用回调，“通知”将是任务(`foo(..)`)调用的回调。但是有了Promise, 我们就可以扭转关系，并期望能够侦听`foo(..)`中的事件，当收到通知时，就相应地进行处理。

首先，考虑一些伪代码：

```js
foo(x) {
	// start doing something that could take a while
}

foo( 42 )

on (foo "completion") {
	// now we can do the next step!
}

on (foo "error") {
	// oops, something went wrong in `foo(..)`
}
```

我们调用`foo(..)`然后我们设置两个事件监听器，一个给`"completion"`，一个给`"error"`——`foo(..)`调用的两种可能的最终结果。实际上，`foo(..)`甚至没有意识到调用代码已经订阅了这些事件，这使得关注点得到了很好的分离(*关注点分离(*separation of concerns*)*)。

不幸的是，这样的代码需要一些JS环境中不存在的“魔法”(而且可能有点不切实际)。下面是我们用JS更自然的表达方式:

```js
function foo(x) {
	// start doing something that could take a while

	// make a `listener` event notification
	// capability to return

	return listener;
}

var evt = foo( 42 );

evt.on( "completion", function(){
	// now we can do the next step!
} );

evt.on( "failure", function(err){
	// oops, something went wrong in `foo(..)`
} );
```

`foo(..)`明确地创建一个事件订阅函数来返回，调用代码接收并注册两个事件处理程序。

与普通面向回调的代码的反转应该是明显的，而且是有意的。它没有将回调传递给`foo(..)`，而是返回一个我们称为`evt`的事件函数，`evt`接收回调。

但是如果你回顾一下第二章，回调本身就代表了*控制的反转*。因此，反转回调模式实际上是*反转的反转*，或*控制的非反转*——将控制恢复到我们最初希望它位于的调用代码。

一个重要的好处是，代码的多个独立部分可以被赋予监听事件的能力，并且当`foo(..)`完成时，它们都可以被独立地通知，以便在它完成后执行后续步骤:

```js
var evt = foo( 42 );

// let `bar(..)` listen to `foo(..)`'s completion
bar( evt );

// also, let `baz(..)` listen to `foo(..)`'s completion
baz( evt );
```

*控制非反转* 导致了更好的 *关注分离*，也就是`bar(..)`和`baz(..)`不用涉及如何调用`foo(..)`。相似地，`foo(..)`也不必知道或关心`bar(..)`和`baz(..)`的存在或它们是否在等待`foo(..)`完成的通知。

本质上，这个`evt`对象是独立关注点之间的中立第三方。

#### Promise "事件"

正如你现在可能已经猜到的，`evt`事件监听功能是一个Promise的类比。

在基于Promise的方法中，前面的代码段使`foo(..)`创建并返回一个`Promise`实例，然后该Promise将传递给`bar(..)`和`baz(..)`。

**注意：** 我们所监听的Promise解决方案“事件”并非严格意义上的事件(尽管它们的行为确实类似于事件)，并且它们通常不被称为`"completion"`或`"error"`。相反，我们使用`then(..)`来注册一个`"then"`事件。或者更精确地说，`then(..)`注册了`"fulfillment"`和/或`"rejection"`事件，尽管我们没有在代码中明确使用这些术语。

考虑下：

```js
function foo(x) {
	// start doing something that could take a while

	// construct and return a promise
	return new Promise( function(resolve,reject){
		// eventually, call `resolve(..)` or `reject(..)`,
		// which are the resolution callbacks for
		// the promise.
	} );
}

var p = foo( 42 );

bar( p );

baz( p );
```

**注意：** 使用`new Promise(function(..){..})`通常称为["显示构造函数"](https://blog.domenic.me/the-revealing-constructor-pattern/)。传入的函数立即执行(不是async deferred，而是回调`then(..)`)，它提供了两个参数，在本例中，我们将其命名为`resolve`和`reject`。这些是Promise的解决功能。`resolve(..)`通常表示完成，`reject(..)`表示拒绝。

你可能会猜到`bar(..)`和`baz(..)`的内部结构是什么样子的:

```js
function bar(fooPromise) {
	// listen for `foo(..)` to complete
	fooPromise.then(
		function(){
			// `foo(..)` has now finished, so
			// do `bar(..)`'s task
		},
		function(){
			// oops, something went wrong in `foo(..)`
		}
	);
}

// ditto for `baz(..)`
```

Promise解决方案并不一定需要发送消息，就像我们在将Promise视为*未来值*时所做的那样。它可以只是一个流控制信号，就像前面的代码片段中使用的那样。

另一种方法是:

```js
function bar() {
	// `foo(..)` has definitely finished, so
	// do `bar(..)`'s task
}

function oopsBar() {
	// oops, something went wrong in `foo(..)`,
	// so `bar(..)` didn't run
}

// ditto for `baz()` and `oopsBaz()`

var p = foo( 42 );

p.then( bar, oopsBar );

p.then( baz, oopsBaz );
```

**注意：** 如果你以前见过基于Promise的编码，你可能会认为代码的最后两行可以写成`p.then( .. ).then( .. )`,使用链接而不是`p.then(..);p.then (. .)`。这会有完全不同的行为，所以要小心！这种区别现在可能还不清楚，但实际上它是一种不同于我们目前看到的异步模式:分割/分叉。别担心！我们将在本章后面回到这一点。

我们不是将`p` promise传递给`bar(..)`和`baz(..)`，而是使用Promise来控制`bar(..)`和`baz(..)`何时执行，如果执行的话。主要区别在于错误处理。

在第一个代码段的方法中，无论`foo(..)`成功还是失败，都会调用`bar(..)`，如果通知`foo(..)`失败，`bar(..)`就会处理自己的回退逻辑。显然，对于`baz(..)`也是如此。

在第二个代码段中，只有在`foo(..)`成功时才调用`bar(..)`，否则将调用`oopsBar(..)`。`baz(. .)`同上。

这两种方法本身都不是完美的解决。但是会有一种情况比另一种情况更好接受一点。

在这两种情况下，从`foo(..)`返回的promise `p`用于控制接下来发生的事情。

此外，这两个代码片段最终对同一个promise `p`调用了两次`then(..)`，这说明了前面的观点，即promise(一旦解析)将永远保留它们的相同的解析结果(实现或拒绝)，并且可以根据需要多次观察。

当`p`被解析的时候，下一步将始终是相同的，无论是*现在*还是*以后*。

## Thenable 鸭子类型

在Promise的这一亩三分地，一个重要的细节是如何确定某些值是否是真的Promise。或者更直接点，它是一个表现得像Promise的值吗?

由于Promise是由`new Promise(..)`语法构造的，你可能认为`p instanceof Promise`是一个适合的检查。但不幸的是，有很多原因并不充分。

主要是你可以从另一个浏览器窗口(iframe等)接收Promise值，并且这个窗口会具有与当前窗口Promise不相同的Promise，而且这个这个检查也识别不出Promise的实例。

此外，库或框架可以选择使用自己封装的Promise而不使用原生的ES6 `Promise`实现。事实上，你很可能在没有Promise的旧浏览器中使用库中的Promises。

当我们在本章后面讨论Promise解决过程时，将会更加明显地看到，为什么一个不是真的但是像Promise的值对于能够识别和同化仍然非常重要。但现在，请相信我的话，这是拼图中至关重要的一块。

因此，我们决定，识别Promise(或行为类似于Promise的东西)的方法是将任何称为“thenable”的东西定义为任何具有`then(..)`方法的对象或函数。假设任何这样的值都是符合Promise的thenable。

“类型检查”的通常术语就是，对一个值做出假设的“类型”根据其形状(属性存在)被称为“duck typing”——“如果它长得像鸭子,而且像鸭子般呱呱叫,那一定是一只鸭子”(参见*Types & Grammar* 这本书系列的标题)。所以对鸭子类型的thenable检查可能是这样：

```js
if (
	p !== null &&
	(
		typeof p === "object" ||
		typeof p === "function"
	) &&
	typeof p.then === "function"
) {
	// assume it's a thenable!
}
else {
	// not a thenable
}
```

呀哈!撇开这个逻辑在很多地方实现的都很难看的事实不谈，还有一些更深层次、更麻烦的事情正在发生。

如果你尝试和对象/函数值实现一个Promise，恰好有一个`then(..)`函数，但是你不认为他是一个Promise/thenable，那不好意思，你运气好过头了，因为他会被自动thenable，并有特殊处理规则。(后面会有介绍)

如果你没有意识到值上有一个`then(..)`，那就更是这样了。例如:

```js
var o = { then: function(){} };

// make `v` be `[[Prototype]]`-linked to `o`
var v = Object.create( o );

v.someStuff = "cool";
v.otherStuff = "not so cool";

v.hasOwnProperty( "then" );		// false
```

`V`看起来一点也不像一个Promise或thenable。他只是含有一些属性在上面的普通对象罢了。你可能只是打算像任何其他对象一样传递该值。

但是你可能不知道，`v`也有一个`[[Prototype]]`- 被链接到另一个对象`o`(请参阅本系列图书的this & Object Prototype标题)，该对象`o`上恰好有一个`then(..)`。所以thenable鸭子类型检查认为并假设`v`是一个thenable。啊哦。

它甚至不需要像以下那样直接故意这么做：

```js
Object.prototype.then = function(){};
Array.prototype.then = function(){};

var v1 = { hello: "world" };
var v2 = [ "Hello", "World" ];
```

`v1`和`v2`都将会被假设为thenable。你无法控制或预测是否有任何其他代码恰巧或恶意地将`then(..)`添加到对`Object.prototype`, `Array.prototype`，或任何其他原生原型上。如果指定了一个函数，这个函数不调用任何参数作为回调，那么使用这样一个值解析的任何Promise都将永远挂起! 疯了。

听起来难以置信还是不太可能?也许。

但是请记住，在ES6之前的社区中已经存在几个著名的非Promise库，而这些库上恰好已经有一个名为`then(..)`的方法。其中一些库选择重命名自己的方法以避免冲突(这很糟糕!)。另一些人只是因为无法改变而被降级到“与基于Promise的编码不兼容”的不幸地位。

劫持先前未保留的 - 并且完全是通用的声音 - 然后属性名称的标准决定意味着过去，现在或未来的任何值（或其任何代表）都不能具有`then(..)`函数 无论是故意的还是偶然的，或者在Promises系统中，这个值会被混淆，这可能会产生很难追查的错误。

**警告：** 我不喜欢我们最后是如何用鸭子类型来实现Promise识别的。还有其他选择，例如“branding”甚至“anti-branding”;我们得到的似乎是最坏情况下的妥协。但也不全是厄运和悲观。稍后我们将看到，启用鸭子类型可能会很有帮助。只要注意，如果将某个Promise错误地标识为非Promise，那么启用鸭子类型可能是危险的。

## Promise信任

我们现在已经看到了两个强有力的类比，它们解释了Promises可以为异步代码做些什么。但如果我们停在那里，我们可能会错过Promise模式所确立的最重要的一个特征：信任。

虽然*将来的值*和完成事件类比会在我们已经探索过的代码模式中明显地发挥作用，但是在第2章的“信任问题”一节中，Promise为什么或如何设计来解决我们在“信任”中列出的所有*控制反转*的信任问题并不完全是显而易见的。但是通过一些挖掘，我们可以发现一些重要的保证，恢复对第2章失败的异步编码的信心！

让我们首先回顾一下仅使用回调编码的信任问题。当你将回调传递给实用程序`foo(..)`时，它可能会：

- 过早的调用回调
- 调用回调太晚甚至是没有调用
- 调用回调太少或者太多
- 无法传递任何必要的环境/参数
- 掩盖可能发生的任何错误/异常

Promise的特点是有意设计的，以便为所有这些问题提供有用的，可复用的答案。

### 调用过早

首先，这是一个问题，代码是否可以引入类似Zalgo的效果（见第2章），有时一个任务同步完成，有时异步完成，这可能导致竞争条件。

从定义上讲，Promise不会受到这种关注的影响，因为即使是立即实现的Promise(如`new Promise(function(resolve){resolve(42);})`)也无法同步的观察到。

也就是说，当你对一个Promise调用`then(..)`时，即使该Promise已经被解析，你提供给`then(..)`的回调 **始终** 是异步调用的(关于这方面的更多信息，请参阅第1章中的“Jobs”)。

不再需要插入自己的`setTimeout(.., 0)`黑科技了。Promise自动阻止Zalgo效应。

### 调用过晚

与前一点类似，当Promise创建功能调用`resolve(..)`或`reject(..)`时，将自动调度Promise `then(..)`注册的观察回调。这些预定的回调将在下一次异步时刻触发(参见第1章中的“Jobs”)。

同步观察是不可能的，因此同步任务链不可能以这种方式运行，从而实际上“延迟”另一个回调，使之不像预期的那样发生。也就是说，当一个Promise被解析时，所有`then(..)`注册的回调函数都将在下一次异步机会出现时立即被调用(同样，请参阅第1章中的“Jobs”)，其中一个回调函数内部发生的任何事情都不会影响/延迟其他回调函数的调用。

看一个例子：

```js
p.then( function(){
	p.then( function(){
		console.log( "C" );
	} );
	console.log( "A" );
} );
p.then( function(){
	console.log( "B" );
} );
// A B C
```

这里，`"C"`不能中断并且在`"B"`之前，这就是因为Promise被定义为如何操作的。

#### Promise调度的怪癖

然而，重要的是要注意，调度有很多细微差别，其中回调链接两个单独的Promise之间的相对排序是不可靠的。

如果两个promises `p1`和`p2`已经被解析，那么`p1.then(..); p2.then(..)`将在调用`p2`的回调函数之前调用`p1`的回调函数。但有些细微的情况可能并非如此，例如：

```js
var p3 = new Promise( function(resolve,reject){
	resolve( "B" );
} );

var p1 = new Promise( function(resolve,reject){
	resolve( p3 );
} );

var p2 = new Promise( function(resolve,reject){
	resolve( "A" );
} );

p1.then( function(v){
	console.log( v );
} );

p2.then( function(v){
	console.log( v );
} );

// A B  <-- 不是你所期待的 B A
```

稍后我们将对此进行介绍，但正如你所看到的，`p1`不是使用一个立即的值解析的，而是使用另一个使用值`"B"`解析的Promise `p3`。指定的行为是将`p3`解包到`p1`中，但是是异步的，因此`p1`的回调位于异步任务队列中`p2`回调的*后面*(参见第1章)。

为了避免这种细致入微的噩梦，你不应该依赖任何关于Promises中回调的排序/调度。实际上，一个好的实践是不要以这样一种方式编写代码，即多个回调的顺序非常重要。如果可以，尽量避免。

### 不曾调用回调

这是一个非常普遍的问题。 Promise可以通过多种方式解决这个问题。

首先，没有任何东西(即使是JS错误)可以阻止Promise通知你它的解决方案(如果已经解析了)。如果你为Promise注册了履行和拒绝回调，并且Promise得到解析，则将始终调用两个回调中的一个。

当然，如果回调本身有JS错误，你可能看不到预期的结果，但实际上回调已经被调用。我们将在稍后讨论如何在回调中通知错误，因为即使这些错误也不会被吞噬。

但如果Promise本身永远无法以任何一种方式解析呢?即使是这种情况，Promise也提供了一个答案，使用一个更高层次的抽象，称为“race”:

```js
// a utility for timing out a Promise
function timeoutPromise(delay) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			reject( "Timeout!" );
		}, delay );
	} );
}

// setup a timeout for `foo()`
Promise.race( [
	foo(),					// attempt `foo()`
	timeoutPromise( 3000 )	// give it 3 seconds
] )
.then(
	function(){
		// `foo(..)` fulfilled in time!
	},
	function(err){
		// either `foo()` rejected, or it just
		// didn't finish in time, so inspect
		// `err` to know which
	}
);
```

使用此Promise超时模式需要考虑更多细节，但我们稍后会再讨论它。

重要的是，我们可以确保`foo()`的结果有一个信号，以防止它无限期地挂起我们的程序。

### 调用次数太少或太多

根据定义，一个是要调用回调的适当次数。“太少”的情况是零调用，这与我们刚刚研究的“从不调用”情况相同。

“多次调用”的例子很容易解释。Promise被定义，他们只能被解析一次。如果由于某种原因，Promise创建代码多次尝试调用`resolve(..)`或`reject(..)`，或者尝试同时调用这两种方法，Promise将只接受第一个解析，并且将默默地忽略任何后续的尝试。

因为Promise只能被解析一次，所以任何`then(..)`注册的回调只会被调用一次(每一个)。

当然，如果你多次注册同一个回调函数，(例如，`p.then(f); p.then(f);`)，它将被调用的次数与它被注册的次数相同。保证响应功能仅被调用一次并不会阻止你搬起石头砸自己的脚。

### 无法传入任何参数/环境

Promise最多只能有一个解析值(实现或拒绝)。

如果你没有以任何方式显式解析值，则该值是`undefined`的，这在JS中是典型的。但是无论值是什么，它总是会传递给所有已注册的回调(并且是适当的: 执行或拒绝)，无论是*现在*还是*将来*。

需要注意的一点是: 如果调用`resolve(..)`或`reject(..)`使用多个参数，那么第一个参数之外的所有后续参数都将被静静地忽略。虽然这似乎违反了我们刚才描述的保证，但并不完全是，因为它构成了对Promise机制的无效使用。该API的其他无效用法(如多次调用`resolve(..)`)也受到类似的保护，因此这里的Promise行为是一致的(如果不是有点令人沮丧的话)。

如果要传递多个值，必须将它们封装在传递的另一个值中，例如`array`或`object`。

至于环境，JS中的函数总是保留其定义范围的闭包(请参阅本系列的scope & closure标题)，因此它们当然可以继续访问你提供的任何周围状态。当然，只有回调的设计也是如此，所以这并不是Promise带来的具体好处——但它是我们可以依赖的保证。

### 吞噬任何错误/异常

从基本意义上讲，这是对前一点的重述。如果你拒绝Promise的*原因*（即错误消息），该值将传递给拒绝回调函数。

但这里有更重要的东西在起作用。 如果在创建Promise的任何时候，或者在观察其解析时，都会发生JS异常错误，例如`TypeError`或`ReferenceError`，该异常将被捕获，并且它将强制有问题的Promise被拒绝。

看下面例子：

```js
var p = new Promise( function(resolve,reject){
	foo.bar();	// `foo` 没有被定义，因此出错!
	resolve( 42 );	// 永远不会经过这里 :(
} );

p.then(
	function fulfilled(){
		// 永远不会经过这里 :(
	},
	function rejected(err){
		// `err` 将会是一个 `TypeError` 异常对象
	}
);
```

发生在`foo.bar()`的js异常成为了Promise的拒绝，你可以捕获并回应。

这是一个重要的细节，因为它有效地解决了另一个潜在的Zalgo时刻，即错误可能产生同步反应，而非错误则是异步的。Promise甚至将JS异常转换为异步行为，从而极大地减少了竞争条件。

但是如果Promise被实现(resolved或rejected)会发生什么，但是在观察期间（在那个`then(..)`注册的回调中）有一个JS异常错误？即使那些没有丢失，但你可能会发现它们是如何处理的，这有点令人惊讶，直到你进一步挖掘:

```js
var p = new Promise( function(resolve,reject){
	resolve( 42 );
} );

p.then(
	function fulfilled(msg){
		foo.bar();
		console.log( msg );	// never gets here :(
	},
	function rejected(err){
		// never gets here either :(
	}
);
```

等等，这看起来好像`foo.bar()`的异常确实被吞噬了。别担心，他没有。但更深层次的问题是，我们没有监听。`p.then(..)`调用本身返回另一个promise，它是将被`TypeError`异常拒绝的promise。

为什么它不能调用这里定义的错误处理器呢?从表面上看，这似乎是一种合乎逻辑的行为。但这将违反Promise一旦得到解决就 **不可改变** 的基本原则。`p`早已被解析成`42`，所以不能因为观察`p`的解决有错误就把它变成拒绝。

除了违反原则之外，这种行为可能会造成严重破坏，如果说在promise `p`上有多个`then(..)`注册的回调，因为有些回调会被调用，而有些不会，至于为什么会这样，就非常不透明了。

### 值得信赖的Promise?

还有最后一个细节需要检查，以建立基于Promise模式的信任。

毫无疑问的，你已经注意到，Promise并没有摆脱回调。他只是改变了传递回调的位置。我们不是将回调传递给`foo(..)`，而是从`foo(..)`获得*一些东西*(表面上是一个真正的Promise)，然后我们将回调传递给那个*东西*。

但是为什么这要比一个单独的回调更可信呢? 我们怎样才能确定我们得到的东西实际上是一个值得信赖的Promise？难道这一切都只是一个纸牌屋，我们只能信任，是因为我们已经信任了吗？

Promise的一个最重要但往往被忽视的细节是，它们也有解决这个问题的办法。包含原生的ES6的`Promise`，他的实现就是`Promise.resolve(..)`。

如果你传递一个即时的，不是Promise的，不是thenable的值到`Promise.resolve(..)`，你会得到一个值被解析的Promise。换句话说，这两个Promise`p1`和`p2`的行为基本相同：

```
var p1 = new Promise( function(resolve,reject){
	resolve( 42 );
} );

var p2 = Promise.resolve( 42 );
```

但是如果你传递一个真正的Promise到`Promise.resolve(..)`，你只会得到返回的相同的promise：

```
var p1 = Promise.resolve( 42 );

var p2 = Promise.resolve( p1 );

p1 === p2; // true
```

更重要的是，如果你将一个非Promise的thenable值传递给`Promise.resolve(..)`，它将尝试解包该值，并且解包将继续进行，直到提取出具体的最终不像Promise值。

回想一下我们之前对theables的讨论？

考虑下面代码：

```
var p = {
	then: function(cb) {
		cb( 42 );
	}
};

// this works OK, but only by good fortune
p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

这个`p`是一个thenable，但不是一个真正的Promise。幸运的是，这是合理的，就像大多数情况一样。但是如果你得到的结果是：

```
var p = {
	then: function(cb,errcb) {
		cb( 42 );
		errcb( "evil laugh" );
	}
};

p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// 哎呦，不应该运行的呀这里
		console.log( err ); // evil laugh
	}
);
```

这个`p`是一个thenable，但是他不能很好的表现的跟promise一样。他是恶意的吗？或者他只是不知道Promise应该如何工作？老实说，这个并不是很重要。在任何一种情况下，他都不可信。

尽管如此，我们可以将这些版本的`p`中的任何一个传递给`Promise.resolve(..)`，我们将获得我们期望的标准化，安全的结果：

```
Promise.resolve( p )
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

`Promise.resolve(..)`将会通过任何thenable，并将解包成一个不是thenable的值。但是你从`Promise.resolve(..)`那里得到了一个真实的，真正的Promise，**你可以信赖它** 。如果你传入的内容已经是真正的Promise，那么你只需将其恢复正常，因此通过`Promise.resolve(..)`进行过滤以获得信任并没有任何缺点。

所以，假设我们正在调用`foo(..)`，我们不确定我们是否可以相信它的返回值是一个表现良好的Promise，但我们知道它至少是一个可靠的thenable。`Promise.resolve(..)`将为我们提供一个可靠的Promise包装器来链接：

```
// 不要这样做：
foo( 42 )
.then( function(v){
	console.log( v );
} );

// 这样做:
Promise.resolve( foo( 42 ) )
.then( function(v){
	console.log( v );
} );
```

**注意：** 将`Promise.resolve(..)`包装在任何函数的返回值(可以或不可用)周围的另一个有益的副作用是，它是将该函数调用规范化为行为良好的异步任务的简单方法。如果`foo(42)`有时返回一个即时值，有时返回一个Promise，那么`Promise.resolve(foo(42))`确保它总是一个Promise结果。并且避免使用Zalgo可以获得更好的代码。

### 建立信任

希望前面的讨论能够完全“解决(resolve)”(双关语)你心中的问题，即为什么Promise是可信的，更重要的是，为什么这种信任对于构建健壮的、可维护的软件如此重要。

你可以在没有信任的情况下在JS编写异步代码吗？当然可以。我们的JS开发人员近二十年来一直在编写异步编码，只有回调。

但是一旦你开始质疑你能在多大程度上相信你所建立的机制是可预测和可靠的，你开始意识到回调有一个相当不可靠的信任基础。

Promise是一种使用可信任语义来增强回调的模式，因此行为更具有推理性和可靠性。通过不转换对回调 *控制的反转* ，我们将控件放置在一个可信赖的系统（Promises）中，该系统专门用于为我们的异步带来理智。

## 链式流程

我们已经多次暗示过这一点，但是Promise并不仅仅是一个简单的“先这样后那样”的操作机制。当然，这是构建块，但是我们可以将多个Promise串在一起来表示异步步骤的序列。

实现这一目标的关键在于Promise的两种内在行为:

- 每次你在Promise上调用`then(..)`，它都会创建并返回一个新的Promise，我们可以使用它来链接。
- 无论从`then(..)`调用返回什么值，都会自动将fulfillment回调函数(第一个参数)设置为*链式*Promise的fulfillment(从第一点开始)。

让我们首先说明这意味着什么，然后我们将推导出这如何帮助我们创建流控制的异步序列。考虑以下:

```
var p = Promise.resolve( 21 );

var p2 = p.then( function(v){
	console.log( v );	// 21

	// fulfill `p2` with value `42`
	return v * 2;
} );

// chain off `p2`
p2.then( function(v){
	console.log( v );	// 42
} );
```

通过返回`v * 2`（即`42`），我们实现`p2`Promise，即创建并返回第一个`then(...)`调用。当`p2`的`then(..)`调用运行时，它从`return v * 2`语句接收到履行。当然，`p2.then(..)`创建了另一个Promise，我们可以将其存储在`p3`变量中。

但是创建中间变量`p2`(或`p3`，等等)有点麻烦。幸运的是，我们可以很容易地把这些链接在一起:

```
var p = Promise.resolve( 21 );

p
.then( function(v){
	console.log( v );	// 21

	// fulfill the chained promise with value `42`
	return v * 2;
} )
// here's the chained promise
.then( function(v){
	console.log( v );	// 42
} );
```

所以现在第一个`then(..)`是异步队列的第一步，第二个`then(..)`是第二步。只要你需要扩展，这可以继续。只要保持链接到前一个`then(..)`，每个都自动创建Promise。

但是这里缺少了一些东西。如果我们想让步骤2等待步骤1执行异步操作呢? 我们正在使用立即`return`声明，它立即履行链式Promise。

使Promise序列在每一步都真正具有异步能力的关键是回想`Promise.Resolve(..)`在你传递给它的时候是一个Promise还是thenable而不是最终值。`Promise.resolve(..)`直接返回一个接收到的真正的Promise，或者解包一个接收到的thenable的值——并在继续解包thenable的同时递归地执行。

如果你从履行(或拒绝)处理程序`return` 一个thenable或Promise，也会发生同样的解包。考虑:

```
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise and return it
	return new Promise( function(resolve,reject){
		// fulfill with value `42`
		resolve( v * 2 );
	} );
} )
.then( function(v){
	console.log( v );	// 42
} );
```

即使我们将`42`封装在一个返回的Promise中，它仍然被解包，并最终成为链式Promise的解析，因此第二个`then(..)`仍然接收到`42`。如果我们将异步引入到包装Promise中，那么一切仍然可以正常工作：

```
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise to return
	return new Promise( function(resolve,reject){
		// introduce asynchrony!
		setTimeout( function(){
			// fulfill with value `42`
			resolve( v * 2 );
		}, 100 );
	} );
} )
.then( function(v){
	// runs after the 100ms delay in the previous step
	console.log( v );	// 42
} );
```

这太强大了！现在，我们可以构造一个包含任意多个异步步骤的序列，并且根据需要，每个步骤都可以延迟下一步(或者不延迟!)。

当然，在这些示例中，从一个步骤传递到另一个步骤的值是可选的。如果不返回显式值，则假定隐式`undefined`，并且promise仍以相同方式链接在一起。因此，Promise解决只是进入下一步的信号。

为了进一步说明链接，让我们将延迟 - Promise创建（无解析消息）推广到我们可以重用多个步骤的实用程序中：

```
function delay(time) {
	return new Promise( function(resolve,reject){
		setTimeout( resolve, time );
	} );
}

delay( 100 ) // step 1
.then( function STEP2(){
	console.log( "step 2 (after 100ms)" );
	return delay( 200 );
} )
.then( function STEP3(){
	console.log( "step 3 (after another 200ms)" );
} )
.then( function STEP4(){
	console.log( "step 4 (next Job)" );
	return delay( 50 );
} )
.then( function STEP5(){
	console.log( "step 5 (after another 50ms)" );
} )
...
```

调用`delay(200)`创建一个将在200ms内完成的Promise，然后我们从第一个`then(..)` 履行回调返回该Promise，这将导致第二个`then(..)`的Promise等待该200msPromise。

**注意：** 如上所述，在技术上，这种交换有两个Promise: 200毫秒延迟Promise和第二个`then(...)`链接的链式Promise。但是，你可能会发现将这两个Promise在思想上结合起来更容易，因为Promise机制会自动地为你合并它们的状态。在这方面，你可以将`return delay(200)`看作是创建一个Promise来替换先前返回的链式Promise。

但说实话，没有消息传递的延迟序列并不是Promise流控制的一个非常有用的例子。 让我们来看一个更实用的场景。

让我们考虑发出Ajax请求，而不是定时器:

```
// assume an `ajax( {url}, {callback} )` utility

// Promise-aware ajax
function request(url) {
	return new Promise( function(resolve,reject){
		// the `ajax(..)` callback should be our
		// promise's `resolve(..)` function
		ajax( url, resolve );
	} );
}
```

我们首先定义一个`request(..)`，它构造了一个Promise来表示`ajax(..)`调用的完成:

```
request( "http://some.url.1/" )
.then( function(response1){
	return request( "http://some.url.2/?v=" + response1 );
} )
.then( function(response2){
	console.log( response2 );
} );

```

**注意：** 开发人员通常会遇到这样的情况，他们希望使用本身没有启用Promise的实用程序(比如`ajax(..)`，它需要回调)来执行支持Promise的异步流控制。虽然原生ES6 Promise机制不能自动为我们解决这种模式，但几乎所有的Promise库都*可以*。他们通常将此过程称为“提升(lifting)”或“promisifying”或其某些变体。我们稍后会回到这个技术。

使用返回Promise的`request(..)`，通过用第一个URL调用它我们在链条中隐式地创建了第一步，然后我们用第一个`then(..)`在返回的promise末尾进行连接。

一旦`response1`返回，我们使用这个值构造第二个URL，并进行第二个`request(..)`调用。第二个`request(..)` Promise被`return`，因此我们异步流程控制的第三步等地Ajax调用完成。最终，一旦`response2`返回，我们就会打印。

我们构造的Promise链不仅是一个表示多步异步序列的流控制，而且它还充当一个消息通道，从一个步骤到另一个步骤传播消息。

如果在Promise链的其中一个步骤出现问题怎么办？错误/异常是基于每个Promise的基础上的，这意味着有可能在链的任何点捕获这样的错误，而捕获的作用是在某种程度上“重置”链，使其在该点恢复正常操作:

```
// step 1:
request( "http://some.url.1/" )

// step 2:
.then( function(response1){
	foo.bar(); // undefined, error!

	// 永远不会经过这里
	return request( "http://some.url.2/?v=" + response1 );
} )

// step 3:
.then(
	function fulfilled(response2){
		// 永远不会到达resolve这里
	},
	// rejection处理程序捕获了异常
	function rejected(err){
		console.log( err );	// `TypeError` from `foo.bar()` error
		return 42;
	}
)

// step 4:
.then( function(msg){
	console.log( msg );		// 42
} );

```

当错误发生在步骤2，rejection(拒绝)处理程序在步骤3捕获他。步骤3返回值(这里是`42`)，如果有的话，将会完成下一步(步骤4)的promise，这样，现在这条链就回到了履行(正常)的状态。

**注意：** 正如我们之前讨论的那样，当从履行处理程序返回一个Promise时，它被解包并且可以延迟下一步。对于从拒绝处理程序返回Promise也是如此，这样如果步骤3中的返回了一个Promise而不是`return 42`，则该Promise可能会延迟第4步。`then(..)`调用的执行或拒绝处理程序中抛出的异常会导致下一个(链接的)Promise立即被拒绝。

如果你在promise上调用`then(..)`，并且你只传递一个履行处理程序给它，一个假设的拒绝处理程序被替换:

```
var p = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = p.then(
	function fulfilled(){
		// never gets here
	}
	// assumed rejection handler, if omitted or
	// any other non-function value passed
	// function(err) {
	//     throw err;
	// }
);

```

可以看到，假设的拒绝处理程序只是重新抛出错误，这最终迫使`p2`(链式Promise)以相同的错误原因拒绝。本质上，这允许错误继续沿Promise链传播，直到遇到明确定义的拒绝处理程序。

**注意：** 稍后我们将详细介绍使用Promise进行错误处理的详细信息，因为还有其他细致入微的细节需要关注。

如果没有将正确的有效函数作为履行处理程序参数传递给`then(..)`，则还会替换默认处理程序：

```
var p = Promise.resolve( 42 );

p.then(
	// assumed fulfillment handler, if omitted or
	// any other non-function value passed
	// function(v) {
	//     return v;
	// }
	null,
	function rejected(err){
		// never gets here
	}
);

```

你可以看到，默认的履行处理器只是将它收到的任何值传递给下一步（Promise）。

**注意：** `then(null,function(err){ .. })`模式 -- 只是处理拒绝(如果有)，但是让前面一个通过，API中有个快捷的方式：`catch(function(err){ .. })`。在下一节中，我们将更全面地讨论`catch(..)`。

让我们简要回顾一下实现链接流控制的Promise的内在行为：

- 对一个Promise的一个`then(..)`调用会自动产生一个新的Promise来从调用返回。
- 在履行/拒绝处理程序内部，如果返回值或抛出异常，则相应地解析新返回的（可链接的）Promise。
- 如果履行或拒绝处理程序返回一个Promise，它将被解包，因此无论其解析是什么，它都将成为当前`then(..)`返回的链接Promise的解析。

虽然链接流控制是有帮助的，但将其视为Promise如何组合(结合)在一起而不是主要意图的附带好处可能是最准确的。正如我们已经多次详细讨论过的那样，promise将异步规范化，并封装了依赖于时间的值状态，这使得我们能够以这种有用的方式将它们链接在一起。

然，正如我们在第2章中所确定的那样，链条的顺序表达性（这个...然后...这个......然后......）是对纠结的混乱回调的重大改进。但是仍然有相当数量的样板文件（`then(..)`和`function(){ .. }`）需要去蹚过。在下一章中，我们将看到使用生成器(generator)实现顺序流控制表达性的更好的模式。

### 术语:解析(resolve)、完成(fulfill)和拒绝(reject)

在你深入了解Promise之前，我们需要澄清“解析(resolve)”，“完成(fulfill)”和“拒绝(reject)”这两个术语的一些轻微混淆。让我们首先考虑一下`Promise(..)`构造函数：

```
var p = new Promise( function(X,Y){
	// X() for fulfillment
	// Y() for rejection
} );

```

可以看到，这里提供了两个标记了的回调函数(`X`和`Y`)。第一个*通常*用于将Promise标记为已完成，第二个*通常*用于将Promise标记为已拒绝。但是“通常”是什么，以及这对于准确命名来说，这些参数意味着什么呢？

最终，它只是你的用户代码，而标识符名称不会被引擎解释为任何含义，因此在*技术上*并不重要;`foo` 和`bar`在功能上是相等的。但是你使用的词语不仅会影响你对代码的思考方式，还会影响你团队中的其他开发人员如何思考它。错误地考虑精心编排的异步代码几乎肯定会比意大利式回调方法更糟糕。

所以你怎么称呼它们是很重要的。

第二个参数很容易决定。几乎所有的文献都使用`reject(..)`作为它的名字，因为它确实（并且只是！）它的作用，这是一个非常好的选择。我 **强烈建议** 你总是使用`reject(..)`这个名字。

但是对于第一个参数有一点模糊，在Promise文献中经常被标记为`resolve(..)`。这个词显然与“resolution”有关，在整个文学作品(包括这本书)中，“resolution”都用来描述为Promise设置一个最终值/状态。我们已经多次使用“解析Promise(resolve the Promise)”来表示履行或拒绝Promise。

但是，如果这个参数似乎是专门用来完成Promise的，那么我们为什么不把它称为`fulfill(..)`，而不是`resolve(..)`，这样更准确一些呢?要回答这个问题，我们还来看看两个`Promise` API方法：

```
var fulfilledPr = Promise.resolve( 42 );

var rejectedPr = Promise.reject( "Oops" );

```

`Promise.resolve(..)`创建一个Promise，它被解析为赋予它的值。在这里例子里，`42`是一个普通的，非Promise非thenable的值，为值`42`创建了一个完成的promise `fulfilledPr` 。`Promise.reject("Oops")`为理由`"Oops"`创建了一个拒绝的promise `rejectedPr` 。

现在让我们来说明为什么单词“resolve”(例如`Promise.resolve(..)`)是明确的，而且如果在可能导致完成或拒绝的上下文中明确使用，它实际上更准确:

```
var rejectedTh = {
	then: function(resolved,rejected) {
		rejected( "Oops" );
	}
};

var rejectedPr = Promise.resolve( rejectedTh );

```

正如我们在本章前面所讨论的，`Promise.resolve(..)`将直接返回接收到的真实Promise，或者解包接收到的thenable。如果thenable的解包表明了是一个拒绝的状态，从`Promise.resolve(..)`返回的Promise实际上是一个拒绝的状态。

现在应该清楚了，`resolve(..)`是`Promise(..)`构造函数的第一个回调参数的适当名称。

**警告：** 前面提到的`reject(..)`不做`resolve(..)`所做的解包这件事。如果将Promise / thenable值传递给`reject(..)`，则该未动过的值将被设置为拒绝原因。后续拒绝处理程序将接收你传递给`reject(..)`的实际Promise / thenable，而不是其潜在的立即值。

但是现在让我们将注意力转向提供给`then(..)`的回调。它们应该被称为什么(在文学和代码中)?我建议`fulfilled(..)`和`rejected(..)`:

```
function fulfilled(msg) {
	console.log( msg );
}

function rejected(err) {
	console.error( err );
}

p.then(
	fulfilled,
	rejected
);

```

在`then(..)`的第一个参数的情况下，它始终是实现情况，因此不需要“resolve”术语的对偶性。作为旁注，ES6规范使用`onFulfilled(..)` 和`onRejected(..)`来标记这两个回调，因此它们是准确的术语。

## Error 处理

我们已经看到了几个Promise拒绝的例子 - 无论是故意通过调用`reject(..)`还是偶然通过JS异常 - 允许在异步编程中进行更准确的错误处理。让我们回过头来，明确一下我们忽略的一些细节。

对于大多数开发人员来说，最自然的错误处理形式是同步`try..catch`。不幸的是，它是同步的，所以它不能帮助异步代码模式:

```
function foo() {
	setTimeout( function(){
		baz.bar();
	}, 100 );
}

try {
	foo();
	// later throws global error from `baz.bar()`
}
catch (err) {
	// never gets here
}

```

`try..catch`肯定很好，但是他不适用于异步操作。也就是说，除非有一些额外的环境支持，我们将在第四章回到generator。

在回调中，出现了一些模式错误处理的标准，最著名的是“错误优先回调”风格:

```
function foo(cb) {
	setTimeout( function(){
		try {
			var x = baz.bar();
			cb( null, x ); // success!
		}
		catch (err) {
			cb( err );
		}
	}, 100 );
}

foo( function(err,val){
	if (err) {
		console.error( err ); // bummer :(
	}
	else {
		console.log( val );
	}
} );

```

**注意：** `try..catch`仅适用于`baz.bar()`调用将成功或立即失败的视角，同步。 如果`baz.bar()`本身就是它自己的异步完成函数，那么其中的任何异步错误都不会被捕获。

我们传递给`foo(..)`的回调函数期望通过保留的第一个参数`err`接收错误信号。如果存在，则假定有误差。如果没有，假设没问题。

这种错误处理在技术上是异步的，但它根本不能很好地构成。 与这些无处不在的if语句检查编织在一起的多级错误优先回调不可避免地会导致回调地狱的危险（见第2章）。

这种错误处理在技术上是异步的，但它根本不能很好地组合。与这些普遍存在的`if`语句检查交织在一起的多级错误优先回调不可避免地会导致回调地狱的危险(参见第2章)。

因此，我们回到Promise中的错误处理，将拒绝处理程序传递给`then(..)`。Promise不使用流行的“错误优先回调”设计风格，而是使用“分割回调”风格; 有一个回调用于履行，一个用于拒绝：

```
var p = Promise.reject( "Oops" );

p.then(
	function fulfilled(){
		// never gets here
	},
	function rejected(err){
		console.log( err ); // "Oops"
	}
);

```

虽然这种错误处理模式在表面上很有意义，但Promise错误处理的细微差别往往更难以完全掌握。

考虑下面代码：

```
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	},
	function rejected(err){
		// never gets here
	}
);

```

如果`msg.toLowerCase()`合法地抛出一个错误(确实如此!)，为什么我们的错误处理程序没有得到通知? 正如我们前面所解释的，这是因为错误处理程序用于`p` promise，它已经用值`42`完成了。`p`Promise是不可变的，因此唯一能被通知错误的Promise是从`p.then(..)`返回的Promise，在本例中，我们没有捕获这个Promise。

这应该清楚地说明了为什么使用promise处理错误很容易出错。错误很容易被忽略，因为这很少是你想要的。

**警告：** 如果你以无效的方式使用Promise API，并且出现了一个错误，阻止了正确的Promise构造，那么结果将是一个立即抛出的异常，而 **不是一个被拒绝的Promise** 。Promise构造失败的一些错误使用示例：`new Promise(null)`, `Promise.all()`, `Promise.race(42)`，等等。如果你一开始就没有有效地使用Promise API来构造一个Promise，那么你就不会得到一个被拒绝的Promise !

### 绝望的坑

Jeff Atwood多年前就注意到：编程语言通常以这样的方式设置，默认情况下，开发人员会陷入“绝望的陷阱”（[https://blog.codinghorror.com/falling-into-the-pit-of-success/）](https://blog.codinghorror.com/falling-into-the-pit-of-success/%EF%BC%89) ——在这里意外会被惩罚——而你不得不更努力地使它正确。他恳求我们创造一个“成功的陷阱”，默认情况下你会陷入预期的（成功的）行动，因此必须努力失败。

Promise错误处理毫无疑问是“绝望的坑”设计。默认情况下，它假定你希望任何错误都被Promise状态吞噬，如果你忘记观察该状态，那么错误将在不为人知的情况下悄然消失——通常是让人绝望。

为了避免一个错误被遗忘/丢弃的Promise的沉默所丢失，一些开发人员声称Promise链的“最佳实践”是始终以一个`catch(..)`结束你的链，例如:

```
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.catch( handleErrors );

```

因为我们没有将拒绝处理程序传递给`then`，所以默认处理程序被替换，它只是将错误传播到链中的下一个promise。因此，进入`p`的错误和解析`p`之后的错误(比如`msg.toLowerCase()` )都会过滤到最终的`handleErrors(..)`。

问题得到了解决，不是吗？没有那么快的。

如果`handleErrors`本身也有错误会发生什么？谁捕获到了？还有另一个无人照管的Promise：一个`catch`返回，我们没有捕获，也没有注册拒绝处理程序。

你不能只是把另一个`catch(..)`挂在链子的末端，因为它也可能失败。任何Promise链的最后一步，不管它是什么，总是有可能，甚至越来越有可能，被困在一个未被注意到的Promise中，无法发现错误。

听起来像是一个不可能的谜题?

### 未捕获处理

完全解决这个问题并不是一件容易的事。还有其他方法可以解决它，许多人会说这样 *更好* 。

一些Promise库添加了一些方法来注册“全局未处理拒绝”处理程序之类的东西，这些方法将被调用，而不是全局抛出错误。但是，对于如何将错误识别为“未捕获”，他们的解决方案是设置一个任意长度的计时器，比如从拒绝开始运行3秒。如果Promise被拒绝但在计时器触发之前没有注册错误处理程序，那么假设你不会注册处理程序，因此它“未被捕获”。

在实践中，这对于许多库都很有效，因为大多数使用模式通常不会要求在拒绝Promise和观察拒绝之间有明显的延迟。但这种模式是麻烦,因为3秒是任意的(即使有经验),也因为确实有些情况下你希望Promise在一段无限期内坚持其被拒绝，而你真的不想要 让你的“未被捕获”的处理程序调用所有那些误报（尚未处理的“未捕获的错误”）。

另一个更常见的建议是Promise应该添加一个`done(..)`，这实际上将Promise链标记为“done”。`done(..）`不会创建并返回Promise，因此传递给`done(..)`的回调显然没有连接到向不存在的链式Promise报告问题。

那么会发生什么呢？它被视为你在未捕获的错误条件下通常会遇到的情况：`done()`拒绝处理程序中的任何异常都将作为全局未捕获错误抛出（基本上在开发人员控制台中）：

```
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.done( null, handleErrors );

// if `handleErrors(..)` caused its own exception, it would
// be thrown globally here

```

这听起来可能比无休止的链接或任意超时更有吸引力。但最大的问题是，它不是ES6标准的一部分，因此，无论它听起来有多好，充其量它离成为一个可靠且无处不在的解决方案还有很长一段路要走。

那么，我们只是被困住了吗?不完全是。

浏览器具有我们的代码所没有的独特功能:它们可以跟踪并确定何时丢弃和垃圾收集任何对象。因此，浏览器可以跟踪Promise对象，每当它们被垃圾收集时，如果其中有拒绝，浏览器就会确定这是一个合法的“未捕获错误”，并因此确信应该将其报告给开发人员控制台。

**注意：** 在撰写本文时，Chrome和Firefox都曾尝试过这种“未捕获拒绝”功能，不过充其量也只是不完全支持。

然而，如果一个Promise没有被垃圾收集(通过许多不同的编码模式，很容易意外地发生这种情况)，浏览器的垃圾收集嗅探功能将无法帮助你了解和诊断你是否有一个被默默拒绝的Promise。

还有其他选择吗?是的。

### 成功的坑

以下只是理论，Promises有朝一日会如何改变。 我相信它会远远优于我们现有的产品。 而且我认为即使在ES6之后这种变化也是可能的，因为我认为它不会破坏与ES6 Promises的Web兼容性。 此外，如果你小心的话，它可以是polyfilled / prollyfilled。 让我们来看看：

- 如果Promise没有注册错误处理程序，则在下一次Job或事件循环tick时，Promise可以默认报告(向开发人员控制台)任何拒绝。
- 对于希望被拒绝的Promise在观察之前无限期地保持其被拒绝状态的情况，可以调用`defer()`，这将抑制对该Promise的自动错误报告。

如果一个Promise被拒绝，默认地它会吵吵闹闹地向开发者控制台报告这个情况（而不是默认不出声）。你既可以选择隐式地处理这个报告（通过在拒绝之前注册错误处理器），也可以选择明确地处理这个报告（使用`defer()`）。无论哪种情况，*你* 都控制着这种误报。

考虑下面的代码：

```
var p = Promise.reject( "Oops" ).defer();

// `foo(..)` is Promise-aware
foo( 42 )
.then(
	function fulfilled(){
		return p;
	},
	function rejected(err){
		// handle `foo(..)` error
	}
);
...

```

我们创建了`p`，我们知道我们会为了使用/监听它的拒绝而等待一会儿，所以我们调用`defer()`——如此就不会有全局的报告。`defer()`单纯地返回同一个promise，为了链接的目的。

从`foo(..)`返回的promise *当即* 就添附了一个错误处理器，所以这隐含地跳出了默认行为，而且不会有全局的关于错误的报告。

但是`then(..)`调用返回的promise没有附加`defer()`或错误处理程序，所以如果它拒绝(从任何一个解析处理程序内部)，那么它将作为未捕获的错误报告给开发人员控制台。

**这种设计是一个成功的坑。** 默认情况下，所有错误要么被处理，要么被报告——几乎所有开发人员在几乎所有情况下都希望如此。你要么注册一个处理程序，要么故意选择退出，并表明你打算将错误处理延迟到稍后;你选择在特定的情况下承担额外的责任。

这种方法的唯一真正的危险是，如果你`defer()`一个Promise，但实际上却从来没有观察到/处理过它的拒绝。

但你不得不有意地调用`defer()`来选择进入绝望深渊——默认是成功深渊——所以对于从你自己的错误中拯救你这件事来说，我们能做的不多。

我觉得对于Promise的错误处理还有希望（在后ES6时代）。我希望上层人物将会重新思考这种情况并考虑选用这种方式。同时，你可以自己实现这种方式（给读者们的挑战练习！），或使用一个 *聪明* 的Promise库来为你这么做。

**注意：** 这种错误处理/报告的确切的模型已经在我的 *asynquence* Promise抽象库中实现，我们会在本书的附录A中讨论它。

## Promise 模式

我们已经隐含地看到了使用Promise链的顺序模式（这个-然后-这个-然后的流程控制），但是我们还可以在Promise的基础上抽象出许多其他种类的异步模式。这些模式用于简化异步流程控制的的表达——这有助于使我们的代码更具理性和更易于维护——即便是我们程序中最复杂的部分。

有两个这样的模式被直接编码在ES6原生的`Promise`实现中，因此我们免费获取它们，以用作其他模式的构建块。

### Promise.all([ .. ])

在异步序列（Promise链）中，在任何给定时刻仅协调一个异步任务 - 步骤2严格遵循步骤1，步骤3严格遵循步骤2。但是，如果同时执行两个或多个步骤(又称为“并行”)呢?

在经典的编程术语中，“gate”是一种机制，它在继续之前等待两个或多个并行/并发任务完成。它们完成的顺序并不重要，只是所有这些顺序都必须完成才能打开并让流控制通过。

在Promise API中，我们将此模式称为`all([..])`。

你想同时发出两个Ajax请求，并在发出第三个Ajax请求之前等待两者完成，无论他们的顺序如何。考虑：

```
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.all( [p1,p2] )
.then( function(msgs){
	// both `p1` and `p2` fulfill and pass in
	// their messages here
	return request(
		"http://some.url.3/?v=" + msgs.join(",")
	);
} )
.then( function(msg){
	console.log( msg );
} );

```

`Promise.all([ .. ])`期待一个参数，是个`array`，由Promise的实例组成。从`Promise.all([..])`调用返回的promise将收到一条履行消息（此片段中的``msgs``），该消息是来自传入的promise中的所有履行消息的数组，其顺序与指定的顺序相同（不论完成的顺序如何 ）。

**注意：** 从技术上讲，传递给`Promise.all([..])`的值的`array`可以包括Promises，thenables，甚至是立即值。列表中的每个值基本上都通过`Promise.resolve()`传递，以确保它是一个真正的Promise在等待，因此立即值将被标准化为该值的Promise。如果数组为空，则立即实现主Promise。

`Promise.all([..])`返回的主要Promise只有在满足所有的Promise时才能实现。如果这些Promise中的任何一个被拒绝，则主要的`Promise.all([..])`Promise会立即被拒绝，从而丢弃任何其他Promise的所有结果。

记住要始终将拒绝/错误处理程序附加到每个Promise，甚至是从`Promise.all`返回的Promise。

### Promise.race([ .. ])

虽然`Promise.all([..])`同时协调多个Promise并假设所有promise都是为了实现，但有时你只想回应“越过终点线的第一个Promise”，让其他Promise消失。

这种模式被经典地称为“门闩(latch)”，但在promise中它被称为“race”。

**警告：** 虽然“只有第一个冲过终点线的人才会赢”的比喻很好地符合这种行为，但遗憾的是，“race”是一个被占用的术语，因为“竞争条件(race conditions)”通常被视为程序中的bug(参见第1章)。不要将`Promise.race([..])`与“竞争条件”混为一谈。

`Promise.race([ .. ])`也期望一个`array`参数，包含一个或多个 promise、thenable或立即值。有一个即时值的存在没有多大实际意义，因为第一个列出来的人显然会赢——就像一个赛跑者在终点线出发的竞走比赛!

与`Promise.all([..])`类似，当Promise有任何一个被解析时，`Promise.race([..])`将履行，并且当任何Promise解决方案被拒绝时它将reject。

**警告：** 一个“race”至少需要一个“runner”，因此如果传递一个空`array`，那就不会立即解析，主`race([..])`Promise将永远不会解析。这很操蛋啊！ES6应该指定它要么完成、要么拒绝，要么抛出某种同步错误。不幸的是，由于在ES6 `Promise`之前的Promise库中有较高优先级，所以必须将这个陷阱保留在那里，所以要注意永远不要发送空`array`。

让我们回顾一下之前的并发Ajax示例，但是在`p1`和`p2`之间的竞争上下文中:

```js
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.race( [p1,p2] )
.then( function(msg){
	// either `p1` or `p2` will win the race
	return request(
		"http://some.url.3/?v=" + msg
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

因为只有一个promise获胜，所以履行值是单个消息，而不是像`Promise.all([..])`那样的数组。

#### 超时race

我们之前看过这个例子，说明了如何使用`Promise.race([..])`来表达“promise超时”模式：

```js
// `foo()` is a Promise-aware function

// `timeoutPromise(..)`早前定义过，
// 返回一个在指定延迟后reject的Promise

// 为`foo()`设置超时
Promise.race( [
	foo(),					// 尝试 `foo()`
	timeoutPromise( 3000 )	// 给他 3 秒
] )
.then(
	function(){
		// `foo(..)` 在时间内完成!
	},
	function(err){
		// `foo()` rejected 或只是没有在规定时间内完成
		// 可根据`err`来得知
	}
);
```

这种超时模式在大多数情况下都可以很好的完成。但是有一些细微的差别需要考虑，坦白地说，它们适用于这两个`Promise.race([ .. ])` 和 `Promise.all([ .. ])`。

#### "Finally"

要问的关键问题是，“那些被抛弃/忽视的Promise会发生什么?” 我们不是从性能角度提出这个问题 - 它们通常会使垃圾收集符合条件 - 但从行为角度来看（副作用等）。Promise不能被取消，也不应该被取消，因为这将破坏本章后面“Promise Uncancelable”一节中讨论的外部不可变信任，所以只能默默地忽略它们。

但是，如果前一个示例中的`foo()`保留了某种资源供使用，但是超时首先触发并导致Promise被忽略，该怎么办?在此模式中，是否有任何东西可以在超时之后主动释放保留的资源，或者以其他方式消除它可能产生的任何副作用?如果你只想记录`foo()`超时的事实呢?

一些开发人员建议Promise需要一个`finally(..)`回调函数，当一个Promise解析时，它总是被调用，并允许你指定可能需要的任何清理。目前规范中还不存在这种情况，但它可能出现在ES7+中。我们只能等着瞧了。

它可能看起来像这样：

```js
var p = Promise.resolve( 42 );

p.then( something )
.finally( cleanup )
.then( another )
.finally( cleanup );
```

**注意：** 在各种Promise库中，finally(..)仍然创建并返回一个新的Promise(以保持链的运行)。如果cleanup(..)函数返回一个Promise，那么它将被链接到链中，这意味着你仍然可能存在我们前面讨论过的未处理的拒绝问题。

同时，我们可以做一个静态的帮助工具，让我们观察(不干扰)一个promise的解决：

```js
// polyfill-safe guard check
if (!Promise.observe) {
	Promise.observe = function(pr,cb) {
		// side-observe `pr`'s resolution
		pr.then(
			function fulfilled(msg){
				// schedule callback async (as Job)
				Promise.resolve( msg ).then( cb );
			},
			function rejected(err){
				// schedule callback async (as Job)
				Promise.resolve( err ).then( cb );
			}
		);

		// return original promise
		return pr;
	};
}
```

以下是我们在之前的超时示例中使用它的方法：

```js
Promise.race( [
	Promise.observe(
		foo(),					// attempt `foo()`
		function cleanup(msg){
			// clean up after `foo()`, even if it
			// didn't finish before the timeout
		}
	),
	timeoutPromise( 3000 )	// give it 3 seconds
] )
```

这个`Promise.observe(..)`帮助工具只是描述你如何在不干扰Promise的情况下观测它的完成。其他的Promise库有他们自己的解决方案。不论你怎么做，你都将很可能有个地方想用来确认你的Promise没有意外地被静默地忽略掉。

### all([ .. ]) 与 race([ .. ]) 的变体

虽然原生ES6 Promises带有内置的`Promise.all([..])`和`Promise.race([..])`，但还有其他一些常用的模式，这些模式在这些语义上有变化：

- `none([ .. ])`是像`all([ .. ])`,但是满足和拒绝被转换 。所有的Promise都需要被拒绝——拒绝变成了完成值，反之亦然。
- `any([ .. ])`很像`all([ .. ])`，但它忽略任何拒绝，所以只有一个需要完成即可，而不是它们所有的。
- `first([ .. ])`像是一个带有`any([ .. ])`的竞合，它忽略任何拒绝，而且一旦有一个Promise完成时，它就立即完成。
- `last([ .. ])`很像`first([ .. ])`，但是只有最后一个完成胜出。

某些Promise抽象工具库提供这些方法，但你也可以用Promise机制的`race([ .. ])`和`all([ .. ])`，自己定义他们。

比如，这是我们如何定义`first([..])`:

```js
// polyfill-safe guard check
if (!Promise.first) {
	Promise.first = function(prs) {
		return new Promise( function(resolve,reject){
			// loop through all promises
			prs.forEach( function(pr){
				// normalize the value
				Promise.resolve( pr )
				// whichever one fulfills first wins, and
				// gets to resolve the main promise
				.then( resolve );
			} );
		} );
	};
}
```

**注意：** 这个`first(..)`的实现不会在所有的promise都被拒绝时拒绝；它会简单地挂起，很像`Promise.race([])`。如果需要，你可以添加一些附加逻辑来追踪每个promise的拒绝，而且如果所有的都被拒绝，就在主promise上调用`reject()`。我们把它留给读者作为练习。

### 并发迭代

有时，你希望遍历Promise列表，并对所有Promise执行一些任务，就像你可以对同步数组(例如，`forEach(..)`、`map(..)`、`some(..)`和`every(..)`)所做的那样。如果针对每个Promise执行的任务基本上是同步的，那么这些任务就可以正常工作，就像我们在前面的代码片段中使用的forEach(..)一样。

但是，如果这些任务本质上是异步的，或者可以/应该同时执行，那么可以使用这些实用程序的异步版本(由许多库提供)。

例如，让我们考虑一个异步`map(..)`实用程序，它接受一个`array`值(可以是promise或其他任何东西)，加上一个函数(任务)来针对每个值执行。`map(..)`本身返回一个promise，它的完成的值是一个`array`，该数组持有每个任务的异步完成值(按照相同的映射顺序):

```js
if (!Promise.map) {
	Promise.map = function(vals,cb) {
		// new promise that waits for all mapped promises
		return Promise.all(
			// note: regular array `map(..)`, turns
			// the array of values into an array of
			// promises
			vals.map( function(val){
				// replace `val` with a new promise that
				// resolves after `val` is async mapped
				return new Promise( function(resolve){
					cb( val, resolve );
				} );
			} )
		);
	};
}
```

在`map(..)`的这个实现中，你不能发出异步拒绝信号，但是如果在映射回调(`cb(..)`)中发生同步异常/错误，主`Promise .map(..)`返回的promise将拒绝。

让我们用`map(..)`来举例说明，它有一个Promise列表(而不是简单的值):

```js
var p1 = Promise.resolve( 21 );
var p2 = Promise.resolve( 42 );
var p3 = Promise.reject( "Oops" );

// double values in list even if they're in
// Promises
Promise.map( [p1,p2,p3], function(pr,done){
	// make sure the item itself is a Promise
	Promise.resolve( pr )
	.then(
		// extract value as `v`
		function(v){
			// map fulfillment `v` to new value
			done( v * 2 );
		},
		// or, map to promise rejection message
		done
	);
} )
.then( function(vals){
	console.log( vals );	// [42,84,"Oops"]
} );
```

## Promise API 概述

让我们回顾一下我们在本章中已经看到的ES6 Promise API。

**注意：** 以下API仅在ES6时是原生的，但是有符合规范的填充(不仅仅是扩展的Promise库)，它们可以定义Promise及其所有相关行为，因此即使在ES6之前的浏览器中，你也可以使用原生Promise。这类的填充是“仅仅原生的填充”(http://github.com/getify/native-promise-only),这是我写的。

### new Promise(..)构造

显式构造函数`Promise(..)`必须与`new`一起使用，并且必须提供同步/立即调用的回调函数。该函数传递两个回调函数，作为promise的解决能力。我们通常标记这两个回调函数为`resolve(..)`和`reject(..)`:

```js
var p = new Promise( function(resolve,reject){
	// `resolve(..)` 表示解析/完成 promise
	// `reject(..)` 表示拒绝promise
} );
```

`reject(..)`只是拒绝Promise，但是`resolve(..)`可以实现Promise，也可以拒绝Promise，这取决于所传递的内容。如果`resolve(..)`被传递了一个立即的、非promise的、非thenable值，那么该Promise将用该值实现。但是`resolve(..)`如果被传递了一个确切的Promise或者thenable值，那么该值将被递归地解包，并且无论它的最终解析/状态是什么，都将被promise承担。

### Promise.resolve(..) and Promise.reject(..)

一个用于创建已被拒绝的Promise的简便方法是`Promise.reject(..)`，所以这两个promise是等价的：

```js
var p1 = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = Promise.reject( "Oops" );
```

与`Promise.reject(..)`相似，`Promise.resolve(..)`通常用来创建一个已完成的Promise。然而，`Promise.resolve(..)`还会展开thenale值（就像我们已经几次讨论过的）。在这种情况下，返回的Promise将会采用你传入的thenable的解析，它既可能是完成，也可能是拒绝：

```js
var fulfilledTh = {
	then: function(cb) { cb( 42 ); }
};
var rejectedTh = {
	then: function(cb,errCb) {
		errCb( "Oops" );
	}
};

var p1 = Promise.resolve( fulfilledTh );
var p2 = Promise.resolve( rejectedTh );

// `p1`将是一个完成的promise
// `p2`将是一个拒绝的promise
```

记住，`Promise.resolve(..)`不会做任何事情，如果你传递的已经是一个真正的Promise; 它只是直接返回值。因此，调用`Promise.resolve(..)`对于你不知道其本质的值没有其他开销，如果其中一个值恰好已经是一个真正的Promise。

### then(..) 和 catch(..)

每个Promise实例（**不是** `Promise` API 命名空间）都有`then(..)`和`catch(..)`方法，它们允许你为Promise注册成功或拒绝处理器。一旦Promise被解析，它们中的一个就会被调用，但不是都会被调用，而且它们总是会被异步地调用（参见第一章的“Jobs”）。

`then(..)`接收两个参数，第一个用于完成回调，第二个用户拒绝回调。如果它们其中之一被省略，或者被传入一个非函数的值，那么一个默认的回调就会分别顶替上来。默认的完成回调简单地将值向下传递，而默认的拒绝回调简单地重新抛出（传播）收到的拒绝理由。

`catch(..)`仅仅接收一个拒绝回调作为参数，而且会自动的顶替一个默认的成功回调，就像我们讨论过的。换句话说，它等价于`then(null,..)`：

```js
p.then( fulfilled );

p.then( fulfilled, rejected );

p.catch( rejected ); // or `p.then( null, rejected )`
```

`then(..)`和`catch(..)`也会创建并返回一个新的promise，它可以用来表达Promise链式流程控制。如果完成或拒绝回调有异常被抛出，这个返回的promise就会被拒绝。如果这两个回调之一返回一个立即，非Promise，非thenable值，那么这个值就会作为被返回的promise的完成。如果完成处理器指定地返回一个promise或thenable值这个值就会被展开而且变成被返回的promise的解析。

### Promise.all([ .. ]) 和 Promise.race([ .. ])

在ES6的`Promise`API的静态帮助方法`Promise.all([ .. ])`和`Promise.race([ .. ])`都创建一个Promise作为它们的返回值。这个promise的解析完全由你传入的promise数组控制。

对于`Promise.all([ .. ])`，为了被返回的promise完成，所有你传入的promise都必须完成。如果其中任意一个被拒绝，返回的主promise也会立即被拒绝（丢弃其他所有promise的结果）。至于完成状态，你会收到一个含有所有被传入的promise的完成值的`array`。至于拒绝状态，你仅会收到第一个promise拒绝的理由值。这种模式通常称为“门”：在门打开前所有人都必须到达。

对于`Promise.race([ .. ])`，只有第一个解析（成功或拒绝）的promise会“胜出”，而且不论解析的结果是什么，都会成为被返回的promise的解析结果。这种模式通常成为“闩”：第一个打开门闩的人才能进来。考虑这段代码：

```js
var p1 = Promise.resolve( 42 );
var p2 = Promise.resolve( "Hello World" );
var p3 = Promise.reject( "Oops" );

Promise.race( [p1,p2,p3] )
.then( function(msg){
	console.log( msg );		// 42
} );

Promise.all( [p1,p2,p3] )
.catch( function(err){
	console.error( err );	// "Oops"
} );

Promise.all( [p1,p2] )
.then( function(msgs){
	console.log( msgs );	// [42,"Hello World"]
} );
```

**警告：** 要小心！如果一个空的`array`被传入`Promise.all([ .. ])`，它会立即完成，但`Promise.race([ .. ])`却会永远挂起，永远不会解析。

ES6的`Promise`API十分简单和直接。对服务于大多数基本的异步情况来说它足够好了，而且当你要把你的代码从回调地狱变为某些更好的东西时，它是一个开始的好地方。

但是依然还有许多应用程序所要求的精巧的异步处理，由于Promise本身所受的限制而不能解决。在下一节中，为了有效利用Promise库，我们将深入检视这些限制。

## Promise的限制

本节中我们将要讨论的许多细节已经在这一章中被提及了，但我们将明确地复习这些限制。

### 顺序的错误处理

我们在本章前面的部分详细讲解了Promise风格的错误处理。Promise的设计方式——特别是他们如何链接——所产生的限制，创建了一个非常容易掉进去的陷阱，Promise链中的错误会被意外地无声地忽略掉。

但关于Promise的错误还有一些其他事情要考虑。因为Promise链只不过是将组成它的Promise连在一起，没有一个实体可以用来将整个链条表达为一个单独的 *东西*，这意味着没有外部的方法能够监听可能发生的任何错误。

如果你构建一个不包含错误处理器的Promise链，这个链条的任意位置发生的任何错误都将沿着链条向下无限传播，直到被监听为止（通过在某一步上注册拒绝处理器）。所以，在这种特定情况下，拥有链条的最后一个promise的引用就够了（下面代码段中的`p`），因为你可以在这里注册拒绝处理器，而且它会被所有传播的错误通知：

```js
// `foo(..)`, `STEP2(..)` 和 `STEP3(..)`
// 都是promise兼容的工具

var p = foo( 42 )
.then( STEP2 )
.then( STEP3 );
```

虽然这看起来有点儿小糊涂，但是这里的`p`没有指向链条中的第一个promise（`foo(42)`调用中来的那一个），而是指向了最后一个promise，来自于`then(STEP3)`调用的那一个。

另外，这个promise链条上看不到一个步骤做了自己的错误处理。这意味着你可以在`p`上注册一个拒绝处理器，如果在链条的任意位置发生了错误，它就会被通知。

```js
p.catch( handleErrors );
```

但如果这个链条中的某一步事实上做了自己的错误处理（也许是隐藏/抽象出去了，所以你看不到），那么你的`handleErrors(..)`就不会被通知。这可能是你想要的——它毕竟是一个“被处理过的拒绝”——但它也可能 *不* 是你想要的。完全缺乏被通知的能力（被“已处理过的”拒绝错误通知）是一个在某些用法中约束功能的一种限制。

它基本上和`try..catch`中存在的限制是相同的，它可以捕获一个异常并简单地吞掉。所以这不是一个 **Promise特有** 的问题，但它确实是一个我们希望绕过的限制。

不幸的是，许多时候Promise链序列的中间步骤不会被留下引用，所以没有这些引用，你就不能添加错误处理器来可靠地监听错误。

### 单独的值

根据定义，Promise只能有一个单独的完成值或一个单独的拒绝理由。在简单的例子中，这没什么大不了的，但在更精巧的场景下，你可能发现这个限制。

通常的建议是构建一个包装值（比如`object`或`array`）来包含这些多个消息。这个方法好用，但是在你的Promise链的每一步上把消息包装再拆开显得十分尴尬和烦人。

#### 分割值

有时你可以将这种情况当做一个信号，表示你可以/应当将问题拆分为两个或更多的Promise。

想象你有一个工具`foo(..)`，它异步地产生两个值（`x`和`y`）：

```js
function getY(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( (3 * x) - 1 );
		}, 100 );
	} );
}

function foo(bar,baz) {
	var x = bar * baz;

	return getY( x )
	.then( function(y){
		// 将两个值包装近一个容器
		return [x,y];
	} );
}

foo( 10, 20 )
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );	// 200 599
} );
```

首先，让我们重新安排一下`foo(..)`返回的东西，以便于我们不必再将`x`和`y`包装进一个单独的`array`值中来传送给一个Promise。相反，我们将每一个值包装进它自己的promise：

```js
function foo(bar,baz) {
	var x = bar * baz;

	// 将两个promise返回
	return [
		Promise.resolve( x ),
		getY( x )
	];
}

Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );
} );
```

一个promise的`array`真的要比传递给一个单独的Promise的值的`array`要好吗？语法上，它没有太多改进。

但是这种方式更加接近于Promise的设计原理。现在它更易于在未来将`x`与`y`的计算分开，重构进两个分离的函数中。它更清晰，也允许调用端代码更灵活地安排这两个promise——这里使用了`Promise.all([ .. ])`，但它当然不是唯一的选择——而不是将这样的细节在`foo(..)`内部进行抽象。

#### 展开/散开参数

`var x = ..`和`var y = ..`的赋值依然是一个尴尬的负担。我们可以在一个帮助工具中利用一些函数式技巧（向Reginald Braithwaite致敬，在推特上 @raganwald ）：

```js
function spread(fn) {
	return Function.apply.bind( fn, null );
}

Promise.all(
	foo( 10, 20 )
)
.then(
	spread( function(x,y){
		console.log( x, y );	// 200 599
	} )
)
```

看起来好些了！当然，你可以内联这个函数式魔法来避免额外的帮助函数：

```js
Promise.all(
	foo( 10, 20 )
)
.then( Function.apply.bind(
	function(x,y){
		console.log( x, y );	// 200 599
	},
	null
) );
```

这个技巧可能很整洁，但是ES6给了我们一个更好的答案：解构（destructuring）。数组的解构赋值形式看起来像这样：

```js
Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var [x,y] = msgs;

	console.log( x, y );	// 200 599
} );
```

最棒的是，ES6提供了数组参数解构形式：

```js
Promise.all(
	foo( 10, 20 )
)
.then( function([x,y]){
	console.log( x, y );	// 200 599
} );
```

我们现在已经接受了“每个Promise一个值”的准则，继续让我们把模板代码最小化！

**注意：** 更多关于ES6解构形式的信息，参阅本系列的 *ES6与未来*。

### 单次解析

Promise的一个最固有的行为之一就是，一个Promise只能被解析一次（成功或拒绝）。对于多数异步用例来说，你仅仅取用这个值一次，所以这工作的很好。

但也有许多异步情况适用于一个不同的模型——更类似于事件和/或数据流。表面上看不清Promise能对这种用例适应的多好，如果能的话。没有基于Promise的重大抽象过程，它们完全缺乏对多个值解析的处理。

想象这样一个场景，你可能想要为响应一个刺激（比如事件）触发一系列异步处理步骤，而这实际上将会发生多次，比如按钮点击。

这可能不会像你想的那样工作：

```js
// `click(..)` 绑定了一个DOM元素的 `"click"` 事件
// `request(..)` 是先前定义的支持Promise的Ajax

var p = new Promise( function(resolve,reject){
	click( "#mybtn", resolve );
} );

p.then( function(evt){
	var btnID = evt.currentTarget.id;
	return request( "http://some.url.1/?id=" + btnID );
} )
.then( function(text){
	console.log( text );
} );
```

这里的行为仅能在你的应用程序只让按钮被点击一次的情况下工作。如果按钮被点击第二次，promise`p`已经被解析了，所以第二个`resolve(..)`将被忽略。

相反的，你可能需要将模式反过来，在每次事件触发时创建一个全新的Promise链：

```js
click( "#mybtn", function(evt){
	var btnID = evt.currentTarget.id;

	request( "http://some.url.1/?id=" + btnID )
	.then( function(text){
		console.log( text );
	} );
} );
```

这种方式会 *好用*，为每个按钮上的`"click"`事件发起一个全新的Promise序列。

但是除了在事件处理器内部定义一整套Promise链看起来很丑以外，这样的设计在某种意义上违背了关注/能力分离原则（SoC）。你可能非常想在一个你的代码不同的地方定义事件处理器：你定义对事件的 *响应*（Promise链）的地方。如果没有帮助机制，在这种模式下这么做很尴尬。

**注意：** 这种限制的另一种表述方法是，如果我们能够构建某种能在它上面进行Promise链监听的“可监听对象（observable）”就好了。有一些库已经建立这些抽象（比如RxJS——<http://rxjs.codeplex.com/> ），但是这种抽象看起来是如此的重，以至于你甚至再也看不到Promise的性质。这样的重抽象带来一个重要的问题：这些机制是否像Promise本身被设计的一样 *可靠*。我们将会在附录B中重新讨论“观察者（Observable）”模式。

### 惰性

对于在你的代码中使用Promise而言一个实在的壁垒是，现存的所有代码都没有支持Promise。如果你有许多基于回调的代码，让代码保持相同的风格容易多了。

“一段基于动作（用回调）的代码将仍然基于动作（用回调），除非一个更聪明，具有Promise意识的开发者对它采取行动。”

Promise提供了一种不同的模式规范，如此，代码的表达方式可能会变得有一点儿不同，某些情况下，则根本不同。你不得不有意这么做，因为Promise不仅只是把那些为你服务至今的老式编码方法自然地抖落掉。

考虑一个像这样的基于回调的场景：

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

将这个基于回调的代码转换为支持Promise的代码的第一步该怎么做，是立即明确的吗？这要看你的经验。你练习的越多，它就感觉越自然。但当然，Promise没有明确告知到底怎么做——没有一个放之四海而皆准的答案——所以这要靠你的责任心。

就像我们以前讲过的，我们绝对需要一种支持Promise的Ajax工具来取代基于回调的工具，我们可以称它为`request(..)`。你可以制造自己的，正如我们已经做过的。但是不得不为每个基于回调的工具手动定义Promise相关的包装器的负担，使得你根本就不太可能选择将代码重构为Promise相关的。

Promise没有为这种限制提供直接的答案。但是大多数Promise库确实提供了帮助函数。想象一个这样的帮助函数：

```js
// 填补的安全检查
if (!Promise.wrap) {
	Promise.wrap = function(fn) {
		return function() {
			var args = [].slice.call( arguments );

			return new Promise( function(resolve,reject){
				fn.apply(
					null,
					args.concat( function(err,v){
						if (err) {
							reject( err );
						}
						else {
							resolve( v );
						}
					} )
				);
			} );
		};
	};
}
```

好吧，这可不是一个微不足道的工具。然而，虽然他可能看起来有点儿令人生畏，但也没有你想的那么糟。它接收一个函数，这个函数期望一个错误优先风格的回调作为第一个参数，然后返回一个可以自动创建Promise并返回的新函数，然后为你替换掉回调，与Promise的完成/拒绝连接在一起。

与其浪费太多时间谈论这个`Promise.wrap(..)`帮助函数 *如何* 工作，还不如让我们来看看如何使用它：

```js
var request = Promise.wrap( ajax );

request( "http://some.url.1/" )
.then( .. )
..
```

哇哦，真简单！

`Promise.wrap(..)` **不会** 生产Promise。它生产一个将会生产Promise的函数。某种意义上，一个Promise生产函数可以被看做一个“Promise工厂”。我提议将这样的东西命名为“promisory”（"Promise" + "factory"）。

这种将期望回调的函数包装为一个Promise相关的函数的行为，有时被称为“提升（lifting）”或“promise化（promisifying）”。但是除了“提升过的函数”以外，看起来没有一个标准的名词来称呼这个结果函数，所以我更喜欢“promisory”，因为我认为他更具描述性。

**注意：** Promisory不是一个瞎编的词。它是一个真实存在的词汇，而且它的定义是含有或载有一个promise。这正是这些函数所做的，所以这个术语匹配得简直完美！

那么，`Promise.wrap(ajax)`生产了一个我们称为`request(..)`的`ajax(..)`promisory，而这个promisory为Ajax应答生产Promise。

如果所有的函数已经都是promisory，我们就不需要自己制造它们，所以额外的步骤就有点儿多余。但是至少包装模式是（通常都是）可重复的，所以我们可以把它放进`Promise.wrap(..)`帮助函数中来支援我们的promise编码。

那么回到刚才的例子，我们需要为`ajax(..)`和`foo(..)`都做一个promisory。

```js
// 为`ajax(..)`制造一个promisory
var request = Promise.wrap( ajax );

// 重构`foo(..)`，但是为了代码其他部分
// 的兼容性暂且保持它对外是基于回调的
// ——仅在内部使用`request(..)`'的promise
function foo(x,y,cb) {
	request(
		"http://some.url.1/?x=" + x + "&y=" + y
	)
	.then(
		function fulfilled(text){
			cb( null, text );
		},
		cb
	);
}

// 现在，为了这段代码本来的目的，为`foo(..)`制造一个promisory
var betterFoo = Promise.wrap( foo );

// 并使用这个promisory
betterFoo( 11, 31 )
.then(
	function fulfilled(text){
		console.log( text );
	},
	function rejected(err){
		console.error( err );
	}
);
```

当然，虽然我们将`foo(..)`重构为使用我们的新`request(..)`promisory，我们可以将`foo(..)`本身制成promisory，而不是保留基于会掉的实现并需要制造和使用后续的`betterFoo(..)`promisory。这个决定只是要看`foo(..)`是否需要保持基于回调的形式以便于代码的其他部分兼容。

考虑这段代码：

```js
// 现在，`foo(..)`也是一个promisory
// 因为它委托到`request(..)` promisory
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then( .. )
..
```

虽然ES6的Promise没有为这样的promisory包装提供原生的帮助函数，但是大多数库提供它们，或者你可以制造自己的。不管哪种方法，这种Promise特定的限制是可以不费太多劲儿就可以解决的（当然是和回调地狱的痛苦相比！）。

### Promise不可撤销

一旦你创建了一个Promise并给它注册了一个完成和/或拒绝处理器，就没有什么你可以从外部做的事情能停止这个进程，即使是某些其他的事情使这个任务变得毫无意义。

**注意：** 许多Promise抽象库都提供取消Promise的功能，但这是一个非常坏的主意！许多开发者都希望Promise被原生地设计为具有外部取消能力，但问题是这将允许Promise的一个消费者/监听器影响某些其他消费者监听同一个Promise的能力。这违反了未来值得可靠性原则（外部不可变），另外就是嵌入了“远距离行为（action at a distance）”的反模式（<http://en.wikipedia.org/wiki/Action_at_a_distance_%28computer_programming%29> ）。不管它看起来多么有用，它实际上会直接将你引回与回调地狱相同的噩梦。

考虑我们早先的Promise超时场景：

```js
var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	// 即使是在超时的情况下也会发生 :(
} );
```

“超时”对于promise`p`来说是外部的，所以`p`本身继续运行，这可能不是我们想要的。

一个选项是侵入性地定义你的解析回调：

```js
var OK = true;

var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
	.catch( function(err){
		OK = false;
		throw err;
	} )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	if (OK) {
		// 仅在没有超时的情况下发生！ :)
	}
} );
```

很难看。这可以工作，但是远不理想。一般来说，你应当避免这样的场景。

但是如果你不能，这种解决方案的丑陋应当是一个线索，说明 *取消* 是一种属于在Promise之上的更高层抽象的功能。我推荐你找一个Promise抽象库来辅助你，而不是自己使用黑科技。

**注意：** 我的 *asynquence* Promise抽象库提供了这样的抽象，还为序列提供了一个`abort()`能力，这一切将在附录A中讨论。

一个单独的Promise不是真正的流程控制机制（至少没有多大实际意义），而流程控制机制正是 *取消* 要表达的；这就是为什么Promise取消显得尴尬。

相比之下，一个链条的Promise集合在一起——我称之为“序列”—— *是* 一个流程控制的表达，如此在这一层面的抽象上它就适于定义取消。

没有一个单独的Promise应该是可以取消的，但是一个 *序列* 可以取消是有道理的，因为你不会将一个序列作为一个不可变值传来传去，就像Promise那样。

### Promise性能

这种限制既简单又复杂。

比较一下在基于回调的异步任务链和Promise链上有多少东西在动，很明显Promise有多得多的事情发生，这意味着它们自然地会更慢一点点。回想一下Promise提供的保证信任的简单列表，将它和你为了达到相同保护效果而在回调上面添加的特殊代码比较一下。

更多工作要做，更多的安全要保护，意味着Promise与赤裸裸的，不可靠的回调相比 *确实* 更慢。这些都很明显，可能很容易萦绕在你脑海中。

但是慢多少？好吧……这实际上是一个难到不可思议的问题，无法绝对，全面地回答。

坦白地说，这是一个比较苹果和橘子的问题，所以可能是问错了。你实际上应当比较的是，带有所有手动保护层的经过特殊处理的回调系统，是否比一个Promise实现要快。

如果说Promise有一种合理的性能限制，那就是它并不将可靠性保护的选项罗列出来让你选择——你总是一下得到全部。

如果我们承认Promise一般来说要比它的非Promise，不可靠的回调等价物 *慢一点儿*——假定在有些地方你觉得你可以自己调整可靠性的缺失——难道这意味着Promise应当被全面地避免，就好像你的整个应用程序仅仅由一些可能的“必须绝对最快”的代码驱动着？

扪心自问：如果你的代码有那么合理，那么 **对于这样的任务，JavaScript是正确的选择吗？** 为了运行应用程序JavaScript可以被优化得十分高效（参见第五章和第六章）。但是在Promise提供的所有好处的光辉之下，过于沉迷它微小的性能权衡，*真的* 合适吗？

另一个微妙的问题是Promise使 *所有事情* 都成为异步的，这意味着有些应当立即完成的（同步的）步骤也要推迟到下一个Job步骤中（参见第一章）。也就是说一个Promise任务序列要比使用回调连接的相同序列要完成的稍微慢一些是可能的。

当然，这里的问题是：这些关于性能的微小零头的潜在疏忽，和我们在本章通篇阐述的Promise带来的益处相比，*还值得考虑吗？*

我的观点是，在几乎所有你可能认为Promise的性能慢到了需要被考虑的情况下，完全回避Promise并将它的可靠性和组合性优化掉，实际上是一种反模式。

相反地，你应当默认地在代码中广泛使用它们，然后再记录并分析你的应用程序的热（关键）路径。Promise *真的* 是瓶颈？还是它们只是理论上慢了下来？只有在那 *之后*，拿着实际合法的基准分析观测数据（参见第六章），再将Promise从这些关键区域中重构移除才称得上是合理与谨慎。

Promise是有一点儿慢，但作为交换你得到了很多内建的可靠性，无Zalgo的可预测性，与组合性。也许真正的限制不是它们的性能，而是你对它们的益处缺乏认识？



## 译者总结

为什么promise处理错误很容易出错？

因为他会吞掉错误。看这个例子就知道了：

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// 数字类型不存在这个toLowerCase方法
		console.log( msg.toLowerCase() );
	},
	function rejected(err){
		
	}
);

```

这里出现了错误，只会在下一个`p.then`的时候被reject到。但是目前上面这个代码是捕获不到这个错误的。

Promise.all和Promise.race的区别是什么？除了他们主要的行为不同之外(all如果出错就会reject，否则按顺序返回；race是如果有一个成功或者有一个失败，立即处理。)，还有一个不同就是他们接受的参数(`array`)如果是空的情况。Promise.all会立即resolved,Promise.race会处于挂起状态，永远不会被处理。

​    