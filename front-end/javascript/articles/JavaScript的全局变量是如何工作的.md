在这篇博客文章中，我们将研究JavaScript的全局变量是如何工作的。一些有趣的现象是: 脚本的作用域、所谓的*全局对象* 等等。

## 作用域

变量的*词法作用域*(*lexical scope*)(简称:*作用域*(scope))是程序中可以访问它的区域。JavaScript的作用域是*静态*的（它们在运行时不会改变）并且它们可以嵌套 - 例如：

```js
function func() { // (A)
  const foo = 1;
  if (true) { // (B)
    const bar = 2;
  }
}
```

`if`语句(B行)引入的作用域嵌套在函数`func()`(A行)的作用域内。

在这里例子里，`func`就是`if`的外部作用域。

## 词法环境

在JavaScript的语言规范中，作用域是通过*词法环境*来"实现"的。它们由两部分组成：

- 将变量名映射到变量值的*环境记录*(联想字典)。这是JavaScript存储变量的地方。环境记录的键值对入口被叫做*绑定*(*binding*)。
- 对*外部环境*的引用——表示当前环境所代表作用域的外部作用域的环境。

因此，嵌套作用域树由一个嵌套环境树表示，该树由外部引用链接。

## 全局对象

全局对象是一个对象，他的属性是全局变量。等下就会介绍他是怎么去和环境树相适应。它们有几个不同的名称：

- 任意地方(提案功能): `globalThis`
- 全局对象的其他名称取决于平台和语言结构:
  - window：是引用全局对象的经典方式。但它只在普通浏览器代码中工作;不存在Node.js中，也不存在*Web Workers*中(与普通浏览器代码并发运行的进程)。
  - self：浏览器的任何地方都是可用的，包括Web Workers。但是Node.js中不支持。
  - global：只在Node.js中被支持。

全局对象包含所有内置的全局变量。

## 全局环境

全局作用域是“最外层的”作用域——它没有外部作用域。它的环境是全局环境。每个环境都通过由外部引用链接的环境链与全局环境联系。全局环境的外部引用是`null`。

全局环境结合了两个环境记录：

- 一个*对象环境记录* 的作用就像一个普通的环境记录，但会保持他的绑定和对象同步。在这种情况下，对象是全局对象。
- 一个普通的(*声明性的*)环境记录。

下图显示了这些数据结构。过一会就会解释*脚本作用域*和*模块环境*。

![img](https://2ality.com/2019/07/global-scope/global-scope.svg)

接下来的两个小节将解释对象记录和声明性记录是如何组合的。

### 创建变量

为了创建一个真正意义上的全局变量，你必须在全局作用域中 -- 只有一种情况，那就是在脚本的顶级。

- 顶级`const`，`let`和`class`在声明性记录中创建绑定。
- 顶级`var`和`function`声明在对象记录中创建绑定。

```html
<script>
  const one = 1;
  var two = 2;
</script>
<script>
  // 所有脚本共享相同的顶级作用域：
  console.log(one); // 1
  console.log(two); // 2
  
  // 并非所有声明都创建全局对象的属性：
  console.log(window.one); // undefined
  console.log(window.two); // 2
</script>
```

此外，全局对象包含所有内置的全局变量，并通过对象记录将它们贡献给全局环境。

### 获取或设置变量

当我们获取或者设置一个变量，并且两个的环境记录(对象记录和声明记录)都有对变量的绑定，然后声明性记录会具有优势：

```html
<script>
  let foo = 1; // 声明性的环境记录
  globalThis.foo = 2; // 对象环境记录

  console.log(foo); // 1 (声明性的环境记录具有优势)
  console.log(globalThis.foo); // 2
</script>
```

## 模块环境

每个模块有属于他自己的环境。他存储所有的顶级声明，也包含导入(import)。模块环境的外部环境是全局环境。

## 为什么JavaScript既有正常的全局变量又有全局对象？

全局对象通常会被认为是一个错误。因此，较新的构造(如const、let和class)创建正常的全局变量(在脚本作用域中)。

值得庆幸的是，大多数用现代JavaScript编写的代码都存在于[ECMAScript模块和CommonJS模块](https://exploringjs.com/impatient-js/ch_modules.html)中。每个模块都有自己的作用域，这就是为什么控制全局变量的规则很少对基于模块的代码有影响。

## 进一步阅读

- ECMAScript规范中的[“词法环境”](https://tc39.es/ecma262/#sec-lexical-environments)提供了对环境的总体概述。
- [“全局环境记录”](https://tc39.es/ecma262/#sec-global-environment-records)涵盖了全局环境。

## 总结

译者个人总结

环境记录包含了对象环境记录(object record)和声明性环境记录(declarative record)。

`let`,`const`, `class`的这些声明都是在声明性记录(declarative record)中创建的绑定,

`var`,`function`这种声明都是在对象记录(object record)中创建的绑定。

全局对象之所以可以访问`var`这些声明，是因为他会通过对象记录来获取。

对于js来说，全局对象通常被认为是一个错误，所以新的声明方法都是存储在声明性记录里。





> 原文： [How do JavaScript’s global variables really work?](https://2ality.com/2019/07/global-scope.html)
