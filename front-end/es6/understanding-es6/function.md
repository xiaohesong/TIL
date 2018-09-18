# 阅读[understanding es6](https://leanpub.com/understandinges6/read#leanpub-auto-functions-with-default-parameter-values)所学

### 函数相关部分

#### function params
> 传参数`undefined`是使用默认参数, `null`是进行传参，参数就是`null`.
    换而言之，想要使用默认的参数只能`method()`或者`method(undefined)`.
    
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

- Rest Parameters
  - rest params must be last
  ```javascript
  // Syntax error: Can't have a named parameter after rest parameters
    function pick(object, ...keys, last) {
        let result = Object.create(null);

        for (let i = 0, len = keys.length; i < len; i++) {
            result[keys[i]] = object[keys[i]];
        }

        return result;
    }

  ```
  可以发现，如果不是放在最后一个，会有一个语法的错误.
  
  - can not use for single argument
  ```javascript
   let object = {
      // Syntax error: Can't use rest param in setter
    set name(...value) {
        // do something
    }
   };
  ```
  上面也会报错，因为这个`set`支持传入单个参数，但是`rest params`默认被视为多个参数，数组形式存在。
  
  #### function
  - Block-Level Functions
  
  块级函数，在es3之前，是不被支持的，会报语法错误，但是浏览器会支持他，可是每个浏览器的支持是不同的，存在差异。
  目前在es5的严格模式下，也会出错。es6中是被很好的支持。但是有些地方需要注意。
  
  严格模式下:
  
  ```javascript
  'use strict'
  if (true) {

    console.log(typeof doSomething);        // "function"

    function doSomething() {
        // ...
    }

    doSomething();
  }

  console.log(typeof doSomething); // undefined
  ```
  
  这个例子可以看出很多的东西了。首先他也会进行提升，在未声明的时候，就可以获取到类型，这是因为被提升到块级顶级了。然后在外部访问函数，是访问不到的。
  如何让他不被提升呢?可以使用`let/const`

  上面是一个严格的模式下，那么非严格模式呢？

```javascript
if (true) {

    console.log(typeof doSomething);        // "function"

    function doSomething() {
        // ...
    }

    doSomething();
}

console.log(typeof doSomething);            // "function"
```
他是忽视了块级，进行了全局的提升。

es6引入了新的函数`Arrow Function`
- arrow function
  - No this, super, arguments, and new.target bindings
  - Cannot be called with new
    ```javascript
    MyType = () => {},
    object = new MyType();  // error - you can't use arrow functions with 'new'
    ```
  - No prototype 
  - Can't change this
  - No arguments object
      ```javascript
      const girl = (name = 'friend') => console.log(arguments) //error - ReferenceError: arguments is not defined
      ```
  - No duplicate named parameters
