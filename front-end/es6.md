- module

`module.exports`的作用等同于`export default`
```es6
module.exports = {
  foo: 'hello'
};

// 等同于
export default {
  foo: 'hello'
};
```

- 闭包
```javascript
function thunkedYell (text) {
  return function thunk () {
    console.log(text + '!')
  }
}
```
等同于下面的`es6`
```javascript
const thunkedYell = text => () => console.log(text + '!')
// or thunkedYell = text => () => console.log(text + '!')
```

- `call`, `apply`, `bind`的区别
```javascript
var a = {
  x: "a-x",
  getX: function() {
    return this.x
  }
}

var b = {
  x: "b-x"
}
```
`this`区别
```javascript
// apply
a.getX.apply(b)

// call
a.getX.call(b)

// bind
a.getX.bind(b)()
```
最后可以发现,都是输出`b-x`. 
1. 他们后面的第一个参数都是绑定上下文的指向  
2. `apply`和`call`类似,但是`apply`后面的第二个参数是数组.`call`是一个个的顺序书写.
3. `bind'`和`apply call`相比.他是新建了一个绑定函数.再去执行.不会立即执行.比如上例就`bind`后面还需要`()`执行.
