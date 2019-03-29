> 本文原文： [JavaScript engine fundamentals: optimizing prototypes](https://benediktmeurer.de/2018/08/16/javascript-engine-fundamentals-optimizing-prototypes/)

本文介绍了所有JavaScript引擎通用的一些关键基础原理 - 而不仅仅是作者([Benedikt](https://twitter.com/bmeurer)和[Mathias](https://twitter.com/mathias))所使用的[V8](https://twitter.com/v8js)引擎。作为JavaScript开发人员，深入了解JavaScript引擎的工作原理可以帮助你了解代码的性能特征。

[之前](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/engines/shape%E5%92%8Cinline-cache.md)，我们讨论了JavaScript引擎如何通过使用Shapes和Inline Caches来优化对象和数组访问。本文解释了优化管道的权衡，并描述了引擎如何加速对原型属性的访问。

**注意：** 如果你更喜欢观看演示文稿而不是阅读文章，那么请欣赏下面的视频！如果不是，请跳过视频并继续阅读。

[![点击观看](https://i.ytimg.com/vi_webp/IFWulQnM5E0/maxresdefault.webp)](https://youtu.be/IFWulQnM5E0)

## 优化层和执行权衡(trade-offs)

[我们之前的文章](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/engines/shape%E5%92%8Cinline-cache.md)讨论了现代JavaScript引擎是如何拥有相同的整体管道的:

![](https://benediktmeurer.de/images/2018/js-engine-pipeline-20180816.svg)

我们还指出，尽管引擎之间的高级管道相似，但优化管道方面通常存在差异。这是为什么？**为什么有些引擎比其他引擎有更多的优化层？** 事实证明，在快速运行代码和花费更多时间但最终以最佳性能运行代码之间存在权衡。

![](https://benediktmeurer.de/images/2018/tradeoff-startup-speed-20180816.svg)

解释器可以快速生成字节码，但字节码通常效率不高。另一方面，优化编译器需要更长的时间，但最终会产生更高效的机器代码。

这正是V8使用的模型。V8的解释器叫做 **Ignition** ，它是所有引擎中最快的解释器(就原始字节码执行速度而言)。V8的优化编译器名为 **TurboFan** ，它最终生成高度优化的机器代码。

![](https://benediktmeurer.de/images/2018/tradeoff-startup-speed-v8-20180816.svg)

启动延迟和执行速度之间的这种平衡是一些JavaScript引擎选择在两者之间添加优化层的原因。例如，SpiderMonkey(v8之外的一种引擎)在解释器和完整的IonMonkey优化编译器之间添加了一个Baseline层:

![](https://benediktmeurer.de/images/2018/tradeoff-startup-speed-spidermonkey-20180816.svg)

解释器(Interpreter)快速生成字节码，但是字节码执行相对较慢。Baseline需要更长的时间来生成代码，但是它提供了更好的运行时性能。最后，IonMonkey优化编译器需要最长的时间来生成机器码，但是这些代码可以非常高效地运行。

让我们看一个具体的例子，看看不同引擎中的管道如何处理它。下面是一些在热循环(hot loop)中经常重复的代码。

```js
let result = 0;
for (let i = 0; i < 4242424242; ++i) {
  result += i;
}
console.log(result);
```

在V8中，它开始在*Ignition* 解释器中运行字节码。在某些时候，引擎确定代码很热并启动TurboFan前端，这是TurboFan的一部分，它处理集成分析数据和构建代码的基本机器表示。然后将其发送到另一个线程上的TurboFan优化器，以进一步改进代码。

![](https://benediktmeurer.de/images/2018/pipeline-detail-v8-20180816.svg)

优化器运行时，V8继续在Ignition中执行字节码。在某个时候，优化器已经完成，我们有了可执行的机器码，可与之继续执行。

SpiderMonkey引擎也开始在解释器中运行字节码。但它有额外的Baseline层，这意味着热代码首先被发送到Baseline。Baseline编译器在主线程上生成Baseline代码，并准备好后继续执行。

![](https://benediktmeurer.de/images/2018/pipeline-detail-spidermonkey-20180816.svg)

如果Baseline代码运行了一段时间，SpiderMonkey最终会启动IonMonkey前端，并启动优化器 - 与V8非常相似。当IonMonkey进行优化时，它一直在Baseline中运行。最后，当优化器完成时，执行优化代码而不是Baseline代码。

Chakra的架构非常类似于SpiderMonkey，但Chakra尝试同时运行更多东西以避免阻塞主线程。Chakra不在主线程上运行编译器的任何部分，而是复制编译器可能需要的字节码和分析数据，并将其发送给专用的编译器进程。

![](https://benediktmeurer.de/images/2018/pipeline-detail-chakra-20180816.svg)

当生成的代码准备就绪时，引擎开始运行此SimpleJIT代码而不是字节码。 FullJIT也是如此。这种方法的好处是，与运行完整的编译器(前端)相比，复制发生的暂停时间通常要短得多。但这种方法的缺点是*复制启发式*可能会遗漏某些优化所需的某些信息，因此在某种程度上，它是在用代码质量换取延迟。

在JavaScriptCore中，所有优化编译器都与主JavaScript执行 **完全并发** 运行; 没有复制阶段！相反，主线程仅在另一个线程上触发编译作业。然后编译器使用一个复杂的锁定方案从主线程访问分析数据。

![](https://benediktmeurer.de/images/2018/pipeline-detail-javascriptcore-20180816.svg)

这种方法的优点是它减少了主线程上JavaScript优化引起的抖动。缺点是它需要处理复杂的多线程问题，并为各种操作承担一些锁定成本。我们已经讨论了在使用解释器快速生成代码或使用优化编译器生成快速代码之间的权衡。但还有另一个权衡：**内存使用** ！为了说明这一点，这是一个简单的JavaScript程序，它将两个数字相加。

```js
function add(x, y) {
  return x + y;
}

add(1, 2);
```

让我们看看我们使用V8中的Ignition解释器为add函数生成的字节码。

```js
StackCheck
Ldar a1
Add a0, [0]
Return
```

不需要担心这个确切的字节码—你实际上不需要读取它。关键是它 **只是四条指令** ！

当代码变热(hot)时，TurboFan会生成以下高度优化的机器代码：

```js
leaq rcx,[rip+0x0]
movq rcx,[rcx-0x37]
testb [rcx+0xf],0x1
jnz CompileLazyDeoptimizedCode
push rbp
movq rbp,rsp
push rsi
push rdi
cmpq rsp,[r13+0xe88]
jna StackOverflow
movq rax,[rbp+0x18]
test al,0x1
jnz Deoptimize
movq rbx,[rbp+0x10]
testb rbx,0x1
jnz Deoptimize
movq rdx,rbx
shrq rdx, 32
movq rcx,rax
shrq rcx, 32
addl rdx,rcx
jo Deoptimize
shlq rdx, 32
movq rax,rdx
movq rsp,rbp
pop rbp
ret 0x18
```

这是 **很多代码** ，特别是与字节码中的四个指令相比! 一般来说，字节码比机器码要紧凑得多，尤其是经过优化的机器码。另一方面，字节码需要一个解释器来运行，而优化后的代码可以由处理器直接执行。

这是JavaScript引擎不仅仅 *'优化一切'* 的主要原因之一。正如我们之前看到的，生成优化的机器代码需要很长时间，而且最重要的是，我们刚刚了解到 **优化的机器代码也需要更多的内存** 。

![](https://benediktmeurer.de/images/2018/tradeoff-memory-20180816.svg)

**总结：** JS引擎有不同优化层的原因是在快速生成代码(比如使用解释器)和生成快速代码(使用优化编译器)之间进行了基本的权衡。它是一个尺度，添加更多的优化层允许你以额外的复杂性和开销为代价做出更细粒度的决策。此外，优化级别和生成代码的内存使用之间存在权衡。这就是为什么JS引擎只优化*热* 功能(*hot* functions)。

## 优化原型属性访问

[我们之前的文章](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/engines/shape%E5%92%8Cinline-cache.md)解释了JavaScript引擎如何使用Shapes和Inline Caches优化对象属性加载。回顾一下，引擎将对象的`Shape`与对象的值分开存储。

![](https://benediktmeurer.de/images/2018/shape-2-20180816.svg)

Shapes启用称为*Inline Caches*(*IC*)的优化。组合起来，shape和ICs可以加速代码中相同位置的重复属性访问。

![](https://benediktmeurer.de/images/2018/ic-4-20180816.svg)

### 类和基于原型的编程

现在我们知道了如何在JavaScript对象上快速访问属性，让我们来看看JavaScript最近添加的一个特性: 类。这是JavaScript类语法的样子：

```js
class Bar {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}
```

虽然这在JavaScript中似乎是一个新概念，但它只是JavaScript中一直使用的基于原型的编程的语法糖:

```js
function Bar(x) {
  this.x = x;
}

Bar.prototype.getX = function getX() {
  return this.x;
};
```

在这里，我们在`Bar.prototype`对象上分配一个`getX`属性。这与任何其他对象的工作方式完全相同，因为 **原型只是JavaScript中的对象** ! 在基于原型的编程语言(如JavaScript)中，方法通过原型共享，而字段存储在实际实例中。让我们放大创建一个名为`foo`的`Bar`新实例时在幕后发生了什么。

```js
const foo = new Bar(true);
```

运行此代码创建的实例的形状只有一个属性`'x'`。`foo`的原型是属于`Bar`类的`Bar.prototype`。

![](https://benediktmeurer.de/images/2018/class-shape-1-20180816.svg)

这个`Bar.prototype`有自己的形状，包含一个属性`'getX'`，其值是函数`getX`，它在调用时只返回`this.x`。`Bar.prototype`的原型是`Object.prototype`，它是JavaScript语言的一部分。`Object.prototype`是原型树的根，因此它的原型是`null`。

![](https://benediktmeurer.de/images/2018/class-shape-2-20180816.svg)

如果你创建同一个类的另一个实例，则两个实例共享对象形状，如前所述。两个实例都指向相同的`Bar.prototype`对象。

### 原型属性访问

好的，现在我们知道当我们定义一个类并创建一个新实例时会发生什么。但是如果我们在一个实例上调用一个方法会发生什么，就像我们在这里做的那样？

```js
class Bar {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}

const foo = new Bar(true);
const x = foo.getX();
//        ^^^^^^^^^^
```

你可以将任何方法调用视为两个单独的步骤：

```js
const x = foo.getX();

// is actually two steps:

const $getX = foo.getX;
const x = $getX.call(foo);
```

第1步是加载方法，它只是原型上的一个属性(其值恰好是一个函数)。第2步是把实例作为`this`值调用该函数。让我们来看看第一步，即从实例`foo`加载方法`getX`。

![](https://benediktmeurer.de/images/2018/method-load-20180816.svg)

引擎从`foo`实例开始，并且意识到`foo`的形状上没有`'getX'`属性，所以它必须走向原型链去查找。我们进入`Bar.prototype`，查看它的原型形状，并看到它在偏移`0`处具有`'getX'`属性。我们在`Bar.prototype`中查找此偏移量处的值，并找到我们正在寻找的`JSFunction` `getX`。就是这样！

JavaScript的灵活性使得改变原型链链接成为可能，例如：

```js
const foo = new Bar(true);
foo.getX();
// → true

Object.setPrototypeOf(foo, null);
foo.getX();
// Uncaught TypeError: foo.getX is not a function
```

在这个例子中，我们调用`foo.getX()`两次，但每次它具有完全不同的含义和结果。这就是为什么虽然原型只是JavaScript中的对象，但加速原型属性访问对JavaScript引擎来说比加速常规对象的*自身*属性访问更具挑战性。

纵观查看程序时，加载原型属性是一个非常频繁的操作:每次调用方法时都会发生这种情况! 

```js
class Bar {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}

const foo = new Bar(true);
const x = foo.getX();
```

之前，我们讨论了引擎如何通过使用Shapes和Inline Caches来优化加载常规的*自有属性*。如何优化具有相似形状对象的原型属性的重复加载? 我们在上面已经看到了属性加载是如何发生的。

![](https://benediktmeurer.de/images/2018/prototype-load-checks-1-20180816.svg)

为了在这种情况下使重复加载的速度更快，我们需要知道以下三件事:

`foo`的形状不包含`'getX'`并且没有改变。这意味着没有人通过添加或删除一个属性或更改其中一个属性来更改对象`foo`。`foo`的原型仍然是最初的`Bar.prototype`。这意味着没有人通过使用`Object.setPrototypeOf()`或通过赋予特殊的`__proto__`属性来更改`foo`的原型。`Bar.prototype`的形状包含`'getX'`并且没有改变。这意味着没有人通过添加或删除属性或更改其中一个属性来更改`Bar.prototype`。

在一般情况下，这意味着我们必须对实例本身执行1次检查，加上对每个原型执行2次检查，直到包含我们要查找的属性的原型为止。对于这种情况，`1+ 2N`次检查(其中`N`是涉及的原型数量)可能听起来不是太糟糕，因为原型链相对较浅。但是通常引擎必须处理更长的原型链，比如在常见的DOM类中。这是一个例子：

```js
const anchor = document.createElement("a");
// → HTMLAnchorElement

const title = anchor.getAttribute("title");
```

我们有一个`HTMLAnchorElement`，并在其上调用`getAttribute()`方法。查看简单anchor元素的原型链，我们可以看到已经涉及6个原型。许多有趣的DOM方法不是直接在原型上，而是链中的更高层。

![](https://benediktmeurer.de/images/2018/anchor-prototype-chain-20180816.svg)

`getAttribute()`方法位于`Element.prototype`上。这意味着每次调用`anchor.getAttribute()`时，JavaScript引擎都需要:

1. 检查`'getAttribute'`不在anchor对象本身上
2. 检查直接原型是否为`HTMLAnchorElement.prototype`
3. 断言缺少`'getAttribute'`
4. 检查下一个原型是否为`HTMLElement.prototype`
5. 断言缺少`'getAttribute'`
6. 检查下一个原型是否为`Element.prototype`
7. 并且`'getAttribute'`存在于那里

总共有7次检查！由于这类代码在web上非常常见，因此引擎使用一些技巧来减少原型上的属性加载所需的检查次数。

回到前面的例子，我们在`foo`上访问`'getX'`时执行了总共3次检查：

```js
class Bar {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}

const foo = new Bar(true);
const $getX = foo.getX;
```

对于所涉及的每个对象，直到携带该属性的原型之前，我们都需要进行形状检查。如果我们可以通过将原型检查折叠到缺少的检查中来减少检查次数，那就太好了。而这基本上就是引擎通过一个简单的技巧所做的事情：**不是将原型链接存储在实例本身，而是将其存储在形状中。** 

![](https://benediktmeurer.de/images/2018/prototype-load-checks-2-20180816.svg)

每个形状都指向原型。这也意味着每次`foo`的原型发生变化时，引擎都会转换为新的形状。现在，我们只需要检查对象的形状，既可以断言某些属性的缺失，又可以保护原型链接。

通过这种方法，我们可以从`1 + 2N`减少到`1 + N`所需的检查次数，以便在原型上更快地访问属性。但这仍然相当昂贵，因为它在原型链的长度上仍然是线性的。引擎实现了不同的技巧来进一步减少检查次数，特别是对于相同属性加载的后续执行。

### Validity cells

V8专门针对这个目的处理原型形状。每个原型都有一个惟一的形状，它不与任何其他对象共享(特别是不与其他原型共享)，并且每个原型形状都有一个与之关联的特殊`ValidityCell`。

![](https://benediktmeurer.de/images/2018/validitycell-20180816.svg)

每当有人更改关联的原型或其上的任何原型时，`ValidityCell`就会失效。让我们来看看它是如何工作的。

为了加速原型的后续加载，V8建立了一个内联缓存，有四个字段：

![](https://benediktmeurer.de/images/2018/ic-validitycell-20180816.svg)

在第一次运行此代码期间预热内联缓存时，V8会记住在原型中找到属性的偏移量，找到属性的原型（本例中为`Bar.prototype`），实例的形状（在这种情况下为`foo`的形状），以及与实例形状链接的 **直接原型** 的当前`ValidityCell`的链接（在本例中也恰好是`Bar.prototype`）。

下次内联缓存被命中时，引擎必须检查实例的形状和`ValidityCell`。如果它仍然有效，引擎可以直接到达`Prototype`上的`Offset`，跳过其他查找。

![](https://benediktmeurer.de/images/2018/validitycell-invalid-20180816.svg)

更改原型时，将分配新形状，并使先前的`ValidityCell`无效。因此，内联缓存会在下一次执行时丢失，从而导致性能下降。

从前面返回到DOM元素示例，这意味着对`Object.prototype`等的任何更改不仅会使`Object.prototype`本身的内联缓存失效，而且对于下面的任何原型，包括`EventTarget.prototype`，`Node.prototype`，`Element.prototype`等，一直到`HTMLAnchorElement.prototype`都会失效。

![](https://benediktmeurer.de/images/2018/prototype-chain-validitycells-20180816.svg)

实际上，在运行代码时修改`Object.prototype`意味着放弃性能。**不要这样做** ！

让我们通过一个具体的例子来探讨这个问题：假设我们有一个类`Bar`，并且我们有一个函数`loadX`，它调用`Bar`对象上的方法。我们用同一个类的实例调用这个loadX函数几次。

```js
class Bar {
  /* … */
}

function loadX(bar) {
  return bar.getX(); // IC for 'getX' on Bar instances
}

loadX(new Bar(true));
loadX(new Bar(false));
// IC in loadX now links ValidityCell for Bar.prototype.

Object.prototype.newMethod = y => y;
// The ValidityCell in the loadX IC is invalid
// now, because Object.prototype changed.
```

`loadX`中的内联缓存现在指向`Bar.prototype`的`ValidityCell`。如果你随后执行类似于改变`Object.prototype`（这是JavaScript中所有原型的根）的操作，则`ValidityCell`将变为无效，并且现有的内联缓存会在下次命中时丢失，从而导致性能下降。

改变`Object.prototype`总是一个坏主意，因为它使引擎在此之前提出的原型加载的任何内联缓存无效。这是另一个不能去做的例子：

```js
Object.prototype.foo = function() {
  /* … */
};

// Run critical code:
someObject.foo();
// End critical code.

delete Object.prototype.foo;
```

我们扩展了`Object.prototype`，它使引擎在此之前放置的任何原型内联缓存无效。然后我们运行一些使用新原型方法的代码。引擎必须从头开始，并为任何原型属性访问设置新的内联缓存。最后，我们“*自我清理*”并删除我们之前添加的原型方法。

清理听起来像个好主意，对吧？实际上，在这种情况下，它会使情况变得更糟！删除属性会修改`Object.prototype`，因此所有内联缓存都会再次失效，并且引擎必须再次从头开始。

**总结：** 尽管原型只是对象，但它们由JavaScript引擎专门处理，以优化原型上方法查找的性能。不要管你的原型!或者，如果你确实需要触碰原型，那么在运行其他代码之前进行，这样至少不会在代码运行时使引擎中的所有优化失效。

## 结论

我们已经了解了JavaScript引擎如何存储对象和类，以及`Shape`，Inline Caches和`ValidityCells`如何帮助优化原型操作。基于这些知识，我们确定了一个实用的JavaScript编码技巧，可以帮助提高性能：**不要乱用原型** （或者如果你真的真的需要，那么至少在其他代码运行之前这样做）。
