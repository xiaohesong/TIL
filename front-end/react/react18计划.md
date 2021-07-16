### React 18 批量处理render

https://github.com/reactwg/react-18/discussions/21

React18之前的批更新：

https://codesandbox.io/s/spring-water-929i6?file=/src/index.js:575-584

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    setCount(c => c + 1); // 还不会re-render
    setFlag(f => !f); // 还不会re-render
    // 在结束的时候会re-reder(这是一个批量更新!)
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}
```

批量更新只在执行浏览器事件**期间**使用(react event handler)，所以其他的情况无法做到：

https://codesandbox.io/s/trusting-khayyam-cn5ct?file=/src/index.js

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    fetchSomething().then(() => {
      // 由于更新在回调中而不是在浏览事件期间，下面的更新不会批处理
      setCount(c => c + 1); // 产生一个 re-render
      setFlag(f => !f); // 产生 re-render
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}
```

#### 自动批处理是什么

从React18的[createRoot](https://github.com/reactwg/react-18/discussions/5)开始，所有的更新都会自动的批处理，timeout, promise,原生事件或其他任何事件，都会类似react事件那样批处理。

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    s
    fetchSomething().then(() => {
      // React18之后
      setCount(c => c + 1);
      setFlag(f => !f);
      // 结束了就批处理了
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}
```

[React18版本使用createRoot](https://codesandbox.io/s/morning-sun-lgz88?file=/src/index.js)会批处理

[React18版本使用遗留模式](https://codesandbox.io/s/jolly-benz-hb1zx?file=/src/index.js)不会批量处理

> 这里仅仅是针对事件, 一个事件里套一个事件，是分开的
>
> ```jsx
> function App() {
> const [count, setCount] = useState(0);
> const [flag, setFlag] = useState(false);
> 
> function handleClick() {
> // re-render
> setCount(c => c + 1);
> fetchSomething().then(() => {
>     // React18之后
>     setCount(c => c + 1);
>     setFlag(f => !f);
>     // 结束了就批处理了
> });
> }
> 
> return (
> <div>
> 	<button onClick={handleClick}>Next</button>
>   <h1 style={{ color: flag ? "blue" : "black" }}>{count}		</h1>
> </div>
> );
> }
> ```

#### 如何不去自动更新

可以使用`ReactDOM.flushSync()`去手动设置不批更新

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // re-render
  flushSync(() => {
    setFlag(f => !f);
  });
  // re-render
}
```

#### 对于class的破坏性

对于react的事件是始终保持批量更新的，所以这个是没有影响；

不过可能存在一个边缘情况：

> React18 之前

```jsx
handleClick = () => {
  setTimeout(() => {
    this.setState(({ count }) => ({ count: count + 1 }));

    // { count: 1, flag: false }
    console.log(this.state);

    this.setState(({ flag }) => ({ flag: !flag }));
  });
};
```

react18由于批处理不会存在上面的情况：

> React18

```jsx
handleClick = () => {
  setTimeout(() => {
    this.setState(({ count }) => ({ count: count + 1 }));

    // { count: 0, flag: false }
    console.log(this.state);

    this.setState(({ flag }) => ({ flag: !flag }));
  });
};
```

https://codesandbox.io/s/interesting-rain-hkjqw?file=/src/App.js

不过也可以通过`ReactDOM.flushSync`避免；

```jsx
function handleClick() {
  setTimeout(() => {
    console.log(count); // 0
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
    console.log(count); // 0
  }, 1000)
```

#### 关于``unstable_batchedUpdates``

仍然保留，不过可能不再需要这个了，已经自动处理了。

### Suspense

[Behavioral changes to Suspense in React 18](https://github.com/reactwg/react-18/discussions/7)

React18之前，对于Suspense的支持不是很友好，对于18之前的suspense称之为`Legacy Suspense`。Suspense的完整特性依赖于并发(`Concurrent`)版本的React，但是这被添加到了18版本中。所以这是一个具有破坏性的改变。

> Suspense让组件在渲染前"等待"某些东西。
>
> https://reactjs.org/docs/react-api.html#suspense

#### suspense组件的同级节点可以被中断

##### 简单的例子

```jsx
<Suspense fallback={<Loading />}>
  <ComponentThatSuspends />
  <Sibling />
</Suspense>
```

上面这个不管在 Legacy Suspense 还是 Concurrent Suspense中，在准备好渲染之前，都会显示Loading。他们的区别就是在影响兄弟组件上：

- Legacy Suspense下，Sibling组件会直接挂载到DOM上并且触发生命周期，然后再去隐藏它。

  - [React 17 过早触发effect.](https://codesandbox.io/s/keen-banach-nzut8?file=/src/App.js)

    > 其实就是瀑布加载方式

- Concurrent Suspense下，Sibling组件不会挂载到DOM，数据解析前不会触发任何生命周期

  - [React 18 的 `createRoot` effects 延迟到内容准备完成.](https://codesandbox.io/s/romantic-architecture-ht3qi?file=/src/App.js)

    > 等数据准备好后去渲染

##### 详解

在以前的React版本中，有一个隐性的保证：开始了渲染的组件就会保证他完成渲染。比如在类组件中，`render`方法调用的时候`componentDidMount/Update`都会被调用，保持同步。大多数的时候是没有注意到这个情况，或者是习以为常，但是有些情况是没有意识到其实并不想这样。

Suspense的目的就是延迟组件的渲染，直到数据准备完成再统一渲染。

Legacy的Suspense下，就是保持同步(render/didMount/didUpdate),只会跳过Suspense中的组件去处理其他的。但是对于现在的react18来说，react团队认为这种DOM是不一致的行为状态，只是通过`fallback`的UI来替代而已。在渲染之前，展示了`fallback`的UI并使用`display: hidden`隐藏了Suspense的组件视图。

通过这个小trick，sibling组件的渲染行为不受影响，对于用户来说也不会有影响，只是看到了一个fallback的占位而已。

Legacy Suspense这个对于设计上来说有些怪异，当时设计只是作为一个折衷方案去向后兼容引入Suspense。

Concurrent Suspense中，就是中断sibling并阻止他们提交。等待Suspense包含的*一切*都准备好，suspense的组件和所有的siblings组件，直到suspense的组件数据解析完成。然后在一个单一且一致的批处理中提交整个树。

##### Concurrent Suspense会不会有什么问题

> parent ref给子组件的时间上的控制

下面的评论很有意思,链接也很不错。

其他的一些链接

[Releasing Suspense](https://github.com/facebook/react/issues/13206)

[What changes are planned for Suspense in 18?](https://github.com/reactwg/react-18/discussions/47)



### startTransition

https://github.com/reactwg/react-18/discussions/41

> 保证应用的响应

#### 解决什么问题

例如列表关键字搜索，有时响应可能会很慢。从概念上来说，更新两个值，一个搜索的关键字和列表搜索结果。关键字是要快速紧急展示，搜索结果不需要那么急着展示结果。

```js
// 输入的关键字
setInputValue(input);

// 搜索结果
setSearchQuery(input);
```

当然，开发的时候会加上防抖。

在18版本，所有的更新都被立即渲染。也就是两个状态更新都是同时渲染，并且用户的交互在一切都渲染之前是感受不到的(就是页面卡顿的厉害)。react团队认为缺少了一种方式知道更新是不是急需的，没有一个紧急程度。

#### startTransition能帮助什么

`startTransition`这个API是给一个更新打标记为"transitions"。

```js
import { startTransition } from 'react';


// 紧急的更新
setInputValue(input);

// 标记任何状态更新作为一个"transitions"
startTransition(() => {
  // Transition: 展示结果的
  setSearchQuery(input);
});
```

所以现在知道了哪个是紧急的哪个是不紧急的，就可以根据这个来做一些处理，如果在获取结果的时候用户继续输入了关键字，那就会中断查询渲染，认为是不必要的渲染。

#### transition是什么

其实就把状态给分成了两类：

- **紧急更新** 通常是一些直接的交互，输入，点击，按下等情况
- **Transition 更新** 

需要立即响应的紧急更新，在用户行为上更契合，但是中间的一些过程可能不需要，只需要一个最终的结果，不需要一个过渡。

#### 与setTimeout的区别

```jsx
setInputValue(input);

setTimeout(() => {
  setSearchQuery(input);
}, 0);
```

这样也可以做到第一次更新完成之后更新第二个。

最重要的区别是`startTransition` 不像`setTimeout`那样在后面调度。他是立即执行的。传递给`startTransition`的函数同步运行，但包裹在其中的更新都会标记为`transitions`。React会使用标记的信息处理稍后的更新如何去渲染。这样是比在setTimeout中更早的去更新。

另一个区别就是更新在setTimeout里的时候仍然会卡，当setTimeout触发时用户仍然操作还是会卡顿。但是如果标记为 `startTransition` 的更新是可以被中断的。他会在浏览器渲染不同组件的空隙时间点去处理事件。

#### transition在待处理时怎么做

transition在后台处理的时候，会有个`isPending`状态来跟踪：

```jsx
import { useTransition } from 'react';


const [isPending, startTransition] = useTransition();
```

待处理的时候`isPending`是`true`。

#### 哪些情况使用它

可以使用`startTransition`包裹任何你想要放在背地里的更新。通常，这些更新归纳为两类：

- 缓慢的渲染：[ `startTransition` 保持耗时渲染响应的例子.](https://github.com/reactwg/react-18/discussions/65)
- 网络慢

[Real world example: adding startTransition for slow renders](https://github.com/reactwg/react-18/discussions/65) [一个例子](https://github.com/rickhanlonii/platform-app/tree/react18)



### 其他

React是怎么保持浏览器响应的？

react18之前是：

[workLoopSync](https://github.com/facebook/react/blob/5aa0c5671fdddc46092d46420fff84a82df558ac/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1473-L1475)

```js
while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }

```

新的更改是：

[workLoopConcurrent](https://github.com/facebook/react/blob/5aa0c5671fdddc46092d46420fff84a82df558ac/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1560-L1562)

```js
while (workInProgress !== null && !shouldYield()) {
	performUnitOfWork(workInProgress);
}
```

就是在每次遍历组件树的时候，都会去检查当前是不是有更重要的事要处理。`shouldYield`就是去定期的设置他去检查是否有其他重要的交互去做，如果有就进行事件处理和渲染。如果没有更紧急的事情要处理，就回到这个循环继续处理。所以说这个是可中断的。

默认情况下是使用不可中断的算法，可中断的算法是用于：

- 来自于`startTransition`的更新

- `<Suspense>`包裹的组件

所以这就是他的工作原理。

**React中，每个单独的组件通常只需要很少的时间渲染(< 1毫秒)。** 这是因为组件的渲染时间**不包括** 其子组件。JSX是惰性的，所以`<Button />`不会像`Button()`调用那样调用`Button`组件。所以就算一个很深的树，每一层都足够小。这就是为什么即使React不能停止已经执行的代码，但是在实际情况中可以感觉它是可以中断的。




迫于社区，并发模式的特性被逐步采用到新版本，减轻破坏性。

> 还有其他的一些api，不过还不确定，可以后续观察。
