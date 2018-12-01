本文是对上篇[redux applyMiddleware源码分析](https://github.com/xiaohesong/TIL/blob/master/front-end/react/redux/applyMiddleware.md)的细节部分分析。

在上篇文章中有提到中间件里有定义一个`dispatch`方法用来抛出异常，然后在`middlewareAPI`里调用的时候是携带参数了:
> ```js
>const middlewareAPI = {
>    getState: store.getState, //获取store里的state
>    dispatch: (...args) => dispatch(...args) // 调用`dispatch`的时候会抛错，如果在组合中间件之前调用，下面会说
>}
>```
> 一开始我以为是在调用的时候就会报错，可是发现这个对象里的dispatch携带参数，如果只是单纯抛错，完全可以不需要传递参数，然后向下看下去才看到其中的奥妙。

到底奥妙在哪里，这段抛错代码究竟是有什么作用。

先说这段代码的作用: 防止在对`dispatch`扩展之前调用`dispatch`。

我们来写个简单的`middleware`:
```js
const exampleMiddle = ({getState, dispatch}) => next => action => {
    console.log('exampleMiddleware action is', action)
    return next(action) 
}
```

假设我们当前并不知道那段`dispatch`函数抛出错误的作用，我们可以根据`applyMiddleware`代码来推算出来。

我们知道，在代码里有对`dispatch`重新赋值操作:

```js
dispatch = compose(...chain)(store.dispatch)
```

所以我们可以知道，在这个赋值之前调用的`dispatch`都是会抛错的(就是那段单纯抛出错误的`dispatch`函数)。

所以为了证明这个，我们来试下：
```js
const exampleMiddle = ({getState, dispatch}) => next => {
  console.log('dispatch action', dispatch({}))
  return action => {
    console.log('exampleMiddleware action is', action)
    return next(action)
  }
}
```
然后你就会发现`console`里有错误抛出，就是那段`dispatch`的`throw`。

然后我们在`dispatch = compose(...chain)(store.dispatch)`之后再次调用`dispatch`，
也就是在最终触发`action`的时候再调用，发现是可以调用(需要加判断是否调用过，否则就会死循环。)

会不会感觉不太对，为啥在闭包作用域链外的更改会影响到闭包内的变量？

 先来证明，闭包内的变量不受外部改变:
```js
let name = 'first arg'
function run(firstArg){
  console.log('run params is', firstArg)
  return function next(){
    console.log('next params is', firstArg)
  } 
}
let next = run(name)
name = 'changed'
next() // next params is first arg
```
对吧，说明外部的更改是不会影响到内部的变量的。因为作用域链已经生成了。

我们再来看看另外一个情况:
```js
let age = 99
let obj = {
  old: age,
  young: () => age
}
age = 18
obj.old // 99
obj.young() // 18
```
很明了了吧，因为每次函数调用的都是当前作用域链的变量。如果对于这部分不理解，可以看[这篇文章](https://github.com/xiaohesong/til/blob/master/front-end/javascript/%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87.md)进行深入了解。

可以发现我们自己写的`exampleMiddleware`里，第一个参数里有传入`dispatch`,然后返回的参数里携带了一个`next`参数(`store.dispatch`), 
为什么还要传递`dispatch`， 并且`dispatch`也不可以在前面使用，只能在到`action`这步的时候才可以。所以为啥还要传递`dispatch`进来，
直接传递了`store.dispatch`不是更好吗？ 这两个不等价，`store.dispatch`是原生的`dispatch`，所以可以直接返回，不会出现死循环。
参数`dispatch`是组合中间件之后的`dispatch`,所以简单的直接调用会死循环，会自己调用自己，所以需要判断下。

总结: `middlewares`通过`compose`组合这些中间件成一个链式的`dispatch`，这样每次`dispatch`都会运行处理，可以发现`dispatch`源码里，最后返回的是`action`。

