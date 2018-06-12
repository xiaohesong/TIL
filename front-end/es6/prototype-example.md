- first

```javascript
function Person() {}

Person.prototype.name = 'xiaohesong'
Person.prototype.types = ['student']

let p1 = new Person
let p2 = new Person

p1.types.push('man')
console.log(p2.types) // ['student', 'man']
p2.types = ['teacher', 'woman']
console.log(p2.types) // ['teacher', 'woman']
```

为啥？不要想太多，因为push是直接在原型的属性上操作的，所以原型被改变了。如果是赋值，那么只会在对应的实例上进行操作。
