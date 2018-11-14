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

const reducer = combineReducers({
    counter: countReducer,
    info: infoReducer
});

const store = createStore(reducer)
store.subscribe(() => {
  const state = store.getState()
  console.log('State有更改：', state)
})
store.dispatch({type: 'SET_NAME', name: 'xhs'})
store.dispatch({type: 'INCREMENT'})
