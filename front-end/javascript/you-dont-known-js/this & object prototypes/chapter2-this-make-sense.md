# You Don't Know JS: *this* & Object Prototypes

# Chapter 2: `this` All Makes Sense Now!

在第1章中，我们摒弃了对`this`的各种误解，而是了解到`this`是一个针对每个函数调用的绑定，完全基于其 **调用端** (函数被如何调用)。

## Call-site

要理解`this`绑定，我们必须了解调用端：代码中调用函数的位置( **不是声明它的位置** )。我们必须检查调用端以回答问题：这个`this`指向什么？

查找调用端通常是：“去找一个函数从哪里调用”，但它并不总是那么容易，因为某些编码模式可能会掩盖 *真正* 的调用端。

重要的是考虑 **调用堆栈** (已调用的函数堆栈，用于将我们带到执行中的当前时刻)。我们关心的调用端在当前执行函数之前的调用中。

让我们演示一下调用堆栈和调用端：

```js
function baz() {
    // call-stack is: `baz`
    // so, our call-site is in the global scope

    console.log( "baz" );
    bar(); // <-- call-site for `bar`
}

function bar() {
    // call-stack is: `baz` -> `bar`
    // so, our call-site is in `baz`

    console.log( "bar" );
    foo(); // <-- call-site for `foo`
}

function foo() {
    // call-stack is: `baz` -> `bar` -> `foo`
    // so, our call-site is in `bar`

    console.log( "foo" );
}

baz(); // <-- call-site for `baz`
```

在分析代码时要小心，以找到实际的调用站点(来自调用堆栈)，因为它是唯一对`this`绑定有用的东西。

**注意：** 通过按顺序查看函数调用链，你可以在脑海中可视化调用堆栈，就像我们对上面代码段中的注释所做的那样。但这是艰苦的，容易出错的。查看调用堆栈的另一种方法是在浏览器中使用调试器工具。大多数现代桌面浏览器都有内置的开发人员工具，其中包括一个JS调试器。上面的代码片段中，你可以在工具中为`foo()`函数的第一行设置断点，或者为第一行的语句插入`debugger;`。当你运行该页面时，调试器将在此位置暂停，并将显示已调用的函数列表，这些函数将成为你的调用堆栈。因此，如果你正在尝试诊断`this`绑定，请使用开发人员工具获取调用堆栈，然后从顶部找到第二个项目，这将显示真实的调用端。

## Nothing But Rules

现在我们将注意力转到调用端如何确定在函数执行过程中`this`将指向何处。

你必须检查调用端并确定适用4个规则中的哪一个。我们将首先独立解释这四个规则中的每一个，如果多个规则可以应用于调用端，然后我们将说明它们的优先顺序。

### Default Binding

我们将研究的第一条规则来自函数调用的最常见情况：独立函数调用。当其他规则都不适用时，将此规则视为默认的“包罗万象”(笔：捕获所有)规则。

考虑以下代码：	

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo(); // 2
```

首先要注意的是，如果你还没有意识到，那么在全局范围内声明的变量，如`var a = 2`，是同名的全局对象属性的同义词。它们不是彼此的副本，它们是彼此的。把它想象成同一枚硬币的两面。

其次，我们看到当调用`foo()`时，`this.a`解析为我们的全局变量`a`。为什么？因为在这种情况下，`this`的 *默认绑定* 用于函数调用，因此将`this`指向全局对象。

我们如何知道默认绑定规则适用于此处？我们检查调用端以查看如何调用`foo()`。在我们的代码片段中，`foo()`使用普通的，未修饰的函数引用进行调用。我们将演示的其他规则都不适用于此处，因此默认绑定适用。

如果`strict mode`有效，则全局对象不符合 *默认绑定* 的条件，因此将`this`设置为`undefined`。

```js
function foo() {
	"use strict";

	console.log( this.a );
}

var a = 2;

foo(); // TypeError: `this` is `undefined`
```

一个微妙但重要的细节是：尽管`this`绑定规则总体上完全基于调用端，但是全局对象只有在`foo()`的 **内容 ** 运行的时候**不在**  `strict mode` 下 **才** 有资格使用 *默认绑定* ; `foo()`的调用端的严格模式状态是无关紧要的。

```js
function foo() {
	console.log( this.a );
}

var a = 2;

(function(){
	"use strict";

	foo(); // 2
})();
```

**注意：** 在你自己的代码中故意混合`strict mode`和非`strict mode`通常是不受欢迎的。你的整个程序应该是 **严格** 的或 **非严格** 的。但是，有时你包含的第三方库与你自己的代码具有不同的 **严格** 性，因此必须注意这些微妙的兼容性细节。

### Implicit Binding

另一个需要考虑的规则是：调用端是否有上下文对象(也称为拥有或包含对象)，尽管这些替代术语可能有点误导。

考虑一下：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

obj.foo(); // 2
```

首先，注意声明`foo()`的方式，然后作为引用属性添加到`obj`中。无论`foo()`最初是在`obj`上声明的，还是后来作为引用添加的(如这个片段所示)，在这两种情况下，`obj`对象都没有真正“拥有”或“包含” **函数** 。

但是，调用端使用`obj`上下文来 **引用** 该函数，因此你 *可以* 说`obj`对象在调用函数时“拥有”或“包含” **函数引用** 。

无论你选择如何称呼这个模式，在调用`foo()`时，它的前面都有一个对`obj`的对象引用。当存在函数引用的上下文对象时，*隐式绑定* 规则表明该对象应该用于函数调用的`this`绑定。

因为`obj`对于`foo()`调用来说就是`this`，所以`this.a`与`obj.a`同义。

只有对象属性引用链的顶级/最后一级对调用站点很重要。例如：

```js
function foo() {
	console.log( this.a );
}

var obj2 = {
	a: 42,
	foo: foo
};

var obj1 = {
	a: 2,
	obj2: obj2
};

obj1.obj2.foo(); // 42
```

#### Implicitly Lost

`this`绑定最常见的问题之一是当 *隐式绑定* 函数失去该绑定时，这通常意味着它会回到全局对象或`undefined`的 *默认绑定* ，具体取决于`strict mode`。

考虑：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var bar = obj.foo; // function reference/alias!

var a = "oops, global"; // `a` also property on global object

bar(); // "oops, global"
```

尽管`bar`似乎是对`obj.foo`的引用，但事实上，它实际上只是对`foo`本身的另一个引用。此外，调用端是重要的，调用端是`bar()`，这是一个简单的，未装饰的调用，因此这里用的是 *默认绑定*。

当我们考虑传递回调函数时，会出现更微妙，更常见和更意外的方式：

```js
function foo() {
	console.log( this.a );
}

function doFoo(fn) {
	// `fn` is just another reference to `foo`

	fn(); // <-- call-site!
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` also property on global object

doFoo( obj.foo ); // "oops, global"
```

参数传递只是一个隐式赋值，因为我们传递一个函数，它是一个隐式引用赋值，所以最终结果与前一个片段相同。

如果你要传递回调的函数不是你自己的，而是内置于语言中的，那该怎么办？这没有区别，结果是一样的。

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` also property on global object

setTimeout( obj.foo, 100 ); // "oops, global"
```

想想这个从JavaScript环境中内置的setTimeout()的粗糙的理论上的伪实现:

```js
function setTimeout(fn,delay) {
	// wait (somehow) for `delay` milliseconds
	fn(); // <-- call-site!
}
```

正如我们刚才所见，我们的函数回调 *失去* 了`this`的绑定是很常见的。但是另一种`this`让我们吃惊的方式是当我们传递回调的函数有意改变调用的`this`时。流行的JavaScript库中的事件处理程序非常喜欢强制你的回调有一个`this`指向，例如，触发事件的DOM元素。虽然这有时可能有用，但有时却会让人非常恼火。不幸的是，这些工具基本上让你没得选择。

无论哪种方式，`this`都意外地改变了，你实际上无法控制你的回调函数引用的执行方式，因此你无法控制调用端来提供你想要的绑定。我们将很快看到一种通过 *修复* `this`来“修复”这个问题的方法。

### Explicit Binding

使用我们刚刚看到的 *隐式绑定* ，我们不得不改变类似上述问题的对象以包含对函数的自身引用，并使用此属性函数引用间接（隐式）将`this`绑定到对象。

但是，如果你想强制一个函数调用为`this`绑定使用一个特定的对象，而不将函数引用放在对象属性上，该怎么办呢?

语言中的“所有”函数都有一些可用的实用程序（通过它们的`[[Prototype]]` - 稍后会详细介绍），这对于此任务非常有用。具体来说，函数有`call(..)`和`apply(..)`方法。从技术上讲，JavaScript宿主环境有时会提供一些特殊的(一种说法)函数，这些函数不具备这些功能。但那些很少。提供的绝大多数函数，当然还有你将创建的所有函数，都可以访问`call(..)`和`apply(..)`。

这些工作是如何工作的？它们作为第一个参数，使用一个用于`this`的对象，然后使用指定的`this`调用该函数。既然你直接说明了你想要的`this`是什么，我们称之为 *显式绑定* 。 

考虑：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

通过`foo.call(..)`来*明确绑定* 的调用`foo()`，这允许我们强制`obj`作为`this`。

如果传递一个简单的原始值（类型为`string`，`boolean`或`number`）作为`this`绑定，则原始值将以其对象形式包装(`new String(..)`, `new Boolean(..)`, or `new Number(..)`)。这通常被称为“装箱”。

**注意：** 关于`this`绑定，`call()`和`apply()`是相同的。它们的附加参数表现不同，但这不是我们目前关心的事情。

不幸的是，仅 *显式绑定* 还不能解决前面提到的问题，即一个函数“失去”其预期的`this`绑定，或者只是用一个框架来铺垫它，等等。

#### Hard Binding

但是围绕显式绑定的变化模式实际上可以解决问题。考虑：

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

var bar = function() {
	foo.call( obj );
};

bar(); // 2
setTimeout( bar, 100 ); // 2

// `bar` hard binds `foo`'s `this` to `obj`
// so that it cannot be overriden
bar.call( window ); // 2
```

让我们来看看这个变化是如何工作的。我们创建了一个函数`bar()`，在内部，手动的调用`foo.call(obj)`，从而使`this`用`obj`绑定，强制调用`foo`。无论你以后如何调用函数`bar`，它总是会手动用`obj`调用`foo`。这种绑定既明确又强大，因此我们将其称为 *硬绑定* 。

用*硬绑定*包装函数最典型的方法是创建传递参数和接收返回值的传递通道:

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = function() {
	return foo.apply( obj, arguments );
};

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

表达此模式的另一种方法是创建一个可重用的帮助器：

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

// simple `bind` helper
function bind(fn, obj) {
	return function() {
		return fn.apply( obj, arguments );
	};
}

var obj = {
	a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

由于*硬绑定*是一种常见的模式，因此它提供了ES5的一个内置实用程序：`Function.prototype.bind`，它的使用方式如下：

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

`bind(..)`返回了一个硬编码的新函数，用于调用原始函数，并按照你指定的方式设置`this`上下文。

**注意：** 从ES6开始，`bind()`生成的硬绑定函数具有从原始*目标函数*派生的`.name`属性。例如：`bar = foo.bind()`的`bar.name`值应为`"bound foo"`，这是应该在堆栈跟踪中显示的函数调用名称。

#### API Call "Contexts"

许多库的函数，以及在javascript语言和宿主环境中的许多内置函数，都提供了一个可选参数，通常称为"上下文(context)"，它是为你设计的一种解决方案，使你不必使用`bind()`来确保回调函数使用特定的`this`。

例如：

```js
function foo(el) {
	console.log( el, this.id );
}

var obj = {
	id: "awesome"
};

// use `obj` as `this` for `foo(..)` calls
[1, 2, 3].forEach( foo, obj ); // 1 awesome  2 awesome  3 awesome
```

在内部，这些不同的函数几乎肯定会通过`call()`或者`apply()`使用 *显式绑定* ，从而省去了麻烦。

### `new` Binding

`this`绑定的第四个也是最后一个规则要求我们重新思考JavaScript中关于函数和对象的一个非常常见的误解。

在传统的面向类的语言中，“构造函数”是附加到类的特殊方法，当使用`new`运算符实例化类时，将调用该类的构造函数。这通常看起来像：

```js
something = new MyClass(..);
```

JavaScript有一个`new`运算符，使用它的代码模式看起来与我们在那些面向类的语言中看到的基本相同;大多数开发人员都认为JavaScript的机制正在做类似的事情。但是，JS中`new`用法所暗示的与面向类的功能实际上 *没有任何联系* 。

首先，让我们重新定义JavaScript中的“构造函数”。在JS中，构造函数**只是函数** ，它们前面使用`new`运算符调用。它们不附加到类，也不是实例化类。它们甚至不是特殊类型的函数。它们只是常规函数，实际上是在调用中使用`new`来劫持的。

例如，作为构造函数的`Number(..)`函数，引用ES5.1规范：

> 15.7.2数字构造函数
>
> 当Number作为`new`表达式的一部分被调用时，它是一个构造函数：它初始化新创建的对象。

因此，几乎任何函数，包括内置对象函数，如`Number(..)`（参见第3章）都可以在其前面调用`new`，这使得该函数叫做 *构造函数调用* 。这是一个重要但微妙的区别：实际上没有“构造函数”这样的东西，而是函数的构造调用。

当一个函数在它前面使用`new`调用时，也称为构造函数调用时，会自动完成以下操作：

1. 一个全新的对象是凭空创建的
2. *新构造* 的对象是`[[Prototype]]` - *链接*(linked)
3. 新构造的对象被设置为该函数调用的`this`绑定
4. 除非函数返回自己的备用 **对象** ，否则`new`调用的函数调用将 *自动* 返回新构造的对象。

步骤1,3和4适用于我们当前的讨论。我们暂时跳过第2步，然后在第5章再讨论第2步。

考虑这段代码：

```js
function foo(a) {
	this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a ); // 2
```

通过在它前面用`new`调用`foo(..)`，我们构造了一个新对象并将这个新对象设置为`foo(..)`调用的`this`。**`new`是函数调用的最后一种`this`绑定方式。** 我们称之为 *新绑定*(*new binding*)。

## Everything In Order

所以，现在我们已经发现了在函数调用中绑定`this`的4条规则。你需要做的就是找到调用端并检查它以查看适用的规则。但是，如果调用端有多个符合条件的规则怎么办？这些规则必须有一个优先顺序，因此我们接下来将演示应用规则的顺序。

应该清楚的是，*默认绑定* 是4的最低优先级规则。所以我们只是把它放在一边。

哪个更优先，*隐式绑定* 还是 *显式绑定* ？我们来测试一下：

```js
function foo() {
	console.log( this.a );
}

var obj1 = {
	a: 2,
	foo: foo
};

var obj2 = {
	a: 3,
	foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

因此，*显式绑定* 优先于 *隐式绑定* ，这意味着在检查 *隐式绑定* 之前，应 **首先** 询问是否应用了 *显式绑定* 。

现在，我们只需要弄清楚*新绑定* 在优先级中的位置。

```js
function foo(something) {
	this.a = something;
}

var obj1 = {
	foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
```

好的，*新绑定* 比 *隐式绑定* 更优先。但是你认为 *新绑定* 和 *显式绑定* 相比，哪个更为优先？

**注意：** `new`和`call/apply`不能一起使用，因此不允许使用`new foo.call(obj1)`来直接测试 *新绑定* 与 *显式绑定* 。但我们仍然可以使用 *硬绑定* 来测试两个规则的优先级。

在我们在代码清单中研究这一点之前，请回想一下物理上的 *硬绑定* 是如何工作的，即`function .prototype.bind(..)`创建了一个新的包装器函数，该函数是硬编码的，可以忽略它自己的`this`绑定(无论它是什么)，并使用我们提供的手动绑定。

通过这种推理，似乎很明显假设 *硬绑定* （这是一种 *显式绑定* 的形式）比 *新绑定* 更优先，因此不能用`new`覆盖。

让我们检查一下：

```js
function foo(something) {
	this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
```

哇！`bar`对`obj1`来说是 *硬绑定*，但是`new bar(3)`并 **没有** 像我们预期的那样将`obj1.a`改为`3`。相反，*硬绑定*（到 `obj1`）的 `bar(..)`调用 **可以** 用`new`覆盖。自从应用了`new`之后，我们将新创建的对象返回，我们将其命名为`baz`，实际上我们看到`baz.a`的值为`3`。

如果你回到我们的“假”绑定帮助器，这应该是令人惊讶的：

```js
function bind(fn, obj) {
	return function() {
		fn.apply( obj, arguments );
	};
}
```

如果你推断出帮助程序的代码是如何工作的，那么它就没有办法让`new`操作符调用覆盖我们刚刚观察到的对`obj`的 *硬绑定* 。

但是从ES5开始，内置的`Function.prototype.bind()`更复杂，实际上相当复杂。以下是MDN页面为`bind(..)`提供的（稍微重新格式化的）填充：

```js
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError( "Function.prototype.bind - what " +
				"is trying to be bound is not callable"
			);
		}

		var aArgs = Array.prototype.slice.call( arguments, 1 ),
			fToBind = this,
			fNOP = function(){},
			fBound = function(){
				return fToBind.apply(
					(
						this instanceof fNOP &&
						oThis ? this : oThis
					),
					aArgs.concat( Array.prototype.slice.call( arguments ) )
				);
			}
		;

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}
```

**注意：** 上面所示的`bind(..)` 填充与ES5中内置的`bind(..)`不同，它是与`new`一起使用的硬绑定函数(请参阅下面的说明，了解为什么它很有用)。因为填充不能像内置实用程序那样在没有`.prototype`的情况下创建函数，所以需要一些细微的间接操作来近似相同的行为。如果你打算使用带有硬绑定函数的`new`，并且依赖于此填充，请仔细考虑。

允许`new`覆盖的部分是：

```js
this instanceof fNOP &&
oThis ? this : oThis

// ... and:

fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
```

实际上，我们不会深入解释这种诡计是如何工作的（它很复杂，超出了我们的范围），但本质上这个实用程序判断硬绑定函数是否是通过 `new` 被调用的（导致一个新构造的对象是它的 `this`），如果是这样，它使用那个新构建的 `this` 而不是之前为 `this` 指定的 *硬绑定*。

为什么`new`能够覆盖 *硬绑定* 有用？

这种行为的主要原因是创建一个函数（可以与`new`一起用于构造对象），它基本上忽略了`this` *硬绑定* ，但它预设了部分或全部函数的参数。`bind(..)`的一个功能是在第一个`this`绑定参数之后传递的任何参数都默认为底层函数的标准参数（技术上称为“部分应用程序”，它是“currying”的子集）。

例如：

```js
function foo(p1,p2) {
	this.val = p1 + p2;
}

// using `null` here because we don't care about
// the `this` hard-binding in this scenario, and
// it will be overridden by the `new` call anyway!
var bar = foo.bind( null, "p1" );

var baz = new bar( "p2" );

baz.val; // p1p2
```

### Determining `this`

现在，我们可以按照优先顺序总结从函数调用的调用端确定`this`的规则。按此顺序提出这些问题，并在第一条规则适用时停止。

1. 是否使用`new`( **新绑定** )调用函数？如果是这样，`this`是新构造的对象。

   `var bar = new foo()`

2. 函数调用是通过`call`还是`apply`( **显式绑定** )，甚至隐藏在`bind` *硬绑定*中？如果是，则`this`是显式指定的对象。

   `var bar = foo.call( obj2 )`

3. 是使用上下文( **隐式绑定** )调用函数，也就是拥有或包含对象？如果是这样，`this`就是上下文对象。

   `var bar = obj1.foo()`

4. 否则，默认为`this`( **默认绑定** )。如果是`strict mode`，为`undefined`，否则就是`global`对象。

   `var bar = foo()`

就是这样。这就是理解正常函数调用的`this`绑定规则所需的 *全部内容* 。嗯......差不多。

## Binding Exceptions

像往常一样，“规则”有一些 *例外* 。

在某些情况下，`this`绑定行为可能会令人惊讶，你打算使用不同的绑定，但最终会得到 *默认绑定* 规则的绑定行为（请参阅前面的内容）。

### Ignored `this`

如果将`null`或`undefined`作为`this`绑定参数传递给`call`，`apply`或`bind`，则会忽略这些值，而会应用 *默认绑定* 规则。

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo.call( null ); // 2
```

为什么你会故意为`this`绑定传递`null`之类的东西？

使用`apply(..)`将值作为数组作为参数传到函数调用中是很常见的。类似地，`bind(..)` 可以柯里化参数（预设值），这可能非常有用。

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// spreading out array as parameters
foo.apply( null, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
```

这两个实用程序都需要对第一个参数进行`this`绑定。如果函数不关心`this`，你需要一个占位符值，而`null`似乎是一个合理的选择，如本片段所示。

**注意：** 我们在这本书中没有提到，但是ES6有`...`扩展运算符，它允许你在语法上“展开”数组作为参数而不需要`apply()`，例如`foo(...[1,2])`，相当于`foo(1,2)` -- 在语法上避免了不必要的`this`绑定。不幸的是，当前没有ES6语法替代柯里化，因此`bind()`调用的`this`参数仍然需要注意。

但是，当你不关心`this`绑定时，总是使用`null`会有一点隐藏的“危险”。如果你这样使用一些函数调用（例如，一个你无法控制的第三方库函数），并且该函数确实引用了`this`引用，那么 *默认绑定* 规则意味着它可能会不经意间引用（或者更糟的是，改变!）`global` 对象（在浏览器中是 `window`）。

显然，这样的陷阱会导致各种非常难以诊断/跟踪的错误。

#### Safer `this`

也许有点“更安全”的做法是为`this`传递一个专门设置的对象，这保证不会成为可能在程序中产生有问题的副作用的对象。借用网络（和军队）的术语，我们可以创建一个“DMZ”（非军事化区域）对象——没有什么比完全空的、非授权的（见第5章和第6章）对象更特殊的了。

如果我们总是传递一个DMZ对象来忽略这个我们认为不需要关心的`this`绑定，我们确信任何`this`隐藏的/意外的使用都将被限制在空对象上，这将使我们的程序的`global`对象不受副作用的影响。

由于这个对象是完全空的，我个人喜欢给它变量名`ø`（空集的小写数学符号）。在许多键盘上（例如Mac上的US-布局），此符号可以使用`⌥+ o`（option+ `o`）轻松输入。某些系统还允许你为特定符号设置热键。如果你不喜欢`ø`符号,或者你的键盘不容易键入这些类型,你当然可以称之为任何你想要的。

无论你叫它什么，创建 **完全为空的对象** 的最简单方法就是 `Object.create(null)`（见第五章）。`Object.create(null)`和`{}`很像，但是没有`Object.prototype`代理，所以它比`{}`更“空”。

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// our DMZ empty object
var ø = Object.create( null );

// spreading out array as parameters
foo.apply( ø, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```

不仅在功能上“更安全”，`ø`还有一种风格上的好处，因为它在语义上传达了“我希望`this`是空的”，而不是`null`。但是再强调下，怎么命名你的DMZ对象都可以。

### Indirection

另一件需要注意的事情是你可以（有意或无意！）为函数创建“间接引用”，在这种情况下，当调用该函数引用时，也是应用的 *默认绑定*。

*间接引用* 最常见的方法之一是赋值：

```js
function foo() {
	console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo(); // 3
(p.foo = o.foo)(); // 2
```

赋值表达式`p.foo = o.foo`的 *结果值* 仅是对底层函数对象的引用。因此，有效的调用端只是`foo()`，而不是你所期望的`p.foo()`或`o.foo()`。根据上述规则，应用 *默认绑定* 规则。

提醒：无论你如何使用 *默认绑定* 规则进行函数调用，进行`this`引用的被调用函数(而不是函数调用站点)的 **内容** 的`strict mode`状态都将确定 *默认绑定* 值：如果处于非`strict mode`模式，则为`global`对象；如果处于`strict mode`模式，则为`undefined`对象。

### Softening Binding

我们之前看到，*硬绑定* 是防止函数调用无意中回退到 *默认绑定* 规则的一种策略，强制它被绑定到特定的`this`(除非你使用`new`来覆盖它!)。问题是，*硬绑定* 极大地降低了函数的灵活性，阻止了使用 *隐式绑定* 或后续 *显式绑定* 尝试手动覆盖`this`。

如果有一种方法可以为 *默认绑定* (不是`global`或`undefined`)提供不同的默认值，那么这将是很好的，同时仍然可以通过 *隐式绑定* 或 *显式绑定* 技术手动绑定`this`。

我们可以构造一个所谓的 *软绑定* 实用程序，它模仿我们想要的行为。

```js
if (!Function.prototype.softBind) {
	Function.prototype.softBind = function(obj) {
		var fn = this,
			curried = [].slice.call( arguments, 1 ),
			bound = function bound() {
				return fn.apply(
					(!this ||
						(typeof window !== "undefined" &&
							this === window) ||
						(typeof global !== "undefined" &&
							this === global)
					) ? obj : this,
					curried.concat.apply( curried, arguments )
				);
			};
		bound.prototype = Object.create( fn.prototype );
		return bound;
	};
}
```

里提供的`softBind(..)`实用程序的工作原理与内置的ES5 `bind(..)`实用程序类似，只是与我们的 *软绑定* 行为不同。它将指定的函数包装在逻辑中，该函数在调用时检查`this`，如果它是`global`的或`undefined`的，则使用预先指定的备用 *默认值* (`obj`)。否则，`this`是不受影响的。它还提供可选的柯里化（参见前面的`bind()`讨论）。

让我们演示它的用法：

```js
function foo() {
   console.log("name: " + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };

var fooOBJ = foo.softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2   <---- look!!!

fooOBJ.call( obj3 ); // name: obj3   <---- look!

setTimeout( obj2.foo, 10 ); // name: obj   <---- falls back to soft-binding
```

`foo()`函数的软绑定版本可以手动绑定`this`到`obj2`或`obj3`，如图所示，但如果 *默认绑定* 适用，则返回到`obj`。

## Lexical `this`

正常函数遵守我们刚刚介绍的4条规则。但ES6引入了一种不使用这些规则的特殊函数：箭头函数。

箭头函数不是由`function`关键字表示，而是由`=>`所谓的“胖箭头”运算符表示。箭头函数不是使用`this`规则的四个标准，而是采用封闭（函数或全局）作用域内的`this`绑定。

让我们来说明箭头函数词法作用域：

```js
function foo() {
	// return an arrow function
	return (a) => {
		// `this` here is lexically adopted from `foo()`
		console.log( this.a );
	};
}

var obj1 = {
	a: 2
};

var obj2 = {
	a: 3
};

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, not 3!
```

在`foo()`中创建的箭头函数在词法上捕获 `foo()` 被调用时的 `this`。因为`foo()`是`this`绑定到`obj1`，`bar`（对返回的箭头函数的引用）也将`this`绑定到`obj1`。箭头函数的词法绑定不能被覆盖（即使是`new`！）。

最常见的用例可能是使用回调，例如事件处理程序或计时器：

```js
function foo() {
	setTimeout(() => {
		// `this` here is lexically adopted from `foo()`
		console.log( this.a );
	},100);
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

虽然箭头函数提供了在函数上使用`bind(..)`的替代方法，以确保函数`this`(这看起来很有吸引力)，但重要的是要注意它们实际上是使用广为人知的词法作用域来禁止了传统的 `this` 机制。在ES6之前，我们已经有了相当普遍的模式，基本上几乎与ES6箭头函数的精神无法区分：

```js
function foo() {
	var self = this; // lexical capture of `this`
	setTimeout( function(){
		console.log( self.a );
	}, 100 );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

虽然`self = this`和箭头函数看起来都是不想使用`bind(..)`的好“解决方案”，但它们基本上是从`this`中逃避而不是理解和接受它。

如果你发现自己编写了`this`风格的代码，但是大多数或者所有时间都是用词汇`self = this`或箭头函数“技巧”来打败`this`机制，也许你应该：

1. 只使用词法作用域，忘记虚伪的`this`风格代码。
2. 完全接受`this`风格的机制，包括在必要时使用`bind(..)`，并尽量避免`self = this`和箭头函数的“词法 this”技巧。

一个程序可以有效地使用这两种类型的代码（词法和 `this`），但是在同一个函数内部，实际上对于相同的查找，混合这两种机制通常要求更难维护代码，而且可能是在做无用功。

## Review (TL;DR)

确定执行函数的`this`绑定需要查找该函数的直接调用位置。一旦检查，可以按优先顺序将四个规则应用于调用端：

1. 使用`new`调用？使用新构造的对象。
2. 使用`call` 或 `apply` (或者 `bind`)? 使用指定的对象。
3. 是否拥有该调用的上下文对象？使用该上下文对象。
4. 默认值：`strict mode`下`undefined`，否则为全局对象。

注意意外/无意调用的 *默认绑定* 规则。在你想要“安全地”忽略`this`绑定的情况下，像`ø= Object.create(null)`这样的“DMZ”对象是一个很好的占位符值，可以保护`global`对象免受意外的副作用。

ES6箭头函数不使用四个标准绑定规则，而是使用词法作用域进行`this`绑定，这意味着它们从其封闭的函数调用中采用`this`绑定（无论它是什么）。在ES6之前的编码中，它们本质上是`self = this`的语法替代。