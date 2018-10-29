# React Components, Elements, and Instances

## Elements Describe the Tree
在`react`中，**元素(element)就是描述组件实例或DOM节点及其所需属性的普通对象。** 它仅包含有关组件类型（例如，`Button`组件），
其属性（例如，颜色）以及其中的任何子元素的信息。

并且元素也不是实际的组件实例。相反，它是一种告诉React你想在屏幕上看到什么的方法。
你不能在元素上调用任何方法。它只是一个带有两个字段的不可变描述对象：`type: (string | ReactClass) && props: Object1`。


### DOM Elements

当元素(`element`)的类型是字符串时，它表示具有该标记名称的`DOM`节点，并且`props`对应其属性。这就是`React`将呈现的内容。例如：
```js
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}
```
此`element`只是将以下`HTML`表示为普通对象的一种方法:
```html
<button class='button button-blue'>
  <b>
    OK!
  </b>
</button>
```

请注意元素如何嵌套。按照惯例，当我们想要创建一个元素树时，我们将一个或多个子元素指定为其包含元素的`children prop`。

重要的是，子元素和父元素都只是描述而不是实际的实例。

`React`元素很容易遍历，不需要解析，当然它们比实际的`DOM`元素轻得多 - **它们只是对象!**

### Component Elements
我们知道，元素的类型(type)也可以是与React组件对应的函数或类：
```js
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}
```
**这是`react`的核心理念** 

**描述组件的元素也是一个元素，就像描述DOM节点的元素一样。它们可以嵌套并相互混合。**

此功能可以将`DangerButton`组件定义为具有特定颜色属性值的`Button`，而无需担心`Button`是否呈现为`DOM <button>`，`<div>`或其他的标签：
```js
const DangerButton = ({ children }) => ({
  type: Button,
  props: {
    color: 'red',
    children: children
  }
});
```
也可以在一个元素树中匹配`dom`或者`component`的元素。如下:
```js
const DeleteAccount = () => ({
  type: 'div',
  props: {
    children: [{
      type: 'p',
      props: {
        children: 'Are you sure?'
      }
    }, {
      type: DangerButton,
      props: {
        children: 'Yep'
      }
    }, {
      type: Button,
      props: {
        color: 'blue',
        children: 'Cancel'
      }
   }]
});
```
或者可以用你`jsx`的形式：
```js
const DeleteAccount = () => (
  <div>
    <p>Are you sure?</p>
    <DangerButton>Yep</DangerButton>
    <Button color='blue'>Cancel</Button>
  </div>
);
```

### Components Encapsulate Element Trees
当`React`看到一个具有函数(function)或类(class)类型的元素(element)时，它知道在给定相应的props的情况下向该组件询问它呈现的元素。

比如他看到这么一个元素:
```js
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}
```
`React`会询问`Button`渲染什么。然后`Button`会返回一个元素告诉他：
```js
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}
```
`React`将重复此过程，直到它知道页面上每个组件的底层DOM元素都被标记。

`React`就像一个孩子，问你每个'X是Y'的'Y是什么'，你向他们解释，直到他们弄清楚世界上的每一件小事。

还记得上面的表单示例吗？它可以用React编写如下：
```js
const Form = ({ isSubmitted, buttonText }) => {
  if (isSubmitted) {
    // Form submitted! Return a message element.
    return {
      type: Message,
      props: {
        text: 'Success!'
      }
    };
  }

  // Form is still visible! Return a button element.
  return {
    type: Button,
    props: {
      children: buttonText,
      color: 'blue'
    }
  };
};
```

**对于`React`组件，`props`是输入，`元素树`是输出。**

**返回的元素树可以包含描述DOM节点的元素和描述其他组件的元素。这使得可以在不依赖于其内部DOM结构的情况下组成UI的独立部分。**

我们让`React`创建，更新和销毁实例。并且使用从组件返回的元素来描述它们，`React`负责管理实例。


### Components Can Be Classes or Functions
在上面的例子中，`Form`, `Message`, `Button`都是组件。我们可以把它用`function`的方式展现，就像上面的那样，也可以使用`class`继承自`React.Component`。声明组件的三种方式，可以像下面这样:
```js
// 1) As a function of props
const Button = ({ children, color }) => ({
  type: 'button',
  props: {
    className: 'button button-' + color,
    children: {
      type: 'b',
      props: {
        children: children
      }
    }
  }
});

// 2) Using the React.createClass() factory
const Button = React.createClass({
  render() {
    const { children, color } = this.props;
    return {
      type: 'button',
      props: {
        className: 'button button-' + color,
        children: {
          type: 'b',
          props: {
            children: children
          }
        }
      }
    };
  }
});

// 3) As an ES6 class descending from React.Component
class Button extends React.Component {
  render() {
    const { children, color } = this.props;
    return {
      type: 'button',
      props: {
        className: 'button button-' + color,
        children: {
          type: 'b',
          props: {
            children: children
          }
        }
      }
    };
  }
}
```
将组件定义为类时，它比功能组件更强大。它可以存储一些本地状态，并在创建或销毁相应的`DOM`节点时执行自定义方法逻辑。

函数组件功能较弱但更简单，并且只使用一个`render`方法。除非需要仅在`class`中提供的功能，否则建议使用`function`组件。

**无论是函数还是类，从根本上说它们都是`React`的组件。他们将`props`作为输入，并将元素作为输出返回。**

### Top-Down Reconciliation

当我们调用下面代码时:
```js
ReactDOM.render({
  type: Form,
  props: {
    isSubmitted: false,
    buttonText: 'OK!'
  }
}, document.getElementById('root'));
```
`react`会根据给定的`props`询问`Form`组件返回什么元素树。
```js
// React: 你告诉我这个
{
  type: Form,
  props: {
    isSubmitted: false,
    buttonText: 'OK!'
  }
}

// React: Form告诉我这个
{
  type: Button,
  props: {
    children: 'OK!',
    color: 'blue'
  }
}

// React: Button告诉我这个，此时预测已经结束。
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}
```
这个是`React`[和解](https://github.com/xiaohesong/TIL/blob/master/front-end/react/reconciliation.md)过程中的一部分，并且这个是在调用[ReactDOM.render](https://reactjs.org/docs/react-dom.html#render)或[setState](https://reactjs.org/docs/react-component.html#setstate)时触发的。

在和解结束后，`React`会知道`DOM`树结果，并且像`react-dom`或`react-native`这样的渲染器应用，以最小的更改集去更新`DOM`节点（或者在`React Native`的情况下，特定于平台的视图） 。

这种渐进的精炼过程也是`React`应用程序易于优化的原因。如果组件树的某些部分变得太大而`React`无法有效访问，就可以告诉它[跳过这个“精炼”并在相关`props`未更改的情况下区分树的某些部分。](https://reactjs.org/docs/optimizing-performance.html)如果它们是[不可变](https://anhuiliujun.github.io/javascript/2016/12/02/javascript-mutable.html)的，那么计算`props`是否已经改变是非常快的，因此`React`和`immutability`可以很好地协同工作，并且可以用最小的努力提供很好的优化。

你可能已经注意到，此博客条目对组件和元素进行了大量讨论，而不是实例。事实上，实例在`React`中的重要性远远低于大多数面向对象的`UI`框架。

只有声明为类的组件才有实例，而且你永远不会直接创建它们：`React`会为你做这件事。虽然存在[父组件实例访问子组件实例的机制](https://reactjs.org/docs/refs-and-the-dom.html)，但它们仅用于命令性操作（例如将焦点设置在字段上），并且通常应该避免。

`React`负责为每个类组件创建一个实例，因此您可以使用方法和本地状态以面向对象的方式编写组件，但除此之外，实例在`React`的编程模型中并不是非常重要，并且由`React`本身管理。


## 总结
元素是一个普通对象，用于描述您希望在`DOM`节点或其他组件方面在屏幕上显示的内容。元素可以在其道具中包含其他元素。创建`React`元素很简单。一旦创建了一个元素，它就永远不会发生改变。

`组件`可以用几种不同的声明方式。它可以是一个带有`render`方法的类。或者，在简单(你可以认为是没有状态)的情况下，可以将其定义为函数。在任何一种情况下，它都将`props`作为输入，并返回一个元素树作为输出。

当一个组件接收一些`props`作为输入时，这是因为一个特定的父组件返回了一个元素及其类型和这些`props`。这就是人们说`props`在`React`中以一种方式流动的原因：从父母到孩子。

在编写的组件类中，`this`就是指的实例。它对于[存储本地状态和对生命周期事件做出反应](https://reactjs.org/docs/react-component.html)非常有用。

功能组件根本没有实例。类组件有实例，但您永远不需要直接创建组件实例--`React`负责这一点。

最后，要创建元素，请使用[`React.createElement`](https://reactjs.org/docs/react-api.html#createelement)，[`JSX`](https://reactjs.org/docs/jsx-in-depth.html)或[元素工厂助手](https://reactjs.org/docs/react-api.html#react.createfactory)。不要在真实代码中将元素写为普通对象 - 只要知道它们是引擎盖下的普通对象。

## 扩展阅读
- [介绍React Elements](https://reactjs.org/blog/2014/10/14/introducing-react-elements.html)
- [精简React Elements](https://reactjs.org/blog/2015/02/24/streamlining-react-elements.html)
- [React 术语](https://reactjs.org/docs/glossary.html)


[本文doc地址](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)
