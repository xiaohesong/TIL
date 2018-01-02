- `split`

`split`是可以拆分,和`ruby`的`split`类似.
```javascript
let a = "1,2,3"
a = a.split(",")
=> result a was `["1", "2", "3"]`
```

- `join`

`join`是可以组合成字符串.也类似于`ruby`.

```javascript
let a = [1,2,3]
a = a.join(",")
=> result a was `["1", "2", "3"]`
```

- `replace`

这东西可以替换.替代`join`和`split`的组合.

`join` and `split` example.
```javascript
let a = "my-name-was-kimi"
a = a.split("-").join("")
```
等同于下面这种情况.

`replace` example.

```javascript
let a = "my-name-was-kimi"
a = a.replace(/-/g, "")
```
可以发现`replace`后面有个`g`,你可以尝试移除`g`,看看有什么不同.其实`g`就是全局替换.
