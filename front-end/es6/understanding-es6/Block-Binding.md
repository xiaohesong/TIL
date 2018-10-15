`es5`和`es6`的区别里，关于块级绑定是被津津乐道的。之前没有记录，今天就把它记录下来。
我们知道`var`会有[变量提升](https://xiaohesong.gitbook.io/today-i-learn/front-end/javascript/zhi-hang-shang-xia-wen)。
`es6`的`let`和`const`可以避免这个，且会生成块级作用域。

### 块级声明
1. `function`里面 
2. 块内（由`{`和`}`字符表示）

##### let 声明

```js
function getValue(condition) {

    if (condition) {
        let value = "blue";

        // other code

        return value;
    } else {

        // value 不存在这里

        return null;
    }

    // value 不存在这里
}
```

##### 无重复声明
```js
var count = 30;

// Syntax error
let count = 40;
```
上面会报错，`count`被声明两次：一次使用`var`，一次使用`let`。因为`let`不会重新定义已存在于同一范围内的标识符，所以`let`声明将引发错误。
```js
var count = 30;

// Does not throw an error
if (condition) {

    let count = 40;

    // more code
}
```
这个不会报错，因为实在新的作用域(块级)创建的新变量。

### The Temporal Dead Zone
```js
if (condition) {
    console.log(typeof value);  // ReferenceError!
    let value = "blue";
}
```
这个就是所谓的`tdz`,`TDZ`永远不会在`ECMAScript`规范中明确命名，但该术语通常用于描述为什么`let`和`const`声明在声明之前无法访问。

当`js`引擎查看即将发生的块并找到变量声明时，它会将声明提升到函数顶部或全局范围（对于`var`），或者将声明放在`TDZ`中（对于`let`和`const`）。

上面的例子会报错，因为在这个块级作用域内的声明之前存在这个`TDZ`,但是你可以在块级作用域外使用:
```js
console.log(typeof value);     // "undefined"

if (condition) {
    let value = "blue";
}
```

`TDZ`只是块绑定的一个独特方面。另一个独特的方面与它们在循环内的使用有关。

### block binding in loops
```js
var funcs = [];

for (var i = 0; i < 10; i++) {
    funcs.push(function() { console.log(i); });
}

funcs.forEach(function(func) {
    func();     // 输出 "10" 十次。
});
```
在`es6`之前解决这个问题可以使用`IIFE`。
```js
var funcs = [];

for (var i = 0; i < 10; i++) {
    funcs.push((function(value) {
        return function() {
            console.log(value);
        }
    }(i)));
}

funcs.forEach(function(func) {
    func();     // 0,1,2,...
});
```
但是`es6`之后，可以直接使用`let`。
```js
var funcs = [];

for (let i = 0; i < 10; i++) {
    funcs.push(function() {
        console.log(i);
    });
}

funcs.forEach(function(func) {
    func();     // outputs 0, then 1, then 2, up to 9
})
```
这个是因为在每次的迭代中，都会创建一个新的变量，这就导致每个创建的内部的方法都有一个自己的变量。每次创建的时候，都会分配值。

> 重要的是要理解循环中let声明的行为是规范中特别定义的行为，并不一定与let的非提升特性有关。实际上，let的早期实现没有这种行为，因为它稍后在过程中添加。


## const 和 let
其实const的行为和`let`的行为差不多。只是`const`定义的是常量，不变的数据。`let`定义的是改变的数据。并且在声明`const`的时候必须存在值。

```js
const name; //error
const name = 'my name' 
name = 'your name' // error
let age;
age = 18;
```
对于`const `需要明确一点，就是改变的是什么？看下面这个。
```js
const person = {
    name: "Nicholas"
};

// works
person.name = "Greg";

// throws an error
person = {
    name: "Greg"
};
```
可以更改`person.name`而不会导致错误，因为这会更改`person`包含的内容，并且不会更改`person`绑定的值。
当此代码尝试为`person`分配值（从而尝试更改绑定）时，将引发错误。`const`如何与对象一起工作的这种微妙之处很容易被误解。
请记住：**`const`阻止修改绑定，而不是阻止修改绑定值。**

