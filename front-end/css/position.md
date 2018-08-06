首先说到内容，得先从float说起。

### float

他会改变元素的正常流，而且会改变元素的display属性，比如inline的元素加上float之后会变成block,可设置宽高。
他也会形成一个BFC(块级格式化上下文), 需要在下面的正常流中[移除他](https://codepen.io/shayhowe/pen/utfmw)， [css布局可以参考这篇文章](https://www.smashingmagazine.com/2018/05/guide-css-layout/)

清除浮动有两种方式。
- 无父级容器

  针对具体的元素进行浮动，但是这个需要在后续的正常的流中清除。
- 容器

  使用一个父级容器包含浮动的元素，在父级元素上清除浮动的影响。
  ```css
  .parent:before,
  .parent:after {
    content: "";
    display: table;
  }
  .parent:after {
    clear: both;
  }
  .parent {
    clear: both;
    *zoom: 1;
  }
  ```
  
### inline-block

这个直接在元素中实用就可以，不过有点需要注意，因为inline-block是显示在同一行上，所以元素之间存在空白，去除空白也有很多情况.


### relative

这个是相对定位，对于定位的偏移，会保持原始空间位置， 该定位相对于正常流进行定位。

### absolute

这个是绝对定位，对于定位的偏移，不会保留原始空间位置，并且该定位是根据最近的一个相对定位父元素进行绝对定位。如果不存在相对定位的父元素，那就会更具body进行定位。

