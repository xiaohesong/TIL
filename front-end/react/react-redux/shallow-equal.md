之前看react-redux的源码，记录了一些东西，然后前两天闲着没事看了下浅比较（之前知道浅比较，但是没有看源码，和自己想象中的浅比较基本就是那么一回事）。

看react-redux源码的记录在[clone下来的代码库里](https://github.com/xiaohesong/react-redux/blob/master/src/utils/shallowEqual.js)。
如果你也在看或准备看源码，希望会对你有所帮助吧。

下面是浅比较部分的代码解析：

```js
const hasOwn = Object.prototype.hasOwnProperty
// 下面就是进行浅比较了, 有不了解的可以提issue, 到时可以写一篇对比的文章。
function is(x, y) {
  // === 严格判断适用于对象和原始类型。但是有个例外，就是NaN和正负0。
  if (x === y) {
    //这个是个例外，为了针对0的不同，譬如 -0 === 0 => true
    // (1 / x) === (1 / y)这个就比较有意思，可以区分正负0, 1 / 0 => Infinity, 1 / -0 => -Infinity
    return x !== 0 || y !== 0 || 1 / x === 1 / y 
  } else {
    // 这个就是针对上面的NaN的情况
    return x !== x && y !== y
  }
}


export default function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true //这个就是实行了Object.is的功能。实行的是SameValue策略。
  // is方法之后，我们认为他不相等。不相等的情况就是排除了(+-0, NaN)的情况以及可以证明:
  // 原始类型而言： 两个不是同类型或者两个同类型，值不同。
  // 对象类型而言： 两个对象的引用不同。

  
  //下面这个就是，如果objA和objB其中有个不是对象或者有一个是null, 那就认为不相等。
  //不是对象，或者是null.我们可以根据上面的排除来猜想是哪些情况:
  //有个不是对象类型或者有个是null,那么我们就直接返回，认为他不同。其主要目的是为了确保两个都是对象，并且不是null。
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false
  }

  //如果上面没有返回，那么接下来的objA和objB都是对象了。

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  //两个对象不同，有可能是引用不同，但是里面的内容却是相同的。例如：{a: 'a'} ==~ {a: 'a'}
  //所以先简单粗暴的判断一级的keys是不是相同的长度。，不是那就肯定不相等，就返回false。
  if (keysA.length !== keysB.length) return false

  //下面就是判断相同长度的key了
  // 可以发现，遍历的是objA的keysA。
  //首先判断objB是否包含objA的key,没有就返回false。注意这个是采用的hasOwnPrperty来判断，可以应付大部分的情况。
  //如果objA的key也在ObjB的key里，那就继续判断key对应的value，采用is来对比。哦，可以发现，只会对比到第以及。

  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) ||
        !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
```

#### 误区
这个是react-redux会有对比，我以为setState也会进行compare, 以至于误导了别人。其实这个对比不是根据`setState`这个方法来的，而是根据组件来的。
`PureComponent`有`scu`进行浅比较对比，这点各位知道，但是 **`Component`组件的`state`不会进行对比!!** 
具体可以查看[react源码](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberClassComponent.js#L280)
