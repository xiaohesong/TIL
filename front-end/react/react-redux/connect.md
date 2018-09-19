今天看了下`react-redux`的源码，主要来看下`connect`的方法

首先找到`connect`的入口文件。在`src/index.js`下找到。对应`connect`文件夹下的`connect.js`文件。

- 大致说下源码`connect`流程
`connect.js`对外暴露是通过`export default createConnect()`, 我们来看[`createConnect`方法](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js#L40)。
在这里，他是在对外暴露的时候直接运行，导致对外导出的结果就是他返回的一个[`connect`方法](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js#L47).
然后再`connect`里他是返回了一个函数的结果。这个就对应到[createHoc](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js#L41)
所对应的[connectAdvanced](https://github.com/reduxjs/react-redux/blob/master/src/components/connectAdvanced.js)部分,然后再返回处理过的`我们的容器组件`.

- 具体细节
看下面[部分的源码](https://github.com/reduxjs/react-redux/blob/master/src/connect/connect.js):
```js
export function createConnect({
  connectHOC = connectAdvanced,
  mapStateToPropsFactories = defaultMapStateToPropsFactories,
  mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
  mergePropsFactories = defaultMergePropsFactories,
  selectorFactory = defaultSelectorFactory
} = {}) {
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
    const initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps')
    const initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps')
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')

    return connectHOC(selectorFactory, {
      // used in error messages
      methodName: 'connect',

       // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: name => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      // any extra options args can override defaults of connect or connectAdvanced
      ...extraOptions
    })
  }
}
```
我们知道，在容器组件平时对外暴露的时候是
```js
const mapStateToProps = (state, ownProps) => ({
//  ...
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}, actions), dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YourComponent)
```
我们可以看到基本都是都是传递两个参数，`mapStateToProps&mapDispatchToProps`, 第三个参数`mergeProps `并没有传递，这个参数是干什么的?
他在
```js
const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')
```
这里初始化`mergeProps`,[通过`mergePropsFactories`来处理](https://github.com/reduxjs/react-redux/blob/master/src/connect/mergeProps.js)里返回的两个函数来处理。
对应了两个函数对应了`mergeProps`的两种情况:

1. `whenMergePropsIsFunction`存在`mergeProps`并且是`function`的时候，[会进行处理并返回一个函数](https://github.com/reduxjs/react-redux/blob/master/src/connect/mergeProps.js#L8)，
这个函数的第一个参数是一个`dispatch`,第二个参数是一个对象，并且对象接收三个属性,如果不是一个方法，那就返回`undefined`.

2. `whenMergePropsIsOmitted`方法会判断`mergeProps`是不是存在，如果存在就返回`undefined`,否则就会返回一个[默认的`mergeProps`](https://github.com/reduxjs/react-redux/blob/master/src/connect/mergeProps.js#L3)

`mapStateToProps&mapDispatchToProps`和`mergeProps`的初始化类似，都会进行判断再去操作。

然后`connect`后面的第四个参数是一个对象，他接收一些属性。

然后就是下一步了，在使用的时候，我们`connect()`之后就是继续调用,传参是我们的容器组件。那这时，在源码里就是对应的`return connectHOC(selectorFactory, {...})`, 
这个返回的是一个函数运行的结果，所以我们传参的容器组件这个参数，并不是这里的`selectorFactory`,而是他运行完成之后的结果所接受的参数。

上面有提到`createHOC`对应的是`connectAdvanced`.然后可以看到`createHOC`传参的第一个是`selectorFactory`,
就是[对应的`defaultSelectorFactory`](https://github.com/reduxjs/react-redux/blob/master/src/connect/selectorFactory.js),然后第二个参数是一些对象。

接下来我们就可以看看对应`createHOC`的[`connectAdvanced`方法](https://github.com/reduxjs/react-redux/blob/master/src/components/connectAdvanced.js)了。

首先看`connectAdvanced`在参数方面，第一个保持不变，第二个进行了扩展，添加了几个属性。
我们还是从对外暴露的接口来看，他直接暴露的是`connectAdvanced`方法。因为我们在`createHOC`所需要的是一个结果，
所以我们[通过源码看看他是怎么运行的](https://github.com/reduxjs/react-redux/blob/master/src/components/connectAdvanced.js#L32).

在这个方法里，有返回一个方法`wrapWithConnect(WrappedComponent){}`,好家伙，到这里我们可以知道`connect`里的`return createHOC(...)`的结果返回
的就是这个，然后再看返回的这个函数名称,很见名知意`用connect包裹的函数的参数是包裹的组件`.那就看看这个函数里面是啥。

一些基本的处理，然后就是一个`connect`基于`React.Component`的继承，最后是返回`return hoistStatics(Connect, WrappedComponent)`,
[这个`hoistStatics`](https://github.com/mridgway/hoist-non-react-statics)是一个类似`Object.assign`的`copy`非`react`的`static property`.
换句话说，就是把传递的容器组件自定义的静态属性附加到`connect`组件上去。

我们再看看这个`connect class`, 他在构造函数里直接运行了`this.initSelector()和this.initSubscription()`我们先看下`initSelector`，
[发现就是使用的`selectorFactory`方法来处理的](https://github.com/reduxjs/react-redux/blob/master/src/components/connectAdvanced.js#L192)，
我们就看看这个方法是怎么处理的。[对外暴露的方法在这里](https://github.com/reduxjs/react-redux/blob/master/src/connect/selectorFactory.js#L100),
他会根据`pure`属性来确定到底该如何处理。其实我们从这一段注释就可以知道了:

```js
// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.
```
就是去处理到底是否应该重新渲染，所有如果你想要刷新的情况，可以在`connect`的传参的第四个对象里改变`pure`为`false`.

然后`initSelector `同时也会为当前对象创建一个`selector`：
```js
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  const selector = {
    run: function runComponentSelector(props) {
      try {
        const nextProps = sourceSelector(store.getState(), props)
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true
          selector.props = nextProps
          selector.error = null
        }
      } catch (error) {
        selector.shouldComponentUpdate = true
        selector.error = error
      }
    }
  }

  return selector
}
```
最后来`run`,如果符合条件或者出错，便会改变`shouldComponentUpdate = true`,去重新 `render`.

再来看看`initSubscription`方法：
```js
initSubscription() {
        if (!shouldHandleStateChanges) return

        const parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey]
        this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this))

        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription)
      }
```
先判断`shouldHandleStateChanges`是不是成立，如果成立则进行，否则返回。成立会进行初始化,正如其名，初始化订阅相关事件。

这里初始化结束之后，[我们看下`componentDidMount`方法](https://github.com/reduxjs/react-redux/blob/master/src/components/connectAdvanced.js#L148),
```js
componentDidMount() {
        if (!shouldHandleStateChanges) return

        // componentWillMount fires during server side rendering, but componentDidMount and
        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
        // To handle the case where a child component may have triggered a state change by
        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
        // re-render.
        this.subscription.trySubscribe()
        this.selector.run(this.props)
        if (this.selector.shouldComponentUpdate) this.forceUpdate()
}
```
他也会和`initSubscription`一样的去判断，确定是否进行下去。[下面会进行尝试订阅](https://github.com/reduxjs/react-redux/blob/master/src/utils/Subscription.js).
然后去运行`selector`，运行`selector`之后，会判断`shouldComponentUpdate`,如果成立,则会进行`forceUpdate`, 注意: `forceUpdate`会跳过`shouldComponentUpdate`的判断.

最后看下`render`方法，
```js
render() {
    const selector = this.selector
    selector.shouldComponentUpdate = false

    if (selector.error) {
      throw selector.error
    } else {
      return createElement(WrappedComponent, this.addExtraProps(selector.props))
    }
}
```
可以看到.他会对属性进行重写成`false`,如果报错，就跑出错误，如果正常，那就进行`render`创建元素到页面。
