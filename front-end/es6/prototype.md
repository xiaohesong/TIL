#### definePrototype

- defineProperty

这个是定义一个原型。
```javascript
let p = {}
Object.definePrototype(p, 'name', {
    value: function(){console.log('i am name')}
})
```
这个是定义一个name属性。

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

