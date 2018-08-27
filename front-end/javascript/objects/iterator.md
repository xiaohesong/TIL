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


