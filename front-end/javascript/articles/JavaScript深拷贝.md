来看看JavaScript中的深拷贝。

### 通过引用调用(call by reference)

> 译注：通过引用调用可能有点绕，你就当做"用引用作为参数调用"。

JavaScript通过引用传递所有的东西。如果你不知道这句话的意思，那么看下这个例子：

```js
function mutate(obj) {
  obj.a = true;
}

const obj = {a: false};
mutate(obj)
console.log(obj.a); // true
```

函数`mutate`更改了作为参数传递的对象。在"通过值调用(call by value)"的环境中，函数会得到传递过来的值，也就是一个拷贝，这个函数使用这个值来一起工作。函数对对象所做的任何更改在该函数之外都不可见。但是在像JavaScript这样的"通过引用调用"环境中，函数会得到一个——你已经猜到了——*引用*，并会改变实际对象本身。因此最后的`console.log`会打印出`true`。

但是在有些时候，你可能想保持你的原始对象并且为对应的函数创建一个副本。

> 译：对于这个还不是很了解的朋友可以看下在下的相关资源
>
> 1. [You Don't Know Js -- types&grammer -- cp2 values](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/you-dont-known-js/types%26grammer/Chapter2-Values.md#value-vs-reference)
> 2. [原始类型和引用类型的区别](https://github.com/xiaohesong/TIL/blob/master/front-end/basic.md#%E5%8E%9F%E5%A7%8B%E7%B1%BB%E5%9E%8B%E5%92%8C%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%8C%BA%E5%88%AB)

### 浅拷贝：Object.assign()

拷贝一个对象的一种办法是使用`Object.assign(target, sources…)`。他接受任意数量的源对象，枚举他们自己所有的属性并将这些属性分配给`target`。如果我们用一个新的空的对象作为`target`，我们基本上是在进行拷贝。

```js
const obj = /* ... */;
const copy = Object.assign({}, obj);
```

然而，这是一个*浅*拷贝。如果我们的对象包含一个对象，那他们将会保持共享引用，这不是我们想要的结果：

```js
function mutateDeepObject(obj) {
  obj.a.thing = true;
}

const obj = {a: {thing: false}};
const copy = Object.assign({}, obj);
mutateDeepObject(copy)
console.log(obj.a.thing); // true
```

另一个潜在的是`Object.assign()`将getter转换为一个单纯的属性。

> 译：和getter有什么关系？来试试：
>
> ```js
> var myObject = {
> 	get say() {
> 		return 'Hi, xiaohesong';
> 	}
> };
> console.log('before assign', Object.getOwnPropertyDescriptor(myObject, 'say'))
> var obj = Object.assign({}, myObject)
> console.log('after assign', Object.getOwnPropertyDescriptor(obj, 'say'));
> ```
>
> 动手试试，是不是变成了单纯的属性？那再动手试试setter呗？

那么现在呢？事实证明，有两种办法可以创建对象的*深*拷贝。

> 注意：有人询问关于[对象拓展运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)。其实对象拓展也是创建了一个浅拷贝。
>
> 译：关于拓展运算符，可以看看在下之前介绍的[几个特性](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/objects/spread.md)。

### JSON.parse

有个最古老的方法去创建对象拷贝的是将对象转换为字符串表示形式，然后再将他解析回对象的形式。这个感觉有些沉重，但是确实可以有效：

```js
const obj = /* ... */;
const copy = JSON.parse(JSON.stringify(obj));
```

这里有个缺点就是你创建了一个临时的而且可能会很大的字符串，其目的只是为了转回到解析器。另一个缺点是这种方法不能处理循环对象。不管你怎么认为，这些都很容易发生。例如，在构建树状数据结构时，节点引用其父节点，而父节点又引用其子节点。

```js
const x = {};
const y = {x};
x.y = y; // Cycle: x.y.x.y.x.y.x.y.x...
const copy = JSON.parse(JSON.stringify(x)); // throws!
```

此外，像Maps，Sets，RegExps，Dates，ArrayBuffers和其他内置类型这样的东西在序列化时会丢失。

> 译：对JSON.stringify不了解的朋友，可以看看[You Don't Know Js: Types & Grammar cp4: coercion JSON Stringification](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/you-dont-known-js/types%26grammer/Chapter4-coercion.md#json-stringification)。

### Structured Clone

[结构化克隆](https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeinternal)是一种现有的算法，用于将值从一个领域转移到另一个领域。例如，当你调用`postMessage`将消息发送到另一个窗口(window)或[WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)时，就会使用此方法。结构化克隆的好处是它可以处理循环对象并[支持大量的内置类型](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#Supported_types)。问题在于，在编写本文时，算法不会直接暴露，只能作为其他API的一部分。 所以我们必须先看看那些API，不是吗。。。

#### MessageChannel

正如我所说，无论何时调用postMessage，都会使用结构化克隆算法(译：在针对对象的时候，是这种情况)。我们可以创建一个[MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel/MessageChannel)并发送一条消息。在接收端，消息包含原始数据对象的结构克隆。

```js
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

const obj = /* ... */;
const clone = await structuralClone(obj);
```

这种方法的缺点是它是异步的。这也没什么大不了的，但有时你需要以一种同步方式来深度拷贝对象。

#### History API

如果你曾经使用`history.pushState()`来构建SPA，那么你就会知道可以提供一个state对象来保存URL。事实证明，这个state对象在结构的克隆上是同步进行的。我们必须小心不要打乱任何可能使用state对象的程序逻辑，所以我们需要在完成克隆后恢复原始state。要防止触发任何事件，请使用`history.replaceState()`而不是`history.pushState()`。

```js
function structuralClone(obj) {
  const oldState = history.state;
  history.replaceState(obj, document.title);
  const copy = history.state;
  history.replaceState(oldState, document.title);
  return copy;
}

const obj = /* ... */;
const clone = structuralClone(obj);
```

再一次，只是为了复制一个对象而进入浏览器的引擎感觉有点重，但是你必须做你必须做的事情。此外，Safari将`replaceState`的调用数量限制在30秒内100次。

#### Notification API

Twitter上发了一个[推文](https://twitter.com/DasSurma/status/955484341358022657)之后，[Jeremy Banks](https://twitter.com/jeremyBanks/status/956053793875087361)向我展示了第三种方式利用结构化克隆：

```js
function structuralClone(obj) {
  return new Notification('', {data: obj, silent: true}).data;
}

const obj = /* ... */;
const clone = structuralClone(obj);
```

短小，简洁。我喜欢他。不过，它基本上是需要在浏览器中启动权限机制，所以我怀疑它非常慢。由于某种原因，Safari始终为数据对象返回`undefined`。

### 性能特征

我想衡量这些方法中哪一种是性能最好的。在我的第一次(天真的)尝试中，我使用了一个小JSON对象，并通过这些不同的方法将其拷贝一千次。幸运的是，[Mathias Bynens](https://twitter.com/mathias)告诉我[V8有一个缓存](https://v8project.blogspot.co.uk/2017/08/fast-properties.html)，用于在对象中添加属性。所以这基本是没啥参考性了。为了确保我没有命中缓存，我编写了一个函数，[它使用随机命名生成给定深度和宽度的对象](https://gist.github.com/surma/d473bc68902984e6ade4fbe34ed55c3c)，并重新运行[测试](https://deep-copy-median.glitch.me/)。

> 译： 对于v8有一个缓存，也可以看看在下之前的一个文章[外形和内联缓存](https://github.com/xiaohesong/til/blob/master/front-end/javascript/engines/shape%E5%92%8Cinline-cache.md)

#### 图解!

以下是Chrome，Firefox和Edge中不同技术的表现。 越低越好。

![Performance in Chrome 63](https://dassur.ma/chrome-1c7180db.png)

![Performance in Firefox 58](https://dassur.ma/firefox-08974175.png)



![Performance in Edge 16](https://dassur.ma/edge-2f123164.png)

### 总结

那么我们从本文得到了什么？

- 如果你不需要循环对象，也不需要保留内置类型，那么你可以使用`JSON.parse(JSON.stringify())`在所有浏览器中获得最快的克隆，我发现这非常令人惊讶。
- 如果你想要一个合适的结构化克隆，`MessageChannel`是你唯一可靠的跨浏览器选择。

如果我们将`structuredClone()`作为对应平台上的一个函数会不会更好？我当然这么认为，并重新审视了[HTML规范](https://github.com/whatwg/html)的已存在的一个[issue](https://github.com/whatwg/html/issues/793)，以重新考虑这种方法。

原文：[Deep-copying in JavaScript](https://dassur.ma/things/deep-copy/)
