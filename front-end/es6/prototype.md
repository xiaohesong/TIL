- defineProperty

这个是定义一个原型。
```javascript
let p = {}
Object.definePrototype(p, 'name', {
    value: function(){console.log('i am name')}
})
```
这个是定义一个name属性。

- definePrototypies

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

- Object.getPrototypeOf(obj)

这个是获取一个原型

- Object.setPrototypeOf(original, newer)

这个是设置新的原型
