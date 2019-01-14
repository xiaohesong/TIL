#### 混淆的点

- 函数不是构造函数，仅当`new`调用时，函数才是 **构造函数调用**. 

#### Object.create
```js
Object.create = function(o) {
  function F(){}
  F.prototype = o;
  return new F();
};
```
