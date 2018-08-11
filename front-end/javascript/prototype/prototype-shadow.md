关于[shadow property](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#setting--shadowing-properties)， 并不是一直存在。

```javascript
let exampleObj = {name: 'xiaohesong'}
let obj = Object.create(exampleObj)
```

按照`you dont known js`里说的，一句话概括，就是当前对象的原型链上存在某一个属性，比如上面的`name`属性，并且这个`name`是`writable: true`的, 而且这个属性(例如`name`)没有进行[setter](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch3.md#getters--setters)，那么如果`obj.name = 'xx'`,就会在`obj`上创建一个`shadow property`(`name`).

如果上层链的是`read-only`(`writable: false`),那么严格模式下会报错，如果不是严格模式，那就忽略 不做处理，不会触发`shadow`。

如果上层链的是setter，那么每次`obj.name='xx'`都会调用上层链的setter,并且不会重新定义setter.

当然了，如果你真的很想做一个`shadow property`, 可以不实用`obj.name = 'xx'`这种，使用`obj.defineProperty`.
