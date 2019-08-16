如果你的JavaScript代码库非常复杂，那么 **你可能有一种在开发和生产环境中打包和运行不同代码的方法。** 

在开发和生产环境中打包和运行不同的代码是非常有用的。在开发模式中，React包含许多警告，可以帮助你在问题导致bug之前找到它们。但是，检测此类错误所需的代码通常会增加打包的大小并减慢应用程序运行速度。

在开发中的速度稍慢是可以被接受的。事实上，在开发过程中运行较慢的代码甚至 *可能是有益的* ，因为稍微弥补了开发机器和普通消费者设备之间的差异。

在生产环境中，我们不想有任何的浪费。因此，我们在生产环境中省略了这些检查。这是怎么回事?让我们来看看。

------

在开发环境中运行不同代码的确切方法取决于JavaScript构建管道(以及是否有)。Facebook是这样的:

```js
if (__DEV__) {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

在这里，`__DEV__`不是一个真正的变量。当浏览器的模块被拼接在一起时，这个常量就被替换掉了。结果是这样的:

```js
// In development:
if (true) {
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// In production:
if (false) {
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

在生产环境中，你还要在代码上进行压缩(例如，[terser](https://github.com/terser-js/terser))。大多数JavaScript 压缩执行有限形式的[死代码消除](https://en.wikipedia.org/wiki/Dead_code_elimination)，例如删除`if (false)`分支。所以在生产环境中你只会看到:

```js
// In production (after minification):
doSomethingProd();
```

(*请注意，对于主流JavaScript工具如何有效地消除死代码有很大的限制，但这是另一个话题。*)

虽然你可能没有使用`__DEV__`魔术常量，但如果你使用像webpack这样的流行JavaScript打包器，则可能会遵循其他一些惯例。例如，常见的表达方式是这样的:

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

**这正是[React](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build)和[Vue](https://vuejs.org/v2/guide/deployment.html#Turn-on-Production-Mode)等库在使用打包器从npm import时使用的模式。** 单文件`<script>`标签构建提供开发和生产版本作为单独的`.js`和`.min.js`文件。

这个特殊的约定最初来自Node.js。在Node.js中，有一个全局`process`变量，它将系统的环境变量公开为[process.env](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env)对象上的属性。但是，当你在前端代码库中看到此模式时，通常不会涉及任何实际的`process`变量。 🤯

相反，整个`process.env.NODE_ENV`表达式在构建时被字符串字面量替换，就像我们的魔法`__DEV__`变量一样：

```js
// In development:
if ('development' !== 'production') { // true
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// In production:
if ('production' !== 'production') { // false
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

因为整个表达式是常量(`'production' !== 'production'`保证为`false`)，所以压缩器也可以删除其他分支。

```js
// In production (after minification):
doSomethingProd();
```

恶作剧性的管理。

------

请注意，这 **不适用于** 更复杂的表达式：

```js
let mode = 'production';
if (mode !== 'production') {
  // 🔴 not guaranteed to be eliminated
}
```

由于JavaScript语言的动态特性，JavaScript静态分析工具不是很智能。当他们看到像`mode`这样的变量而不是像`false`或`'production' !== 'production'`这样的静态表达式时，他们通常会放弃。

同样，JavaScript中的死代码消除在使用`import`语句时，常常不能很好地跨模块边界工作:

```js
// 🔴 不能保证被清除
import {someFunc} from 'some-module';

if (false) {
  someFunc();
}
```

因此，你需要以一种非常机械(笔：死板？)的方式编写代码，使条件绝对是静态的，并确保要消除的所有代码都在其中。

------

要使所有这些工作正常，你的打包器需要执行`process.env.NODE_ENV`替换，并且需要知道你要在哪种模式下构建项目。

几年前，常常忘记配置环境。你经常会看到一个处于开发模式的项目已部署到生产环境中。

这很糟糕，因为它会使网站加载和运行更慢。

在过去两年中，情况有了显着改善。例如，webpack添加了一个简单的`mode`选项，而不是手动配置`process.env.NODE_ENV`替换。React DevTools现在还在具有开发模式的站点上显示一个红色图标，便于发现甚至[报告](https://mobile.twitter.com/BestBuySupport/status/1027195363713736704)。

![Development mode warning in React DevTools](https://overreacted.io/static/ca1c0db064f73cc5c8e21ad605eaba26/fb8a0/devmode.png)

像Create React App、Next/Nuxt、Vue CLI、Gatsby和其他一些的设置，将开发构建和生产构建分离成两个单独的命令，这样就更难搞砸。(例如： `npm start`和`npm run build`)。通常，只能部署生产构建，因此开发人员不能再犯这个错误。

总是有这样一种说法，即生产模式需要是默认的，而开发模式需要是选择加入。就个人而言，我认为这个论点并不令人信服。从开发模式警告中获益最多的人通常是库的新手。*他们不知道打开它* ，也会错过许多预警早就发现的错误。

是的，性能问题很糟糕。但向最终用户提供有缺陷的体验也是如此。例如，[React警告](https://reactjs.org/docs/lists-and-keys.html#keys)有助于防止错误，比如向错误的人发送消息或购买错误的产品。禁用此警告进行开发对你和你的用户来说是一个重大风险。如果默认情况下它是关闭的，那么当你找到切换并打开它时，你将有很多警告需要清除。所以大多数人会把它切换回去。这就是为什么需要从一开始就打开它，而不是之后才启用它。

最后，即使开发警告是可选的，并且开发人员知道在开发的早期就启用它们，我们也只会回到最初的问题。部署到生产环境中时，会有人不小心让它们打开！

我们又回到了原点。

就个人而言，**我相信显示和使用正确模式的工具取决于你是在调试还是部署。** 除了web浏览器之外，几乎所有其他环境(无论是移动环境、桌面环境还是服务器环境)几十年来都有一种方法来加载和区分开发和生产构建。

JavaScript环境应该把这种区别看作是头等需要。

------

理念说的已经够多了！

让我们再看看这段代码：

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

你可能想知道：如果前端代码中没有真正的`process`对象，为什么像React和Vue这样的库在npm构建中依赖它？

(*再次澄清一点：你可以在React和Vue提供的浏览器中加载的`<script>`标签不依赖于这个。相反，你必须在开发环境`.js`和生产环境`.min.js`文件之间手动选择。下面只讨论如何通过从npm导入React或Vue来使用绑定器。*)

就像编程中的许多事情一样，这种特殊的约定主要有历史原因。我们仍在使用它，因为现在它被不同的工具广泛采用。切换到其他东西的代价是昂贵的。

那背后的历史是什么？

在``import`和`export`语法标准化之前的很多年，有几种相互竞争的方式来表达模块之间的关系。Node.js推广了`require()`和`module.exports`，称为[CommonJS](https://en.wikipedia.org/wiki/CommonJS)。

早期发布在npm注册表上的代码是为Node.js编写的。 [Express](https://expressjs.com/)是(并且可能仍然是？)Node.js最受欢迎的服务器端框架，它使用`NODE_ENV`环境变量来启用生产模式。其他一些npm包也采用了相同的约定。

像browserify这样的早期JavaScript捆绑包希望能够在前端项目中使用来自npm的代码。是的，[当时](https://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging)几乎没有人使用npm作为前端！你能想象吗？）因此他们将Node.js生态系统中已经存在的相同约定扩展到前端代码。

最初的“envify”版本于[2013年发布](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97)。React在那个时候是开源的，而且使用browserify的npm似乎是在那个时代捆绑前端CommonJS代码的最佳解决方案。

React从一开始就开始提供npm构建（除了`<script>`标记构建之外）。随着React的流行，使用CommonJS模块编写模块化JavaScript并通过npm处理前端代码的做法也是如此。

React需要在生产模式中删除仅开发代码。Browserify早已经为这个问题提供了解决方案，因此React也采用了将`process.env.NODE_ENV`用于其npm构建的约定。随着时间的推移，许多其他工具和库，包括webpack和Vue，都做了同样的事情。

到2019年，browserify已经失去了相当多的市场份额。但是，在构建步骤中将`process.env.NODE_ENV`替换为`'development'`或`'production'`是一种非常流行的约定。

(*如果能看到ES模块作为一种发版格式(而不仅仅是创作格式)的采用如何改变这个等式，那将是一件非常有趣的事情。在推特上告诉我?*)

------

还有一件事可能会让你感到困惑，那就是在GitHub上的React源代码中，你将看到使用了`__dev__`作为一个神奇的变量。但是在npm的React代码中，它使用`process.env.NODE_ENV`。这是如何运作的？

从历史上看，我们在源代码中使用`__DEV__`来匹配Facebook源代码。很长一段时间，React被直接复制到Facebook代码库中，所以它需要遵循相同的规则。对于npm，我们有一个构建步骤，在发布之前用`process.env.NODE_ENV！=='production'`直接替换`__DEV__`检查。

这有时是一个问题。有时，依赖于某些Node.js约定的代码模式在npm上运行良好，但是破坏了Facebook，反之亦然。

自React 16以来，我们改变了方法。相反，我们现在为每个环境[编译一个包](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#compiling-flat-bundles)（包括`<script>`标签，npm和Facebook内部代码库）。因此，即使是针对npm的CommonJS代码也会被编译为提前分开开发和生产捆绑包。

这意味着，虽然React源代码说`if (__dev__)`，但实际上我们为每个包生成两个编译包。一个已经预编译了`__DEV__ = true`，另一个预编译了`__DEV__ = false`。npm上每个包的入口点“决定”要导出哪个包。

[例如](https://unpkg.com/browse/react@16.8.6/index.js):

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

而且这是你的捆绑器将`'development'`或`'production'`插入字符串的唯一地方，以及你的压缩器将摆脱仅开发`require`的地方。

`react.production.min.js`和`react.development.js`都没有任何`process.env.NODE_ENV`检查。这很好，因为当实际在Node.js上运行时，访问`process.env`[有点慢](https://reactjs.org/blog/2017/09/26/react-v16.0.html#better-server-side-rendering)。提前在两种模式下编译捆绑包还可以让我们[更加一致](https://reactjs.org/blog/2017/09/26/react-v16.0.html#reduced-file-size)地优化文件大小，无论您使用哪种打包器或压缩器。

这才是他如何工作的！

> 原文：[How Does the Development Mode Work?](https://overreacted.io/how-does-the-development-mode-work/)

