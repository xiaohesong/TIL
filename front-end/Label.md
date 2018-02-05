- `Lable`

这个可以为一段代码起一个名字,也很简单.

```javascript
custom:
for(let i=1; i < 10; i++){
  if (i % 2 == 1) continue custom;
  console.log(i);
}
```

感觉起来似乎没有什么作用. 可是如果嵌套呢?

```javascript
first: for (var i = 0; i < 3; i++) {
  second: for (var j = 0; j < 3; j++) {
    if (i === 1) continue first;
    if (j === 1) break second;
    console.log(`${i} & ${j}`);
  }
}
```

[链接 JavaScript: The Label Statement](https://codeburst.io/javascript-the-label-statement-a391cef4c556)
