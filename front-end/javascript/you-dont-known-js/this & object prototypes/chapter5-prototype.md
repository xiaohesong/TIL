# You Don't Know JS: *this* & Object Prototypes

# Chapter 5: Prototypes

在第3章和第4章中，我们多次提到了`[[Prototype]]`链，但还没有说明究竟是什么。我们现在将详细探讨原型。

**注意：** 模仿类拷贝行为的所有尝试，如前面第4章所述，描述为“mixins”的变体，完全绕过了我们在本章中讨论的`[[Prototype]]`链机制。

## `[[Prototype]]`

JavaScript中的对象具有内部属性，在规范中表示为`[[Prototype]]`，它只是对另一个对象的引用。在创建此属性时，几乎所有对象都被赋予非`null`值。

**注意：** 我们很快就会看到一个对象 *是* 有可能有一个空的`[[Prototype]]`链接，尽管这种情况不太常见。

考虑下面代码：

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

`[[Prototype]]`引用用于什么？在第3章中，我们研究了在对象(例如`myObject.a`)上引用属性时调用`[[Get]]`的操作。对于该默认`[[Get]]`操作，第一步是检查对象本身是否具有属性`a`，如果是，则使用它。

**注意：** ES6代理在本书的讨论范围之外（将在本系列的后续书中介绍！），但我们在此讨论的关于`[[Get]]`和`[[Put]]`行为的所有内容都不适用于`Proxy`参与。

但如果`a`不在`myObject`上，会发生什么呢? 这让我们注意到对象的`[[Prototype]]`链接。

如果无法直接在对象上找到所请求的属性，则默认的`[[Get]]`操作将继续跟随对象的`[[Prototype]]` **链接** 继续查找。

现在，假设它创建了一个具有[[Prototype]]链接的对象，我们正在检查指定的对象。

```js
var anotherObject = {
	a: 2
};

// create an object linked to `anotherObject`
var myObject = Object.create( anotherObject );

myObject.a; // 2
```

**注意：** 我们将很快解释`Object.create(..)`的作用以及它的运作方式。现在，假设它创建了一个带有`[[Prototype]]`链接的对象，我们将检查该链接到指定的对象。

所以，我们有一个`myObject`，它现在是`[[Prototype]]`链接到`anotherObject`。显然`myObject.a`实际上并不存在，但是，属性访问成功（在`anotherObject`上找到）并且确实找到值`2`。

但是，如果在`anotherObject`上找不到`a`，则其`[[Prototype]]`链，如果非空，那就会再次被查阅并遵循此过程。

此过程将继续，直到找到匹配的属性名称或`[[Prototype]]`链结束。如果在链的末尾 *未曾* 找到匹配的属性，则`[[Get]]`操作的返回结果是`undefined`。

类似于这个`[[Prototype]]`链查找过程，如果使用`for..in`循环遍历对象时，这个链上的任何可到达的属性(也是`enumerable`——参见第3章)都将被枚举。如果使用`in`运算符来测试对象上是否存在属性，`in`会检查对象的整个链(无论是否具有 *可枚举性* )。

```js
var anotherObject = {
	a: 2
};

// create an object linked to `anotherObject`
var myObject = Object.create( anotherObject );

for (var k in myObject) {
	console.log("found: " + k);
}
// found: a

("a" in myObject); // true
```

因此，当你以不同的方式执行属性查找时，会参考`[[Prototype]]`链，每次一个链接一个链接的查找。一旦找到属性或链结束，查找就停止。

### `Object.prototype`

但是`[[Prototype]]`链到底在 *哪里* “结束”？

每个 *普通* 的`[[Prototype]]`链的顶端是内置的`Object.prototype`。这个对象包含了在JS上使用的各种公共实用程序，因为JavaScript中的所有普通对象(内置的，而不是特定于主机的扩展)都“来自”这个(也就是说，它们在`[[Prototype]]`链的顶部) `Object.prototype`对象。

你可能熟悉的一些实用程序包括`.toString()`和`.valueOf()`。在第3章中，我们介绍了另一个：`.hasOwnProperty(..)`。还有一个你可能不熟悉的`object.prototype`上的函数是`.isPrototypeof(…)`。

### Setting & Shadowing Properties

回想下第3章中，我们提到在对象上设置属性比仅仅向对象添加新属性或更改现有属性的值更微妙。我们现在将更全面地重新讨论这种情况。

```js
myObject.foo = "bar";
```

如果`myObject`对象已经有一个名为`foo`的普通数据访问器属性，那么赋值就像更改现有属性的值一样简单。

如果`foo`尚未直接出现在`myObject`上，则会遍历`[[Prototype]]`链，就像`[[Get]]`操作一样。如果在链中的任何位置都找不到`foo`，则属性`foo`将按预期直接携带指定值添加到`myObject`。

但是，如果`foo`已经存在于链中更高的位置，则`myObject.foo ="bar"`赋值可能会出现细微的（也许是令人惊讶的）行为。我们一会儿再检查一下。

如果属性名`foo`既出现在`myObject`本身上，又出现在从`myObject`开始的`[[Prototype]]`链的更高级别上，这就称为 *shadowing* (阴影)。直接在`myObject`上的`foo`属性会对出现在链中更高位置的`foo`属性产生 *阴影(遮蔽)* ，因为`myObject.foo`查找总是会找到在链中最低端的`foo`属性。

正如我们刚刚隐射的那样，在`myObject`上的阴影`foo`并不像看起来那么简单。我们现在将检查`myObject.foo ="bar"`赋值的三个场景，当`foo` **不** 直接在`myObject`上时，但是 **是** 在 `myObject`的`[[Prototype]]`链的更高级别：

1. 如果在`[[Prototype]]`链的更高层上找到一个名为`foo`的普通数据访问器(参见第3章)，**并且它没有标记为只读(`writable:false`)** ，然后将一个名为`foo`的新属性直接添加到`myObject`，从而产生一个 **阴影属性(shadowed property)**。
2. 如果`foo`在`[[Prototype]]`链的更高层上被找到，但是它被标记为 **只读(`writable:false`)** ，那么既 **不允许** 设置现有属性，也不允许在`myObject`上创建阴影属性。如果代码在`strict mode`下运行，将抛出一个错误。否则，将无提示地忽略属性值的设置。无论哪种方式，都 **不会产生阴影** 。
3. 如果在`[[Prototype]]`链的更高层上发现`foo`并且它是一个setter(参见第3章)，那么将始终调用setter。不会将`foo`添加到(也称为阴影)`myObject`，也不会重新定义`foo` setter。

大多数开发人员假设，如果属性(`[[Put]]`)已经在`[[Prototype]]`链的更高位置上存在，那么属性(`[[Put]]`)的赋值总是会导致阴影，但是正如你所看到的，只有在前面描述的三种情况中的一种(#1)中才会出现这种情况。

如果你想在#2和#3的情况下阴影`foo`，你不能使用`=`赋值，而是必须使用`Object.defineProperty(..)`（参见第3章）将`foo`添加到`myObject`。

**注意：** 案例#2可能是三种情况中最令人惊讶的。*只读属性* 的存在可防止在`[[Prototype]]`链的较低级别隐式创建（阴影）同名属性。这种限制的原因主要是为了增强类继承属性的假象。如果你考虑下，链的更高级别的`foo`是继承(复制)到`myObject`的，那么在`myObject`上强制执行`foo`属性的不可写性是有意义的。但是，如果你将错觉与事实分开，并认识到实际上没有发生这样的继承复制(请参阅第4章和第5章)，仅仅因为其他对象上有一个不可写的`foo`，就阻止`myObject`拥有`foo`属性，这有点不自然。甚至更奇怪的是，此限制仅适用于`=`赋值，但在使用`Object.defineProperty(..)`时不会强制执行。

如果需要在方法之间进行委托，那么使用方法隐藏会导致丑陋的 *显式伪多态* (参见第4章)。通常，阴影比它的价值更复杂和微妙，**所以你应该尽可能避免它** 。 参见第6章了解一个可选的设计模式，该模式不鼓励使用阴影，支持更干净的可选模式。

阴影甚至可以以微妙的方式隐式发生，因此，如果试图避免它，必须小心。考虑：

```js
var anotherObject = {
	a: 2
};

var myObject = Object.create( anotherObject );

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "a" ); // false

myObject.a++; // oops, implicit shadowing!

anotherObject.a; // 2
myObject.a; // 3

myObject.hasOwnProperty( "a" ); // true
```

虽然看起来`myObject.a++`应该（通过委托）查找并且只是 *原地* 递增`anotherObject.a`属性本身，但是`++`操作相当于`myObject.a = myObject.a + 1`。结果是`[[Get]]`通过`[[Prototype]]`查找`a`属性，从`anotherObject.a`获取当前值`2`，将值递增`1`，然后`[[Put]]`在`myObject`上将`3`值赋给新的阴影`a`属性。哎呀！

在处理要修改的委托属性时要格外小心。如果你想增加`anotherObject.a`，唯一正确的方法是`anotherObject.a ++`。

## "Class"

此时，你可能想知道:“ *为什么* 一个对象需要链接到另一个对象?”真正的好处是什么?这是一个非常恰当的问题，但在我们完全理解和理解它 *是* 什么以及它如何有用之前，我们必须首先理解`[[Prototype]]` **不是** 什么。

正如我们在第4章中所解释的那样，在JavaScript中，对于称为“类”的对象没有抽象模式/蓝图，就像面向类的语言一样。 JavaScript **只** 有对象。

事实上，JavaScript在所有语言中 **几乎是独一无二的** ，因为它可能是唯一有权使用“面向对象”标签的语言，因为它是一个非常短的语言列表，可以直接创建对象，而不需要类。

在JavaScript中，类不能（因为它们不存在！）描述对象可以做什么。该对象直接定义自己的行为。**他们 *只是* 对象** 。

### "Class" Functions

JavaScript中有一种特殊的行为，多年来一直被无耻地滥用来攻击一些 *看起来* 像“类”的东西。我们将详细研究这种方法。

特殊的“类别”行为取决于函数的一个奇怪特征：默认情况下，所有函数都会获得一个名为`prototype`的公共，不可枚举（参见第3章）属性，这些属性指向一个其他任意对象。

```js
function Foo() {
	// ...
}

Foo.prototype; // { }
```

这个对象通常被称为“Foo的原型”，因为我们通过一个不幸命名为`Foo.prototype`的属性引用来访问他。然而，我们很快就会看到，这个术语注定会让我们陷入困惑。相反，我将称之为“以前被称为foo的原型的对象”。只是开个玩笑。那么这个怎么样：“对象被任意标记'Foo 点 prototype'”？

不管我们怎么称呼他，这个对象究竟是什么？

最直接的解释方法是，通过调用`new Foo()`创建的每个对象(参见第2章)最终都将(有些随意地) `[[Prototype]]`链接到这个“foo-点-prototype”对象上。

我们来说明一下：

```js
function Foo() {
	// ...
}

var a = new Foo();

Object.getPrototypeOf( a ) === Foo.prototype; // true
```

当通过调用`new Foo()`创建`a`时，发生的事情之一（参见第2章的所有 *四个* 步骤 (笔：[点击查看](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/you-dont-known-js/this%20%26%20object%20prototypes/chapter2-this-make-sense.md#new-binding))）是`a`得到一个内部的`[[Prototype]]`, 并链接到`Foo.prototype`指向的对象。

停下片刻，思考一下这句话的含义。

在面向类的语言中，可以生成一个类的多个 **副本** (即“实例”)，就像从模具中冲压某个东西一样。正如我们在第4章中看到的那样，这是因为实例化（或继承）类的过程意味着“将行为计划从该类复制到物理对象中”，并且对每个新实例再次执行此操作。

但是在JavaScript中，没有执行这样的复制操作。你不需要创建类的多个实例。你可以创建多个对象，他们的`[[Prototype]]` *链接*到一个公共的对象。但在默认情况下，不会发生复制，因此这些对象不会彼此完全分离和断开连接，而是完全 **链接** 在一起。

`new Foo()`导致一个新对象（我们称之为`a`），并且 **这个** 新对象`a`内部的`[[Prototype]]`链接到`Foo.prototype`对象。

**我们最终得到了两个相互关联的对象。** 就是 *这样* 而已。我们没有实例化一个类。我们当然没有将行为从“类”复制到具体对象中。我们只是让两个对象相互链接。

事实上，大多数JS开发人员都不知道的秘密是，`new Foo()`函数调用与创建链接的过程几乎没有 *直接* 关系。**这是一种意外的副作用。** `new Foo()`是一种间接的、循环的方式，最终得到我们想要的： **一个新对象链接到另一个对象** 。

我们能以更 *直接* 的方式获得我们想要的东西吗？**是的!** 这个就是`Object.create(..)`。但我们稍后会谈到这一点。

#### What's in a name?

在JavaScript中，我们不会从一个对象（“类”）复制到另一个对象（“实例”）。我们在对象之间建立 *链接* 。对于`[[Prototype]]`机制，在视觉上，箭头从右到左，从下到上移动。

![](https://github.com/getify/You-Dont-Know-JS/raw/master/this%20%26%20object%20prototypes/fig3.png)

这种机制通常被称为“原型继承”(我们将在稍后详细探讨这些代码)，这通常被称为“经典继承”的动态语言版本。它试图利用对“继承”在面向类的世界中是什么意思的共同理解，但是 *调整* (延伸: 铺平)所理解的语义，以适应动态脚本。

“继承”这个词有很强的含义（见第4章）。仅仅在前面添加“prototype(原型)”来区分JavaScript中 *实际上几乎相反* 的行为，就已经导致了近20年的混乱。

我想说的是，把“原型”放在“继承”的前面，彻底颠倒它的实际含义，就像一手拿着橘子，一手拿着苹果，坚持把苹果叫做“红橙”。无论我在它面前放置什么令人困惑的标签，这都不会改变一种水果是苹果而另一种水果是橙子的 *事实* 。

更好的方法是明确地称苹果为苹果 - 使用最准确和直接的术语。这使得更容易理解它们的相似之处和它们的 **许多差异性** ，因为我们都对“苹果”的含义有一个简单的共识。

由于术语的混淆和融合，我认为标签“原型继承”本身(并试图误用所有相关的面向类的术语，如“类”、“构造函数”、“实例”、“多态性”等)在解释JavaScript机制的 *实际* 工作方式时 **弊大于利** 。

“继承”意味着 *复制* 操作，而javascript不复制对象属性（原生的，默认的）。相反，JS在两个对象之间创建了一个链接，其中一个对象本质上可以将属性/函数访问 *委托* 给另一个对象。对于JavaScript的对象链接机制，“委托”（参见第6章）是一个更准确的术语。

JavaScript中经常出现的另一个术语是“差异继承”。这里的思想是，我们用与更一般的描述所 *不同* 的方式描述对象的行为。例如，你解释说汽车是一种车辆，但它只有4个车轮，而不是重新描述构成普通车辆（发动机等）的所有细节。

如果你试图将JS中的任何给定对象看作是通过委托可用的所有行为的总和，并 **在你的脑海中扁平化** 所有的行为成一个有形的东西，然后你就可以(某种程度上)看到“差异继承”是如何适用的。

但是就像“原型继承”一样，“差异继承”假装你的心理模型比语言中物理上实际发生的更重要。它忽略了这样一个事实，即对象B实际上并没有差别地构造，而是按照定义的特定特征构造的，而“漏洞”则没有定义任何东西。正是在这些“漏洞”(定义上的漏洞，或者缺少定义)中，委托 *可以* 接管它们，并动态地用委托行为“填补它们”。

**通过复制** ，对象不会像“差异继承”的心智模型所暗示的那样，在原生默认情况下被扁平为单个差异对象。因此，“差异继承”并不适合描述JavaScript的`[[Prototype]]`机制实际如何工作。

你 *可以选择* 更喜欢“差异继承”术语和心理模型，这是一种品味，但不可否认的事实是，它只适合你心中的精神杂技，而不是引擎中的物理行为。

### "Constructors"

让我们回到一些早期的代码：

```js
function Foo() {
	// ...
}

var a = new Foo();
```

究竟是什么让我们认为Foo是一个“类”？首先，我们看到使用`new`关键字，就像面向类的语言在构造类实例时那样。另一方面，看起来我们实际上是在执行类的 *构造函数* 方法，因为`Foo()`实际上是一个被调用的方法，就像实例化该类时调用实际类的构造函数一样。

为了进一步混淆“构造函数”的语义，任意标记的`Foo.prototype`对象还有另一个技巧。考虑此代码：

```js
function Foo() {
	// ...
}

Foo.prototype.constructor === Foo; // true

var a = new Foo();
a.constructor === Foo; // true
```

默认情况下，`Foo.prototype`对象（在代码片段的第1行的声明时间！）获得一个名为`.constructor`的公共，不可枚举（参见第3章）属性，此属性是对该对象关联的函数（在本例中为`Foo`）的引用。此外，我们看到由“构造函数”调用`new Foo()`创建的对象`a` *似乎* 也有一个名为`.constructor`的属性，该属性类似地指向“创建它的函数”。

**注意：** 事实并非如此。`a`上没有`.constructor`属性，虽然`a.constructor`确实解析为`Foo`函数，正如它所显示的那样，“构造函数” **实际上并不意味着** “由...构造”。我们很快就会解释这种奇怪的现象。

哦，是的，还有……按照javascript世界的惯例，“class”是用大写字母命名的，因此它是`Foo`而不是`foo`这一事实是我们打算将其作为“class”的有力线索。这对你来说非常明显，对吧！？

**注意：** 这个约定非常强大，如果你在一个小写名称的方法上调用`new`，或者如果我们不在一个以大写字母开头的函数上调用`new`，那么许多JS linters 实际上会 *抱怨* 。这让我们难以置信，我们为了在JavaScript中获得(假的)“面向类”而努力，我们创建linter规则来确保使用大写字母，即使大写字母对JS引擎没有 **任何意义** 。

#### Constructor Or Call?

在上面的代码片段中，很容易认为`Foo`是一个“构造函数”，因为我们用`new`来调用它，我们注意到它“构造”了一个对象。

实际上，`Foo`不再是程序中任何其他函数的“构造函数”。函数本身 **不是** 构造函数。但是，当你将`new`关键字放在普通函数调用之前时，会使该函数称为“构造函数调用”。事实上，`new`类型劫持了任何正常的函数，并以构造对象的方式调用它，**除了它要做的其他事情。** 

例如：

```js
function NothingSpecial() {
	console.log( "Don't mind me!" );
}

var a = new NothingSpecial();
// "Don't mind me!"

a; // {}
```

`NothingSpecial`只是一个普通的正常函数，但是当使用`new`调用它时，它*构造*了一个对象，几乎作为副作用，我们恰好赋值给`a`。这个 **调用** 是一个 *构造函数* 调用，但是`NothingSpecial`本身不是 *构造函数* 。

句话说，在javascript中，最恰当的说法是“构造函数”是在前面 **使用`new`关键字调用的任何函数** 。

函数不是构造函数，但当且仅当使用`new`时，函数调用才是“构造函数调用”。

### Mechanics

*这些* 是 JavaScript 中命运多舛的 "类" 讨论的唯一常见触发器吗？

**不完全是。** JS开发人员努力模拟尽可能多的面向类：

```js
function Foo(name) {
	this.name = name;
}

Foo.prototype.myName = function() {
	return this.name;
};

var a = new Foo( "a" );
var b = new Foo( "b" );

a.myName(); // "a"
b.myName(); // "b"
```

这个片段展示了另外两个“面向类”技巧：

1. `this.name = name`: 将`.name`属性添加到每个对象（分别为`a`和`b`;请参阅第2章有关的`this`绑定），类似于类实例封装数据值的方式。
2. `Foo.prototype.myName = ...`: 也许是更有趣的技术，它为`Foo.prototype`对象添加了一个属性（函数）。现在，`a.myName()`有效工作，但也许令人惊讶。如何工作的？

在上面的代码片段中，很容易被诱导地认为当创建`a`和`b`时，`Foo.prototype`对象上的属性/函数被复制到`a`和`b`对象中的每一个。**然而，情况并非如此。** 

在本章的开头，我们解释了`[[Prototype]]`链接，以及如果直接在对象上找不到属性引用，它如何提供后备查找步骤，这是默认的`[[Get]]`算法的一部分。

因此，根据它们的创建方式，`a`和`b`最终都有一个内部的`[[Prototype]]`链接到`Foo.prototype`。如果在`a`或`b`上分别找不到`myName`，则会在`Foo.prototype`上找到（通过委托，请参阅第6章）。

#### "Constructor" Redux

回想一下前面关于`.constructor`属性的讨论，如果`.constructor===Foo`为true，则表示`a`上有一个实际的`.constructor`属性，指向`Foo`？ **不正确** 。

这只是令人遗憾的困惑。实际上，`.constructor`引用也被 *委托* 给`Foo.prototype`，**碰巧**， 默认情况下，它有一个指向`Foo`的`.constructor`。

由`Foo`“构造”的`a`对象可以访问指向`Foo`的`.constructor`属性，这似乎非常方便。但这只不过是一种虚假的安全感。通过这个默认的`[[Prototype]]`委托，`a.constructor` *碰巧* 指向`Foo`，这是一个令人高兴的意外，几乎是无关紧要的。实际上，`.constructor`的错误假设“由...构建”可能会以几种方式影响到你。

首先，`Foo.prototype`上的`.constructor`属性默认情况下只存在于被声明的`Foo`函数创建的对象上。如果你创建一个新对象，并替换一个函数的默认`.prototype`对象引用，那么这个新对象在默认情况下将不会在其上神奇地获得`.constructor`。

考虑：

```js
function Foo() { /* .. */ }

Foo.prototype = { /* .. */ }; // create a new prototype object

var a1 = new Foo();
a1.constructor === Foo; // false!
a1.constructor === Object; // true!
```

`Object(..)`没有“构造”`a1`，对吧?看起来好像`Foo()`“构建”了它。许多开发人员认为`Foo()`正在构建，但是当你认为“构造函数”意味着“由...构造”时，一切都崩溃了，因为通过这种推理，`a1.constructor`应该被`Foo`构建，但事实并非如此！

发生了什么？`a1`没有`.constructor`属性，因此它沿着`[[Prototype]]`链向上委托给`Foo.prototype`。但是该对象也没有`.constructor`（比如默认的`Foo.prototype`对象会有!），所以它一直委托，这次是委托链的顶端`Object.prototype`。*该* 对象确实有一个`.constructor`，它指向内置的`Object(..)`函数。

**误解，消除了。**

当然，你可以将`.constructor`添加回`Foo.prototype`对象，但这需要手动工作，特别是如果你想匹配原生行为并使其不可枚举（请参阅第3章）。

例如：

```js
function Foo() { /* .. */ }

Foo.prototype = { /* .. */ }; // create a new prototype object

// Need to properly "fix" the missing `.constructor`
// property on the new object serving as `Foo.prototype`.
// See Chapter 3 for `defineProperty(..)`.
Object.defineProperty( Foo.prototype, "constructor" , {
	enumerable: false,
	writable: true,
	configurable: true,
	value: Foo    // point `.constructor` at `Foo`
} );
```

这里有大量的手工工作去修复`.constructor`。而且，我们所做的一切都是让“构造函数”的意思“由......构建”的误解延续下去。那是一种 *昂贵* 的错觉。

事实是，对象上的`.constructor`在默认情况下任意指向一个函数，该函数反过来又有一个对该对象的引用，即它调用`.prototype`的引用。“构造函数”和“原型”这两个词只有一个松散的默认值，其含义可能为成立，也可能不成立。最好的方法是提醒自己，“构造函数并不意味着由...构造”。

`.constructor`不是一个神奇的不可变属性。它是不可枚举的(参见上面的代码片段)，但是它的值是可写的(可以修改)，而且，你可以在任何`[[Prototype]]`链中的任何对象上添加或覆盖(有意或无意地)`constructor`属性的名称，使用你认为合适的任何值。

凭借`[[Get]]`算法遍历`[[Prototype]]`链的方式，在任何地方找到的`.constructor`属性引用可能与你期望的完全不同。

看到它的意义有多随意了吗? 结果呢? 一些任意的对象属性引用，比如`a1.constructor`实际上不能被 *信任* 为假定的默认函数引用。而且，正如我们很快就会看到的那样，仅仅通过简单的省略，`a1.constructor`甚至可以最终指向一个非常令人惊讶和不知情的地方。

`.constructor`非常不可靠，并且在你的代码中依赖于不安全的引用。**通常，应尽可能避免使用此类引用。**

## "(Prototypal) Inheritance"

我们已经看到了一些类似于“类”机制入侵JavaScript程序的例子。但是如果我们没有一个近似于“继承”的JavaScript“类”，它将是相当空洞的。

实际上，当`a`能够“继承”`Foo.prototype`时，我们已经看到了通常被称为“原型继承”的机制，从而可以访问`myName()`函数。但我们传统上认为“继承”是两个“类”之间的关系，而不是“类”和“实例”之间的关系。

![](https://github.com/getify/You-Dont-Know-JS/raw/master/this%20%26%20object%20prototypes/fig3.png)

回想一下前面的这个图，它不仅显示了从对象(即“实例”)`a1`到对象`Foo.prototype`的委托，但从`Bar.prototype`到`Foo.prototype`，它在某种程度上类似于父-子类继承的概念。*类似* ，当然除了箭头的方向之外，显示这些是委派链接，而不是复制操作。

下面是创建这种链接的典型“原型风格”代码:

```js
function Foo(name) {
	this.name = name;
}

Foo.prototype.myName = function() {
	return this.name;
};

function Bar(name,label) {
	Foo.call( this, name );
	this.label = label;
}

// here, we make a new `Bar.prototype`
// linked to `Foo.prototype`
Bar.prototype = Object.create( Foo.prototype );

// Beware! Now `Bar.prototype.constructor` is gone,
// and might need to be manually "fixed" if you're
// in the habit of relying on such properties!

Bar.prototype.myLabel = function() {
	return this.label;
};

var a = new Bar( "a", "obj a" );

a.myName(); // "a"
a.myLabel(); // "obj a"
```

**注意：** 要理解为什么`this`在上面的代码片段中指向a，请参阅第2章。

重要的部分是`Bar.prototype = Object.create( Foo.prototype )`。`Object.create(..)`凭空 *创建* 一个“新”对象，并将新对象的内部`[[Prototype]]`链接到你指定的对象（在本例中为`Foo.prototype`）。

换句话说，该行说：“产生一个*新的* 'Bar 点 prototype'对象，它链接到'Foo 点 prototype'”。

当`function Bar() { .. }`被声明时，`Bar`与任何其他函数一样，具有指向其默认对象的`.prototype`链接。但是 *这个* 对象并没有像我们想要的那样与`Foo.prototype`相关联。因此，我们创建了一个 *新的* 对象，它按照我们想要的方式被链接，有效地丢弃了原始的不正确链接的对象。

**注意：** 这里常见的误解/混淆是以下任何一种方法都可行，但它们不能像你期望的那样工作：

```js
// doesn't work like you want!
Bar.prototype = Foo.prototype;

// works kinda like you want, but with
// side-effects you probably don't want :(
Bar.prototype = new Foo();
```

`Bar.prototype = Foo.prototype`不会为要链接的`Bar.prototype`创建新对象。它只是使`Bar.prototype`成为`Foo.prototype`的另一个引用，它有效地将`Bar`直接链接到与`Foo`链接到的 **同一对象** : `Foo.prototype`。这意味着当你开始赋值时，比如`Bar.prototype.myLabel = ...`，你修改的 **不是一个单独的对象** ，而 *是* 共享的`Foo.prototype`对象本身，它会影响链接到`Foo.prototype`的任何对象。这几乎肯定不是你想要的。如果它 *是* 你想要的，那么你可能根本不需要`Bar`，并且应该只使用`Foo`并使你的代码更简单。

`Bar.prototype = new Foo()` **确实** 创建了一个新对象，它与我们想要的`Foo.prototype`正确链接。但是，它使用`Foo(..)`“构造函数调用”来完成它。如果该函数有任何副作用（例如记录，更改状态，注册其他对象，**向`this`添加数据属性** 等），这些副作用发生在这个链接的时候(而且很可能针对错误的对象)，而不是只在最终的`Bar()`“后代”被创造出来。

因此，我们只剩下的选择是使用`object .create(..)`来创建一个正确链接的新对象，但是没有调用`Foo(..)`的副作用。有个小缺点是，我们必须创建一个新对象，丢弃旧的对象，而不是修改提供给我们的现有默认对象。

如果有一种标准可靠的方法来修改现有对象的链接，那就 *太好* 了。在ES6之前，有一种非标准的，而不是完全跨浏览器的方式，通过`.__ proto__`属性，可以设置。 ES6添加了一个`Object.setPrototypeOf(..)`辅助工具，它以标准和可预测的方式完成这一工作。

让我们来比较用于将`Bar.prototype`链接到`Foo.prototype`的前ES6和ES6标准化技术：

```js
// pre-ES6
// throws away default existing `Bar.prototype`
Bar.prototype = Object.create( Foo.prototype );

// ES6+
// modifies existing `Bar.prototype`
Object.setPrototypeOf( Bar.prototype, Foo.prototype 
```

忽略`object .create(..)`方法的性能缺点(丢弃稍后被垃圾收集的对象)，它比ES6+方法短一些，而且可能比ES6+方法更容易阅读。但无论如何，这都可能是语法上的洗牌。

### Inspecting "Class" Relationships

如果您有一个像`a`这样的对象，并且想要找出它委托给哪个对象(如果有的话)，该怎么办? 在传统的面向类的环境中，检查一个实例(只是JS中的一个对象)的继承祖先(JS中的委托链)通常称为 *内省(introspection)* (或 *反射(reflection)* )。

考虑下面代码：

```js
function Foo() {
	// ...
}

Foo.prototype.blah = ...;

var a = new Foo();
```

然后我们如何内省`a`来找出它的“祖先”(委托链)?第一种方法包含了“类”的迷惑:

```js
a instanceof Foo; // true
```

`instanceof`运算符将普通对象作为其左侧操作数，将 **函数** 作为其右侧操作数。`instanceof`问题的答案是：**在`a`的整个`[[Prototype]]`链中，`Foo.prototype`任意指向的对象有没有出现?**

不幸的是，这意味着你只能查询某些对象(`a`)的“祖先”，前提是你有一些要测试的函数(`Foo`，及其附加的`.prototype`引用)。如果你有两个任意对象，比如`a`和`b`，并且想要找出这些对象是否通过一个`[[Prototype]]`链相互关联，那么仅使用`instanceof`是没什么用处的。

**注意：** 如果使用内置的`.bind(..)`实用程序来创建硬绑定函数（请参阅第2章），则创建的函数将不具有`.prototype`属性。将`instanceof`与这样的函数一起使用，可以透明地替换创建硬绑定函数的目标函数的`.prototype`。

将硬绑定函数用作“构造函数调用”是相当不常见的，但是如果这样做，它的行为将与调用原始 *目标函数* 一样，这意味着使用带有硬绑定函数的`instanceof`也会根据原始函数进行操作。

这段代码演示了使用“类”语义和`instanceof`来推断 **两个对象** 之间关系的荒谬之处:

```js
// helper utility to see if `o1` is
// related to (delegates to) `o2`
function isRelatedTo(o1, o2) {
	function F(){}
	F.prototype = o2;
	return o1 instanceof F;
}

var a = {};
var b = Object.create( a );

isRelatedTo( b, a ); // true
```

在`isRelatedTo(..)`内部，我们借用一个函数`F`，将它的`.prototype`重新赋值，使它任意指向某个对象`o2`，然后询问`o1`是否是`F`的“实例”。很明显，`o1`并不是从F继承，甚至也不是由`F`构造而来，所以很明显为什么这种练习是愚蠢和令人困惑的。**这个问题归结为强加于JavaScript的类语义的尴尬，**  在本例中通过`instanceof`的间接语义揭示了这一点。

第二种更清晰的方法是`[[Prototype]]`反射：

```js
Foo.prototype.isPrototypeOf( a ); // true
```

注意，在本例中，我们并不真正关心(甚至不*需要*)`Foo`，我们只需要一个 **对象** (在本例中，任意标记为`Foo.prototype`)来测试另一个 **对象** 。`isPrototypeOf(..)`回答的问题是：**在`a`整个`[[Prototype]]`链中，`Foo.prototype`有没有出现？** 

同样的问题，完全相同的答案。是在第二种方法中，我们实际上不需要间接引用一个 **函数** (`Foo`)，该函数的`.prototype`属性将被自动引用。

我们 *只需要* 两个对象来检查它们之间的关系。例如：

```js
// Simply: does `b` appear anywhere in
// `c`s [[Prototype]] chain?
b.isPrototypeOf( c );
```

注意，这种方法根本不需要函数（“类”）。它只是将对象引用直接用于`b`和`c`，并询问它们之间的关系。换句话说，上面的`isRelatedTo(..)`实用程序内置于该语言中，它被称为`isPrototypeOf(..)`。

我们也可以直接检索对象的`[[Prototype]]`。从ES5开始，执行此操作的标准方法是：

```js
Object.getPrototypeOf( a );
```

你会注意到对象引用是我们所期望的：

```js
Object.getPrototypeOf( a ) === Foo.prototype; // true
```

大多数浏览器（不是全部！）也长期支持访问内部`[[Prototype]]`的非标准替代方式：

```js
a.__proto__ === Foo.prototype; // true
```

奇怪的`. _proto__`(直到ES6才标准化!)属性“神奇地”检索对象的内部`[[Prototype]]`作为引用，如果你想直接检查(甚至遍历:`. _proto_ . _proto__..`)链，这是非常有用的。

正如我们之前在`.constructor`中看到的那样，`.__ proto__`实际上并不存在于你正在检查的对象上（在我们的运行示例中是`a`）。事实上，它存在（不可枚举;参见第2章）内置的`Object.prototype`上，以及其他常见的实用程序（`.toString()`,`. isPrototypeOf(..)`等）。

而且，`.__ proto__`看起来像一个属性，但实际上把它想象成一个getter / setter更合适（见第3章）。

粗略地说，我们可以设想.__ proto__实现（参见第3章对象属性定义），如下所示：

```js
Object.defineProperty( Object.prototype, "__proto__", {
	get: function() {
		return Object.getPrototypeOf( this );
	},
	set: function(o) {
		// setPrototypeOf(..) as of ES6
		Object.setPrototypeOf( this, o );
		return o;
	}
} );
```

因此，当我们访问（检索）`a.__ proto__` 的值时，就像调用`a.__ proto __()`（调用getter函数）。即使getter函数存在于`Object.prototype`对象上(关于这个绑定规则，请参阅第2章)，该函数调用也将`a`作为它的`this`。所以它就像`Object.getPrototypeOf( a )`一样。

`.__ proto__`也是一个可设置的属性，就像使用前面提到的ES6的`Object.setPrototypeOf(..)`一样。但是，通常 **不应更改现有对象的[[Prototype]]** 。

在一些框架中使用了一些非常复杂、高级的技术，这些技术允许像“子类化”`Array`这样的技巧，但是在一般的编程实践中，这通常是不被允许的，因为这通常会导致代码更加难以理解/维护。

**注意：** 从ES6开始，`class`关键字将允许某些内容类似于`Array`的“子类化”。有关ES6中添加的`class`语法的讨论，请参阅附录A.

有一些小例外(如前所述)是将默认函数的`.prototype`对象的`[[Prototype]]`设置为引用其他对象(除了`Object.prototype`)。这样可以避免完全用新的链对象替换该默认对象。否则，**最好将对象[[Prototype]]链接视为只读特性** ，以便以后读取代码。

**注意：** 针对双下划线，特别是在像 `__proto__` 这样的属性中开头的部分，JavaScript 社区非官方地创造了一个术语：“dunder”。所以，那些 JavaScript 的“酷小子”们通常将 `__proto__` 读作“dunder proto”。

## Object Links

正如我们现在所看到的，`[[Prototype]]`机制是一个内部链接，它存在于一个引用其他对象的对象上。

当对第一个对象进行属性/方法引用，而不存在此类属性/方法时，(主要)会执行此链接。在这种情况下，`[[Prototype]]`链接告诉引擎到链接的对象上查找属性/方法。反过来，如果该对象无法满足查找，则会跟随其`[[Prototype]]`，依此类推。对象之间的这一系列链接形成了所谓的“原型链”。

### `Create()`ing Links

我们已经彻底揭穿了为什么JavaScript的`[[Prototype]]`机制 **不** 像*类*，我们已经看到它如何在对象之间创建链接。

`[[Prototype]]`机制有什么意义？为什么JS开发人员在他们的代码中花费如此多的精力(模拟类)来连接这些链接如此普遍?

还记得我们在本章前面说过`Object.create(..)`会成为拯救者吗？现在，我们已经准备好了。

```js
var foo = {
	something: function() {
		console.log( "Tell me something good..." );
	}
};

var bar = Object.create( foo );

bar.something(); // Tell me something good...
```

`Object.create(. .)`创建一个新的对象(`bar`)链接到指定的对象(`foo`),这给了我们`[[Prototype]]`机制的所有权力(委托)，但没有任何不必要的并发症的新函数作为类和构造函数调用,混淆`.prototype`, ` .constructor`引用,或任何额外的东西。

**注意：** `create(null)`创建一个对象，该对象有一个空(即`null`) `[[Prototype]]`链接，因此该对象不能在任何地方委托。由于这样的对象没有原型链，因此`instanceof`运算符（前面已解释过）无需检查，因此它将始终返回`false`。这些特殊的空-`[[Prototype]]`对象通常被称为“字典”，因为它们通常纯粹用于在属性中存储数据，主要是因为它们不可能受到`[[Prototype]]`链上的任何委托属性/函数的意外影响，因此纯粹是数据存储。

我们不 *需要* 类来在两个对象间创建有意义的关系。我们需要 **真正关心** 的问题只是对象为了委托而链接在一起，而 `Object.create(..)` 给我们这种链接并且没有关于类的糟糕设计。

#### `Object.create()` Polyfilled

在ES5中添加了`Object.create()`。你可能需要支持ES5之前的环境(如旧的IE)，所以让我们来看看一个简单的`Object.create(..)`的部分polyfill，它提供了我们甚至在那些旧的JS环境中也需要的功能:

```js
if (!Object.create) {
	Object.create = function(o) {
		function F(){}
		F.prototype = o;
		return new F();
	};
}

```

此polyfill通过使用一次性`F`函数并覆盖其`.prototype`属性来指向我们要链接的对象。然后我们使用`new F()`构造来创建一个将按照我们指定的方式链接的新对象。

`Object.create(..)`的这种用法是迄今为止最常用的用法，因为它是可以被填补。标准ES5内置的`Object.create(..)`提供了一组额外的功能，这些功能不适用于ES5之前的版本。因此，这种功能的使用要少得多。为了完整起见，让我们看看额外的功能:

```js
var anotherObject = {
	a: 2
};

var myObject = Object.create( anotherObject, {
	b: {
		enumerable: false,
		writable: true,
		configurable: false,
		value: 3
	},
	c: {
		enumerable: true,
		writable: false,
		configurable: false,
		value: 4
	}
} );

myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
myObject.hasOwnProperty( "c" ); // true

myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
```

`Object.create(..)`的第二个参数指定要添加到新创建对象的属性名，方法是声明每个新属性的属性描述符(参见第3章)。因为在 ES5 之前的环境中填补属性描述符是不可能的，所以 `Object.create(..)` 的这个附加功能无法填补。

因为 `Object.create(..)` 的绝大多数用途都是使用填补安全的功能子集，因此大多数开发人员都可以在ES5之前的环境中使用 **部分polyfill** 。

一些开发人员采取了更为严格的观点，即除非可以完全填充，否则不应对任何功能进行多层填充。因为 `Object.create(..)` 是可以部分填补的工具之一，所以这种较狭窄的观点会说，如果你需要在 ES5 之前的环境中使用 `Object.create(..)` 的任何功能，你应当使用自定义的工具，而不是填补，而且应当彻底远离使用 `Object.create` 这个名字。你可以定义自己的工具，比如：

```js
function createAndLinkObject(o) {
	function F(){}
	F.prototype = o;
	return new F();
}

var anotherObject = {
	a: 2
};

var myObject = createAndLinkObject( anotherObject );

myObject.a; // 2
```

我不同意这种严格意见。我完全支持如上所示的`Object.create(..)`的常见部分polyfill，并且甚至在pre-ES5中也在代码中使用它。我会留给你做出自己的决定。

### Links As Fallbacks?

可能很容易认为对象之间的这些链接主要为“丢失的”属性或方法提供了一种后备。虽然这可能是一个观察到的结果，但我不认为它代表了思考`[[Prototype]]`的正确方式。

考虑下面代码：

```js
var anotherObject = {
	cool: function() {
		console.log( "cool!" );
	}
};

var myObject = Object.create( anotherObject );

myObject.cool(); // "cool!"
```

该代码将通过`[[Prototype]]`工作，但是如果你这样编写它以便`anotherObject`充当后备，**以防** `myObject`无法处理某些开发人员可能尝试调用的某些属性/方法，可能性是你的软件会变得更“神奇”，更难以理解和维护。

这并不是说没有后备是一种合适的设计模式的情况，但它在JS中并不常见或惯用，所以，如果你发现自己这样做了，你可能想退后(使用后备的)一步，重新考虑一下这是否合适且合理的设计。

**注意:** 在ES6中，引入了一种称为`Proxy`的高级功能，它可以提供“未找到方法”类型的行为。`Proxy`超出了本书的范围，但将在后面的“你不了解JS”系列中详细介绍。

**不要错过这里一个重要但细致入微的观点。**

例如，在为开发人员设计要调用`myObject.cool()`并使其工作的软件时，即使`myObject`上没有`cool()`方法，也会在你的API设计中引入一些“魔法”，这可能会让将来维护软件的开发人员感到吃惊。

但是，你可以设计你的API不那么“神奇”，但仍然利用`[[Prototype]]`链接的强大功能。

```js
var anotherObject = {
	cool: function() {
		console.log( "cool!" );
	}
};

var myObject = Object.create( anotherObject );

myObject.doCool = function() {
	this.cool(); // internal delegation!
};

myObject.doCool(); // "cool!"
```

在这里，我们调用`myObject.doCool()`，这是一个实际存在于`myObject`上的方法，使我们的API设计更加明确（不那么“神奇”）。在内部，我们的实现遵循 **委托设计模式** （参见第6章），利用`[[Prototype]]`委托给`anotherObject.cool()`。

换句话说，如果它是一个内部实现细节而不是在你的API设计中明确公开，则委托将不那么令人惊讶/混淆。我们将在下一章详细阐述 **委托**。

## Review (TL;DR)

当尝试对不具有该属性的对象进行属性访问时，对象内部的 `[[Prototype]]` 链接定义了 `[[Get]]` 操作（见第三章）下一步应当到哪里寻找它。这种对象到对象的串行链接定义了对象的“原型链”（有点类似于嵌套作用域链），在解析属性时发挥作用。

所有普通的对象用内建的 `Object.prototype` 作为原形链的顶端（就像作用域查询的顶端是全局作用域），如果属性没能在链条的前面任何地方找到，属性解析就会在这里停止。`toString()`，`valueOf()`，和其他几种共同工具都存在于这个 `Object.prototype` 对象上，这解释了语言中所有的对象是如何能够访问他们的。

使两个对象相互链接在一起的最常见的方法是将 `new` 关键字与函数调用一起使用，在它的四个步骤中（见第二章），就会建立一个新对象链接到另一个对象。

那个用 `new` 调用的函数有一个被随便地命名为 `.prototype` 的属性，这个属性所引用的对象恰好就是这个新对象链接到的“另一个对象”。带有 `new` 的函数调用通常被称为“构造器”，尽管实际上它们并没有像传统的面向类语言那样初始化一个类。

虽然这些 JavaScript 机制看起来和传统面向类语言的“初始化类”和“类继承”类似，而在 JavaScript 中的关键区别是，没有拷贝发生。取而代之的是对象最终通过 `[[Prototype]]` 链链接在一起。

由于各种原因，不光是前面提到的术语，“继承”（和“原型继承”）与所有其他的 OO 用语，在考虑 JavaScript 实际如何工作时都没有道理。

相反，“委托”是一个更确切的术语，因为这些关系不是 *拷贝* 而是委托 **链接**。