## [Map&Set](https://leanpub.com/understandinges6/read#leanpub-auto-sets-and-maps-in-ecmascript-5)

### Set
在了解set之前，先看下object。

```js
obj = {}, o1 = {}, o2 = {}
obj[o1] = 'obj1'
obj[o2]// 'obj1'
obj[1] = '2'
obj['1'] // 2
```

由上面可以发现，获取的值是相同的，这是因为object的key是由进行类型转换，会转换成string.`String({})`是`"[Object Object]"`.

那么再来看看Set

```js
o1 = {}, o2 = {}
set = new Set
set.add(o1)
set.add(o2)
set.size //2
set.add(1)
set.add('1')
set.size //4
```

可以发现`Set`是不会进行转换。

我们还知道`set`可以进行数组去重，如下

```js
set = new Set([1,2,1,1,1,1,1])
set.size // 2
set.add([9,9,9,9,9,9,9])
set.size //3
```

很棒对不对，但是值得注意的是: add添加的是一个整体。
所以数组去重最好在new的时候加入，并且set构造函数接受的参数只能是 **可迭代的** . 如下:

```js
new Set(1) // error, is not iterable
new Set({}) // error, is not iterator
```
如果真的需要对object进行set， [可以iterator他](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/objects/examples/iterator.md)

set还有一些移除的方法,看下面:

```js
let set = new Set();
set.add(5);
set.add("5");

console.log(set.has(5));    // true

set.delete(5);

console.log(set.has(5));    // false
console.log(set.size);      // 1

set.clear();

console.log(set.has("5"));  // false
console.log(set.size);      // 0
```

`delete`是移除对应的某一个, `clear`是清空.

再来看看`weakset`。

`WeakSet`与`Set`的区别.

- new WeakSet && new Set
  1. new WeakSet 支持空的[]作为参数，其他都不行
  2. new Set 支持interator作为参数，其他都不行.

- add
  1. weakset 只支持add({} || [])
  2. set 支持add all.
  
- weakset不存在forEach方法
- weakset不存在size方法(无效)

他们还有对引用类型上销毁的不同。


### Map
map是一个健值对的有序列表，他的key类似于set，看下面的例子:

```js
map = new Map, obj1 = {}, obj2 = {}
map.set(obj1, 'xiaohesong')
map.get(obj1) // xiaohesong
map.get(obj2) // undefined
```
首先可以知道，map是通过set设置一个健值对，通过get获取value，并且如果获取不存在的健值对，返回的是一个undefined.而且也可以通过上面的两个对象key得知key是唯一的，不会转换成其他的类型。

map除了上面的一些方法，还有一些方法类似于set。
- `has(key)` 确定是否存在这个key
- `delete(key)` 删除某一个健值对
- `clear()` 删除所有的健值对
- `size` 有多少对健值对

初始化的时候也支持传入参数，但是这个参数必须是数组，数组里的每项也是一个数组

```js
map = new Map([['age', 18], ['name', 'xiaohesong'], ['company', 'company-name']])
map.size // 3
```
