原文： [Identifier Resolution and Closures in the JavaScript Scope Chain](http://davidshariff.com/blog/javascript-scope-chain-and-closures/#first-article)

从我[之前](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87.md)的文章中，我们现在知道每个函数都有一个关联的[`execution context`](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87.md#%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87)(执行上下文)，其中包含一个[variable object [VO]](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87.md#activation--variable-object-aovo)(变量对象[VO])，它由给定的本地函数内部定义的所有变量，函数和参数组成。

每个`execution context` 的`scope chain`(作用域链)属性只是当前`context's`(上下文)的`[VO]` +所有父级的词法作用域`[VO]`的集合。

```
Scope = VO + All Parent VOs
Eg: scopeChain = [ [VO] + [VO1] + [VO2] + [VO n+1] ];
```

## 确定作用域链的变量对象[VO]

我们现在知道`scope chain`中的第一个`[VO]`是属于当前`execution context`，并且我们可以通过查看父上下文的`scope chain`来找到剩余的父级的`[VO]`：

```js
function one() {

    two();

    function two() {

        three();

        function three() {
            alert('I am at function three');
        }

    }

}

one();
```

这个例子很简单，从全局上下文开始调用`one()`，`one()`调用`two()`，然后调用`three()`，从而在函数three中进行`alert`。

![img](http://davidshariff.com/blog/wp-content/uploads/2012/06/stack14.jpg)

上面的图像显示了在`alert('I am at function three')`触发时函数`three`的调用堆栈。我们可以看到此时的作用域链(`scope chain`)如下所示：

```
three() Scope Chain = [ [three() VO] + [two() VO] + [one() VO] + [Global VO] ];
```

## 词法作用域

要注意的JavaScript的一个重要特性是，解释器使用`Lexical Scoping`(词法作用域)，而不是[动态作用域](http://en.wikipedia.org/wiki/Scope_(computer_science)#Dynamic_scoping)( `Dynamic Scoping`)。这只是一种复杂的方式，表示所有内部函数，静态(词法)绑定到父级上下文，其中内部函数在程序代码中被物理定义。

在上面的上一个例子中，调用内部函数的顺序无关紧要。`three()`将始终被静态绑定到`two()`，而`two()`被绑定到`one()`，依此类推。这给出了链的效果，其中所有内部函数都可以通过静态绑定的作用域链(`Scope Chain`)访问外部函数的`VO`。

这个词法作用域(`lexical scope`)是许多开发人员混淆的根源。我们知道每次调用函数都会创建一个新的执行上下文(`execution context`)和相关的`VO`，它保存在当前上下文中计算的变量值。

正是这种对`VO`的动态的运行时评估与每个上下文的词法(静态)定义的作用域相结合，导致程序行为出现意外结果。来看看下面经典的用例：

```js
var myAlerts = [];

for (var i = 0; i < 5; i++) {
    myAlerts.push(
        function inner() {
            alert(i);
        }
    );
}

myAlerts[0](); // 5
myAlerts[1](); // 5
myAlerts[2](); // 5
myAlerts[3](); // 5
myAlerts[4](); // 5
```

乍一看，JavaScript新手会假定`alert(i);`为函数在源代码中物理定义的每个增量上的`i`值，分别alert 1、2、3、4和5。

这是最常见的混淆点。函数`inner`是在全局上下文中创建的，因此其作用域链静态地绑定到全局上下文。

第11~15行调用`inner()`，它在`inner.ScopeChain`中查找解析`i`，它(`i`)位于全局(`global`)上下文中。在每次调用时，`i`已经被增加到5，每次调用`inner()`时都会得到相同的结果。静态绑定的作用域链，持有的`[VOs]`包含了来自每个上下文(`context`)所包含的变量，通常会让开发人员感到意外。

## 解析变量的值

以下示例alert变量`a`，`b`和`c`的值，它给出的结果是6。

```js
function one() {

    var a = 1;
    two();

    function two() {

        var b = 2;
        three();

        function three() {

            var c = 3;
            alert(a + b + c); // 6

        }

    }

}

one();
```

第14行很有趣，乍一看似乎`a`和`b`不是在函数three "内"，所以这段代码怎么还能运行？要理解解释器如何评估此代码，我们需要在执行第14行时查看函数three的作用域链：

![img](http://davidshariff.com/blog/wp-content/uploads/2012/06/scopechain1.png)

当解释器执行第14行时：`alert(a + b + c)`，它首先解析`a`，通过查看作用域链并检查第一个变量对象`three's [VO]`。它检查`three's [VO]`中是否存在`a`，但是没有找到任何具有该名称的属性，因此继续检查下一个`[VO]`。

解释器不断地按顺序检查每个`[VO]`是否存在变量名，在这种情况下，值将返回到原始评估的代码，或者如果没有找到，程序将抛出`ReferenceError`。因此，给定上面的示例，你可以看到给定的函数three的作用域链，`a`，`b`和`c`都是可解析的。

## 这如何与闭包一起使用？

在JavaScript中，闭包通常被视为某种神奇的独角兽，只有高级开发人员才能真正理解它，但说实话，它只是对作用域链的简单理解。闭包，正如[Crockford](http://javascript.crockford.com/private.html)所言，很简单:

> 即使外部函数返回后，内部函数也始终可以访问其外部函数的变量和参数...

下面的代码是一个闭包的例子：

```javascript
function foo() {
    var a = 'private variable';
    return function bar() {
        alert(a);
    }
}

var callAlert = foo();

callAlert(); // private variable
```

全局上下文(`global context`)有一个名为`foo()`的函数和一个名为`callAlert`的变量，它(`callAlert`)持有`foo()`的返回值。开发人员常常感到惊讶和困惑的是，即使在`foo()`完成执行后，私有变量`a`仍然可用。

但是，如果我们详细查看每个上下文，我们将看到以下内容：

```js
// Global Context when evaluated
global.VO = {
    foo: pointer to foo(),
    callAlert: returned value of global.VO.foo
    scopeChain: [global.VO]
}

// Foo Context when evaluated
foo.VO = {
    bar: pointer to bar(),
    a: 'private variable',
    scopeChain: [foo.VO, global.VO]
}

// Bar Context when evaluated
bar.VO = {
    scopeChain: [bar.VO, foo.VO, global.VO]
}
```

现在我们可以看到，通过调用`callAlert()`，我们得到了函数`foo()`，它的返回指向`bar()`。(笔：原文是那么说的，觉得可能是笔误，应该是调用`callAlert`，得到....)。在`bar()`里，`bar.VO.scopeChain`就是`[bar.VO, foo.VO, global.VO]`。

通过alerting `a`，解释器检查`bar.VO.scopeChain`中的第一个`VO`，查找名为`a`的属性但找不到匹配项，因此立即转到下一个VO，`foo.VO`。

它检查属性是否存在，这一次找到匹配项，将值返回到`bar`上下文，这就解释了为什么`alert`会给我们`'private variable'`，即使`foo()`在某个时候已经执行完毕。

至此，我们已经讨论了作用域链(`scope chain`)及其词法(`lexical`)环境的细节，以及闭包(`closures`)和变量解析(`variable resolution`)是如何工作的。本文的其余部分将讨论与上述内容相关的一些有趣的情况。

## 等等，原型链如何影响变量解析？

JavaScript本质上是基于[原型](http://davidshariff.com/blog/javascript-inheritance-patterns/)的，除了`null`和`undefined`之外，语言中的几乎所有东西都是`object`。当试图访问`object`上的属性时，解释器将尝试通过查找`object`中属性是否存在来解决它。如果它找不到属性，它将继续查找[原型链](http://davidshariff.com/blog/javascript-inheritance-patterns/)，这是一个对象的继承链，直到它找到属性，或遍历到链的末尾。

这导致了一个有趣的问题，解释器是否首先使用作用域链或原型链解析对象属性？它使用两者。尝试解析属性或标识符时，将首先使用作用域链来定位`object`。找到`object`后，将遍历该`object`的原型链(`prototype chain`)，查找属性名称。我们来看一个例子：

```js
var bar = {};

function foo() {

    bar.a = 'Set from foo()';

    return function inner() {
        alert(bar.a);
    }

}

foo()(); // 'Set from foo()'
```

第5行在全局对象`bar`上创建属性`a`，并将其值设置为`'Set from foo()'`。解释器查找作用域链(`scope chain`)，并按预期在全局上下文(`global context`)中查找到`bar.a`。现在，让我们考虑以下内容：

```js
var bar = {};

function foo() {

    Object.prototype.a = 'Set from prototype';

    return function inner() {
        alert(bar.a);
    }

}

foo()(); // 'Set from prototype()'
```

在运行时，我们调用了`inner()`，他尝试在现有的`bar`的作用域链上去解析`bar.a`。他在全局上下文中查找`bar`，并继续在`bar`上搜索一个名为`a`的属性。但是，`a`从未在`bar`上设置，因此解释器遍历对象的原型链并发现在`Object.prototype`上设置了`a`。

正是这种行为解释了标识符的解析; 在作用域链(`scope`)中找到(定位)`object`，然后继续向对象的原型链(`prototype chain`)查找，直到找到属性，或返回`undefined`。

## 什么时候使用闭包？

闭包是一个强大的JavaScript概念，使用它们的一些最常见的情况是：

#### 封装

允许我们在对外暴露受控的公共接口的同时，从外部作用域隐藏上下文的实现细节。这通常被称为[模块模式](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)或[揭示模块模式](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript)。(译: 你应该能在这里找到好的学习资源)

#### 回调

也许闭包最强大的用途之一就是回调。JavaScript在浏览器中通常运行在一个单线程事件循环中，在一个事件完成之前阻止其他事件的启动。回调允许我们以非阻塞的方式延迟函数的调用，通常是对事件完成的响应。这方面的一个例子是，当对服务器进行AJAX调用时，使用回调来处理响应，同时仍然维护创建它的绑定。

#### 闭包作为参数

我们还可以将闭包作为参数传递给函数，这是为复杂代码创建更优雅解决方案的强大功能范例。以最小排序函数为例。通过传递闭包作为参数，我们可以为不同类型的数据排序定义实现，同时仍然重用单个函数体。

## 什么时候不使用闭包？

虽然闭包很强大，但由于某些性能问题，应该谨慎使用它们：

#### 很大的作用域长度

多个嵌套函数是你可能会遇到一些性能问题的典型标志。请记住，每次需要评估变量时，必须遍历作用域链以查找标识符，因此不言而喻，变量定义的链越往下，查找时间越长。

## 垃圾回收

JavaScript是一种垃圾回收(`garbage collected`)的语言，这意味着与低级编程语言不同，开发人员通常不必担心内存管理。但是，这种自动垃圾收集通常会导致开发人员应用程序遭受性能不佳和内存泄漏的困扰。

不同的JavaScript引擎实现垃圾回收的方式略有不同，因为ECMAScript没有定义应该如何处理实现，但是在尝试创建高性能、无泄漏的JavaScript代码时，可以跨引擎应用相同的原理。一般来说，当对象不能被程序中运行的任何其他活动对象引用或无法访问时，垃圾收集器将尝试释放对象的内存。

### 循环引用

这就引出了闭包，以及程序中循环引用的可能性，循环引用是一个术语，用来描述一个对象引用另一个对象，而该对象又指向第一个对象的情况。闭包特别容易发生泄漏，请记住，即使在父级执行完并返回之后，内部函数也可以引用在作用域链上进一步定义的变量。大多数JavaScript引擎都能很好地处理这些情况(该死的IE)，但在进行开发时仍然值得注意和考虑。

对于旧版本的IE，引用DOM元素通常会导致内存泄漏。为什么？在IE中，JavaScript(JScript？)引擎和DOM都有自己独立的垃圾收集器。因此，当从JavaScript引用DOM元素时，原生收集器将其传递给DOM，而DOM收集器将指向原生的，从而导致两个收集器都不知道循环引用。

## 总结

从过去几年与许多开发人员合作，我经常发现作用域链(`scope chain`)和闭包(`closures`)的概念是已知的，但还没有真正详细地理解。我希望这篇文章能够帮助你从了解基本概念，到更加详细和深入地理解。

接下来，你应该掌握在编写JavaScript时确定变量的解析在任何情况下如何工作所需的所有知识。Happy coding !
