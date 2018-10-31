构建自己的`Hook`可以将组件逻辑提取到可重用的函数中。

当我们学习[使用`Effect Hook](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md)时，
我们从聊天应用程序中看到了这个组件，该组件显示一条消息，指示朋友是在线还是离线：
```js
import { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```
现在让我们的聊天应用程序也有一个联系人列表，我们想要呈现绿色的在线用户名。我们可以将上面类似的逻辑复制并粘贴到我们的`FriendListItem`组件中，
但它不是很好：
```js
import { useState, useEffect } from 'react';

function FriendListItem(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
相反，我们想在`FriendStatus`和`FriendListItem`之间分享这个逻辑。

传统上，在`React`中，我们有两种流行的方式来共享组件之间的状态逻辑：渲染道具和高阶组件。我们现在将看看`Hook`如何在不添加这些方法的情况下解
决许多相同的问题。

## 提取自定义钩子
当我们想要在两个`JavaScript`函数之间共享逻辑时，我们将它提取到第三个函数。组件和挂钩都是功能，所以这也适用于它们！

**自定义`Hook`其实也是一个`JavaScript`函数，其名称以`use`开头，可以调用其他`Hook`。** 例如，下面的`useFriendStatus`是我们的第一个自定义钩子：
```js
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```
里面没有任何新内容 - 逻辑是从上面的组件中复制的。就像在组件中一样，确保只在自定义`Hook`的顶层无条件地调用其他`Hook`。

与`React`组件不同，自定义`Hook`不需要具有特定签名。我们可以决定它作为参数需要什么，以及它应该返回什么（如果有的话）。换句话说，它就像一个普通的功能。
它的名字应该始终使用`use`开头，这样你就可以一眼就看出钩子的规则适用于它。

我们使用`FriendStatus Hook`的目的是订阅我们朋友的状态。这就是为什么它将`friendID`作为参数，并返回此朋友是否在线：
```js
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  
  // ...

  return isOnline;
}
```

## 使用自定义钩子
最初，我们的目标是从`FriendStatus`和`FriendListItem`组件中删除重复的逻辑。他们俩都想知道朋友是否在线。

现在我们已经将这个逻辑提取到useFriendStatus钩子，我们可以使用它：
```js
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}

function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
**这段代码是否等同于原始示例？** 是的，他们以相同的方式工作。如果你仔细观察，你会注意到我们没有对行为做任何改变。我们所做的只是将两个函数之间的一些
公共代码提取到一个单独的函数中。**自定义挂钩是一种自然遵循`Hooks`设计的约定，而不是`React`功能。**

**我是否必须以`use`开头命名我的自定义`Hook`？** 我们希望你做到这点。这个习惯很重要。如果没有它，我们将无法自动检查是否
违反了[Hook规则](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/rules.md)，因为我们无法判断某个函数是否包含对
其中的`Hooks`的调用。

**两个组件使用相同的`Hook`共享状态吗？** 不会。自定义挂钩是一种重用有状态逻辑的机制（例如设置订阅和记住当前值），但每次使用自定义挂钩时，
自定义挂钩的所有状态和效果都是完全独立的。

**自定义`Hook`如何获得隔离状态？** 每次对`Hook`的调用都会被隔离。因为我们直接调用`useFriendStatus`，从`React`的角度来看，
我们的组件只调用`useState`和`useEffect`。
正如我们[之前](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/state-hook.md#%E6%8F%90%E7%A4%BA%E4%BD%BF%E7%94%A8%E5%A4%9A%E4%B8%AA%E7%8A%B6%E6%80%81%E5%8F%98%E9%87%8F)-[所知](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md#%E6%8F%90%E7%A4%BA%E4%BD%BF%E7%94%A8%E5%A4%9A%E9%87%8D%E6%95%88%E6%9E%9C%E5%88%86%E7%A6%BB%E9%97%AE%E9%A2%98)，我们可以在一个组件中多次调用`useState`和`useEffect`，它们将完全独立。

#### 提示：在挂钩之间传递信息
由于`Hooks`是函数，我们可以在它们之间传递信息。

为了说明这一点，我们将使用我们假设的聊天示例中的另一个组件。这是一个聊天消息收件人选择器，显示当前所选朋友是否在线：
```js
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);

  return (
    <>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </>
  );
}
```

我们将当前选择的`friend ID`保留在`recipientID`状态变量中，如果用户在`<select>`选择器中选择其他朋友，则更新它。

因为`useState Hook`调用为我们提供了`recipientID`状态变量的最新值，所以我们可以将它作为参数传递给我们的自定义`useFriendStatus Hook`：
```js
const [recipientID, setRecipientID] = useState(1);
const isRecipientOnline = useFriendStatus(recipientID);
```
这让我们知道当前选择的朋友是否在线。如果我们选择不同的朋友并更新`recipientID`状态变量，我们的`useFriendStatus Hook`将取消订阅之前选择的朋友，
并订阅新选择的朋友的状态。

### 使用你想象中的钩子
`Custom Hooks`提供了以前在`React`组件中无法实现的共享逻辑的灵活性。您可以编写自定义`Hook`，涵盖广泛的用例，如表单处理，动画，声明订阅，计时器，
以及可能还有更多我们没有考虑过的。更重要的是，可以构建与`React`的内置功能一样易于使用的`Hook`。

尽量抵制过早添加抽象。既然功能组件可以做得更多，那么代码库中的平均功能组件可能会变得更长。这是正常的 - 不要觉得你必须立即将它分成钩子。
但我们也鼓励你开始发现自定义`Hook`可以隐藏简单接口背后的复杂逻辑或帮助解开凌乱组件的情况。

例如，可能有一个复杂的组件，其中包含许多以`ad-hoc`方式管理的本地状态。 `useState`不会使更新逻辑更容易集中化，因此你可能希望将其
编写为`Redux reducer`：

```js
function todosReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, {
        text: action.text,
        completed: false
      }];
    // ... other actions ...
    default:
      return state;
  }
}
```
`reducer`非常便于单独测试，并且可以扩展以表达复杂的更新逻辑。如有必要，可以将它们分成更小的`reducer`。但是，你可能还享受使用React本地状态的好处，
或者可能不想安装其他库。

那么，如果我们可以编写一个`useReducer Hook`，让我们使用`reducer`管理组件的本地状态呢？它的简化版本可能如下所示：
```js
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  function dispatch(action) {
    const nextState = reducer(state, action);
    setState(nextState);
  }

  return [state, dispatch];
}
```
现在我们可以在我们的组件中使用它，让`reducer`驱动它的状态管理：
```js
function Todos() {
  const [todos, dispatch] = useReducer(todosReducer, []);

  function handleAddClick(text) {
    dispatch({ type: 'add', text });
  }

  // ...
}
```
在复杂组件中使用reducer管理本地状态的需求很常见，我们已经将`useReducer Hook`构建到`React`中。
你可以在[Hooks API参考中](https://reactjs.org/docs/hooks-reference.html)找到它与其他内置`Hook`一起使用。

