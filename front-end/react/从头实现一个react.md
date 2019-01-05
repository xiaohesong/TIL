> 本节是 [stack reconciler](https://reactjs.org/docs/codebase-overview.html#stack-reconciler)程序的实现说明的集合。

本文有一定的技术含量，要对React公共API以及它如何分为核心，渲染器和协调(和解，reconciler)程序有很深的理解。如果你对React代码库不是很熟悉，请首先[阅读代码库概述](https://github.com/xiaohesong/TIL/blob/master/front-end/react/codebase-overview.md)。

它还假设你了解React组件，它们的[实例和元素之间的差异](https://github.com/xiaohesong/TIL/blob/master/front-end/react/component-element-instance.md)。

`stack reconciler`用于15版本和早期. 它的代码在 [src/renderers/shared/stack/reconciler](https://github.com/facebook/react/tree/15-stable/src/renderers/shared/stack/reconciler).

### 视频：从头开始构建React

[Paul O’Shannessy](https://twitter.com/zpao)谈到了从头开始构建react，这在很大程度上启发了这个文档。

本文档和他的演讲都是对实际代码库的简化，因此你可以通过熟悉它们来获得更好的理解。

### 概述

reconciler(协调，调解)本身不存在公共的API。像React DOM和React Native这样的[渲染器](https://reactjs.org/docs/codebase-overview.html#stack-renderers)使用它根据用户编写的React组件有效地更新用户界面。

### 挂载(mounting)作为递归过程

让我们考虑第一次挂载组件:

```js
ReactDOM.render(<App />, rootEl);
```

React DOM会将`<App />`传递给调节器(reconciler)。请记住，`<App />`是一个React元素，即对要呈现的内容的描述。你可以将其视为普通对象(笔者：不了解的可以查看[这篇文章](https://github.com/xiaohesong/TIL/blob/master/front-end/react/component-element-instance.md#top-down-reconciliation))：

```js
console.log(<App />);
// { type: App, props: {} }
```

调解器会检查这个`App`是类还是函数(对于这个得实现可以查看[如何知道是函数还是类](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/how-to-known-component-is-func-or-class.md)这篇文章)。

如果`App`是一个函数，则调解器将调用`App(props)`来获取渲染元素。

如果`App`是一个类，那么调解器会通过`new App(props)`去实例化`App`，调用`componentWillMount`生命周期方法，然后调用`render`方法来获取渲染的元素。

无论哪种方式，调解器都将得知`App`“渲染到”的元素。

这个过程是递归的。`App`可能会渲染`<Greeting />`,`<Greeting />`可能会渲染`<Button />`,一直这样。调解器将在了解每个组件呈现的内容时以递归方式“向下钻取”用户定义的组件。

可以将此过程想象为伪代码：

```js
function isClass(type) {
  // React.Component下面的类有这个标签	
  return (
    Boolean(type.prototype) &&
    Boolean(type.prototype.isReactComponent)
  );
}

// 这个函数接受一个React元素 (例如 <App />)
// 并且返回一个已经挂载了树的DOM或原生节点
function mount(element) {
  var type = element.type;
  var props = element.props;

  // 我们将确定渲染元素的类型
  // 函数就直接调用
  // 类就实例化后调用render().
  var renderedElement;
  if (isClass(type)) {
    // 类组件
    var publicInstance = new type(props);
    // 设置props
    publicInstance.props = props;
    // 必要时调用生命周期方法
    if (publicInstance.componentWillMount) {
      publicInstance.componentWillMount();
    }
    // 通过调用render()获得渲染的元素
    renderedElement = publicInstance.render();
  } else {
    // 函数组件
    renderedElement = type(props);
  }

  // 这个过程是递归的 因为一个组件可能返回的元素的类型是另外一个组件
  return mount(renderedElement);
    
  // 注意：这个实现是不完整的，并且会无限的重复下去
  // 它只处理<App/>或<Button/>等元素。
  // 它还没有处理像<div/>或<p/>这样的元素。
}

var rootEl = document.getElementById('root');
var node = mount(<App />);
rootEl.appendChild(node);
```

> **注意：** 这真的仅仅只是一个伪代码，它与真实的实现并不相似。它还会导致堆栈溢出，因为我们还没有讨论何时停止递归。

让我们回顾一下上面例子中的一些关键想法：

- React的elements只是一个纯对象，用来描述组件的类型(如：`App`)和他的props.
- 用户定义的组件(如：`App`)可以是函数或者类，但是他们都会渲染这些元素。
- “Mounting”是一个递归过程，它在给定顶级React元素(例如`<App />`)的情况下创建DOM或Native树。

### Mounting计算机(Host)元素

如果我们没有在屏幕上呈现某些内容，则此过程将毫无用处。

除了用户定义的（“复合”）组件之外，React元素还可以表示特定于平台的（“计算机”）组件。例如，`Button`可能会从其render方法返回`<div />`。

如果element的`type`属性是一个字符串，我们认为正在处理一个计算机元素：

```js
console.log(<div />);
// { type: 'div', props: {} }
```

没有与计算机元素关联的用户定义代码。

当协调程序(调解器)遇到这些计算机元素时，它会让渲染器(renderer)负责mounting它。例如，React DOM将创建一个DOM节点。

如果计算机元素具有子节点，则协调器以与上述相同的算法递归地mounts它们。子节点是否是计算机元素(`<div><hr /></div>`)或用户合成的组件(`<div><Button /></div>`),都没有关系，都会去让渲染器去负责mounting它。

由子组件生成的DOM节点将附加到父DOM节点，并且将递归地组装完整的DOM结构。

> **注意:** 调解器本身与DOM无关。mounting(安装)的确切结果（有时在源代码中称为“mount image”）取决于渲染器，可以是DOM节点（React DOM），字符串（React DOM Server）或表示原生视图（React Native）。

如果我们要扩展代码来处理计算机元素，它将如下所示：

```js
function isClass(type) {
  // 继承自 React.Component 类有一个标签 isReactComponent
  return (
    Boolean(type.prototype) &&
    Boolean(type.prototype.isReactComponent)
  );
}

// 这个函数只处理复合的元素
// 比如像是<App />, <Button />这些，但不是<div />这些
function mountComposite(element) {
  var type = element.type;
  var props = element.props;

  var renderedElement;
  if (isClass(type)) {
    // 组件是类的情况，就去实例化他
    var publicInstance = new type(props);
    // 设置props
    publicInstance.props = props;
    // 必要的时候调用生命周期方法
    if (publicInstance.componentWillMount) {
      publicInstance.componentWillMount();
    }
    renderedElement = publicInstance.render();
  } else if (typeof type === 'function') {
    // 组件是个函数
    renderedElement = type(props);
  }

  // 这是递归的
  // 但当元素是宿主（例如<div/>）而不是复合（例如<App/>）时，我们将最终完成递归：
  return mount(renderedElement);
}

// 这个函数仅仅处理计算机元素
// 例如它处理<div />和<p />这些，但不处理<App />
function mountHost(element) {
  var type = element.type;
  var props = element.props;
  var children = props.children || [];
  if (!Array.isArray(children)) {
    children = [children];
  }
  children = children.filter(Boolean);

    
  // 这段代码不应该在协调器中。
  // 不同的渲染器可能对节点进行不同的初始化。
  // 例如，React Native将创建iOS或Android视图。
  var node = document.createElement(type);
  Object.keys(props).forEach(propName => {
    if (propName !== 'children') {
      node.setAttribute(propName, props[propName]);
    }
  });

  // 安装子元素
  children.forEach(childElement => {
    // 子元素可能是计算机元素(比如<div />)，也有可能是一个合成组件(比如<Button />)
    // 我们都会递归挂载安装
    var childNode = mount(childElement);

    // 下面这个也是一个特定于平台的
    // 它会根据不同的渲染器来处理，这里只是一个假设他是一个dom渲染器
    node.appendChild(childNode);
  });

  // 返回作为安装结果的DOM节点
  // 这也是递归的结束的地方
  return node;
}

function mount(element) {
  var type = element.type;
  if (typeof type === 'function') {
    // 用户定义的组件(合成的组件)
    return mountComposite(element);
  } else if (typeof type === 'string') {
    // 计算机组件(例如: <div />)
    return mountHost(element);
  }
}

var rootEl = document.getElementById('root');
var node = mount(<App />);
rootEl.appendChild(node);
```

这是有效的，但仍远未达到协调者的实际运行方式。关键的缺失部分是对更新的支持。

### 介绍内部实例

react的关键特点是你可以重新渲染所有东西，它不会重新创建DOM或重置状态。

```js
ReactDOM.render(<App />, rootEl);
// 应该重用现有的DOM:
ReactDOM.render(<App />, rootEl);
```

但是，我们上面的实现只知道如何挂载初始树。它无法对其执行更新，因为它不存储所有必需的信息，例如所有`publicInstance`s，或哪些DOM`节点`对应于哪些组件。

堆栈协调器代码库通过使`mount`函数成为一个类上面的方法来解决这个问题。但是这种方法存在一些缺点，我们在正在进行的[协调重写任务中](https://reactjs.org/docs/codebase-overview.html#fiber-reconciler)正朝着相反的方向去发展(笔者：目前fiber已经出来了)。**不过** 这就是它现在的运作方式。

我们将创建两个类：`DOMComponent`和`CompositeComponent`，而不是单独的`mountHost`和`mountComposite`函数。

两个类都有一个接受元素的构造函数，以及一个返回已安装节点的`mount()`方法。我们将用实例化类的工厂替换顶级`mount()`函数：

```js
function instantiateComponent(element) {
  var type = element.type;
  if (typeof type === 'function') {
    // 用户定义的组件
    return new CompositeComponent(element);
  } else if (typeof type === 'string') {
    // 特定于平台的组件，如计算机组件(<div />)
    return new DOMComponent(element);
  }  
}
```

首先，让我们考虑下`CompositeComponent`的实现:

```js
class CompositeComponent {
  constructor(element) {
    this.currentElement = element;
    this.renderedComponent = null;
    this.publicInstance = null;
  }

  getPublicInstance() {
    // 对于复合的组件，暴露类的实例
    return this.publicInstance;
  }

  mount() {
    var element = this.currentElement;
    var type = element.type;
    var props = element.props;

    var publicInstance;
    var renderedElement;
    if (isClass(type)) {
      // Component class
      publicInstance = new type(props);
      // Set the props
      publicInstance.props = props;
      // Call the lifecycle if necessary
      if (publicInstance.componentWillMount) {
        publicInstance.componentWillMount();
      }
      renderedElement = publicInstance.render();
    } else if (typeof type === 'function') {
      // Component function
      publicInstance = null;
      renderedElement = type(props);
    }

    // Save the public instance
    this.publicInstance = publicInstance;

    // 根据元素实例化子内部实例
    // 他将是DOMComponent,例如<div />, <p />
    // 或者是CompositeComponent,例如<App />，<Button />
    var renderedComponent = instantiateComponent(renderedElement);
    this.renderedComponent = renderedComponent;

    // Mount the rendered output
    return renderedComponent.mount();
  }
}
```

这与我们之前的`mountComposite()`实现没什么不同，但现在我们可以存储一些信息，例如`this.currentElement`,`this.renderedComponent`和`this.publicInstance`,在更新期间使用。

请注意，`CompositeComponent`的实例与用户提供的`element.type`的实例不同。`CompositeComponent`是我们的协调程序的实现细节，永远不会向用户公开。用户定义的类是我们从`element.type`读取的，`CompositeComponent`会创建这个类的实例。

**为避免混淆，我们将`CompositeComponent`和`DOMComponent`的实例叫做“内部实例”。** 它们存在，因此我们可以将一些长期存在的数据与它们相关联。只有渲染器和调解器知道它们存在。

**相反，我们将用户定义类的实例称为“公共实例(public instance)”。** 公共实例是你在`render()`和组件其他的方法中看到的`this`.

至于`mountHost()`方法，重构成了在`DOMComponent`类上的`mount()`方法，看起来像这样：

```js
class DOMComponent {
  constructor(element) {
    this.currentElement = element;
    this.renderedChildren = [];
    this.node = null;
  }

  getPublicInstance() {
    // For DOM components, only expose the DOM node.
    return this.node;
  }

  mount() {
    var element = this.currentElement;
    var type = element.type;
    var props = element.props;
    var children = props.children || [];
    if (!Array.isArray(children)) {
      children = [children];
    }

    // Create and save the node
    var node = document.createElement(type);
    this.node = node;

    // Set the attributes
    Object.keys(props).forEach(propName => {
      if (propName !== 'children') {
        node.setAttribute(propName, props[propName]);
      }
    });

    // 创建并保存包含的子元素
    // 这些子元素，每个都可以是DOMComponent或CompositeComponent
    // 这些匹配是依赖于元素类型的返回值(string或function)
    var renderedChildren = children.map(instantiateComponent);
    this.renderedChildren = renderedChildren;

    // Collect DOM nodes they return on mount
    var childNodes = renderedChildren.map(child => child.mount());
    childNodes.forEach(childNode => node.appendChild(childNode));

    // DOM节点作为mount的节点返回
    return node;
  }
}
```

与上面的相比，`mountHost()`重构之后的主要区别是现在将`this.node`和`this.renderedChildren`与内部DOM组件实例相关联。我们会用他来用于在后面做非破坏性的更新。

因此，每个内部实例（复合或主机）现在都指向其子级内部实例。为了帮助可视化，如果函数`<App>`组件呈现`<Button>`类组件，而`Button`类呈现`<div>`，则内部实例树将如下所示：

```js
[object CompositeComponent] {
  currentElement: <App />,
  publicInstance: null,
  renderedComponent: [object CompositeComponent] {
    currentElement: <Button />,
    publicInstance: [object Button],
    renderedComponent: [object DOMComponent] {
      currentElement: <div />,
      node: [object HTMLDivElement],
      renderedChildren: []
    }
  }
}
```

在DOM中，你只能看到`<div>`。但是，内部实例树包含复合和主机内部实例。

复合内部实例需要存储：

- 当前元素
- 公共实例，如果当前元素类型是个类
- 单个呈现的内部实例。它可以是`DOMComponent`或`CompositeComponent`。

计算机内部实例需要存储：

- 当前元素
- DOM节点
- 所有子级的内部实例，这些子级中的每一个都可以是`DOMComponent`或`CompositeComponent`。

如果你正在努力想象如何在更复杂的应用程序中构建内部实例树，[React DevTools](https://github.com/facebook/react-devtools)可以给你一个近似的结果，因为它突显灰色的计算机实例，以及带紫色的复合实例：

![](https://reactjs.org/static/implementation-notes-tree-d96fec10d250eace9756f09543bf5d58-a6f54.png)

为了完成这个重构，我们将引入一个将完整树安装到容器节点的函数，就像`ReactDOM.render()`一样。他返回一个公共实例，也像`ReactDOM.render()`:

```js
function mountTree(element, containerNode) {
  // 创建顶层的内部实例
  var rootComponent = instantiateComponent(element);

  // 挂载顶层的组件到容器
  var node = rootComponent.mount();
  containerNode.appendChild(node);

  // 返回他提供的公共实例
  var publicInstance = rootComponent.getPublicInstance();
  return publicInstance;
}

var rootEl = document.getElementById('root');
mountTree(<App />, rootEl);
```

### 卸载

既然我们有内部实例来保存它们的子节点和DOM节点，那么我们就可以实现卸载。对于复合组件，卸载会调用生命周期方法并进行递归。

```
class CompositeComponent {

  // ...

  unmount() {
    // 必要的时候调用生命周期方法
    var publicInstance = this.publicInstance;
    if (publicInstance) {
      if (publicInstance.componentWillUnmount) {
        publicInstance.componentWillUnmount();
      }
    }

    // Unmount the single rendered component
    var renderedComponent = this.renderedComponent;
    renderedComponent.unmount();
  }
}
```

对于`DOMComponent`,卸载会告诉每个子节点进行卸载:

```js
class DOMComponent {

  // ...

  unmount() {
    // 卸载所有的子级
    var renderedChildren = this.renderedChildren;
    renderedChildren.forEach(child => child.unmount());
  }
}
```

实际上，卸载DOM组件也会删除事件侦听器并清除一些缓存，但我们将跳过这些细节。

我们现在可以添加一个名为`unmountTree(containerNode)`的新顶级函数，它类似于`ReactDOM.unmountComponentAtNode()`:

```js
function unmountTree(containerNode) {
  // 从DOM节点读取内部实例
  // (目前这个不会正常工作， 我们将需要改变mountTree()方法去存储)
  var node = containerNode.firstChild;
  var rootComponent = node._internalInstance;

  // 清除容器并且卸载树
  rootComponent.unmount();
  containerNode.innerHTML = '';
}
```

为了让他工作，我们需要从DOM节点读取内部根实例。我们将修改`mountTree()`以将`_internalInstance`属性添加到DOM根节点。我们还将让`mountTree()`去销毁任何现有树，以便可以多次调用它：

```js
function mountTree(element, containerNode) {
  // 销毁存在的树
  if (containerNode.firstChild) {
    unmountTree(containerNode);
  }

  // 创建顶层的内部实例
  var rootComponent = instantiateComponent(element);

  // 挂载顶层的组件到容器
  var node = rootComponent.mount();
  containerNode.appendChild(node);

  // 保存内部实例的引用
  node._internalInstance = rootComponent;

  // 返回他提供的公共实例
  var publicInstance = rootComponent.getPublicInstance();
  return publicInstance;
}
```

现在，重复运行`unmountTree()`或运行`mountTree()`，删除旧树并在组件上运行`componentWillUnmount()`生命周期方法。

### 更新

在上一节中，我们实现了卸载。但是，如果每个prop更改导致卸载并安装整个树，则React就会显得不是很好用了。协调程序的目标是尽可能重用现有实例来保留DOM和状态：

```js
var rootEl = document.getElementById('root');

mountTree(<App />, rootEl);
// 应该重用存在的DOM
mountTree(<App />, rootEl);
```

我们将使用另一种方法扩展我们的内部实例。除了`mount()`和`unmount()`之外，`DOMComponent`和`CompositeComponent`都将实现一个名为`receive(nextElement)`的新方法：

```js
class CompositeComponent {
  // ...

  receive(nextElement) {
    // ...
  }
}

class DOMComponent {
  // ...

  receive(nextElement) {
    // ...
  }
}
```

它的任务是尽一切可能使组件（及其任何子组件）与nextElement提供的描述保持同步。

这是经常被描述为“虚拟DOM区别”的部分，尽管真正发生的是我们递归地遍历内部树并让每个内部实例接收更新。

### 更新复合组件

当复合组件接收新元素时，我们运行`componentWillUpdate()`生命周期方法。

然后我们使用新的props重新渲染组件，并获取下一个渲染元素：

```js
class CompositeComponent {

  // ...

  receive(nextElement) {
    var prevProps = this.currentElement.props;
    var publicInstance = this.publicInstance;
    var prevRenderedComponent = this.renderedComponent;
    var prevRenderedElement = prevRenderedComponent.currentElement;

    // 更新自有的元素
    this.currentElement = nextElement;
    var type = nextElement.type;
    var nextProps = nextElement.props;

    // 弄清楚下一个render()的输出是什么
    var nextRenderedElement;
    if (isClass(type)) {
      // 类组件
      // 必要的时候调用生命周期
      if (publicInstance.componentWillUpdate) {
        publicInstance.componentWillUpdate(nextProps);
      }
      // 更新props
      publicInstance.props = nextProps;
      // Re-render
      nextRenderedElement = publicInstance.render();
    } else if (typeof type === 'function') {
      // 函数式组件
      nextRenderedElement = type(nextProps);
    }

    // ...
```

接下来，我们可以查看渲染元素的`type`。如果自上次渲染后`type`未更改，则下面的组件也可以在之前的基础上更新。

例如，如果第一次返回`<Button color =“red"/>`，第二次返回`<Button color =“blue"/>`，我们可以告诉相应的内部实例`receive()`下一个元素：

```js
	// ...

    // 如果渲染的元素类型没有改变,
    // 重用现有的组件实例
    if (prevRenderedElement.type === nextRenderedElement.type) {
      prevRenderedComponent.receive(nextRenderedElement);
      return;
    }

    // ...
```

但是，如果下一个渲染元素的类型与先前渲染的元素不同，我们无法更新内部实例。`<button />`不可能变成`<input />`。

相反，我们必须卸载现有的内部实例并挂载与呈现的元素类型相对应的新实例。例如，当先前呈现`<button />`的组件呈现`<input />`时，会发生这种情况：

```js
	// ...

	// 如果我们到达了这一点，那么我们就需要卸载之前挂载的组件
	// 挂载新的一个，并且交换他们的节点

	// 找到旧的节点，因为我们需要去替换他
    var prevNode = prevRenderedComponent.getHostNode();

	// 卸载旧的子级并且挂载新的子级
    prevRenderedComponent.unmount();
    var nextRenderedComponent = instantiateComponent(nextRenderedElement);
    var nextNode = nextRenderedComponent.mount();

    // 替换对子级的引用
    this.renderedComponent = nextRenderedComponent;

	// 新的节点替换旧的
	// 记住：下面的代码是特定于平台的，理想情况下是在CompositeComponent之外的
    prevNode.parentNode.replaceChild(nextNode, prevNode);
  }
}
```

总而言之，当复合组件接收到新元素时，它可以将更新委托给其呈现的内部实例，或者卸载它并在其位置安装新的实例。

在另一个条件下，组件将重新安装而不是接收元素，即元素的`key`已更改。我们不讨论本文档中的`key`处理，因为它为原本就很复杂的教程增加了更多的复杂性。

请注意，我们需要将一个名为`getHostNode()`的方法添加到内部实例协定中，以便可以在更新期间找到特定于平台的节点并替换它。它的实现对于两个类都很简单：

```js
class CompositeComponent {
  // ...

  getHostNode() {
    // 请求渲染的组件提供他
    // 这将向下递归复合组件
    return this.renderedComponent.getHostNode();
  }
}

class DOMComponent {
  // ...

  getHostNode() {
    return this.node;
  }  
}
```

### 更换计算机组件

计算机组件实现，例如`DOMComponent`, 以不同方式更新。当他们收到元素时，他们需要更新底层特定于平台的视图。在React DOM的情况下，这意味着更新DOM属性：

```js
class DOMComponent {
  // ...

  receive(nextElement) {
    var node = this.node;
    var prevElement = this.currentElement;
    var prevProps = prevElement.props;
    var nextProps = nextElement.props;    
    this.currentElement = nextElement;

    // 移除旧的属性
    Object.keys(prevProps).forEach(propName => {
      if (propName !== 'children' && !nextProps.hasOwnProperty(propName)) {
        node.removeAttribute(propName);
      }
    });
    // 设置接下来的属性
    Object.keys(nextProps).forEach(propName => {
      if (propName !== 'children') {
        node.setAttribute(propName, nextProps[propName]);
      }
    });

    // ...
```

然后，计算机组件需要更新他们的子组件。与复合组件不同，它们可能包含多个子组件。

在这个简化的示例中，我们使用内部实例数组并对其进行迭代，根据接收的类型是否与之前的类型匹配来更新或替换内部实例。除了插入和删除之外，真正的协调程序还会使用元素的键跟踪移动，但我们将省略此逻辑。

我们在列表中收集子级的DOM操作，以便批量执行它们：

```js
	// ...

    // 这个是React elements数组
    var prevChildren = prevProps.children || [];
    if (!Array.isArray(prevChildren)) {
      prevChildren = [prevChildren];
    }
    var nextChildren = nextProps.children || [];
    if (!Array.isArray(nextChildren)) {
      nextChildren = [nextChildren];
    }
    // 这是内部实例的数组:
    var prevRenderedChildren = this.renderedChildren;
    var nextRenderedChildren = [];

	// 当我们迭代子级的时候，我们将会添加操作到数组
    var operationQueue = [];

	//注意：下面的部分非常简单！
	//它的存在只是为了说明整个流程，而不是细节。

    for (var i = 0; i < nextChildren.length; i++) {
      // 尝试获取此子级的现有内部实例
      var prevChild = prevRenderedChildren[i];

      // 如果这个索引下不存在内部实例，那就把子级被追加到后面。
      // 创建一个新的内部实例，挂载他并使用他的节点
      if (!prevChild) {
        var nextChild = instantiateComponent(nextChildren[i]);
        var node = nextChild.mount();

        // 记录我们需要追加的节点
        operationQueue.push({type: 'ADD', node});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // 我们可以只更新元素类型匹配的实例(下面是元素类型相同)
      // 例如 <Button size='small' />可以被更新成<Button size='large' />
      // 但是不可以更新成<App />(即元素类型不匹配)
      var canUpdate = prevChildren[i].type === nextChildren[i].type;

      // 如果不能更新这个存在的实例，那么我们必须移除他
      // 并且挂载一个新的去代替他
      if (!canUpdate) {
        var prevNode = prevChild.getHostNode();
        prevChild.unmount();

        var nextChild = instantiateComponent(nextChildren[i]);
        var nextNode = nextChild.mount();

        // 记录我们需要交换的节点
        operationQueue.push({type: 'REPLACE', prevNode, nextNode});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // 如果我们可以更新一个存在的内部实例
      // 只需要让他接收下一个元素并且处理他自己的更新
      prevChild.receive(nextChildren[i]);
      nextRenderedChildren.push(prevChild);
    }

	// 最后卸载不存在的元素的子级
    for (var j = nextChildren.length; j < prevChildren.length; j++) {
      var prevChild = prevRenderedChildren[j];
      var node = prevChild.getHostNode();
      prevChild.unmount();

      // 记录我们需要移除的节点
      operationQueue.push({type: 'REMOVE', node});
    }

	// 将渲染的子级列表指到更新的版本里
    this.renderedChildren = nextRenderedChildren;

    // ...
```

作为最后一步，我们执行DOM操作。同样，真正的协调代码更复杂，因为它也处理移动：

```js
	// ...

    // Process the operation queue.
    while (operationQueue.length > 0) {
      var operation = operationQueue.shift();
      switch (operation.type) {
      case 'ADD':
        this.node.appendChild(operation.node);
        break;
      case 'REPLACE':
        this.node.replaceChild(operation.nextNode, operation.prevNode);
        break;
      case 'REMOVE':
        this.node.removeChild(operation.node);
        break;
      }
    }
  }
}
```

这就是更新计算机组件(DOMComponent)

### 顶层更新

现在`CompositeComponent`和`DOMComponent`都实现了`receive(nextElement)`方法，我们可以更改顶级`mountTree()`函数，以便在元素类型与上次相同时使用它：

```js
function mountTree(element, containerNode) {
  // 检查存在的树
  if (containerNode.firstChild) {
    var prevNode = containerNode.firstChild;
    var prevRootComponent = prevNode._internalInstance;
    var prevElement = prevRootComponent.currentElement;

    // 如果我们可以，复用存在的根组件
    if (prevElement.type === element.type) {
      prevRootComponent.receive(element);
      return;
    }

    // 其他的情况卸载存在的树
    unmountTree(containerNode);
  }

  // ...

}
```

现在以相同的类型调用`mountTree()`两次，不会有破坏性的更新了:

```js
var rootEl = document.getElementById('root');

mountTree(<App />, rootEl);
// Reuses the existing DOM:
mountTree(<App />, rootEl);
```

这些是React内部工作原理的基础知识。

### 我们遗漏了什么

与真实代码库相比，本文档得到了简化。我们没有解决几个重要方面：

- 组件可以呈现`null`，并且协调程序可以处理数组中的“空”并呈现输出。
- 协调程序还从元素中读取`key`，并使用它来确定哪个内部实例对应于数组中的哪个元素。实际React实现中的大部分复杂性与此相关。
- 除了复合和计算机内部实例类之外，还有“text”和“empty”组件的类。它们代表文本节点和通过呈现`null`获得的“空槽”。
- 渲染器使用[注入](https://reactjs.org/docs/codebase-overview.html#dynamic-injection)将计算机内部类传递给协调程序。例如，`React DOM`告诉协调程序使用`ReactDOMComponent`作为计算机内部实例实现。
- 更新子项列表的逻辑被提取到名为`ReactMultiChild`的`mixin`中，它由`React DOM`和`React Native`中的计算机内部实例类实现使用。
- 协调程序还在复合组件中实现对`setState()`的支持。事件处理程序内的多个更新将被批处理为单个更新。
- 协调器还负责将引用附加和分离到复合组件和计算机节点。
- 在DOM准备好之后调用的生命周期方法（例如`componentDidMount()`和`componentDidUpdate()`）将被收集到“回调队列”中并在单个批处理中执行。
- React将有关当前更新的信息放入名为“transaction”的内部对象中。transaction对于跟踪待处理生命周期方法的队列、警告当前DOM的嵌套以及特定更新的“全局”其他任何内容都很有用。事务还确保React在更新后“清理所有内容”。例如，`React DOM`提供的事务类在任何更新后恢复输入选择。

### 进入代码

- [ReactMount](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/dom/client/ReactMount.js)是本教程中的`mountTree()`和`unmountTree()`之类的代码。他负责安装和卸载顶层的组件。[`ReactNativeMount`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/native/ReactNativeMount.js)是React Native的模拟。
- [`ReactDOMComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/dom/shared/ReactDOMComponent.js)等同于本教程中的`DOMComponent`。它实现了React DOM渲染器的计算机组件类。[`ReactNativeBaseComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/native/ReactNativeBaseComponent.js)是对React Native的模拟。
- [`ReactCompositeComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js)是等同于本教程中的`CompositeComponent`。他处理用户自定义的组件并维护状态。
- [`instantiateReactComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/instantiateReactComponent.js)用于选择要为元素构造的内部实例类。它等同于本教程中的`instantiateComponent()`。
- [`ReactReconciler`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactReconciler.js)里是`mountComponent()`,`receiveComponent()`, `unmountComponent()`方法。它调用内部实例上的底层实现，但也包括一些由所有内部实例实现共享的代码。
- [`ReactChildReconciler`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactChildReconciler.js)实现独立于渲染器处理子级的插入，删除和移动的操作队列。
- 由于遗留原因，`mount()`，`receive()`和`unmount()`在React代码库中实际上称为`mountComponent()`，`receiveComponent()`和`unmountComponent()`，但它们接收元素。
- 内部实例上的属性以下划线开头，例如`_currentElement`。它们被认为是整个代码库中的只读公共字段。

### 未来的发展方向

堆栈协调器(stack reconciler)具有固有的局限性，例如同步并且无法中断工作或将其拆分为块。[新的 Fiber reconciler](https://reactjs.org/docs/codebase-overview.html#fiber-reconciler)正在进行中(笔：当然，大家都知道，目前已经完成了)，他们有[完全不同的架构](https://github.com/acdlite/react-fiber-architecture)。在未来，我们打算用它替换堆栈协调程序，但目前它远非功能校验。

### 下一步

阅读[下一节](https://github.com/xiaohesong/TIL/blob/master/front-end/react/react%E7%9A%84%E8%AE%BE%E8%AE%A1%E5%8E%9F%E5%88%99.md)，了解我们用于React开发的指导原则。

原文： [Implementation Notes](https://reactjs.org/docs/implementation-notes.html#video-building-react-from-scratch)
