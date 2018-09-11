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
- 尝试在类方法中覆盖类名会出错。

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

