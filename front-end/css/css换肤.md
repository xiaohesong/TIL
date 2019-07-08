各位如果为自己的网站动态的换肤是怎么操作的？

今天看到一个挺好的方法，到时可以试试。

这个方法是借助`rel`属性的`alternate`值实现。

```html
<link href="reset.css" rel="stylesheet" type="text/css">
                
<link href="default.css" rel="stylesheet" type="text/css" title="默认">
<link href="red.css" rel="alternate stylesheet" type="text/css" title="红色">
<link href="green.css" rel="alternate stylesheet" type="text/css" title="绿色">
```

上面这四个`<link>`元素，略有不同，涉及到阻塞渲染css的问题。

- 没有title属性，rel属性值仅仅是stylesheet的<link>默认会加载并渲染，如reset.css；

- 有title属性，rel属性值仅仅是stylesheet的<link>作为默认样式CSS文件加载并渲染，如default.css；

- 有title属性，rel属性值同时包含alternate stylesheet的<link>作为备选样式CSS文件加载，默认不渲染，如red.css和green.css；

可以看下如何实现一个换肤：

```html
<input id="default" type="radio" name="skin" value="default.css" checked>
<input id="red" type="radio" name="skin" value="red.css">
<input id="green" type="radio" name="skin" value="green.css">
```

```js
var eleLinks = document.querySelectorAll('link[title]');
var eleRadios = document.querySelectorAll('[type="radio"]');
[].slice.call(eleRadios).forEach(function (radio) {
    radio.addEventListener('click', function () {
        var value = this.value;
        [].slice.call(eleLinks).forEach(function (link) {
            link.disabled = true;
            if (link.getAttribute('href') == value) {
                // 该样式CSS文件生效
                link.disabled = false;
            }
        });
    });
});
```

参考：
> [link rel=alternate网站换肤功能最佳实现](https://www.zhangxinxu.com/wordpress/2019/02/link-rel-alternate-website-skin/)
