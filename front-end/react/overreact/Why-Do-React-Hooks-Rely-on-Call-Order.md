原文: [Why Do React Hooks Rely on Call Order?](https://overreacted.io/why-do-hooks-rely-on-call-order/)

在React Conf 2018，react团队介绍了[Hooks](https://reactjs.org/docs/hooks-intro.html)。

如果你想了解Hooks是什么，以及他解决了什么问题。请查看[我们的演讲](https://www.youtube.com/watch?v=dpw9EHDh2bM)介绍以及[后续写的一些文章](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889)去了解他。

你第一次看到他的时候可能不会喜欢他。

但是我想说的是，他需要经过一番品味之后才会发现其中的美妙。

当你阅读文档时，请一定要阅读[最重要的这一页](https://reactjs.org/docs/hooks-custom.html)，这是关于自定义Hook的！在这些文档里，很多人都会过于关注一些他们不同意的部分(比如学习class太难)，但是他们没有注意到Hooks的重点。这个重点就是**Hooks就像`functional mixins`，可以让你创建和组合成你自己的抽象化概念。**

Hooks[受到一些现有技术的影响](https://reactjs.org/docs/hooks-faq.html#what-is-the-prior-art-for-hooks)，但是在Sebastian与团队分享他的想法之前，我没有看到任何类似的东西。不幸的是这很容易忽略特定的API选择和此设计开放的有价值属性之间的联系。这篇文章，我希望能帮助更多人理解Hooks提案中最具争议性的方面的理由。

**本文假设你已经知道什么是`useState`Hook API并且知道如何写一个自定义的hook。如果你不知道，请查看之前的链接。另外，请记住，钩子是实验性的，你现在大可不必学习它们！**

> 笔者：如果不了解`Hooks API`, 又不想去看原文的，可以推荐你看[hooks中文系列](https://github.com/xiaohesong/TIL/tree/master/front-end/react/hooks)

免责声明：这是个人帖子，并不一定反映React团队的意见。它很大，话题很复杂，我可能在某个地方有犯过错误。

*** 

当你了解Hooks时，第一个感觉到惊讶也可能是最大的惊讶是它们一直依赖于重新渲染之间的调用索引。这有一些其他的[含义]([implications](https://reactjs.org/docs/hooks-rules.html)
)。

这个定案显然是有争议的。这就是为什么，[根据我们的原则](https://www.reddit.com/r/reactjs/comments/9xs2r6/sebmarkbages_response_to_hooks_rfc_feedback/e9wh4um/)，我们会在文档和语言描述的足够好的时候才会发一个提案让大家给一个公平的机会去选择。

**如果你关注Hooks API的设计方面，我鼓励你阅读Sebastian’s对1,000多条评论RFC讨论的[全部回答](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884)。**  这很深入，但是信息量过多。我可能会将此评论的每一段都变成自己的博客文章。 （事实上​​，我已经[做过](https://overreacted.io/how-does-setstate-know-what-to-do/)一次！）

我今天要关注一个特定的部分。你可能还记得，每个Hook可以在一个组件中使用多次。例如，我们可以通过重复调用`useState`来声明[多个状态变量](https://reactjs.org/docs/hooks-state.html#tip-using-multiple-state-variables)：
```js
function Form() {
  const [name, setName] = useState('Mary');              // State variable 1
  const [surname, setSurname] = useState('Poppins');     // State variable 2
  const [width, setWidth] = useState(window.innerWidth); // State variable 3

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleSurnameChange(e) {
    setSurname(e.target.value);
  }

  return (
    <>
      <input value={name} onChange={handleNameChange} />
      <input value={surname} onChange={handleSurnameChange} />
      <p>Hello, {name} {surname}</p>
      <p>Window width: {width}</p>
    </>
  );
}
```
请注意，我们使用数组解构语法来命名`useState`状态变量，但这些名称不会传递给React。相反的，在这个例子中，**React将`name`视为“第一个状态变量”，将`surname`视为“第二个状态变量”，依此类推。** 他们的call index(调用索引)使他们在重新渲染之间具有稳定的标识。对于这个，在[这篇文章](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)中有更好的描述。

表面看来，依赖于调用牵引只是*感觉不对*。直觉是一种不错的指引，但它可能会产生误导 -- 特别是如果我们没有完全内化我们正在解决的问题。 **在这篇文章中，我将为Hooks采用一些他们建议的常用的替代的设计，并展示它们不可以在什么地方。**

*** 
这篇文章不会很全面的做到。根据你的计算，我们已经看到了十几种到数百种不同的替代方案。在过去的五年里，我们一直在[思考](https://github.com/reactjs/react-future)替代组件的API。

像这样的博客文章很棘手，因为即使你覆盖了一百个替代品，也有人可以调整一个并说：“哈，你没想到这个！” 

在实践中，不同的替代方案易于在其缺点中重叠。我会用典型的例子展示最常见的缺陷，而不是枚举所有建议的API（这需要几个月）。通过这些问题对其他可能的API进行分类可能是读者的一种练习。 🧐

*这并不是说Hooks是完美的。*但是一旦你熟悉了其他解决方案的缺陷，你可能会发现Hooks设计有一定道理。

*** 

### 缺陷 #1: 无法提取自定义Hook
令人惊讶的是，许多替代方案根本不允许[自定义Hook](https://reactjs.org/docs/hooks-custom.html)。也许我们并没有在[“动机”文档](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md#%E5%8A%A8%E6%9C%BA)中充分强调自定义Hooks。在原函数被充分理解之前很难做到。所以这是一个鸡与蛋的问题。但定制hook在很大程度上是提案的重点。

例如，替代禁止在组件中调用多个useState。你将状态保存在一个对象中。这适用于类，对吧？
```js
function Form() {
  const [state, setState] = useState({
    name: 'Mary',
    surname: 'Poppins',
    width: window.innerWidth,
  });
  // ...
}
```
要清楚，Hooks确实允许这种风格。你不必将状态拆分为一堆状态变量（请参阅常见问题解答中的[建议](https://reactjs.org/docs/hooks-faq.html#should-i-use-one-or-many-state-variables)）。

但支持多个`useState`调用的重点是，你可以从组件中提取有状态逻辑（state+effect）的一部分到自定义Hook中，也可以独立使用本地state和effect：
```js
function Form() {
  // Declare some state variables directly in component body
  const [name, setName] = useState('Mary');
  const [surname, setSurname] = useState('Poppins');

  // We moved some state and effects into a custom Hook
  const width = useWindowWidth();
  // ...
}

function useWindowWidth() {
  // Declare some state and effects in a custom Hook
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    // ...
  });
  return width;
}
```
如果每个组件只允许一次`useState`调用，则会失去自定义Hook引入本地状态的能力。这是定制Hooks的重点。

### 缺陷 #2 名字冲突
一个常见的建议是让`useState`接受一个唯一标识`key`, 组件中特定状态变量的参数（例如字符串）。

这个想法可能有一些变动，但它们大致如下：
```js
// ⚠️ This is NOT the React Hooks API
function Form() {
  // We pass some kind of state key to useState()
  const [name, setName] = useState('name');
  const [surname, setSurname] = useState('surname');
  const [width, setWidth] = useState('width');
  // ...
```
这试图避免依赖于*call index*(调用索引), 但引入了另一个问题 - 名称冲突。

当然，除了错误之外，你可能不会在同一个组件中两次调用useState（'name'）。这可能会有意外发生，但我们可以争论这些任何错误。但是，当处理自定义Hook时，很可能需要添加或删除状态变量和效果(effects)。

有了这个提议，每当你在自定义Hook中添加一个新的状态变量时，你就有可能破坏使用它的任何组件（直接或传递），因为它们可能已经为自己的状态变量*使用了相同的名称*。

这是未[针对更改进行优化](https://overreacted.io/optimized-for-change/)的API的示例。当前代码可能总是看起来“优雅”，但是有要求需要变化的时候显得非常脆弱。我们应该从错误中[吸取](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes)教训。

实际上，Hooks提议通过依赖于调用顺序来解决这个问题：即使两个Hook使用`name`状态变量，它们也会彼此隔离。每个`useState`调用都有自己的“内存单元”。

我们还有其他一些方法可以解决这个缺陷，但它们也有自己的问题。让我们更细致地探讨这个问题。

### 缺陷 #3 不可以调用同样的Hooks两次
另一种useState的提案是使用Symbol，这样就不会有冲突，是吧？
```js
// ⚠️ This is NOT the React Hooks API
const nameKey = Symbol();
const surnameKey = Symbol();
const widthKey = Symbol();

function Form() {
  // We pass some kind of state key to useState()
  const [name, setName] = useState(nameKey);
  const [surname, setSurname] = useState(surnameKey);
  const [width, setWidth] = useState(widthKey);
  // ...
```
这个提案似乎像提取`useWindowWidth ` Hook:
```js
// ⚠️ This is NOT the React Hooks API
function Form() {
  // ...
  const width = useWindowWidth();
  // ...
}

/*********************
 * useWindowWidth.js *
 ********************/
const widthKey = Symbol();
 
function useWindowWidth() {
  const [width, setWidth] = useState(widthKey);
  // ...
  return width;
}
```
但是我们尝试提取对于输入的处理，那就不行了：
```js
// ⚠️ This is NOT the React Hooks API
function Form() {
  // ...
  const name = useFormInput();
  const surname = useFormInput();
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>    
  )
}

/*******************
 * useFormInput.js *
 ******************/
const valueKey = Symbol();
 
function useFormInput() {
  const [value, setValue] = useState(valueKey);
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

你能发现这个Bug吗？

我们两次调用useFormInput但我们的useFormInput总是使用相同的键调用useState。所以我们有效地做了类似的事情：
```js
const [name, setName] = useState(valueKey);
const [surname, setSurname] = useState(valueKey);
```
这就是我们再次发生冲突的方式。

实际上，Hooks提议没有这个问题，因为每次调用useState都会获得自己的隔离状态。依赖调用索引可以使我们免于担心名称冲突。

### 缺陷 #4 Diamond问题
这在技术上与前一个相同，但值得一提的是它的臭名昭着。它甚至在[维基百科也有所描述](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem)。

我们自己的mixin系统[遭受了它](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes)。

像useWindowWidth和useOnlineStatus这样的两个自定义Hook可能想要使用相同的自定义Hook，例如useSubscription：
```js
function StatusMessage() {
  const width = useWindowWidth();
  const isOnline = useNetworkStatus();
  return (
    <>
      <p>Window width is {width}</p>
      <p>You are {isOnline ? 'online' : 'offline'}</p>
    </>
  );
}

function useSubscription(subscribe, unsubscribe, getValue) {
  const [state, setState] = useState(getValue());
  useEffect(() => {
    const handleChange = () => setState(getValue());
    subscribe(handleChange);
    return () => unsubscribe(handleChange);
  });
  return state;
}

function useWindowWidth() {
  const width = useSubscription(
    handler => window.addEventListener('resize', handler),
    handler => window.removeEventListener('resize', handler),
    () => window.innerWidth
  );
  return width;
}

function useNetworkStatus() {
  const isOnline = useSubscription(
    handler => {
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
    },
    handler => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    },
    () => navigator.onLine
  );
  return isOnline;
}
```
这是一个完全有效的用例。**对于自定义Hook作者来说，启动或停止使用另一个自定义Hook应该是安全的，而不必担心它是否已在链中某处“已经使用”。** 实际上，除非你在每次更改时使用Hook审核每个组件，否则你*永远无法了解*整个链。

这是我们的“钻石”：💎
```config
       / useWindowWidth()   \                   / useState()  🔴 Clash
Status                        useSubscription() 
       \ useNetworkStatus() /                   \ useEffect() 🔴 Clash
```
依赖于调用顺序的方案可以解决:
```json
                                                / useState()  ✅ #1. State
       / useWindowWidth()   -> useSubscription()                    
      /                                          \ useEffect() ✅ #2. Effect
Status                         
      \                                          / useState()  ✅ #3. State
       \ useNetworkStatus() -> useSubscription()
                                                 \ useEffect() ✅ #4. Effect
```
函数调用没有“钻石”问题，因为它们形成了一个树。 🎄

### 缺陷＃5：复制粘贴破坏事物
许我们可以通过引入某种命名空间来挽救关键的state提案。有几种不同的方法可以做到这一点。

一种方法是使用闭包隔离状态键。这将要求您“实例化”自定义Hook并在每个Hook周围添加一个函数包装器：
```js
/*******************
 * useFormInput.js *
 ******************/
function createUseFormInput() {
  // Unique per instantiation
  const valueKey = Symbol();  

  return function useFormInput() {
    const [value, setValue] = useState(valueKey);
    return {
      value,
      onChange(e) {
        setValue(e.target.value);
      },
    };
  }
}
```
这种做法相当的狠。 Hooks的设计目标之一是避免使用高阶组件和渲染props所普遍存在的深层嵌套功能样式。在这里，我们必须在使用之前“实例化”任何自定义Hook，并在组件的主体中使用生成的函数。这并不比无条件地调用Hook简单得多。

此外，您必须重复两次组件中使用的每个自定义Hook。一旦进入顶级范围（或者在我们编写自定义Hook时在函数范围内），并且在实际调用站点一次。这意味着即使是小的更改，您也必须在渲染和顶级声明之间跳转：
```js
// ⚠️ This is NOT the React Hooks API
const useNameInput = createUseFormInput();
const useSurnameInput = createUseFormInput();

function Form() {
  // ...
  const name = useNameFormInput();
  const surname = useNameFormInput();
  // ...
}
```
你还需要非常精确地说出他们的名字。你总是会有“两个级别”的名字 - 像createUseFormInput这样的工厂和像useNameFormInput和useSurnameFormInput这样的实例化Hook。

如果你两次调用相同的自定义Hook“实例”，你会发生状态冲突。事实上，上面的代码有这个错误 - 你注意到了吗？它应该是：
```js
const name = useNameFormInput();
const surname = useSurnameFormInput(); // Not useNameFormInput!
```
这些问题并非不可克服，但我认为它们会比遵循“钩子规则”有更多的问题。

重要的是，它们打破了复制粘贴的期望。在没有额外的封装包装的情况下提取自定义Hook仍然可以使用这种方法，但只能在您调用它两次之前。这就是它产生冲突的时候。）当一个API看起来有效但是当你意识到在链条的某个地方存在冲突时，会强迫你把所有的东西包裹起来，这是不幸的。

### 缺陷＃6：我们仍然需要一个Linter
有另一种方法可以避免与键控状态发生冲突。如果你知道它，你可能真的很生气我仍然没有承认它！抱歉。

我们的想法是每次编写自定义Hook时都可以编写密钥。像这样的东西：
```js
// ⚠️ This is NOT the React Hooks API
function Form() {
  // ...
  const name = useFormInput('name');
  const surname = useFormInput('surname');
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>    
  )
}

function useFormInput(formInputKey) {
  const [value, setValue] = useState('useFormInput(' + formInputKey + ').value');
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```
出于不同的选择，我最不喜欢这种方法。我不认为这是有价值的。

传递非唯一或组合严密的密钥的代码会在多次调用Hook或与另一个Hook发生冲突之前工作。更糟糕的是，如果它是有条件的（我们试图“修复”无条件的通话要求，对吧？），我们甚至可能在以后遇到冲突。

记住在自定义Hooks的所有层中传递密钥似乎很不稳定，我们想要为此提供lint。他们会在运行时添加额外的工作（不要忘记他们需要作为键），并且每个都是针对包大小的剪纸。**但是，如果我们不得不去皮，我们解决了什么问题？**

如果有条件地声明状态和效果是非常可取的，这可能是有意义的。但在实践中我发现它令人困惑。事实上，我不记得有人要求有条件地定义this.state或componentDidMount。

这段代码到底意味着什么？

```js
// ⚠️ This is NOT the React Hooks API
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```
`props.isActive`为`false`时，是否保留计数？或者是否因为没有调用`useState('count')`而重置？

如果条件状态得到保留，那么effect呢？
```js
// ⚠️ This is NOT the React Hooks API
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    useEffect(() => {
      const id = setInterval(() => setCount(c => c + 1), 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```
它绝对不能在props.isActive是true第一次出现之前运行。但一旦它成为true，它是否会停止运行？当props.isActive为false时，间隔是否重置？如果是这样，那令人困惑的 是，这种效果与状态（我们说不会重置）的行为不同。如果效果继续运行，那么如果在效果之外实际上不会使效果成为条件，那就太令人困惑了。我们不是说我们想要条件去处理effect吗？

如果在渲染期间我们没有“使用”它时，状态却被重置，如果多个if分支包含useState（'count'）但在任何给定时间只运行一个会发生什么？这是有效的代码吗？开发人员是否期望从组件中提前返回以重置所有状态？如果我们真的想要重置状态，我们可以通过提取组件使其明确：
```js
function Counter(props) {
  if (props.isActive) {
    // Clearly has its own state
    return <TickingCounter />;
  }
  return null;
}
```
无论如何，这可能成为避免这些令人困惑的问题的“最佳实践”。因此，无论你选择哪种方式来回答这些问题，我认为有条件地声明状态和效果本身的语义最终会变得奇怪，以至于你可能想要对它进行抨击。

如果我们无论如何都需要lint，正确组成键的要求就变成了“负载”。它并没有给我们带来任何我们想要做的事情。但是，放弃这个要求（并回到最初的提案）确实给我们带来了一些东西。它使复制粘贴组件代码成为一个自定义的Hook安全，没有命名空间，减少了包大小的纸张切割，并解锁了一个稍微高效的实现（不需要Map查找）。

小事累加也变得繁琐。

### 缺陷＃7：无法在挂钩之间传递值
Hooks的最佳功能之一是可以在它们之间传递值。

以下是消息收件人选择器的一个假设示例，该示例显示当前选择的朋友是否在线：
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

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  const handleStatusChange = (status) => setIsOnline(status.isOnline);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });
  return isOnline;
}
```
当更改收件人时，我们的useFriendStatus Hook将取消订阅上一位朋友的状态，并订阅下一位朋友。

这是有效的，因为我们可以将useState Hook的返回值传递给useFriendStatus Hook：
```js
const [recipientID, setRecipientID] = useState(1);
const isRecipientOnline = useFriendStatus(recipientID);
```
在Hooks之间传递值非常强大。例如，[React Spring](https://medium.com/@drcmda/hooks-in-react-spring-a-tutorial-c6c436ad7ee4)允许您创建一个相互“跟随”的多个值的尾随动画：
```js
const [{ pos1 }, set] = useSpring({ pos1: [0, 0], config: fast });
  const [{ pos2 }] = useSpring({ pos2: pos1, config: slow });
  const [{ pos3 }] = useSpring({ pos3: pos2, config: slow });
```
[demo](https://codesandbox.io/s/ppxnl191zx)在这里。

将Hook初始化放入默认参数值或在装饰器表单中编写Hook的提议使得很难表达这种逻辑。

如果在函数体中没有调用Hooks，则不能再在它们之间轻松传递值，在不创建多层组件的情况下转换这些值，或者添加useMemo（）来记忆中间计算。也无法在效果中轻松引用这些值，因为它们无法在闭包中捕获它们。有些方法可以解决这些问题，但是它们要求您在精神上“匹配”输入和输出。这很棘手，违反了React的直接风格。

在Hooks之间传递价值是我们提案的核心。渲染props模式是你在没有Hooks的情况下最接近它的方法，但是如果没有像[Component Component](https://ui.reach.tech/component-component)那样由于“错误的层次结构”而具有大量语法干扰的东西，你就无法获得全部好处。钩子将该层次结构扁平化为传递值 - 函数调用是最简单的方法。

### 缺陷＃8：太多仪式
有许多提案属于这一保护伞。大多数人试图避免Hooks对React的依赖感。有很多种方法可以做到这一点：通过制作内置的Hooks于`this`，使它们成为一个额外的参数，你必须通过一切，等等。

我认为[Sebastian’s的回答](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884)比我描述的更好地解决了这个问题，所以我鼓励你查看它的第一部分（“注入模型”）。

我只想说程序员倾向于选择try / catch进行错误处理，以便通过每个函数传递错误代码。这就是为什么我们更喜欢带有导入（或CommonJS要求）的ES模块到AMD的“显式”定义的原因，其中require被传递给我们。
```js
// Anyone miss AMD?
define(['require', 'dependency1', 'dependency2'], function (require) {
  var dependency1 = require('dependency1'),
  var dependency2 = require('dependency2');
  return function () {};
});
```
是的，对于模块实际上并未在浏览器环境中同步加载的事实，AMD可能更“诚实”。但是一旦你了解到这一点，编写`define` sandwitch就会成为一种无意识的苦差事。

try / catch，require和React Context API是我们希望如何为我们提供一些“环境”处理程序的实用示例，而不是通过每个级别显式线程化它--即使一般来说我们重视显性。我认为Hooks也是如此。

这类似于我们定义组件时，我们只是从React中获取Component。如果我们为每个组件导出工厂，我们的代码可能会与React脱钩：
```js
function createModal(React) {
  return class Modal extends React.Component {
    // ...
  };
}
```
但在实践中，这最终只是一个恼人的间接。当我们真的想要用其他东西存根React时，我们总是可以在模块系统级别那样做。

这同样适用于Hooks。尽管如此，正如[Sebastian’s的回答](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884)所提到的那样，技术上可以将从反应中导出的Hook重定向到不同的实现。 （我[之前的一篇文章](https://overreacted.io/how-does-setstate-know-what-to-do/)提到过。）

强加更多仪式的另一种方法是制作Hooks[monadic](https://paulgray.net/an-alternative-design-for-hooks/)(元)或添加像React.createHook（）这样的一流概念。除了运行时开销之外，任何添加包装器的解决方案都会失去使用普通函数的巨大好处：*它们就像调试一样容易。*

普通函数允许您使用调试器进入和退出，中间没有任何库代码，并且可以准确地查看值如何在组件体内流动。间接使这很困难。在精神上类似于高阶组件（“装饰器”钩子）或渲染props的解决方案有着同样的问题。间接的使静态类型变得复杂。

*** 

正如我之前提到的，这篇文章并非旨在详尽无遗。不同的提案还有其他有趣的问题。其中一些更加模糊（例如，与并发或高级编译技术相关），并且可能是未来另一篇博客文章的主题。

钩子也不完美，但它是解决这些问题的最佳权衡。还有一些我们[仍然需要修复](https://github.com/reactjs/rfcs/pull/68#issuecomment-440780509)的东西，并且存在着使用Hook比使用类更尴尬的东西。这也是另一篇博文的主题。

无论我是否覆盖了您最喜欢的替代提议，我希望这篇文章能够帮助我们了解我们的思维过程以及我们在选择API时考虑的标准。正如您所看到的，很多（例如确保复制粘贴，移动代码，添加和删除依赖项按预期工作）与[优化更改](https://overreacted.io/optimized-for-change/)有关。我希望React用户会欣赏这些方面。
