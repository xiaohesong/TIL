你可能认为你在写`JSX `:
```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```
但是实际上是你在调用一个函数:
```js
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```
这个函数给你返回了一个对象，我们把这个对象叫做React元素。它告诉React接下来渲染什么，组件就是返回对象🌲。
```js
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐 Who dis
}
```
像上面这样，如果你使用React你可能熟悉`type, props, key, ref`这些字段。**但是`$$typeof`是什么？为什么会有个`Symbol`作为值？**

这个也是你在写`react`的时候不需要知道的一件事，但是如果你知道了，那感觉会很棒。在这篇文章中还有一些你可能想知道的安全性的提示。也许有一天你会编写自己的UI库，所有这些都会派上用场。我希望是这样的。
***
在客户端UI库变得普遍并添加一些基本保护之前，应用程序代码通常构造`HTML`并将其插入`DOM`：
```js
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```
这就可以了，除非当`message.text`是像`'<img src onerror="stealYourPassword()">'`这样的时候。 **你不希望陌生人编写的内容显示在应用程序呈现的HTML中。**

(有趣的事实：如果你只做客户端渲染，这里的<script>标签不会让你运行JavaScript。但是，[不要让这使你](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/)陷入虚假的安全感。)

为了防止此类攻击，你可以使用安全的`API`，例如`document.createTextNode`或`textContent`，它只处理文本。你还可以通过在用户提供的文本中替换`<，>`等其他潜在危险字符来抢先“转义”输入。

尽管如此，错误的成本很高，每次将用户编写的字符串插入输出时，记住它都很麻烦。**这就是为什么像React这样的现代库在默认的情况下为字符串转义文本内容的原因：**
```html
<p>
  {message.text}
</p>
```
如果`message.text`是带有`<img>`或其他的标签，则它不会变成真正的`<img>`标签(tag)。React将转义内容，然后将其插入`DOM`。所以你应该看标记而不是看`img`标签。

要在React元素中呈现任意`HTML`，你必须写`dangerouslySetInnerHTML = {{__ html：message.text}}`。**然而事实上，这么笨拙的写法是一个功能。** 它意味着高度可见，便于在代码审查和代码库审计中捕获它。

***

**这是否意味着React对于注入攻击是完全安全的？不是。**  `HTML`和`DOM`提供了大量的攻击面，对于React或其他UI库来说，要缓解这些攻击面要么太难要么太慢。大多数剩余的攻击都偏向于属性上进行。 例如，如果渲染`<a href={user.website}>`，请注意其`user.website`可能是“javascript：stealYourPassword()”。像`<div {... userData}>`那样扩展用户的输入很少见，但也很危险。

React[可以](https://github.com/facebook/react/issues/10506)随着时间的推移提供更多保护，但在许多情况下，这些都是服务器问题的结果，无论如何都[应该](https://github.com/facebook/react/issues/3473#issuecomment-91327040)在那里修复。

仍然，转义文本内容是合理的第一道防线，可以捕获大量潜在的攻击。知道像这样的代码是安全的，这不是很好吗？

```js
// Escaped automatically
<p>
  {message.text}
</p>
```
**好吧，这也不总是正确的。** 这时候就需要派`$$typeof`上场了。
***
React的`elements`在设计的时候就决定是一个对象。
```js
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```
虽然通常使用`React.createElement`创建它们，但它不是必要的。React有一些有效的用例来支持像我刚刚上面所做的那样编写的普通元素对象。当然，你可能不希望像这样编写它们 - 但这[对于](https://github.com/facebook/react/pull/3583#issuecomment-90296667)优化编译器，在工作程序之间传递UI元素或者将JSX与React包解耦是有用的。

但是，**如果你的服务器有一个漏洞，允许用户存储任意JSON对象，** 而客户端代码需要一个字符串，这可能会成为一个问题：
```js
// Server could have a hole that lets user store JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* put your exploit here */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// Dangerous in React 0.13
<p>
  {message.text}
</p>
```
在这种情况下，React 0.13很[容易](http://danlec.com/blog/xss-via-a-spoofed-react-element)受到`XSS`攻击。再次澄清一下，**这种攻击取决于现有的服务器漏洞。** 尽管如此，React可以做到更好，防止遭受它攻击。从React 0.14开始，它做到了。

React 0.14中的修复是[使用Symbol标记每个React元素](https://github.com/facebook/react/pull/4832)：
```js
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```
这是有效的，因为你不能只把`Symbol`放在`JSON`中。因此，即使服务器具有安全漏洞并返回`JSON`而不是文本，该`JSON`也不能包含`Symbol.for('react.element')`。React将检查`element.$$ typeof`，如果元素丢失或无效，将拒绝处理该元素。

并且使用`Symbol.for`的好处是符号在`iframe`和`worker`等环境之间是全局的。因此，即使在更奇特的条件下，此修复也不会阻止在应用程序的不同部分之间传递可信元素。同样，即使页面上有多个React副本，它们仍然可以继续工作。
***
那些[不支持Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility)的浏览器呢？

好吧，他们没有得到这种额外的保护。 React仍然在元素上包含`$$ typeof`字段以保持一致性，但它[设置为一个数字](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16) - 0xeac7。

为什么是个具体的号码？ 0xeac7看起来有点像“React”。


### 阅读之后的尝试
下面就是个人对于`$$typeof`的测试。

```js
class Example extends React.Component {
  state = {
    show: null
  }

  componentDidMount() {
    const show = JSON.parse(JSON.stringify(<button className='custom'>'click me'</button>))
    show.$$typeof = Symbol.for('react.element') // 你试试没有这行的效果
    this.setState({show})
  }
  
  render(){
    return this.state.show
  }
}

export default Example
```
这是为什么？因为上面的代码在`JSON.stringify`处理之后，`symbol`值会被忽略，所以需要手动加上。你可以试试加与不加的区别。

其实这个`$$typeof`主要就是像上文阐述的，为了防止后端的`bug`。比如数据库`user`表下面有个`name`字段，正常的`react`展示会像下面这样:

```js
render() {
  const {user} = this.state 
  return <span>{user.name}</span>
}
```
上面的`jsx`代码等同于下面的[createElement方式](https://reactjs.org/docs/react-api.html#createelement):
```js
render() {
  const {user} = this.state 
  return(
    React.createElement('span', null, user.name)
  )
}
```

如果这个`name`是一个`json`，我们知道`createElement`的第三个参数是一个`children`，他可以是组件，那么这个对象就会被当做是组件，所以加上了这个。

让我们来试试吧:
```js
class Example extends React.Component {
  state = {
    show: null
  }

  componentDidMount() {
    let obj = {type: 'button', ref: null, key: null, props: {children: 'i am children'}} //用户恶意模拟一个element
    obj.$$typeof = Symbol.for('react.element') // 如果没有这个去验证，就直接被当做一个children去处理了
    const show = <button className='custom'>{obj}</button>
    this.setState({show})
  }
  
  render(){
    return this.state.show
  }
}

export default Example
```

推荐看看[React component, elements and instance](https://github.com/xiaohesong/TIL/blob/master/front-end/react/component-element-instance.md)
