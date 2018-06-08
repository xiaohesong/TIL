symbol是es6出的一种类型，他也是属于原始类型的范畴(string, number, boolean, null, undefined, symbol)

- basic

```javascript
let name = Symbol('xiaohesong')
typeof name // 'symbol'
let obj = {}
obj[name] = 'xhs'
console.log(obj[name]) //xhs
```

- symbol for

这个东西是可共享，在创建的时候会检查全局是否寻在这个key的symbol.如果存在就直接返回这个symbol,如果不存在就会创建，并且在全局注册。
```javascript
let uid = Symbol.for("uid");
let object = {
    [uid]: "12345"
};

console.log(object[uid]);       // "12345"
console.log(uid);               // "Symbol(uid)"

let uid2 = Symbol.for("uid");

console.log(uid === uid2);      // true
console.log(object[uid2]);      // "12345"
console.log(uid2);              // "Symbol(uid)"
```

> 此处所说的共享是全局性的共享，类似于global scope，是整个大环境下的共享.

- symbol keyfor

```javascript
let uid = Symbol.for("uid");
console.log(Symbol.keyFor(uid));    // "uid"

let uid2 = Symbol.for("uid");
console.log(Symbol.keyFor(uid2));   // "uid"

let uid3 = Symbol("uid");
console.log(Symbol.keyFor(uid3));   // undefined
```
全局注册表不存在uid3这个共享的symbol.所以取不出对应的key.由此可见，这个是获取对应的key.

- symbol 不可强制转换

```javascript
let uid = Symbol('uid')
uid + ''
```
这里会报错，根据规范，他会把uid转换成字符串进行相加。如果真的相加，可以先`String(uid)`之后再相加，不过目前看来，似乎没什么意义。

- obj中symbol key的获取

```javascript
let uid = Symbol('uid')
let obj = {
    [uid]: 'uid'
}
```
console.log(Object.keys(obj)) // []
console.log(Object.getOwnPropertyNames(obj)) // []
console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(uid)]

es6针对这个，添加了`Object.getOwnPropertySymbols`方法
