基本的数据类型`null, undefined, string, boolean, number, symbol`.

不可变。

我们知道，基本的数据类型是不可变类型。

```javascript
let str = 'string'
str[0] = 'l'
console.log(str) //string
```

这是为什么，为什么引用类型可以。

这个就和生命周期有关系了。

基本类型的生命周期是短暂的，他在读取访问字符串的时候会做一些事。
```javascript
let str = new String('string')
let str2 = str.xx
str = null
```
他在读取模式中访问字符串的时候就去做了这三件事。
首先实例化一个新的变量，然后在实例上调用方法，最后销毁这个实例。

所以在上面的`str[0]`的时候，实际上是在一个新的实例上做的，原对象字符串不存在这个方法。
