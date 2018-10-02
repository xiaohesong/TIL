### 整数的工作机制
在之前类型化数组里有讨论到关于[js存储数字类型的不同](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/improved-array.md#%E6%95%B0%E5%AD%97%E7%B1%BB%E5%9E%8B%E7%9A%84%E6%95%B0%E6%8D%AE),`IEEE 754`引起了很多的混乱。
`js`需要付出巨大努力才能确保开发人员不必担心数字编码的细节，但问题仍然不时泄漏。`ES 6`旨在通过使整数更容易识别和使用来解决这个问题。

##### 识别整数
`ES6`添加了`Number.isInteger`方法来表示是否整数。虽然`js`使用`IEEE 754`编码系统来表示整数和浮点型，但是他们的存储有些不同，`isInteger`就是利用这一点，去检查值是不是一个整数。这就意味着看起来是浮点型的数字,可能存储的是整数，导致`isInteger`返回的是`true`。
```js
console.log(Number.isInteger(25));      // true
console.log(Number.isInteger(25.0));    // true
console.log(Number.isInteger(25.1));    // false
```

##### Safe Integers
`IEEE 754`只能准确地表示`-2的53次方`和`2的53次方`之间的整数，并且在这个“安全”范围之外，二进制最终会复用于多个数值。
这就意味着`js`只能表示这个安全范围内的数字:
```js
console.log(Math.pow(2, 53));      // 9007199254740992
console.log(Math.pow(2, 53) + 1);  // 9007199254740992
```
可以发现，超出这个范围就不行了。
`ES6`通过`Number.isSafeInteger`方法去识别一个数字是不是安全的。`Number.MAX_SAFE_INTEGER`和`Number.MIN_SAFE_INTEGER`表示最大和最小的值。
看下面这个例子:
```js
var inside = Number.MAX_SAFE_INTEGER,
    outside = inside + 1;

console.log(Number.isInteger(inside));          // true
console.log(Number.isSafeInteger(inside));      // true

console.log(Number.isInteger(outside));         // true
console.log(Number.isSafeInteger(outside));     // false
```
你可以试下，`MAX_SAFE_INTEGER`就是`2的53次方减1`。

### new math methods
`ECMAScript 6`为`Math`对象添加了几种方法，以提高常见数学计算的速度。提高通用计算的速度还可以提高执行许多计算的应用程序的整体速度，例如图形程序。

Math.acosh（x）返回x的反双曲余弦值。

Math.asinh（x）返回x的反双曲正弦值。

Math.atanh（x）返回x的反双曲正切

Math.cbrt（x）返回x的立方根。 

Math.clz32（x）返回x的32位整数表示中的前导零位数。 

Math.cosh（x）返回x的双曲余弦值。

Math.expm1（x）返回从x的指数函数中减去1的结果。

Math.fround（x）返回x的最近的单精度浮点数。 

Math.hypot（... values）返回每个参数的平方和的平方根。

Math.imul（x，y）返回执行两个参数的真正32位乘法的结果。 

Math.log1p（x）返回1 + x的自然对数。 

Math.log10（x）返回x的基数10对数。

Math.log2（x）返回x的基数2对数。 

Math.sign（x）如果x为负，则返回-1;如果x为+0或-0，则返回0;如果x为正，则返回1。 

Math.sinh（x）返回x的双曲正弦值。

Math.tanh（x）返回x的双曲正切值。 

Math.trunc（x）从float中移除小数位并返回一个整数。


解释每种新方法及其详细功能超出了本章的范围。但是，如果对应用程序需要进行常见的计算，请务必在自己实现之前检查新的Math方法。

### Unicode Identifiers
`ES6`相对之前的版本提供了更好的支持，它还可以更改可用作标识符的字符。在`ECMAScript 5`中，已经可以将`Unicode`转义序列用于标识符。例如：
```js
// Valid in ECMAScript 5 and 6
var \u0061 = "abc";

console.log(\u0061);     // "abc"

// equivalent to:
console.log(a);          // "abc"
```
在此示例中的`var`语句之后，可以使用`\ u0061`或`a`来访问该变量。在`ECMAScript 6`中，还可以使用`Unicode`代码点转义序列作为标识符，如下所示：
```js
// Valid in ECMAScript 5 and 6
var \u{61} = "abc";

console.log(\u{61});      // "abc"

// equivalent to:
 console.log(a);          // "abc"
```
此外，`ECMAScript 6`根据`Unicode`[标准附件＃31：Unicode标识符和模式语法正式指定了有效标识符](http://unicode.org/reports/tr31/)，它提供了以下规则：

1. 第一个字符必须是`$`，`_`或任何带有`ID_Start`的派生核心属性的`Unicode`符号。
2. 每个后续字符必须是`$`，`_`，`\ u200c`（零宽度非连接符），`\ u200d`（零宽度连接符），或具有`ID_Continue`的派生核心属性的任何`Unicode`符号。

`ID_Start`和`ID_Continue`派生的核心属性在`Unicode`标识符和模式语法中定义，作为识别适用于变量和域名等标识符的符号的方法。该规范不是特定于JavaScript。

### Formalizing the __proto__ Property
甚至在`ECMAScript 5``完成之前，几个JavaScript`引擎已经实现了一个名为`__proto__`的自定义属性，可用于获取和设置`[[Prototype]]`属性。
实际上，`__ proto__`是`Object.getPrototypeOf`和`Object.setPrototypeOf`方法的早期前身。期望所有`JavaScript`引擎删除此属性是不
现实的（有流行的`JavaScript`库使用`__proto__`），因此`ECMAScript `6也正式化了`__proto__`行为。但正式化出现在`ECMA-262的附录B`中以及此警告：
> 这些功能不被视为核心`ECMAScript`语言的一部分。编写新的`ECMAScript`代码时，程序员不应使用或假设存在这些特性和行为。不鼓励`ECMAScript`实现这
些功能，除非实现是`Web`浏览器的一部分或者需要运行`Web`浏览器遇到的相同的旧`ECMAScript`代码。

`ECMAScript`规范建议使用`Object.getPrototypeOf`和`Object.setPrototypeOf`，因为`__proto__`具有以下特征：
1. 只能在对象文字中指定`__proto__`一次。如果指定两个`__proto__`属性，则会引发错误。这是具有该限制的唯一对象文字属性。
2. 计算形式`[“__ proto__”]`的作用类似于常规属性，不会设置或返回当前对象的原型。与对象文字属性相关的所有规则都适用于此形式，而非计算形式则具有例外。

虽然应该避免使用`__proto__`属性，但规范定义它的方式很有趣。在`ECMAScript 6`引擎中，`Object.prototype .__ proto__`被定义为一个访问器属性，
其`get`方法调用`Object.getPrototypeOf`并且其`set`方法调用`Object.setPrototypeOf`方法。这与使用`__proto__`和`Object.getPrototypeOf/ Object.setPrototypeOf`之间
没有什么区别，只是`__proto__`允许直接设置对象文字的原型。看下面例子:
```js
let person = {
    getGreeting() {
        return "Hello";
    }
};

let dog = {
    getGreeting() {
        return "Woof";
    }
};

// prototype is person
let friend = {
    __proto__: person
};
console.log(friend.getGreeting());                      // "Hello"
console.log(Object.getPrototypeOf(friend) === person);  // true
console.log(friend.__proto__ === person);               // true

// set prototype to dog
friend.__proto__ = dog;
console.log(friend.getGreeting());                      // "Woof"
console.log(friend.__proto__ === dog);                  // true
console.log(Object.getPrototypeOf(friend) === dog);     // true
```

此示例不是调用`Object.create`来创建`friend`对象，而是创建一个标准对象文字，为`__proto__`属性赋值。使用`Object.create`方法创建对象时，必须为任何其他对象属性指定完整属性描述符。不够直接。


