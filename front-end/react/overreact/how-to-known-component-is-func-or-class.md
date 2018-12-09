原文: [how-does-react-tell-a-class-from-a-function](https://overreacted.io/how-does-react-tell-a-class-from-a-function/)

考虑这个定义为函数的`Greeting`组件：
```js
function Greeting() {
  return <p>Hello</p>;
}
```
`react`同样支持作为一个类去定义它:
```js
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```
(直到[最近](https://reactjs.org/docs/hooks-intro.html)，这是使用状态等功能的唯一方法。)

当你想渲染`<Greeting />`组件时，你不必关心它是如何定义的：

```js
//类或者函数，都可以
<Greeting />
```

但是，作为`react`本身，他是关心这些差异的！

如果`Greeting`是一个函数，`react`需要调用他:
```js
// 你的代码
function Greeting() {
  return <p>Hello</p>;
}

// React内
const result = Greeting(props); // <p>Hello</p>
```

但是如果`Greeting`是一个类，那么`React`就需要使用`new`来实例化它，然后在实例上调用`render`方法：
```js
// 你的代码
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// React内
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```
在这两种情况下，`React`的目标是获取渲染节点（本例中，是`<p> Hello </ p>`）。

#### 那么React如何知道某个东西是类还是函数呢？

就像在我[之前的帖子中](https://overreacted.io/why-do-we-write-super-props/)一样，你不需要知道`this`在React中的所作所为。多年来我一直都不知道。请不要把它变成面试问题。事实上，这篇文章更多的是关于`JavaScript`而不是关于`React`。

这个博客是为了好奇于想知道`React`为何以某种方式运作的读者。你是那个人吗？然后让我们一起挖掘。

**这是一段漫长的旅程。系好安全带。这篇文章没有太多关于`React`本身的信息，但我们将讨论`new`，`this`，`class`，`arrow function`，`prototype`，`__ proto__`，`instanceof`以及这些东西如何在`JavaScript`中协同工作的一些方面。幸运的是，当你使用React时，你不需要考虑那些。如果你正在实现React ......**

(如果你真的只想知道答案，请拉动到最后。)

***

首先，我们需要理解为什么以不同方式处理函数和类很重要。注意我们在调用类时如何使用new运算符：
```js
// If Greeting is a function
const result = Greeting(props); // <p>Hello</p>

// If Greeting is a class
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

让我们大致的了解下`new`在Javascript中做了什么事。

***

在过去(ES6之前)，Javascript没有类。但是，可以使用普通函数表现出于类相似的模式。 **具体来说，您可以在类似于类构造函数的角色中使用任何函数，方法是在调用之前添加new：** 
```js
// 只是一个function
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 不会如期工作
```
你今天仍然可以写这样的代码！在`DevTools`中尝试一下。

如果不携带`new`调用`Person('Fred') `,`this`在里面会指向全局和无用的东西（例如，窗口或未定义）。所以我们的代码会崩溃或者像设置`window.name`一样愚蠢。

通过在调用之前添加`new`，等于说：“嘿`JavaScript`，我知道`Person`只是一个函数，但让我们假设它类似于类构造函数。 **创建一个{}对象并在`Person`函数内将`this`指向该对象，这样我就可以分配像`this.name`这样的东西。然后把那个对象返回给我。”**

上面这些就是`new`操作符做的事情。

```js
var fred = new Person('Fred'); // `Person`内，相同的对象作为`this`
```
`new`操作符使得返回的`fred`对象可以使用`Person.prototype`上的任何内容。
```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```
这是人们在JavaScript直接添加类之前模拟类的方式。

***

所以`new`在JavaScript已经存在了一段时间。但是，`class`是新加的的。现在让我们使用`class`重写上面的代码以更紧密地匹配我们的意图：
```js
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Hi, I am ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```
*在语言和API设计中捕获开发人员的意图非常重要。*

如果你编写一个函数，JavaScript就无法猜测它是否像`alert()`一样被调用，或者它是否像`new Person()`那样充当构造函数。忘记为像`Person`这样的函数指定`new`会导致混乱的行为。

**类语法让相当于说：“这不仅仅是一个函数 - 它是一个类，它有一个构造函数”。** 如果在调用它时忘记使用`new`，JavaScript将引发错误：
```js
let fred = new Person('Fred');
// ✅  If Person is a function: works fine
// ✅  If Person is a class: works fine too

let george = Person('George'); // We forgot `new`
// 😳 If Person is a constructor-like function: confusing behavior
// 🔴 If Person is a class: fails immediately
```
这有助于我们尽早发现错误，而不是等待像`this.name`这样的一些模糊的`bug`被视为`window.name`而不是`george.name`。

但是，这意味着`React`需要在调用任何类之前使用`new`。它不能只是将其作为常规函数调用，因为JavaScript会将其视为错误！
```js
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// 🔴 React can't just do this:
const instance = Counter(props);
```
这意味着麻烦。
***

在我们看到React如何解决这个问题之前，重要的是要记住大多数人在React中使用像Babel这样的编译器来编译现代功能，比如旧浏览器的类。所以我们需要在设计中考虑编译器。

在`Babel`的早期版本中，可以在没有`new`的情况下调用类。但是，这被修复了 - 通过生成一些额外的代码：
```js
function Person(name) {
  // A bit simplified from Babel output:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Our code:
  this.name = name;
}

new Person('Fred'); // ✅ Okay
Person('George');   // 🔴 Can’t call class as a function
```
你或许在你打包的代码中看到类似上面这的，这就是所有`_classCallCheck`函数的功能。 （您可以通过选择进入“松散模式”而不进行检查来减小捆绑包大小，但这可能会使您最终转换为真正的原生类变得复杂。）
***

到现在为止，你应该大致了解使用`new`或不使用`new`来调用某些内容之间的区别：

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ `this` is a `Person` instance | 🔴 `TypeError`
| `function` | ✅ `this` is a `Person` instance | 😳 `this` is `window` or `undefined` |

这就是React正确调用组件的重要原因。 **如果您的组件被定义为类，React在调用它时需要使用`new`。**

**所以React可以检查某个东西是不是一个类？**

没有那么容易！即使我们可以[用JavaScript中的函数告诉一个类](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function)，这仍然不适用于像Babel这样的工具处理的类。对于浏览器来说，它们只是简单的功能。 
***

好吧，也许React可以在每次调用时使用`new`？不幸的是，这并不总是奏效。

作为常规函数，使用`new`调用它们会为它们提供一个对象实例作为`this`。对于作为构造函数编写的函数（如上面的`Person`），它是理想的，但它会使函数组件混淆：
```js
function Greeting() {
  // 我们不希望“this”在这里成为任何一种情况下的实例
  return <p>Hello</p>;
}
```

但这可能是可以容忍的。还有另外两个原因可以扼杀一直使用`new`的想法。
***
第一个可以扼杀的原因是因为箭头函数，来试试:
```js
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 Greeting is not a constructor
```
这种行为是有意的，并且遵循箭头函数的设计。箭头函数的主要优点之一是它们没有自己的`this`绑定 - 相反，这是从最接近的常规函数​​解决的：
```js
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` is resolved from the `render` method
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```
好的，所以**箭头功能没有自己的`this`。** 但这意味着他们作为构造者将完全无用！
```js
const Person = (name) => {
  // 🔴 This wouldn’t make sense!
  this.name = name;
}
```
因此，JavaScript不允许使用`new`调用箭头函数。如果你这样做，无论如何你可能犯了一个错误，最好早点告诉你。这类似于JavaScript不允许在没有`new`的情况下调用类的方式。

这很不错，但它也影响了我们的计划。 React不可以在所有内容上调用new，因为它会破坏箭头函数！我们可以尝试通过缺少`prototype`来检测箭头功能，而不仅仅是`new`：
```js
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```
但是这个[不适用](https://github.com/facebook/react/issues/4599#issuecomment-136562930)于使用`babel`编译的函数。这可能不是什么大问题，但还有另一个原因让这种方法成为死胡同。
***

我们不能总是使用`new`的另一个原因是它会阻止React支持返回字符串或其他原始类型的组件。
```js
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```
这再次与[`new`的设计](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)怪癖有关。正如我们之前看到的那样，`new`告诉JavaScript引擎创建一个对象，在函数内部创建该对象，然后将该对象作为`new`的结果。

但是，JavaScript还允许使用`new`调用的函数通过返回一些其他对象来覆盖`new`的返回值。据推测，这被认为对于我们想要重用实例的池这样的模式很有用：
```js
// Created lazily
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Reuse the same instance
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```
但是，如果函数不是对象，`new`也会完全忽略函数的返回值。如果你返回一个字符串或一个数字，就好像没有显示返回。
```js
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```
使用`new`调用函数时，无法从函数中读取原始返回值（如数字或字符串）。因此，如果React总是使用new，它将无法添加返回字符串的支持组件！

这是不可接受的，所以我们需要妥协。
***

**到目前为止我们学到了什么？**  React需要用`new`调用类（包括`Babel`输出），但它需要调用常规函数或箭头函数（包括Babel输出）而不需要`new`。并没有可靠的方法来区分它们(类和函数)。

**如果我们无法解决一般问题，我们能解决一个更具体的问题吗？**

将组件定义为类时，您可能希望为内置方法（如`this.setState()`）扩展`React.Component`。**我们可以只检测React.Component后代，而不是尝试检测所有类吗？**

剧透：这正是React所做的。
***

也许，检查`Greeting`是否是React组件类的惯用方法是测试`Greeting.prototype instanceof React.Component`：
```js
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```
我知道你在想什么。刚刚发生了什么？！要回答这个问题，我们需要了解JavaScript原型。

你可能熟悉原型链。JavaScript中的每个对象都可能有一个“原型”。当我们编写`fred.sayHi（）`但`fred`对象没有`sayHi`属性时，我们在`fred`的原型上查找`sayHi`属性。如果我们在那里找不到它，我们会看看链中的下一个原型--`fred`的原型的原型。等等。

**令人困惑的是，类或函数的prototype属性并不指向该值的原型。** 我不是在开玩笑。
```js
function Person() {}

console.log(Person.prototype); // 🤪 Not Person's prototype
console.log(Person.__proto__); // 😳 Person's prototype
```

所以“原型链”更像是`__proto __.__ proto __.__ proto__`而不是`prototype.prototype.prototype`。这花了我多年才得到。

那么函数或类的原型属性是什么呢？ **它是__proto__赋予所有使用该类或函数创建的对象！**
```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred'); // Sets `fred.__proto__` to `Person.prototype`
```
而__proto__链是JavaScript查找属性的方式：
```js
fred.sayHi();
// 1. Does fred have a sayHi property? No.
// 2. Does fred.__proto__ have a sayHi property? Yes. Call it!

fred.toString();
// 1. Does fred have a toString property? No.
// 2. Does fred.__proto__ have a toString property? No.
// 3. Does fred.__proto__.__proto__ have a toString property? Yes. Call it!
```
在实践中，除非您正在调试与原型链相关的内容，否则您几乎不需要直接从代码中触及`__proto__`。如果你想在`fred .__ proto__`上提供东西，你应该把它放在`Person.prototype`上。至少这是它最初设计的方式。

`__proto__`属性甚至不应该被浏览器暴露，因为原型链被认为是一个内部概念。但是有些浏览器添加了`__proto__`，最终它被勉强标准化（但赞成使用Object.getPrototypeOf（））。

然而，我仍然发现一个名为`prototype`的属性没有给你一个值的原型（例如，`fred.prototype`未定义，因为`fred`不是一个函数），这让我感到非常困惑。就个人而言，我认为这是即使是经验丰富的开发人员也会误解JavaScript原型的最大原因。
***

这是一个很长的帖子，嗯？我说我们80％在那里。保持着。

我们知道，当说`obj.foo`时，JavaScript实际上在`obj`，`obj .__ proto__`，`obj .__ proto __.__ proto__`中寻找`foo`，依此类推。

对于类，您不会直接暴露于此机制，但扩展也适用于良好的旧原型链。这就是我们的React类的实例如何访问`setState`之类的方法：
```js
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Found on c.__proto__ (Greeting.prototype)
c.setState();    // Found on c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Found on c.__proto__.__proto__.__proto__ (Object.prototype)
```
换句话说，当使用类时，实例的`__proto__`链“镜像”到类层次结构：
```js
// `extends` chain
Greeting
  → React.Component
    → Object (implicitly)

// `__proto__` chain
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

*** 

由于`__proto__`链反映了类层次结构，因此我们可以通过从`Greeting.prototype`开始检查`Greeting`是否扩展了`React.Component`，然后跟随其`__proto__`链：
```js
// `__proto__` chain
new Greeting()
  → Greeting.prototype // 🕵️ We start here
    → React.Component.prototype // ✅ Found it!
      → Object.prototype
```
方便的是，`x instanceof Y`确实完成了这种搜索。它遵循`x .__ proto__`链在那里寻找`Y.prototype`。

通常，它用于确定某些东西是否是类的实例：
```js
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype (✅ Found it!)
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Found it!)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Found it!)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype (🙅‍ Did not find it!)
```

但它确定一个类是否扩展另一个类也可以正常工作：
```js
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ We start here)
//     .__proto__ → React.Component.prototype (✅ Found it!)
//       .__proto__ → Object.prototype
```

那个检查是我们如何确定某些东西是React组件类还是常规函数。
***

但这并不是React所做的。 😳

对于`instanceof`解决方案的一个警告是，当页面上有多个React副本时它不起作用，而我们正在检查的组件继承自另一个React副本的React.Component。在一个项目中混合使用React的多个副本是不好的，原因有几个，但从历史上看，我们尽可能避免出现问题。 （使用Hooks，我们[可能需要](https://github.com/facebook/react/issues/13991)强制重复数据删除。）

另一种可能的启发式方法可能是检查原型上是否存在渲染方法。但是，当时还[不清楚](https://github.com/facebook/react/issues/4599#issuecomment-129714112)组件API将如何发展。每张支票都有成本，所以我们不想添加多张。如果将render定义为实例方法（例如使用类属性语法），这也不起作用。

因此，React为基本组件[添加](https://github.com/facebook/react/pull/4663)了一个特殊标志。React检查是否存在该标志，这就是它如何知道某些东西是否是React组件类还是函数。

最初的标志位于React.Component类的基础上：
```js
// Inside React
class Component {}
Component.isReactClass = {};

// We can check it like this
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Yes
```
但是，我们想要定位的一些类实现没有[复制](https://github.com/scala-js/scala-js/issues/1900)静态属性（或设置非标准`__proto__`），因此标志丢失了。

这就是React将此标志移动到`React.Component.prototype`的原因：
```js
// Inside React
class Component {}
Component.prototype.isReactComponent = {};

// We can check it like this
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Yes
```
**这实际上就是它的全部内容。**

您可能想知道为什么它是一个对象而不仅仅是一个布尔值。它在实践中并不重要，但早期版本的Jest（在Jest为Good™️之前）默认启用了自动锁定功能。生成的mocks省略了原始属性，[打破了检查](https://github.com/facebook/react/pull/4663#issuecomment-136533373)。感谢Jest。

`isReactComponent`检查在今天的React中使用。

如果不扩展React.Component，React将不会在原型上找到`isReactComponent`，也不会将组件视为类。现在你知道为什么[最受欢迎的回答](https://stackoverflow.com/questions/38481857/getting-cannot-call-a-class-as-a-function-in-my-react-project/42680526#42680526)是: `Cannot call a class as a function  `错误的答案是添加`extends React.Component`。最后，添加了一个[警告](https://github.com/facebook/react/pull/11168)，当`prototype.render`存在时会发出警告，但`prototype.isReactComponent`不存在。
***
**实际的解决方案非常简单，但我接着解释了为什么React最终得到了这个解决方案，以及替代方案是什么。**

根据我的经验，库API通常就是这种情况。 为了使API易于使用，经常需要考虑语言语义（可能，对于多种语言，包括未来的方向），运行时性能，有和没有编译时步骤的人体工程学，生态系统和包装解决方案的状态， 早期预警和许多其他事情。 最终结果可能并不总是最优雅，但它必须是实用的。

**如果最终API成功，则其用户永远不必考虑此过程。** 相反，他们可以专注于创建应用程序。

但如果你也好奇......很高兴知道它是如何运作的。



