[原文链接](https://javascript.info/modifying-document)

## 获取
修改document之前，先需要获取。原生的js获取也有不少。

> getElement

* `getElementById`
* `getElementsByTagName`
* `getElementsByClassName`
* `getElementsByName`

> query

* querySelector
* querySelectorAll

[querySelectorAll 和 getElementsBy* 异同](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/js%E5%8E%9F%E7%94%9F%E6%93%8D%E4%BD%9Cdom.md)

## 修改document

- create

创建element:<br>
`let div = document.createElement('div');`

创建text<br>
`let textNode = document.createTextNode('text');` 

- inset

  - appendChild
  
    这个是在元素后面追加内容<br>
    `div.appendChild(someElem)`
  
  - insertBefore
  
    这个是在某个元素前面插入元素<br>
    `div.insertBefore(someElem, beforeThisElement)`
  
  - replaceChild
    这个是替换元素<br>
    `div.replaceChild(someElem, oldElem)`
    
  - append
    这个是在子元素最后面追加元素
    
  - prepend
    这个是在子元素最开始处追加元素

  - before
    这个是在当前这个前面追加
  
  - after
    这个是在当前这个后面追加
   
  - replaceWith
    替换给定的元素
    
  - ...
  可见原文，多种情况,待续
