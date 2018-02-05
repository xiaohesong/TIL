这里主要说说`js`中`object`对象删除`key-value`.

大多数情况下,都会选择遍历循环.如下,删除`password`

```javascript
const obj = {name: "xiaohesong", age: "18", password: "pwd"}
const withoutPwd = Object.key(obj).filter(key => key !== "password")
                                  .map(key => {[key]: obj[key]})
                                  .reduce((result, current) => 
                                          ({...result, ...current}),
                                          {}
                                         )
               
```
这样会生成新的一个对象,不包含`password`的一个对象.
今天看到一个很骚气的操作,得记录一下.

```javascript
const obj = {name: "xiaohesong", age: "18", password: "pwd"}
const withoutPwd = (({name, age}) => ({name, age}))(obj);
```

其实如果想要在原对象上直接移除`password`,直接`delete obj['password']`就好啦.
