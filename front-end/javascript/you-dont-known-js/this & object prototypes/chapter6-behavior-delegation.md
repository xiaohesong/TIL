# You Don't Know JS: *this* & Object Prototypes

# Chapter 6: Behavior Delegation

在第5章中，我们详细讨论了[[Prototype]]机制，以及为什么将它描述为“类”或“继承”是令人困惑和不合适的(尽管在近20年的时间里进行了无数次尝试)。我们不仅研究了相当冗长的语法（`.prototype`乱丢代码），还讨论了各种陷阱（比如令人惊讶的`.constructor`解析或丑陋的伪多态语法）。我们探索了“mixin”方法的变体，许多人用这种方法试图平滑这些粗糙的区域。

这一点上，这是一个常见的反应，想知道为什么要做一些看起来那么简单的事情却如此复杂。现在我们已经揭开了序幕，并且看到了它变得多么脏，所以大多数JS开发人员从来没有深入研究过这个问题，而是将这些混乱的东西归为一个"类(class)"库来处理，这并不奇怪。

我希望到目前为止，你还不仅仅满足于忽略这些细节，并将这些细节留给“黑盒子”库。现在，让我们深入研究我们如何*能够并且应该*在JS中考虑对象`[[Prototype]]`机制，以一种比混淆的类 **更简单、更直接的方式** 。

作为对第5章中我们的结论的简要回顾，`[[Prototype]]`机制是一个内部链接，它存在于一个引用另一个对象的对象上。

当属性/方法引用针对第一个对象，并且该对象不存在此类属性/方法时，将使用此链接。在这种情况下，`[[Prototype]]`链接告诉引擎在链接到的对象上查找属性/方法。反过来，如果该对象不能完成查找，则会跟随其`[[Prototype]]`，依此类推。这一系列对象之间的链接形成了所谓的"原型链"。

换句话说，实际上的机制，就是JavaScript中重要的功能的本质，**都是关于对象与其他对象的链接** 。

对于理解本章其余部分的动机和方法，这一单一观察是至关重要的。

## 走向面向委托的设计

为了正确地将我们的思想集中在如何以最直接的方式使用`[[Prototype]]`，我们必须认识到它代表了与类完全不同的设计模式(参见第4章)。

**注意：** 面向类的设计的一些原则仍然非常有效，所以不要扔掉你知道的所有东西(只是大部分!)。例如，*封装* 非常强大，并且与委托兼容(尽管不常见)。

我们需要尝试将我们的思想从类/继承设计模式转变为行为委托设计模式。如果你的大部分或全部编程都是在类上进行的，这可能会让你感到不舒服或不自然。你可能需要多次尝试这种思维上的练习，才能掌握这种完全不同的思维方式。

我将首先介绍一些理论练习，然后我们将一起看一个更具体的例子，为你自己的代码提供实际的上下文。

### 类理论

假设我们有几个需要在软件中建模的类似任务("XYZ"、"ABC"等)。

使用类，设计场景的方法是:定义一个类似于Task的通用父类(基类)，为所有“类似”任务定义共享行为。然后，你定义子类`XYZ`和`ABC`，它们都从`Task`继承，并且每个子类都添加了专门的行为来处理它们各自的任务。

**重要的是** ，类设计模式将鼓励你从继承中获得最大的好处，你将希望使用方法覆盖(和多态性)，在这里你将覆盖`XYZ`任务中某些通用`Task`方法的定义，甚至可能使用`super`调用该方法的基本的版本，同时向其添加更多的行为。**你可能会发现相当多的地方** 可以“抽象”出父类的普遍行为，并将其专门化(覆盖)到子类中。

下面是一些针对该场景的松散的伪代码:

```js
class Task {
	id;

	// constructor `Task()`
	Task(ID) { id = ID; }
	outputTask() { output( id ); }
}

class XYZ inherits Task {
	label;

	// constructor `XYZ()`
	XYZ(ID,Label) { super( ID ); label = Label; }
	outputTask() { super(); output( label ); }
}

class ABC inherits Task {
	// ...
}
```

现在，您可以实例化`XYZ`子类的一个或多个 **副本** ( **copies**  )，并使用这些实例执行任务"XYZ"。这些实例具有通用`Task`定义的行为和特定`XYZ`定义的行为的副本。同样，`ABC`类的实例将具有`Task`行为和特定`ABC`行为的副本。构造之后，你通常只与这些实例(而不是类)进行交互，因为每个实例都具有执行预期任务所需的所有行为的副本。

### 委托理论

但是现在让我们尝试考虑相同的问题，但是使用行为委托而不是类。

你将首先定义一个名为`Task`的 **对象** (不是类，也不是大多数JS会让你相信的`function`)，它将具有具体的行为，其中包括各种任务可以使用的实用方法(理解为: *delegate to* !(委托给))。然后，对于每个任务("XYZ"，"ABC")，你定义一个 **对象** 来保存特定于任务的数据/行为。你将特定于任务的对象 **链接** 到`Task`实用程序对象，允许它们在需要时委派给它。

基本上，你认为执行任务"XYZ"需要来自两个同级对象(`XYZ`和`Task`)的行为来完成。但是，不需要通过类副本将它们组合在一起，我们可以将它们保存在单独的对象中，并且我们可以允许`XYZ`对象在需要时 **委托给** `Task`。

这里有一些简单的代码来建议你如何实现这一点：

```js
var Task = {
	setID: function(ID) { this.id = ID; },
	outputID: function() { console.log( this.id ); }
};

// make `XYZ` delegate to `Task`
var XYZ = Object.create( Task );

XYZ.prepareTask = function(ID,Label) {
	this.setID( ID );
	this.label = Label;
};

XYZ.outputTaskDetails = function() {
	this.outputID();
	console.log( this.label );
};

// ABC = Object.create( Task );
// ABC ... = ...
```

在这个代码中，`Task`和`XYZ`不是类(或函数)，它们 **只是对象** 。`XYZ`通过`Object.create(..)`设置`[[Prototype]]`委托给`Task`对象(参见第5章)。

与面向类(aka，OO - 面向对象)相比，我将这种代码称为 **"OLOO"** (对象链接到其他对象)。我们*真正*关心的是`XYZ`对象委托给`Task`对象(`ABC`对象也一样)。

在JavaScript中，`[[Prototype]]`机制将 **对象** 链接到其他 **对象** 。不管你多么努力地说服自己，都没有像“类”这样的抽象机制。这就像逆水行舟: 虽然你*可以*做到，但你*选择*逆流而上，所以很明显，**要到达你要去的地方会更困难** 。

**OLOO风格代码** 需要注意的其他一些差异：

1. 前一个类示例中的`id`和`label`数据成员都是直接在`XYZ`上的数据属性(两者都不在`Task`上)。通常，在涉及`[[Prototype]]`委托时，**你希望状态在委托者** (`XYZ`，`ABC`)上，而不是在委托(`Task`)上。

2. 使用类设计模式，我们故意在父(`Task`)和子(`XYZ`)上命名`outputTask`，以便我们可以利用覆盖(多态)。在委托行为中，我们做了相反的事情：**我们尽量避免命名相同的东西** ，因为在`[[Prototype]]`链的不同级别上命名相同的东西(称为shadowing——请参阅第5章)，这样会导致这些名称冲突并且会创建尴尬/脆弱的语法来消除引用的歧义(请参阅第4章)，如果可以的话，我们希望避免这种情况。

   这种设计模式较少调用容易覆盖的通用方法名，而是更多地调用描述性方法名，*特定*到每个对象正在执行的行为类型。**这实际上可以创建更容易理解/维护的代码** ，因为方法的名称(不仅在定义位置，而且散布在其他代码中)更加明显(自释意)。

3. `XYZ`对象上内部的`this.setID(ID);`方法首先在`XYZ`上查找`setID(ID)`，但由于它没有在`XYZ`上找到该名称的方法，`[[Prototype]]` *委托* 意味着它可以跟随着链接到`Task`来查找，当然找到了`setID(..)`。此外，由于隐式调用端`this`绑定规则(参见第2章)，当`setID(..)`运行时，即使在Task上找到该方法，该函数调用的`this`绑定也是`XYZ`，正如我们所期望的那样。在稍后的代码清单中，我们将看到`this.outputID()`也是相同的东西。

   换句话说，我们在与`XYZ`交互时可以使用`Task`上存在的通用实用方法，因为`XYZ`可以委托给`Task`。

**行为委托** 意味着：如果在对象(`XYZ`)没有找到属性或方法，让一些对象(`YXZ`)为属性或方法提供一个委托(到`Task`)。

这是一个*非常强大*的设计模式，与父类和子类，继承，多态等概念截然不同。不要你的思维中纵向地，从上面父类到下面子类地组织对象，而是将对象作为对等且并列考虑，并根据需要在对象之间建立任意方向的链接。

**注意：** 委派更适合用作内部实现细节，而不是直接在API设计中公开。在上面的例子中，我们不是一定要让我们的API设计让开发人员调用`XYZ.setID()`(当然我们也可以那么做！)。我们将委托隐藏为我们API的内部细节，其中`XYZ.prepareTask(..)`委托给`Task.setID(..)`。有关更多细节，请参阅第5章中的“链接作为后备?”的讨论。

#### 相互授权(不允许)

你不能创建两个或多个对象相互委托(双向)的*循环*。如果将`B`链接到`A`，然后尝试将`A`链接到`B`，则会出现错误。

对于循环引用是不允许的这一行为，这是一种耻辱(不是非常令人惊讶，但有点恼人)。如果你引用了一个在任何地方都不存在的属性/方法，那么你将在`[[Prototype]]`循环上得到一个无限递归。但如果所有引用都严格存在，那么`B`就可以委托给`A`，反之亦然，它就可以工作。这意味着你可以使用其中一个对象来委托给另一个对象，用于各种任务。在一些特定的用例中，这可能是有用的。

但这是不允许的，因为引擎实现者发现，在设置时检查(并拒绝!)无限循环引用比每次在对象上查找属性时都需要检查该保护的性能更好。

#### Debugged

我们将简要介绍一个可能让开发人员感到困惑的细节。通常，JS规范并不控制浏览器开发工具应该如何向开发人员表示特定的值/结构，因此每个浏览器/引擎都可以自由地解释它们认为合适的内容。因此，浏览器/工具*并不总是一致的* 。具体来说，我们现在要研究的行为目前只能在Chrome的开发工具中观察到。

考虑这种传统的“类构造函数”风格JS代码，因为它将出现在Chrome Developer Tools的控制台中：

```js
function Foo() {}

var a1 = new Foo();

a1; // Foo {}
```

让我们看一下该片段的最后一行：评估`a1`表达式的输出，它打印出`Foo {}`。如果你在Firefox中尝试相同的代码，你可能会看到`Object {}`。为什么不同？这些输出意味着什么？

Chrome实质上是假设"{}是一个空对象，他由一个名为'Foo'的函数来构造"。Firefox假设“{}是一个来自Object构造的普通空对象”。细微的区别在于，Chrome作为一个内部属性，正在积极地跟踪完成构建的实际函数的名称，而其他浏览器并不跟踪这些额外的信息。

尝试用JavaScript机制来解释这一点是很有诱惑力的:

```js
function Foo() {}

var a1 = new Foo();

a1.constructor; // Foo(){}
a1.constructor.name; // "Foo"
```

那么，Chrome是如何来输出"Foo"的，难道通过简单地检查对象的`.constructor.name`？令人困惑的答案是，他既是也不是。

考虑以下代码：

```js
function Foo() {}

var a1 = new Foo();

Foo.prototype.constructor = function Gotcha(){};

a1.constructor; // Gotcha(){}
a1.constructor.name; // "Gotcha"

a1; // Foo {}
```

即使我们将`a1.constructor.name`合法地改为其他名称("Gotcha")，Chrome的控制台仍然使用"Foo"名称。

因此，前一个问题(它使用`.constructor.name`吗?)的答案似乎是 **否定** 的，它必须在内部的其他地方跟踪它。

但是，且慢！让我们看看这种行为如何与OLOO风格的代码一起使用：

```js
var Foo = {};

var a1 = Object.create( Foo );

a1; // Object {}

Object.defineProperty( Foo, "constructor", {
	enumerable: false,
	value: function Gotcha(){}
});

a1; // Gotcha {}
```

啊哈! **Gotcha**! 在这里，Chrome的控制台 **确实** 找到并使用`.constructor.name`。事实上，在写这本书的时候，这种行为被认为是Chrome的一个bug，当你读到这篇文章的时候，它可能已经被修复了。所以你可能已经看到了纠正(正确)的`a1; // Object {}`。

除了这个bug之外，Chrome所做的“构造函数名”的内部跟踪(显然只用于调试输出目的)(如前面的代码片段所示)是一种有意的只针对Chrome的行为扩展，超出了JS规范的要求。

如果你不使用“构造函数(constructor)”来创建对象，就像我们在本章的 OLOO 风格代码中不鼓励的那样，那么你将会得到一个 Chrome 不会为其追踪内部“构造器名称”的对象，所以这样的对象将正确地仅仅被输出“Object {}”，意味着“从 Object() 构建生成的对象”。

**不要认为** 这代表了OLOO风格编码的缺点。当你使用OLOO和行为委托作为你的设计模式进行编码时，*谁* “构造”(即，*哪个函数*使用`new`调用？)某个对象是一个无关的细节。Chrome特有的内部“构造函数名称”跟踪只有在完全采用“类风格”编码时才有用，但如果使用的是OLOO委托，就没有意义了。

### 心理模型比较

既然您已经看到了“类”和“委托”设计模式之间的区别，那么至少在理论上，让我们来看看这些设计模式对我们用来推理代码的心理模型的影响。

我们将研究一些更理论化的代码("Foo"、"Bar")，并比较实现代码的两种方式(OO和OLOO)。第一个代码段使用了经典(“prototype”)的OO风格:

```js
function Foo(who) {
	this.me = who;
}
Foo.prototype.identify = function() {
	return "I am " + this.me;
};

function Bar(who) {
	Foo.call( this, who );
}
Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};

var b1 = new Bar( "b1" );
var b2 = new Bar( "b2" );

b1.speak();
b2.speak();
```

父类`Foo`，由子类`Bar`继承，然后将其实例化两次，分别为`b1`和`b2`。我们有的是`b1`委托给`Bar.prototype`，后者委托给`Foo.prototype`。在这一点上，你们应该很熟悉了。没有什么突破性的进展。

现在，让我们使用OLOO风格代码实现 **完全相同的功能** ：

```js
var Foo = {
	init: function(who) {
		this.me = who;
	},
	identify: function() {
		return "I am " + this.me;
	}
};

var Bar = Object.create( Foo );

Bar.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};

var b1 = Object.create( Bar );
b1.init( "b1" );
var b2 = Object.create( Bar );
b2.init( "b2" );

b1.speak();
b2.speak();
```

我们采取完全相同的`[[Ptototype]]`委托上的优势，从`b1`到`Bar`再到`Foo`，就像我们前面的那个`b1`，`Bar.prototype`和`Foo.prototype`。**我们仍然有相同的3个对象连接在一起** 。

但是，重要的是，我们已经极大地简化了所有*其他正在进行的工作* ，因为现在我们只是建立了相互链接的 **对象** ，而不需要所有看起来像类(但行为却不像类)的东西，包括构造函数、原型和`new`调用，这些东西都是粗糙和混乱的。

问问你自己：如果我可以用OLOO风格代码获得与“类”风格代码相同的功能，但是OLOO更简单，需要考虑的事情更少，**难道OLOO不是更好吗** ?

让我们来研究一下这两个片段之间所涉及的心理模型。

首先，类风格的代码片段暗示了实体及其关系的心理模型:

![fig4.png](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20&%20object%20prototypes/fig4.png?raw=true)

实际上，这有点不公平/误导人，因为它显示了很多额外的细节，而这些细节在*技术上*并不需要一直知道(尽管你需要了解它!)。其中一个要点是，这是一系列相当复杂的关系。但另一个要点是：如果你花时间来关注这些关系箭头，那么JS的机制中 **存在着惊人的内部一致性** 。

例如，JS函数能够访问`call(..)`，`apply(..)`和`bind(..)`(参见第2章)是因为函数本身是对象，而函数对象也有`[[Prototype]]`链，它链接到`Function.prototype`对象，它定义了任何函数对象都可以委托给的那些默认方法。JS可以做这些事情，*你也可以* !

好的，现在让我们看一下这个图的一个*稍微*简化的版本，这个版本比较起来更“公平”一些——它只显示了相关的实体和关系。

![img](https://github.com/getify/You-Dont-Know-JS/raw/master/this%20%26%20object%20prototypes/fig5.png)

还是很复杂，嗯？虚线描述了在`Foo.prototype`和`Bar.prototype`之间设置“继承”并且尚未 *修复* 的 **缺少** 的`.constructor`属性引用时的隐含关系(请参阅第5章中的“构造函数终极版”)。即使删除了这些虚线，每次使用对象链接时，心智模型仍然非常麻烦。

现在，让我们看一下OLOO风格代码的心智模型：

![img](https://github.com/getify/You-Dont-Know-JS/raw/master/this%20%26%20object%20prototypes/fig6.png)

正如你可以看到的比较，很明显，OLOO风格的代码需要*担心的东西要少得多*，因为OLOO风格的代码包含这样一个 **事实** ，就是我们真正关心的是 **与其他对象链接的对象** 。

所有其他“类”的繁琐是一种令人困惑和复杂的方式来获得相同的最终结果。去掉这些东西，事情就会变得简单得多(不会失去任何功能)。

## 类 vs. 对象

我们刚刚看到了“类”与“行为委托”的各种理论探索和心理模型。但是，现在让我们看看更具体的代码场景，以展示如何实际使用这些思想。

我们将首先研究前端web开发中的一个典型场景:创建UI小部件(按钮、下拉列表等)。

### Widget "Classes"

因为你可能仍然非常习惯OO设计模式，所以你可能会立即从父类(可能称为`Widget`)的角度来考虑这个问题，其中包含所有常见的基本部件行为，然后是特定部件类型的子派生类(比如`Button`)。

**注意：** 我们将在这里使用jQuery进行DOM和CSS操作，只是因为它是我们当前讨论的目的并不是真正关心的细节。这些代码都不关心是哪个JS框架(jQuery、Dojo、YUI等)，如果有的话，你可以用它来解决这些常见的任务。

让我们来看看我们如何在没有任何“类”辅助库或语法的经典风格的纯JS中实现“类”设计：

```js
// Parent class
function Widget(width,height) {
	this.width = width || 50;
	this.height = height || 50;
	this.$elem = null;
}

Widget.prototype.render = function($where){
	if (this.$elem) {
		this.$elem.css( {
			width: this.width + "px",
			height: this.height + "px"
		} ).appendTo( $where );
	}
};

// Child class
function Button(width,height,label) {
	// "super" constructor call
	Widget.call( this, width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
}

// make `Button` "inherit" from `Widget`
Button.prototype = Object.create( Widget.prototype );

// override base "inherited" `render(..)`
Button.prototype.render = function($where) {
	// "super" call
	Widget.prototype.render.call( this, $where );
	this.$elem.click( this.onClick.bind( this ) );
};

Button.prototype.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

OO设计模式告诉我们在父类中声明一个基础`render(...)`，然后在我们的子类中重写它，但不要替换它本身，而是用特定于按钮的行为来扩充基本功能。

注意 *显式伪多态性*(参见第4章)的丑陋与`Widget.call`和`Widget.prototype.render.call`引用，用于伪造来自子“class”方法的“super”调用，返回到“父”类基础方法。丫丫个呸的。

#### ES6`class`语法糖

我们在附录A中详细介绍了ES6`class`语法糖，但让我们简要演示如何使用`class`实现相同的代码：

```js
class Widget {
	constructor(width,height) {
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	}
	render($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
}

class Button extends Widget {
	constructor(width,height,label) {
		super( width, height );
		this.label = label || "Default";
		this.$elem = $( "<button>" ).text( this.label );
	}
	render($where) {
		super.render( $where );
		this.$elem.click( this.onClick.bind( this ) );
	}
	onClick(evt) {
		console.log( "Button '" + this.label + "' clicked!" );
	}
}

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

毫无疑问，之前的经典方法的一些语法缺陷已经通过ES6的`class`得到了解决。特别是`super(..)`的存在看起来相当不错(虽然当你深入研究它时，并不完全是那么好！)。

虽然语法有所改进，但 **这些并不是真正的类** ，因为它们仍然在`[[Prototype]]`机制之上运行。他们遭受着我们在第四章、第五章以及本章迄今为止所探讨的所有相同的心理模型不匹配的折磨。附录A将详细阐述ES6`class`语法及其含义。我们将看到为什么解决语法问题并没有在本质上解决我们在JS中的类混淆，尽管它在伪装成一个解决方案方面做出了勇敢的努力!

无论使用经典的原型语法还是新的ES6语法糖，你仍然可以选择使用“类”对问题域(UI小部件)建模。正如前面几章试图说明的，JavaScript中的这种选择会让你陷入额外的麻烦和精神负担。

### 委派Widget对象

这是我们更简单的`Widget` / `Button`示例，使用 **OLOO风格委托** ：

```js
var Widget = {
	init: function(width,height){
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	},
	insert: function($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
};

var Button = Object.create( Widget );

Button.setup = function(width,height,label){
	// delegated call
	this.init( width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
};
Button.build = function($where) {
	// delegated call
	this.insert( $where );
	this.$elem.click( this.onClick.bind( this ) );
};
Button.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );

	var btn1 = Object.create( Button );
	btn1.setup( 125, 30, "Hello" );

	var btn2 = Object.create( Button );
	btn2.setup( 150, 40, "World" );

	btn1.build( $body );
	btn2.build( $body );
} );
```

使用这种OLOO风格的方法，我们不会将`Widget`视为父级，将`Button`视为子级。相反，`Widget` **只是一个对象** ，并且是任何特定类型的小部件可能想要委托的实用程序集合，而`Button` **也只是一个独立的对象** (当然，有一个委托链接到`Widget`！)。

从设计模式的角度来看，我们 **没有** 按照类所建议的方式在两个对象中共享相同的方法名称`render(..)`，而是选择了不同的名称(`insert(..)`和`build(..)`，它们更能描述每个对象具体执行的任务。出于相同的原因，*初始化* 方法分别被称为`init(..)`和`setup(..)`。

这种委托设计模式不仅建议使用不同的、更具描述性的名称(而不是共享的、更通用的名称)，而且使用OLOO这样做恰好避免了显式伪多态调用(`Widget.call` and `Widget.prototype.render.call`)的丑陋。你可以通过对`this.init(..)`和`this.insert(..)`的简单、相对的委托调用看到。

从语法上讲，我们也没有任何构造函数，`.prototype`或`new` 展现，因为它们实际上只是不必要的繁琐。

现在，如果你正在密切关注，你可能会注意到，以前只有一个调用(`var btn1 = new Button(..)`)现在变成了两个调用(`var btn1 = Object.create(Button)`和`btn1.setup(..)`)。最初，这似乎是一个缺点(更多的代码)。

然而，与经典的原型风格代码相比，即使这也是一个 **专业的OLOO风格代码的好处** 。如何?

使用类构造函数，你将“被迫”(不是真的，但强烈建议)同时执行构造和初始化。但是，在很多情况下，能够分别执行这两个步骤(就像使用OLOO一样！)更灵活。

例如，假设你在程序开始时在池中创建所有实例，但是要等到从池中取出并使用它们时，才使用特定的设置初始化它们。我们展示了这两个调用是紧挨着发生的，但当然它们可以根据需要在非常不同的时间和代码的不同部分发生。

**OLOO** 更好地支持关注点分离原则，其中创建和初始化不必合并到同一个操作中。

## 更简单的设计

除了提供表面上更简单(而且更灵活!)的代码之外，作为模式的行为委托实际上可以导致更简单的代码体系结构。让我们来看最后一个例子，它演示了OLOO如何简化你的总体设计。

我们将研究的场景是两个控制器对象，一个用于处理web页面的登录表单，另一个用于实际处理与服务器的身份验证(通信)。

我们需要一个实用程序帮助程序来与服务器进行Ajax通信。我们将使用jQuery(尽管任何框架都可以)，因为它不仅为我们处理Ajax，而且返回一个类似于promise的结果，这样我们就可以用`.then(..)`在调用代码中侦听响应。

**注意：** 我们不会在这里介绍Promises，但我们将在未来的“You Do the Know JS”系列中介绍它们。

遵循典型的类设计模式，我们将把任务分解为一个名为`Controller`的类中的基本功能，然后我们将派生两个子类，`LoginController`和`AuthController`，它们都从`Controller`继承并定制化一些基本行为。

```js
// Parent class
function Controller() {
	this.errors = [];
}
Controller.prototype.showDialog = function(title,msg) {
	// display title & message to user in dialog
};
Controller.prototype.success = function(msg) {
	this.showDialog( "Success", msg );
};
Controller.prototype.failure = function(err) {
	this.errors.push( err );
	this.showDialog( "Error", err );
};
```

```js
// Child class
function LoginController() {
	Controller.call( this );
}
// Link child class to parent
LoginController.prototype = Object.create( Controller.prototype );
LoginController.prototype.getUser = function() {
	return document.getElementById( "login_username" ).value;
};
LoginController.prototype.getPassword = function() {
	return document.getElementById( "login_password" ).value;
};
LoginController.prototype.validateEntry = function(user,pw) {
	user = user || this.getUser();
	pw = pw || this.getPassword();

	if (!(user && pw)) {
		return this.failure( "Please enter a username & password!" );
	}
	else if (pw.length < 5) {
		return this.failure( "Password must be 5+ characters!" );
	}

	// got here? validated!
	return true;
};
// Override to extend base `failure()`
LoginController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Login invalid: " + err );
};

```

```js
// Child class
function AuthController(login) {
	Controller.call( this );
	// in addition to inheritance, we also need composition
	this.login = login;
}
// Link child class to parent
AuthController.prototype = Object.create( Controller.prototype );
AuthController.prototype.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.prototype.checkAuth = function() {
	var user = this.login.getUser();
	var pw = this.login.getPassword();

	if (this.login.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.success.bind( this ) )
		.fail( this.failure.bind( this ) );
	}
};
// Override to extend base `success()`
AuthController.prototype.success = function() {
	// "super" call
	Controller.prototype.success.call( this, "Authenticated!" );
};
// Override to extend base `failure()`
AuthController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Auth Failed: " + err );
};
```

```js
var auth = new AuthController(
	// in addition to inheritance, we also need composition
	new LoginController()
);
auth.checkAuth();
```

们有所有控制器共享的基本行为，即`success(..)`, `failure(..)` 和 `showDialog(..)`。我们的子类`LoginController`和`AuthController`覆盖`failure(..)` 和 `success(..)`以增强默认的基类行为。还要注意，`AuthController`需要`LoginController`的一个实例来与登录表单交互，因此它成为成员数据属性。

另外要提到的是，我们选择了一些组合来撒在继承之上。`AuthController`需要了解`LoginController`，因此我们实例化它(`new LoginController()`）并保持一个名为`this.login`的类成员属性来引用它，以便`AuthController`可以调用`LoginController`上的行为。

**注意：** 让`AuthController`继承`LoginController` *可能* 会有一点诱惑，反之亦然，这样我们就可以通过继承链进行 *虚拟组合* 。但这是一个非常清楚的例子，说明作为问题域模型的类继承有什么问题，因为`AuthController`和`LoginController`都不是专门处理另一个的基本行为，所以它们之间的继承没有什么意义，除非类是惟一的设计模式。相反，我们在一些简单的*组合*中分层，现在它们可以协作，同时仍然受益于父基础控制器的继承。

如果你熟悉面向类(OO)设计，那么这一切都应该非常熟悉和自然。

### De-class-ified

但是，我们真的需要使用父`Controller`类，两个子类和 **一些组合** 来模拟这个问题吗？有没有办法利用OLOO风格的行为委托，并有一个*更*简单的设计？**有！**

```js
var LoginController = {
	errors: [],
	getUser: function() {
		return document.getElementById( "login_username" ).value;
	},
	getPassword: function() {
		return document.getElementById( "login_password" ).value;
	},
	validateEntry: function(user,pw) {
		user = user || this.getUser();
		pw = pw || this.getPassword();

		if (!(user && pw)) {
			return this.failure( "Please enter a username & password!" );
		}
		else if (pw.length < 5) {
			return this.failure( "Password must be 5+ characters!" );
		}

		// got here? validated!
		return true;
	},
	showDialog: function(title,msg) {
		// display success message to user in dialog
	},
	failure: function(err) {
		this.errors.push( err );
		this.showDialog( "Error", "Login invalid: " + err );
	}
};
```

```js
// Link `AuthController` to delegate to `LoginController`
var AuthController = Object.create( LoginController );

AuthController.errors = [];
AuthController.checkAuth = function() {
	var user = this.getUser();
	var pw = this.getPassword();

	if (this.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.accepted.bind( this ) )
		.fail( this.rejected.bind( this ) );
	}
};
AuthController.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.accepted = function() {
	this.showDialog( "Success", "Authenticated!" )
};
AuthController.rejected = function(err) {
	this.failure( "Auth Failed: " + err );
};
```

由于`AuthController`只是一个对象(`LoginController`也是如此)，我们不需要实例化(比如`new AuthController()`)来执行我们的任务。我们需要做的就是：

```js
AuthController.checkAuth();
```

当然，对于OLOO，如果你确实需要在委托链中创建一个或多个其他对象，那很容易，并且仍然不需要类实例化：

```js
var controller1 = Object.create( AuthController );
var controller2 = Object.create( AuthController );
```

使用行为委托，`AuthController`和`LoginController` **只是对象** ，彼此的水平排列，并且不以类为导向排列或关联为父对象和子对象。我们有点随意地选择让`AuthController`委托给`LoginController` - 对于委托来说，反向是有效的。

第二个代码清单的主要内容是我们只有两个实体(`LoginController`和`AuthController`)，而 **不是之前的三个** 实体。

我们不需要一个基本的`Controller`类来在两者之间“共享”行为，因为委托是一个足够强大的机制来为我们提供所需的功能。如前所述，我们还不需要实例化我们的类来使用它们，因为没有类，**只有对象本身** 。此外，不需要*组合*，因为委托赋予两个对象根据需要进行*差异*协作的能力。

最后，我们避免了面向类设计的多态性缺陷，方法是在两个对象上不使用相同的名称`success(..)`和`failure(..)`，这将需要丑陋的显式伪多态。相反，我们在`AuthController`上调用`accept()`和`reject(..)`——它们的特定任务的描述性稍微强一些。

**底线** ：我们最终拥有相同的功能，但设计(明显)更简单。这就是OLOO风格代码的强大功能和行为委托设计模式的力量。

## 更好的语法

使ES6的类看起来如此吸引人(参见附录A关于为什么要避免它)的一个更好的地方是声明类方法的简短语法:

```js
class Foo {
  methodName() { /* .. */ }
}
```

我们从声明中去掉了`function`这个词，这让JS开发人员欢呼雀跃!

你可能已经注意到上面建议的OLOO语法有很多`function`的表现，这似乎是对OLOO简化目标的一种贬低。**但事实并非如此!** 

从ES6开始，我们可以在任何对象字面量中使用*简洁的方法声明*，因此可以这样声明OLOO风格的对象(与`class`体语法相同的简写形式):

```js
var LoginController = {
	errors: [],
	getUser() { // Look ma, no `function`!
		// ...
	},
	getPassword() {
		// ...
	}
	// ...
};
```

关于唯一的区别是对象字面仍然需要在元素之间使用逗号(`,`)分隔符，而`class`语法则不需要。在整个计划中相当小的让步。

此外,ES6,推行语法使用(如AuthController定义),你单独分配属性,而不是使用一个对象字面量,可以使用一个字面对象(这样你可以使用简洁的方法),你可以使用`Object.setPrototypeOf(. .)`修改该对象的`[[Prototype]]`,像这样:

```js
// use nicer object literal syntax w/ concise methods!
var AuthController = {
	errors: [],
	checkAuth() {
		// ...
	},
	server(url,data) {
		// ...
	}
	// ...
};

// NOW, link `AuthController` to delegate to `LoginController`
Object.setPrototypeOf( AuthController, LoginController );
```

从ES6开始的OLOO风格，采用简洁的方法，比以前 **更加友好** (即便如此，它比传统的原型风格代码更简单，更好)。**你不需要选择类** (复杂性) 来获得良好干净的对象语法!

### Unlexical

简洁方法有一个缺点，这个缺点很微妙，但需要注意。考虑这段代码:

```js
var Foo = {
	bar() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

下面是去掉语法糖，表达代码将如何操作:

```js
var Foo = {
	bar: function() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

看到不同了吗？`bar()`变成了一个附加到`bar`属性的匿名函数表达式(`function()..`)，因为函数对象本身没有名称标识符。将其与手动指定的*命名函数表达式*(`function baz()..`)进行比较，后者除了附加到`.baz`属性之外，还具有词法名称标识符`baz`。

所以呢？在“你不知道JS”系列丛书的“作用域和闭包”标题中，我们详细介绍了*匿名函数表达式*的三个主要缺点。我们将简单地重复它们，以便与简练的方法进行比较。

匿名函数上缺少`name`标识符：

1. 使调试堆栈跟踪变得更难
2. 使自引用(递归、事件(un)绑定等)更加困难
3. 使代码(有点)更难理解

第1项和第3项不适用于简明方法。

尽管去糖化使用*匿名函数表达式*，而该表达式通常在堆栈跟踪中没有`name`，但是指定了简洁的方法来相应地设置函数对象的内部`name`属性，因此堆栈跟踪应该能够使用它(尽管这依赖于实现，因此不能保证)。

遗憾的是，第2项 **仍然是简洁方法的一个缺点** 。它们将没有词汇标识符用作自引用。考虑:

```js
var Foo = {
	bar: function(x) {
		if (x < 10) {
			return Foo.bar( x * 2 );
		}
		return x;
	},
	baz: function baz(x) {
		if (x < 10) {
			return baz( x * 2 );
		}
		return x;
	}
};
```

在本例中，上面的手动`Foo.bar(x*2)`引用就足够了，但是在很多情况下，函数不一定能够做到这一点，比如函数在不同对象之间的委托中共享，使用`this`绑定，等等。你可能希望使用真正的自引用，而函数对象的`name`标识符是实现此目的的最佳方法。

对于简洁的方法，请注意这一点，如果您遇到缺乏自引用的问题，请确保放弃简洁的方法语法，而使用手动命名的函数表达式声明形式: `baz: function baz(){..}`。

## Introspection

如果你花了很多时间在面向类的编程(用JS或其他语言)，你可能熟悉类型内省(*type introspection*)：检查实例以找出它是什么*类型*的对象。类实例类型自检的主要目标是根据对象的创建方式推断对象的结构/功能。

考虑使用`instanceof`(参见第5章)对代码`a1`进行内省以推断其能力的代码：

```js
function Foo() {
	// ...
}
Foo.prototype.something = function(){
	// ...
}

var a1 = new Foo();

// later

if (a1 instanceof Foo) {
	a1.something();
}
```

因为`Foo.prototype`(不是`Foo`！)在`a1`的`[[Prototype]]`链中(见第5章)，所以`instanceof`运算符(令人困惑)假装告诉我们`a1`是`Foo`“类”的一个实例。有了这些知识，我们假设`a1`具有`Foo` “class”所描述的功能。

当然，没有`Foo`类，只有一个普通的老式函数`Foo`，它恰好引用了一个任意对象(`Foo.prototype`)，而`a1`恰好是委托链接到这个对象的。根据它的语法，`instanceof`假装在检查`a1`和`Foo`之间的关系，但实际上它告诉我们`a1`和(引用的任意对象)`Foo.prototype`是否有关。

`instanceo`f语法的语义混乱(和间接)意味着，要使用基于`instanceof`的内省来询问对象`a1`是否与所讨论的功能对象相关，必须有一个函数来保存对该对象的引用——不能直接问问两个对象是否相关。

回想一下本章前面抽象的`Foo`/`Bar`/`b1`例子，我们将在这里缩写为:

```js
function Foo() { /* .. */ }
Foo.prototype...

function Bar() { /* .. */ }
Bar.prototype = Object.create( Foo.prototype );

var b1 = new Bar( "b1" );
```

为了使用`instanceof`和`.prototype`语义对该示例中的实体进行*类型自省*，你可能需要执行以下各种检查:

```js
// relating `Foo` and `Bar` to each other
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf( Bar.prototype ) === Foo.prototype; // true
Foo.prototype.isPrototypeOf( Bar.prototype ); // true

// relating `b1` to both `Foo` and `Bar`
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf( b1 ) === Bar.prototype; // true
Foo.prototype.isPrototypeOf( b1 ); // true
Bar.prototype.isPrototypeOf( b1 ); // true
```

讲真的，其中一些有点糟糕。例如，直观地(使用类)，你可能希望能够使用`Bar instanceof Foo`之类的语句(因为很容易混淆“instance”的含义，即认为它包含“继承”)，但在JS中，这不是一个明智的比较。你必须改为使用`Bar.prototype instanceof Foo`。

另一种常见但可能不那么健壮的*类型内省* 模式称为“duck typing(鸭子类型)”，许多开发人员似乎更喜欢这种模式，而不是`instanceof`。这个词来自一句谚语，“如果它看起来像一只鸭子，它嘎嘎叫起来像一只鸭子，那它一定是一只鸭子。”

例如：

```js
if (a1.something) {
	a1.something();
}
```

我们没有检查`a1`和持有委托的`something()`函数的对象之间的关系，而是假设对`a1.something()`进行测试，这意味着`a1`有能力调用`.something()`(不管它是直接在`a1`上找到方法，还是委托给其他对象)。就其本身而言，这种假设并不那么危险。

但是，“duck typing(鸭子类型)”通常被扩展为除了要测试的内容之外，还要对 **对象的功能做出其他假设** ，这当然会给测试带来更多的风险(即脆弱的设计)。

“duck typing”的一个显著例子来自ES6的Promise(正如前面的注释所解释的，本书没有涉及到这一点)。

出于各种原因，需要确定任意对象引用是否是一个 *Promise*，但是测试的方法是检查对象上是否碰巧有`then()`函数。换句话说，**如果任何对象** 碰巧有`then()`方法，ES6承诺将无条件地假定该对象 **是"thenable"** ，因此将期望它的行为符合Promise所有的标准行为。

如果你有任何非Promise对象，无论出于什么原因在其上存在使用`then()`方法，那么强烈建议你将其远离ES6 Promise机制，以避免破坏假设。

这个例子清楚地说明了“duck typing”的危险。你应该在受控的条件下谨慎地使用这些方法。

再次将我们的注意力转回到本章中提到的OLOO风格的代码，类型内省变得更加清晰。让我们回想一下(并缩写)本章前面的`Foo` / `Bar` / `b1` OLOO示例：

```js
var Foo = { /* .. */ };

var Bar = Object.create( Foo );
Bar...

var b1 = Object.create( Bar );
```

使用这种OLOO方法，我们所有的对象都是通过`[[Prototype]]`委托关联的普通对象，下面是我们可能使用的非常简单的类型自省:

```js
// relating `Foo` and `Bar` to each other
Foo.isPrototypeOf( Bar ); // true
Object.getPrototypeOf( Bar ) === Foo; // true

// relating `b1` to both `Foo` and `Bar`
Foo.isPrototypeOf( b1 ); // true
Bar.isPrototypeOf( b1 ); // true
Object.getPrototypeOf( b1 ) === Bar; // true
```

我们不再使用`instanceof`了，因为它混淆地假装与类有关。现在，我们只是(非正式地)问一个问题，“你是我的原型吗?” 对于像`Foo.prototype`或痛苦冗长的`Foo.prototype.isPrototypeOf(..)`这样的东西，不再需要那么间接了。

我认为公平地说，这些检查比以前的内省检查要简单得多。**我们再次看到，与JavaScript中的类风格编码相比，OLOO更简单(但具有相同的功能)。** 

## Review (TL;DR)

类和继承是一种设计模式，你可以在软件体系结构中选择，也可以不选择。大多数开发人员想当然地认为类是组织代码的唯一(正确的)方法，但是我们在这里看到了另一种不太常见的模式，它实际上非常强大: **行为委托** 。

行为委托将对象建议为彼此的对等对象，它们在彼此之间委托，而不是父类和子类关系。JavaScript的`[[Prototype]]`机制，其设计本质上是一种行为委托机制。这意味着我们要么选择在JS之上艰难地实现类机制(参见第4章和第5章)，要么就接受`[[Prototype]]`的自然状态作为委托机制。

当仅使用对象设计代码时，它不仅简化了使用的语法，而且实际上可以实现更简单的代码体系结构设计。

**OLOO** (对象链接到其他对象)是一种代码风格，它直接创建和关联对象而无需抽象类。OLOO很自然地实现了基于`[[Prototype]]`的行为委托。