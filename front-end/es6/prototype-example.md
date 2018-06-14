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

为什么赋值会在实例上形成自己的实例对象？[you don't known js - Setting & Shadowing Properties](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#setting--shadowing-properties)

- second 原型链继承

```javascript
function First() {
  this.firstName = 'firstName'
}

First.prototype.getFirstName = function(){
  return this.firstName
}

function Second() {
  this.secondName = 'secondName'
}

Second.prototype = new First

Second.prototype.getSecondName = function(){
  return this.secondName
}

let first = new First
let second = new Second

second.getFirstName() //firstName
second.getSecondName() //secondName
first.getSecondName() // error

second.constructor === First //true
second.__proto__ === Second.prototype
```

 
`Second.prototype = new First`指向了一个新的对象，这个仅仅改变了构造函，现在构造函数是`First`,但是原型却没有改变，`second`的原型还是`Second`,只是原型是继承自`First`。

再看看下面的这个：

```javascript
Second.prototype = new First //1
Second.prototype.constructor = Second //2
```
`2`这个是相当于在`1`的基础上把构造函数给改回成`Second`， 相当于在只存在原型继承。


