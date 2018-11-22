[英文: Understanding Memoization in JavaScript to Improve Performance](https://blog.bitsrc.io/understanding-memoization-in-javascript-to-improve-performance-2763ab107092)


我们渴望提高应用程序的性能，`Memoization`是`JavaScript`中的一种技术，通过缓存结果并在下一个操作中重新使用缓存来加速查找费时的操作。

在这里，我们将看到`memoization`的用法以及它如何帮助优化应用的性能。

## Memoization: 基本想法
如果我们有CPU密集型操作，我们可以通过将初始操作的结果存储在缓存中来优化使用。如果操作必然会再次执行，我们将不再麻烦再次使用我们的CPU，因为相同结果的结果存储在某个地方，我们只是简单地返回结果。

可以看下面的例子:
```js
function longOp(arg) {
    if( cache has operation result for arg) {
        return the cache
    }
    else {
        假设执行一个耗时30分钟的操作
        把结果存在`cache`缓存里
    }
    return the result
}
longOp('lp') // 因为第一次执行这个参数的操作，所以需要耗时30分钟
// 接下来会把结果缓存起来
longOp('bp') // 同样的第一次执行bp参数的操作，也需要耗时30分钟
// 同样会把结果缓存起来
longOp('bp') // 第二次出现了
// 会很快的把结果从缓存里取出来
longOp('lp') //也同样出现过了
// 快速的取出结果
```
就CPU使用而言，上面的伪函数`longOp`是一种耗时的功能。上面的代码会把第一次的结果给缓存起来，后面具有相同输入的调用都会从缓存中提取结果，这样就会绕过时间和资源消耗。

下面看一个平方根的例子:
```js
function sqrt(arg) {
    return Math.sqrt(arg);
}
log(sqrt(4)) // 2
log(sqrt(9)) // 3
```
现在我们可以使用`memoize `来处理这个函数:
```js
function sqrt(arg) {
    if (!sqrt.cache) {
        sqrt.cache = {}
    }
    if (!sqrt.cache[arg]) {
        return sqrt.cache[arg] = Math.sqrt(arg)
    }
    return sqrt.cache[arg]
}
```
可以看到，结果会缓存在`cache`的属性里。

## Memoization：履行
在上面部分，我们为函数添加了`memoization `。

现在，我们可以创建一个独立的函数来记忆任何函数。我们将此函数称为`memoize`。
```js
function memoize(fn) {
    return function () {
        var args = Array.prototype.slice.call(arguments)
        fn.cache = fn.cache || {};
        return fn.cache[args] ? fn.cache[args] : (fn.cache[args] = fn.apply(this,args))
    }
}
```
我们可以看到这段代码接收另外一个函数作为参数并返回。

要使用此函数，我们调用`memoize`将要缓存的函数作为参数传递。
```js
memoizedFunction = memoize(funtionToMemoize)
memoizedFunction(args)
```

我们现在把上面的例子加入到这个里面:
```js
function sqrt(arg) {
    return Math.sqrt(arg);
}
const memoizedSqrt = memoize(sqrt)
```
返回的函数`memoizedSqrt`现在是`sqrt`的`memoized`版本。

我们来调用下:
```js
//...
memoizedSqrt(4) // 2 calculated(计算)
memoizedSqrt(4) // 2 cached
memoizedSqrt(9) // 3 calculated
memoizedSqrt(9) // 3 cached
memoizedSqrt(25) // 5 calculated
memoizedSqrt(25) // 5 cached
```

我们可以将`memoize`函数添加到`Function`原型中，以便我们的应用程序中定义的每个函数都继承`memoize`函数并可以调用它。
```js
Function.prototype.memoize = function() {
    var self = this
    return function () {
        var args = Array.prototype.slice.call(arguments)
        self.cache = self.cache || {};
        return self.cache[args] ? self.cache[args] : (self.cache[args] = self(args))
    }
}
```
我们知道JS中定义的所有函数都是从`Function.prototype`继承的。因此，添加到`Function.prototype`的任何内容都可用于我们定义的所有函数。

我们现在再来试试:
```js
function sqrt(arg) {
    return Math.sqrt(arg);
}
// ...
const memoizedSqrt = sqrt.memoize()
log(memoizedSqrt(4)) // 2, calculated
log(memoizedSqrt(4)) // 2, returns result from cache
log(memoizedSqrt(9)) // 3, calculated
log(memoizedSqrt(9)) // 3, returns result from cache
log(memoizedSqrt(25)) // 5, calculated
log(memoizedSqrt(25)) // 5, returns result from cache
```

## Memoization: Speed and Benchmarking
`memoization`的目标是速度，他通过内存来提升速度。

看下面的对比:
文件名: `memo.js`:
```js
function memoize(fn) {
    return function () {
        var args = Array.prototype.slice.call(arguments)
        fn.cache = fn.cache || {};
        return fn.cache[args] ? fn.cache[args] : (fn.cache[args] = fn.apply(this,args))
    }
}

function sqrt(arg) {
    return Math.sqrt(arg);
}
const memoizedSqrt = memoize(sqrt)
console.time("non-memoized call")
console.log(sqrt(4))
console.timeEnd("non-memoized call")
console.time("memoized call")
console.log(sqrt(4))
console.timeEnd("memoized call")
```
然后`node memo.js`可以发现输出，我这里是:
```shell
2
non-memoized call: 2.210ms
2
memoized call: 0.054ms
```
可以发现，速度还是提升了不少。

## Memoization: 该什么时候使用
在这里，`memoization`通常会缩短执行时间并影响我们应用程序的性能。当我们知道一组输入将产生某个输出时，`memoization`最有效。

遵循最佳实践，应该在纯函数上实现`memoization`。纯函数输入什么就返回什么，不存在副作用。

记住这个是以空间换速度，所以最好确定你是否值得那么做，有些场景很有必要使用。

在处理递归函数时，`Memoization`最有效，递归函数用于执行诸如GUI渲染，Sprite和动画物理等繁重操作。

## Memoization: 什么时候不要使用
不是纯函数的时候(输出不完全依赖于输入)。

## 使用案例：斐波那契系列(Fibonacci)
`Fibonacci`是许多复杂算法中的一种，使用`memoization`优化的作用很明显。

`1,1,2,3,5,8,13,21,34,55,89`
每个数字是前面两个数字的和。
现在我们用`js`实现:
```js
function fibonacci(num) {
    if (num == 1 || num == 2) {
        return 1
    }
    return fibonacci(num-1) + fibonacci(num-2)
}
```
如果num超过2，则此函数是递归的。它以递减方式递归调用自身。
```js
log(fibonacci(4)) // 3
```
让我们根据memoized版本对运行斐波那契的有效性进行测试。
`memo.js`文件:
```js
function memoize(fn) {
    return function () {
        var args = Array.prototype.slice.call(arguments)
        fn.cache = fn.cache || {};
        return fn.cache[args] ? fn.cache[args] : (fn.cache[args] = fn.apply(this,args))
    }
}



function fibonacci(num) {
    if (num == 1 || num == 2) {
        return 1
    }
    return fibonacci(num-1) + fibonacci(num-2)
}

const memFib = memoize(fibonacci)
console.log('profiling tests for fibonacci')
console.time("non-memoized call")
console.log(memFib(6))
console.timeEnd("non-memoized call")
console.time("memoized call")
console.log(memFib(6))
console.timeEnd("memoized call")
```
接下来调用:
```shell
$ node memo.js
profiling tests for fibonacci
8
non-memoized call: 1.027ms
8
memoized call: 0.046ms
```
可以发现，很小的一个数字，时间差距就那么大了。


## 上面是参考原文，下面是个人感想。
咋说呢, 第一时间想到了`react`的`memo`组件(**注意** 这里，现版本(`16.6.3`)有两个`memo`,一个是[React.memo](https://reactjs.org/docs/react-api.html#reactmemo),还有一个
是[React.useMemo](https://reactjs.org/docs/hooks-reference.html#usememo), 我们这里说的是`useMemo`)，相信关注`react`动态的都知道`useMemo`是新出来的`hooks api`，并且这个`api`是作用于`function`组件，官方文档写的是这个可以优化用以优化每次渲染的耗时工作。

看[文档这里介绍](https://github.com/xiaohesong/til/blob/master/front-end/react/hooks/hooks-api.md#usememo)的也挺明白。今天看到`medium`的这篇文章，
感觉和`react memo`有关系，就去看了下[源码](https://github.com/facebook/react/blob/v16.6.3/packages/react-reconciler/src/ReactFiberHooks.js#L632)，发现的确是和本文所述一样。
```js
//react/packages/react-reconciler/src/ReactFiberHooks.js
export function useMemo<T>(
  nextCreate: () => T,
  inputs: Array<mixed> | void | null,
): T {
  currentlyRenderingFiber = resolveCurrentlyRenderingFiber(); //返回一个变量
  workInProgressHook = createWorkInProgressHook(); // 返回包含memoizedState的hook对象

  const nextInputs =
    inputs !== undefined && inputs !== null ? inputs : [nextCreate]; // 需要保存下来的inputs，用作下次取用的key

  const prevState = workInProgressHook.memoizedState; // 获取之前缓存的值
  if (prevState !== null) {
    const prevInputs = prevState[1];
    // prevState不为空，并且取出上次存的`key`, 然后下面判断(前后的`key`是不是同一个)，如果是就直接返回，否则继续向下
    if (areHookInputsEqual(nextInputs, prevInputs)) {
      return prevState[0];
    }
  }

  const nextValue = nextCreate(); //执行useMemo传入的第一个参数(函数)
  workInProgressHook.memoizedState = [nextValue, nextInputs]; // 存入memoizedState以便下次对比使用
  return nextValue; 
}
```

进行了缓存(`workInProgressHook.memoizedState`就是`hook`返回的对象并且包含`memoizedState`，进行对比前后的`inputs`是否相同,然后再次进行操作)，并且支持传递第二个数组参数作为`key`。

果然, `useMemo`就是用的本文提到的`memoization`来提高性能的。 

其实从官方文档就知道这个两个有关系了 :cry: :
> Pass a “create” function and an array of inputs. useMemo will only recompute the memoized value when one of the inputs has changed. This optimization helps to avoid expensive calculations on every render.

 

