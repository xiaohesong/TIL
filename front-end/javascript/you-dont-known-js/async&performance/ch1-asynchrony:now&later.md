# Chapter 1: Asynchrony: Now & Later

在JavaScript这样的语言中，最重要但也常常被误解的编程部分之一是如何表达和操作在一段时间内分散的程序行为。

这不仅仅是从`for`循环的开始到`for`循环的结束所发生的事情，当然这需要*一些时间*(微秒到毫秒)来完成。这是关于你的程序的一部分*现在*运行，以及程序的另一部分*稍后*运行所发生的事情 - 在*现在*和*以后*你的程序没有积极执行的地方有一个间隙。

有史以来几乎所有重要的项目(特别是JS)以某种方式或另一个方法来管理这个间隙,不管是在等待用户输入,请求数据从数据库或文件系统,通过网络发送数据并等待响应,或执行重复任务的固定间隔时间(如动画)。在所有这些不同的方式中，你的程序必须在间隔时间内管理状态。就像他们在伦敦(指地铁站门和站台之间的缝隙)说的那样:“小心缝隙(间隙)。”

实际上，程序的*现在*和*后面* 部分之间的关系是异步编程的核心。

异步编程从JS开始就存在了，这是肯定的。但是大多数JS开发人员从来没有认真考虑过它是如何以及为什么会出现在他们的程序中，或者探索过其他各种处理方法。好的方法一直是简单的回调函数。时至今日，仍有许多人坚持认为，回调已经足够应付了。

但是，随着JS在范围和复杂性上的不断增长，为了满足在浏览器、服务器和所有可能的设备中运行的一流编程语言不断扩大的需求，我们管理异步的痛苦变得越来越严重，他们呼吁采用更强大、更合理的方法。

虽然这一切现在看起来相当抽象，但我向你保证，随着本书的继续，我们将更全面、更具体地处理它。在接下来的几章中，我们将探讨异步JavaScript编程的各种新兴技术。

但在此之前，我们必须更深入地理解什么是异步以及异步在JS中是如何运行的。

## A Program in Chunks(块中的程序)

你可能在你的 *.js* 文件中写你的JS程序，但是几乎可以肯定，你的程序是由几个块组成的，其中只有一个块将会在 *现在*执行，其余的块将会在 *稍后* 执行。最常见的*块*的单位是`function`。

大多数刚接触JS的开发人员所面临的问题似乎是，*稍后* 不会在*现在* 之后严格地立即执行。换句话说，根据定义，*现在*不能完成的任务将异步完成，因此不会有你可能直观地期望或想要的阻塞行为。

考虑下面代码：

```js
// ajax(..) is some arbitrary Ajax function given by a library
var data = ajax( "http://some.url.1" );

console.log( data );
// Oops! `data` generally won't have the Ajax results
```

你可能已经意识到标准Ajax请求并不是同步完成的，这意味着`ajax(..)`函数还没有返回任何值来分配给`data`变量。如果`ajax(..)` *可以* 阻塞直到响应返回，那么`data = ..`赋值就可以很好的工作了。

但这不是我们使用Ajax的方式。我们*现在*发出一个异步Ajax请求，直到*稍后*才会得到结果。

从 *现在* 到 *稍后* “等待”的最简单(但绝不仅仅是，甚至是最好的)方法是使用一个函数，通常称为回调函数:

```js
// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", function myCallbackFunction(data){

	console.log( data ); // Yay, I gots me some `data`!

} );
```

**警告:** 你可能听说过可以发出同步Ajax请求。虽然这在技术上是正确的，但在任何情况下都不应该这样做，因为它会锁定浏览器UI(按钮、菜单、滚动条等)，并阻止任何用户交互。这是一个可怕的想法，应该始终避免。

在你提出异议之前，不，你想要避免回调的混乱并不是使用阻塞的，同步的Ajax的正当理由。

例如，考虑以下代码：

```js
function now() {
	return 21;
}

function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}

var answer = now();

setTimeout( later, 1000 ); // Meaning of life: 42
```

这个程序有两个块：就是*现在*将运行的东西，以及*稍后*运行的东西。这两个块是什么应该是相当明显的，但让我们非常明确他:

现在：

```js
function now() {
	return 21;
}

function later() { .. }

var answer = now();

setTimeout( later, 1000 );
```

稍后：

```js
answer = answer * 2;
console.log( "Meaning of life:", answer );
```

一旦你的程序运行，那么*现在* 块就会立即运行。但是`setTimeout(..)`还设置了一个*稍后*发生的事件(超时)，因此`later()`函数的内容将在稍后的时间(从现在开始的1000毫秒)执行。

任何时候，只要你把一部分代码封装到一个函数中，并指定它应该在响应某个事件(定时器、鼠标点击、Ajax响应等)时执行，你将创建一个*稍后*的代码块，从而使程序具有异步性。

### Async Console(异步控制台)

关于`console.*`方法如何工作没有规范或一系列要求 - 它们不是JavaScript的正式部分，而是由*宿主环境*添加到JS(参见本书系列的类型和语法标题)。

因此，不同的浏览器和JS环境可以随心所欲的使用，这有时会导致令人困惑的行为。

特别是，有一些浏览器和一些条件下，`console.log(..)`实际上不会立即输出它所给出的内容。出现这种情况的主要原因是I/O非常慢，而且阻塞了许多程序的一部分(不仅仅是JS)。因此，浏览器(从页面/UI的角度)在后台异步处理`console` I/O的性能可能会更好，而你甚至不知道发生了什么。

这是一种不太常见但却是可能的情况，在这种情况下，这是可以观察到的(不是从代码本身，而是从外部):

```js
var a = {
	index: 1
};

// later
console.log( a ); // ??

// even later
a.index++;
```

我们通常希望看到在`console.log(..)`语句的确切时刻得到`a`对象的快照，打印类似`{index: 1}`的内容，这样在下一个语句中当`a.index++`发生时，它修改的东西和`a`的输出不同，或者严格地说，是在`a`的输出之后。

在大多数情况下，前面的代码可能会在开发人员工具的控制台中生成你所期望的对象表示形式。但是，同样的代码也可能在浏览器认为需要将控制台(console)I/O延迟到后台的情况下运行，在这种情况下，当对象在浏览器控制台中表示时，*可能*会出现`a.index++`已经发生，它显示`{index: 2}`。

它是一个移动的目标，在什么条件下`console` I/O将被延迟，甚至它是否会被观察到。只要注意I/O中可能存在的异步性，以防在调试过程中遇到这样的问题:在`console.log(..)`语句*之后*修改了对象，但是出现了意想不到的修改。

**注意：** 如果遇到这种罕见的情况，最好的选择是在JS调试器中使用断点，而不是依赖`console`输出。下一个最佳选项是通过将对象序列化为字符串来强制对象的“快照”，就像使用`JSON.stringify(..)`那样。

## Event Loop(事件循环)

让我们做一个(可能令人震惊的)声明:尽管显然允许异步JS代码(就像我们刚才看到的超时)，但直到最近(ES6)， JavaScript本身实际上从未内置任何异步的直接概念。

**什么！？** 这听起来很疯狂，对吧? 事实上，这是真的。当被要求时，JS引擎本身从来没有做过任何事情，除了在任何给定时刻执行程序的单个块。

“被要求做。”通过谁？那是重要的部分！

JS引擎不是独立运行的。它在*宿主环境*中运行，这对大多数开发人员来说都是典型的Web浏览器。在过去的几年里(但绝不是唯一的)，JS已经通过Node.js之类的东西从浏览器扩展到了其他环境，比如服务器。事实上，JavaScript现在已经嵌入到各种各样的设备中，从机器人到灯泡。

但是所有这些环境中有一个共同的“线程”(这是一个不那么微妙的异步玩笑，不管它的价值是什么)，它们都有一个机制，可以处理随着时间的推移执行程序的多个块，在每个时刻调用JS引擎，称为“事件循环”。

换句话说，JS引擎并没有天生的时间观念，而是为任意JS代码片段提供了随需应变的执行环境。周围环境始终*安排* “事件”(JS代码执行)。

例如，当JS程序发出Ajax请求从服务器获取一些数据时，你在一个函数中设置“响应”代码(通常称为“回调”)，JS引擎告诉宿主环境，“嘿，我现在要暂停执行，但是当你完成那个网络请求时，如果你有一些数据，请*回调*这个函数。”

然后，将浏览器设置为侦听来自网络的响应，当它有东西要提供给你时，它通过将回调函数插入事件循环来调度要执行的回调函数。

那么事件循环是什么？

让我们首先通过一些假的代码概念化它：

```js
// `eventLoop` is an array that acts as a queue (first-in, first-out)
var eventLoop = [ ];
var event;

// keep going "forever"
while (true) {
	// perform a "tick"
	if (eventLoop.length > 0) {
		// get the next event in the queue
		event = eventLoop.shift();

		// now, execute the next event
		try {
			event();
		}
		catch (err) {
			reportError(err);
		}
	}
}
```

当然，这是非常简化的伪代码，以说明这些概念。但这应该足以帮助更好地理解。

如你所见，有一个由`while`循环表示的连续运行的循环，该循环的每个迭代称为“tick”。对于每一个tick，如果一个事件正在队列上等待，那么它将被取消并执行。这些事件是函数回调。

重要的是要注意`setTimeout(..)`不会将回调放在事件循环队列中。它的作用是设置一个计时器;当计时器到期时，环境会将你的回调放入事件循环中，以便将来某个tick会选择并执行它。

如果当时事件循环中已有20个项怎么办？你的回调要等待。它排在其他队列后面——通常没有一个捷径可以抢占队列并跳过前面的队列。这解释了为什么`setTimeout(..)`定时器不能以完美的时间精度触发。你可以(大致地说)保证回调不会在指定的时间间隔之前触发，但是它可以在指定的时间间隔之后或之后发生，这取决于事件队列的状态。

因此，换句话说，你的程序通常被分成许多小块，这些小块在事件循环队列中一个接一个地发生。从技术上讲，其他与程序没有直接关联的事件也可以交错在队列中。

**注意：** 我们提到“直到最近”关于ES6更改事件循环队列管理位置的性质。它主要是一种正式的技术，但ES6现在指定了事件循环的工作方式，这意味着从技术上讲，它属于JS引擎的范围，而不仅仅是*宿主环境*。这种变化的一个主要原因是引入了ES6 Promise，我们将在第3章中讨论，因为它们要求能够对事件循环队列上的调度操作进行直接、细粒度的控制(请参阅“Cooperation”部分中对`setTimeout(..0)`的讨论)。

## Parallel Threading(并行线程)

将术语“异步”和“并行”混为一谈非常常见，但它们实际上是完全不同的。请记住，异步是关于*现在*和*以后*之间的差距。但并行是关于能够同时发生的事情。

并行计算最常用的工具是进程和线程。进程和线程独立执行，可以同时执行: 在单独的处理器上，甚至是单独的计算机上，但多个线程可以共享单个进程的内存。

相反，事件循环将其工作分解为任务，并以串行方式执行，不允许并行访问和更改共享内存。并行性和“串行性”可以在单独的线程中以协作事件循环的形式共存。

并行执行线程的交错和异步事件的交错发生在非常不同的粒度级别。

看下面例子：

```js
function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}
```

虽然`later()`的全部内容将被视为单个事件循环队列条目，但是当考虑运行这段代码的线程时，实际上可能有十几个不同的底层操作。例如，`answer = answer * 2`要求首先加载`answer`的当前值，然后将`2`放在某处，然后执行乘法，然后将结果存储回`answer`中。

在单线程环境中，线程队列中的项是否是底层操作并不重要，因为没有任何东西可以中断线程。但是如果你有一个并行系统，两个不同的线程在同一个程序中运行，你很可能会有不可预测的行为。

考虑：

```js
var a = 20;

function foo() {
	a = a + 1;
}

function bar() {
	a = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

在JavaScript的单线程行为中，如果`foo()`在`bar()`之前运行，结果是`a`是`42`，但如果`bar(0`在`foo()`之前运行，则`a`中的结果将为`41`。

但是，如果共享相同数据的JS事件并行执行，则问题会更加微妙。将这两个伪代码任务列表看作分别在`foo()`和`bar()`中运行代码的线程，并考虑如果它们恰好同时运行会发生什么:

线程1 (X和Y是临时内存位置):

```js
foo():
  a. load value of `a` in `X`
  b. store `1` in `Y`
  c. add `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

线程2 (X和Y是临时内存位置):

```js
bar():
  a. load value of `a` in `X`
  b. store `2` in `Y`
  c. multiply `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

现在，假设这两个线程实际上是并行运行的。你可能会发现问题，对吧? 它们使用共享内存位置X和Y来执行临时步骤。

如果这些步骤像这样发生，a的最终结果是什么?

```js
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
1b  (store `1` in `Y`   ==> `1`)
2b  (store `2` in `Y`   ==> `2`)
1c  (add `X` and `Y`, store result in `X`   ==> `22`)
1d  (store value of `X` in `a`   ==> `22`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `44`)
2d  (store value of `X` in `a`   ==> `44`)

```

`a`结果将是`44`。但这个排序会如何？

```js
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
2b  (store `2` in `Y`   ==> `2`)
1b  (store `1` in `Y`   ==> `1`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `20`)
1c  (add `X` and `Y`, store result in `X`   ==> `21`)
1d  (store value of `X` in `a`   ==> `21`)
2d  (store value of `X` in `a`   ==> `21`)
```

`a`结果将是`21`。

因此，线程编程非常棘手，因为如果你不采取特殊措施来防止这种中断/交错发生，你可能会得到非常令人惊讶的，不确定的行为，这往往会导致令人头疼的问题。

JavaScript从不跨线程共享数据，这意味着不确定性不是问题。但这并不意味着JS总是确定性的。还记得前面，`foo()`和`bar()`的相对顺序会产生两个不同的结果(`41`或`42`)吗?

**注意：** 它可能还不是很明显，但并非所有非确定性都是不好的。有时它是无关紧要的，有时它是故意的。在接下来的几章和接下来的几章中，我们将看到更多的例子。

### Run-to-Completion(运行至完成)

由于JavaScript是单线程的，`foo()`(和`bar()`)中的代码是原子性的，这意味着一旦`foo()`开始运行，它的全部代码将在`bar()`中的任何代码运行之前完成，反之亦然。这称为“运行到完成”行为。

实际上，当`foo()`和`bar()`中包含更多代码时，run-to-completion语义更明显，例如：

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

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

因为`foo()`不能被`bar()`中断，并且`bar()`不能被`foo()`中断，所以这个程序只有两个可能的结果，具体取决于哪个开始先运行 -- 如果存在线程，并且`foo()`和`bar()`中的各个语句可以交错，则可能的结果数量将大大增加！

块1是同步的(*现在* 发生)，但块2和3是异步的(*稍后* 发生)，这意味着它们的执行将被时间间隔分开。

块1：

```js
var a = 1;
var b = 2;
```

块2(`foo()`)：

```js
a++;
b = b * a;
a = b + 3;
```

块3(`bar()`)：

```js
b--;
a = 8 + b;
b = a * 2;
```

块2和3可能以任何一个顺序发生，因此该程序有两种可能的结果，如下所示：

结果1：

```js
var a = 1;
var b = 2;

// foo()
a++;
b = b * a;
a = b + 3;

// bar()
b--;
a = 8 + b;
b = a * 2;

a; // 11
b; // 22
```

结果2：

```js
var a = 1;
var b = 2;

// bar()
b--;
a = 8 + b;
b = a * 2;

// foo()
a++;
b = b * a;
a = b + 3;

a; // 183
b; // 180
```

来自同一代码的两个结果意味着我们仍然具有不确定性！但是它在函数(事件)排序级别，而不是在语句排序级别(或者，实际上，表达式操作排序级别)，就像它与线程一样。换句话说，它比线程*更具确定性*。

对于JavaScript的行为，这种函数排序的非确定性是一个常见的术语“竞态条件”，因为`foo()`和`bar()`正在互相竞争，看谁先运行。具体来说，这是一个“竞态条件”，因为你无法可靠地预测`a`和`b`的结果。

**注意：** 如果JS中有一个函数没有运行到完成的行为，我们可以得到更多可能的结果，对吧? 结果ES6引入了这样一个东西(参见第4章“Generators”)，但是现在不要担心，我们将回到这个话题!

## Concurrency(并发)

让我们想象一个站点，它显示了一个状态更新列表(就像一个社交网络新闻提要)，随着用户向下滚动列表，该列表会逐步加载。要使这样的功能正常工作，(至少)需要同时执行两个独立的“进程”(即，但不一定是在同一时刻)。

**注意：** 我们在引用中使用“进程”(双引号)，因为它们不是计算机科学意义上的真正的操作系统级过程。它们是虚拟进程或任务，表示逻辑上连接的、连续的一系列操作。我们只是更喜欢“进程”而不是“任务”，因为术语方面，它将匹配我们正在探索的概念的定义。

当用户将页面向下滚动时，第一个“进程”将响应`onscroll`事件(向Ajax请求新内容)。第二个“进程”将接收回Ajax响应(将内容呈现到页面上)。

显然，如果用户滚动足够快，你可能会看到在返回第一个响应并进行处理的时间内触发了两个或更多的`onscroll`事件，因此你将会看到`onscroll`事件和Ajax响应事件快速触发，彼此交错。

并发性是指两个或多个“进程”在同一时间内同时执行，而不管它们各自的组成操作是否并行发生(在独立处理器或核心上的同一时刻)。你可以将并发视为“进程”级(或任务级)并行，而不是操作级并行(独立处理器线程)。

**注意：** 并发性还引入了这些“流程”相互交互的可选概念。我们待会再讲。

对于给定的时间窗口(用户滚动的几秒钟)，让我们将每个独立的“进程”可视化为一系列事件/操作:

“进程”1 (`onscroll`事件):

```json
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```

“进程”2 (Ajax响应事件):

```json
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```

很有可能onscroll事件和Ajax响应事件可以同时处理。例如，让我们在时间轴上可视化这些事件:

```json
onscroll, request 1
onscroll, request 2          response 1
onscroll, request 3          response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6          response 4
onscroll, request 7
response 6
response 5
response 7
```

但是,回到这章前面我们早先事件循环的概念,JS只能够一次处理一个事件,所以要么`onscroll, request2`是第一位发生或`response1`会第一位发生,但是他们不能发生在同一时刻。像学校食堂里的孩子一样，不管他们在门外挤成什么样子，他们都要挤成一排才能吃到午饭!

让我们可视化所有这些事件到事件循环队列的交错。

事件循环队列：

```json
onscroll, request 1   <--- Process 1 starts
onscroll, request 2
response 1            <--- Process 2 starts
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Process 1 finishes
response 6
response 5
response 7            <--- Process 2 finishes
```

“进程1”和“进程2”同时运行（任务级并行），但它们各自的事件在事件循环队列上顺序运行。

顺便说一下，请注意`response6`和`response5`是如何以预期顺序返回的?

单线程事件循环是并发性的一种表达式(当然还有其他的表达式，我们稍后将对此进行讨论)。

### Noninteracting(互不影响)

由于两个或多个“进程”在同一个程序中并发地交错它们的步骤/事件，如果任务不相关，它们不必相互交互。**如果它们不相互作用，那么非确定性是完全可以接受的。** 

例如：

```js
var res = {};

function foo(results) {
	res.foo = results;
}

function bar(results) {
	res.bar = results;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

`foo()`和`bar()`是两个并发的“进程”，它们将以什么顺序触发并不确定。但我们构建了这个程序，所以它们按什么顺序触发并不重要，因为它们是独立的，因此不需要交互。

这不是“竞争条件”错误，因为代码将始终正常工作，无论顺序如何。

### Interaction(互相作用)

更常见的情况是，并发“进程程”必然会通过作用域和/或DOM间接地进行交互。当发生这种交互时，你需要协调这些交互以防止“竞争条件”，如前所述。

下面是两个并发“进程”的简单例子，它们由于隐含的顺序而相互作用，只是*有时会被破坏*:

```js
var res = [];

function response(data) {
	res.push( data );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

并发“进程”是将处理Ajax响应的两个`response()`调用。它们都有可能以第一顺序发生。

假设预期的行为是`res[0]`具有`"http://some.url.1"`调用的结果，并且`res[1]`具有`"http://some.url.2"`的调用结果。有时会出现这种情况，但有时它们会被翻转，具体取决于哪个调用首先完成。这种不确定性很可能是一种“竞争条件”的错误。

**注意：** 在这些情况下，要特别小心你可能会做出的假设。例如，开发人员观察到`"http://some.url.2"`的响应速度比`"http://some.url.1"`慢得多，这并不少见，也许是因为他们正在执行的任务（例如，一个执行数据库任务，另一个只获取静态文件），所以观察到的顺序似乎总是如预期的那样。即使两个请求都发送到同一台服务器，并且服务器有意以特定的顺序响应，也不能真正保证响应返回到浏览器中的顺序。

因此，要解决这种竞争条件，可以协调排序交互：

```js
var res = [];

function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

无论首先返回哪个Ajax响应，我们都会检查`data.url`（假设一个从服务器返回！），以确定响应数据应该在`res`数组中占据哪个位置。`res[0]`将始终保存`"http://some.url.1"`结果和`res[1]`将始终保存`"http://some.url.2"`的结果。通过简单的协调，我们消除了“竞争条件”的不确定性。

如果多个并发函数调用通过共享的dom相互作用，例如一个函数调用更新了`<div>`的内容，另一个函数调用更新了`<div>`的样式或属性（例如，使dom元素在包含内容后可见），则此场景中的推理也适用。你可能不希望在具有内容之前显示DOM元素，因此协调必须确保正确的顺序交互。

在没有协调交互的情况下，一些并发场景*总是被破坏*(不仅仅是有时)。考虑:

```js
var a, b;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(y) {
	b = y * 2;
	baz();
}

function baz() {
	console.log(a + b);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

在本例中，无论`foo()`还是`bar()`首先触发，它总是会导致`baz()`运行得过早(`a`或`b`仍然是未定义的)，但是`baz()`的第二次调用将会工作，因为`a`和`b`都是可用的。

有不同的方法来解决这种情况。这是一个简单的方法：

```js
var a, b;

function foo(x) {
	a = x * 2;
	if (a && b) {
		baz();
	}
}

function bar(y) {
	b = y * 2;
	if (a && b) {
		baz();
	}
}

function baz() {
	console.log( a + b );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

围绕`baz()`调用的`if (a && b)`条件式传统上称为“gate(门)”，因为我们不确定`a`和`b`将什么顺序到达，但是我们在继续打开门(调用`baz()`)之前等待它们都到达那里。

你可能遇到的另一个并发交互条件有时称为“race(竞争)”，但更准确地说是“latch(锁定)”。它的特点是“只有第一个赢”的行为。在这里，非确定性是可以接受的，因为你明确地说，对于终点线的“竞赛”只有一个赢家是可以的。

考虑这个破坏性的代码:

```js
var a;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(x) {
	a = x / 2;
	baz();
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

无论哪一个(`foo()`或`bar()`)最后触发，它不仅会覆盖另一个指定的值，而且还会重复对`baz()`的调用(可能是不需要的)。

所以，我们可以用一个简单的门闩协调交互，只让第一个门闩通过:

```js
var a;

function foo(x) {
	if (a == undefined) {
		a = x * 2;
		baz();
	}
}

function bar(x) {
	if (a == undefined) {
		a = x / 2;
		baz();
	}
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

`if (a == undefined)`条件只允许`foo()`或`bar()`中的第一个通过，第二个(实际上是任何后续的)调用将被忽略。第二个什么也得不到。

**注意：** 在所有这些场景中，我们一直使用全局变量来进行简单的说明，但是我们的推理并不需要它。只要所讨论的函数能够访问变量(通过作用域)，它们就会按预期工作。依赖于词法作用域的变量(请参阅本系列的Scope & closure标题)，以及这些示例中的全局变量，是这些并发协调形式的一个明显缺点。在接下来的几章中，我们将看到在这方面更加清晰的其他协调方式。

### Cooperation(合作)

并发协调的另一个表达式称为“协作并发”。在这里，重点不是通过作用域内的值共享进行交互(尽管这显然仍然是允许的!)。其目标是将长时间运行的“进程”分解为步骤或批，以便其他并发的“进程”有机会将其操作交错到事件循环队列中。

例如，考虑一个Ajax响应处理程序，它需要运行一长串结果来转换值。我们将使用`Array#map(..)`来缩短代码：

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `data` values doubled
		data.map( function(val){
			return val * 2;
		} )
	);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

如果`"http://some.url.1"`首先返回结果，则整个列表将立即映射到`res`。如果是几千条或更少的记录，这通常没什么大不了的。但如果是1000万条记录，运行起来可能需要一段时间(在功能强大的笔记本电脑上运行几秒钟，在移动设备上运行更长时间，等等)。

当这样的“进程”正在运行时，页面中不会发生任何其他事情，包括没有其他`response(..)`调用，没有UI更新，甚至没有用户事件，如滚动，键入，按钮点击等。那真是太痛苦了。

因此，为了使一个更协作的并发系统，一个更友好且不占用事件循环队列的系统，你可以异步批处理这些结果，在每个结果“让步”回事件循环以允许其他等待事件发生之后。

这是一个非常简单的方法：

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// let's just do 1000 at a time
	var chunk = data.splice( 0, 1000 );

	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `chunk` values doubled
		chunk.map( function(val){
			return val * 2;
		} )
	);

	// anything left to process?
	if (data.length > 0) {
		// async schedule next batch
		setTimeout( function(){
			response( data );
		}, 0 );
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

我们以1000份作为一个块来操作这些数据集。通过这样做，我们确保了一个短期运行的“进程”，即使这意味着许多后续的“进程”，因为交叉到事件循环队列将为我们提供一个响应性更好(高性能)的站点/应用程序。

当然，我们并不是在协调这些“进程”中任何一个的顺序的交互，所以结果在res中的顺序是不可预测的。如果需要排序，你需要使用我们前面讨论过的交互技术，或者我们将在本书后面的章节中介绍的交互技术。

我们使用`setTimeout(..0)` (黑科技)进行异步调度，这基本上意味着“将这个函数放在当前事件循环队列的末尾”。

**注意：** 从技术上讲，`setTimeout(..0)`并没有将一个项直接插入到事件循环队列中。计时器将在下次有机会时插入事件。例如，后面的两个`setTimeout(..0)`调用不能严格保证按调用顺序处理，因此可能会看到各种情况，比如计时器偏移，其中此类事件的顺序是不可预测的。在Node.js中，类似的方法是`process.nextTick(..)`。尽管这样做很方便(而且通常性能更好)，但还没有一种跨所有环境的直接方法(至少目前还没有)来确保异步事件顺序。下一节将更详细地讨论这个主题。

## Jobs(任务)

从ES6开始，在事件循环队列的顶部有一个新概念，称为“任务队列”。你最可能接触到的是Promise的异步行为(参见第3章)。

不幸的是，目前它是一种没有暴露API的机制，因此证明它有点复杂。所以我们将不得不从概念上描述它，这样当我们在第3章讨论异步行为和承诺时，你就会理解这些操作是如何被调度和处理的。

所以，我发现最好的方法是“任务队列”是挂在事件循环队列中每个tick的末尾的队列。在事件循环计时期间可能发生的某些异步隐含操作不会导致将整个新事件添加到事件循环队列中，而是将一个项(即任务)添加到当前计时任务队列的末尾。

这就像在说，“哦，这是我以后要做的另一件事，但要确保在其他事情发生之前马上做。”

或者，使用一个比喻：事件循环队列就像一个游乐园骑行，一旦你完成骑行，你必须再去线路后面再骑。但是任务队列就像完成了整个过程，但随后排成一排，然后重新开始。

任务还可以使更多任务添加到同一队列的末尾。因此，从理论上讲，一个任务“循环”(一个不断添加另一个任务的任务，等等)可能会无限期地轮转，从而使程序无法继续处理下一个事件循环。这在概念上几乎等同于在代码中表示一个长时间运行或无限循环(比如`while (true) ..`)。

任务有点像`setTimeout(..0)`黑客的精神，但是以一种更明确和更有保证的顺序实现: **稍后，但是越快越好** 。

让我们设想一个用于调度任务的API(直接，没有黑客)，并将其称为`schedule(..)`。考虑:

```js
console.log( "A" );

setTimeout( function(){
	console.log( "B" );
}, 0 );

// theoretical "Job API"
schedule( function(){
	console.log( "C" );

	schedule( function(){
		console.log( "D" );
	} );
} );
```

你可能希望这打印出`A B C D`，但它会打印出`A C D B`，因为任务发生在当前事件循环tick结束时，计时器将触发安排下一个事件循环tick(如果可用！)。

在第3章中，我们将看到promise的异步行为是基于任务的，所以务必要清楚它与事件循环行为之间的关系。

## Statement Ordering(语句顺序)

我们在代码中表达语句的顺序不一定与JS引擎执行语句的顺序相同。这似乎是一个相当奇怪的断言，所以我们将简要地探讨一下。

但在此之前，我们应该非常清楚:语言的规则/语法(请参阅本系列书籍的*Types & Grammar*标题)从程序的角度规定了一种可预测和可靠的语句排序行为。所以我们要讨论的是你在JS程序中 **不是应该能够观察到的东西** 。

**警告：** 如果你能够像我们将要说明的那样*观察*编译器语句的重新排序，那么这显然违反了规范，而且毫无疑问，这是由于JS引擎中的一个bug造成的——应该立即报告并修复它! 但更常见的情况是，你*怀疑*JS引擎中发生了一些疯狂的事情，而实际上这只是你自己代码中的一个bug(可能是“竞态条件”!)。JS调试器使用断点并逐行逐行地执行代码，它将是你查出*你代码* 中此类bug的最强大工具。

考虑下：

```js
var a, b;

a = 10;
b = 30;

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

这段代码没有表示异步(除了前面讨论的罕见的`console`异步I/O !)，所以最有可能的假设是它将以自顶向下的方式逐行处理。

但是，在编译了这段代码之后(是的，JS已经编译好了——请参阅本系列的*Scope & closure*标题!)，JS引擎有*可能*通过重新(安全地)排列这些语句的顺序来更快地运行代码。本质上，只要你不能观察到重新排序，任何事情都是公平的。

例如，引擎可能会发现这样实际执行代码更快:

```js
var a, b;

a = 10;
a++;

b = 30;
b++;

console.log( a + b ); // 42
```

或者这样：

```js
var a, b;

a = 11;
b = 31;

console.log( a + b ); // 42
```

甚至可能是这样：

```js
// because `a` and `b` aren't used anymore, we can
// inline and don't even need them!
console.log( 42 ); // 42
```

在所有这些情况下，JS引擎在编译期间执行安全优化，因为最终可观察到的结果是相同的。

但是这里有一个场景，这些特定的优化是不安全的，因此不能被允许(当然，并不是说它根本没有优化):

```js
var a, b;

a = 10;
b = 30;

// we need `a` and `b` in their preincremented state!
console.log( a * b ); // 300

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

编译器重新排序可能产生可观察到的副作用(因此必须禁止)的其他例子包括任何具有副作用的函数调用(甚至是getter函数)或ES6代理对象(请参阅本系列图书的ES6 & Beyond标题)。

考虑：

```js
function foo() {
	console.log( b );
	return 1;
}

var a, b, c;

// ES5.1 getter literal syntax
c = {
	get bar() {
		console.log( a );
		return 1;
	}
};

a = 10;
b = 30;

a += foo();				// 30
b += c.bar;				// 11

console.log( a + b );	// 42
```

如果这段代码中没有`console.log(..)`语句(只是作为演示中可观察到的副作用的一种方便的形式使用)，JS引擎很可能是更自由的，如果它想(谁知道它会不会!?)。将代码重新排序为：

```js
// ...

a = 10 + foo();
b = 30 + c.bar;

// ...
```

虽然JS语义很好地保护了我们，使我们免受编译器语句重新排序可能面临的噩梦，但理解源代码的编写方式(自顶向下的方式)和编译后运行方式之间的链接是多么微弱仍然很重要。

编译器语句重新排序几乎是并发性和交互的微观隐喻。作为一个通用概念，这种意识可以帮助你更好地理解异步JS代码流问题。

## Review

JavaScript程序(实际上)总是分成两个或多个块，第一个块*现在*运行，下一个块*稍后*运行，以响应某个事件。即使程序是按块执行的，但它们都共享对程序作用域和状态的相同访问，因此对状态的每次修改都是在前一个状态的基础上进行的。

只要有事件要运行，事件循环就会一直运行，直到队列为空。事件循环的每次迭代都是“tick”。用户交互、IO和计时器将事件放入事件队列。

在任何给定时刻，一次只能从队列中处理一个事件。当事件正在执行时，它可以直接或间接地导致一个或多个后续事件。

并发性是指两个或多个事件链随着时间交错，这样从高层次的角度来看，它们似乎是*同时*运行的(即使在任何给定时刻只处理一个事件)。

通常需要在这些并发的“进程”(与操作系统进程不同)之间进行某种形式的交互协调，例如确保排序或防止“竞争条件”。这些“进程”也可以通过将自己分成更小的块并允许其他“进程”交错来协作。