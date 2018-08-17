拓展运算符用的比较多，他的特性有哪些呢？

代码是最直观的了。

`basic example`
```js
const man = {
  name: 'xhs',
  age: 18
}

const company = {
  name: 'pinee',
  depart: {
    name: 'dev'
  }
}
```

`example1`
```javascript
Object.defineProperty(man, 'sex', {
    value: 'nan',
    writable: true,
    configurable: true
})
man //{name: "xhs", age: 18, sex: "nan"}
{...man} //{name: "xhs", age: 18}
```
由上面可以发现 **扩展运算符不支持`enumerable: false`的属性**。

```js
const man2 = Object.create(man, {  
  gf: {
    value: 'lucia',
    enumerable: true
  }
});
man2 //{gf: "lucia"}
man2.name // xhs
man2.hasOwnProperty('name') // false
man2.hasOwnProperty('gf') // true

const man3 = {...man2}
man3 // {gf: "lucia"}
```
由上面可以发现，**扩展运算符只会显示出自有的属性，不会展示继承的属性**。

`example3`
```js
const company2 = {...company}
company2 === company // false
company2.depart === company.depart // true
```
可以发现，嵌套的引用的是一个对象。因为 **他是一个浅拷贝**，只克隆对象本身，不会拷贝嵌套实例。

当然，也可以嵌套解决
```js
c3 = {...company, depart: {...company.depart}}
c3.depart === company.depart //false
```

`example3`

```js
class Bar {
    constructor(){
        this.name = 'bar-name'
        this.age = 18
    }

    info() {
      return `name is ${this.name}, age is ${this.age}`
    }
}
const b = new bar
b.name // bar-name
b.info() // "name is bar-name, age is 18"
Bar.prototype.info() // "name is bar-name, age is 18"
b.constructor.name // Bar

b2 = {...b}
b2.name // 'bar-name'
b2.info() //error
b2.constructor // Object
```

可以发现，**扩展运算符存在原型属性丢失的情况** 。
因为b的构造函数是`Bar`, b2的构造函数是Object, `info`是存在`Bar`的原型的对象上。


* 扩展运算符不会扩展`enumerable: false`的属性.
* 只会扩展自有属性，不会扩展继承的属性
* 他是一个浅拷贝
* 原型属性丢失
