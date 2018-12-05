很惭愧，在看完[React Components, Elements and Instances](https://github.com/xiaohesong/TIL/blob/master/front-end/react/component-element-instance.md)
这篇文章的时候没有及时去总结，导致现在还是有些模糊。


- jsx

在写`react`的时候，我们经常在里面写`jsx`的语法。对这个倒没啥，可以看下[文档](https://facebook.github.io/jsx/)或者`fb react`上面的[介绍](https://reactjs.org/docs/introducing-jsx.html)

- createElement

看下他的`api`:
```js
React.createElement(
  type,
  [props],
  [...children]
)
```
这个也没啥，就是那么三个参数。
```js
//jsx
<div className='dec'>a div </div>

//createElement
React.createElement(
  type: 'div',
  props: {className: 'desc'},
  children: 'a div' // 或许下面又是一个组件
)
```

- element
这个就是`react`的核心了，这个就是存在内存里的对象。

他的结构如下:
```js
{
  type : string | class,
  props : { children, className, etc. },
  key : string | boolean | number | null,
  ref : string | null
}
```


不要把`createElement`和`react element`的结构搞乱了。。。
