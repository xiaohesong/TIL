# React as a UI Runtime

大多数的教程介绍React是作为一个ui库。这个是说的通的，因为React是一个UI库。这就是标语所说的！

![](https://overreacted.io/static/0429fcb4a2f2022852afc698ff8968f1/74bd4/react.png)

我之前写过关于创建[用户界面](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/ui-element-problem-and-build-yourself.md)的挑战。但是这篇文章以不同的方式谈论react — 更像是程序运行时。

**这篇文章不会教你任何创建用户界面的东西。** 但它可能会帮助你更深入地理解React编程模型。

------

注意：如果你正在学习React，请查看[文档](https://reactjs.org/docs/getting-started.html#learn-react)。

### ⚠️

**这是一个深入系列 - 这篇文章对初学者不是那么的友好。** 在这篇文章中，我将从首要原理描述大部分的React编程模型。我不会解释如何使用它 - 只会解释它是如何工作的。

本文面向有经验的程序员和从事其他UI库的人，他们询问了在React中选择上的一些权衡。我希望你会觉得本文很有用！

**很多人很好的使用了React很多年，没有考虑到这些大多数的主题。** 这绝对是一个以程序员为中心的角度，而不是一个以[设计师为中心](http://mrmrs.cc/writing/2016/04/21/developing-ui/)的角度。但我不认为同时拥有这两种资源有什么坏处。

免责声明到此为止，我们开始正题吧！

------

## Host Tree

有些程序输出数字。其他的程序输出诗歌。不同的语言及其运行时通常针对特定的一组用例进行优化，而React也不例外。

React程序通常输出 **一个可能随时间变化的树。** 它可能是一个 [DOM树]([DOM tree](https://www.npmjs.com/package/react-dom)), [iOS 层次结构](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html),一个[PDF原始树](https://react-pdf.org/),甚至是一个[JSON对象](https://reactjs.org/docs/test-renderer.html)。但是，通常我们希望用它来表示一些UI。我们通常叫做"host tree"(主机树)，因为他是React之外，主机环境的一部分 -- 就像DOM或IOS。主机树通常有[他](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [自己的](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) API。

那么React对于什么有用呢？非常抽象地来说，它可以帮助你编写一个可预测地操作复杂主机树的程序，以响应外部事件，如交互，网络响应，计时器等。

当专用工具可以施加特定的约束并从中受益时，它就比通用工具做得更好。React将赌注压在两个原则上：

- **稳定性** 主机树相对稳定，大多数更新不会从根本上改变其整体结构。如果一个应用程序每秒钟都将所有的交互元素重新排列成一个完全不同的组合，那么它将很难使用。那个按钮在去了哪里？为什么我的屏幕在跳舞？

- **规律**  主机树可以分解为外观和行为一致的UI模式（例如按钮，列表，头像），而不是随机形状。

**这些原则恰好适用于大多数UI。** 但是，当输出中没有稳定的“模式”时，React就不适合了。例如，React可以帮助你编写Twitter客户端，但对于[3D管道屏幕保护程序](https://www.youtube.com/watch?v=Uzx9ArZ7MUU)不会非常有用。

## Host Instances

主机树由节点组成。我们称之为“主机实例”。

在DOM环境下，主机实例是常规的DOM节点，就像调用`document.createElement('div')`时获得的对象一样。在iOS上，主机实例可以是唯一标识来自JavaScript的原生视图的值。

主机实例有他们自己的属性(例如，`domNode.className`或者`view.tintColor`)。他们还可能包含其他的主机实例作为子项。

(这与React没什么关系 - 我正在描述主机环境。)

通常有一个API来操作主机实例。例如，DOM提供了诸如`appendChild`，`removeChild`，`setAttribute`等API。在React应用程序中，你通常不会去调用这些API。这些都是React的工作。

## Renderers

一个 *renderer* (渲染器) 告诉React与特定主机环境通信并管理其主机实例。React DOM, React Native, 甚至[Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211)都是React的渲染器。你也可以[创建你自己的React渲染器](https://github.com/facebook/react/tree/master/packages/react-reconciler)。

React的渲染器可以在两种模式的任一一个下面工作。

绝大多数渲染器都是使用“突变(可变)”模式编写的。这种模式就是DOM的工作方式：我们可以创建一个节点，设置其属性，然后在其中添加或删除子节点。主机实例是完全可变的。

React也可以在“不变的(一贯的)”模式下工作。此模式适用于不提供`appendChild()`等方法的主机环境，而是克隆父树并始终替顶层子级。主机树级别的不变性使多线程更容易。 [React Fabric]([React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018))利用了这一点。

作为一个React用户，你永远不需要考虑这些模式。我只想强调这个React不仅仅是从一种模式到另一种模式的适配器。它的有用性与低级视图API范式正交。

## React Elements

在主机环境中，主机实例（如DOM节点）是最小的构建块。在React中，最小的构建块是React *元素* 。

React元素是一个普通的JavaScript对象。它可以描述主机实例。

```jsx
// JSX是下面对象的一个语法糖.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

React元素是轻量级的，没有绑定它的主机实例。同样，它仅仅是你想要在屏幕上看到的内容的 *描述* 。

与主机实例一样，React元素可以形成树：

```jsx
// JSX is a syntax sugar for these objects.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

(注意：我忽略了[一些属性](https://overreacted.io/why-do-react-elements-have-typeof-property/),但是那些对于这里的阐述无关紧要)

但是，请记住，**React元素没有自己的不变的(持久)标识。** 它们意味着要一直重新创建和抛弃。

React元素是不可变的。例如，你无法更改子项或React元素的属性。如果你想之后渲染不同的东西，你将使用从头创建的新React元素树来描述它。

我喜欢将React元素视为电影中的帧。它们捕获UI在特定时间点应该是什么样子。他们不会改变。

## Entry Point

每个React渲染器都有个"入口点"。它是让我们告诉React在容器主机实例中呈现特定React元素树的API。

例如，React DOM入口点是`ReactDOM.render`：

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

当我们说`ReactDOM.render(reactElement, domContainer)`,我们的意思是：**亲爱的React，让**domContainer主机树匹配reactElement。 **

React将会查看`reactElement.type`(在我们的例子里，是`button`)并要求React DOM渲染器为其创建一个主机实例并设置属性：

```jsx
// Somewhere in the ReactDOM renderer (simplified)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);  domNode.className = reactElement.props.className;  return domNode;
}
```

在我们的示例中，React将那么做：

```jsx
let domNode = document.createElement('button');domNode.className = 'blue';
domContainer.appendChild(domNode);
```

如果React元素在`reactElement.props.children`中有子元素，则React将在第一次渲染时递归地为它们创建宿主实例。

## Reconciliation

如果我们用同一个容器调用`ReactDOM.render()`两次会发生什么？

```jsx
ReactDOM.render(
  <button className="blue" />,  document.getElementById('container')
);

// ... later ...

// Should this *replace* the button host instance
// or merely update a property on an existing one?
ReactDOM.render(
  <button className="red" />,  document.getElementById('container')
);
```

再次的，react的工作是使主机树与提供的react元素树匹配。为了响应新的信息而确定对主机实例树做什么的过程有时被称为[协调(和解)]([reconciliation](https://reactjs.org/docs/reconciliation.html))。

有两种方法可以解决它。 React的简化版本可以砍去现有的树并从头开始重新创建它：

```jsx
let domContainer = document.getElementById('container');
// Clear the tree
domContainer.innerHTML = '';
// Create the new host instance tree
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

但是在DOM中，这很慢并且丢失重要信息，如焦点，选择，滚动状态等。相反，我们希望React做这样的事情：

```jsx
let domNode = domContainer.firstChild;
// Update existing host instance
domNode.className = 'red';
```

换句话说，React需要决定何时更新现有主机实例以匹配新的React元素，以及何时创建新元素。

这提出了一个身份问题。 React元素每次都可能不同，但什么时候它在概念上引用相同的主机实例？

在我们的例子中，它很简单。我们曾经将`<button>`渲染为第一个（也是唯一的）子节点，我们想再次在同一个地方渲染一个`<button>`。我们已经有一个`<button>`主机实例，为什么要重新创建呢？让我们重复使用它。

这与React如何看待它非常接近。

**如果树中同一位置的元素类型在前一个和下一个渲染之间“匹配”，那么react将重用现有主机实例。**

这是一个示例，其中的注释大致显示了React做的：

```jsx
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// Can reuse host instance? Yes! (button → button)// domNode.className = 'red';ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// Can reuse host instance? No! (button → p)// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// Can reuse host instance? Yes! (p → p)// domNode.textContent = 'Goodbye';ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

同样的启发式方法也用于子树。例如，当我们更新一个带有两个`<button>`的`<dialog>`时，React首先决定是否重新使用`<dialog>`，然后为每个子节点重复此决策过程。

## Conditions

如果react仅在更新之间的元素类型“匹配”时重用主机实例，那么如何呈现条件内容？

假设我们想首先只显示一个`input`，但后来在它之前呈现一条消息：

```jsx
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Next render
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>    <input />
  </dialog>,
  domContainer
);
```

在此示例中，将重新创建`<input>`主机实例。React将遍历元素树，将其与先前版本进行比较：

- `dialog→ dialog`：可以重用主机实例吗？**是的 - 类型匹配。** 
  - `input → p`: 	可以重用主机实例吗？**不 - 类型改变了。** 需要删除现有`input`并创建新的`p`主机实例。
  - `(nothing) → input`: 需要创建一个新的`input`主机实例。

因此，React执行的更新代码就像：

```jsx
let oldInputNode = dialogNode.firstChild;dialogNode.removeChild(oldInputNode);
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');dialogNode.appendChild(newInputNode);
```

这不是很好，因为从概念上来说`<input>`还没有被`<p>`取代 - 它只是移动了。我们不想因为重新创建DOM而丢失它的选择、焦点状态和内容。

虽然这个问题很容易解决（我们将在一分钟内解决），但在React应用程序中并不常见。值得去看看原因。

实际上，你很少直接调用`ReactDOM.render`。相反，React应用程序往往被分解为这样的功能：

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

这个例子不受我们刚才描述的问题的影响。如果我们使用对象表示法而不是JSX，可能更容易理解为什么。看看`dialog`子元素树:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [        message,        { type: 'input', props: {} }      ]    }
  };
}
```

无论`showMessage`是`true`还是`false`，`<input>`都是第二个子节点，并且不会在渲染之间更改树位置。

如果`showMessage`从`false`到`true`, React将遍历元素树，将其与先前版本进行比较：

- `dialog → dialog`: 可以重用主机实例吗？**是的 - 类型匹配。**
  - `(null) → p`:需要插入新的`p`主机实例。
  - `input → input`: 可以重用主机实例吗？**是的 - 类型匹配。**

React执行的代码与此类似：

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

现在没有输入状态丢失。

## Lists

比较树中相同位置的元素类型通常足以决定是重用还是重新创建相应的主机实例。

但这只适用于子元素位置是静态且不是重新排序的情况。在上面的示例中，即使`message`可能是“漏洞”，我们仍然知道输入在消息之后，并且没有其他子节点。

使用动态列表，我们无法确定顺序是否相同：

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

如果我们的购物项目`list`被重新排序，React将看到里面的所有`p`和`input`元素具有相同的类型，并且不知道去移动它们。(从React的角度来看，购物项目本身已经改变，而不是他们的顺序。)

React执行的重新订购10个项目的代码如下：

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

因此，React不会 *重新排序* 它们，而是会有效地 *更新* 它们。这可能会产生性能问题和可能的错误。例如，第一个输入的内容在排序后会一直在第一个输入中——即使在概念上它们可能指代购物清单中的不同产品！

**这就是为什么每次在输出中包含元素数组时，React都会指定一个名为`key`的特殊属性：**

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

当React在`<form>`里看到了`<p key="42">`，它将检查前一个渲染是否在同一个`<form>`中包含`<p key ="42">`。即使`<form>`子元素改变了他们的顺序，这也有效。如果存在，React将重用具有相同key的先前主机实例，并相应地重新排序兄弟姐妹。

请注意，该`key`仅与特定的父React元素相关，例如`<form>`。React不会尝试在不同父级之间使用相同的键“匹配”元素。 （react不支持在不同的父级之间移动主机实例而不重新创建它。）

对于`key`来说，什么样的值才是好的？回答这个问题的简单方法是问：即使顺序发生变化，你何时会说项目“相同”？例如，在我们的购物列表中，产品ID在兄弟姐妹之间唯一地标识它。

## Components

我们已经看到了函数返回了React的元素：

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

他们被称为 *组件*。他们让我们创建自己的按钮，头像，评论等“工具箱”。组件是React的基础。

组件采用一个参数 - 一个对象哈希。它包含"props"（"properties"的缩写）。这里，`showMessage`是一个prop。他们就像命名参数。

## Purity

React的组件相对于他们的props来说假定是纯的。

```jsx
function Button(props) {
  // 🔴 Doesn't work
  props.isActive = true;
}
```

一般来说，突变在React中并不惯用。 （稍后我们将进一步讨论更新UI以响应事件的惯用方法。）

但是，局部突变绝对没问题：

```jsx
function FriendList({ friends }) {
  let items = [];  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

我们在 *渲染* 时创建了`items`，而没有其他组件“看到”它，因此我们可以在将其作为渲染结果的一部分传递之前，根据自己的喜好对其进行更改。没有必要为了避免局部突变而扭曲代码。

同样，尽管没有完全“纯”初始化，但延迟初始化还是可以的：

```jsx
function ExpenseForm() {
  // Fine if it doesn't affect other components:
  SuperCalculator.initializeIfNotReady();

  // Continue rendering...
}
```

只要多次调用一个组件是安全的并且不影响其他组件的呈现，react就不关心它在严格的FP意义上是否为100%纯的。[幂等](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation)对React而言比纯度更重要。

也就是说，react组件中不允许有用户直接看到的副作用。换句话说，仅仅 *调用* 组件函数本身不应该在屏幕上产生变化。

## Recursion

我们如何 *使用* 其他组件的组件？组件是函数，所以我们可以调用它们：

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

但是，这不是在react运行时使用组件的惯用方法。

相反，使用组件的惯用方法与我们之前已经看到的机制相同 - React元素。**这意味着你不必直接调用组件函数，而是让React稍后为你执行此操作：**

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

在React内部，你的组件将被调用：

```jsx
// Somewhere inside React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

组件函数名称按约定大写。当JSX转换看到`<Form>`而不是`<form>`时，它会使对象`type`本身成为标识符而不是字符串：

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

没有全局注册机制-我们在键入`<Form/>`时按名称逐字引用`Form`。如果`Form`在局部范围内不存在，你将看到一个JavaScript错误，就像通常使用错误的变量名一样。

**好的，那么当一个元素类型是一个函数时，react会做什么呢？它调用组件，并询问该组件希望呈现什么元素。**

该过程以递归方式继续，并在[此处](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)更详细地描述。简而言之，它看起来像这样：

- **你：** `ReactDOM.render(<App />, domContainer)`
- **React:** 嘿`App`，你呈现什么？
  - `App`: 我渲染带有`<Content>`的`<Layout>`
- **React:** 嘿`<Layout>`, 你呈现什么？
  - `<Layout>`: 我在`<div>`中渲染我的子项。我的子项是`<Content>`所以我想这会进入`<div>`。
- **React:** 嘿`<Content>`,你呈现什么？
  - `Content`: 我在里面用一些文本和一个`<Footer>`渲染一个`<article>`。
- **React:** 嘿`<Footer>`,你呈现什么？
  - `Footer`:我用更多文字渲染`<footer>`。
- **React:** 好的，给你:

```jsx
// Resulting DOM structure
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

这就是为什么我们说和解是递归的。当React遍历元素树时，它可能遇到`type`为组件的元素。它将调用它，并继续沿着返回的react元素树向下进行。最终我们将递归完组件，React将知道在主机树中要更改的内容。

我们已经讨论过的相同和解规则也适用于这里。如果同一位置的`type`（由索引和可选`key`确定）发生更改，React将抛弃其中的主机实例，并重新创建它们。

## Inversion of Control

你可能想知道：为什么我们不直接调用组件？为什么要写`<Form />`而不是`Form()`？

**如果React“知道”你的组件而不是在递归调用它们之后才看到React元素树，那么React可以更好地完成它的工作。**

```jsx
// 🔴 React has no idea Layout and Article exist.
// You're calling them.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React knows Layout and Article exist.
// React calls them.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

这是一个[控制反转](https://en.wikipedia.org/wiki/Inversion_of_control)的典型例子。通过让React控制调用我们的组件，我们得到了一些有趣的属性：

- **组件不仅仅是功能。** react可以使用与树中的组件标识相关联的本地状态等功能来扩充组件函数。一个好的运行时提供了与对应问题相匹配的基本抽象。正如我们已经提到的，react是专门面向那些呈现UI树并响应交互的程序的。如果直接调用组件，则必须自己构建这些功能。
- **组件类型参与和解。** 通过让react调用组件，你还可以告诉它更多关于树的概念结构的信息。例如，当你从呈现`<Feed>`页面移动到`<Profile>`页面时，React将不会尝试在其中重复使用主机实例 - 就像将`<button>`替换为`<p>`一样。所有状态都将消失——当呈现概念上不同的视图时，这通常是很好的。你不希望在`<PasswordForm>`和`<MessengerChat>`之间保留输入状态，即使树中的`<input>`位置意外地“排列”在它们之间。
- **React可以延迟和解。** 如果react控制了调用组件，它可以做许多有趣的事情。例如，它可以让浏览器在组件调用之间做一些工作，这样重新渲染大型组件树就[不会阻塞主线程](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)。在不重新实现大部分react的情况下手动协调这一点是困难的。
- **更好的调试。** 如果组件是库所知道的一等公民，那么我们可以构建丰富的开发者工具，以便在开发中进行自省。

响应调用组件函数的最后一个好处是 **惰性评估** 。让我们看看这意味着什么。

## Lazy Evaluation

当我们在javascript中调用函数时，参数会在调用之前进行计算：

```js
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

这通常是JavaScript开发人员所期望的，因为JavaScript函数可能具有隐含的副作用。如果我们调用一个函数，这将是令人惊讶的，但它不会执行，直到它的结果在JavaScript中以某种方式“使用”时才会执行。

但是React组件[相对](#purity)纯净。如果我们知道它的结果不会在屏幕上呈现，则完全没有必要执行它。

考虑将`<comments>`放入`<page>`中：

```jsx
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />    
     </Page>
  );
}
```

`Page`组件可以在一些`Layout`中呈现给它的子元素：

```jsx
function Page({ currentUser, children }) {
  return (
    <Layout>
      {children}    
     </Layout>
  );
}
```

*`<A><B /></A>`* 在JSX中，类似于这样*`<A children={<B />} />`*

但如果它有提前退出条件怎么办？

```diff
function Page({ currentUser, children }) {
+  if (!currentUser.isLoggedIn) {    
+  	 return <h1>Please login</h1>;  
+  }  
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

如果我们将`Comments()`作为函数调用，它将立即执行，无论`Page`是否要呈现它们：

```jsx
// {
//   type: Page,
//   props: {
//     children: Comments() // Always runs!   
//	 }
// }
<Page>
  {Comments()}
</Page>
```

但是，如果我们传递一个react元素，我们就根本不执行`Comments`：

```jsx
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

这让React决定何时以及是否调用它。如果我们的`Page`组件忽略了它的`children`prop并呈现`<h1>Please login</h1>`，React甚至不会去尝试调用`Comments`函数。重点是什么？

这很好，因为它既可以让我们避免不必要的渲染工作，也可以使代码不那么脆弱。当用户注销时，我们不关心是否抛出`Comments` - 它不会被调用。

## State

我们[之前](#reconciliation)已经讨论过标识，以及元素在树中的概念“位置”如何指示响应是重新使用主机实例还是创建新实例。主机实例可以具有各种本地状态：焦点，选择，输入等。我们希望在概念上呈现相同UI的更新之间保留此状态。当我们渲染在概念上不同的东西时（例如从`<SignupForm>`移动到`<MessengerChat>`），我们也希望可以预测地销毁它。

**本地状态非常有用，因此react让你自己的组件也拥有它。** 组件仍然是函数，但是React用对ui有用的特性增强了它们。与树中的位置相关联的本地状态就是这些特性之一。

我们将这些功能称为Hooks。例如，`useState`是一个Hook。

```jsx
function Example() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>      <button onClick={() => setCount(count + 1)}>        Click me
      </button>
    </div>
  );
}
```

它返回一对值：当前状态和更新它的函数。

[数组解构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring)语法允许我们为状态变量赋予任意名称。例如，我叫这个为`count`和`setCount`，但它可能是一个`banana`和`setBanana`。在下面的文本中，我将使用`setState`引用第二个值，而不管具体示例中的实际名称。

(可以在[此处](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)了解有关React提供的`useState`和其他Hook的更多信息。)

## Consistency

即使我们想要将协调过程本身拆分为[非阻塞](https://www.youtube.com/watch?v=mDdgfyRB5kg)的工作块，我们仍然应该在单个同步swoop中执行实际的主机树操作。这样我们就可以确保用户不会看到半更新的用户界面，并且浏览器不会对用户不应该看到的中间状态执行不必要的布局和样式重新计算。

这就是为什么React将所有工作分成“渲染阶段”和“提交阶段”。渲染阶段是React调用你的组件并执行和解。中断是安全的，[将来](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)会异步。提交阶段是React触及主机树的时间。它始终是同步的。

## Memoization

当父级通过调用`setState`来调度更新时，默认情况下React会和解其整个子树。这是因为React无法知道父级中的更新是否会影响子级，并且默认情况下React选择保持一致。这听起来可能是非常昂贵的代价，但实际上，对于中小型子树来说，这不是问题。

当树变得太深或太宽时，你可以告诉React[记住](https://en.wikipedia.org/wiki/Memoization)一个子树并在浅比较的prop更改期间重复使用先前的渲染结果：

```jsx
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

现在，在父`<Table>`组件中的`setState`将跳过和解其`item`在引用上等于上次呈现的`item`的行。

你可以使用[`useMemo()` Hook](https://reactjs.org/docs/hooks-reference.html#usememo)在单个表达式的级别上获得细粒度的记忆。缓存是组件树位置的本地缓存，将与其本地状态一起销毁。它只保存最后一个项目。

默认情况下，React故意不会记忆组件。许多组件总是收到不同的props，所以记住它们将只是一个损失。

(笔者：对于memoization，具体的可以[查看此处](https://github.com/xiaohesong/TIL/blob/master/front-end/react/useMemo.md))

## Raw Models

具有讽刺意味的是，React不使用“反应性”系统进行细粒度的更新。换句话说，顶部的任何更新都会触发和解，而不是只更新受更改影响的组件。

这是一个客观的设计决定。[交互时间](https://calibreapp.com/blog/time-to-interactive/)是Web应用程序中的一个关键指标，遍历模型以建立细粒度的监听会花费宝贵的时间。此外，在许多应用程序中，交互往往会导致小型（按钮悬停）或大型（页面转换）更新，在这种情况下，细粒度订阅会浪费内存资源。

React的核心设计原则之一是它可以处理原始数据。如果从网络接收了大量JavaScript对象，则可以直接将它们泵入组件而无需预处理。对于你可以访问哪些属性，或者当结构发生轻微变化时出现意外的性能悬崖峭壁，目前还不清楚。React渲染是O（视图大小）而不是O（模型大小），你可以通过[窗口](https://react-window.now.sh/#/examples/list/fixed-size)显着缩小视图大小。

有些类型的应用程序可以使用细粒度订阅 - 例如股票行情。这是“一切都在不断更新的罕见例子”。虽然命令式可以帮助优化此类代码，但React可能不适合此用例。不过，你可以在React之上实现自己的细粒度订阅系统。

**请注意，即使细粒度订阅和“反应性”系统也无法解决，也存在常见的性能问题。** 例如，在不阻塞浏览器的情况下呈现一个新的深树（每次页面转换时都会发生）。更改跟踪不会让它变得更快 - 它会使速度变慢，因为我们必须做更多的工作来设置订阅。另一个问题是，在开始呈现视图之前，我们必须等待数据。在React中，我们的目标是通过[并发渲染](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)来解决这两个问题。

## Batching

多个组件可能希望更新状态以响应同一事件。这个例子很复杂，但它说明了一个常见的模式：

```jsx
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>      
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
       Child clicked {count} times
    </button>
  );
}
```

调度事件时，子项的`onClick`将首先触发（触发其`setState`）。然后父进程在其自己的`onClick`处理程序中调用`setState`。

如果React立即重新渲染组件以响应`setState`调用，我们最终会将子项渲染两次：

```jsx
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 不必要
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

第一个`Child`渲染将被浪费。而且我们无法让React第二次跳过渲染`Child`，因为`Parent`可能会根据其更新状态将一些不同的数据传递给它。

这就是React在事件处理程序中批量更新的原因：

```json
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

组件中的`setState`调用不会立即造成重新渲染。相反，React将首先执行所有事件处理程序，然后触发单个重新渲染，将所有这些更新一起批处理。

批处理有助于提高性能，但如果编写以下代码，则会令人惊讶：

```jsx
const [count, setCounter] = useState(0);

  function increment() {
    setCounter(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

如果我们开始时设置`count`为`0`，这些只是三个`setCount(1)`调用。要解决此问题，`setState`提供了一个接受"updater"函数的重载：

```jsx
const [count, setCounter] = useState(0);

  function increment() {
    setCounter(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React会将updater函数放入队列中，然后按顺序运行它们，从而导致重新渲染，`count`设置为`3`。

当状态逻辑变得比几个`setState`调用更复杂时，我建议使用[`useReducer` Hook](https://reactjs.org/docs/hooks-reference.html#usereducer)将其表示为本地状态reducer。这就像是这个“更新程序”模式的演变，每个更新都有一个名称：

```jsx
const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

`action`参数可以是任何东西，尽管对象是常见的选择。

## Call Tree

编程语言运行通常具有[调用堆栈]([call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4))。当一个函数`a()`调用`b()`本身调用`c()`时，在JavaScript引擎的某个地方有一个像`[a，b，c]`这样的数据结构，它“跟踪”你的位置以及接下来要执行的代码。一旦退出`c`，它的调用堆栈帧就消失了 - 噗！它不再需要了。我们跳回到`b`。当我们退出`a`时，调用堆栈为空。

当然，React本身在JavaScript中运行并遵守JavaScript规则。但我们可以想象内部React有一些自己的调用堆栈来记住我们当前正在渲染的组件，例如： `[App, Page, Layout, Article /* we're here */]`。

React与通用语言运行库不同，因为它旨在呈现UI树。这些树需要“保持活力”，我们才能与它们互动。我们第一次调用`ReactDOM.render`之后，DOM不会消失。

这可能会延伸这个比喻，但我喜欢将React组件视为“调用树”，而不仅仅是“调用堆栈”。当我们“退出”`Article`组件时，它的React“call tree”帧不会被破坏。我们需要在[某处](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)保留本地状态和对主机实例的引用。

这些“调用树”帧连同它们的本地状态和主机实例一起被销毁，但只有当和解规则说这是必要的时候。如果你读过react源码，你可能会看到这些帧被称为[光纤](https://en.wikipedia.org/wiki/Fiber_(computer_science))。

纤维是本地状态存在的地方。当状态更新时，react将下面的光纤标记为需要和解，并调用这些组件。

## Context

在React中，我们将事物作为props传递给其他组件。有时，大多数组件需要相同的东西 - 例如，当前选择的视觉主题。将它传递到每个级别都很麻烦。

在React中，这是由[Context](https://reactjs.org/docs/context.html)解决的。它基本上类似于组件的[动态范围](http://wiki.c2.com/?DynamicScoping)。它就像一个虫洞，让你把东西放在顶部，让底部的每个子项都能阅读它，并在它改变时重新渲染。

```jsx
const ThemeContext = React.createContext(
  'light' // Default value as a fallback
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depends on where the child is rendered
  const theme = useContext(ThemeContext);
  // ...
}
```

当`SomeDeeplyNestedChild`呈现时，`useContext(ThemeContext)`将在树中查找其上方最近的`<ThemeContext.Provider>`，并使用其`value`。

(实际上，React在呈现时维护上下文堆栈。)

如果上面没有`ThemeContext.Provider`，则`useContext(ThemeContext)`调用的结果将是`createContext()`调用中指定的默认值。在我们的例子中，它是`"light"`。

## Effects

我们之前提到过React组件在渲染过程中不应该有可观察到的副作用。但副作用有时是必要的。我们可能想要管理焦点，在画布上绘图，订阅数据源等等。

在React中，这是通过声明一个效果来完成的：

```jsx
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {    document.title = `You clicked ${count} times`;  });
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

如果可能，React推迟执行效果，直到浏览器重新绘制屏幕。这很好，因为像数据源订阅这样的代码不应该损害[交互时间](https://calibreapp.com/blog/time-to-interactive/)和[首次绘制时间](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint)。 （有一个[很少使用]([rarely used](https://reactjs.org/docs/hooks-reference.html#uselayouteffect))的Hook可以让你选择退出这种行为并同步做事。避免它。）

效果不只是运行一次。它们在第一次向用户显示组件之后以及更新之后运行。效果可以关闭当前props和状态，例如上面示例中的`count`。

效果可能需要清理，例如订阅时。要自行清理，效果可以返回一个函数：

```jsx
useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React将在下次应用此效果之前以及在销毁组件之前执行返回的函数。

有时，在每个渲染上重新运行效果可能是不合需要的。如果某些变量没有改变，你可以告诉React[跳过](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)应用的效果：

```diff
useEffect(() => {
    document.title = `You clicked ${count} times`;
+  }, [count]);
```

但是，如果你不熟悉JavaScript闭包的工作原理，通常会过早优化并导致问题。

例如，这段代码是错误的：

```jsx
useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

这是错误的，因为`[]`是说“不要重新执行这效果”。但是效果会关闭在其外部定义的`handleChange`。而`handleChange`可能引用任何props或状态：

```jsx
function handleChange() {
    console.log(count);
  }
```

如果我们永远不让效果重新运行，`handleChange`将继续指向第一个渲染的版本，并且`count`内部的计数始终为`0`。

要解决此问题，请确保在指定依赖关系数组时，它包含可以更改的所有内容，包括函数：

```jsx
useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

根据你的代码，你可能仍会看到不必要的重新订阅，因为每次渲染时`handleChange`本身都不同。[`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) Hook可以帮助你。或者，可以让它重新订阅。例如，浏览器的`addEventListener` API速度非常快，为了避免调用它而跳过圈，可能会导致比其意义更大的问题。

(你可以在[此处](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/effect-hook.md)了解有关React提供的`useEffect`和其他Hook的更多信息。)

## Custom Hooks

由于像`useState`和`useEffect`这样的Hook是函数调用，我们可以将它们组成我们自己的Hook：

```jsx
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

自定义Hooks让不同的组件共享可重用的有状态逻辑。请注意，状态本身不是共享的。每次调用Hook都会声明自己的隔离状态。

(你可以在[此处](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/custom-hook.md)了解有关编写自己的Hook的更多信息。)

## Static Use Order

你可以将`useState`视为定义“React状态变量”的语法。当然，这 *不是* 一种语法。我们还在编写JavaScript。但我们将React视为运行时环境，并且由于React定制JavaScript来描述UI树，因此其功能有时会更接近语言空间。

如果`use`是一种语法，那么它在顶级是有意义的：

```jsx
// 😉 Note: not a real syntax
component Example(props) {
  const [count, setCount] = use State(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

将其放入条件、回调或组件外部意味着什么？

```jsx
// 😉 Note: not a real syntax

// This is local state... of what?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // What happens to it when condition is false?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // What happens to it when we leave a function?
    // How is this different from a variable?
    const [count, setCount] = use State(0);
  }
```

React状态是组件的本地状态及其在树中的标识。如果`use`是真正的语法，那么将它范围扩展到组件的顶层也是有意义的：

```jsx
// 😉 Note: not a real syntax
component Example(props) {
  // Only valid here
  const [count, setCount] = use State(0);

  if (condition) {
    // This would be a syntax error
    const [count, setCount] = use State(0);
  }
```

这与`import`仅适用于模块顶层的方式类似。

**当然，`use`实际上并不是一种语法。** (它不会带来太多好处，并会产生很多摩擦。)

但是，React确实希望所有对Hook的调用只发生在组件的顶层并且无条件地。可以使用[linter插件](https://www.npmjs.com/package/eslint-plugin-react-hooks)强制执行这些[Hooks规则](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/rules.md)。关于这种设计选择的争论很激烈，但实际上我并没有看到它让人困惑。我还写了为什么通常提出的替代方案[不起作用](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/Why-Do-React-Hooks-Rely-on-Call-Order.md)。

在内部，钩子被实现为[链表](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph)。当你调用`useState`时，我们将指针移动到下一个项目。当我们退出组件的[“调用树”帧](https://overreacted.io/react-as-a-ui-runtime/#call-tree)时，我们将结果列表保存到下一个渲染。

[这篇文章](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)简要介绍了Hook如何在内部工作。数组可能比链表更容易：

```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Next renders
    return hooks[i];
  }
  // First render
  hooks.push(...);
}

// Prepare to render
i = -1;
hooks = fiber.hooks || [];
// Call the component
YourComponent();
// Remember the state of Hooks
fiber.hooks = hooks;
```

(如果你很好奇，真正的代码就在[这里](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js)。)

这大致是每个`useState()`调用获得正确状态的方式。正如我们[之前](https://overreacted.io/react-as-a-ui-runtime/#reconciliation)所了解的那样，“匹配事物”对于React来说并不新鲜 - 协调依赖于以类似方式匹配渲染之间的元素。

## What’s Left Out

我们已经触及了React运行时环境的几乎所有重要方面。如果你了解此页面，你可能比90％的用户更了解React。而且不用担心这不正确！

我遗漏了一些部分，主要是因为我们都不清楚。React目前对于多路径渲染没有一个很好的描述，即父级渲染需要有关子级的信息时。此外，[错误处理](https://reactjs.org/docs/error-boundaries.html)API还没有Hooks版本。这两个问题可以一起解决。并发模式还不稳定，有关Suspense如何适应这张图片的有趣问题。也许我会做一个后续行动，当他们丰满和Suspense准备好，而不是[懒加载](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense)。

**我认为这说明了React的API的成功，你可以在不考虑这些主题的情况下取得很大进展。**  在大多数情况下，良好的默认值（如和解启发式算法）都是正确的。当你冒着射中自己脚部的风险时, 像关键警告这样的警告会促使你。

如果你是一个UI库的书呆子，我希望这篇文章有点有趣，并且更深入地阐明了React是如何工作的。或许你认为React太复杂了，你再也不会看了。在任何一种情况下，我都很乐意在Twitter上收到你的消息！谢谢你的阅读。
