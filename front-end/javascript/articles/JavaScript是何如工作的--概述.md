> 译注：
>
> 本文可以作为了解JavaScript运行的一个概述，但是学习，还是需要自己去查找对应的资料详细学习。
>
> 本文更多的只是作为一个概述。

![60b4267a.png](https://miro.medium.com/max/2000/1*K26vJpKbNvZds4vwL9l4VA.jpeg)

你可能想知道为什么有人会在2019年写一篇关于JavaScript核心的长文。

这是因为我相信，在JS生态系统中，如果没有扎实的基础知识是很容易迷失的，几乎不可能探索更高级的主题。

理解JavaScript的工作原理使阅读和编写代码变得更容易，也不那么令人沮丧，并且允许你专注于应用程序的逻辑，而不是与语言的语法作斗争。

### 他是如何工作的？

电脑不了解JavaScript —— 浏览器可以。

除了处理网络请求、监听鼠标点击、解释HTML和CSS以便在屏幕上绘制像素外，浏览器还内置了一个JavaScript引擎。

JavaScript引擎是一个用c++编写的程序，它逐个字符地遍历所有JavaScript代码，并将其转换成计算机CPU能够理解和执行的[机器码](https://en.wikipedia.org/wiki/Machine_code)。

这是同步发生的，即一次一行，并按顺序进行。

他们这样做是因为机器代码很难，而且因为不同CPU制造商的机器代码指令不同。

因此，为开发人员抽象了所有的这些麻烦事儿，否则web开发会变得更加困难，也不会那么流行，更加不会有像medium这样的东西来写这样的文章。

JavaScript引擎可以盲目地遍历JavaScript的每一行，一遍又一遍(请参阅[解释器](https://en.wikipedia.org/wiki/Interpreter_(computing)))，或者它可以变得更聪明，检测经常调用的函数之类的东西，并始终生成相同的结果。

然后它可以将这些编译为机器代码一次，以便下次遇到它时，它运行已经编译的代码，这要快得多(参见[即时编译--JIT(Just-in-time)](https://en.wikipedia.org/wiki/Just-in-time_compilation))。或者，它可以预先将整个代码编译成机器码并执行(参见[编译器](https://en.wikipedia.org/wiki/Compiler))。

[V8](https://github.com/v8/v8)就是这样一个JavaScript引擎，谷歌在2008年开源了它。2009年，一个名叫Ryan Dahl的人有了使用V8创建[Node.js](https://en.wikipedia.org/wiki/Node.js)的想法，Node.js是浏览器之外的JavaScript运行时环境，这意味着该语言也可用于服务器端应用程序。

## 函数执行上下文

与任何其他语言一样，JavaScript对于函数、变量、数据类型以及这些数据类型可以存储的确切值、它们在代码中的可访问位置和不可访问位置等都有自己的规则。

这些规则由一个名为[Ecma International](https://www.ecma-international.org/)的标准组织定义，它们一起构成了语言规范文档(你可以在[这里](https://www.ecma-international.org/publications/standards/Ecma-262.htm)找到最新版本)。

因此，当引擎将JavaScript代码转换为机器码时，需要考虑规范。如果代码包含一个非法赋值，或者它试图访问一个变量(根据语言规范，这个变量不应该从代码的特定部分访问)，该怎么办？

每当调用一个函数时，它都需要把所有这些东西都弄清楚。它通过创建一个称为*执行上下文*的包装器来实现这一点。

为了更具体和避免在以后混淆，我将调用这个*函数执行上下文*，因为每次调用一个函数都会创建一个。不要被这个术语吓倒，现在不要想太多，稍后会详细介绍。

只要记住它决定了一些事情，例如：“在那个特定的函数中可以访问哪些变量，它里面的值是什么，在它里面声明了哪些变量和函数？”

## 全局执行上下文

但是，并不是所有JavaScript代码都包含在函数中(即使大部分都包含在内)。

在全局这层上，任何函数之外都可能有代码要写，因此JavaScript引擎要做的第一件事就是创建一个*全局执行上下文*(*global execution context*)。

这就像一个函数执行上下文，在全局级别上具有相同的目的，但是它有一些特殊之处。

例如，只有一个全局执行上下文(在执行开始时创建)，所有JavaScript代码都在其中运行。

即使没有要执行的代码，全局执行上下文也会创建两个特定于它的东西：

- 一个全局对象。在浏览器里运行的时候，这个对象是`window`。在nodejs里运行，那就是一个`global`。为了简单起见，在这里使用`window`。
- 一个叫做`this`的特殊变量。

在全局执行上下文中，也只有在那里，`this`实际上等于全局对象`window`。它基本上是一个对窗口的引用。

```js
// Global execution context (not inside a function)
this === window // logs true
```

全局执行上下文和函数执行上下文之间的另一个细微差别是，在全局这一层(在任何函数之外)声明的任何变量或函数都自动作为属性附加到`window`对象，并隐式地附加到特殊变量`this`。

尽管函数也有特殊的变量`this`，但这不会在函数执行上下文中发生。

因此，如果我们在全局层声明了一个全局变量`foo`，则以下三个语句实际上都指向它。这同样适用于函数。

```js
foo; // 'bar'
window.foo; // 'bar'
this.foo; // 'bar'
(window.foo === foo && this.foo === foo && window.foo === this.foo) // true
```

所有JavaScript内置变量和函数都附加到全局`window`对象:`setTimeout()`、`localStorage`、`scrollTo()`、`Math`、`fetch()`等。这就是为什么它们可以在代码中的任何地方都可以访问。

# 执行栈

我们知道，每次调用函数时都会创建函数执行上下文。

即使最简单的JavaScript程序也有很多函数调用，所有这些函数执行上下文都需要以某种方式来管理。

看看下面的例子：

```js
function a() {
  // some code
}

function b() {
  // some code
}

a();
b();
```

当遇到函数`a()`的调用时，将按照上面的描述创建函数执行上下文，并执行函数内部的代码。

当代码执行完成时(到达函数的`return`语句或闭合的`}`)，函数`a()`的函数执行上下文将被销毁。

然后，遇到`b()`调用，对函数`b()`重复相同的过程。

但是这种情况很少发生，即使在非常简单的JavaScript程序中也是如此。大多数情况下，会有函数在其他函数中调用：

```js
function a() {
  // some code
  b();
  // some more code
}

function b() {
  // some code
}

a();
```

在本例中，为`a()`创建了一个函数执行上下文，但是就在`a()`执行的中间，遇到了`b()`调用。为`b()`创建了一个全新的函数执行上下文，但不会破坏`A()`的执行上下文，因为它的代码没有完全的执行。

这意味着同时有许多函数执行上下文。然而，在任何给定的时间内，实际上只有一个在运行。

要跟踪当前运行的函数，需要使用堆栈，其中当前运行的函数执行上下文位于堆栈的顶部。

一旦完成执行，它将从堆栈中弹出，下一个执行上下文的执行将恢复，依此类推，直到执行堆栈为空。

这个堆栈称为执行堆栈，如下图所示：

![img](https://miro.medium.com/max/1400/1*VBlFoXDlOXi5JBs_9ocjow.png)

当执行堆栈为空时，我们之前讨论过并且永远不会被销毁的全局执行上下文成为当前正在运行的执行上下文。

> 译：调用栈清空了就是清空了，不存在什么全局执行上下文。我猜想本文作者是想说执行栈的函数部分被清空吧。

## 事件队列(Event Queue)

还记得当我说JavaScript引擎只是浏览器的一个组件，还有渲染引擎或网络层吗？

这些组件有内置的钩子，引擎使用钩子与之通信来发起网络请求、在屏幕上绘制像素或侦听鼠标单击。

当你使用像JavaScript中的fetch这样的东西来做一个HTTP请求时，引擎实际上会将它传递给网络层。每当请求的响应出现时，网络层将把它传递回JavaScript引擎。

但是这可能需要几秒钟的时间，JavaScript引擎在请求处理过程中会做什么？

只需停止执行任何代码，直到响应到来？ 继续执行其余代码，并且每当响应到来时，停止所有代码并执行其回调？ 当回调结束时，从中断处继续执行？

以上都不是，即使第一个可以通过使用[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)来实现。

在多线程语言中，这可以通过让一个线程在当前运行的执行上下文中执行代码，另一个用于执行事件的回调。但是这在JavaScript中是不可能的，因为它是单线程的。

为了理解这实际上是如何工作的，让我们考虑一下前面介绍的`a()`和`b()`函数，但是要添加一个单击处理程序和一个HTTP请求处理程序。

```js
function a() {
  // some code
  b();
  // some more code
}

function b() {
  // some code
}

function httpHandler() {
  // some code here
}

function clickHandler() {
  // some more code here
}

a();
```

JavaScript引擎从浏览器的其他组件接收到的任何事件，例如鼠标单击或网络响应，都不会立即处理。

此时JavaScript引擎可能正忙于执行代码，因此它将把事件放入名为*事件队列*(event queue)的队列中。

![img](https://miro.medium.com/max/1400/1*nk_77fgBqv8FL485rWvzHg.png)

我们已经讨论了执行堆栈，以及当前运行的函数执行上下文如何在相应函数中的代码执行完成后从堆栈中弹出。

然后，下一个执行上下文恢复执行直到完成，依此类推，直到堆栈为空，并且全局执行上下文成为当前正在运行的执行上下文。

虽然有代码要在执行堆栈上执行，但是由于引擎正忙于在堆栈上执行代码，事件队列中的事件将被忽略。

只有当它完成并且执行堆栈为空时，JavaScript引擎才会处理事件队列中的下一个事件(当然，如果有的话)，并调用它的处理程序。

由于这个处理程序是一个JavaScript函数，它将像处理`a()`和`b()`一样处理，这意味着创建一个函数执行上下文并将其推入执行堆栈。

如果该处理程序反过来调用另一个函数，则创建另一个函数执行上下文并将其推送到堆栈顶部，依此类推。

只有当执行堆栈再次为空时，JavaScript引擎才会再次检查事件队列以获取新事件。

键盘和鼠标事件也是如此。当鼠标被单击时，JavaScript引擎将获得一个单击事件，并将其放入事件队列中，只有在执行堆栈为空时才执行其处理程序。

通过将以下代码复制粘贴到浏览器控制台，可以很容易地看到这一点：

```js
function documentClickHandler() {
  console.log('CLICK!!!');
}

document.addEventListener('click', documentClickHandler);

function a() {
  const fiveSecondsLater = new Date().getTime() + 5000;
  while (new Date().getTime() < fiveSecondsLater) {}
}

a();
```

`while`循环只是保持引擎忙碌五秒钟，不要太担心。在这五秒钟内开始单击文档上的任何位置，你将看到没有记录到控制台。

当五秒钟过去，执行堆栈为空时，将调用第一次单击的处理程序。

由于这是一个函数，因此将创建一个函数执行上下文，并将其推入堆栈中执行，然后从堆栈中弹出。然后，调用第二次单击的处理程序，以此类推。

实际上，`setTimeout()`(和`setInterval()`)也是如此。提供给`setTimeout()`的处理程序实际上位于事件队列中。

这意味着，如果将超时设置为`0`但是要在执行堆栈上执行代码，则只有在堆栈为空时才会调用`setTimeout()`的处理程序，这可能是几毫秒之后。

这就是`setTimeout()`和`setInterval()`不够精确的原因之一。如果你不相信我的话，把下一个要点复制粘贴到你的浏览器控制台。

```js
setTimeout(() => {
  console.log('TIMEOUT HANDLER!!!');
}, 0);

const fiveSecondsLater = new Date().getTime() + 5000;
while (new Date().getTime() < fiveSecondsLater) {}
```

注意:放置在事件队列中的代码称为异步代码。这或许不是一个好的术语在不同的主题，但人们是这么叫它的，所以我想你必须习惯它。

## 函数执行上下文步骤

现在，我们已经熟悉了JavaScript程序的执行生命周期，让我们更深入地了解函数执行上下文是如何创建的。

它分为两个步骤:创建步骤和执行步骤。

创建步骤设置代码以便执行，而执行步骤实际执行代码。

在创建步骤中发生了两件非常重要的事情：

- 作用域被确定
- `this`被确定(我假设你已经熟悉JavaScript中的`this`关键字)。

下面两个相应的部分将详细介绍其中的每一个。

### 作用域和作用域链

作用域由在给定函数中可访问的变量和函数组成，即使它们没有在函数本身中声明。

JavaScript具有*词法作用域*(*lexical scope*)，这意味着范围是根据代码中函数声明的位置确定的。

```js
function a() {
  function b() {
    console.log(foo); // logs 'bar'
  }

  var foo = 'bar';
  b();
}

a();
```

当到达上面的`console.log(foo)`时，JavaScript引擎将首先检查`b()`的执行上下文作用域中是否有变量`foo`。

因为没有声明，所以它将转到父执行上下文，也就是`a()`的执行上下文，因为`b()`是在`a()`中声明的。在这个执行上下文的作用域中，它找到`foo`并打印它的值。

如果像下面这样：

```js
function a() {
  var foo = 'bar';
  b();
}

function b() {
  console.log(foo); // throws ReferenceError: foo is not defined
}

a();
```

将抛出`ReferenceError`，尽管两者之间的惟一区别是声明`b()`的位置不同。

`b()`的“父”作用域现在是全局执行上下文的作用域，因为它在任何函数之外的全局级别声明，并且没有变量`foo`。

我能理解为什么这可能令人困惑，因为如果你看一下执行堆栈，它看起来是这样的：

![img](https://miro.medium.com/max/1400/1*VBlFoXDlOXi5JBs_9ocjow.png)

在第一个例子中，`a()`的执行上下文实际上是`b()`的父执行上下文。不是因为`a()`恰好是执行堆栈中的下一项，就在`b()`的下面，而是因为`b()`是在`a()`中声明的。

第二个例子中，执行堆栈看起来是一样的，但是这次`b()`的父执行上下文是全局执行上下文，因为`b()`是在全局级别声明的。

只要记住:在哪里调用函数并不重要，重要的是在哪里声明函数。

但是，如果它也不能在父执行上下文的作用域内找到变量，又会发生什么呢？

在本例中，它将尝试在下一个父执行上下文的作用域中找到它，该作用域是用完全相同的方法确定的。

如果它也不存在，它将尝试下一个，以此类推，直到最终到达全局执行上下文作用域。如果它也不能在那里找到它，它将抛出`ReferenceError`。

这称为*作用域链*(*scope chain*)，在下面的示例中正是这样：

```js
unction a() {
  function b() {
    function c() {
      console.log(foo);
    }
    
    c();
  }
  
  var foo = 'bar';
  b();
}

a();
```

它首先尝试在`c()`的执行上下文作用域中查找`foo`，然后是`b() `，最后是`a() `，并在其中查找`foo`。

注意：请记住，它只是从`c()`到`b()`到`a()`，因为它们在另一个内部声明，而不是因为它们的相应执行上下文在执行堆栈中位于另一个上面。

如果它们不被声明在另一个内部，那么父执行上下文将是不同的，如上所述。

但是，如果`c()`或`b()`中有另一个变量`foo`，那么它的值就会被记录到控制台，因为引擎一旦找到这个变量，就会停止查找父执行上下文。

同样的方法也适用于函数，而不仅仅是变量，同样的方法也适用于全局变量，如上面的`console`本身。

它将向下(或向上，取决于你如何看待它)作用域链，寻找一个名为`console`的变量，并最终在全局执行上下文中找到它，附加到`window`对象。

注意：尽管我在上面的示例中仅使用了函数声明语法，但作用域和作用域链对于ES2015（也称为ES6）中引入的[箭头函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)的工作方式完全相同。

## 闭包

闭包提供从内部函数访问外部函数的作用域。

但是，这并不是什么新东西，我刚在上面描述了如何通过作用域链实现它。

闭包的特别之处在于，即使外部函数的代码被执行，其执行上下文从执行堆栈中弹出并被销毁，内部函数仍然会引用外部函数的作用域。

```js
function a() {
  var name = 'John Doe';
  
  function b() {
    return name;
  }

  return b;
}

var c = a();

c();
```

这正是上面例子中所发生的。`b()`在`a()`中声明，因此它可以通过作用域链从`a()`的作用域访问`name`变量。

但它不仅可以访问它，还创建了一个闭包，这意味着即使在父函数`a()`返回之后，它也可以访问它。

变量`c`只是对内部函数`b()`的引用，因此代码的最后一行实际上调用了内部函数`b()`。

即使这发生在`b()`的外部函数`a()`返回后很久，内部函数`b()`仍然可以访问父函数作用域。

[Eric Elliott](https://medium.com/u/c359511de780?source=post_page-----1706b9b66c4d----------------------)在[这篇](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-closure-b2f0d2152b36)关于Medium的文章中介绍了如何使用闭包。

## this值

在执行上下文创建的步骤中确定的下一件事就是`this`值。

恐怕这没有作用域那么直接，因为函数内部的`this`值取决于函数是如何调用的。更复杂的是，可以"重写"默认行为。

我将尽量保持解释的更简单且get到点，你也可以在[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)上找到关于这个主题的更详细的文章。

首先，它取决于函数是否使用函数声明来声明的：

```js
function a() {
  // ...
}
```

或一个箭头函数：

```js
const a = () => {
  // ...
};
```

正如上面提到的，对于这两种方法，作用域的确定是完全相同的，但是它的值并不相同。

### 箭头函数

我从简单的开始。在箭头函数的情况下，`this`值是词法的，所以它的确定方式与作用域的确定方式类似。

“父”执行上下文的确定与*作用域和作用域链*部分中的解释完全相同，具体取决于声明箭头函数的位置。`this`值将与父执行上下文中的`this`值相同，在父执行上下文中，将按照本节的描述确定它。

我们可以在下面的两个例子中看到这一点。

第一个将打印为`true`，而第二个打印为`false`，即使在两种情况下都在同一位置调用`myArrowFunction`。两者之间唯一的区别是在声明箭头函数`myArrowFunction`的地方。

```js
const myArrowFunction = () => {
  console.log(this === window);
};

class MyClass {
  constructor() {
    myArrowFunction();
  }
}

var myClassInstance = new MyClass();
```

```js
class MyClass {
  constructor() {
    const myArrowFunction = () => {
      console.log(this === window);
    };
    myArrowFunction();
  }
}

var myClassInstance = new MyClass();
```

由于`myArrowFunction`内部的`this`值是词法的，因此它将是第一个示例中的`window`，因为它在任何函数或类之外的全局级别声明。在第二个例子中，`myArrowFunction`中`this`值将是这个函数中包装它的函数的`this`值。

我将在本节的后面讨论这个值到底是什么，但是现在，只需注意到它不是`window`。

记住：对于箭头函数，它的值是根据声明箭头函数的位置而不是在何处或如何调用它来确定的。

### 函数声明

在这种情况下，事情就不那么简单了，这正是为什么箭头函数被引入到ES2015中的原因(或者至少是其中之一)，但请耐心听我说，几段后，它就会变得有意义。

除了箭头函数(`const a = () => { … }`)和函数声明(`function a() { … }`)在语法上的区别之外，两者之间的主要区别是函数内部的`this`值。

与箭头函数不同，函数声明的`this`值不是根据声明函数的位置在词法上确定的。

它是根据调用函数的方式确定的。有几种方法可以调用函数：

- 简单的调用：`myFunction()`
- 对象方法调用：`myObject.myFunction()`
- 构造函数调用：`new myFunction()`
- DOM事件处理器的调用：`document.addEventListener(‘click’, myFunction)`

对于每一种调用类型，`myFunction()`内部的`this`值都是不同的，与`myFunction()`声明的位置无关，所以让我们逐个检查一下，看看它是如何工作的。

#### 简单的调用

```js
function myFunction() {
  return this === window; // true
}

myFunction();
```

简单调用就是简单地调用一个类似上面例子的函数：仅函数名，前面没有任何的字符，后面跟着`()`(当然，里面可以有任何可选参数)。

在简单调用的情况下，函数中`this`的值始终是全局`this`，而全局`this`又指向全局`window`对象，如上面的一节所述。

就是这样。但是请记住，这仅适用于简单的调用；函数名后跟`()`，前面没有字符。

注意：因为在一个简单的函数调用中它的值实际上是对全局`window`对象的引用，所以使用这个内部函数被认为是不好的实践。

这是因为函数内部附加到`this`的任何属性实际上都附加到`window`对象并成为全局变量，这是不好的做法。

这就是为什么在[严格模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)下，`this`值在任何由简单调用调用的函数中都是`undefined`，上面的示例将输出`false`。

#### 对象方法调用

```js
const myObject = {
  myMethod: function() {
    return this === myObject; // true
  }
};

myObject.myMethod();
```

当一个对象的属性有一个函数作为它的值时，它被认为是该对象的方法，因此称为*方法调用*。

当使用这种类型的调用时，函数内部的`this`值将简单地指向调用方法的对象，即上面示例中的`myObject`。

注意：如果使用了箭头函数语法，而不是上面示例中的函数声明，则该箭头函数内部的值将是全局`window`对象。

这是因为它的父执行上下文是全局执行上下文。它在对象中声明的事实不会改变任何东西。

#### 构造函数调用

可以调用函数的另一种方法是在调用之前使用`new`关键字，如下例所示。

当以这种方式调用时，该函数将返回一个新对象（即使它没有`return`语句），并且该函数内部的`this`值将指向新创建的对象。

这个解释稍微简化了一些(更多的解释在[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new))，但重点是它将创建(或*构造(construct)*，因此是*构造函数*(*constructor*))并返回一个对象，该对象将指向函数内部的`this`对象。

```js
function MyConstructorFunction() {
  this.a = 1;
}

const myObject = new MyConstructorFunction(); // a new object is created

// inside MyConstructorFunction(), "this" points to the newly created onject,
// so it should have a property  "a".
myObject.a; // 1
```

注意：在`class`上使用`new`关键字时也是如此，因为类实际上是特殊的函数，只有很小的差别。

注意:箭头函数不能用作构造函数。

#### DOM事件处理器调用

```js
document.addEventListener('click', DOMElementHandler);

function DOMElementHandler() {
  console.log(this === document); // true
}
```

当作为DOM事件处理程序调用时，函数内部的`this`值将是放置事件的DOM元素。

注意：请注意，在所有其他类型的调用中，我们自己调用该函数。

然而，在事件处理程序的情况下，我们没有，我们只传递对处理程序函数的引用。JavaScript引擎调用该函数，我们无法控制它将如何执行。

#### 自定义`this`值的调用

通过使用`bind()`、`call()`或`apply()`从`Function.prototype`调用自定义值，可以显式地将函数内部的`this`值设置为自定义值。

```js
const obj = {};

function a(param1, param2) {
	return [this === window, this === obj, param1, param2];
}

a.call(obj, 1, 2); // [false, true, 1, 2]
a.apply(obj, [3, 4]); // [false, true, 3, 4]
a.bind(obj)(5, 6);  // [false, true, 5, 6]
a(7, 8);   // [true, false, 7, 8]
```

上面的示例展示了这些方法的工作原理。

`call()`和`apply`非常相似，唯一的区别是使用`apply()`，函数的参数作为数组传递。

尽管`call()`和`apply()`实际调用函数时将`this`值设置为作为第一个参数传入的值，但是`bind()`不会调用函数。

相反，它返回一个新函数，与使用`bind()`的函数完全相同，但是这个函数的`this`值被设置为你传递给`bind()`的任何参数(第一个参数)。

这就是为什么在`a.bind(obj)`之后会看到`(5,6)`实际调用`bind()`返回的函数。

在`bind()`的情况下，返回函数中`this`值将永久绑定到作为这个值传递的任何内容(因此名为`bind()`)。

> 译注：如果有多个bind，将以第一次bind的为主。后续的bind无法改变上下文。

无论使用哪种类型的调用，返回函数中的`this`值总是有个值。只能用`call()`、`bind()`或`apply()`再次修改它。

上面这段话几乎完全正确。当然，规则必须有一个特例，这个特例就是构造函数调用。

以这种方式调用函数时，通过在调用前放置`new`关键字，函数内部的`this`关键字的值将始终是调用返回的对象，即使`new`的函数被赋予另一个带有`bind()`的`this`。

可以通过下面来发现这一点：

```js
function a() {
  this.three = 'three';
  console.log(this);
}

const customThisOne = { one: 'one' };
const customThisTwo = { two: 'two' };

const bound = a.bind(customThisOne); // returns a new function with the value of this bound to customThisOne
bound(); // logs customThisOne
bound.call(customThisTwo); // logs customThisOne, even though customThisTwo was passed to .call()
bound.apply(customThisTwo); // same as above
new bound(); // logs the object returned by the new invocation, bypassing the .bind(customThisOne)
```

下面是一个示例，演示如何使用`bind()`控制我们前面讨论的click事件处理程序的`this`值:

```js
const myCustomThis = {};
document.addEventListener('click', DOMElementHandler.bind(myCustomThis));

function DOMElementHandler() {
  console.log(this === document); // false (used to be true before bind() was used)
  console.log(this === myCustomThis); // true
}
```

注意：`bind()`、`call()`和`apply()`不能用于将自定义的`this`值传递给箭头函数。

#### 箭头函数的注意事项

现在，你可以看到这些函数声明的规则，尽管相当简单，但是由于所有的特殊情况，会导致混淆，并且成为bug的来源。

一个函数调用方式的小小改变将会改变它内部的`this`值。这可能导致整个连锁反应，这就是为什么了解这些规则以及它们如何影响你的代码很重要。

这就是为JavaScript编写规范的人员提出箭头函数的原因，其中箭头函数的值总是词法化的，并且每次都是完全相同的，无论如何调用它们。

![image-20190916153402616](/Users/xiaohesong/Library/Application Support/typora-user-images/image-20190916153402616.png)



>  译注：额，注意事项就那么点麽？

## Hoisting

我在前面提到过，当调用一个函数时，JavaScript引擎将首先遍历代码，找出它的作用域和`this`值，并标识函数体中声明的变量和函数。

在第一步(创建步骤)中，这些变量将获得一个`undefined`的特殊值，而不管在代码中为它们分配了什么实际值。只有在第二步(执行步骤)中才会为它们分配实际值，并且只有在到达赋值行时才会这样做。

这就是为什么下面的JavaScript代码将打印`undefined`：

```js
console.log(a); // undefined

var a = 1;
```

然后，在执行步骤中，到达输出`a`的地方，`undefined`被输出，这就是在前面步骤中`a`被设置的值。

当到达`a`的值为`1`时，`a`的值将更改为`1`，但`undefined`的值已记录到控制台。

这种效果称为*提升*，就好像所有的变量声明都被提升到代码的顶部。正如你所看到的，这并不是真正发生了什么，但这是用来描述它的术语。

注意:箭头函数也会发生这种情况，但函数声明不会。

> 译注：这里说的不严谨，原文作者想说的是`var`这种情况。

在创建步骤中，没有为函数分配`undefined`的特殊值，而是将函数的整个主体放入内存。这就是为什么一个函数在声明之前就可以调用，就像下面的例子中所示，而且它会工作：

```js
a();

function a() {
  alert("It's me!");
}
```

注意:当试图访问一个完全没有定义的变量时，抛出`ReferenceError: x is not defined`。所以，"undefined"和"not defined"之间是有区别的，这可能有点让人困惑。

## 总结

我记得读过一些关于提升、作用域、闭包等的文章，当我读这些文章时，它们都是有意义的，但是我总是会遇到一些我无法解释的奇怪的JavaScript行为。

问题在于我总是单独阅读每个概念，一次一个。

所以我尝试了解大局，比如JavaScript引擎本身。 如何创建执行上下文并将其推送到执行堆栈，事件队列如何工作，如何确定此范围和范围等。

之后其他所有事情都有意义。 我之前开始发现潜在的问题，更快地发现了bug的来源，并且对我的编码更加自信。

我希望这篇文章能为你做同样的事情！

> 译注：译者个人总结，这里只是大致的说了下对应的技术，如果真的要理解，可以按照每个标题去搜索。

## 引用

- [Programming JavaScript Applications](https://www.amazon.com/Programming-JavaScript-Applications-Architecture-Libraries/dp/1491950293)
- [JavaScript: Understanding the Weird Parts](https://www.udemy.com/understand-javascript/) (first three and a half hours for free [here](https://www.youtube.com/watch?v=Bv_5Zv5c-Ts))
- [You don’t know JS](https://github.com/getify/You-Dont-Know-JS)

本文原文：[How JavaScript Works](https://medium.com/better-programming/how-javascript-works-1706b9b66c4d)
