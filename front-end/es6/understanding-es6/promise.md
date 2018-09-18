相信大家对这个是挺熟悉的了吧，毕竟都会用到异步函数，这个其实还好，不打算长篇大论的叙述了，简单的说下。
他有在执行(`pending`)的时候，有个简短的生命周期，在`pending`的时候可以叫做`unsettled `, 当`promise`执行结束之后，会变成`settled`,`settled`主要是有下面两种状态
- `Fulfilled`: `promise`成功完成.
- `Rejected`: `promise`未能完成，失败或者其他情况下产生.

并且`promise`有个内部的属性`[[PromiseState]]`,他的值只有这三种`pending`, `fulfilled `, `rejected`.这个属性是不对外暴露的，导致编程时不能确定他的状态，但是可以通过`then`来确定.

**`then`方法接受两个参数，第一个是成功的回调函数，第二个是失败时候的回调函数**

所有方法根据这个来生成`then()`方法的都被称之为`thenable`.所有的`promise`都是`thenable`的，但并非所有的`thenable`都是`promise`.

```js
thenable = {
    then: function(resolve, reject) {
        resolve(42);
    }
};

p1 = Promise.resolve(thenable);
p2 = Promise.reject(thenable)
p1.then(function(value) {
    console.log(value);     // 42
});

p2.then(i => console.log('in work'), (err) => console.log('is error'))
```

下面来看看操作多个`promise`的。`all`,没错，就是他。

`Promise.all()`接受一个参数，这个参数是可迭代的，并且返回的是在迭代中被成功处理的。而且这些返回的值是按照传递的顺序存储的。
```js
p1 = new Promise(function(resolve, reject) {
    resolve(42);
});
p2 = new Promise(function(resolve, reject) {
    resolve(43);
});
p3 = new Promise(function(resolve, reject) {
    resolve(44);
});
p4 = Promise.all([p1, p2, p3]);
p4.then(function(value) {
    console.log(Array.isArray(value));  // true
    console.log('here value is', value) // here value is (3) [42, 43, 44]
    console.log(value[0]);              // 42
    console.log(value[1]);              // 43
    console.log(value[2]);              // 44
});
```
**若`all()`存在失败的情况就会立即返回，不会等待其他的完成**,看下面例子:
```js
p1 = new Promise(function(resolve, reject) {
    resolve(42);
});
p2 = new Promise(function(resolve, reject) {
    reject(43);
});
p3 = new Promise(function(resolve, reject) {
    resolve(44);
});
p4 = Promise.all([p1, p2, p3]);
p4.catch(function(value) {
    console.log(Array.isArray(value))   // false
    console.log(value);                 // 43
});
```

与`all()`相对的就是`race`方法，他传参和`all`差不多，不过返回的机制却是不同。
`race`是当有一个完成就会返回，而不是等待其他的也完成。
**race**只会关心第一个返回`settled`的结果，如果是`Fulfilled`，那么返回的结果就是`Fulfilled`,如果是`rejected`，那么返回的结果就是`rejected`.
```js
p1 = new Promise(function(resolve, reject) {
    setTimeout(function() {
        resolve(42);
    }, 100);
});
p2 = new Promise(function(resolve, reject) {
    reject(43);
});
p3 = new Promise(function(resolve, reject) {
    setTimeout(function() {
        resolve(44);
    }, 50);
});
p4 = Promise.race([p1, p2, p3]);
p4.catch(function(value) {
    console.log(value);     // 43
});
```

### 继承自`promise`
```js
class MyPromise extends Promise {

    // use default constructor

    success(resolve, reject) {
        return this.then(resolve, reject);
    }

    failure(reject) {
        return this.catch(reject);
    }

}

let promise = new MyPromise(function(resolve, reject) {
    resolve(42);
});

promise.success(function(value) {
    console.log(value);             // 42
}).failure(function(value) {
    console.log(value);
});
```
在这里，他继承了`promise`的所有内置方法。但是略有不同，比如静态方法有四个`Promise.resolve(), Promise.reject(), Promise.all(), Promise.race() `，最后两个静态方法和内置方法的行为相同，但是前面两个方法略有不同。

无论传递的值如何，`MyPromise.resolve()`和`MyPromise.reject()`都将返回`MyPromise`的实例，因为这些方法使用`Symbol.species`属性([之前一文有介绍](https://github.com/xiaohesong/til/blob/master/front-end/es6/understanding-es6/class.md#symbolspecies%E5%B1%9E%E6%80%A7))来确定要返回的`promise`的类型。

```js
p1 = new Promise(function(resolve, reject) {
    resolve(42);
});

p2 = MyPromise.resolve(p1);
p2.success(function(value) {
    console.log(value);         // 42
});

console.log(p2 instanceof MyPromise);   // true
```
有些人会说`async`，但是他最终是在`ECMAScript 2017` (`ECMAScript 8`)出的。
