阅读[object序列](https://leanpub.com/understandinges6/read#leanpub-auto-more-powerful-prototypes)

##### es5的`getPrototypeOf`

通过`getPrototypeOf`是可以获取到对象的原型。但是需要与其对应的去改变原型的方法。于是就出现了es6中的`setPrototype`.

##### es6中的`setPrototypeOf`

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

##### `getPrototypeOf`和`setPrototypOf`

既然`getPrototypeOf`可以获取到原型对象，为啥还要引入`spuer`呢。我们先看一个例子。

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

let dog = {
    getGreeting() {
        return "Woof";
    }
};


let friend = {
    getGreeting() {
        return Object.getPrototypeOf(this).getGreeting.call(this) + ", hi!";
    }
};

// set prototype to person
Object.setPrototypeOf(friend, person);
console.log(friend.getGreeting());                      // "Hello, hi!"
console.log(Object.getPrototypeOf(friend) === person);  // true

// set prototype to dog
Object.setPrototypeOf(friend, dog);
console.log(friend.getGreeting());                      // "Woof, hi!"
console.log(Object.getPrototypeOf(friend) === dog);     // true
```
> ⚠️碰到的理解误区，`call`只是改变上下文环境，不是改变调用函数主体。文末解释。

可以发现上面这个是可以实现对应的方法调用，但是试试其他的情况。

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

// prototype is person
let friend = {
    getGreeting() {
        return Object.getPrototypeOf(this).getGreeting.call(this) + ", hi!";
    }
};
Object.setPrototypeOf(friend, person);


// prototype is friend
let relative = Object.create(friend);

console.log(person.getGreeting());                  // "Hello"
console.log(friend.getGreeting());                  // "Hello, hi!"
console.log(relative.getGreeting());                // error!
```
上面会出错，堆栈溢出，为啥?
`relative.getGreeting()`的调用顺序:
`relative`不存在这个`getGreeting`，他会去原型寻找，现在`relative`的原型是`friend`.所以会调用到`Object.getPrototypeOf(this).getGreeting.call(this)`. 这个时候的`Object.getPrototypeOf(this)`就是`friend`，按理说这个时候就是相当于
在调用`friend.getGreeting()`，这个时候会再次执行`Object.getPrototypeOf(this)`,就相当于是`person.getGreeting()`了，但是并不是这样的，他在最后`call this`，绑定了当前的执行环境。他在第二轮开始的时候，`this`还是第一次的执行环境，并不是`friend`。所以这样就会造成循序，造成堆栈溢出。
所以，如果把`call this`这个去除，就不会出现堆栈溢出.

其实最主要的还是因为`getPrototypeOf`的原因，因为在提出`getPrototypeOf`的时候，认为`prototype`是不会去改变的，获取的对象永远是最近的一个原型对象。但是es6 出现了修改原型的方法，那么这个方法也就不适用了。在这种情况下，引入了super这个方法。

##### super

上面出错的堆栈溢出情况，可以适用`super`来改下下。
```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

// prototype is person
let friend = {
    getGreeting() {
        return super.getGreeting() + ", hi!";
    }
};
Object.setPrototypeOf(friend, person);


// prototype is friend
let relative = Object.create(friend);

console.log(person.getGreeting());                  // "Hello"
console.log(friend.getGreeting());                  // "Hello, hi!"
console.log(relative.getGreeting());
```

这里是可以正确输出，因为`super`不是动态引用的，他是引用的最终的那个而不是最近的一个。不论中间有多少对象继承。

##### call的误区
```javascript
xiao = {
	name: function(){return 'xiao'}
}
da = {
	name: function() {return 'da'}
}
xiao.name.call(da)
```

误解成了`call da`作为主体了。
