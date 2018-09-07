### [Iterator and Generator](https://leanpub.com/understandinges6/read#leanpub-auto-iterators-and-generators)

- iterator

  这个就是一个可以迭代的接口对象。[可以参考这里](https://github.com/xiaohesong/til/blob/master/front-end/javascript/objects/iterator.md)
  
  简单的来说这个对象就是有一个next方法，next方法里返回的对象具有(value和done)这两个属性.
  
  ```js
  function createIterator(items) {

    var i = 0;

    return {
        next: function() {

            var done = (i >= items.length);
            var value = !done ? items[i++] : undefined;

            return {
                done: done,
                value: value
            };

        }
    };
  }

  var iterator = createIterator([1, 2, 3]);

  console.log(iterator.next());           // "{ value: 1, done: false }"
  console.log(iterator.next());           // "{ value: 2, done: false }"
  console.log(iterator.next());           // "{ value: 3, done: false }"
  console.log(iterator.next());           // "{ value: undefined, done: true }"

  // for all further calls
  console.log(iterator.next());           // "{ value: undefined, done: true }"
  ```
- generator
  这个就是返回iterator的一个方法。
  
  使用也简单，`function`关键字后面跟着一个`*`, 并且在内容中`yield`关键字。
  
  ```js
  // generator
  function *createIterator() {
      yield 1;
      yield 2;
      yield 3;
  }

  // generators are called like regular functions but return an iterator
  let iterator = createIterator();

  console.log(iterator.next().value);     // 1
  console.log(iterator.next().value);     // 2
  console.log(iterator.next().value);     // 3
  ```
  
  `yield`关键字会在next方法调用的时候返回结果，并且后面的不会有操作，next一次向下走一次。
  
  arrow function 不支持generator,并且[generator的next也是可以传递参数的](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/iterators&generators.md#generator%E4%B9%9F%E6%98%AF%E5%8F%AF%E4%BB%A5%E4%BC%A0%E5%8F%82%E6%95%B0%E7%9A%84).
  
  
### [iterables and for of](https://leanpub.com/understandinges6/read#leanpub-auto-iterables-and-for-of)
所有通过`generator`创建的`iterator`都是`iterables`的，并且`generator`默认添加了`Symbol.iterator`属性.

在[上面的这个链接里](https://github.com/xiaohesong/til/blob/master/front-end/javascript/objects/iterator.md)有介绍说`for...of`需要`iterable`才可以，
从链接的结果来看，他是调用了`next`方法，其实他是先调用(`Symbol.iterator`)方法来确定返回值是不是一个`iterator`,之后再去调用`next`方法.

我们来创建一个`iterable`的对象.

```js
let collection = {
    items: [],
    *[Symbol.iterator]() {
        for (let item of this.items) {
            yield item;
        }
    }

};

collection.items.push(1);
collection.items.push(2);
collection.items.push(3);

for (let x of collection) {
    console.log(x);
}
```

不难理解吧，他在`let x of collection`的时候先去获取`Symbol.iterator`获取到`next`方法去执行，因为`yield`关键字需要`next`去运行。

现在我们来实现一个`Array.from`的简单的功能(转换成数组).将`obj = {1: 'num 1', 3: 'number 3', length: 5}`[通过next转换成一个数组](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/objects/examples/iterator.md#example1).

es6有很多都内置了`iterator`的对象。

es6中有三类集合对象：`Array`, `Map`, `Set`

- `entries()` - 返回的是可迭代的健值对
- `values()` - 返回的内容的集合，可迭代(iterator)
- `keys()` - 返回的是key的集合，可迭代

可迭代的`entries()`
```js
let colors = [ "red", "green", "blue" ];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set("title", "Understanding ECMAScript 6");
data.set("format", "ebook");

for (let entry of colors.entries()) {
    console.log(entry);
}

for (let entry of tracking.entries()) {
    console.log(entry);
}

for (let entry of data.entries()) {
    console.log(entry);
}
```

`keys`和`values`想必大家很熟知了，就不再阐述。

集合类型的默认迭代参数：

```js
let colors = [ "red", "green", "blue" ];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set("title", "Understanding ECMAScript 6");
data.set("format", "print");

// same as using colors.values()
for (let value of colors) {
    console.log(value);
}

// same as using tracking.values()
for (let num of tracking) {
    console.log(num);
}

// same as using data.entries()
for (let entry of data) {
    console.log(entry);
}
```

可以发现，`array`和`set`默认的是value，而`map`则默认的是`entries`.

###### generator也是可以传参数的。

```js
function *createIterator() {
    let first = yield 1;
    let second = yield first + 2;       // 4 + 2
    yield second + 3;                   // 5 + 3
}

let iterator = createIterator();

console.log(iterator.next());           // "{ value: 1, done: false }"
console.log(iterator.next(4));          // "{ value: 6, done: false }"
console.log(iterator.next(5));          // "{ value: 8, done: false }"
console.log(iterator.next());           // "{ value: undefined, done: true }"
```

在`generator`中，第一次调用`next()`是一个特殊的案例，因为你传递任何值过去，都会丢失。

`next()`中传递的参数有这的规则：传入的参数会做为上一个`yield`的返回结果。意思也就是说，前提条件是需要一个表达式`x = yield value`,这也才会有赋值，这也才会传入参数。

来个简单的例子：
```js
function * wo() {
	yield 2
	let x = yield 9
	yield 100
	yield x + 'LM'
}
w = wo()
w.next(1) //1 {done: false, value: 2}
w.next('xhs') //2 {done: false, value: 9}
w.next('xz') //3 {done: false, value: 100}
w.next() //4 {done: false, value: 'xzLM'}
```
可以发现第三步之前的传入的参数，没有起作用，第三步起作用了，因为在第三步传入的参数，有变量去接收(就是赋值给上面的一个yield结果)，所以第二步中`x`变量的值就是第三步传入的值`xz`.

当然，这个是比较好理解的方式，按照`understanding es6`中的来理解，就需要去知道执行步骤。

这个步骤就是每次的`next()`都是先执行上一个表达式的左侧，再执行当前表达式的右侧(`yield`).如果不是表达式，则直接执行`yield`. 这就造成传入的参数实际是在执行当前`yield`之前对上一个表达式左侧的变量进行了赋值(并且如果有接收参数，切`next()`没有传入参数，那就造成这个变量是`undefined`)。看下图

![](https://github.com/xiaohesong/TIL/blob/master/assets/front-end/imgs/generatorFunction.png)

###### iterator支持抛出异常
```js
function *createIterator() {
    let first = yield 1;
    let second = yield first + 2;       // yield 4 + 2, then throw
    yield second + 3;                   // never is executed
}

let iterator = createIterator();

console.log(iterator.next());                   // "{ value: 1, done: false }"
console.log(iterator.next(4));                  // "{ value: 6, done: false }"
console.log(iterator.throw(new Error("Boom"))); // error thrown from generator
```
这里就抛出一个异常，看下图就比较直观

![](https://github.com/xiaohesong/TIL/blob/master/assets/front-end/imgs/generatorThrow.png)


###### generator的return
```js
function* wo(){
  yield 'xhs'
  return 'xz'
  yield 'xite'
}
w = wo()
w.next() // work
w.next() // {done: true, value: 'xz'}
w.next()// {done: false, value: undeined}
```

可以发现，在`generator`中正常return，带有返回值. 
**`spread operator`和`for-of`会无视`return`的返回值，注意:不会无视`return`语句**

为什么不会返回`return`值，因为发现`done: true`之后，便不会再去读取`value`。

###### Delegating Generators
看下面例子，比较直观
```js
function *createNumberIterator() {
    yield 1;
    yield 2;
    return 3;
}

function *createRepeatingIterator(count) {
    for (let i=0; i < count; i++) {
        yield "repeat";
    }
}

function *createCombinedIterator() {
    let result = yield *createNumberIterator();
    yield *createRepeatingIterator(result);
}

var iterator = createCombinedIterator();

console.log(iterator.next());           // "{ value: 1, done: false }"
console.log(iterator.next());           // "{ value: 2, done: false }"
console.log(iterator.next());           // "{ value: "repeat", done: false }"
console.log(iterator.next());           // "{ value: "repeat", done: false }"
console.log(iterator.next());           // "{ value: "repeat", done: false }"
console.log(iterator.next());           // "{ value: undefined, done: true }"
```
这个就是一个代理的例子。值得注意的是`result`，他是一个`return`值，`next()`方法的时候不会有输出，如果需要输出需要`yield result`.

> `yield * 'string'`是保持默认`string`的输出.

###### [asynchronous task running](https://leanpub.com/understandinges6/read#leanpub-auto-asynchronous-task-running)

这个就是利用`next()`是一步一步的原理去处理。
