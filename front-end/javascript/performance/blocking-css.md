默认情况下，CSS 被视为[阻塞渲染](https://github.com/xiaohesong/til/blob/master/front-end/html.js.css%E6%B8%B2%E6%9F%93%E9%A1%BA%E5%BA%8F.md)的资源，这意味着浏览器将不会渲染任何已处理的内容，直至 CSSOM 构建完毕。所以要精简 CSS，尽快提供它，并利用媒体类型和查询来解除对渲染的阻塞。

总而言之，记住下面这几条：

- 默认情况下，CSS 被视为阻塞渲染的资源。
- 我们可以通过媒体类型和媒体查询将一些 CSS 资源标记为不阻塞渲染。
- 浏览器会下载所有 CSS 资源，无论阻塞还是不阻塞。



> **CSS 是阻塞渲染的资源。需要将它尽早、尽快地下载到客户端，以便缩短首次渲染的时间。**

不过，我们有一些 CSS 样式只在特定条件下（例如显示网页或将网页投影到大型显示器上时）使用，这些资源不阻塞渲染。

我们可以通过 CSS“媒体类型”和“媒体查询”来解决这类用例：

```html
<link href="style.css" rel="stylesheet">
<link href="print.css" rel="stylesheet" media="print">
<link href="other.css" rel="stylesheet" media="(min-width: 40em)">
```

例如，上面的第一个样式表声明未提供任何媒体类型或查询，因此它适用于所有情况，也就是说，它始终会阻塞渲染。第二个样式表则不然，它只在打印内容时适用，因此在网页首次加载时，该样式表不需要阻塞渲染。最后一个样式表声明提供由浏览器执行的“媒体查询”：符合条件时，浏览器将阻塞渲染，直至样式表下载并处理完毕。

**声明您的样式表资产时，请密切注意媒体类型和查询，因为它们将严重影响关键渲染路径的性能。**

可以考虑下面的一个例子：

```html
<link href="style.css"    rel="stylesheet">
<link href="style.css"    rel="stylesheet" media="all">
<link href="portrait.css" rel="stylesheet" media="orientation:portrait">
<link href="print.css"    rel="stylesheet" media="print">
```

- 第一个声明阻塞渲染，适用于所有情况。
- 第二个声明同样阻塞渲染：“all”是默认类型，如果您不指定任何类型，则隐式设置为“all”。因此，第一个声明和第二个声明实际上是等效的。
- 第三个声明具有动态媒体查询，将在网页加载时计算。根据网页加载时设备的方向，portrait.css 可能阻塞渲染，也可能不阻塞渲染。
- 最后一个声明只在打印网页时应用，因此网页首次在浏览器中加载时，它不会阻塞渲染。



此文摘自: [Render-Blocking css](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css)
