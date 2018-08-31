#### defineProperty

- defineProperty

这个是定义一个原型。
```javascript
let p = {}
Object.definePrototype(p, 'name', {
    value: function(){console.log('i am name')}
})
```
这个是定义一个name属性。

> 注意：`defineProperty`定义的属性，属性特性(writable, configurable, enumerable)是false, 而字面量创建的对象，默认是false. [Property Descriptors](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch3.md#property-descriptors)

- defineProperties

这个是在原型上定义多个属性

```javascript
let person = {}
Object.defineProperties(person, {
	names: {
		value: 'name'
	},
	age: {
		value: 'age'
	}
})
```

`defineProperties`和`defineProperty`定义的数据属性，若不指定，默认的内部属性为`false`

- {}
这种是属于字面量创建了，默认的内部属性都是`true`.
  - 数据属性(`Configurable`, `Enumerable`, `Writeable`)默认都是`true`, `Value`是`undefined`.
  - 访问器属性(`Configurable`, `Enumerable`, `Get`, `Set`)中前两个默认为`true`, 后两个默认为`undefined`

- Object.getPrototypeOf(obj)

这个是获取一个原型

- Object.setPrototypeOf(original, newer)

这个是设置新的原型,在es6中出.
 
- obj.hasOwnProperty
这里是可以判断是否在实例上存在对应的属性。
```javascript
let P = function(){}
P.prototype.name = 'xhs'
let p = new P
p.hasOwnProperty("name") // false
P.hasOwnProperty('name') // true
```
只是在对应的目标对象上发生作用。

- constructor

> 这个东西比较容易搞混淆。`constuctor`并不是说函数是一个`constructor`,而是说被`new`关键字调用的函数才是构造函数。

[constructor介绍](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#constructor-or-call)

所以可以看出一些区别来。
```javascript
function Foo() {this.name = 'foo-name'}
function Bar() {this.name = 'bar-name'}
```
针对于上面这点，[我们来继承](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#prototypal-inheritance)。
```javascript
Foo.prototype = Bar.prototype //1
Foo.prototype = new Bar //2
Foo.prototype = Object.create(Bar.prototype) //3
```
[//3在es6中的写法](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/object.md#es6%E4%B8%AD%E7%9A%84setprototypeof)
  - //1的情况
  他是直接继承自Bar的原型的对象，`Foo`原型上有任何更改，都会作用于`Bar`的原型.
  ```javascript
  const f = new Foo
	b = new Bar
  Foo.prototype.friends = ['john', 'issac']
  console.log(Bar.prototype.friends) //['john', 'issac']
  console.log(b.friends) // ['john', 'issac']
  ```

  - //2的情况
  他是作为一个构造函数去继承，这样会产生副作用,他会继承Bar的构造函数。
  ```javascript
  function Person() {
    this.name = 'person name'
    this.age = 18
    this.friends = []
  }

  function Child() {
    this.name = 'child name'
  }

  Child.prototype = new Person // new Person is: {name: "person name", age: 18, friends: Array(0)}
  Child.prototype //Person {name: "person name", age: 18, friends: Array(0)}
  let c = new Child
  c.age // 18
  c.friends.push('c')
  let c2 = new Child
  c2.friends // ['c'],这样就会出现副作用(因为把Person的构造函数对象放在了Child的原型上，导致在原型上直接操作)
  ```

  - //3的情况
  这个就只是单纯的继承，不会出现副作用。
  ```javascript
  function Person() {
    this.name = 'person name'
    this.age = 18
  }

  function Child() {
    this.name = 'child name'
  }
  
  Person.prototype.friends = []

  Child.prototype = Object.create( Person.prototype ) // Object.create(Person.prototype)不会创建实例方法，只会继承prototype方法，但是如果直接操作也会有问题

  Child.prototype //Person {}
  let c = new Child
  c.age // undefined, 这里说明不会继承构造函数对象(因为压根就没有使用构造函数~.~)
  c.friends.push('c')
  (new Child).friends // ['c'], 可以发现，这也也是有问题的。这点不难理解吧，因为Object.create( Person.prototype )把Person的原型方法给了Child的prototye,导致直接操作原型的本身了。
  ```
  
  //3 和 //2的区别就是 //2可以获得原型及实例的方法，但是//3只会获得原型链上的方法，不会获得实例上的方法。

这几种不能单纯的说好或者不好，毕竟每种都有他应用的场景。
  
具体可以参考[(Prototypal) Inheritance](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#prototypal-inheritance)
