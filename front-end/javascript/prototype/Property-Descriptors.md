### [属性描述](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch3.md#property-descriptors)，

其实主要就是针对(writable, enumerable, configurable).

获取属性描述可通过`Object.getOwnPropertyDescriptors(you object)`。

```javascript
var myObject = {
	a: 2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//    value: 2,
//    writable: true,
//    enumerable: true,
//    configurable: true
// }

```

> 针对于这个属性特性，需要提示的就是字面量创建的对象属性和`defineProperty`创建的对象属性，是不同的，字面量创建的对象属性的特性都是`true`,   `defineProperty`恰恰相反.

##### `writable`

这个特性主要负责对象属性是否可变。

```javascript
let obj = {}
Object.defineProperty( obj, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

obj.a = 3;

obj.a; // 2
```

由上代码可以看出，赋值无效。 如果在严格模式下，赋值会报错。

##### `configurable`

这个就是控制是否可配置，如果这个属性是`true`,那就可以使用`defineProperty`对属性进行配置。

```javascript
var myObject = {
	a: 2
};

myObject.a = 3;
myObject.a;					// 3

Object.defineProperty( myObject, "a", {
	value: 4,
	writable: true,
	configurable: false,	// not configurable!
	enumerable: true
} );

myObject.a;					// 4
myObject.a = 5;
myObject.a;					// 5

Object.defineProperty( myObject, "a", {
	value: 6,
	writable: true,
	configurable: true,
	enumerable: true
} ); // TypeError
```

可以看出来，报错了。如果`configurable: false`，那么就不可以进行配置了。而且不管是否为严格模式，都会报错。并且注意，这个是一个 **单项操作，不可逆**

同时，`delete`操作也是通过`confirurable` 来进行控制的。

```javascript
var myObject = {
	a: 2
};

myObject.a;				// 2
delete myObject.a;
myObject.a;				// undefined

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: false,
	enumerable: true
} );

myObject.a;				// 2
delete myObject.a;
myObject.a;				// 2
```

可以发现，删除属性失败，因为`configurable`是`false`

我们知道，`Object.freeze`可以冻结对象，就是不能操作。可以看下

```javascript
let o = {name: 'xiaohesong'}
Object.getOwnPropertyDescriptors(o)
Object.freeze(o)
Object.getOwnPropertyDescriptors(o)
```

可以发现，上面的`freeze`方法导致对象的`writable`和`configurable`改成了`false`.

##### `enumerable`

这个是控制属性是否显示，例如`for .. in`循环中，`false`便不会显示。


#### 其他实用方法

##### Prevent Extensions
这个属性是关闭后续拓展，对原有属性保留操作(writable, configurable, enumerable 均为 true)。
```javascript
var myObject = {
	a: 2
};

Object.preventExtensions( myObject );
myObject.a = 3
myObject.b = 3;
myObject.a // 3
myObject.b; // undefined
```
使用`Object.defineProperty`也不行.

严格模式下，`myObject.b`会报错。

##### Seal

这个是在`preventExtensions`方法的基础上，设置所有现有属性Obj`confirurable: false`, 使其封闭, 不可配置，不可删除, 但是可以修改，因为`writable`是``true.
由上面知道,`delete`由`configurable`控制。

##### freeze
上面有提到过`freeze`是使`configurable`和`writable`都为`false`.其实就是在`seal`的基础上，使所有存在的属性的`writable`为`false`。
