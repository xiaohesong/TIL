React-redux 7.1发版啦。

因为在新的项目中用到了hooks，但是用的时候react-redux还处于`alpha.x`版本的状态。用不了最新的API，感觉不是很美妙。好在，这两天发布了7.1版本。

现在来看看怎么用这个新的API。

## `useSelector()`

```js
const result : any = useSelector(selector : Function, equalityFn? : Function)
```

这个是干啥的呢？就是从redux的store对象中提取数据(state)。

**注意：** 因为这个可能在任何时候执行多次，所以你要保持这个selector是一个纯函数。

这个selector方法类似于之前的connect的mapStateToProps参数的概念。并且`useSelector`会订阅store, 当action被dispatched的时候，会运行selector。

当然，仅仅是概念和mapStateToProps相似，但是肯定有不同的地方，看看selector和mapStateToProps的一些差异：

- selector会返回任何值作为结果，并不仅仅是对象了。然后这个selector返回的结果，就会作为`useSelector`的返回结果。
- 当action被dispatched的时候，`useSelector()`将对前一个selector结果值和当前结果值进行浅比较。**如果不同，那么就会被re-render。** 反之亦然。
- selector不会接收ownProps参数，但是，可以通过闭包(下面有示例)或使用柯里化selector来使用props。
- 使用记忆(memoizing) selector时必须格外小心(下面有示例)。
- `useSelector()`默认使用`===`(严格相等)进行相等性检查，而不是浅相等(`==`)。

你可能在一个组件内调用`useSelector`多次，但是对`useSelector()`的每个调用都会创建redux store的单个订阅。由于react-reduxv7版本使用的react的批量(batching)更新行为，造成同个组件中，多次useSelector返回的值只会re-render一次。

### 相等比较和更新

当函数组件渲染时，会调用提供的selector函数，并且从`useSelector`返回其结果。(如果selector运行且没有更改，则会返回缓存的结果)。

上面有说到，只当对比结果不同的时候会被re-render。从v7.1.0-alpha.5开始，默认比较是严格比较(`===`)。这点于connect的时候不同，connect使用的是[浅比较](https://github.com/xiaohesong/TIL/blob/master/front-end/react/react-redux/shallow-equal.md)。这对如何使用`useSelector()`有几个影响。

使用`mapState`，所有单个属性都在组合对象中返回。返回的对象是否是新的引用并不重要 - `connect()`只比较各个字段。使用`useSelector`就不行了，默认情况下是，如果每次返回一个新对象将始终进行强制re-render。如果要从store中获取多个值，那你可以这样做：

- `useSelector()`调用多次，每次返回一个字段值。
- 使用Reselect或类似的库创建一个记忆化(memoized) selector，它在一个对象中返回多个值，但只在其中一个值发生更改时才返回一个新对象。

- 使用react-redux 提供的`shallowEqual`函数作为`useSelector`的`equalityFn`参数。

就像下面这样：

```js
import { shallowEqual, useSelector } from 'react-redux'

// later
const selectedData = useSelector(selectorReturningObject, shallowEqual)
```



### useSelector 例子

上面做了一些基本的阐述，下面该用一些例子来加深理解。

基本用法

```js
import React from 'react'
import { useSelector } from 'react-redux'

export const CounterComponent = () => {
  const counter = useSelector(state => state.counter)
  return <div>{counter}</div>
}
```

通过闭包使用props来确定要提取的内容：

```js
import React from 'react'
import { useSelector } from 'react-redux'

export const TodoListItem = props => {
  const todo = useSelector(state => state.todos[props.id])
  return <div>{todo.text}</div>
}
```

#### 使用记忆化(memoizing) selector

对于memoizing不是很了解的，可以[通往此处](https://github.com/xiaohesong/TIL/blob/master/front-end/react/useMemo.md)了解。

当使用如上所示的带有内联selector的`useSelector`时，如果渲染组件，则会创建selector的新实例。只要selector不维护任何状态，这就可以工作。但是，记忆化(memoizing) selectors 具有内部状态，因此在使用它们时必须小心。

当selector仅依赖于状态时，只需确保它在组件外部声明，这样一来，每个渲染所使用的都是相同的选择器实例：

```js
import React from 'react'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect' //上面提到的reselect库

const selectNumOfDoneTodos = createSelector(
  state => state.todos,
  todos => todos.filter(todo => todo.isDone).length
)

export const DoneTodosCounter = () => {
  const NumOfDoneTodos = useSelector(selectNumOfDoneTodos)
  return <div>{NumOfDoneTodos}</div>
}

export const App = () => {
  return (
    <>
      <span>Number of done todos:</span>
      <DoneTodosCounter />
    </>
  )
}
```

如果selector依赖于组件的props，但是只会在单个组件的单个实例中使用，则情况也是如此：

```js
import React from 'react'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

const selectNumOfTodosWithIsDoneValue = createSelector(
  state => state.todos,
  (_, isDone) => isDone,
  (todos, isDone) => todos.filter(todo => todo.isDone === isDone).length
)

export const TodoCounterForIsDoneValue = ({ isDone }) => {
  const NumOfTodosWithIsDoneValue = useSelector(state =>
    selectNumOfTodosWithIsDoneValue(state, isDone)
  )

  return <div>{NumOfTodosWithIsDoneValue}</div>
}

export const App = () => {
  return (
    <>
      <span>Number of done todos:</span>
      <TodoCounterForIsDoneValue isDone={true} />
    </>
  )
}
```

但是，如果selector被用于多个组件实例并且依赖组件的props，那么你需要确保每个组件实例都有自己的selector实例(为什么要这样？看[这里](https://jsproxy.ga/-----https://github.com/reduxjs/reselect#accessing-react-props-in-selectors))：

```js
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

const makeNumOfTodosWithIsDoneSelector = () =>
  createSelector(
    state => state.todos,
    (_, isDone) => isDone,
    (todos, isDone) => todos.filter(todo => todo.isDone === isDone).length
  )

export const TodoCounterForIsDoneValue = ({ isDone }) => {
  const selectNumOfTodosWithIsDone = useMemo(
    makeNumOfTodosWithIsDoneSelector,
    []
  )

  const numOfTodosWithIsDoneValue = useSelector(state =>
    selectNumOfTodosWithIsDoneValue(state, isDone)
  )

  return <div>{numOfTodosWithIsDoneValue}</div>
}

export const App = () => {
  return (
    <>
      <span>Number of done todos:</span>
      <TodoCounterForIsDoneValue isDone={true} />
      <span>Number of unfinished todos:</span>
      <TodoCounterForIsDoneValue isDone={false} />
    </>
  )
}
```

## `useDispatch()`

```js
const dispatch = useDispatch()
```

这个Hook返回Redux store中对`dispatch`函数的引用。你可以根据需要使用它。

用法和之前的一样，来看个例子：

```jsx
import React from 'react'
import { useDispatch } from 'react-redux'

export const CounterComponent = ({ value }) => {
  const dispatch = useDispatch()

  return (
    <div>
      <span>{value}</span>
      <button onClick={() => dispatch({ type: 'increment-counter' })}>
        Increment counter
      </button>
    </div>
  )
}
```

当使用`dispatch`将回调传递给子组件时，建议使用`useCallback`对其进行记忆，否则子组件可能由于引用的更改进行不必要地呈现。

```jsx
import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'

export const CounterComponent = ({ value }) => {
  const dispatch = useDispatch()
  const incrementCounter = useCallback(
    () => dispatch({ type: 'increment-counter' }),
    [dispatch]
  )

  return (
    <div>
      <span>{value}</span>
      <MyIncrementButton onIncrement={incrementCounter} />
    </div>
  )
}

export const MyIncrementButton = React.memo(({ onIncrement }) => (
  <button onClick={onIncrement}>Increment counter</button>
))
```

## `useStore()`

```js
const store = useStore()
```

这个Hook返回redux `<Provider>`组件的`store`对象的引用。

这个钩子应该不长被使用。`useSelector`应该作为你的首选。但是，有时候也很有用。来看个例子：

```jsx
import React from 'react'
import { useStore } from 'react-redux'

export const CounterComponent = ({ value }) => {
  const store = useStore()

  // 仅仅是个例子! 不要在你的应用中这样做.
  // 如果store中的state改变，这个将不会自动更新
  return <div>{store.getState()}</div>
}
```

## 使用的警告

### 旧的props和"Zombie Children"

React Redux实现中最困难的一个方面是，如果`mapStateToProps`函数被定义为`(state, ownProps)`，那么如何确保每次都会使用“最新”的props调用它。

在版本7中，它是在`connect()`内部使用自定义的`Subscription`类实现的，它构成了一个嵌套层次结构。这可以确保树中较低的组件只有在更新了最接近的祖先后才会收到store更新通知。

对于Hooks版，无法渲染上下文提供者，这意味着也没有嵌套的订阅层次结构。因此，“陈旧的props”问题可能会在依赖于使用Hooks而不是`connect()`的应用程序中重新出现。

具体来说，陈旧的props指：

- selector函数依赖于组件的props去提取数据
- 父组件将重新渲染并把操作的结果作为新props传递
- 但是此组件的selector函数在此组件有机会使用这些新props重新渲染之前执行

根据使用的props和当前存储状态，这可能导致从选择器返回不正确的数据，甚至引发错误。

"Zombie child"(僵尸儿童？弃子？)特指以下情况：

- 在第一次传递中mounted多个嵌套的connected的组件，导致子组件在其父级之前订阅该存储
- 被调度(dispatch)的操作从存储中删除数据
- 因此，父组件将停止呈现该子组件
- 但是，子级首先被订阅，他的订阅在父级停止渲染他之前运行。当它基于props从store中读取值时，该数据不再存在，并且如果提取逻辑不谨慎，则可能导致抛出错误。

`useSelector()`试图通过捕获由于store更新而执行selector时抛出的所有错误来处理这个问题(但不是在渲染期间执行selector时)。发生错误时，将强制组件呈现，此时将再次执行selector。只要选择器是纯函数，并且不依赖于选择器抛出错误，这就可以工作。

如果你想自己处理这个问题，可以使用`useSelector()`：

- 对于提取数据的selector函数，不要依赖props
- 如果selector函数确实依赖props，而这些props可能随着时间的推移而变化，或者提取的数据可能是可删除的项，那么请尝试防御性地编写selector函数。不要直接`state.todos [props.id] .name` - 首先读取`state.todos[props.id]`，读取`todo.name`之前验证它是否存在。
- 因为`connect`添加了必要的`Subscription`到上下文的provider和延迟执行子级订阅，直到connected的组件re-render，使用`useSelector`将一个连接的组件放在组件树中组件的正上方，只要connected的组件由于与hook组件相同的store更新而re-render，就可以防止这些问题。

### 性能

前面说了，selector的值改变会造成re-render。但是这个与`connect`有些不同，`useSelector()`不会阻止组件由于其父级re-render而re-render，即使组件的props没有更改。

如果需要进一步的性能优化，可以在`React.memo()`中包装函数组件：

```jsx
const CounterComponent = ({ name }) => {
  const counter = useSelector(state => state.counter)
  return (
    <div>
      {name}: {counter}
    </div>
  )
}

export const MemoizedCounterComponent = React.memo(CounterComponent)
```

## Hooks 配方

### 配方: `useActions()`

这个是alpha的一个hook，但是在alpha.4中听取[Dan的建议](https://github.com/reduxjs/react-redux/issues/1252#issuecomment-488160930)被移除了。这个建议是基于“binding actions creator”在基于钩子的用例中没啥特别的用处，并且导致了太多的概念开销和语法复杂性。

你可能更喜欢直接使用[useDispatch](https://github.com/xiaohesong/TIL/new/master/front-end/react/react-redux#usedispatch)。你可能也会使用Redux的[`bindActionCreators`](https://redux.js.org/api/bindactioncreators)函数或者手动绑定他们，就像这样: `const boundAddTodo = (text) => dispatch(addTodo(text))`。

但是，如果你仍然想自己使用这个钩子，这里有一个现成的版本，它支持将action creator作为单个函数、数组或对象传递进来。

```js
import { bindActionCreators } from 'redux'
import { useDispatch } from 'react-redux'
import { useMemo } from 'react'

export function useActions(actions, deps) {
  const dispatch = useDispatch()
  return useMemo(() => {
    if (Array.isArray(actions)) {
      return actions.map(a => bindActionCreators(a, dispatch))
    }
    return bindActionCreators(actions, dispatch)
  }, deps ? [dispatch, ...deps] : deps)
}
```

### 配方: `useShallowEqualSelector()`

```js
import { shallowEqual } from 'react-redux'

export function useShallowEqualSelector(selector) {
  return useSelector(selector, shallowEqual)
}
```

