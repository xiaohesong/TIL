- `setState`

今天发现有很多文章在说`setState`的坑,吐槽之声也不少.其实我就碰到过一个.
#### `setState`不会立即改变数据

```javascript
// name is ""
this.setState({
    name: "name"
})
console.log(`name is ${this.state.name}`)
```
这段代码没有按我的预料输出`name`.

所以如果需要获取,就需要在回调函数里去做.

```javascript
this.setState({
    name: "name"
}, () => {
  console.log(`name is ${this.state.name}`)
})
```
这样才会如你所预料那般的输出.

对于上面的这个问题倒是还好.因为`setState`是放在一个队列里异步去处理的, 所以在没有成功改变之前,输出的就是之前的值.
在回调里显示正确的数据,那是因为`callback`的原因.

#### `setState`多次,`re-render`一次

这个是我始料未及的了,我一直以为每次`setState`都会造成一次`re-render`.其实并不是这样.

```javascript
componentDidMount(){
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 1
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 2
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 3
  this.setState({name: "xiaohesong"}) // 4
}

render(){
  console.log("render")
  return(<h1>SetState</h1>)
}
```
可以发现,这里只会出现`render`两次,而不是想象中的`4`+`1`(初始化的`render`).
WTF! Why?

好吧,还是得寻找原因不是?

我们之前说他是塞进一个队列里去做异步的处理的,就是说他是把我们这`4`个`setState`操作放到了一个队列里,然后batch操作.啥啥啥?恩,还是来代码阐述下比较好.

```javascript
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 1
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 2
  this.setState((prevState, props) => ({count: this.state.count + 1})) // 3
  this.setState({name: "xiaohesong"}) // 4
}
```
上面的这段代码里的这四个会被塞进队列里进行批量操作.批量操作?
```javascript
Object.assign(state, {count: this.state.count + 1}, {count: this.state.count + 1}, ..., {name: "xiaohesong"})
```

如果把上面的代码换成异步的呢?
```javascript
componentDidMount(){
    setTimeout(() => {
        this.setState(count: this.state.count + 1)
        this.setState(count: this.state.count + 1)
    })
}
```
可以发现,如果改成这样,也会触发re-render. 可是这是为啥`setTimeout`里的两次`this.state.count`会成功,而不是像上面一样,浅合并成一个呢?
这个还得继续探索.


### 总结

1. `setState`操作,默认情况下是每次调用, 都会`re-render`一次,除非你手动`shouldComponentUpdate`为`false`.
`react`为了减少`rerender`的次数,会进行一个浅合并.将多次`re-render`减少到一次`re-render`.

2. `setState`之后,无法立即获取到`this.state`的值,是因为在`setState`的时候,他只会把操作放到队列里.


#### 参考链接
1. [anhuiliujun react Api之setState与forceUpdate](https://anhuiliujun.github.io/react/2016/12/03/react-setState-forceUpdate.html)
2. [setState() Gate](https://medium.com/javascript-scene/setstate-gate-abc10a9b2d82)
