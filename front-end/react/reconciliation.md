这里主要是概述下`react`的和解的一个过程。

# 目录
- [diff算法](diff算法)
  - [不同类型的`Elements`](#不同类型的elements)
  - [同类型的DOM Elements](#同类型的dom-elements)
  - [递归Children](#递归children)
  - [Keys](#keys)
  - [性能建议](#性能建议)

## diff算法
当两个树进行对比时，`react`会首先比较两个树的根元素，根不同，行为上会有所差异。

### 不同类型的`Elements`
每当根元素不同类型时，`React`就会拆除旧树并从头开始构建新树。

拆除树时，旧的`DOM`节点被删除。组件会接收`componentWillUnmount()`方法。
在构建新树时，将新的`DOM`节点插入到`DOM`中。组件会先接收`componentWillMount()`，然后接收`componentDidMount()`。任何与旧树相关的状态都会丢失。
如果根组件被移除且构建新的，那么他的子节点也将被移除。例如:
```javascript
// old
<div>
  <Counter />
</div>

// new
<span>
  <Counter />
</span>
```
这两个在比较的时候，发现根元素不同，那么会移除重新构建，这个时候下面的子节点虽然相同，但是仍然会被移除。

### 同类型的`DOM Elements`
`react`在比较两个相同类型的`DOM elements`的时候，他会去比较属性(`attributes`),如果不同，他会保持底层`Dom`节点，仅仅改变有过变化的属性。例如：
```javascript
// example1
<div className="before" title="stuff" />
<div className="after" title="stuff" />

// example2
<div style={{color: 'red', fontWeight: 'bold'}} />
<div style={{color: 'green', fontWeight: 'bold'}} />
```
example1: 在比较这两个元素时，`React`发现元素相同，检查属性，属性不同，只会在底层`DOM`节点上修改`className`属性.
example2: 这个和`example1`差不多，他也是只会检查的`style`属性不同，只会改变`color`属性，不会改变`fontWeight`.

> #### 在处理玩`DOM`节点之后，`React`会递归子节点进行处理.

### 相同类型的`Component Elements`
当组件更新的时候，组件的实例不会改变，便于维持当前组件的状态。`React`会更新底层组件实例的`props`去匹配新的元素。并且调用实例的`componentWillReceiveProps`和`componentWillUpdate`事件方法。

> #### 然后`render()`方法被调用，并且`diff`算法对先前的结果和新的结果进行递归。

### 递归Children
当`React`在`Dom`节点递归子节点的时候，他会默认的迭代比较两个子节点，并且在有差异时发生改变。这是没有问题的，比如:
```html
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```
这个树的对比，他会首先对比根元素，根元素相同，他会递归子节点进行对比。这时候两个进行对比，相同继续比较下一个，不同就做出改变。
这个例子在比较子节点的时候，他会匹配两个`<li>first</li>`树,匹配两个`<li>second</li>`树，比较第三个树时，发现存在差异，就会做出改变，在这里，他会插入`<li>third</li>`树。 

如果在子节点开始就插入一个树呢？会如何？他会导致性能下降。
如下所示:
```html
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```
这时候对比子节点上的树，他会为每个树的差异做出改变。而不是保留存在的`<li>Duke</li>`和`<li>Villanova</li>`。
所以说，这样做会导致性能的问题。
那该怎么解决呢?继续往下看。

### Keys
当然，`React`团队知道存在这种隐患，所以他们为子节点提供了`key`属性，当存在`key`的时候，他就会在新旧的两个之间用`key`进行对比。
现在我们添加`key`对上面的问题进行改善。
```html
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```
对比的时候，他会知道元素上的`2014`是新的，会去添加。而`2015,2016`也存在，只是移动了。
在这里问个问题，他为什么会记得前后的`keys`？

- `key`的取值范围
  - unique

    这个唯一，是指在当前的孩子里是唯一的，并不是说全局。
  - index

    可以用数组的索引，但是前提是不对树进行重新排序(reorders)。
    为什么？因为组件实例是根据`key`来重新排序的，如果改变来位置，那么索引值也会改变。

### 性能建议
`react`基于上面的假设进行对比。如何和假设不符合，那么会带来性能上的问题。
1. 该算法不会去匹配不同类型组件的子元素，会`re-mount`。所以当你发现你的两个组件有相似的输出的时候，去公用他们成为一个类型。
2. `key`的值应该是稳定的，可预测，唯一的。 不稳定的`key`会导致组件实例和`DOM`节点被不必要的重新创建。甚至有可能丢失组件中的状态。这些对性能是一个挑战。

### [原文链接](https://reactjs.org/docs/reconciliation.html)
### [拓展阅读](https://calendar.perfplanet.com/2013/diff/)

为什么都已经有原文来，自己还看一遍写出来？

> 看一遍的印象，是没有翻译一篇文章的印象深刻的。
