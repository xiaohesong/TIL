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
