- ReactDOM.render

这个render方法携带一些参数，平时我们可能就是两个参数，一个component和mount dom. 其实他对外暴露出来了[三个参数](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js#L628)，第三个参数是一个`callback`.

然后他调用[legacyRenderSubtreeIntoContainer](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js#L504)并返回结果。 

在这个方法里比较有意思的就是[isValidContainer](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js#L419)方法，他会判断这个是否是一个合法的容器，
判断(支持)节点的类别是有`ELEMENT_NODE, TEXT_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE`,
这里的`comment node type`比较有意思,他竟然支持注释类型，但是注释的内容必须是`react-mount-point-unstable`.

你可以尝试下，在`HtmlWebPackPlugin`的`removeComments`改成`false`,然后在`html`里写入`react-mount-point-unstable`并注释。
```js
var findComments = function (el) {
  var arr = [];
  for (var i = 0; i < el.childNodes.length; i++) {
    var node = el.childNodes[i];
    if (node.nodeType === 8) {
      arr.push(node);
    } else {
      arr.push.apply(arr, findComments(node));
    }
  }
  return arr;
};

var commentNode = findComments(document)[0];

ReactDOM.render(
  <App/>,
  // document.getElementById('root'),
  commentNode,
  function(){
    console.log('dom render callback')
  }
)
```
可以发现，内容可以正常渲染.
