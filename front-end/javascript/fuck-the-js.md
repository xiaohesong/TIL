[fuck js 系列](https://github.com/denysdovhan/wtfjs)
- null vs 0

```js
null > 0 //false
null < 0 //false
null == 0 //false
null >= 0 //true
null <= 0 //true
```

这个是因为比较符(>, <)会进行转换成数字，`Number(null) == 0`, 然而`null == 0`[在规范里](http://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3)，是不存在这种相等，所以一律返回false.

- `+`
```js
'x' + + 'w' // xNaN
```
为什么，可以看到主要的问题是在`+ +`这个地方。
他是相当于`'x' + (+'w')`,在这里会把`w`进行强制转换(`Number('w')`), 所以变成了`'x' + NaN`.
具体的可以参考[最新版的规范-12.8.3.1Runtime Semantics: Evaluation - 12.8.5](http://www.ecma-international.org/ecma-262/9.0/index.html#sec-additive-operators)。

- object vs object
```js
var a = { b: 42 };
var b = { b: 43 };

a < b;	// false
a == b;	// false
a > b;	// false

a <= b;	// true
a >= b;	// true
```
看代码，可能会产生疑问。`a < b`是相当于`[object object] < [object object]`,我们知道两个字符串在进行比较的时候，是逐字符串字典顺序比较的，但是这个比较奇怪，不会按照字典顺序比较。
他的比较`a <= b`实际是通过先比较`b < a`，然后对`b < a`的结果取反，我们知道`b < a`是`false`，所以取反的结果就是`true`.
