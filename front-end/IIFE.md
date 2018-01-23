`IIFE`(Immediately-Invoked Function Expression).立即调用的函数表达式.

 函数声明?函数表达式?WTF?
 
  先看看下面代码.
 ```javascript
 // example1.js
 function name() {console.log("my name xiaohesong")}
 // example2.js
 function() {console.log("my name xiaohesong")}
 // example3.js
 (function() {console.log("my name xiaohesong")})
 ```
 在浏览器`console`下执行,会出现什么?
 
 如果执行了会发现`example2.js`报错`Uncaught SyntaxError: Unexpected token {`.
 
 为什么会报错,这个得知道`js`是怎么运行这段代码的.下面我们就先来说说函数声明.
 
 - 函数声明
 
`function`是一个关键字,`js`在运行的时候,碰到这个关键字就会被假定为这是一个函数声明.

可是函数声明得有名字呀.没有名字,就认为你编写的函数声明是存在问题的,
所以就抛出一个语法错误给你.

常规的一个函数声明应该是有关键字,函数名称,再加上{}.

```javascript
function name() { ...do sth }
```

可是`example3.js`也没有名字,为什么不会报错? 那么下面我们来说说`函数表达式`.

- 函数表达式

```javascript
var name = function() {console.log("my name xiaohesong")}
```

比如这个代码.就是一个表达式,其实在`es6`中,我们应该是有大量使用到函数表达式的.

```javascript
const name = () => console.log("my name xiaohesong")
```
现在我们也了解了表达式的情况. 来看看为啥`example3.js`不会报错.

可以发现第一个括号,他到底是干啥用的. 其实加括号就是在运行的时候将我们的代码解析成函数表达式,而不是函数声明,这样就不会出现语法错误.

我们来看一个`IIEF`.

```javascript
(function() {console.log("say my name")})()
```
运行了之后直接输出, 可以发现第一个`()`中间包裹的匿名函数, 然后后面继续跟着一个`()`.后面的`()`就是执行的意思.

所以现在知道了为啥`IIFE`可以立即执行了吧.

- 参考链接

[函数表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/function)

[JavaScript: What the heck is an Immediately-Invoked Function Expression?](https://codeburst.io/javascript-what-the-heck-is-an-immediately-invoked-function-expression-a0ed32b66c18)
