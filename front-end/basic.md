- `NaN`

  这个得字面意思就是"Not a Number"。但是这个描述的并不是很好。把它描述成"无效的数字"反而会好点。
  参考[这里](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/you-dont-known-js/types%26grammer/Chapter2-Values.md#special-numbers)

- `==` vs `===`

  大多数书籍中对于这两者的描述通常是：`==`是判断值是否相等，`===`是判断值和类型是否都相等。 这个说法是 **错误** 的。
  更准确的说：“`==`允许在比较中强制，`===`不允许强制。”
  参考[这里](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/you-dont-known-js/types%26grammer/Chapter4-coercion.md#loose-equals-vs-strict-equals)

#### 原始类型和引用类型的区别

- 可变性

  - 原始类型不可变
  
  - 引用类型可变
  
  
- 存储位置

  - 原始存储在栈中, 存储的变量直接访问的位置。
 
  - 引用类型存储在堆中， 存储的是变量的位置，他指向引用对象在内存中的位置。
  
  
- 比较

  - 原始类型直接对值进行比较
  
  - 引用类型在某些情况下会进行类型转换成初始类型(==, >, <, ...)
