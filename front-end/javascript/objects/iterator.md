我们知道可以通过`for .. in`来获取对象的属性名字，而`for .. of`是获取对应的`value`.

并且`for .. of`是需要`iterable`才可以。

```js
// example1
let ar = ['xiaohesong']
let art = ar[Symbol.iterator]()
art // Array Iterator
art.next() //{value: "xiaohesong", done: false}
art.next() // {value: undefined, done: true}

//example2
let str = 'string'
let strIt = str[Symbol.iterator]()
strIt // StringIterator

// example3
let o = {name: 'xhs'}
let obj = o[Symbol.iterator]() //Uncaught TypeError: o[Symbol.iterator] is not a function
```

看下面代码。来改写，可迭代。

```js
let range = {
  from: 1,
  to: 5
};

// We want the for..of to work:
// for(let num of range) ... num=1,2,3,4,5
```

改写成这样

```js
let range = {
  from: 1,
  to: 5
};

// 1. for..of 默认调用iterator
range[Symbol.iterator] = function() {

  // 2. ...it returns the iterator:
  return {
    current: this.from,
    last: this.to,

    // 3. next() is called on each iteration by the for..of loop
    next() {
      // 4. it should return the value as an object {done:.., value :...}
      if (this.current <= this.last) {
        return { done: false, value: this.current++ };
      } else {
        return { done: true };
      }
    }
  };
};

// now it works!
for (let num of range) {
  alert(num); // 1, then 2, 3, 4, 5
}
```

再来看一个例子

```js
let o = {
  0: '0000',
  3: '3333',
  length: 6
}
for(let value of o){} // TypeError o is not iterable

let obj = Array.from(o) // (6) ["0000", undefined, undefined, "3333", undefined, undefined]
for(let value of obj){} // undefined, works!


let ranger = Array.from(range) // 上面的range的例子.  (5) [1, 2, 3, 4, 5]
// 有意思吧，他自己会把iterable的计算出来。
```

- Array.from

```js
a = [1,3,5,7,9]
Array.from(a, (num) => num * num) //(5) [1, 9, 25, 49, 81]
// 第二个参数是一个函数，可对每个item操作。
```


