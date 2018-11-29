记得之前第一次看`redux`源码的时候是很懵逼的，尤其是看到`applyMiddleware`函数的时候，更是懵逼。当然那也是半年前的事情了，前几天把`redux`源码看了下，并且实现了个[简单的`redux`功能](https://github.com/xiaohesong/TIL/blob/master/front-end/react/redux/example.md)。但是没有实现中间件。今天突然又想看看`redux`的中间件，就看了起来。

记得半年之前是从函数声明的下一行就开始看不懂了。。。然后前段时间，看了下柯里化函数，加深了高阶函数的印象，所以今天打算把中间件的源码给撸一下。

我们来看看函数声明的下一行，也就是[源码第二行](https://github.com/reduxjs/redux/blob/master/src/applyMiddleware.js#L20)开始看：
```js
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```
从上面我们可以看到中间件返回了函数，返回第一个函数是携带`createStore`参数的，这个是啥？从名字上我们就可以知道，就是`createStore`。不过为了证明，我们还是得从源码上来看。

还记得是怎么调用的中间件的吧，大致如下:
```js
const store = createStore(
    reducer,
    applyMiddleware(...middlewares)
);
```
可以看到中间件是在`createStore`参数里调用的(在参数里运行函数，导致传递给`createStore`的是中间件运行后返回的结果，从上面的中间件源码可以知道，返回的就是携带`createStore`参数的函数)，现在我们可以[进`createStore`函数里](https://github.com/reduxjs/redux/blob/master/src/createStore.js#L31)看看他是怎么处理中间件返回的函数的。

`redux`的主要实现都是在`createStore`里实现的，所以我们主要看`createStore`里处理参数的部分:
```js
export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  //other code
}
```
从我们调用`createStore`可以知道第一个参数是`reducer`，第二个参数就是中间件运行之后返回的携带`createStore`参数的函数。但是在上面的这段源码里，我们发现是`preloadedState `来接收这个携带`createStore`参数的函数，感觉不是很多，命名的'不好'。先继续往下看,wow, 是一个判断，他会判断`preloadedState `是不是一个函数，第三个参数`enhancer`是不是未定义；如果`preloadedState `是函数，`enhancer`是未定义，那么就会把`preloadedState`赋值给`enhancer`，并且设置`preloadedState `是未定义。 这样就没有问题了，在这里，相当于第三个参数`enhancer`接收了携带`createStore`参数的函数。

然后第二个判断:
```js
if (typeof enhancer !== 'undefined') {
  if (typeof enhancer !== 'function') {
    throw new Error('Expected the enhancer to be a function.')
  }

  return enhancer(createStore)(reducer, preloadedState)
}
```
他会去运行这个`enhancer`。这个`enhancer`是什么？就是我们说的携带`createStore`的函数。

有意思的是，这个`enhancer`直接在这里运行了，并且采用了`createStore`作为参数(这个`createStore`就是函数呀)。 我们再来看看`enhancer(createStore)`返回的是啥:
```js
return function (...args){
      const store = createStore(...args)
      let dispatch = () => {
        throw new Error(
          `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
        )
      }

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      }
      const chain = middlewares.map(middleware => middleware(middlewareAPI))
      dispatch = compose(...chain)(store.dispatch)

      return {
        ...store,
        dispatch
      }
    }
```
有意思，返回的是带有多个参数的函数。
上面的代码相当于：
```js
enhancer(createStore) ~= function(...args) => function(reducer, preloadedState)
```
可以看到，上面的`(...args)`就是相当于`(reducer, preloadedState)`。

那么我们再来看看上面的`function(...args)`, 额， 直接在第一行就再次调用创建`store`,这样不会陷入无限循环吗？不会，因为有参数判断，在`createStore`的原方法里不会再执行`enhancer`; 所以我们可以发现，在有中间件的时候，真正的执行`createStore`是在中间件里去执行的，并且携带的参数是`reducer, preloadedState`。

所以上面第一行创建了个`store`对象，他返回的属性有:
```json
{
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
```
然后新建了个指向`dispatch`变量的匿名函数，这个函数在调用的时候抛出异常告诉你不可以在构造中间件时调用`dispatch`。
> Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.

接下来会创建一个`middlewareAPI`对象:
```js
const middlewareAPI = {
    getState: store.getState, //获取store里的state
    dispatch: (...args) => dispatch(...args) // 调用`dispatch`的时候会抛错，如果在组合中间件之前调用，下面会说
}
```
一开始我以为是在调用的时候就会报错，可是发现这个对象里的`dispatch`携带参数，如果只是单纯抛错，完全可以不需要传递参数，然后向下看下去才看到其中的奥妙。

然后就是对中间件集合`middlewares`(数组)进行操作:
```js
const chain = middlewares.map(middleware => middleware(middlewareAPI)) //返回了新的集合，对应的每个中间件调用的结果
```

然后就是组合这些中间件了,这里对高阶函数不熟的，可以看下[柯里化函数和函数组合](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/higher-order-function/curry.md):
```js
// china是上面返回的中间件的结果
dispatch = compose(...chain)(store.dispatch)
```
可以看到这个代码，组合了中间件, 使用`compose`这个高阶函数来处理的。我们看下这个[高阶函数](https://github.com/reduxjs/redux/blob/master/src/compose.js#L12):
```js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
上面的代码比较有意思：
- 第一个判断
  如果没有中间件作为参数传递，那么直接返回一个函数，接收对应的参数并且返回这个参数。
- 第二个判断
  如果如果这个中间件参数只有一个，那么直接返回这个中间件函数
- 最后一步
  那就是多个中间件传递进来的时候，他会借用`reduce`方法组合(这个放在后面), 会有个`...args`参数，就是(`store.dispatch`),等下回说到。
可能你对`reduce`不是很熟，可以简单的看下他干了什么事:
```js
['1', 2, 3, 'n'].reduce((a, b) => console.log('a is',a , 'b is', b)) // 这样你就会发现这个方法在这里的作用
```
其实从注释里也可以知道:
> ```js
> * @param {...Function} funcs The functions to compose.
> * @returns {Function} A function obtained by composing the argument functions
> * from right to left. For example, compose(f, g, h) is identical to doing
> * (...args) => f(g(h(...args))).
> ```
把这些中间件都执行到`dispatch`.

再回到上面看`compose`的返回:
```js
return funcs.reduce((a, b) => (...args) => a(b(...args)))
```
我们再看看中间件调用`compose`的地方:
```js
dispatch = compose(...chain)(store.dispatch)
```
从这个地方再配合看`compose(...chain) => result`的这个`result`.
- 第一个判断
  返回的是`(arg) => arg`就是相当于  `result(arg) => arg`, 果然，直接返回这个`store.dispatch`
- 第二个判断
  返回的是唯一的一个中间件`result`. 然后中间件直接调用`store.dispatch`作为参数。
- 最后一个
  这个返回的是一个函数,看起来像这样:
```js
(...args) => a(b(...args))
```
这样就相当于`result(args) => a(b(...args))`,这样就保证每个中间件都会用到`dispatch`,并且最终返回这个被扩展过的`dispatch`.

然后可以看到中间件函数返回了对象:
```js
{
  ...store,
  dispatch
}
```
这个`dispatch`就是被处理过的`dispatch`。
