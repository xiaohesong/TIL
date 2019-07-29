我喜欢那么一句话，就是编程就是管理复杂性。也许你听说过计算机世界就是一个巨大的抽象结构。我们只是简单地把东西包装起来，一遍又一遍地生产新的工具。只需要试想一下。你使用的语言具有内置功能，它们可能是其他底层操作的抽象功能。[JavaScript]([JavaScript](http://krasimirtsonev.com/blog/category/JavaScript))也一样。

你迟早需要使用其他开发人员所写的抽象。也就是说，你依赖于别人的代码。我喜欢模块没有依赖，但这有点难实现。即使你创建了一些像组件这样的很不错的黑盒，但你仍然有一部分是组合了所有的东西。这就是依赖注入的位置。如今，有效管理依赖关系的能力是绝对必要的。这篇文章总结了我对这个问题的看法。

## 目标

假设我们有两个模块。第一个是发出Ajax请求的服务，第二个是路由器。

```javascript
var service = function() {
    return { name: 'Service' };
}
var router = function() {
    return { name: 'Router' };
}
```

我们还有一个函数需要这些模块。

```javascript
var doSomething = function(other) {
    var s = service();
    var r = router();
};
```

为了让事情变得更有趣，这个函数需要再接受一个更多的参数。当然，我们可以使用上面的代码，但是这并不是很灵活。如果我们想使用`ServiceXML`或`ServiceJSON`怎么办？或者，如果我们想要模拟一些模块来进行测试，该怎么办？我们不能只编辑函数体。我们首先想到的是将依赖项作为参数传递给函数。例如:

```javascript
var doSomething = function(service, router, other) {
    var s = service();
    var r = router();
};
```

通过这样做，我们传递了我们想要的模块的确切实现。然而，这带来了一个新问题。想象一下，如果我们的代码中到处都是`doSomething`。如果我们需要第三个依赖，会发生什么。我们不能修改所有的函数调用。所以，我们需要一种工具来帮我们做到这一点。这就是依赖注入器试图解决的问题。让我们写下几个我们想要实现的目标:

- 我们应该能够去注册依赖项
- 注入器应该接受一个函数并返回一个以某种方式获取所需的资源的函数。
- 我们不应该写太多，我们需要短小精悍(emmm)的语法。
- 注入器应该保持传递的函数的作用域。
- 传递的函数应该能够接受自定义参数，而不仅仅是描述的依赖项。

一个不错的列表，不是吗？就让我们一探究竟吧。

## [requirejs](http://requirejs.org/) / [AMD](http://requirejs.org/docs/whyamd.html) 方法

你可能已经了解过[requirejs]([requirejs](http://requirejs.org/))。它是解决依赖关系的一个很好的变体。

```javascript
define(['service', 'router'], function(service, router) {       
    // ...
});
```

其思想是首先描述所需的依赖关系，然后编写函数。参数的顺序在这里当然很重要。假设我们将编写一个名为`injector`的模块，它将接受相同的语法。

```javascript
var doSomething = injector.resolve(['service', 'router'], function(service, router, other) {
    expect(service().name).to.be('Service');
    expect(router().name).to.be('Router');
    expect(other).to.be('Other');
});
doSomething("Other");
```

*在继续之前，我应该澄清一下`doSomething`函数的主体。我使用[expect.js](https://github.com/LearnBoost/expect.js)作为断言库，只是为了确保我正在编写的代码能够按照我的预期工作。有点TDD方法。*

我们的`injector`模块从这里开始。作为一个单例对象是很好的，因此它可以从应用程序的不同部分完成它的工作。

```javascript
var injector = {
    dependencies: {},
    register: function(key, value) {
        this.dependencies[key] = value;
    },
    resolve: function(deps, func, scope) {

    }
}
```

非常简单的对象，它有两个函数和一个变量作为存储。我们要做的是检查`deps`数组并在`dependencies`变量中搜索答案。其余的只是针对传过去的`func`参数调用`.apply`方法。

```javascript
resolve: function(deps, func, scope) {
    var args = [];
    for(var i=0; i < deps.length, d=deps[i]; i++) {
        if(this.dependencies[d]) {
            args.push(this.dependencies[d]);
        } else {
            throw new Error('Can\\'t resolve ' + d);
        }
    }
    return function() {
        func.apply(scope || {}, args.concat(Array.prototype.slice.call(arguments, 0)));
    }        
}
```

如果有任何的作用域它都有效地使用。`Array.prototype.slice.call(arguments, 0)`是将`arguments`变量转换为实际数组所必需的。这个实现的问题是，我们必须编写两次所需的组件，并且我们不能真正混合它们的顺序。其他自定义参数始终位于依赖项之后。

## reflection(反射)方法

根据Wikipedia，反射是程序在运行时检查和修改对象的结构和行为的能力。简单的说就是，在JavaScript上下文中，就是读取对象或函数的源代码并分析它。让我们从一开始就得到`doSomething`函数。如果你对`doSomething.toString()`进行输出，你将会得到下面字符串：

```javascript
"function (service, router, other) {
    var s = service();
    var r = router();
}"
```

将该方法作为字符串使我们能够获取预期的参数。 而且，更重要的是，他们的名字。这就是[Angular](http://angularjs.org/)用来实现依赖注入的方法。我做了一点小小的改动，得到了一个正则表达式，它直接从Angular的代码中导出参数。

```javascript
/^function\\s*[^\\(]*\\(\\s*([^\\)]*)\\)/m
```

我们可以将`resolve`类更改为以下内容：

```javascript
resolve: function() {
    var func, deps, scope, args = [], self = this;
    func = arguments[0];
    deps = func.toString().match(/^function\\s*[^\\(]*\\(\\s*([^\\)]*)\\)/m)[1].replace(/ /g, '').split(',');
    scope = arguments[1] || {};
    return function() {
        var a = Array.prototype.slice.call(arguments, 0);
        for(var i=0; i < deps.length; i++) {
            var d = deps[i];
            args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
        }
        func.apply(scope || {}, args);
    }        
}
```

我们根据函数的定义运行RegExp。其结果是:

```javascript
["function (service, router, other)", "service, router, other"]
```

所以，我们只需要第二项。一旦我们清理了空的空格并拆分了字符串，我们就填充了`deps`数组。还有一个变化:

```javascript
var a = Array.prototype.slice.call(arguments, 0);
...
args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
```

我们循环遍历依赖项，如果缺少什么，我们将尝试从`arguments`对象中获取它。值得庆幸的是，如果数组为空，则`shift`方法返回`undefined`。他不会抛出一个错误。新版本的`injector`可以这样使用:

```javascript
var doSomething = injector.resolve(function(service, other, router) {
    expect(service().name).to.be('Service');
    expect(router().name).to.be('Router');
    expect(other).to.be('Other');
});
doSomething("Other");
```

不需要重复写依赖项，我们可以混合它们的顺序。它仍然有效，我们复制了Angular的魔法。

然而，世界并不完美，反射式注入有一个很大的问题。压缩将打破我们的逻辑。那是因为它改变了参数的名称，我们将无法解析依赖关系。例如：

```javascript
var doSomething=function(e,t,n){var r=e();var i=t()}
```

这就是我们的`doSomething`函数被传递给了一个压缩器。 Angular团队提出的解决方案看起来像这样：

```javascript
var doSomething = injector.resolve(['service', 'router', function(service, router) {

}]);
```

它看起来像我们开始时的东西。我个人无法找到更好的解决方案，于是决定将这两种方法混合使用。这就是注入器(injector)的最终版本。

```javascript
var injector = {
    dependencies: {},
    register: function(key, value) {
        this.dependencies[key] = value;
    },
    resolve: function() {
        var func, deps, scope, args = [], self = this;
        if(typeof arguments[0] === 'string') {
            func = arguments[1];
            deps = arguments[0].replace(/ /g, '').split(',');
            scope = arguments[2] || {};
        } else {
            func = arguments[0];
            deps = func.toString().match(/^function\\s*[^\\(]*\\(\\s*([^\\)]*)\\)/m)[1].replace(/ /g, '').split(',');
            scope = arguments[1] || {};
        }
        return function() {
            var a = Array.prototype.slice.call(arguments, 0);
            for(var i=0; i < deps.length; i++) {
                var d = deps[i];
                args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
            }
            func.apply(scope || {}, args);
        }        
    }
}
```

`resolve`方法接受两个或三个参数。如果是两个，就像我们最近写的一样。是，如果有三个参数，它将获得第一个参数，然后解析它并填充`deps`数组。下面是测试用例:

```javascript
var doSomething = injector.resolve('router,,service', function(a, b, c) {
    expect(a().name).to.be('Router');
    expect(b).to.be('Other');
    expect(c().name).to.be('Service');
});
doSomething("Other");
```

你可能会注意到有两个逗号一个接一个。这不是手误。空值实际上表示`"Other"`参数。这就是我们如何控制参数顺序的。

## 直接注入到作用域

有时我会使用第三种注入方式。它涉及到对函数作用域(或者换句话说，就是`this`对象)的操作。所以，它并不总是合适的。

```javascript
var injector = {
    dependencies: {},
    register: function(key, value) {
        this.dependencies[key] = value;
    },
    resolve: function(deps, func, scope) {
        var args = [];
        scope = scope || {};
        for(var i=0; i < deps.length, d=deps[i]; i++) {
            if(this.dependencies[d]) {
                scope[d] = this.dependencies[d];
            } else {
                throw new Error('Can\\'t resolve ' + d);
            }
        }
        return function() {
            func.apply(scope || {}, Array.prototype.slice.call(arguments, 0));
        }        
    }
}
```

我们所做的就是将依赖项附加到作用域上。这里的好处是开发人员不应该将依赖项作为参数编写。他们只是函数作用域的一部分。

```javascript
var doSomething = injector.resolve(['service', 'router'], function(other) {
    expect(this.service().name).to.be('Service');
    expect(this.router().name).to.be('Router');
    expect(other).to.be('Other');
});
doSomething("Other");
```

## 最后的话

依赖注入是我们都在做的事情之一，但从来没有想过。即使你没有听说过这个词，你可能已经用过几百万次了。

本文中提到的所有示例都可以在[这里](https://github.com/krasimir/blog-posts/tree/master/JavaScriptDependencyInjection)看到。

> 原文：[Dependency injection in JavaScript](https://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript)
