> 原文： [Why Isn’t X a Hook?](https://overreacted.io/why-isnt-x-a-hook/)


# Why Isn’t X a Hook?

自从[React Hooks](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)的第一个alpha版本发布以来，有一个问题不断出现在讨论中：“为什么<其他API>不是一个钩子？”

提醒你，这里有一些Hooks：

- [useState()](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usestate)允许你声明一个状态变量
- [useEffect()](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#useeffect)允许你声明一个副作用
- [`useContext()`](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usecontext)允许你读取一些上下文

还有其他一些API，比如`React.memo()`和`<Context.Provider>`，但它们不是Hooks。通常提出的Hook版本是非复合或反模块的。本文将帮助你了解原因。

**注意：对于那些对API讨论感兴趣的人来说，这篇文章非常深入。你不需要考虑这些就可以提高React的效率！**

------

我们希望React API保留两个重要属性：

1. **组成(复合): ** [自定义Hook](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/custom-hook.md)很大程度上是我们对Hooks API感到兴奋的原因。我们希望人们经常建立自己的Hooks，我们需要确保不同人编写的Hooks[不会发生冲突](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/Why-Do-React-Hooks-Rely-on-Call-Order.md#%E7%BC%BA%E9%99%B7-4-diamond%E9%97%AE%E9%A2%98)。(难道我们不都被组件如何清晰地组合而不互相破坏所宠坏吗？)
2. **调试:** 我们希望随着应用程序的增长，很[容易找到](https://overreacted.io/the-bug-o-notation/)错误。React的最佳功能之一是，如果你看到错误的渲染，你可以到树上，直到找到是哪个组件的prop或状态导致的错误。

这两个约束放在一起可以告诉我们什么可以或不可以是一个Hook。我们来试试几个例子吧。

------

## 真正的Hook: `useState()`

### 组合

每个调用`useState()`的多个自定义Hook都不会产生冲突：

```js
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // What happens here, stays here.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // What happens here, stays here.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

添加新的无条件的`useState()`调用始终是安全的。你不需要了解组件用于声明新状态变量的其他Hook。你也不能通过更新其中一个来破坏其他状态变量。

**结论✅ ：** `useState()`不会使自定义Hook轻易出问题。

### 调试

Hooks很有用，因为你可以在Hooks *之间* 传递值：

```js
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

但是，如果我们犯了错误怎么办？什么是调试故事？

假设我们从`theme.comment`获得的`CSS`类名是错误的。我们如何调试这个？我们可以在组件的主体中设置断点或几个日志。

也许我们会看到`theme`是错误的但`width`和`isMobile`是正确的。这就是告诉我们问题在`useTheme()`。或者也许我们会看到`width`本身是错误的。我们将去检查`useWindowWidth()`。

**只要看一下中间值，就会知道顶层的哪个Hooks包含这个bug。** 我们不需要查看他们的所有实现。

然后我们可以“放大”有错误的那个，并复现。

如果自定义Hook嵌套的深度增加，这变得更加重要。想象一下，我们有3个级别的自定义Hook嵌套，每个级别使用3个不同的自定义Hooks。寻找 **3个地方** 的错误与可能检查 **3 + 3×3 + 3×3×3 = 39个地方** 之间的[差异]([difference](https://overreacted.io/the-bug-o-notation/))是巨大的。幸运的是，`useState()`不能神奇地“影响”其他钩子或组件。它返回的错误值在后面留下了一个痕迹，就像任何变量一样。🐛

**结论：** ✅`useState()`不会让我们代码中的因果关系模糊不清。

------

## 不是一个Hooks： `useBailout()`

作为优化，使用Hooks的组件可以避免重新渲染。

有一种方法是为整个组件包裹一个`React.memo()`包装器。如果props和上次渲染的props浅比较相等，那么就会避免重复渲染。他就像类中的`PureComponent`。

`React.memo`接受一个组件并且返回组件:

```js
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**但为什么它不只是一个Hook？**

无论你将其称为`useShouldComponentUpdate()`，`usePure()`，`useSkipRender()`或`useBailout()`，提案往往看起来像这样：

```js
function Button({ color }) {
  // ⚠️ Not a real API
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

还有一些变化（例如简单的`usePure()`标记）但从广义上讲，它们也存在同样的缺陷。

### 组合

假设我们尝试将`useBailout()`放在两个自定义Hook中：

```js
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Not a real API
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);
  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ Not a real API  
  useBailout(prevWidth => prevWidth !== width, width);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

现在如果你在同一个组件中使用它们会发生什么？

```js
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

什么时候重新渲染？

如果每个`useBailout()`调用都有权跳过更新，那么`useWindowWidth()`的更新将被`useFriendStatus()`阻止，反之亦然。**这些Hook会相互破坏。**

然而，如果仅当在单个组件中对`useBailout()`的所有调用都“同意”阻止更新时，我们的`ChatThread`将无法更新对`isTyping` prop的更改。

更糟糕的是，使用这些语义，**如果他们不调用`useBailout()`，任何新添加到`ChatThread`的Hook都会中断。** 否则，他们不能在`useWindowWidth()`和`useFriendStatus()`内“反对”(阻止)。

**结论：** 🔴`useBailout()`打破了组合。将其添加到Hook会破坏其他Hook中的状态更新。我们希望 api 是[反脆弱](https://overreacted.io/optimized-for-change/)的, 这种行为几乎是相反的。

### 调试

像`usehelout()`这样的Hook如何影响调试？

我们将使用相同的示例：

```js
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

假设`Typing...`标签在我们预期时没有出现，即使在props上方的许多层正在发生变化。我们如何调试它？

**通常，在React中，你可以通过向上查找来自信地回答这个问题。** 如果`ChatThread`没有获得新的`isTyping`值，我们可以打开渲染`<ChatThread isTyping = {myVar} />`的组件并检查`myVar`，依此类推。在其中一层，我们要么找到一个错误的`shouldComponentUpdate()`，要么传递的`isTyping`值不正确。对链中的每个组件进行一次检查通常就足以找到问题的根源。

但是，如果这个`useBailout()` Hook是真实的，那么在你检查我们的`ChatThread`和其所有者链中的组件所使用的每个自定义Hook（深度）之前，你永远不会知道更新被跳过的原因。由于每个父组件也可以使用自定义Hook，因此这种情况[非常严重](https://overreacted.io/the-bug-o-notation/)。

就像你在抽屉里寻找一把螺丝刀一样，每个抽屉里都装着一堆较小的抽屉柜，你不知道这个洞有多深。

**结论：** 🔴不仅`useBailout()` Hook打破了组合，而且它也大大增加了调试步骤的数量和认知负荷，以便找到一个错误 - 在某些情况下，指数级。

------

我们只看了一个真正的Hook，`useState()`，以及一个故意不是Hook的常见建议 - `useBailout()`。我们通过组合和调试对它们进行了比较，并讨论了为什么其中一个工作而另一个不工作。

虽然没有`memo()`或`shouldComponentUpdate()`的“Hook版本”，但React确实提供了一个名为[useMemo()](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/hooks-api.md#usememo)的Hook。它有类似的用途，但它的语义不同，不会遇到上述陷阱。

`useBailout()`只是一个不如Hook那么好的作业的例子。但还有其他一些 - 例如，`useProvider()`，`useCatch()`或`useSuspense()`。

你能明白为什么吗？

(悄悄话：作曲......调试......)
