JavaScript中的异步处理传统上以速度不快而闻名。更糟的是，调试实时JavaScript应用程序(特别是Node.js服务器)不是一件容易的事情，尤其是在异步编程方面。幸运的是，时代正在改变。本文探讨了如何在V8中优化异步函数和promis(在某种程度上，在其他JavaScript引擎中也是如此)，并描述了如何改进异步代码的调试体验。

**注意：** 如果你更喜欢观看演示文稿而不是阅读文章，那么请欣赏下面的视频！如果不是，请跳过视频并继续阅读。

<iframe width="720" height="405" src="https://www.youtube.com/embed/DFP5DKDQfOc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 一种新的异步编程方法

### 从回调到promis到异步功能

在promises成为JavaScript语言的一部分之前，基于回调的API通常用于异步代码，尤其是在Node.js中。这是一个例子：

```js
function handler(done) {
  validateParams(error => {
    if (error) return done(error);
    dbQuery((error, dbResults) => {
      if (error) return done(error);
      serviceCall(dbResults, (error, serviceResults) => {
        console.log(result);
        done(error, serviceResults);
      });
    });
  });
}
```

以这种方式使用深度嵌套回调的特定模式通常被称为*“回调地狱”* ，因为这会降低代码的可读性并且难以维护。

幸运的是，现在promises已经成为JavaScript语言的一部分，同样的代码可以用更优雅和更易于维护的方式编写:

```js
function handler() {
  return validateParams()
    .then(dbQuery)
    .then(serviceCall)
    .then(result => {
      console.log(result);
      return result;
    });
}
```

最近，JavaScript获得了对[异步功能](https://developers.google.com/web/fundamentals/primers/async-functions)的支持。现在可以用与同步代码非常相似的方式编写上述异步代码：

```js
async function handler() {
  await validateParams();
  const dbResults = await dbQuery();
  const results = await serviceCall(dbResults);
  console.log(results);
  return results;
}
```

使用异步函数，代码变得更简洁，控制和数据流也更容易理解，尽管执行仍然是异步的。(注意，JavaScript执行仍然发生在一个线程中，这意味着异步函数最终不会自己创建物理线程。)

### 从事件侦听器回调到异步迭代

另一个在Node.js中特别常见的异步范例是[ReadableStream](https://nodejs.org/api/stream.html#stream_readable_streams)。这是一个例子：

```js
const http = require("http");

http
  .createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      res.write(body);
      res.end();
    });
  })
  .listen(1337);
```

这段代码可能有点难理解: 传入的数据以块的形式处理，块只能在回调中访问，流结束信号也在回调中发生。当你没有意识到函数立即终止，而实际的处理必须在回调中进行时，很容易在这里引入bug。

幸运的是，一个名为[异步迭代(async iteration)](http://2ality.com/2016/10/asynchronous-iteration.html)的很酷的ES2018新特性可以简化这段代码:

```js
const http = require("http");

http
  .createServer(async (req, res) => {
    try {
      let body = "";
      req.setEncoding("utf8");
      for await (const chunk of req) {
        body += chunk;
      }
      res.write(body);
      res.end();
    } catch {
      res.statusCode = 500;
      res.end();
    }
  })
  .listen(1337);
```

现在，我们可以将所有内容放入单个异步函数中，并使用新的`for await…of`循环异步迭代块，而不是将实际请求处理的逻辑放入两个不同的回调(`'data'`和`'end'`回调)中。我们还添加了一个`try-catch`块来避免`unhandledRejection`问题[1]。

> [1] => 感谢[Matteo Collina](https://twitter.com/matteocollina)指出我们[这个问题](https://github.com/mcollina/make-promises-safe/blob/master/README.md#the-unhandledrejection-problem)。

你现在可以在生产中使用这些新功能！**从Node.js 8 (V8 v6.2 / Chrome 62)开始完全支持** 异步函数，**从Node.js 10 (V8 v6.8 / Chrome 68)开始完全支持** 异步迭代器和生成器!

## 异步性能改进

我们已经成功地在V8的v5.5(Chrome 55和Node.js 7)和V8的v6.8(Chrome 68和Node.js 10)之间显著提高了异步代码的性能。我们达到了一定的性能水平，开发人员可以安全地使用这些新的编程范例，而无需担心速度。

![](https://benediktmeurer.de/images/2018/doxbee-benchmark-20181112.svg)

上面的图表显示了[doxbee基准测试](https://github.com/v8/promise-performance-tests/blob/master/lib/doxbee-async.js)，它测量了大量promise代码的性能。请注意，图表可视化执行时间，意味着更低更好。

[并行基准测试](https://github.com/v8/promise-performance-tests/blob/master/lib/parallel-async.js)的结果更加令人兴奋，它特别强调[`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)的性能:

![](https://benediktmeurer.de/images/2018/parallel-benchmark-20181112.svg)

我们设法将`Promise.all`的性能提高了 **8** 倍。但是，上面的基准测试是合成的微型基准测试。V8团队更感兴趣的是我们的优化如何影响[实际用户代码的实际性能](https://v8.dev/blog/real-world-performance)。

![](https://benediktmeurer.de/images/2018/http-benchmarks-20181112.svg)

上面的图表显示了一些流行的HTTP中间件框架的性能，这些框架大量使用了promises和`async`函数。请注意，此图表显示请求数/秒，因此与之前的图表 **不同** ，越高的越好。这些框架的性能在Node.js 7(V8 v5.5)和Node.js 10(V8 v6.8)之间得到了显著改善。

这些性能的改善是下列三项主要成就的结果:

1. [TurboFan](https://v8.dev/docs/turbofan) 新的优化编译器🎉
2. [Orinoco](https://v8.dev/blog/orinoco) 新的垃圾回收器🚛
3. node.js 8错误导致`await`跳过microticks🐛

当我们在[Node.js](https://medium.com/the-node-js-collection/node-js-8-3-0-is-now-available-shipping-with-the-ignition-turbofan-execution-pipeline-aa5875ad3367) 8中[发布TurboFan](https://v8.dev/blog/launching-ignition-and-turbofan)时，它在各个方面都带来了巨大的性能提升。

我们还开发了一个名为Orinoco的新垃圾收集器，它将垃圾收集工作移出主线程，从而显著地改进请求处理。

最后，但也挺重要的是，Node.js 8中有一个便利的bug，在某些情况下会导致`await`跳过microticks，从而获得更好的性能。这个bug一开始是无意中违反了规范，但是后来给了我们一个优化的想法。让我们从解释错误行为开始:

```js
const p = Promise.resolve();

(async () => {
  await p;
  console.log("after:await");
})();

p.then(() => console.log("tick:a")).then(() => console.log("tick:b"));
```

上面的程序创建了一个完成(fulfilled)的promise `p`，并`await`其结果，但也将两个处理程序链接到它上面。你希望`console.log`调用以哪种顺序执行？

由于`p`已经完成(fulfilled)，你可能希望它首先打印`'after: await'`然后打`'tick'`。实际上，这是你在Node.js 8中得到的行为：

![](https://benediktmeurer.de/images/2018/await-bug-node-8-20181112.svg)

虽然这种行为看起来很直观，但根据规范它并不正确。Node.js 10实现了正确的行为，即首先执行链式处理程序，然后才继续使用异步(async)函数。

![](https://benediktmeurer.de/images/2018/await-bug-node-10-20181112.svg)

这种“正确的行为”可以说并不是很明显，对JavaScript开发人员来说实际上是令人惊讶的，所以有必要解释一下。在深入到promise和异步(async)函数的神奇世界之前，让我们先从一些基础开始。

### (宏)任务与微任务

在高层次上，JavaScript中有(宏)任务和微任务之分。任务处理I/O和计时器等事件，并一次执行一个。微任务为`async`/`await`和promise实现延迟执行，并在每个任务结束时执行。在执行返回到事件循环之前，总是会清空微任务队列。(译：具体的可以查看[这里](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/))

![](https://benediktmeurer.de/images/2018/microtasks-vs-tasks-20181112.svg)

有关更多详细信息，请查看Jake Archibald对[浏览器中任务，微任务，队列和计划](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)的解释。Node.js中的任务模型与之非常相似。

### 异步功能

根据MDN，异步(async)函数是一个使用隐式promise来异步操作以返回其结果的函数。异步函数的目的是使异步代码看起来像同步代码，从而向开发人员隐藏异步处理的一些复杂性。

最简单的异步函数如下所示：

```js
async function computeAnswer() {
  return 42;
}
```

当被调用时，它返回一个promise，你可以像任何其他的promise那样获得它的值。

```js
const p = computeAnswer();
// → Promise

p.then(console.log);
// prints 42 on the next turn
```

你只能在下一次运行微任务时获得这个promise `p`的值。换句话说，上面的程序在语义上等同于使用带有值的`Promise.resolve`：

```js
function computeAnswer() {
  return Promise.resolve(42);
}
```

异步函数的真正强大之处在于`await`表达式，它导致函数执行暂停，直到一个promise被解决(resolved)，并在实现之后恢复，继续执行下去。`await`的值是完成(fulfilled) promise的值。下面是一个例子:

```js
async function fetchStatus(url) {
  const response = await fetch(url);
  return response.status;
}
```

`fetchStatus`的执行在`await`期间暂停，然后在`fetch` promise完成(fulfill)时恢复，继续执行下去。这或多或少相当于将处理程序链接到`fetch`返回的promise上。

```js
function fetchStatus(url) {
  return fetch(url).then(response => response.status);
}
```

该处理程序包含`async`函数中`await`后面的代码。

通常，你会传递一个`Promise`去`await`，但实际上你可以`await`任意JavaScript值。如果`await`之后的表达式的值不是promise，则将其转换为promise。这意味着如果你愿意，可以`await 42`：

```js
async function foo() {
  const v = await 42;
  return v;
}

const p = foo();
// → Promise

p.then(console.log);
// prints `42` eventually
```

更有趣的是，`await`适用于任何[`'thenable'`](https://promisesaplus.com/)，即任何带有`then`方法的对象，即使它不是真正的promise。(译：关于thenable，可以查看[这里](https://github.com/xiaohesong/til/blob/master/front-end/es6/understanding-es6/promise.md))。所以你可以实现一些有趣的事情，比如测量实际sleeping时间的异步sleep:

```js
class Sleep {
  constructor(timeout) {
    this.timeout = timeout;
  }
  then(resolve, reject) {
    const startTime = Date.now();
    setTimeout(() => resolve(Date.now() - startTime), this.timeout);
  }
}

(async () => {
  const actualTime = await new Sleep(1000);
  console.log(actualTime);
})();
```

按照[规范](https://tc39.github.io/ecma262/#await)，让我们看看V8为`await`在引擎下做了什么。这是一个简单的异步函数`foo`：

```js
async function foo(v) {
  const w = await v;
  return w;
}
```

调用时，它将参数`v`包装到promise中并暂停执行异步函数，直到解析该promise。一旦发生这种情况，函数的执行将继续，`w`将获得已实现(fulfilled) promise 的值。然后从异步函数返回此值。

### 在引擎盖下的`await`

首先，V8将这个函数标记为 *可恢复* 的(*resumable*)，这意味着可以暂停执行，然后恢复执行(`await`的点)。然后它创建了所谓的`implicit_promise`，当调用async函数时返回这个promise，并最终解析为async函数生成的值。

![](https://benediktmeurer.de/images/2018/await-under-the-hood-20181112.svg)

接下来是有趣的部分: 实际的`await`。首先，传递给`await`的值被包装到一个promise中。然后，处理程序被附加到这个包装的promise上，以在promise完成(fulfilled)后恢复函数，并暂停异步函数的执行，将`implicit_promise`返回给调用者。一旦履行(fulfilled)了promise，就会使用promise中的值`w`恢复异步函数的执行，并使用`w`解析(resolve) `implicit_promise`。

简而言之，`await v`的初始步骤是：

1. 将v(传递给`await`的值)包装成一个promise。
2. 附加用于稍后恢复异步函数的处理程序。
3. 暂停异步函数并将`implicit_promise`返回给调用者。

让我们一步一步地完成各个操作。假设正在`await`的东西已经是一个promise，它已经完成(fulfilled)了，并且值是`42`。然后，引擎创建一个新的`promise`，并解决任何`await`的东西。这将在下一个回合中延迟这些承诺的链接，通过规范所称的[`PromiseResolveThenableJob`](https://tc39.github.io/ecma262/#sec-promiseresolvethenablejob)来表示。

![](https://benediktmeurer.de/images/2018/await-step-1-20181112.svg)

然后引擎创造了另一个所谓的`throwaway` promise。它被称为 *一次性*(*throwaway*)，因为没有任何东西被链接到它 - 它完全是引擎内部的。然后将这个`throwaway` promise链接到promise上，使用适当的处理程序来恢复异步功能。这个`performPromiseThen`操作基本上是[`Promise.prototype.then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)在幕后所做的。最后，暂停执行异步功能，并且控制权返回给调用者。

![](https://benediktmeurer.de/images/2018/await-step-2-20181112.svg)

执行在调用者中继续，最终调用堆栈变空。然后JavaScript引擎开始运行微任务：它运行先前调度的`PromiseResolveThenableJob`，它调度新的`PromiseReactionJob`以将`promise`链接到传递给`await`的值。然后，引擎返回到处理微任务队列，因为在继续主事件循环之前必须清空微任务队列。

![](https://benediktmeurer.de/images/2018/await-step-3-20181112.svg)

接下来是[`PromiseReactionJob`](https://tc39.github.io/ecma262/#sec-promisereactionjob)，它完成了我们正在`await`的承诺值的`promise` - 在这种情况下为`42` - 并将反应计划在`throwaway` promise上。然后引擎再次返回微任务循环，其中包含要处理的最终微任务。

![](https://benediktmeurer.de/images/2018/await-step-4-final-20181112.svg)

现在，第二个[`PromiseReactionJob`](https://tc39.github.io/ecma262/#sec-promisereactionjob)将解析传播到`throwaway` promise，并恢复异步函数的暂停执行，从`await`返回值`42`。

![](https://benediktmeurer.de/images/2018/await-overhead-20181112.svg)

总结我们所学到的，对于每个`await`，引擎必须创建 **两个额外** 的promise(即使右边已经是一个promise)，并且它需要 **至少三个** 微任务队列。谁知道一个简单的`await`会导致*这么多开销* ?!

![](https://benediktmeurer.de/images/2018/await-code-before-20181112.svg)

我们来看看这个开销来自何处。第一行负责创建包装 promise。第二行立即用包装的promise解析(resolve)`await`的值`v`。这两行代码由一个额外的promise加上三个microticks中的两个来负责。如果`v`已经是一个promise（这是常见的情况，因为应用程序通常`await` promise），这是非常昂贵的。在不太可能的情况下，开发人员`await`例如`42`这样的非promise，引擎仍然需要将它包装成一个promise。

事实证明，规范中已经有一个[promiseResolve](https://tc39.github.io/ecma262/#sec-promise-resolve)操作，只在需要时执行包装：

![](https://benediktmeurer.de/images/2018/await-code-comparison-20181112.svg)

此操作仍然返回promises，并且只在必要时将其他值包装到promises中。这样就可以保存其中一个额外的promise，加上微任务队列上的两个tick，这是传递给`await`的值已经是promise的常见情况。这个新行为目前是在V8中的`--harmony-await-optimization`标志后面实现的(从V8 v7.1开始)。我们也[提出了对ECMAScript规范的这种改变](https://github.com/tc39/ecma262/pull/1250); 一旦我们确定它与Web兼容，就应该合并补丁。

以下是新的和改进后的`await`如何在幕后一步一步地工作:

![](https://benediktmeurer.de/images/2018/await-new-step-1-20181112.svg)

让我们再次假设我们在`await`一个promise，并且完成的时候是`42`。由于[`promiseResolve`](https://tc39.github.io/ecma262/#sec-promise-resolve)的魔力，现在`promise`只引用相同的promise `v`，所以这一步不需要做什么。之后，引擎像之前一样继续运行，创建`throwaway` promise，调度一个[`PromiseReactionJob`](https://tc39.github.io/ecma262/#sec-promisereactionjob)，以便在微任务队列上的下一个tick上恢复异步函数，暂停函数的执行，并返回给调用者。

![](https://benediktmeurer.de/images/2018/await-new-step-2-20181112.svg)

然后最终当所有JavaScript执行完成时，引擎开始运行微任务，因此它执行[PromiseReactionJob](https://tc39.github.io/ecma262/#sec-promisereactionjob)。这个任务将promise的解析传播到`throwaway`，并恢复async函数的执行，从`await`中产生`42`。

![](https://benediktmeurer.de/images/2018/await-overhead-removed-20181112.svg)

如果传递给`await`的值已经是一个promise，那么这种优化避免了创建包装promise的需要，在这种情况下，我们从最少 **三个** microticks到 **一个** microtick。这种行为类似于Node.js 8所做的，除了现在它不再是一个bug - 它现在是一个正在标准化的优化！

尽管引擎是完全内部的，但是引擎必须创建这种`throwaway` promise的感觉仍然是错误的。事实证明，`throwaway` promise只是为了满足规范中内部`performPromiseThen`操作的API约束。

![](https://benediktmeurer.de/images/2018/await-optimized-20181112.svg)

这一点最近在ECMAScript规范的[编辑更改中](https://github.com/tc39/ecma262/issues/694)得到了解决。引擎不再需要创造`await`的`throwaway` promise - 大部分时间[2]。

> [2] => 如果在Node.js中使用[async_hooks](https://nodejs.org/api/async_hooks.html)，V8仍然需要创建`throwaway`承诺，因为`before`和`after`钩子是在`throwaway` promise的*上下文*中运行的。 

![](https://benediktmeurer.de/images/2018/node-10-vs-node-12-20181112.svg)

将Node.js 10中的`await`与Node.js 12中的优化`await`进行比较，可以看出这种变化对性能的影响:

![](https://benediktmeurer.de/images/2018/benchmark-optimization-20181112.svg)

**`async`/`await`现在比手写的promise代码执行得性能更好。** 这里的关键点是我们通过修补规范[3]显着减少了异步函数的开销 - 不仅在V8中，而且在所有JavaScript引擎中。

> [3] => 如前所述，[补丁](https://github.com/tc39/ecma262/pull/1250)尚未合并到ECMAScript规范中。我们的计划是，一旦我们确定这个改变不会破坏web，我们就会这么做。↩︎

## 改善开发者体验

除了性能之外，JavaScript开发人员还关心诊断和修复问题的能力，这在处理异步代码时并不总是那么容易。[Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)支持 *异步堆栈跟踪* ，即堆栈跟踪不仅包括堆栈的当前同步部分，还包括异步部分：

![](https://benediktmeurer.de/images/2018/devtools-20181112@2x.png)

在本地开发期间，这是一个非常有用的特性。但是，一旦部署了应用程序，这种方法并不能真正帮助你。在事后调试期间，你只会在日志文件中看到`Error#stack`输出，而这并不能告诉你关于异步部分的任何信息。

我们最近一直在研究[零成本的异步堆栈跟踪](https://bit.ly/v8-zero-cost-async-stack-traces)，它丰富异步函数调用的`Error#stack`属性。“零成本”听起来令人兴奋，不是吗？当Chrome DevTools功能带来重大开销时，它如何成为零成本？考虑这个示例，其中`foo`异步调用`bar`，`bar`在`await` promise后抛出异常：

```js
async function foo() {
  await bar();
  return 42;
}

async function bar() {
  await Promise.resolve();
  throw new Error("BEEP BEEP");
}

foo().catch(error => console.log(error.stack));
```

在Node.js 8或Node.js 10中运行此代码会产生以下输出：

```shell
$ node index.js
Error: BEEP BEEP
    at bar (index.js:8:9)
    at process._tickCallback (internal/process/next_tick.js:68:7)
    at Function.Module.runMain (internal/modules/cjs/loader.js:745:11)
    at startup (internal/bootstrap/node.js:266:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:595:3)
```

请注意，尽管对`foo()`的调用会导致错误，但`foo`根本不是堆栈跟踪的一部分。这使得JavaScript开发人员很难执行事后调试，这与代码是部署在web应用程序中还是部署在某个云容器中无关。

这里有趣的是，引擎知道在完成`bar`时它必须继续的位置：函数`foo`中的`await`之后。巧合的是，这也是函数`foo`被暂停的地方。引擎可以使用这些信息来重构异步堆栈跟踪的部分，即`await`站点。通过此更改，输出变为:

```shell
$ node --async-stack-traces index.js
Error: BEEP BEEP
    at bar (index.js:8:9)
    at process._tickCallback (internal/process/next_tick.js:68:7)
    at Function.Module.runMain (internal/modules/cjs/loader.js:745:11)
    at startup (internal/bootstrap/node.js:266:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:595:3)
    at async foo (index.js:2:3)
```

在堆栈跟踪中，最前面的函数首先出现，然后是同步堆栈跟踪的其余部分，然后是函数foo中对bar的异步调用。在V8中，这个更改是在新的`--async-stack-trace`标志之后实现的。

但是，如果将其与上面Chrome DevTools中的异步堆栈跟踪进行比较，你会注意到堆栈跟踪的异步部分中缺少`foo`的实际调用站点。如前所述，这种方法利用了这样一个事实，即等待恢复和暂停位置是相同的——但是对于常规的`Promise#then()`或`Promise#catch()`调用，情况就不是这样了。有关更多背景信息，请参见Mathias Bynens关于为什么[`await`胜过`Promise#then()`](https://mathiasbynens.be/notes/async-stack-traces)的解释。

## 结论

由于两个重要的优化，我们使异步函数更快：

- 删除两个额外的microticks
- 取消`throwaway` promise。

除此之外，我们还通过[零成本的async堆栈跟踪](https://bit.ly/v8-zero-cost-async-stack-traces)改进了开发人员的体验，这些跟踪在async函数和`Promise.all()`中使用`await`。

我们还为JavaScript开发人员提供了一些很好的性能建议：

- 偏向于`async`函数和`await`，而不是手写promise代码
- 坚持JavaScript引擎提供的原生promise实现，以从快捷方式中获益，即为`await`避免两个microticks。



### 译者结论

async得到了性能的提升，这是因为nodejs 8中的一个bug，由于这个bug使得v8开发人员得到了感悟，减少不必要的microtick。

await的值如果不是一个promise会被包装一个promise。这个是有问题的，因为大多数的时候，都是`await` promise，所以有这么一个改进：

![](https://benediktmeurer.de/images/2018/await-code-comparison-20181112.svg)

可以看到图中，如果是一个promise就直接返回了，否则就包装下。



