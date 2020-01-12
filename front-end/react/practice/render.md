至于为什么要把下面的东西记录下来，完全是因为自己平时没有注意到的一些细节原因。

有这么一个场景：

> 我需要渲染一个列表，这个列表不带翻页，点击之后要在这一项的后面打上对勾，标识点击取消与否。

下面看看一个伪代码：

```jsx
import React, {memo} from 'react';

const datas = Array.from({length: 1000}, (item, index) => ({
  id: ++index,
  name: `xiaohesong${index}`,
  age: index
}))

// 写法1
const RenderItem1 = props => {
  const {onSelect, selectedId, item} = props
  return(
    <li onClick={() => onSelect(item.id)}>
      <span>{item.name}</span>
      <span>{item.age}</span>
      <span>{item.id === selectedId ? '选择了这个' : ''}</span>
    </li>
  )
}

// 写法2
const RenderItem2 = memo(props => {
  const {onSelect, selectedId, item} = props
  return(
    <li onClick={() => onSelect(item.id)}>
      <span>{item.name}</span>
      <span>{item.age}</span>
      <span>{item.id === selectedId ? '选择了这个' : ''}</span>
    </li>
  )
})

// 写法3 
const RenderItem3 = memo(props => {
  const {onSelect, selected, item} = props
  return(
    <li onClick={() => onSelect(item.id)}>
      <span>{item.name}</span>
      <span>{item.age}</span>
      <span>{selected ? '选择了这个' : ''}</span>
    </li>
  )
})

export default class Examle extends React.Component {
  state = {
    selectedId: null
  }

  handleSelect = selectedId => this.setState({selectedId})

  render1() {
    return datas.map(item => <RenderItem1 item={item} onSelect={this.handleSelect} selectedId={this.state.selectedId} />)
  }

  render2() {
    return datas.map(item => <RenderItem2 item={item} onSelect={this.handleSelect} selectedId={this.state.selectedId} />)
  }

  render3() {
    return datas.map(item => <RenderItem3 item={item} onSelect={this.handleSelect} selected={item.id === selectedId} />)
  }
}
```

你觉得这几个有什么区别，哪个更好，之前一直没有注意到这个问题。哈哈，如果有疑问，欢迎在issue里留言。
