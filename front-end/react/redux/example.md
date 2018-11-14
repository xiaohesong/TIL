实现一个简单的`redux`计数的例子

### 第一步： 简单的改变数据

```js
let initState = {count: 0}

function reducer(state = initState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state;
  }
}

function createStore(reducer){
  let state = reducer(undefined, {}) // 如果不在同一个文件下，`reducer(undefined, {})`会返回初始化的`state`
  let listeners = []
  
  function getState() {return state}
  
  function check() {throw new Error('Action Must Be Object')}
  
  function dispatch(action = check()) {
      state = reducer(state, action)
      for(let i = 0; i < listeners.length; i++){
        const listen = listeners[i]
        listen()
      }
  }
  
  function subscribe(listen){
    listeners.push(listen)
  }
  
  return {subscribe, getState, dispatch}
}

//如果`reducer`和`createStore`不在一个文件夹下, 你可以改下`createStore`加个参数去接收`reducer`
let store = createStore(reducer)
store.subscribe(function() {
  let state = store.getState()
  console.log('subscribe state count is', state.count)
})
store.dispatch({})
store.dispatch({type: 'INCREMENT'})
```

这个是一个简单版的`redux`。

### 第二步：`reducers`添加`combineReducers`函数

可以发现这个是一个`reducer`的，在正常的开发中会有多个`reducer`, 比如:
首先是`countReducer`:
```js
# countReducer
let initCountState = {count: 0}
function countReducer(state = initCountState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state;
  }
}
```
接下来就是`infoReducer`:
```js
# infoReducer
let initInfoState = {name: 'react', age: '5'}
function infoReducer(state = initInfoState, action) {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.name
      }
    case 'SET_AGE':
      return {
        ...state,
        age: action.age
      }
    default:
      return state;
  }
}
```

可见这里有两个`reducers`了，我们需要一个`combineReducers`来做这样的事情:

```js
const reducer = combineReducers({
    counter: countReducer,
    info: infoReducer
});
```

接下来就实现这个`combineReducers`：

```js
function combineReducers(reducers) {

  /* reducerKeys = ['counter', 'info']*/
  const reducerKeys = Object.keys(reducers)

  /*返回合并后的新的reducer函数*/
  return function combination(state = {}, action) {
    /*生成的新的state*/
    const nextState = {}

    /*遍历执行所有的reducers，整合成为一个新的state*/
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      // 下面这两行比较有意思，如果你第一次不存在这个`state`得`key`,那么他会在第二次给你主动加上对应`reducer key`的`state key`
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)

      nextState[key] = nextStateForKey
    }
    return nextState;
  }
}
```
最后返回改变之后的`state`.具体的`demo`请[点击这里](https://github.com/xiaohesong/til/blob/master/front-end/react/redux/redux.js)

上面这些就是关于`redux combineReducers`的部分。



很早之前看`redux`源码感觉挺复杂，如今结合看来倒是挺好。

本文原文[请点击这里](https://github.com/brickspert/blog/issues/22), 有部分有更改。
