# 阅读[understanding es6](https://leanpub.com/understandinges6/read#leanpub-auto-functions-with-default-parameter-values)所学

- 函数默认参数的`TDZ`

我们知道块级作用域会有`TDZ`. 其实方法参数也存在`TDZ`.
```javascript
function add(first = second, second) {
    return first + second;
}

console.log(add(1, 1));         // 2
console.log(add(undefined, 1)); // throws error
```
上面这段代码在调用时初始化默认函数的时候，其实时做了下面的事情.
```javascript
// JavaScript representation of call to add(1, 1)
let first = 1;
let second = 1;

// JavaScript representation of call to add(undefined, 1)
let first = second;
let second = 1;
```
所以会报错。因为触发了`TDZ`的规则。

⚠️函数的参数体有自己的作用域和`TDZ`,他和函数内容时分开的。这就意味着参数体内的默认值不能访问函数体内的任何变量。
