### 简介
- proxy

  `proxy`可以拦截目标(target)上的非内置的对象进行操作，使用`trap`拦截这些操作，`trap`是响应特定操作的方法。

- reflection

  `reflection`是通过`Reflect`对象表示，他提供了一些方法集，为代理`proxy`提供默认行为。
  
下面是一些`proxy trap`和`Reflect`方法，**每个`proxy trap`都有提供对应的`Reflect`方法,他们接收相同的参数**。

| Proxy Trap  | Overrides the Behavior Of  |  Default Behavior |
|---|---|---|
| get  | Reading a property value  | Reflect.get()  |
| set  | Writing to a property |  Reflect.set() |
| has  | The in operator  | Reflect.has()  |
| deleteProperty  |  The delete operator	 | Reflect.deleteProperty()  |
| getPrototypeOf  | Object.getPrototypeOf() | Reflect.getPrototypeOf()  |
| setPrototypeOf  | Object.setPrototypeOf()  | Reflect.setPrototypeOf()  |
| isExtensible  |  Object.isExtensible() |  Reflect.isExtensible() |
| preventExtensions  | Object.preventExtensions()  | Reflect.preventExtensions()  |
| getOwnPropertyDescriptor  | Object.getOwnPropertyDescriptor()  | Reflect.getOwnPropertyDescriptor()  |
| defineProperty  | Object.defineProperty()  | Reflect.defineProperty  |
| ownKeys  | Object.keys, Object.getOwnPropertyNames(), Object.getOwnPropertySymbols()  | Reflect.ownKeys()  |
| apply  | Calling a function  |  Reflect.apply() |
| construct  |  Calling a function with new | Reflect.construct()  |

这里的每个`trap`都会覆盖对象的内置行为，便于拦截和修改对象。如果你真的需要内置行为，可以使用相对应的`Reflect `方法。

> 开始的时候，`ES6`的规范有个`enumerate trap`,用于改变`for..in`和`Object.keys`的枚举属性，但是在实行的时候发现有些困难，于是在`ES7`中移除了。所以这里不讨论他。

### 创建一个简单的代理
当你使用`Proxy`的构造函数去创建代理的时候，他接受两个参数，一个是目标对象(target)，另外一个是处理对象(handler)。这个`handler`定义了一个或者多个`trap`去处理代理，如果没有定义`trap`，那么就会使用默认的行为。
```js
let target = {};

let proxy = new Proxy(target, {});

proxy.name = "proxy";
console.log(proxy.name);        // "proxy"
console.log(target.name);       // "proxy"

target.name = "target";
console.log(proxy.name);        // "target"
console.log(target.name);       // "target"
```
从上面这个例子可以发现，不管是`proxy`或者是`target`的属性更改，都会影响到另外一个。其实这就是这两个的关系: 
**`proxy`本身不存储这个属性，他只是把操作转发到`target`。** 上面的这个例子似乎没啥意思，并没有体现出核心`trap`的价值所在。

### 使用`set trap`验证属性
**`set trap`是在设置属性值时触发。**
`set trap`接收这几个参数:
1. `trapTarget` - 接收的属性的对象，就是代理的目标。
1. `key` - 要写入的属性的`key`(`string || symbol`)
3. `value` - 写入属性的值
4. `receiver` - 操作的对象，通常是代理

`Reflect.set`是`set trap`相对应的方法。如果属性被设置，那么`trap`应该返回`true`,如果没有被设置，那就返回`false`。`Reflect.set()`会根据操作是否成功返回正确的值。

要验证一个属性的值，那就需要使用`set` trap来检查这个值，看下面代码:
```js
let target = {
    name: "target"
};

let proxy = new Proxy(target, {
    set(trapTarget, key, value, receiver) {
        console.log(`trapTarget is ${trapTarget}, key is ${key}, value is ${value}, receiver is ${receiver}`)
        // 忽视存在的属性，以免产生影响
        if (!trapTarget.hasOwnProperty(key)) {
            if (isNaN(value)) {
                throw new TypeError("Property must be a number.");
            }
        }

        // 添加到属性
        return Reflect.set(trapTarget, key, value, receiver);
    }
});

// 添加一个新的属性
proxy.count = 1;
console.log(proxy.count);       // 1
console.log(target.count);      // 1

// 赋值给存在target上的属性
proxy.name = "proxy";
console.log(proxy.name);        // "proxy"
console.log(target.name);       // "proxy"

// 新的属性值不是数字会抛出异常
proxy.anotherName = "proxy";
```
可以发现，每次设置属性值的时候都会进行拦截判断，所以，相对的，你在获取的时候，可以使用`get`进行拦截判断。

### 使用`get trap`验证
`js`一个有趣又令人困惑的地方就是获取一个不存在的属性的时候，不会抛出异常，只会返回一个`undefined`。不像其他的大多数语言，都会抛出一个错误，可能你写了大量的代码，你可能会意识到这是一个严重的问题，比如拼写错误的这些问题，代理可以为你处理这些。

**`get`是在读取对象属性的时候用到的`trap`。** 他接收三个参数:
1. `trapTarget` - 从哪个对象读取的属性，就是target.
2. `key` - 读取的`key`
3. `receiver` - 操作的对象，通常是代理(proxy)

可以发现这个和上面的`set`差不多，就是少了一个设置的`value`参数。相对的，`Reflect.get`方法接受与`get trap`相同的三个参数，并返回属性的默认值。

```js
var proxy = new Proxy({}, {
        get(trapTarget, key, receiver) {
            if (!(key in receiver)) {
                throw new TypeError("Property " + key + " doesn't exist.");
            }

            return Reflect.get(trapTarget, key, receiver);
        }
    });

proxy.name = "proxy";
console.log(proxy.name);            // "proxy"

// 不存在这个属性，抛出错误
console.log(proxy.age);             // throws error
```
不知道你有没有发现，我们在这里使用`receiver`代替`trapTarget`配合`in`一起使用，我们将在下面介绍。

### 使用`has trap`隐藏属性的存在
`in`这个操作想来大家比较熟悉的，是确定属性是否存在对象及原型链上。
```js
var target = {
    value: 42;
}

console.log("value" in target);     // true
console.log("toString" in target);  // true
```
代理允许你使用`has`这个`trap`去返回不同的值。
**这个`has trap`是在使用`in`操作时触发。**`has trap`接收两个参数:
1. `trapTarget`
2. `key`

`Reflect.has`方法接受这些相同的参数并返回`in`运算符的默认响应。使用`has trap`和`Reflect.has`可以改变某些属性的`in`行为，同时又回退到其他属性的默认行为。例如你只想隐藏`value`属性:

```js
var target = {
    name: "target",
    value: 42
};

var proxy = new Proxy(target, {
    has(trapTarget, key) {

        if (key === "value") {
            return false;
        } else {
            return Reflect.has(trapTarget, key);
        }
    }
});


console.log("value" in proxy);      // false
console.log("name" in proxy);       // true
console.log("toString" in proxy);   // true
```
可以发现上例直接判断，如果不是`value key`,就使用`Reflect`去返回其默认行为。

### 使用`deleteProperty trap`对删除进行操作

通过[属性描述那部分](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/prototype/Property-Descriptors.md)我们知道，`delete`是通过`configurable`来控制的，非严格模式下删除会返回`false`,严格模式下会报错。但是我们可以使用代理`deleteProperty trap`去操作他这个行为。

下面我们再来看看`deleteProperty`这个`trap`。他也是接受两个参数:

1. `trapTarget`
2. `key`

`Reflect.deleteProperty`方法提供了`deleteProperty trap`相对的行为去实现。所以我们可以使用这两个去改变`delete`的默认行为。

```js
let target = {
    name: "target",
    value: 42
};

let proxy = new Proxy(target, {
    deleteProperty(trapTarget, key) {

        if (key === "value") {
            return false;
        } else {
            return Reflect.deleteProperty(trapTarget, key);
        }
    }
});

// Attempt to delete proxy.value

console.log("value" in proxy);      // true

let result1 = delete proxy.value;
console.log(result1);               // false

console.log("value" in proxy);      // true

// Attempt to delete proxy.name

console.log("name" in proxy);       // true

let result2 = delete proxy.name;
console.log(result2);               // true

console.log("name" in proxy);       // false
```

这样可以拦截操作，好奇的你可能会想去操作`nonconfigurable`的时候，也可以删除，你可以尝试一下。这个方法在受保护的属性被删除的时候，非严格模式下会抛错。

### 原型的代理`trap`
在[这个章节里](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/object.md)介绍了`setPrototypeOf`和`getPrototypeOf`。代理也为这两种情况添加了相应的`trap`。针对这两个代理的`trap`，都有不同的参数:

- setPrototypeOf
  1. `trapTarget`
  2. `proto` 这个用作原型的对象
  
他和`Reflect.setPrototypeOf`接收的参数相同，去做相对应的操作。另一方面,`getPrototypeOf`只接收一个参数`trapTarget`,相应的也存在`Reflect.getPrototypeOf`方法.

##### 原型代理是如何工作的
他们有一些限制。首先，`getPrototypeOf`只可以返回对象或者`null`,返回其他的，在运行的时候会报错。同样的，`setPrototypeOf trap`如果失败，必须返回`false`，并且`Object.setPrototypeOf`会抛错, 如果返回其他的值，那就是认为操作成功。

下面来看一个例子:

```js
var target = {};
var proxy = new Proxy(target, {
    getPrototypeOf(trapTarget) {
        return null;
    },
    setPrototypeOf(trapTarget, proto) {
        return false;
    }
});

var targetProto = Object.getPrototypeOf(target);
var proxyProto = Object.getPrototypeOf(proxy);

console.log(targetProto === Object.prototype);      // true
console.log(proxyProto === Object.prototype);       // false
console.log(proxyProto);                            // null

// succeeds
Object.setPrototypeOf(target, {});

// throws error
Object.setPrototypeOf(proxy, {});
```

从上面可以发现，对于`proxy`进行了拦截，以至于原型不同。然后对`proxy`进行`setPrototypeOf`会抛出异常，就是上面提到的，`setPrototypeOf`返回`false`,那么`Object.setPrototypeOf`会抛出错误。
当然，如果你想要使用它的默认行为，那就需要使用`Reflect`对象的方法来操作。

##### 为什么会有两套方法
让人感到困惑的是, `setPrototypeOf trap`和`getPrototypeOf trap`看起来和`Object.getPrototypeOf() or Object.setPrototypeOf()`看起来类似，为什么还要这两套方法。其实他们看起来是类似，但是还有很大的差异：

首先，`Object.getPrototype||Object.setPrototypeOf`在一开始就是为开发人员创建的高级别的操作。然而`Reflect.getPrototypeOf || Reflect.setPrototypeOf`是提供了操作以前仅仅用于内部的`[[GetPrototypeOf]] || [[SetPrototypeOf]]`的底层属性。`Reflect.getPrototypeOf`方法是内部`[[GetPrototypeOf]]`操作的包装器（带有一些输入验证）。`Reflect.setPrototypeOf`方法和`[[SetPrototypeOf]]`具有相同的关系。`Object`上的相应方法也调用`[[GetPrototypeOf]]`和`[[SetPrototypeOf]]`，但在调用之前执行几个步骤并检查返回值以确定如何操作。

上面说的比较泛泛，下面来详细说下:

如果`Reflect.getPrototypeOf`方法的参数不是对象或者`null`，则抛出错误;而`Object.getPrototypeOf`在执行操作之前首先将值强制转换为对象。

```js
var result1 = Object.getPrototypeOf(1);
console.log(result1 === Number.prototype);  // true

// throws an error
Reflect.getPrototypeOf(1);
```

很明显，`Object`上的可以工作，他把数字`1`转换成了对象，`Reflect`上的不会进行转换，所以抛出异常。

`setPrototypeOf`也有一些不同,`Reflect.setPrototypeOf`会返回一个布尔来确定是否成功，`false`就是失败。然而`Object.setPrototypeOf`如果失败，会抛出错误。

### 对象 `Extensibility trap`

`ECMAScript 5`通过`Object.preventExtensions`和`Object.isExtensible`方法添加了对象可扩展性的操作，因此`ES6`在此基础上对这两个方法添加了代理。并且这两个代理方法都只接收一个参数`trapTarget `.`isExtensible trap`必须返回布尔值来确定是否是可扩展的，`preventExtensions trap`返回布尔值确定是否成功。

`Reflect`对象里的这两个方法都会返回布尔值，所以这两个是可以作为相对应的方法去使用实现默认行为。

##### 两个简单的例子
```js
var target = {};
var proxy = new Proxy(target, {
    isExtensible(trapTarget) {
        return Reflect.isExtensible(trapTarget);
    },
    preventExtensions(trapTarget) {
        return Reflect.preventExtensions(trapTarget);
    }
});


console.log(Object.isExtensible(target));       // true
console.log(Object.isExtensible(proxy));        // true

Object.preventExtensions(proxy);

console.log(Object.isExtensible(target));       // false
console.log(Object.isExtensible(proxy));        // false
```

这个例子就是使用代理拦截并返回他的默认行为，等于默认的情况。所以经过`Object`属性操作之后，就是返回默认的行为。

如果我们不想他拓展，我们可以这样去处理：

```js
var target = {};
var proxy = new Proxy(target, {
    isExtensible(trapTarget) {
        return Reflect.isExtensible(trapTarget);
    },
    preventExtensions(trapTarget) {
        return false
    }
});


console.log(Object.isExtensible(target));       // true
console.log(Object.isExtensible(proxy));        // true

Object.preventExtensions(proxy);

console.log(Object.isExtensible(target));       // true
console.log(Object.isExtensible(proxy));        // true
```
这里他不会成功，因为返回了`false`,没有使用对应的`Reflect`去做相对的默认行为处理,所以操作不会转发到操作的目标。

##### Duplicate Extensibility Methods

如果传递对象值作为参数，方法`Object.isExtensible`和`Reflect.isExtensible`类似。如果不是对象作为参数传递，`Object.isExtensible`始终返回`false`，而`Reflect.isExtensible`则抛出错误。
```js
let result1 = Object.isExtensible(2);
console.log(result1);                       // false

// throws error, Reflect.isExtensible called on non-object
let result2 = Reflect.isExtensible(2);
```

这个限制类似于`Object.getPrototypeOf`和`Reflect.getPrototypeOf`方法之间的差异，因为具有较低级别功能的方法具有比其更高级别对应方更严格的错误检查。

`Object.preventExtensions`和`Reflect.preventExtensions`方法也非常相似。 `Object.preventExtensions`方法始终返回作为参数传递给它的值，即使该值不是对象也是如此。然而另一方面，如果参数不是对象，那么`Reflect.preventExtensions`方法会抛出错误;如果参数是一个对象，那么
`Reflect.preventExtensions`在操作成功时返回`true`，否则返回`false`。

```js
var result1 = Object.preventExtensions(2);
console.log(result1);                               // 2

var target = {};
var result2 = Reflect.preventExtensions(target);
console.log(result2);                               // true

// throws error
var result3 = Reflect.preventExtensions(2);
```
这个例子就是对上面的总结。

### Property Descriptor Traps

`ECMAScript 5`最重要的功能之一是使用`Object.defineProperty`方法定义属性具体属性的能力。在以前的JavaScript版本中，无法定义访问者属性，使属性成为只读，或使属性不可数。[具体参考这里](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/prototype/Property-Descriptors.md)

代理允许分别 **使用`defineProperty trap`和`getOwnPropertyDescriptor trap`拦截对`Object.defineProperty`和`Object.getOwnPropertyDescriptor`的调用。** `defineProperty trap`接收以下参数:

1. `trapTarget` - 被定义属性的对象(代理的目标)
2. `key`
3. `descriptor`

`defineProperty trap`返回布尔值。`getOwnPropertyDescriptor trap`只接收`trapTarget`和`key`，并且返回描述信息。相应的`Reflect.defineProperty`和`Reflect.getOwnPropertyDescriptor`方法接受与其代理`trap`对应方相同的参数。

例如：
```js
var proxy = new Proxy({}, {
    defineProperty(trapTarget, key, descriptor) {
        return Reflect.defineProperty(trapTarget, key, descriptor);
    },
    getOwnPropertyDescriptor(trapTarget, key) {
        return Reflect.getOwnPropertyDescriptor(trapTarget, key);
    }
});


Object.defineProperty(proxy, "name", {
    value: "proxy"
});

console.log(proxy.name);            // "proxy"

var descriptor = Object.getOwnPropertyDescriptor(proxy, "name");

console.log(descriptor.value);      // "proxy"
```
很简单的一个例子，基本没有在拦截上做任何操作，只是返回他的默认行为。

##### Blocking Object.defineProperty()

`trap`返回`true`时，`Object.defineProperty`表示成功;
`trap`返回`false`时，`Object.defineProperty`会抛出错误。
可以使用这个功能来限制`Object.defineProperty`方法可以定义的属性类型.如下：

```js
var proxy = new Proxy({}, {
    defineProperty(trapTarget, key, descriptor) {
        if (typeof key === "symbol") {
            return false;
        }

        return Reflect.defineProperty(trapTarget, key, descriptor);
    }
});


Object.defineProperty(proxy, "name", {
    value: "proxy"
});

console.log(proxy.name);                    // "proxy"

var nameSymbol = Symbol("name");

// throws error
Object.defineProperty(proxy, nameSymbol, {
    value: "proxy"
});
```
这里我们检测`key`的类型，如果是`symbol`就返回`false`.对于`Object.defineProperty`，返回`false`会抛出异常。

> 当然可以通过返回`true`而不调用`Reflect.defineProperty`方法使`Object.defineProperty`默认是失败的，这就避免错误的抛出。

##### Descriptor Object Restrictions

为了确保在使用`Object.defineProperty`和`Object.getOwnPropertyDescriptor`方法时的一致行为，传递给`defineProperty trap`的描述符对象被规范化。从`getOwnPropertyDescriptor trap`返回的对象总是出于同样的原因进行验证。

不管哪个参数作为第三个参数传递给`Object.defineProperty`方法，都只能是下面这几种:`enumerable `, `configurable`, `value`, `writable`, `get`, `set` 这些将被作为`descriptor `传递。例如:

```js
var proxy = new Proxy({}, {
    defineProperty(trapTarget, key, descriptor) {
        console.log(descriptor.value);              // "proxy"
        console.log(descriptor.name);               // undefined
        console.log(descriptor.writable)          // undefined
        return Reflect.defineProperty(trapTarget, key, descriptor);
    }
});


Object.defineProperty(proxy, "name", {
    value: "proxy",
    name: "custom"
});
```

可以发现，`name`不存在那几个`descriptor`里，所以传递不进去，不接收。并且这个和`Object.defineProperty`不同，没有进行一些包装，不存在默认的`writable`, `configurable`这些..。但是按理来说，你传递一个对象进行，他就应该接收啊，为啥这里会是`undefined`呢？这是因为**`descriptor`实际上不是对传递给`Object.defineProperty`方法的第三个参数的引用，而是一个仅包含允许属性的新对象。`Reflect.defineProperty`方法还会忽略描述符上的任何非标准属性**

`getOwnPropertyDescriptor`稍微有些不同，他会返回`null`, `undefined`,`object`.如果返回的是对象，那么对象只会包含上面可能出现的`descriptor`的这几种情况。

如果返回具有不允许的属性的对象，会导致错误，如下代码：
```js
var proxy = new Proxy({}, {
    getOwnPropertyDescriptor(trapTarget, key) {
        return {
            name: "proxy"
        };
    }
});

// throws error
var descriptor = Object.getOwnPropertyDescriptor(proxy, "name");
```

因为`name`不属于`descriptor`接受的范围，所以引发了错误。这个限制可确保`Object.getOwnPropertyDescriptor`返回的值始终具有可靠的结构，无论代理使用什么。

##### Duplicate Descriptor Methods

和上面的一些`trap`类似，这个也有一些让人为之困惑的类似的方法。这里的是`Object.defineProperty&Object. getOwnPropertyDescriptor `和`Reflect. defineProperty&Reflect.getOwnPropertyDescriptor`.

###### defineProperty() Methods

看看这个方法的异同.

`Object.defineProperty`和`Reflect.defineProperty`方法完全相同，只是它们的返回值有所不同。
```js
var target = {};

var result1 = Object.defineProperty(target, "name", { value: "target "});

console.log(target === result1);        // true

var result2 = Reflect.defineProperty(target, "name", { value: "reflect" });

console.log(result2);                   // true
```
可以发现，`Object.defineProperty`返回的是传入的第一个参数，`Reflect.defineProperty`返回的布尔值确定是否成功。

###### getOwnPropertyDescriptor() Methods

`Object.getOwnPropertyDescriptor`方法传入的参数是原始值的时候，会转换成对象进行处理。至于`Reflect.getOwnPropertyDescriptor`传入的不是对象，会抛出错误：

```js
descriptor1 = Object.getOwnPropertyDescriptor(2, "name");
console.log(descriptor1);       // undefined

// throws an error
descriptor2 = Reflect.getOwnPropertyDescriptor(2, "name");
```

### The ownKeys Trap

`ownKeys trap`允许你拦截内部的方法`[[OwnPropertyKeys]]`并覆盖默认的行为通过返回一组值。返回的这个数组值用于四个方法:`Object.getOwnPropertyNames`, `Object.keys`,`Object.getOwnPropertySymbols()`和`Object.assign`(`Object.assign`用于数组来确定要复制的属性)。

`ownKeys trap`的默认行为是通过`Reflect.ownKeys`来实现，返回的就是一个数组，里面包含所有的属性`keys(strings, symbols)`.
[我们知道](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/symbol.md)`Object.keys`和`Object.getOwnPropertyNames`返回的是过滤掉`symbol key`的集合，但是`Object.getOwnPropertySymbols`却是相反，所以`ownKeys`集合了这几个之后，就可以返回所有的`keys`.并且`Object.assign`作用于`strings`和`symbols`键的对象。

`ownKeys trap`接收一个参数，就是`trapTarget`。他总是返回数组或者[类似数组](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/objects/iterator.md)的值,否则会引发错误。

看下面这个例子:
```js
var proxy = new Proxy({}, {
    ownKeys(trapTarget) {
        return Reflect.ownKeys(trapTarget).filter(key => {
            return typeof key !== "string" || key[0] !== "_";
        });
    }
});

var nameSymbol = Symbol("name");

proxy.name = "proxy";
proxy._name = "private";
proxy[nameSymbol] = "symbol";

var names = Object.getOwnPropertyNames(proxy),
    keys = Object.keys(proxy);
    symbols = Object.getOwnPropertySymbols(proxy);

console.log(names.length);      // 1
console.log(names[0]);          // "name"

console.log(keys.length);      // 1
console.log(keys[0]);          // "name"

console.log(symbols.length);    // 1
console.log(symbols[0]);        // "Symbol(name)"
```
最终返回的这个数组就是得到的结果。

> `ownKeys trap`也会影响`for-in`循环，该循环调用`trap`来确定在循环内使用哪些键。

### Function Proxies with the apply and construct Traps

这个可能是比较特殊的了。在代理的所有的`trap`中，只有`apply trap`和`construct trap`这两个要求代理的`target`是必须一个`function`,我们知道 **`function`有两个内部的属性`[[Call]]`和`[[Construct]]`分别用于直接调用和`new`关键字调用的时候。因此`apply trap`在拦截直接调用的时候用到的，`construct trap`是拦截`new`调用时候用到的。**

我们先来看看直接调用的的时候，
- `apply trap`的参数:
  1. `trapTarget` 
  2. `thisArg` - 调用期间的上下文对象`this`
  3. `argumentsList` - 传递到方法的数组参数
  
<br>

再来看看`new`关键字调用时候。

- `construct trap`的参数
   1. `trapTarget`
   2. `argumentsList`

`Reflect.construct`方法也接受这两个参数，并有一个名为`newTarget`的可选第三个参数。如果给定这个第三个参数，`newTarget`这个参数就是`new.target`的值。

使用`apply`和`construct`两个`trap`就可以拦截所有的方法调用.

```js
var target = function() { return 42 },
var proxy = new Proxy(target, {
        apply: function(trapTarget, thisArg, argumentList) {
            return Reflect.apply(trapTarget, thisArg, argumentList);
        },
        construct: function(trapTarget, argumentList) {
            return Reflect.construct(trapTarget, argumentList);
        }
    });

// a proxy with a function as its target looks like a function
console.log(typeof proxy);                  // "function"

console.log(proxy());                       // 42

var instance = new proxy();
console.log(instance instanceof proxy);     // true
console.log(instance instanceof target);    // true
```
这个和上面几个类似，都是拦截之后使用它的默认行为。

##### Validating Function Parameters

下面来一个验证参数类型的例子:

```js
// adds together all arguments
function sum(...values) {
    return values.reduce((previous, current) => previous + current, 0);
}

var sumProxy = new Proxy(sum, {
        apply(trapTarget, thisArg, argumentList) {

            argumentList.forEach((arg) => {
                if (typeof arg !== "number") {
                    throw new TypeError("All arguments must be numbers.");
                }
            });

            return Reflect.apply(trapTarget, thisArg, argumentList);
        },
        construct(trapTarget, argumentList) {
            throw new TypeError("This function can't be called with new.");
        }
    });

console.log(sumProxy(1, 2, 3, 4));          // 10

// throws error
console.log(sumProxy(1, "2", 3, 4));

// also throws error
var result = new sumProxy();
```
在这里，我们对参数进行了过滤处理，并且在`new`调用的时候，直接抛出错误，不让他去`new`。

##### Calling Constructors Without new

[我们之前介绍了关于`new`](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/class.md#%E7%B1%BB%E7%9A%84%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0%E4%B8%AD%E4%BD%BF%E7%94%A8newtarget)的相关介绍，判断一个函数是不是`new`调用，需要使用`new.target`来判断。

```js
function Numbers(...values) {

    if (typeof new.target === "undefined") {
        throw new TypeError("This function must be called with new.");
    }

    this.values = values;
}

let instance = new Numbers(1, 2, 3, 4);
console.log(instance.values);               // [1,2,3,4]

// throws error
Numbers(1, 2, 3, 4);
```
可以发现，这个类似于在上面提到的使用`proxy`验证，但是这个明显更加方便一点。如果只是为了判断是否`new`调用，这个是可取的，但是有时候你需要知道做更多的控制，这个就办不到了。

```js
function Numbers(...values) {

    if (typeof new.target === "undefined") {
        throw new TypeError("This function must be called with new.");
    }

    this.values = values;
}


let NumbersProxy = new Proxy(Numbers, {
        apply: function(trapTarget, thisArg, argumentsList) {
            return Reflect.construct(trapTarget, argumentsList);
        }
    });


let instance = NumbersProxy(1, 2, 3, 4);
console.log(instance.values);               // [1,2,3,4]
```
可以发现这个，在函数内部还是有检查，但是在表面调用的时候是没有使用这个`new`的，只是我们在代理里的`apply trap`里使用了`Reflect.construct` 。

##### Overriding Abstract Base Class Constructors

可以在`Reflect.construct`内传入第三个参数，用作`new.target`的值。这可以在构造函数中检查`new.target`的值的时候用到。

```js
class AbstractNumbers {

    constructor(...values) {
        if (new.target === AbstractNumbers) {
            throw new TypeError("This function must be inherited from.");
        }

        this.values = values;
    }
}

class Numbers extends AbstractNumbers {}

let instance = new Numbers(1, 2, 3, 4);
console.log(instance.values);           // [1,2,3,4]

// throws error
new AbstractNumbers(1, 2, 3, 4);
```

上面可以发现有个限制，下面我们来试试使用代理来跳过.

```js
class AbstractNumbers {

    constructor(...values) {
        if (new.target === AbstractNumbers) {
            throw new TypeError("This function must be inherited from.");
        }

        this.values = values;
    }
}

var AbstractNumbersProxy = new Proxy(AbstractNumbers, {
        construct: function(trapTarget, argumentList) {
            return Reflect.construct(trapTarget, argumentList, function() {});
        }
    });


let instance = new AbstractNumbersProxy(1, 2, 3, 4);
console.log(instance.values);               // [1,2,3,4]
```
这样，添加了第三个参数，这样`new.target`的值就是一个另外一个值了(匿名函数)。

##### Callable Class Constructors

我们知道`class`只能被`new`去调用，这是因为在构造函数的内部方法,`[[Call]]`被指定抛出错误。但是我们使用代理可以拦截这个内部属性，所以可以改变我们的调用方法。

例如我们想不通过`new`来调用一个`class`,可以通过代理，如下：

```js
class Person {
    constructor(name) {
        this.name = name;
    }
}

var PersonProxy = new Proxy(Person, {
        apply: function(trapTarget, thisArg, argumentList) {
            return new trapTarget(...argumentList);
        }
    });


var me = PersonProxy("Nicholas");
console.log(me.name);                   // "Nicholas"
console.log(me instanceof Person);      // true
console.log(me instanceof PersonProxy); // true
```
可以发现，我们在`apply`这个`trap`对他进行了`new`一个。

### Revocable Proxies

通常情况下，绑定了代理之后都是没有办法撤掉的，但是这个可以取消，通过`Proxy.revocable`去取消。这个方法和`Proxy`的构造函数传参类似，一个`target`和一个`handler`.

他返回的对象是有两个属性：

- `proxy` - 被撤销的代理对象
- `revoke` - 调用撤销代理的函数

当`revoke`被调用的时候，就不能继续使用代理了。
```js
var target = {
    name: "target"
};

var { proxy, revoke } = Proxy.revocable(target, {});

console.log(proxy.name);        // "target"

revoke();

// throws error
console.log(proxy.name);
```
可以发现，在调用`revoke`方法之后，代理就不能继续使用了。如果调用，就会抛出错误，不会返回`undefined`。

### Solving the Array Problem

看一个关于数组的问题:

```js
let colors = ["red", "green", "blue"];

console.log(colors.length);         // 3

colors[3] = "black";

console.log(colors.length);         // 4
console.log(colors[3]);             // "black"

colors.length = 2;

console.log(colors.length);         // 2
console.log(colors[3]);             // undefined
console.log(colors[2]);             // undefined
console.log(colors[1]);             // "green"
```
在这里，`length`控制着数组的数据，一般情况下，我们没法子修改这些高级操作。

##### Detecting Array Indices

`ECMAScript 6`规范提供了有关如何确定属性键是否为数组索引的说明:

> 当且仅当`ToString(ToUint32(P))`等于`P`且`ToUint32(p)`不等于`2的32次方减1`时，字符串属性名`P`才是数组索引。

这个规范，在`js`中可以实现:
```js
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numericKey = toUint32(key);
    return String(numericKey) == key && numericKey < (Math.pow(2, 32) - 1);
}
```
`toUint32`函数使用规范中描述的算法将给定值转换为无符号的`32`位整数,`isArrayIndex`函数首先将密钥转换为`uint32`，然后执行比较以确定密钥是否为数组索引。

##### Increasing length when Adding New Elements

可以发现数组的行为，其实使用`set trap`就可以完成这两个行为。

```js
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numericKey = toUint32(key);
    return String(numericKey) == key && numericKey < (Math.pow(2, 32) - 1);
}

function createMyArray(length=0) {
    return new Proxy({ length }, {
        set(trapTarget, key, value) {

            let currentLength = Reflect.get(trapTarget, "length");

            // the special case
            if (isArrayIndex(key)) {
                let numericKey = Number(key);

                if (numericKey >= currentLength) {
                    Reflect.set(trapTarget, "length", numericKey + 1);
                }
            }

            // always do this regardless of key type
            return Reflect.set(trapTarget, key, value);
        }
    });
}

var colors = createMyArray(3);
console.log(colors.length);         // 3

colors[0] = "red";
colors[1] = "green";
colors[2] = "blue";

console.log(colors.length);         // 3

colors[3] = "black";

console.log(colors.length);         // 4
console.log(colors[3]);             // "black"
```
可以发现，上面对写入的`key`进行了验证。如果符合规范，则会给`length`进行添加操作。其他的会一直操作`key`.
现在，基于数组的length的第一个功能成立了，接下来是进行第二步。

##### Deleting Elements on Reducing length

这里就需要对减少的长度的部分进行删除了。

```js
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numericKey = toUint32(key);
    return String(numericKey) == key && numericKey < (Math.pow(2, 32) - 1);
}

function createMyArray(length=0) {
    return new Proxy({ length }, {
        set(trapTarget, key, value) {

            let currentLength = Reflect.get(trapTarget, "length");

            // the special case
            if (isArrayIndex(key)) {
                let numericKey = Number(key);

                if (numericKey >= currentLength) {
                    Reflect.set(trapTarget, "length", numericKey + 1);
                }
            } else if (key === "length") {

                if (value < currentLength) {
                    for (let index = currentLength - 1; index >= value; index\
--) {
                        Reflect.deleteProperty(trapTarget, index);
                    }
                }

            }

            // always do this regardless of key type
            return Reflect.set(trapTarget, key, value);
        }
    });
}

let colors = createMyArray(3);
console.log(colors.length);         // 3

colors[0] = "red";
colors[1] = "green";
colors[2] = "blue";
colors[3] = "black";

console.log(colors.length);         // 4

colors.length = 2;

console.log(colors.length);         // 2
console.log(colors[3]);             // undefined
console.log(colors[2]);             // undefined
console.log(colors[1]);             // "green"
console.log(colors[0]);             // "red"
```
可以发现，我们在每次`length`操作的时候，都会进行一次监听操作，用来减去他删除的部分。

##### Implementing the MyArray Class
使用代理创建类的最简单方法是像往常一样定义类，然后从构造函数返回代理。这样，实例化类时返回的对象将是代理而不是实例。（实例是构造函数内部的`this`值）。实例成为代理的目标，并返回代理，就好像它是实例一样。那么这个实例将完全私有，无法直接访问它，但可以通过代理间接访问它。
看一个简单的例子:
```js
class Thing {
    constructor() {
        return new Proxy(this, {});
    }
}

var myThing = new Thing();
console.log(myThing instanceof Thing);      // true
```

我们知道，`constructor`内返回的基本数据类型不会影响他的返回，如果是非基本类型，那么就是具体的返回对象了。所以这里返回到是`proxy`,因此这里的这个`myThing`就是这个`proxy`. 由于代理会把他的行为传递给他的目标，因此`myThing`仍然被当做是`Thing`的实例。

考虑到上面这一点，使用代理创建自定义数组类相对简单点。代码与“删除减少长度的元素”部分中的代码大致相同。使用相同的代理代码，但这一次，它在类构造函数中。

```js
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numericKey = toUint32(key);
    return String(numericKey) == key && numericKey < (Math.pow(2, 32) - 1);
}

class MyArray {
    constructor(length=0) {
        this.length = length;

        return new Proxy(this, {
            set(trapTarget, key, value) {

                let currentLength = Reflect.get(trapTarget, "length");

                // the special case
                if (isArrayIndex(key)) {
                    let numericKey = Number(key);

                    if (numericKey >= currentLength) {
                        Reflect.set(trapTarget, "length", numericKey + 1);
                    }
                } else if (key === "length") {

                    if (value < currentLength) {
                        for (let index = currentLength - 1; index >= value; i\
ndex--) {
                            Reflect.deleteProperty(trapTarget, index);
                        }
                    }

                }

                // always do this regardless of key type
                return Reflect.set(trapTarget, key, value);
            }
        });

    }
}


let colors = new MyArray(3);
console.log(colors instanceof MyArray);     // true

console.log(colors.length);         // 3

colors[0] = "red";
colors[1] = "green";
colors[2] = "blue";
colors[3] = "black";

console.log(colors.length);         // 4

colors.length = 2;

console.log(colors.length);         // 2
console.log(colors[3]);             // undefined
console.log(colors[2]);             // undefined
console.log(colors[1]);             // "green"
console.log(colors[0]);             // "red"
```
这就是利用我们上面提到的那点，返回的最终是个代理来完成这个操作。

尽管这样很容易，但是他为每一个新的实例都创建了一个代理。但是我们可以为每一个实例都共享一个代理，那就是通过原型。

### Using a Proxy as a Prototype

代理可以用作原型，但是这样会提高复杂度，比上面的实现还要复杂。当代理是原型时，仅当默认操作通常继续到原型时才会调用代理`trap`，这会将代理的功能限制为原型。如下:

```js
var target = {};
var newTarget = Object.create(new Proxy(target, {

    // never called
    defineProperty(trapTarget, name, descriptor) {

        // would cause an error if called
        return false;
    }
}));

Object.defineProperty(newTarget, "name", {
    value: "newTarget"
});

console.log(newTarget.name);                    // "newTarget"
console.log(newTarget.hasOwnProperty("name"));  // true
```
`newTarget`代理是作为一个原型对象被创建。现在，只有在`newTarget`上的操作并将操作传递到目标(`target`)上时，这样才会调用代理`trap`.

`defineProperty`在`newTarget`的基础上创建了自己的属性`name`，在对象上定义属性，不会作用到原型, [可以看下原型的影子方法](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/prototype/prototype-shadow.md)，并且不会调用代理的`defineProperty trap`,只会把这个`name`属性添加到自己的属性里。

虽然代理在用作原型时受到严重限制，但仍有一些陷阱仍然有用。

##### Using the get Trap on a Prototype
我们知道原型链的查找是现在自己的属性里查找，如果找不到会遍历原型链。因此，只需要给代理设置一个`get trap`,当查找的属性不存在的时候，就会触发原型上的`trap`。
```js
var target = {};
var thing = Object.create(new Proxy(target, {
    get(trapTarget, key, receiver) {
        throw new ReferenceError(`${key} doesn't exist`);
    }
}));

thing.name = "thing";

console.log(thing.name);        // "thing"

// throw an error
var unknown = thing.unknown;
```
可以发现，使用代理作为原型创建`thing`对象。当调用不存在的时候，会抛出错误，如果存在，便不会遍历到原型，所以不会出错。

在这个例子中，要理解`trapTarget`和`receiver`是不同的对象。**当代理当做原型使用时，`trapTarget`是原型对象本身，`receiver`是实例对象。在上例中，`trapTarget`等同于`target`, `receiver`等同于`thing`**

##### Using the set Trap on a Prototype

这个比较麻烦，如果赋值操作继续到原型，触发这个`trap`，他会根据参数情况确定是在原型上或者是在当前实例上创建属性，他的默认情况就和我们上面说的影子方法一样。这里可能有些绕，可以看看下面这个例子:

```js
var target = {};
var thing = Object.create(new Proxy(target, {
    set(trapTarget, key, value, receiver) {
        return Reflect.set(trapTarget, key, value, receiver);
    }
}));

console.log(thing.hasOwnProperty("name"));      // false

// triggers the `set` proxy trap
thing.name = "thing";

console.log(thing.name);                        // "thing"
console.log(thing.hasOwnProperty("name"));      // true

// does not trigger the `set` proxy trap
thing.name = "boo";

console.log(thing.name);                        // "boo"
```
在这个例子中，`target`没有自己的属性。 `thing`对象有一个代理作为其原型，它定义了一个`set trap`来捕获任何新属性的创建。当`thing.name`被赋值为`“thing”`作为其值时，将调用代理`set trap`，因为`thing`没有自己的`name`属性。在这个`set trap`里，`trapTarget`等于`target`，`receiver`等于`thing`。该操作最终在`thing`上创建一个新属性，幸运的是，如果你将`receiver`作为第四个参数传入，`Reflect.set`会为你实现这个默认行为。

如果不传递这个第四个`receiver`参数呢，那么就会在`原型对象上(target)`创建属性, 不会在实例上创建属性，那么就导致每次`set`都去原型操作；如果传递之后，那么在设置过一次就不会去再次触发原型上的`set trap`.

##### Proxies as Prototypes on Classes

类不可以直接修改原型做代理，因为`prototype`属性是不可写的。

```js
'use strict'
class X {}
X.prototype = new Proxy({}, {
	get(trapTarget, key, receiver){
		console.log('class prototype proxy')
	}
})
// Cannot assign to read only property 'prototype' of function 'class X {}'
```
但是，可以创建一个通过使用继承将代理作为其原型的类。首先，需要使用构造函数创建`ES5`样式类型定义。然后，用原型覆盖为代理。
```js
function NoSuchProperty() {
    // empty
}

NoSuchProperty.prototype = new Proxy({}, {
    get(trapTarget, key, receiver) {
        throw new ReferenceError(`${key} doesn't exist`);
    }
});

var thing = new NoSuchProperty();

// throws error due to `get` proxy trap
var result = thing.name;
```

函数的`prototype`属性没有限制，因此可以使用代理覆盖它。

接下来就是创建一个类去继承这个函数。

```js
function NoSuchProperty() {
    // empty
}

NoSuchProperty.prototype = new Proxy({}, {
    get(trapTarget, key, receiver) {
        throw new ReferenceError(`${key} doesn't exist`);
    }
});

class Square extends NoSuchProperty {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

var shape = new Square(2, 6);

var area1 = shape.length * shape.width;
console.log(area1);                         // 12

// throws an error because "anotherWidth" doesn't exist
var area2 = shape.length * shape.anotherWidth;
```
这样，就很好的在原型上使用了代理，一个折中的法子来实现。

我们来该写下，这样可能会更直观:
```js
function NoSuchProperty() {
    // empty
}

// store a reference to the proxy that will be the prototype
var proxy = new Proxy({}, {
    get(trapTarget, key, receiver) {
        throw new ReferenceError(`${key} doesn't exist`);
    }
});

NoSuchProperty.prototype = proxy;

class Square extends NoSuchProperty {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

var shape = new Square(2, 6);

var shapeProto = Object.getPrototypeOf(shape);

console.log(shapeProto === proxy);                  // false

var secondLevelProto = Object.getPrototypeOf(shapeProto);

console.log(secondLevelProto === proxy);            // true
```
这里，把代理存在变量中，更加直观。在这里`shape`的原型是`Square.prototype`,不是`proxy`。但是`Square.prototype`的原型是代理，因为他继承自`NoSuchProperty`。
