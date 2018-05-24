阅读[object序列](https://leanpub.com/understandinges6/read#leanpub-auto-more-powerful-prototypes)

- es5的`getPrototypeOf`

通过`getPrototypeOf`是可以获取到对象的原型。但是需要与其对应的去改变原型的方法。于是就出现了es6中的`setPrototype`.

- es6中的`setPrototypeOf`

相应的，通过`setPrototypeOf`去改变原型。
他接受两个参数，第一个是待改变的对象，第二个参数是需要改变成的原型对象。

```javascript
class Person {
  constructor() {
    this.name = 'xiaocai'
  }
}

class Child {}

p = new Person
c = new Child

console.log(p.name) // xiaocai
console.log(c.name) // undefined

console.log(c._proto_) // class Child
Object.getPrototypeOf(c) //constructor:class Child
// getPrototypeOf 就是利用的 _proto_

Object.setPrototypeOf(c, p)
Object.getPrototypeOf(c).constructor === Person // true

```
通过上面可以发现，`setPrototypeOf`把`c`对象的原型设置成了`p`的原型。
