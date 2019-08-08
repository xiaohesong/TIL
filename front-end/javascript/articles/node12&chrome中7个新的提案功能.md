JavaScript(或ECMA script)是一种不断发展的语言，有许多关于如何更好发展的建议和想法。TC39(技术委员会39)是负责定义JS标准和特性的委员会，今年他们一直很活跃。以下是目前处于"第3阶段"的一些提案的摘要，这是在"完成"之前的最后一个阶段。这意味着这些功能应该很快就会在浏览器和其他引擎中实现。事实上，其中一些现在可用。

## 1. 私有字段 `#`

*Chrome & NodeJS 12 中可用*

是的，你没有看过。最终，JS在类中获取私有字段。不再需要`this._doPrivateStuff()`，定义闭包来存储私有值，或者使用`WeakMap`来hack私有props。

![don't touch my garbage](https://res.cloudinary.com/practicaldev/image/fetch/s--Z93VbJxJ--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://www.meme-arsenal.com/memes/74402a52240be627fb62e298b1fe0897.jpg)

语法看起来像下面这样：

```js
// 私有字段必须使用'#'开头
// 并且不可以在类这个块的外面去访问

class Counter {
  #x = 0;

  #increment() {
    this.#x++;
  }

  onClick() {
    this.#increment();
  }

}

const c = new Counter();
c.onClick(); // works fine
c.#increment(); // error
```

提案：https://github.com/tc39/proposal-class-fields

## 2. 可选的链`?.`

以前必须访问嵌套在对象内的几个级别的属性，并得到臭名昭著的错误`Cannot read property 'stop' of undefined`。然后更改代码以处理链中的每个可能是`undefined`的对象，例如：

```js
const stop = please && please.make && please.make.it && please.make.it.stop;

// 或可以使用像'object-path'这样的库
const stop = objectPath.get(please, "make.it.stop");
```

通过可选的链接，你就可以像下面这样来处理：

```js
const stop = please?.make?.it?.stop;
```

提案：https://github.com/tc39/proposal-optional-chaining

## 3. null合并 `??`

变量的可选值可能缺失，如果丢失，则使用默认值，这样属于很常见的现象：

```js
const duration = input.duration || 500;
```

`||`的问题是它将覆盖[所有falsy](https://github.com/xiaohesong/til/blob/master/front-end/javascript/you-dont-known-js/types%26grammer/Chapter4-coercion.md#falsy-values)值，如(`0`, `''`, `false`)，在某些情况下可能是有效的输入。

键入null合并运算符，他只会覆盖`undefined`或`null`：

```js
const duration = input.duration ?? 500;
```

提案：https://github.com/tc39/proposal-nullish-coalescing

## 4. BigInt `1n`

*Chrome & NodeJS 12 中可用*

JS一直不擅长数学的一个原因是我们无法可靠地存储大于`2 ^ 53`的数，这使得处理相当大的数非常困难。幸运的是，`BigInt`是一个解决这个特定问题的提案。

![此图片被和谐](https://res.cloudinary.com/practicaldev/image/fetch/s--URUEL7B2--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://i.imgflip.com/p8blw.jpg)

闲话少说，show me your code：

```js
// 可以定义 BigInt 通过追加 'n' 到一个数字字面量
const theBiggestInt = 9007199254740991n;

// 对字面量使用构造函数
const alsoHuge = BigInt(9007199254740991);

// 或者对字符串使用
const hugeButString = BigInt('9007199254740991');
```

你还可以在`BigInt`上使用与普通数字相同的运算符，例如:`+`，`-`，`/`，`*`，`%`，…不过有一个问题，在大多数操作中不能将`BigInt`与数字混合使用。比较`Number`和`BigInt`工作方式，但不能添加他们：

```js
1n < 2 
// true

1n + 2
// 🤷‍♀️ Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions
```

> 译：根据上面的报错提示，你可以改为显示的转换
>
> ```js
> Number(1n) + 2
> ```

提案：https://github.com/tc39/proposal-bigint

## 5. `static` 字段

*Chrome & NodeJS 12 中可用*

这个很简单。它允许在类上有一个静态字段，类似于大多数OOP语言。静态字段可以作为枚举的替代，它们也可以用于私有字段。

```js
class Colors {
  // public static fields
  static red = '#ff0000';
  static green = '#00ff00';

  // private static fields
  static #secretColor = '#f0f0f0';

}


font.color = Colors.red;

font.color = Colors.#secretColor; // Error
```

提案：https://github.com/tc39/proposal-static-class-features

## 6. 顶层 `await`

*chrome中可用*

允许在你代码的顶层使用await。这对于调试浏览器控制台中的异步内容(如`fetch`)非常有用，而无需将其封装在async函数中。

![using await in browser console](https://res.cloudinary.com/practicaldev/image/fetch/s--wCIIk7Oa--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://thepracticaldev.s3.amazonaws.com/i/y5ur91fgud4pu7hh5ypv.png)

如果你需要复习异步并等待，[请看我在这篇文章里对他的解释](https://dev.to/gafi/7-reasons-to-always-use-async-await-over-plain-promises-tutorial-4ej9)。

另一个致命的用例是，它可以在以异步方式初始化的ES模块的顶层使用(比如建立连接的数据库层)。当import这样的“异步模块”时，模块系统将在执行依赖它的模块之前等待它解析。这将使处理异步初始化比当前返回初始化promise并等待它的工作区容易得多。模块将不知道它的依赖关系是否是异步的。

![wait for it](https://res.cloudinary.com/practicaldev/image/fetch/s--JDbkHgPB--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/http://24.media.tumblr.com/tumblr_m3x648wxbj1ru99qvo1_500.png)

```js
// db.mjs
export const connection = await createConnection();
```

```js
// server.mjs
import { connection } from './db.mjs';

server.start();
```

在此示例中，在`db.mjs`中完成连接之前，不会在`server.mjs`中执行任何操作。

提案：https://github.com/tc39/proposal-top-level-await

## 7. `WeakRef`

*Chrome & NodeJS 12 中可用*

对象的弱引用是不再能够使对象保持活的引用。每当我们使用(`const`、`let`、`var`)创建一个变量时，只要该变量的引用仍然可访问，垃圾收集器(GC)就永远不会从内存中删除该变量。这些都是强引用。但是，如果没有对弱引用引用的对象有强引用，则GC可以在任何时候删除它。`WeakRef`实例有一个`deref`方法，它返回被引用的原始对象，如果原始对象被垃圾回收期收集，则返回`undefined`。

这对于缓存廉价对象可能很有用，因为你不想将所有对象都永远存储在内存中。

```js
const cache = new Map();

const setValue =  (key, obj) => {
  cache.set(key, new WeakRef(obj));
};

const getValue = (key) => {
  const ref = cache.get(key);
  if (ref) {
    return ref.deref();
  }
};

// this will look for the value in the cache
// and recalculate if it's missing
const fibonacciCached = (number) => {
  const cached = getValue(number);
  if (cached) return cached;
  const sum = calculateFibonacci(number);
  setValue(number, sum);
  return sum;
};
```

对于缓存远程数据来说，这可能不是一个好主意，因为远程数据从内存中删除 不可预测。在这种情况下，最好使用类似LRU缓存的东西。

> 译：LRU缓存，是否有去了解？或者下次一起了解下
> [Implementing LRU cache in JavaScript -- medium](https://medium.com/dsinjs/implementing-lru-cache-in-javascript-94ba6755cda9)
>
> [LRU cache implementation in Javascript -- stackoverflow](https://stackoverflow.com/questions/996505/lru-cache-implementation-in-javascript)

提案：https://github.com/tc39/proposal-weakrefs

就是这样。我希望你和我一样会兴奋地使用这些很酷的新功能。有关这些提案以及我未提及的其他提案的更多详细信息，[请保持关注github上的TC39提案](https://github.com/tc39/proposals)。



原文：[7 Exciting New JavaScript Features You Need to Know](https://dev.to/gafi/7-new-exciting-javascript-features-you-need-to-know-1fkh?utm_source=digest_mailer&utm_medium=email&utm_campaign=digest_email)

