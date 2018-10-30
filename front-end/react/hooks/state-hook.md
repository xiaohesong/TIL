在之前的的[hook 介绍](https://github.com/xiaohesong/TIL/blob/master/front-end/react/hooks/intro.md)里有一段代码:
```js
import { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

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
我们将通过将此代码与等效的类示例进行比较来开始学习`Hooks`。

### 等价的类示例
看下面这段代码，你会觉得很熟悉
```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```
状态以`{count：0}`开始，当用户通过调用`this.setState`单击按钮时，我们会增加`state.count`。我们将在整个页面中使用此类的片段。
> **注意** 你可能想知道为什么我们在这里使用计数器而不是更现实的例子。这是为了帮助我们专注于`API`，同时我们仍在使用`Hooks`迈出第一步。

### Hooks和函数组件
提醒一下，React中的函数组件如下所示：
```js
const Example = (props) => {
  // You can use Hooks here!
  return <div />;
}
```
或者是下面这样的：
```js
function Example(props) {
  // You can use Hooks here!
  return <div />;
}
```
你可能以前将这些称为“无状态组件”。我们现在介绍的这些中具有使用React状态的能力，所以我们更喜欢名称`function components`。

`Hook`在`class`内 **不起** 作用。但是你可以使用它们而不是编写类。

### 什么是Hook
我们的新示例首先从`React`导入`useState Hook`：
```js
import { useState } from 'react';

function Example() {
  // ...
}
```
**什么是`Hook`?** `Hook`是一种特殊功能，可让你“挂钩”`React`功能。例如，`useState`是一个`Hook`，允许你将`React`状态添加到函数组件。我们稍后会学习其他的`Hooks`。

**我什么时候使用`Hook`?** 如果你编写一个函数组件并意识到你需要为它添加一些状态，那么之前你必须将它转换为一个类。但是现在，你可以在现有功能组件中使用`Hook`。我们现在要做到这一点！

> **注意：**  关于在何处可以使用`Hook`并且不能在组件中使用`Hook`，有一些特殊规则。我们将在“[钩子规则](https://reactjs.org/docs/hooks-rules.html)”中学习它们。

### 声明一个状态变量
在`class`组件中，我们声明一个状态需要向下面这样:
```js
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
 //...
}
```
在函数组件中，我们没有`this`，所以我们不能分配或读取`this.state`。相反，我们直接在组件内部调用`useState Hook`：
```js
import { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);
  // ... 
}
```
**调用useState有什么作用？**  他声明了一个`状态变量`。我们的变量叫做`count`，但我们可以称之为其他任何东西，比如`banana`。这是一种在函数调用之间“保留”某些值的方法 - `useState`是一种使用`this.state`在类中提供的完全相同功能的新方法。通常，当函数退出时变量“消失”但`React`保留状态变量。

**我们传递给`useState`的参数是什么？** `useState Hook`的唯一参数是初始状态。与类不同，状态不必是对象。他可以是任何我们需要的内容，比如数字，字符串等。在我们的示例中，我们只需要一个数字来表示用户点击的次数，因此将0作为变量的初始状态。（如果我们想在状态中存储两个不同的值，我们将调用`useState`两次。）

**`useState`返回的是什么？** 它返回一对值：当前状态和更新状态的函数。这就是我们编写`const [count，setCount] = useState(0)`的原因。这与类中的 `this.state.count`和`this.setState`类似，只不过现在它们是成对的。

现在我们知道了`useState Hook`的作用，我们的例子应该更有意义
```js
import { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);
  // ...
}
```
我们声明一个名为`count`的状态变量，并将其设置为0。`React`将记住重新渲染之间的当前值，并为我们的函数提供最新的值。如果我们想要更新当前`count`，我们可以调用`setCount`。

> **注意** 你可能想知道：为什么`useState`没有命名为`createState`？“create”不会非常准确，因为状态仅在我们的组件第一次呈现时创建。在下一次渲染期间，`useState`为我们提供了当前状态。否则它根本不会是“状态”！`Hook`名称总是从`use`开始也是有原因的。我们将在后来的[rules hooks](https://reactjs.org/docs/hooks-rules.html)中了解原因。

### 读取状态
当我们想要在类中显示当前计数时，我们读取`this.state.count`：
```js
<p>You clicked {this.state.count} times</p>
```
在函数中，我们可以直接使用`count`：
```js
<p>You clicked {count} times</p>
```

### 更新状态
在一个类中，我们需要调用`this.setState`来更新`count`状态:
```js
<button onClick={() => this.setState({ count: this.state.count + 1 })}>
    Click me
</button>
```
在函数中，我们已经将`setCount`和`count`作为变量，因此我们不需要`this`：
```js
<button onClick={() => setCount(count + 1)}>
    Click me
</button>
```

### 概括
现在让我们回顾一下我们逐行学习的内容并检查我们的理解。
```js
 1:  import { useState } from 'react';
 2: 
 3:  function Example() {
 4:    const [count, setCount] = useState(0);
 5:
 6:    return (
 7:      <div>
 8:        <p>You clicked {count} times</p>
 9:        <button onClick={() => setCount(count + 1)}>
10:         Click me
11:        </button>
12:      </div>
13:    );
14:  }
```
- **第1行：** 我们从`React`导入`useState Hook`。它允许我们将本地状态保存在功能组件中。
- **第2行：** 在`Example`组件中，我们通过调用`useState Hook`来声明一个新的状态变量。它返回一对值，我们给它们命名。我们调用变量`count`，因为它包含按钮点击次数。
 我们通过传递0作为唯一的`useState`参数将其初始化为零。第二个返回的项本身就是一个函数。它允许我们更新`count`，因此我们将其命名为`setCount`。
- **第9行：** 当用户点击时，我们使用新值调用`setCount`。然后，`React`将重新呈现`Example`组件，并将新`count`值传递给它。

一开始看起来似乎有很多东西需要考虑。不要急于求成！如果你在解释有不了解的，请再次查看上面的代码并尝试从上到下阅读。我们保证，一旦你试图“忘记”状态如何在`class`上工作，并以新的角度看待这个代码，它就会有意义。

#### 提示：方括号意味着什么？
当我们声明一个状态变量时，你可能已经注意到方括号：
```js
const [count, setCount] = useState(0);
```
左侧的名称不是`React API`的一部分。你可以命名自己觉得合适的状态变量：
```js
const [fruit, setFruit] = useState('banana');
```
此`JavaScript`语法称为“[数组解构](https://github.com/xiaohesong/TIL/blob/master/front-end/es6/understanding-es6/destructuring.md#array-destructuring)”。这意味着我们正在创建两个新变量`fruit`和`setFruit`，其中`fruit`设置为`useState`返回的第一个值，`setFruit`是第二个。等同于下面的代码：
```js
var fruitStateVariable = useState('banana'); // Returns a pair
var fruit = fruitStateVariable[0]; // First item in a pair
var setFruit = fruitStateVariable[1]; // Second item in a pair
```
当我们使用`useState`声明一个状态变量时，它返回一对 - 一个包含两个项的数组。第一项是当前值，第二项是允许我们更新第一项值的函数。使用`[0]`和`[1]`访问它们有点令人困惑，因为它们具有特定含义。这就是我们使用数组解构的原因。

> **注意:**  你可能很好奇`React`如何知道哪个组件`useState`对应，因为我们没有将这样的任何内容传递给`React`。我们将在FAQ部分回答[这个问题](https://reactjs.org/docs/hooks-faq.html#how-does-react-associate-hook-calls-with-components)和许多其他问题。

#### 提示：使用多个状态变量
将状态变量声明为一对`[something，setSomething]`也很方便，因为如果我们想要使用多个状态变量，它可以让我们为不同的状态变量赋予不同的名称：
```js
function ExampleWithManyStates() {
  // Declare multiple state variables!
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  //...
}
```
在上面的组件中，我们将`age`，`fruit`和`todos`作为局部变量，我们可以单独更新它们：
```js
function handleOrangeClick() {
    // Similar to this.setState({ fruit: 'orange' })
    setFruit('orange');
  }
```
你 **不必使用** 许多状态变量。 状态变量可以很好地保存对象和数组，因此仍然可以将相关数据组合在一起。但是，与类中的`this.setState`不同，**更新状态变量总是替换它而不是合并它。**

我们[在FAQ](https://reactjs.org/docs/hooks-faq.html#should-i-use-one-or-many-state-variables)中提供了有关拆分独立状态变量的更多建议。

[本文原文地址](https://reactjs.org/docs/hooks-state.html)
