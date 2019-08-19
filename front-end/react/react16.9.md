react16.9发布有几天了，由于这几天在搞爬虫，没有好好的看，今天特此来记录下。

## 新的弃用

我们知道在16.3的时候，有较大的改动，生命周期的变得，其中有重命名几个声明周期`UNSAFE_componentWillMount`, `UNSAFE_componentWillReceiveProps`, `UNSAFE_componentWillUpdate`，并且这三个重命名之前的名字将在17.0版本移除，所以在16.9里，**没有破坏性的更变，名称依旧可以使用。** 但是使用旧名称会有warn提示。

如果你的项目庞大，不想手动修改这几个生命周期方法，可以使用脚本来执行。

```shell
cd your_project
npx react-codemod rename-unsafe-lifecycles
```

### 弃用`javascript:` URLs

以javascript开头的网址是一个危险的攻击面，因为很容易在`<a href>`等标记中意外创建一个安全漏洞：

```js
const userProfile = {
  website: "javascript: alert('you got hacked')",
};
// This will now warn:
<a href={userProfile.website}>Profile</a>
```

**React16.9中** ，这个仍然可以使用，但是会提示warn。推荐使用react事件处理程序，如果你固执的要使用这个，那就使用[`dangerouslySetInnerHTML`](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)，这是你唯一的选择了。

**在未来的主要版本中**， React将在这种情况下抛出一个错误。

### 弃用"Factory"组件

React之前是支持工厂组件的，他返回一个包含`render`签名的对象。

这种模式几乎没有怎么使用过，并且支持这种也会减慢的应用。所以在16.9中弃用这个模式，并且会对这种情况加上warn。如果你依赖了这种模式，`FactoryComponent.prototype = React.Component.prototype`可以作为一种解决方案，实在不行，就转换成类组件或者函数组件。

## 新的功能特性

### 用于测试的异步[`act()`](https://reactjs.org/docs/test-utils.html#act)

[React 16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html)引入了名为 [`act()`](https://reactjs.org/docs/test-utils.html#act) 的测试工具，他更贴合浏览器的行为。比如在act内多个状态的更新会被批处理。

但是16.8中仅支持同步的函数，**React 16.9，act() 也接受异步的函数。** 使用await:

```js
await act(async () => {
  // ...
});
```

### 使用[`React.Profiler `](https://reactjs.org/docs/profiler.html)进行性能测量

在react15的时候有提到 [React Profiler for DevTools](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)可以用来测量性能问题。**React16.9中，添加了以编程方式测量的发自。** 小项目可能会用不到，但是复杂的项目可能会很有帮助。

`<Profiler>`测量React应用程序渲染的频率以及渲染的“成本”。主要是识别一些可以[用记忆化(memoization)优化](https://reactjs.org/docs/hooks-faq.html#how-to-memoize-calculations)的内容。

> [useMemo](https://github.com/xiaohesong/TIL/blob/master/front-end/react/useMemo.md)

`<Profiler>`可以添加在React树的任何地方去记录。他需要两个props：`id`(string)和 [`onRender` callback](https://reactjs.org/docs/profiler.html#onrender-callback)(函数)，当组件提交更新时调用这个Profiler。

```jsx
render(
  <Profiler id="application" onRender={onRenderCallback}>
    <App>
      <Navigation {...props} />
      <Main {...props} />
    </App>
  </Profiler>
);
```

> 这货会增加额外的消耗，在build正式包的时候，避免使用。

## 值得注意的bug修复

- [修复了](https://github.com/facebook/react/pull/15312)在`<Suspense>`中调用`findDOMNode()`时发生崩溃的问题。
- 保留删除的子树导致的内存泄漏也已[得到修复](https://github.com/facebook/react/pull/16115)。
- `useEffect`中`setState`引起的无限循环问题，现在是打印错误。 (这类似于在类中的`componentDidUpdate`中调用`setState`时看到的错误。)

## 更新计划

在[2018 11月份](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html)的时候，有提到过16.x版本的发布计划：

- 带有React Hooks的小型16.x版本(之前估计：2019年第一季度)。
- 带有并发模式的16.x版本(之前估计: 2019年第二季度)。
- 带有为获取数据而用的Suspense (之前估计：2019年中)

之前的这些估计过于乐观，要往后调整了。

简而言之，按期发布了Hooks版本，但是后面的两个将延期。

2月份，[发布了一个稳定的16.8版本](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html)，包括React Hooks，[一个月后](https://facebook.github.io/react-native/blog/2019/03/12/releasing-react-native-059)React Native支持。

> 为什么是一个月后？[**How-Does-setState-Know-What-to-Do**](https://github.com/xiaohesong/TIL/blob/master/front-end/react/overreact/How-Does-setState-Know-What-to-Do.md) :
>
> > 但是，与React DOM不同，React的版本更新不会迫使React Native的版本去立即更新。他有一个自己的发布周期。几周后，更新过的`renderer`会单独同步到React Native库中。**这就是为什么React Native和React DOM可用功能的时间不一致的区别**

由于hooks引发的效应才导致后面的工作延期，目前[新的Facebook网站](https://twitter.com/facebook/status/1123322299418124289)会基于这些功能建立。

总之就是，React团队有信息发布后面的稳定版本。

## 安装

```shell
yarn add react@^16.9.0 react-dom@^16.9.0
```

或者npm安装

```js
npm install --save react@^16.9.0 react-dom@^16.9.0
```

当然，也可以直接CDN加载：

```html
<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
```

## 更新日志

你可以[查看这里](https://reactjs.org/blog/2019/08/08/react-v16.9.0.html#changelog)了解更详细的更新日志。
