`ECMAScript 6`的开发大约花了四年时间，之后，`TC-39`决定这么长的开发过程是不可持续的。相反，他们转向每年的发布周期，以确保新的语言功能能够更快地进入
开发阶段。

更频繁的发布意味着每个新版本的`ECMAScript`应该比`ECMAScript 6`具有更少的新功能。 **为表示此更改，规范的新版本不再突出显示版本号，
而是指出发布规范的年份。** 因此，`ECMAScript 6`也称为`ECMAScript 2015`，而`ECMAScript 7`正式称为`ECMAScript 2016`.`TC-39`希望将
所有未来的`ECMAScript`版本用于基于年份的命名系统。

`ECMAScript 2016`于2016年3月完成，仅包含三种语言补充：一个新的数学运算符，一个新的数组方法和一个新的语法错误。这两个都包含在本附录中。

##### The Exponentiation Operator
`ECMAScript 2016`中引入的`JavaScript`语法的唯一变化是取幂运算符，它是一个将指数应用于基数的数学运算。`JavaScript`已经使用`Math.pow`方法来
执行求幂，但`JavaScript`也是唯一需要方法而不是正式运算符的语言之一。（而且一些开发人员认为操作员更容易阅读和推理。）

取幂运算符是两个星号（`**`），其中左操作数是基数，右操作数是指数。例如：
```js
let result = 5 ** 2;

console.log(result);                        // 25 === Math.pow(5, 2)
console.log(result === Math.pow(5, 2));     // true
```

##### Order of Operations
指数运算符具有`JavaScript`中所有二元运算符的最高优先级（一元运算符的优先级高于`**`）。这意味着它首先应用于任何复合操作，如下例所示：
```js
let result = 2 * 5 ** 2;
console.log(result);        // 50
```

##### Operand Restriction
取幂运算符确实有一些不寻常的限制，对其他运算符不存在。取幂运算的左侧不能是`++`或` --`以外的一元表达式。例如，这是无效的语法：
```js
// syntax error
let result = -5 ** 2;
```
此示例中的`-5`是语法错误，因为操作顺序不明确。 `-` 仅适用于`5`或`5 ** 2`表达式的结果吗？不允许取幂运算符左侧的一元表达式消除了这种模糊性。
所以你需要这样做:

```js
// ok
let result1 = -(5 ** 2);    // equal to -25

// also ok
let result2 = (-5) ** 2;    // equal to 25
```

### Array.prototype.includes()
之前在前面的文章有提到`String.prototype.includes`，其实在`ES6`中也存在这个。但是，在`ECMAScript 6`截止日期，`Array.prototype.includes`的
规范并不完整，因此`Array.prototype.includes`最终在`ECMAScript 2016`中完成。

##### How to Use Array.prototype.includes()
**`includes`方法接受两个参数：要搜索的值和从中开始搜索的可选索​​引。**当提供第二个参数时，`includes`从该索引开始匹配。 （默认起始索引为0.）如果
在数组内找到值，则返回值为`true`，否则返回`false`。

```js
let values = [1, 2, 3];

console.log(values.includes(1));        // true
console.log(values.includes(0));        // false

// start the search from index 2
console.log(values.includes(1, 2));     // false
```

##### Value Comparison
`includes`方法执行的值比较使用`===`运算符，但有一个例外：`NaN`被认为等于`NaN`，即使`NaN === NaN`的计算结果为`false`。
这与`indexOf`方法的行为不同，后者严格使用`===`进行比较。要查看差异，请考虑以下代码：
```js
let values = [1, NaN, 2];

console.log(values.indexOf(NaN));       // -1
console.log(values.includes(NaN));      // true
```

> 当你想检查数组中是否存在值并且不需要知道索引时，我建议使用`includes`，因为`include`和`indexOf`方法处理`NaN`的方式不同。
如果确实需要知道数组哪个值的位置，那么必须使用`indexOf`方法。

这种实现的另一个怪癖是`+0`和`-0`被认为是相等的。在这种情况下，`indexOf`和`includes`的行为是相同的：
```js
let values = [1, +0, 2];

console.log(values.indexOf(-0));        // 1
console.log(values.includes(-0));       // true
```
请注意，这与`Object.is`方法的行为不同，后者将`+0`和`-0`视为不同的值。

> **本人提示: 在数组去重的时候就可以这样说**

### Change to Function-Scoped Strict Mode
当在`ECMAScript 5`中引入严格模式时，语言比`ECMAScript 6`中的语言简单得多。尽管如此，`ECMAScript 6`仍允许您在全局范围内使用`“use strict”`
指令来指定严格模式（这将使所有代码以严格模式运行）或在函数范围内（因此只有该函数才能在严格模式下运行）。后者最终成为`ECMAScript 6`中的一个问题，
因为可以通过更复杂的方式定义参数，特别是使用解构和默认参数值。要了解此问题，请考虑以下代码:
```js
function doSomething(first = this) {
    "use strict";

    return first;
}
```
这里，为命名参数`first`指定默认值`this`。你期望`first`的值是多少？在这种情况下，`ECMAScript 6`规范指示`JavaScript`引擎将参数视为以严格模式运行，
因此这应该等于`undefined`。但是，当函数内部存在`“use strict”`时，实现以严格模式运行的参数变得非常困难，因为参数默认值也可以是函数。
这种困难导致大多数`JavaScript`引擎没有实现此功能（因此这将等于全局对象）。

由于实现困难，`ECMAScript 2016`使得在参数被解构或具有默认值的函数内部具有`“use strict”`指令是非法的。当函数体中存在`“use strict”`时，
只允许使用简单的参数列表，那些不包含解构或默认值的参数列表。这里有些例子：
```js
// okay - using simple parameter list
function okay(first, second) {
    "use strict";

    return first;
}

// syntax error
function notOkay1(first, second=first) {
    "use strict";

    return first;
}

// syntax error
function notOkay2({ first, second }) {
    "use strict";

    return first;
}
```
仍然可以将`“use strict”`与简单的参数列表一起使用，这就是`okay`按预期工作的原因（与`ECMAScript 5`中的相同）。`notOkay1`函数是语法错误，因为不能再在具有默认参数值的函数中使用`“use strict”`。类似地，`notOkay2`函数是一个语法错误，因为你不能在具有破坏参数的函数中使用`“use strict”`。

总的来说，这一变化消除了JavaScript开发人员的混淆点和`JavaScript`引擎的实现问题。
