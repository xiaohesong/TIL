实现一个简单的`redux`计数的例子

```js
let initState = {count: 0}

function reducers(state = initState, action) {
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

function createStore(){
  let state = initState // `reducers()`会返回初始化的`state`
  let listeners = []
  
  function getState() {return state}
  
  function check() {throw new Error('Action Must Be Object')}
  
  function dispatch(action = check()) {
      state = reducers(state, action)
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

//如果`reducers`和`createStore`不在一个文件夹下, 你可以改下`createStore`加个参数去接收`reducers`
let store = createStore()
store.subscribe(function() {
  let state = store.getState()
  console.log('subscribe state count is', state.count)
})
store.dispatch({})
store.dispatch({type: 'INCREMENT'})
```

这个是一个简单版的`redux`。
