在使用nth-child和nth-of-type的时候，你会不会搞混呢？我们来简单的看下他们怎么使用，以及对应的差异。

## 先看用法

得先知道用法，才能去比较他们的差异。

### nth-child

先来看看nth-child的用法。

- 选择第五个元素

![](https://css-tricks.com/wp-content/uploads/2011/06/5.png)

```css
li:nth-child(5) {
    color: green;   
}
```

要选择第一个元素，可以使用`:first-child`，其实我打赌你也可以修改上面的元素来实现这一点。

- 选择除前五个之外的所有

![img](https://css-tricks.com/wp-content/uploads/2011/06/6-10.png)

```css
li:nth-child(n+6) {
    color: green;   
}
```

如果这里有超过10个元素，它将选择5个后面的所有元素。

- 选择前五个元素

![img](https://css-tricks.com/wp-content/uploads/2011/06/1-5.png)

```css
li:nth-child(-n+5) {
    color: green;   
}
```

- 每四个一组，选择第一个

![img](https://css-tricks.com/wp-content/uploads/2011/06/159.png)

```css
li:nth-child(4n-7) {  /* 或者 4n+1 */
    color: green;   
}
```

- 选择奇数或者偶数

  - 奇数

    ![img](https://css-tricks.com/wp-content/uploads/2011/06/odd.png)

    ```css
    li:nth-child(odd) {
        color: green;   
    }
    ```

  - 偶数

    ​		![img](https://css-tricks.com/wp-content/uploads/2011/06/even.png)

    ```css
    li:nth-child(even) {
        color: green;   
    }
    ```


- 选择最后一个元素

![img](https://css-tricks.com/wp-content/uploads/2011/06/last.png)

```css
li:last-child {
    color: green;
}
```

这里显示第十个，因为我们这里只有十个元素。如果有八个元素，那么小绿球就是第八个。...

- 选择倒数第二个元素

![img](https://css-tricks.com/wp-content/uploads/2011/06/9.png)

```css
li:nth-last-child(2) {
    color: green;
}
```

选择第9个因为我们这里有10个元素，但是如果有30个元素则会选择第29个元素。

#### 动手试试？

[来在线尝试](http://css-tricks.com/examples/nth-child-tester/)



### nth-of-type

`:nth-of-type`允许根据公式根据源顺序选择一个或多个元素。在[CSS选择器第3级规范](http://www.w3.org/TR/selectors/)中，它被定义为“结构伪类”，这意味着它用于根据与父元素和兄弟元素的关系对内容进行样式化。

假设我们有一个无序列表，并希望“斑马条纹”交替列表项：

```html
<ul>
  <li>First Item</li>
  <li>Second Item</li>
  <li>Third Item</li>
  <li>Fourth Item</li>
  <li>Fifth Item</li>
</ul>
```

不用为每个列表都添加类(`.even` & `.odd`也不用)，我们可以使用`:nth-of-type`：

```css
li {
  background: slategrey;
}
/* 从第二个项开始选择交替项 */
li:nth-of-type(2n) {
  background: lightslategrey;
}
```

如你所见，`:nth-of-type`接受一个参数：这个参数可以是单个整数、关键字`even`或`odd`，也可以是如上所示的公式。如果指定一个整数，则只选择一个元素——但如果是关键字或公式将遍历 **父元素的所有子元素** 并选择匹配的元素——类似于在JavaScript中导航数组中的项。关键词`even`和`odd`很直截了当，但公式是使用语法`a + b`构造的，其中：

- "a"是一个整数
- "n"是一个字母
- "+"是一个运算符，可能是`+`或`-`
- "b"是一个整数，如果公式中包含运算符，则需要使用"b"

需要注意的是，这个公式是一个方程，遍历每个同级元素，确定要选择哪个。如果包含公式的"n"“部分，则表示一组递增的正整数(就像遍历数组一样)。在上面的例子中，我们用公式`2n`来选择每第二个元素，这是可行的，因为每次选中一个元素，"n"就会增加1(2×0,2×1,2×2,2×3，等等)。如果一个元素的顺序与方程的结果匹配，那么它将被选中(2,4,6，等等)。要更深入地解释所涉及的数学，请[阅读本文](http://css-tricks.com/how-nth-child-works/)。

为了进一步说明，这里有一些不错的`:nth-of-type`选择器的例子：

- [CSS-Tricks Tester](http://css-tricks.com/examples/nth-child-tester/#)
- [Lea Verou's Tester](http://lea.verou.me/demos/nth.html)

#### 感兴趣的点(需要记住哦)

- `:nth-of-type`从源顺序的顶部开始遍历元素。它与[`:nth-last-of-type`](http://css-tricks.com/almanac/selectors/n/nth-last-of-type)之间的唯一区别是后者迭代从源顺序底部开始的元素。
- `:nth-of-type`选择器非常类似于`:nth-child`但有一个 **关键区别** ：它[更具体](http://css-tricks.com/the-difference-between-nth-child-and-nth-of-type/)。在上面的例子中，它们会产生相同的结果，因为我们只遍历`li`元素，但是如果我们遍历更复杂的兄弟姐妹组，`:nth-child`会尝试匹配所有的兄弟姐妹，而不仅仅是相同元素类型的兄弟姐妹。这就说明了`:nth-of-type`的强大功能，它针对的是与类似的兄弟姐妹(而不是所有的兄弟姐妹)的关系顺序中的特定类型的元素。

#### 相关的属性

- [nth-last-of-type](http://css-tricks.com/almanac/selectors/n/nth-last-of-type)
- [nth-child](http://css-tricks.com/almanac/selectors/n/nth-child)
- [nth-last-child](http://css-tricks.com/almanac/selectors/n/nth-last-child)
- [first-of-type](http://css-tricks.com/almanac/selectors/f/first-of-type)
- [last-of-type](http://css-tricks.com/almanac/selectors/l/last-of-type)

#### 其他的资源

- [Mozilla Docs](https://developer.mozilla.org/en-US/docs/CSS/:nth-of-type)
- [QuirksMode article](http://quirksmode.org/css/selectors/nthchild.html)
- [Sitepoint article](http://reference.sitepoint.com/css/understandingnthchildexpressions)



## 来看看区别

假设有那么一个HTML：

```html
<section>
   <p>Little</p>
   <p>Piggy</p>    <!-- Want this one -->
</section>
```

我们来做一些完全相同的事情：

```css
p:nth-child(2) { color: red; }
```

```css
p:nth-of-type(2) { color: red; }
```

你看到的是相同，但是他们当然有一点不同。

我们的 **:nth-child** 选择器，在"Plain English"中表示在以下情况下选择一个元素：

- 这是一个段落元素
- 这是父级的第二个child

我们的 **:nth-of-type** 选择器，在"Plain English"中表示：

- 选择父元素的第二段子元素

`:nth-of-type`是……怎么说才好呢?更少的条件。

假设我们改成下面这样：

```html
<section>
   <h1>Words</h1>
   <p>Little</p>
   <p>Piggy</p>    <!-- 想要匹配这个 -->
</section>
```

这就破坏了：

```css
p:nth-child(2) { color: red; } /* 现在就不对了 */
```

但是下面这个这仍然有效：

```css
p:nth-of-type(2) { color: red; } /* 仍然可以 */
```

至于上面的"破坏"，我的意思是：上面的`:nth-child`选择器现在选择的是单词`"Little"`而不是`"Piggy"`，因为该元素满足了条件：1: 它是第二个孩子，2: 它是一个段落元素。至于上面说的"仍然可以"，就是说`"Piggy"`还是被选中的，因为他是该父元素下的第二个段落(`p`)。

如果想在`h1`后面添加`h2`，`:nth-child `选择器不会选择任何东西，因为现在第二个子节点不再是一个段落，所以选择器什么也找不到。`:nth-of-type`可以继续工作。

我认为`:nth-of-type`一般更健壮，也更有用，尽管`:nth-child`更常见。

浏览器对于`:nth-of-type`也挺不错，Firefox 3.5+, Opera 9.5+, Chrome 2+, Safari 3.1+, IE 9+。

不要忘记其他的方法：`:first-of-type`，`:last-of-type`，`:nth-last-of-type`和`:only-of-type`。在这里[了解更多](http://css-tricks.com/pseudo-class-selectors/)。



### 相关参考

- [The Difference Between :nth-child and :nth-of-type](https://css-tricks.com/the-difference-between-nth-child-and-nth-of-type/)
- [:nth-of-type](https://css-tricks.com/almanac/selectors/n/nth-of-type/)
- [Useful :nth-child Recipes](https://css-tricks.com/useful-nth-child-recipies/)

