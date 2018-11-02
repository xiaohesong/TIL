symbol是es6出的一种类型，他也是属于原始类型的范畴(string, number, boolean, null, undefined, symbol)

### basic

```javascript
let name = Symbol('xiaohesong')
typeof name // 'symbol'
let obj = {}
obj[name] = 'xhs'
console.log(obj[name]) //xhs
```

### symbol for

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

### symbol keyfor

```javascript
let uid = Symbol.for("uid");
console.log(Symbol.keyFor(uid));    // "uid"

let uid2 = Symbol.for("uid");
console.log(Symbol.keyFor(uid2));   // "uid"

let uid3 = Symbol("uid");
console.log(Symbol.keyFor(uid3));   // undefined
```
全局注册表不存在uid3这个共享的symbol.所以取不出对应的key.由此可见，这个是获取对应的key.

### symbol 不可强制转换

```javascript
let uid = Symbol('uid')
uid + ''
```
这里会报错，根据规范，他会把uid转换成字符串进行相加。如果真的相加，可以先`String(uid)`之后再相加，不过目前看来，似乎没什么意义。

### obj中symbol key的获取

```javascript
let uid = Symbol('uid')
let obj = {
    [uid]: 'uid'
}

console.log(Object.keys(obj)) // []
console.log(Object.getOwnPropertyNames(obj)) // []
console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(uid)]
```

es6针对这个，添加了`Object.getOwnPropertySymbols`方法。

 是不是感觉很少用到Symbols.其实es6内部用的还是不少的。
 
 ### Symbol.hasInstance
 
 每个函数都有这个方法。或许你对这个方法不是很熟，他其实就是`instanceof`所做的事情。
 没错，es6给你重写了这个方法。
 ```javascript
function Xiao(){}
const xiao = new Xiao
xiao instanceof Xiao // true
 ```
 实际上es6帮你那么干了
 ```javascript
 Xiao[Symbol.hasInstance](xiao)
 ```
 
 这个是内部的方法，不支持重写，当然，我们可以在原型上改写。
 
 ```javascript
 Object.definePrototype(Xiao, Symbol.hasInstance, {
    value: (v) => Boolean(v)
 })
 const x = new Xiao
 x instanceof Xiao //true
 0 instanceof Xiao //false
 1 instanceof Xiao //true
 ```
 可以发现，我们改写他返回对应的是否为boolean类型。
 
 ### Symbol.isConcatSpreadable
 
 这个和其他的一些属性不同，他是默认不存在一些标准对象上。简单的使用
 
 ```javascript
 let objs = {0: 'first', 1: 'second', length: 2, [Symbol.isConcatSpreadable]: true}
 ['arrs'].concat(objs) //["arrs", "first", "second"]
 ```
 
 ### Symbol.toPrimitive
 
这个用的就多了，进行类型转换的时候，对象会进行尝试转换成原始类型，就是通过`toPrimitive`.这个方法，标准类型的原型上都存在。

进行类型转换的时候，`toPrimitive`会被强制的调用一个参数，在规范中这个参数被称之为`hint`. 这个参数是三个值('number', 'string', 'default')其中的一个。

顾名思义，`string`返回的是`string`, `number`返回的是`number`，`default`是没有特别指定，默认。

那么什么是默认的情况呢？ 大多数的情况下，默认情况就是数字模式。(日期除外，他的默认情况视为字符串模式)

其实在类型转换时调用默认情况的也不是很多。如(`==`, `+`)或者将参数传递给`Date`的构造参数的时候。

- number mode
在数字情况下的行为(优先级从高到低)
  - 首先调用`valueOf`，如果是一个原始类型，那就返回。
  - 如果前面不是原始值，那么就尝试调用`toString`，如果是原始值，那么就返回
  - 如果都不存在，那么就报错

- string mode
在字符串的情况下，行为略有不同(优先级从高到低)
  - 首先调用`toString`，如果是原始值，那么就返回
  - 如果前面不是原始值，那么就尝试调用`valueOf`，如果是原始值，那么就返回
  - 抛出错误
  
嗯，是不是感觉挺绕的，是啊，代码阐述下嘛。
```javascript
let obj = {
    valueOf: function(){console.log('valueOf')},
    toString: function(){console.log('toString')}
}
// console.log value is
obj + 2 //valueOf
obj == 2 // valueOf
Number(obj) // valueOf
String(obj) // toString
```
通过上面的输出，可以发现大多数的情况都是首先调用`valueOf`.
包括默认的情况，他的默认是调用的数字模式，而且绝大数都是调用的数字模式，可以发现`toString`是调用了`string`的模式。所以你可以认为，基本就是数字模式，除非很显示的是字符串模式。

对于这个调用的模式还不是很清楚？没事，es6把这个内部的方法对外暴露出来了，我们可以改写他，输出这个`hint`的类型。 来

```javascript
function Temperature(degrees) {
    this.degrees = degrees;
}

Temperature.prototype[Symbol.toPrimitive] = function(hint) {
	console.log('hint is', hint)
};

let freezing = new Temperature(32);

freezing + 2 // ..
freezing / 2 // ..
...
```
上面的类型，自己尝试吧。

### Symbo.species
这个需要联系class的上下文来阐述了，[点击此处](https://github.com/xiaohesong/til/blob/master/front-end/es6/understanding-es6/class.md#symbolspecies%E5%B1%9E%E6%80%A7)查看详细
