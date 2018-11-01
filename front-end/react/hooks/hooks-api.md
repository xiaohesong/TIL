如果你之前对于`Hooks`没有了解，那么你可能需要看下[概述部分](https://github.com/xiaohesong/til/blob/master/front-end/react/hooks/overview.md)。你或许也可以在一些[常见的问题](https://reactjs.org/docs/hooks-faq.html)中找到有用的信息。

- [基本的钩子](#baisc-hooks)
  - [useState](#usestate)
  - [useEffect](#useeffect)
  - [useContext](#usecontext)

- [添加的钩子](#其他的钩子)
  *   [useReducer](#usereducer)
  *   [useCallback](#usecallback)
  *   [useMemo](#usememo)
  *   [useRef](#useref)
  *   [useImperativeMethods](#useimperativemethods)
  *   [useMutationEffect](#usemutationeffect)
  *   [useLayoutEffect](#uselayouteffect)

## Baisc Hooks
#### useState
```js
const [state, setState] = useState(initialState);
```
返回有状态值，以及更新这个状态值的函数。

在初始渲染的时候，返回的状态(`state`)与作为第一个参数(`initialState`)传递的值相同。

`setState`函数用于更新`state`。`setState`接受一个新的状态值，并将组件的重新渲染排入队列。

```js
setState(newState);
```
在后续重新渲染期间，`useState`返回的第一个值将始终是应用更新后的最新状态。

###### 作为功能更新
如果更新状态需要用到前面的状态，那可以传递一个函数给`setXxxx`,类似于类组件中的`setState`。这个函数可以接收先前的值，然后返回更新之后的值。
```js
function Counter({initialCount}) {
  const [count, setCount] = useState(initialCount);
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(0)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
    </>
  );
}
```
就像这样，给`setCount`传递一个函数，这个函数接收一个参数(上一个状态值)，最后返回新的状态值用以`setCount`。

> **注意：** 与类组件中的`setState`方法不同，**`useState`不会自动合并更新对象。** 但是你可以自己做到这点：
> ```js
> setXxxx(prevState => {
>   // Object.assign would also work
>   return {...prevState, ...updatedValues};
> });
> ```
> 另一个选项是使用`useReducer`，它更适合管理包含多个子值的状态对象。

###### 延迟初始化
`initialState`参数是初始渲染期间使用的状态。在随后的渲染中，它被忽略了。如果初始状态是复杂计算的结果，则可以改为提供函数，该函数仅在初始渲染时执行：
```js
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

#### useEffect
```js
useEffect(didUpdate);
```
接受包含命令式，可能有副作用代码的函数。

函数组件的主体内部不允许发生改变，订阅，计时器，日志记录和其他副作用（称为`React`的渲染阶段）。这样做会导致`UI`中的错误和不一致性混乱。

相反，使用`useEffect`。传递给`useEffect`的函数将在渲染结束后运行。将效果(副作用)视为从`React`的纯函数进入命令式的逃脱舱。

默认情况下，效果在每次完成渲染后运行，但是你可以选择仅在某些值发生更改时触发它。前面介绍[effect hook时有提到](https://github.com/xiaohesong/til/blob/master/front-end/react/hooks/effect-hook.md#%E6%8F%90%E7%A4%BA%E9%80%9A%E8%BF%87%E8%B7%B3%E8%BF%87%E6%95%88%E6%9E%9C%E4%BC%98%E5%8C%96%E6%80%A7%E8%83%BD)，本文下面仍然会详细介绍。

###### 清理effect
通常，效果会创建一些在组件卸载时需要清理的资源，例如订阅或计时器ID。为此，传递给`useEffect`的函数可能会返回一个清理函数。例如，要创建订阅：
```js
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    // Clean up the subscription
    subscription.unsubscribe();
  };
});
```
返回的清除函数在从UI中卸载组件之前运行，以防止内存泄漏。此外，如果组件呈现多次（通常如此），则在**执行下一个效果之前会清除先前的效果。** 在我们的示例中，这意味着每次更新都会创建一个新订阅。要避免在每次更新时触发效果，请继续往下看。

###### effect的触发时间
与`componentDidMount`和`componentDidUpdate`不同，传递给`useEffect`的函数在延迟事件期间在布局和绘制后触发。这使得它适用于许多常见的副作用，例如设置订阅和事件处理程序，因为大多数类型的工作不应阻止浏览器更新屏幕。

但是，并非所有效果都可以推迟。例如，用户可见的DOM改变必须在下一次绘制之前同步触发，以便用户不会感觉到视觉上的不一致。对于这些类型的效果，`React`提供了两个额外的Hook：[useMutationEffect](https://reactjs.org/docs/hooks-reference.html#usemutationeffect)和[useLayoutEffect](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)。这些`Hook`与`useEffect`具有相同的`api`，并且仅在触发时有所不同。

虽然`useEffect`会延迟到浏览器绘制完成之后，但它保证在任何新渲染之前触发，也就是说在开始新的更新之前，`React`将始终刷新先前渲染的效果。

###### 条件控制的effect
效果的默认行为是在每次完成渲染后触发效果。这样，如果其中一个输入发生变化，则始终会重新创建效果。

但是，在某些情况下，这可能是不需要的，例如上一节中的订阅示例。仅当`source prop`已更改时，我们无需在每次更新时创建新订阅。

要实现此功能，请将第二个参数传递给`useEffect`，它是效果所依赖的值数组。我们更新的示例现在看起来像这样：
```js
useEffect(
  () => {
    const subscription = props.source.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  },
  [props.source],
);
```
现在只有在 `props.source`更改时才会重新创建订阅。传入一个空数组[]输入告诉`React`你的效果不依赖于组件中的任何值，因此该效果仅在`mount`和`unmount`上运行，从不在更新时运行。

> **注意** 输入数组**不作为参数传递给效果函数。** 但从概念上讲，这就是它们所代表的内容：效果函数中引用的每个值也应出现在输入数组中，这样才有意义。[并且从之前可以得知](https://github.com/xiaohesong/til/blob/master/front-end/react/hooks/effect-hook.md#%E6%8F%90%E7%A4%BA%E9%80%9A%E8%BF%87%E8%B7%B3%E8%BF%87%E6%95%88%E6%9E%9C%E4%BC%98%E5%8C%96%E6%80%A7%E8%83%BD)，只要数组里的内容有一个不同，那就会再次调用这个效果。

#### useContext
```js
const context = useContext(Context);
```
接受上下文对象（从`React.createContext`返回的值）并返回当前上下文值，由给定上下文的最近上下文提供程序给出。

当提供程序更新时，此`Hook`将使用最新的上下文值触发重新呈现。

## 其他的钩子
以下钩子可以是上一节中基本钩子的变体，也可以仅用于特定边缘情况。不强调预先学习它们。

#### useReducer
```js
const [state, dispatch] = useReducer(reducer, initialState);
```
[useState](https://github.com/xiaohesong/til/blob/master/front-end/react/hooks/state-hook.md)的替代方案。接受类型为`(state，action) => newState`的`reducer`，并返回与`dispatch`方法配对的当前状态。 （如果熟悉`Redux`，你已经知道它是如何工作的。）

这是`useState`部分的计数器示例，用`reducer`重写：
```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'reset'})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```

###### 延迟初始化
`useReducer`接受可选的第三个参数`initialAction`。如果提供，则在初始渲染期间应用初始操作。这对于计算包含通过props传递的值的初始状态非常有用：
```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return {count: action.payload};
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    {type: 'reset', payload: initialCount},
  );

  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```
当你具有涉及多个子值的复杂状态逻辑时，`useReducer`通常优于`useState`。它还允许你优化触发深度更新的组件的性能，因为你[可以传递调度而不是回调](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)。

#### useCallback
```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```
返回一个[memoized回调](https://en.wikipedia.org/wiki/Memoization)。

传递内联回调和一组输入。 `useCallback`将返回一个回忆的`memoized`版本，该版本仅在其中一个输入发生更改时才会更改。当将回调传递给依赖于引用相等性的优化子组件以防止不必要的渲染（例如，`shouldComponentUpdate`）时，这非常有用。

**useCallback(fn，inputs) 等效 useMemo(() => fn，inputs)。**

> **注意** 输入数组不作为参数传递给回调。但从概念上讲，这就是它们所代表的内容：回调中引用的每个值也应出现在输入数组中。将来，一个足够先进的编译器可以自动创建这个数组。类似于上面提到的`effect`第二个参数。

#### useMemo
```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```
返回一个`memoized`值。

传递“创建”功能和输入数组。 `useMemo`只会在其中一个输入发生更改时重新计算`memoized`值。此优化有助于避免在每个渲染上进行昂贵的计算。

如果未提供数组，则只要将新函数实例作为第一个参数传递，就会计算新值。 （使用内联函数，在每个渲染上。）

>**注意：** 输入数组不作为参数传递给函数。但从概念上讲，这就是它们所代表的内容：函数内部引用的每个值也应出现在输入数组中。

#### useRef
```js
const refContainer = useRef(initialValue);
```
`useRef`返回一个可变的`ref`对象，其`.current`属性被初始化为传递的参数（`initialValue`）。返回的对象将持续整个组件的生命周期。

一个常见的用例是强制访问`child`：
```js
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```
请注意，`useRef`比`ref`属性更有用。[保持任何可变值的方式](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)类似于在类中使用实例字段的方法。

#### useImperativeMethods
```js
useImperativeMethods(ref, createInstance, [inputs])
```
`useImperativeMethods`自定义使用`ref`时公开给父组件的实例值。与往常一样，在大多数情况下应避免使用`refs`的命令式代码。 `useImperativeMethods`应与`forwardRef`一起使用：
```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeMethods(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);
```
在此示例中，呈现`<FancyInput ref = {fancyInputRef} />`的父组件将能够调用`fancyInputRef.current.focus()`。

#### useMutationEffect
`api`与`useEffect`相同，但在更新兄弟组件之前，它在`React`执行其DOM改变的同一阶段同步触发。使用它来执行自定义DOM改变。

在可能的情况下首选标准`useEffect`以阻止可见的更新。

> **注意** 避免在`useMutationEffect`中读取DOM。在读取计算样式或布局信息时，`useLayoutEffect`更合适。

#### useLayoutEffect
`api`与`useEffect`相同，但在所有DOM改变后同步触发。使用它来从DOM读取布局并同步重新渲染。在浏览器有机会绘制之前，将在`useLayoutEffect`内部计划的更新将同步刷新。

在可能的情况下首选标准`useEffect`以阻止视觉更新。

> 提示 如果你正在从类组件迁移代码，则`useLayoutEffect`会在与`componentDidMount`和`componentDidUpdate`相同的阶段触发，因此如果你不确定`Hook`要使用哪种效果，则他可能风险最小。


