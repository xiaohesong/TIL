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


