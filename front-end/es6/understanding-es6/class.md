# [ES6 class](https://leanpub.com/understandinges6/read#leanpub-auto-introducing-javascript-classes)

### class基本声明

在说`class`之前，想必大家肯定会想到`constructor function`. 看下面代码：
```js
function Foo(name) {
  this.name = name
}

class Bar {
  constructor(name){
    this.name = name
  }
}
f = new Foo('xhs')
b = new Bar('xhs')
```

两个差不多吧，`foo function`是在`new`的时候，把`this`指向当前的新创建的空对象，并且会把进行属性分配。`bar class`是在`constructor`里进行接收参数。

但是两个还是 **有些不同**

- `class`声明并不像`function`声明，他不存在提升。他类似`let`声明，存在`TDZ(temporal dead zone)`。
- `class`中的代码都会自动的使用严格模式，没办法选择。
- 所有的方法都是不可枚举的(`non-enumerable`), 注：非绑定当前对象的方法。
- `class`内所有方法内部都缺少`[[Construct]]`方法，所以如果对这些方法进行`new`会出错。
- 不携带`new`操作符调用`class`会报错。
- 尝试在类的方法中改变类名会出错。

考虑到上面这几点，下面来看一个等价的例子：

```js
class PersonClass {

    // equivalent of the PersonType constructor
    constructor(name) {
        this.name = name;
    }

    // equivalent of PersonType.prototype.sayName
    sayName() {
        console.log(this.name);
    }
}
```
上面的代码将等价下面无`class`的语法
```js
// direct equivalent of PersonClass
let PersonType2 = (function() {

    "use strict";

    const PersonType2 = function(name) {

        // make sure the function was called with new
        if (typeof new.target === "undefined") {
            throw new Error("Constructor must be called with new.");
        }

        this.name = name;
    }

    Object.defineProperty(PersonType2.prototype, "sayName", {
        value: function() {

            // make sure the method wasn't called with new
            if (typeof new.target !== "undefined") {
                throw new Error("Method cannot be called with new.");
            }

            console.log(this.name);
        },
        enumerable: false,
        writable: true,
        configurable: true
    });

    return PersonType2;
}());
```

我们来分析上面这个无`class`语法的代码段。

首先注意到这里有两个`PersonType2`的声明(`let`声明在作用域外面，`const`在`IIFE`里)，这个就是禁止类方法覆盖类名。
在构造方法里有`new.target`来检测确保通过`new`调用，与之相对的是对方法的检测，排除`new`方法调用的可能，否则抛错。在下面就是`enumerable: false`，最后返回这个构造函数.
虽然上面的代码可以实现`class`的效果，但是明显，`class`更加简洁方便。

类的常量名称。

常量是不可被改变的，否则就会报错。类的名称只是在内部使用`const`,这就意味着在内部不可以改变名称，外面却可以。

```js
class Foo {
   constructor() {
       Foo = "bar";    // 执行的时候报错。
   }
}

// 这里不会报错。
Foo = "baz";
```

### class表达式

`class`和`function`类似，也可以使用表达式。

```js
let PersonClass = class {
    // equivalent of the FunctionName constructor
    constructor(name) {
        this.name = name;
    }
    // equivalent of FunctionName.prototype.sayName
    sayName() {
        console.log(this.name);
    }
};
```
可以发现，表达式语法类似，使用`class`的表达式还是声明都只是风格的不同，**不像构造函数的声明和表达式有着提升的区别。**

当然，上面的表达式是一个匿名表达式，我们可以创建一个携带名称的表达式。
```js
let PersonClass = class PersonClass2 {
    constructor(name) {
        this.name = name;
    }
    sayName() {
        console.log(this.name);
    }
};
console.log(typeof PersonClass);        // "function"
console.log(typeof PersonClass2);  // undefined
```
可以发现上面输出`PersonClass2`是未定义，因为他只有存在类定义中, 如需了解，我们做下面的一个转变:
```js
// direct equivalent of PersonClass named class expression
let PersonClass = (function() {

    "use strict";

    const PersonClass2 = function(name) {

        // make sure the function was called with new
        if (typeof new.target === "undefined") {
            throw new Error("Constructor must be called with new.");
        }

        this.name = name;
    }

    Object.defineProperty(PersonClass2.prototype, "sayName", {
        value: function() {

            // make sure the method wasn't called with new
            if (typeof new.target !== "undefined") {
                throw new Error("Method cannot be called with new.");
            }

            console.log(this.name);
        },
        enumerable: false,
        writable: true,
        configurable: true
    });

    return PersonClass2;
}());
```
这个转变与上面的**`class`声明**略有不同，`class`声明的时候，内部与外部的名称相同，但是在**`class`表达式** 中，却不同。

### `Classes`第一等公民
在编程世界中，当某个东西可以作为一个值使用时，这意味着它可以被传递到函数中，从函数返回，可以分配给变量，它被认为是一等的公民。所以在`javascript`中，`function`是第一等公民.
`ES6`中使用`class`沿用了这一传统，所以`class`有很多方式去使用它，下面来看将他作为一个参数：
```js
function createObject(classDef) {
    return new classDef();
}
let obj = createObject(class {
    sayHi() {
        console.log("Hi!");
    }
});
obj.sayHi();        // "Hi!"
```

`class`有一个有意思的是使用立即执行来创建单例
```js
let person = new class {
    constructor(name) {
        this.name = name;
    }
    sayName() {
        console.log(this.name);
    }
}("xhs");
person.sayName();       // "xhs"
```
这样就创建了一个单例。

### 访问的属性
虽说应该是在`class constructor`中定义自己的一些属性，但是`class`允许你在原型上通过`set&get`来定义获取属性。

```js
class CustomHTMLElement {
    constructor(element) {
        this.element = element;
    }
    get html() {
        return this.element.innerHTML;
    }
    set html(value) {
        this.element.innerHTML = value;
    }
}

var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLElement.prototype,\
 "html");
console.log("get" in descriptor);   // true
console.log("set" in descriptor);   // true
console.log(descriptor.enumerable); // false
```
他类似下面这种无class的情况:
```js
// direct equivalent to previous example
let CustomHTMLElement = (function() {
    "use strict";
    const CustomHTMLElement = function(element) {     
        if (typeof new.target === "undefined") {
            throw new Error("Constructor must be called with new.");
        }
        this.element = element;
    }
    Object.defineProperty(CustomHTMLElement.prototype, "html", {
        enumerable: false,
        configurable: true,
        get: function() {
            return this.element.innerHTML;
        },
        set: function(value) {
            this.element.innerHTML = value;
        }
    });

    return CustomHTMLElement;
}());
```
可以发现，最终都是在`Object.defineProperty`中处理。

### Generator 方法
`class`内部的方法是支持`generator`方法的。

```js
class Collection {

    constructor() {
        this.items = [];
    }

    *[Symbol.iterator]() {
        yield *this.items.values();
    }
}

var collection = new Collection();
collection.items.push(1);
collection.items.push(2);
collection.items.push(3);

for (let x of collection) {
    console.log(x);
}
```
对于`generator`和`iterator`不了解的，[可在此了解](https://github.com/xiaohesong/til/blob/master/front-end/es6/understanding-es6/iterators%26generators.md)

### Static 成员
在`es6`之前，使用静态方法需要像下面这般处理：
```js
function PersonType(name) {
    this.name = name;
}

// static method
PersonType.create = function(name) {
    return new PersonType(name);
};

// instance method
PersonType.prototype.sayName = function() {
    console.log(this.name);
};

var person = PersonType.create("xhs");
```
现在在`es6`中只需要添加关键字`static`即可:
```js
class PersonClass {

    // equivalent of the PersonType constructor
    constructor(name) {
        this.name = name;
    }

    // equivalent of PersonType.prototype.sayName
    sayName() {
        console.log(this.name);
    }

    // equivalent of PersonType.create
    static create(name) {
        return new PersonClass(name);
    }
}

let person = PersonClass.create("xhs");
```

### 派生继承
在`es6`之前，实现一个继承是有多种方式，适当的继承有以下步骤:
```js
function Rectangle(length, width) {
    this.length = length;
    this.width = width;
}

Rectangle.prototype.getArea = function() {
    return this.length * this.width;
};

function Square(length) {
    Rectangle.call(this, length, length);
}

Square.prototype = Object.create(Rectangle.prototype, {
    constructor: {
        value:Square,
        enumerable: true,
        writable: true,
        configurable: true
    }
});

var square = new Square(3);
console.log(square.getArea());              // 9
console.log(square instanceof Square);      // true
console.log(square instanceof Rectangle);   // true
```
`Square`继承自`Rectangle`,这使得`Square.prototype`需继承自`Rectangle.prototype`,并且调用到`new Rectangle`(`Rectangle.call(this, length, length)`),这经常会迷惑一些新手。
所以出现了`es6`的继承，他使得更加容易了解.
```js
class Rectangle {
    constructor(length, width) {
        this.length = length;
        this.width = width;
    }

    getArea() {
        return this.length * this.width;
    }
}

class Square extends Rectangle {
    constructor(length) {

        // same as Rectangle.call(this, length, length)
        super(length, length);
    }
}

var square = new Square(3);

console.log(square.getArea());              // 9
console.log(square instanceof Square);      // true
console.log(square instanceof Rectangle);   // true
```
直接通过`extends`来继承，子类中通过`super `来调用父类的构造函数，并传递参数。
这样从其他类继承的类称为派生类，派生类在出现的`constructor`中需要指定`super()`,否则会出错。如果不出现 `constructor`,则默认会添加`constructor`.

> 使用`super()`的时候，需要记住下面这几点
    1. 你只可以在派生类(`extends`)中使用`super()`,否则会出错。
    2. `constructor`中的`super()`使用必须在`this`之前使用，因为他负责一些初始化，所以在此之前使用`this`会出错。
    3. 派生类中避免使用`super()`的唯一方法是在`constructor`返回一个对象(非原始类型)。

### `class`的影子方法
这个类似于原型链的`property`,因为派生类是继承的，所以可能存在同名的方法。
具体的关于[shadowing property](https://github.com/xiaohesong/til/blob/master/front-end/javascript/prototype/prototype-shadow.md)

### 继承静态成员
这个就类似派生继承里的方法，也可以被继承。

### 表达式派生的类
只要一个表达式内部存在`[[Constructor]]`并且有`prototype`,那就可以被`extends`.
看下面这个例子：
```js
let SerializableMixin = {
    serialize() {
        return JSON.stringify(this);
    }
};

let AreaMixin = {
    getArea() {
        return this.length * this.width;
    }
};

function mixin(...mixins) {
    var base = function() {};
    Object.assign(base.prototype, ...mixins);
    return base;
}

class Square extends mixin(AreaMixin, SerializableMixin) {
    constructor(length) {
        super();
        this.length = length;
        this.width = length;
    }
}

var x = new Square(3);
console.log(x.getArea());               // 9
console.log(x.serialize());             // "{"length":3,"width":3}"
```
他仍然可以工作，因为`mixin`方法返回的是一个`function`.满足`[[Constructor]]`和`prototype`的要求。可以发现这里例子中，虽然基类是空的，但是仍然使用了`super()`，否则报错. 如果`mixin`中有多个相同的`prototype`,则以最后一个为准。

>`extends`后面可以使用任何的表达式，但是并不是所有的表达式都会生成有效的类。有这些情况是不可以的。
> - null
> - generator function
在这些情况下，尝试使用`new`去实例化一个对象，会报错，因为这些内部不存在`[[Constructor]]`

### 继承内部的属性
自从数组存在，开发者几乎都想通过继承定制自己的数组类型，在`es5`及更早之前的版本，这几乎是不可能的。使用经典继承并不会使代码正常运行。
例如：
```js
// 内置的数组行为
var colors = [];
colors[0] = "red";
console.log(colors.length);         // 1

colors.length = 0;
console.log(colors[0]);             // undefined

// es5中尝试数组继承

function MyArray() {
    Array.apply(this, arguments);
}

MyArray.prototype = Object.create(Array.prototype, {
    constructor: {
        value: MyArray,
        writable: true,
        configurable: true,
        enumerable: true
    }
});

var colors = new MyArray();
colors[0] = "red";
console.log(colors.length);         // 0

colors.length = 0;
console.log(colors[0]);             // "red"
```
可以发现，这个是不能继承内部的属性。`es6`的一个目标就是继承内部的属性方法。因此`es6 class`的继承和`es5`的经典继承略有不同：
**`ES5`的经典继承首先调用的是派生类中的`this`,然后基类的构造函数再被调用，这就意味着`this`是作为派生类的第一个实例开始。基类的其他属性进行修饰**
`ES6`的`class` 却是恰恰相反:
**`ES6`的`class`继承，`this`首先是由基类来创建，后面通过派生类的构造函数来改变。这样才会导致开始就是由基类内置的功能来接收所有的功能**
再来看看下面的例子:
```js
class MyArray extends Array {
    // empty
}

var colors = new MyArray();
colors[0] = "red";
console.log(colors.length);         // 1

colors.length = 0;
console.log(colors[0]);             // undefined
```
这样就会完全继承`Array`的内置功能。

### Symbol.species属性
`extends`一个有趣的事情就是任何继承了内置的功能，最终返回。内置的实例都会自动返回到派生类的实例。例如上面的`MyArray`继承自`Array`，像`slice`这样返回的是`MyArray`这个派生类的实例。
```js
class MyArray extends Array {
    // empty
}

let items = new MyArray(1, 2, 3, 4),
    subitems = items.slice(1, 3);

console.log(items instanceof MyArray);      // true
console.log(subitems instanceof MyArray);   // true
```
在上面的代码中，`MyArray`实例返回`slice()`方法.正常情况下, `slice()`方法继承自`Array`并且返回`Array`的实例。实际上是`Symbol.species`在幕后进行改变。

`Symbol.species`是用来定义返回函数的一个静态访问器属性，这个返回的函数是每当需要在实例方法内创建实例的时候使用到的构造函数(而不是直接使用构造函数)。


以下的内置类型定义了`Symbol.species`:
- Array
- ArrayBuffer
- Map
- Promise
- Set
- RegExp
- Typed Arrays

上面的每一个都有默认的`Symbol.species`,他返回`this`，意味着该属性始终返回构造函数。

我们来定义一个带有`Symbol.species`的类
```js
class MyClass {
    static get [Symbol.species]() {
        return this;
    }

    constructor(value) {
        this.value = value;
    }

    clone() {
        return new this.constructor[Symbol.species](this.value);
    }
}
```
可以发现上面这段代码，有个静态的访问器属性，而且也可以看到上面只有`getter`,并没有`setter`,因为要修改内置的类型，这是不可能的。
**所有调用`this.constructor[Symbol.species]`的都会返回派生类** `MyClass`. 如`clone`调用了，并且返回了一个新的实例。
再看下面的例子:
```js
class MyClass {
    static get [Symbol.species]() {
        return this;
    }

    constructor(value) {
        this.value = value;
    }

    clone() {
        return new this.constructor[Symbol.species](this.value);
    }
}

class MyDerivedClass1 extends MyClass {
    // empty
}

class MyDerivedClass2 extends MyClass {
    static get [Symbol.species]() {
        return MyClass;
    }
}

let instance1 = new MyDerivedClass1("foo"),
    clone1 = instance1.clone(),
    instance2 = new MyDerivedClass2("bar"),
    clone2 = instance2.clone();

console.log(clone1 instanceof MyClass);             // true
console.log(clone1 instanceof MyDerivedClass1);     // true
console.log(clone2 instanceof MyClass);             // true
console.log(clone2 instanceof MyDerivedClass2);     // false
```

在上面的代码中：
1. `MyDerivedClass1`继承自`MyClass`并且**没有改变`Symbol.species`属性**, 返回了`MyDerivedClass1`的实例。
2. `MyDerivedClass2`继承自`MyClass`并且**改变了`Symbol.species`属性**返回`MyClass`.当`MyDerivedClass2`实例调用`clone`方法的时候，返回的是`MyClass`的实例.
使用`Symbol.species`，任何派生类都可以确定方法返回实例时返回的值的类型。

例如，`Array`使用`Symbol.species`指定用于返回数组的方法的类。在从`Array`派生的类中，可以确定从继承方法返回的对象类型。如下：
```js
class MyArray extends Array {
    static get [Symbol.species]() {
        return Array;
    }
}

let items = new MyArray(1, 2, 3, 4),
    subitems = items.slice(1, 3);

console.log(items instanceof MyArray);      // true
console.log(subitems instanceof Array);     // true
console.log(subitems instanceof MyArray);   // false
```
上面的代码是重写了`Symbol.species`,他继承自`Array`.所有继承的数组的方法，这样使用的就是`Array`的实例，而不是`MyArray`的实例.

**通常情况下，要想在类方法中使用`this.constructor`方法，就应该使用`Symbol.species`属性.**

### 类的构造函数中使用`new.target`
你可以在类的构造函数中使用`new.target`去确定`class`是如何被调用的。一些简单的情况之下，`new.target`等于方法或者类的构造函数.
```js
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}

// new.target is Rectangle
var obj = new Rectangle(3, 4);      // outputs true
```
因为`class`调用必须使用`new`,所以这种情况下就等于`Rectangle(constructor name)`. 但是值却不总是一样，如下：
```js
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}

class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
}

// new.target is Square
var obj = new Square(3);      // outputs false
```
可以发现，这里就不是`Rectangle`了，而是`Square`.这个很重要，他可以根据调用方式来判断当前的`target`.
基于上面这点，我们就可以定义一个不可以被实例化的基类。例如:
```js
// abstract base class
class Shape {
    constructor() {
        if (new.target === Shape) {
            throw new Error("This class cannot be instantiated directly.")
        }
    }
}

class Rectangle extends Shape {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

var x = new Shape();                // throws error

var y = new Rectangle(3, 4);        // no error
console.log(y instanceof Shape);    // true
```

> 注意： 因为`class`必须使用`new`调用，因此`new.target`在构造函数中永远不可能是`undefined`
