# 关于JavaScript中继承的常见误解

> **本文原文发表于15年4月17日。** 

*如果你不了解原型， 你就不懂JavaScript。*

### 是不是经典继承和原型继承是一回事，只是一种风格偏好吗？

> 不是的

经典和原型继承**在根本上和语义上是不同的。**

经典继承和原型继承之间存在一些定义特征。要使这篇文章有意义，你必须牢记以下几点：

在**类继承中，实例从蓝图（类）继承，并创建子类关系。** 换句话说，你不能像使用实例一样使用该类。**你无法在类定义本身上调用实例方法。** 你必须首先创建一个实例，然后在该实例上调用方法。

在原型继承中，**实例继承自其他实例。** 使用委托原型（设置一个实例的原型来引用一个示例对象），它实际上是**链接到其他对象的对象**，或者是**OLOO**，正如Kyle Simpson所说的那样。使用连续继承，你只需将示例对象中的属性复制到新实例。

了解这些差异非常重要。**类继承凭借其机制创建类层次结构作为子类创建的副作用。** 这些层次结构会导致代码（难以更改）和脆弱性（当修改基类时，由于会产生涟漪的副作用，很容易被破坏）。

原型继承不一定会创建类似的层次结构。我建议你尽量保持原型链的层次浅一点。将很多原型拼凑在一起形成一个委托原型很容易。

- 类是一个蓝图
- 原型是一个对象实例

### JavaScript中，类是不是创建对象的正确方法

> 不是的

有几种**正确的方法** 可以在JavaScript中创建对象。第一个也是最常见的是对象字面量。它看起来像这样（在ES6中）：

```js
let mouse = {
  furColor: 'brown',
  legs: 4,
  tail: 'long, skinny',
  describe () {
    return `A mouse with ${this.furColor} fur,
      ${this.legs} legs, and a ${this.tail} tail.`;
  }
};
```

当然, 对象文本的存在时间比 es6 早很多, 但它们缺少上面看到的方法快捷方式并且必须使用 "var" 而不是 "let"。哦，`.describe()`方法中的模板字符串也不适用于ES5。

你可以使用`Object.create（）`（ES5的功能）附加委托原型：

```js
let animal = {
  animalType: 'animal',
  
  describe () {
    return `An ${this.animalType}, with ${this.furColor} fur, 
      ${this.legs} legs, and a ${this.tail} tail.`;
  }
};

let mouse = Object.assign(Object.create(animal), {
  animalType: 'mouse',
  furColor: 'brown',
  legs: 4,
  tail: 'long, skinny'
});
```

我们来解释下这个。`animal`是委托原型。`mouse`是一个实例。当你尝试访问`mouse`不存在的属性时，JavaScript运行时将在`animal`（委托）上查找属性。

`Object.assign()`是由Rick Waldron倡导的新ES6功能，之前已在几十个库中实现。你可能知道他类似Jquery中的`$.extend()`或Underscore中的`_.extend()`。Lodash有一个版本叫做`assign()`。传入目标对象和任意数量的源对象，用逗号分隔。他将从源对象拷贝所有的自有的可枚举的属性到目标对象。如果存在任何属性名称冲突，则传入的最后一个对象的版本将是确定的那个。

**`Object.create()`** 是由Douglas Crockford支持的ES5功能，因此我们可以在不使用构造函数和`new`关键字的情况下附加委托原型。

我跳过构造函数的例子，因为我不推荐它们。我看到他们被滥用，我看到他们造成了[很多麻烦](https://medium.com/javascript-scene/how-to-fix-the-es6-class-keyword-2d42bb3f4caf)。值得注意的是，很多聪明人都不同意我的看法。聪明的人会做他们想做的事。

聪明人会采取Douglas Crockford的建议:

> “如果某个功能有时很危险，并且有更好的选择，那么请始终使用更好的选项。”

### 是否需要构造函数来指定对象实例化行为并处理对象初始化？

> 不是的

任何函数都可以创建和返回对象。当它不是构造函数时，它被称为工厂函数。

##### 更好的选择

```js
let animal = {
  animalType: 'animal',
 
  describe () {
    return `An ${this.animalType} with ${this.furColor} fur, 
      ${this.legs} legs, and a ${this.tail} tail.`;
  }
};
 
let mouseFactory = function mouseFactory () {
  return Object.assign(Object.create(animal), {
    animalType: 'mouse',
    furColor: 'brown',
    legs: 4,
    tail: 'long, skinny'
  });
};

let mickey = mouseFactory();
```

我通常不会将工厂命名为“工厂” - 这只是为了说明。通常我会称它为'mouse（）`。

### JavaScript中, 是否需要构造函数实现隐私

> 不是的

在JavaScript中，任何时候导出函数时，该函数都可以访问外部函数的变量。当你使用它们时，js引擎会创建一个闭包。闭包是JavaScript中的常见模式，它们通常用于数据隐私。

闭包不是构造函数所特有的。何函数都可以为数据隐私创建一个闭包：

```js
let animal = {
  animalType: 'animal',
 
  describe () {
    return `An ${this.animalType} with ${this.furColor} fur, 
      ${this.legs} legs, and a ${this.tail} tail.`;
  }
};
 
let mouseFactory = function mouseFactory () {
  let secret = 'secret agent';

  return Object.assign(Object.create(animal), {
    animalType: 'mouse',
    furColor: 'brown',
    legs: 4,
    tail: 'long, skinny',
    profession () {
      return secret;
    }
  });
};
 
let james = mouseFactory();
```

![](https://cdn-images-1.medium.com/max/1760/1*PZMdDrJu--I-WSKbrJL7Nw.jpeg)

### “new”是否意味着代码使用经典继承？

> 不是的

`new`关键字用于调用构造函数。它实际上做的是：

- 创建一个新的实例
- 绑定`this`到新的实例
- 新对象的`[[Prototype]] `引用到构造函数的`prototype`属性。
- 新对象的`constructor`属性引用到调用的构造函数
- 在构造函数之后命名对象类型，你将在调试控制台中注意到该类型。你会看到`[Object Foo]`，而不是`[Object object]`。
- 允许`instanceof`检查对象的原型引用是否与构造函数的`.prototype`属性引用的对象相同。

##### *`instanceof`* 

让我们稍缓一下，重新考虑`instanceof`的价值。你可能会改变对于他用处的一些想法。

**Important:** `instanceof`不会像一些强类型语言那样进行类型检查。相反，它会对原型对象进行身份检查，并且很容易被愚弄。它不会跨越执行上下文，例如(常见的错误、挫折和不必要的限制来源)。作为参考，[来自bacon.js的外部示例](https://github.com/baconjs/bacon.js/issues/296)。

它也很容易被佯装成假阳性 (更常见的是) 来自另一个来源的假阴性。因为它是针对目标对象的`.prototype`属性的身份检查，所以它可能导致奇怪的事情：

```js
> function foo() {}
> var bar = { a: 'a'};
> foo.prototype = bar; // Object {a: “a”}
> baz = Object.create(bar); // Object {a: “a”}
> baz instanceof foo // true. oops.
```

最后的结果完全符合JavaScript规范。什么都没有打破 - 只是`instanceof`不能对类型安全做出任何保证。很容易出现"差错"。

除此之外，试图强制JS代码像强类型代码一样工作可能会阻止将函数提升为泛型，因为泛型更具可重用性和实用性。

**`instanceof`限制了代码的可重用性，并可能在使用代码的程序中引入错误。**

> `instanceof`谎言。 鸭子不是。

##### `new`很奇怪

**WAT?** `new`也会做一些奇怪的事情来返回值。如果你尝试返回原始类型，那么他不会生效(返回这个原始值)。但是如果你返回其他的对象，确实是可以返回，但是`this`被抛弃了，打破了对他所有的引用(包括`.call`, `.apply`)和打破构造函数的`.prototype`引用。

### 经典和原型继承之间有很大的性能差异吗？

> 不是的

你可能听说过隐藏类，并认为构造函数明显优于使用`Object.create()`实例化的对象。这些性能差异被夸大了。

应用程序的一小部分时间用于运行JavaScript，并且花费了极少的时间来访问对象的属性。实际上，目前生产的最慢的笔记本电脑每秒可以访问数百万个属性。

**这不是你的应用程序的瓶颈。** 帮自己一个忙，并对你的应用[进行分析](http://www.paulirish.com/2015/advanced-performance-audits-with-devtools/)，以发现你真正的性能瓶颈。我确信在你花费另一个时间思考微优化之前，你应该修复更多件事。

**不相信？** 要使微优化对你的应用程序产生任何明显的影响，你必须循环操作数十万次，而你应该关注的微优化的唯一区别就是它们的数量级不同。

**经验法则：** 分析你的应用程序并消除尽可能多的加载，网络，文件I/O和渲染瓶颈。**然后，只有这样你才能开始考虑微观优化。**

你能说出.0000000001秒和.000000001秒之间的区别吗？我也不能，但我确定可以区分加载10个小图标或加载一个网络字体！

如果你对应用程序进行了分析并发现对象创建确实是一个瓶颈，那么最快的方法就不是使用“new”和经典的OO。**最快的方法是使用对象字面量。** 可以通过一个循环来这样做，并将对象添加到对象池中，以避免垃圾收集器的冲击。如果值得放弃原型OO而不是性能，那么就应该完全放弃原型链和继承来创建对象文本。

> 但是google说类是快的

**WAT?**  谷歌正在构建一个JavaScript引擎。你正在构建一个应用程序。显然，他们关心的和你关心的事情应该是截然不同的事情。让Google处理微优化问题。你担心应用程序的真正瓶颈。我保证，你将获得更好的投资回报率，专注于其他任何事情。

### 经典与原型之间的内存消耗有很大差异吗？

> 不是的

两者都可以使用委托原型在多个对象实例之间共享方法。两者都可以使用或避免将一组状态包装成闭包。

实际上，如果从工厂函数开始，则更容易切换到对象池，以便您可以更仔细地管理内存，并避免被垃圾收集器定期阻塞。有关为什么构造函数会很别扭的更多信息, 请参阅  “new”是否意味着代码使用经典继承？

换句话说，如果想要最灵活的内存管理，请使用工厂函数而不是构造函数和经典继承。

### 原生API使用构造函数。他们是不是比工厂更惯用？

> 不是的

**工厂在JavaScript中极为常见。** 例如，有史以来最流行的JavaScript库，jQuery向用户公开了一个工厂。John Resig写过关于使用工厂和原型扩展而不是类。基本上，它归结为这样一个事实：他不希望调用者者每次做出选择时都必须输入“new”。那会是什么样的？

```js
/**
classy jQuery - an alternate reality where jQuery really sucked and never took off
OR
Why nobody would have liked jQuery if it had exported a class instead of a factory.
**/

// This just looks stupid. Are we creating a new DOM element
// with id="foo"? Nope. We're selecting an existing DOM element
// with id="foo", and wrapping it in a jQuery object instance.
var $foo = new $('#foo');

// Besides, it's a lot of extra typing with literally ZERO gain.
var $bar = new $('.bar');
var $baz = new $('.baz');

// And this is just... well. I don't know what.
var $bif = new $('.foo').on('click', function () {
  var $this = new $(this);
  $this.html('clicked!');
});
```

还有什么暴露工厂？

- **React** *`React.createClass()`* 是一个工厂。
- **Angular** 使用类和工厂，但是在Dependency Injection容器中用工厂包装它们。所有提供者都是使用`.provider()`工厂的糖。甚至还有`.factory()`提供程序，甚至`.service()`提供程序包装正常的构造函数和公开...你猜对了：DI消费者的工厂
- **Ember** *`Ember.Application.create();`* 是一个工厂，而不是创建用`new`调用的构造函数，而`.extend()`方法扩充了app。
- **Node** 核心服务，比如  *`http.createServer()`* 和 *`net.createServer()`* 是工厂函数。
- **Express** 是一个工厂

如您所见，几乎所有最流行的JavaScript库和框架都大量使用工厂函数。**唯一比JS中的工厂更常见的对象实例化模式是对象文字。**

JavaScript内置函数开始使用构造函数，因为Brendan Eich被告知要使它看起来像Java。JavaScript继续使用构造函数来实现自我一致性。尝试将所有内容更改为工厂并现在弃用构造函数会很别扭。

### 是不是经典继承比原型继承更惯用？

> 不是的

每当我听到这种误解时，我很想说，“你甚至是JavaScript开发者吗？”然后继续......但我会抵制这种冲动并将记录直接记录下来。

如果这也是你的问题，请不要感到难过。这不是你的错。[JavaScript Training Sucks!](https://medium.com/javascript-scene/javascript-training-sucks-284b53666245)

这个问题的答案是巨大的，巨大的..

#### 不是..(但是)

原型是JS中的惯用继承范式，“class”是掠夺性入侵物种。

##### 流行JavaScript库的简史：

一开始，每个人都编写了自己的库，开放共享并不是一件大事。然后Prototype出现了。(这个名字是一个很大的暗示)。Prototype通过使用连接继承扩展内置委托原型来实现其魔力。

后来我们都意识到修改内置原型是一种反模式，当原生替代品和争执的库打破了互联网。但那是一个不同的故事。

接下来受欢迎的一个js库就是Jquery。jQuery声名鹊起的是jQuery插件。他们通过使用连接继承来扩展jQuery的委托原型。



> 你是否开始在这里感受到一种模式？



jQuery仍然是有史以来最流行的JavaScript库。巨大的空间。巨大。

这就是事情变得混乱和类扩展开始潜入语言的地方……JohnResig（jquery的作者）用JavaScript写了简单的类继承，人们开始实际使用它，尽管JohnResig自己并不认为它属于jquery（因为原型OO做得更好）。

像ExtJS这样的半流行Java风格框架出现了，引入了JavaScript中类的第一种类型，而不是真正的主流用法。在一个有点流行的库开始将JS暴露给经典继承之前，JavaScript已经有12年了。

三年后，backbone发生了爆炸，并有了一个`.extend（）`方法来模拟类继承，包括所有最糟糕的特性，如脆弱的对象层次结构。就在那时，所有的地狱都破灭了。

这不是JavaScript。我突然又回到了Java地狱。那个孤独，黑暗，可怕的地方，任何快速的动作都可能导致整个层次结构在聚结，紧耦合的抽搐中颤抖和崩溃。

这些都是怪物改写的。

但是，在Backbone 文档中悄悄地走了一缕阳光：

```js
// A ray of sunshine in the belly of
// the beast...

var object = {};

_.extend(object, Backbone.Events);

object.on("alert", function(msg) {
  alert("Triggered " + msg);
});

object.trigger("alert", "an event");
```

我们的老朋友，使用`Backbone.Events` mixin来节省一天的连接继承。

事实证明，如果你仔细查看任何非平凡的JavaScript库，你将会找到连接和委托的例子。JavaScript开发人员做这些事情是如此常见和自动，他们甚至不认为它是继承，即使它实现了相同的目标。

我们是如何添加class的？当然，我们使用委托原型和对象连接在原型继承的基础上构建它！

这就像把你的特斯拉Model S推向汽车经销商并将其换成1983年的福特Pinto。

### 经典和原型继承之间的选择是否取决于用例？

> 不是的

Prototypal OO更简单，更灵活，更不容易出错。多年来，我一直在提出这个主张并挑战人们想出一个引人注目的class用例。成千上万的人听到了这个电话。我收到的几个答案取决于本文中提到的一个或多个误解。

我曾经是一位经典继承的重度用户。我完全投入了它。我到处建立了对象层次结构。我构建了可视化OO快速应用程序开发工具，以帮助软件架构师设计有意义的对象层次结构和关系。它采用了一种可视化工具，使用经典的继承分类法真实地映射和绘制企业应用程序中的对象关系。

在我从C ++和Java过渡到JavaScript之后不久，我就停止了所有这些。不是因为我正在构建不那么复杂的应用程序（事实恰恰相反），但由于JavaScript非常简单，我不再需要所有OO设计工具。

我曾经做过应用程序设计咨询，经常推荐彻底改写。为什么？因为新用例的所有对象层次结构最终都是错误的。

我并不孤独。在那些日子里，完整的重写对于新软件版本来说非常普遍。大多数重写是由[“关节炎”，脆弱的类层次结构](https://medium.com/javascript-scene/the-two-pillars-of-javascript-ee6f3281e7f3)导致的遗留锁定所必需的。整本书都是关于OO设计错误以及如何避免它们或重构它们的。似乎每个开发人员都在他们的桌面上有一个[“设计模式”](http://www.amazon.com/gp/product/0201633612?ie=UTF8&camp=213733&creative=393185&creativeASIN=0201633612&linkCode=shr&tag=eejs-20&linkId=QYF6ABRMZ4O6KML2)。

我建议你遵循[Gang of Four’s的建议](http://www.amazon.com/gp/product/0201633612?ie=UTF8&camp=213733&creative=393185&creativeASIN=0201633612&linkCode=shr&tag=eejs-20&linkId=QYF6ABRMZ4O6KML2)：

> 赞成对象组合而不是类继承。

在Java中，这比类继承更难，因为你实际上必须使用类来实现它。

在JavaScript中，我们没有这个借口。实际上，通过将各种原型组合在一起来创建所需的对象比管理对象层次结构更容易。

WAT？认真。想要可以将任何日期输入转换为`megaCalendarWidget`的jQuery对象吗？你不必`extend`一个类。JavaScript有动态对象扩展，jQuery公开它自己的原型，所以你可以扩展它 - 没有extend关键字！ WAT？：

```JS
/*
How to extend the jQuery prototype:
So difficult.
Brain hurts.
ouch.
*/

jQuery.fn.megaCalendarWidget = megaCalendarWidget;

// omg I'm so glad that's over.
```

下次你调用jQuery工厂时，你会得到一个可以让你的日期输入很棒的实例。

类似地，可以使用`Object.assign()`组合任意数量的对象以及last-in优先级：

```js
import ninja from 'ninja'; // ES6 modules
import mouse from 'mouse';

let ninjamouse = Object.assign({}, mouse, ninja);
```

不，真的 - 任意数量的对象：

```js
// I'm not sure Object.assign() is available (ES6)
// so this time I'll use Lodash. It's like Underscore,
// with 200% more awesome. You could also use
// jQuery.extend() or Underscore's _.extend()
var assign = require('lodash/object/assign');

var skydiving = require('skydiving');
var ninja = require('ninja');
var mouse = require('mouse');
var wingsuit = require('wingsuit');

// The amount of awesome in this next bit might be too much
// for seniors with heart conditions or young children.
var skydivingNinjaMouseWithWingsuit = assign({}, // create a new object
  skydiving, ninja, mouse, wingsuit); // copy all the awesome to it.
```

这种技术称为连续继承，你继承的原型有时被称为示例原型，它与委托原型的不同之处在于你从它们复制而不是委托给它们。

### ES6有`class`关键字。这是不是意味着我们都应该使用它？

> 不是的

有许多[令人信服的理由](https://medium.com/javascript-scene/the-two-pillars-of-javascript-ee6f3281e7f3)可以[避免使用ES6的`class`关键字](https://medium.com/javascript-scene/how-to-fix-the-es6-class-keyword-2d42bb3f4caf)，尤其是因为它很适合JavaScript。

我们已经在JavaScript中拥有一个非常强大且富有表现力的对象系统。因为它在JS中实现的类的概念更具限制性（以一种糟糕的方式，而不是一种很酷的类型正确方式），并且模糊了很久以前内置于该语言中的[非常酷的原型OO系统](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/)。

你知道什么对JavaScript真的有用吗？从熟悉原型OO的程序员的角度来看，建立在原型之上的更好的糖和抽象。

那可能真的[很酷](https://github.com/ericelliott/stampit)



原文: [Common Misconceptions About Inheritance in JavaScript](https://medium.com/javascript-scene/common-misconceptions-about-inheritance-in-javascript-d5d9bab29b0a)
