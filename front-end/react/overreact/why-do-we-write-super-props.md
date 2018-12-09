原文: [Why Do We Write super(props)?](https://overreacted.io/why-do-we-write-super-props/)

我听说[hooks](https://reactjs.org/docs/hooks-intro.html)最近很热。具有讽刺意味的是，我想通过描述有关类组件的有趣事实来开始这个博客。那会怎么样！

**这些陷阱对于有效地使用React并不重要。但是如果你想更深入地了解事情的运作方式，你可能会发现它们很有趣。**

这是第一个。
***
我写过的`super(props)`比我知道的要多:
```js
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```
当然，[类字段提案](https://github.com/tc39/proposal-class-fields)让我们跳过仪式:
```js
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```
当`React 0.13`在`2015`年增加对普通类的支持时，[计划](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers)使用这样的语法。定义构造函数和调用`super(props)`成为临时解决方案，直到类字段提供符合人体工程学的替代方案。

但是，让我们回到这个例子，只使用ES2015功能：
```js
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```
我们为什么调用`super`？我们可以不调用它吗？如果我们必须调用它，如果我们不传递`props`会发生什么？还有其他论点吗？让我们来看看。

在JavaScript中，`super`指的是父类构造函数。（在我们的示例中，它指向React.Component实现。）

重要的是，在调用父构造函数之前，不能在构造函数中使用`this`。 JavaScript不会让你：
```js
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Can’t use `this` yet
    super(props);
    // ✅ Now it’s okay though
    this.state = { isOn: true };
  }
  // ...
}
```

有一个很好的理由说明为什么JavaScript在你触摸它之前强制执行父构造函数。考虑一个类层次结构：
```js
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 This is disallowed, read below why
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```
想象一下，在允许调用`super`之前使用`this`。一个月后，我们可能会更改`greetColleagues`以在邮件中包含此人的姓名：
```js
greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
}
```
但是我们忘记了在`super`调用有机会设置`this.name`之前调用`this.greetColleagues`。所以`this.name`甚至还没有定义！如您所见，这样的代码很难想到。

为了避免这些陷阱，JavaScript强制要求如果你想在构造函数中使用它，你必须首先调用`super`。让父级做自己的事！此限制也适用于定义为类的React组件：
```js
constructor(props) {
    super(props);
    // ✅ Okay to use `this` now
    this.state = { isOn: true };
  }
```
这给我们留下了另一个问题：为什么要传递`props`？
***
你可能认为将`props`传递给`super`是必要的，以便基本的React.Component构造函数可以初始化`this.props`：
```js
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

这与事实并不遥远 - 事实上，这就是它的[作用](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22)。

但不知何故，即使你没有使用`props`参数调用`super`，你仍然可以在`render`和其他方法中访问`this.props`。 （如果你不相信我，请亲自试试！）

这是如何运作的？事实证明，在调用构造函数后，React也会在实例上分配`props`：
```js
// Inside React
const instance = new YourComponent(props);
instance.props = props;
```
因此，即使你忘记将`props`传递给`super`，React仍会在之后设置它们。这是有原因的。

当React添加对类的支持时，它不仅仅增加了对ES6类的支持。目标是尽可能支持广泛的类抽象。目前尚[不清楚](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages)`ClojureScript`，`CoffeeScript`，`ES6`，`Fable`，`Scala.js`，`TypeScript`或其他解决方案在定义组件方面的成功程度。所以React故意不关心是否需要调用`super` - 即使是ES6类。

那么这是否意味着你可以只写`super()`而不是`super(props)`？

**尽可能不要这样，否则会使人困惑。** 

当然，React稍后会在你的构造函数运行后分配`this.props`。但是`this.props`在调用`super`和构造函数结束之间仍然是未定义的：
```js
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Inside your code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 We forgot to pass props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```
如果在从构造函数调用的某个方法中发生这种情况，则调试可能更具挑战性。 **这就是为什么我建议总是传递`super(props)`，即使它不是绝对必要的：**
```js
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ We passed props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```
这样可以确保在构造函数退出之前设置`this.props`。
***
最后一点React用户可能会对此感到好奇。

您可能已经注意到，当您在类中使用`Context API`时（使用遗留的`contextTypes`或`React 16.6`中添加的现代`contextType API`），上下文将作为第二个参数传递给构造函数。

那么为什么我们不写`super(props, context)`呢？我们可以，但上下文的使用频率较低，所以这个陷阱并没有那么多。

随着类字段的提议，这整个陷阱大多数都会消失。如果没有显式构造函数，则会自动传递所有参数。这允许像`state = {}`这样的表达式包含对`this.props`或`this.context`的引用（如果需要）。

有了Hooks，我们甚至没有`super`或`this`。但那是另一天的话题。


