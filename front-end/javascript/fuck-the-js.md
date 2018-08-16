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

