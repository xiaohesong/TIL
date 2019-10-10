前段时间碰到了一个问题，在谷歌浏览器下有问题，但是在safari下就报错。

这个是关于日期的报错，报错的内容是`Invalid Date`。

特地查了下，发现自己没有注意到的细节，特此记录一番。

先看看，下面会输出什么？

```js
const updateAt = "2019-09-24 13:52:38";
const joined = "2019-9-19"
const dateFormat = "YYYY-MM-DD"
console.log(new Date(updated))
console.log(new Date(joined))
```

是的，是`Invalid date`, 为什么时间戳这种不可以。

其实也可以，那就是把这个拆分开了：

https://tc39.es/ecma262/#sec-date-year-month-date-hours-minutes-seconds-ms

还有一种方式，老的规范里可以用，参考这里 https://stackoverflow.com/a/4310986 

```js
const updateAt = "2019-09-24T13:52:38";
console.log(new Date(updated))
```

这个还是比较坑的。

如果你也没有注意到这些细节，希望你可以避开这些问题。



