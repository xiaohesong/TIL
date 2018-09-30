# 类型化数组

`es6`针对`Array`进行了功能上的改进。

我们知道创建一个数组有两种方式，一个是构造函数方式，另外一个就是字面量方式。

## 数组改进
### Array.of()
构造函数的方式会有一些小坑.

```js
a1 = new Array(2)
a1.length //2
a2 = new Array('2')
a2.length // 1
```
可以发现，当他是一个数字的时候，参数是作为`length`来处理，其他情况都是作为item项处理。
再来看看`Array.of()`
```js
a1 = Array.of(2)
a1.length // 1
a2 = Array.of('2')
a2.length // 1
```
可以发现，他是把参数都当作`item`项来处理。
> **注意：** `Array.of`不会使用[`Symbol.species`属性](https://xiaohesong.gitbook.io/today-i-learn/front-end/es6/understanding-es6/class#symbolspecies-shu-xing)来确定返回数据类型，他只是在当前构造函数确定当前数据返回类型。

### `Array.from`
这个就是将非数组对象转换成数组对象，当然，转换有一些限制，我们会在下面说明。在`ES6`之前，转换是一件比较麻烦的事情。你可能需要像下面这样来处理
```js
function makeArray(arrayLike) {
    var result = [];

    for (var i = 0, len = arrayLike.length; i < len; i++) {
        result.push(arrayLike[i]);
    }

    return result;
}
```
可以发现，上面是根据`length`属性来处理的。
后来，开发人员发现了更加便捷的方式，通过`Array.prototype.slice.call(likeArrays) `来处理。
虽然使用`slice`可以减少代码，但是这种方式也不是很直观，不能够明显的表达`把某对象转换成数组`.因此`ES6`推出了`Array.from`, 他更明显更简洁。

> `Array.from`类似于`Array.of`,也是使用`this`来确定当前返回数据的类型。

来看个`Array.from`的例子
```js
obj = {"1": 'value is 1', length: 2}
a = Array.from(obj, (item) => item + ' works') //["undefined works", "value is 1 works"]
```
我们发现，一个对象包含有`length`属性，那么就可以被转换成数组对象。其实并非如此，[`iteratable`属性](https://xiaohesong.gitbook.io/today-i-learn/front-end/es6/understanding-es6/iterators-and-generators#iterables-and-for-of)的对象也是可以的。

```js
let numbers = {
    *[Symbol.iterator]() {
        yield 1;
        yield 2;
        yield 3;
    }
};

let numbers2 = Array.from(numbers, (value) => value + 1);

console.log(numbers2);              // 2,3,4
```

> 由此可知，可以被转换成数组的对象，必须是需要**像数组(`length`属性)或者是`iteratable`的对象。**

## 数组方法追加
仅仅只是改进部分方法，并不能满足开发人员，因此进行了方法上的追加。

### find & findIndex
在`ES5`之前，数组搜索不存在内置的方法，在`ES5`的时候增加了`indexOf`和`lastIndexOf`这两个方法，但是这个只是对值的搜索，而且只能搜索一个值。
`find & findIndex`都可以接受两个参数。回调函数和可选的回调函数中使用的`this`对象。

### fill
`arr.fill(value[, start[, end]])`
由此可见，这后面两个参数是可选的。

```js
let numbers = [1, 2, 3, 4];

numbers.fill(1, 2);

console.log(numbers.toString());    // 1,2,1,1

numbers.fill(0, 1, 3);

console.log(numbers.toString());    // 1,0,0,1
```
这个需要注意的就是`end`参数的实际效果是是`end - 1`.如果`start`参数是`-1`，就是`arr.length - 1`.

### Typed Arrays
类型化数组专是用于处理数字类型的。类型化数组的起源可以追溯到`WebGL`, 所以类型化数组是作为`WebGL`的一部分来创建的，以便在js中提高按位运算。

相对于`WebGL`而言，原生`js`的数字运算实在是太慢，因为数字以64位浮点格式存储，并根据需要转换为32位整数。鉴于此，引入了类型化数组来避免这个转换的限制，用来提高性能。也就是说，可以把任何单个的数字都看作是一个位数组并且可以使用数组的一些方法。

`ES6`采用类型化数组是为了兼容`javascript引擎`和`javascript数组`的交互.
`ES6`版本的类型化数组虽然并非与`WebGL`版本完全相同，但是他们非常的相似，类似于`WebGL`的一个演变。

## 数字类型的数据

`javascript`的数字以`IEEE 754`格式存储，使用64位来存储浮点型数字。`IEEE 754`格式表示js中的整数和浮点数，两种格式之间的转换随着数字的变化而频繁发生。类型化数组允许存储操作八种不同类型的数字类型:
- 带符号的`8-bit`整数(int8)
- 不带符号的`8-bit`整数(uint8)
- 带符号的`16-bit`整数(int16)
- 不带符号的`16-bit`整数(uint16)
- 带符号的`32-bit`整数(int32)
- 不带符号的`32-bit`整数(uint32)
- `32-bit`浮点型(float32)
- `64-bit`浮点型(float64)

如果你将一个符号`int8`的数字作为一个普通的`js`数字，那么将浪费`56`位。浪费的这些位可以更好的存储少于`56`位的数字。更有效的利用位是类型化数组的一个目的。

与类型化数组的所有操作和对象都是使用这八种数据类型，为了使用这个，你需要使用`ArrayBuffer`来存储他们。

### ArrayBuffer
**所有类型化数组的基础都是`array buffer`, 就是一个可以包含指定字节数的内存位置。** 创建数组缓冲区类似于在C中调用`malloc()`来分配内存而不指定内存块包含的内容。我们来创建一个`array buffer`.
```js
buffer = new ArrayBuffer(10);   // 分配10 字节
```
只需要传递对应的字节数，便会创建对应的字节的数组缓冲区。当一个缓冲区创建之后，你可以通过`byteLength `属性来检测缓冲区的字节数:
```js
buffer. byteLength // 10
```
你也可以使用`slice`方法来创建可以包含已有缓冲区数组的一部分的新数组缓冲区。`slice`就像在数组上那样工作，传递两个参数，开始和结束的位置，然后返回新的实例。看下面的例子:
```js
buffer = new ArrayBuffer(10);
buffer2 = buffer.slice(4, 6);
console.log(buffer2.byteLength);    // 2
```

这样又创建了一个缓冲区，不过创建了，不适用就没啥用。

> 注意: 创建缓冲区的时候是指定了字节大小，创建之后我们便不可更改字节存储大小，只能更改内部的数据。

### 适用视图来操作缓冲区
`array buffers`表示内存位置，`views`是用于操作该内存的接口。`views`操作数组缓冲区，是用数字类型来读取写入缓冲区。
`DataView`是一个泛型，可以使用前面提到的八种数据类型来操作。`DataView`的操作是在`ArrayBuffer`实例的基础上的:
```js
buffer = new ArrayBuffer(10),
view = new DataView(buffer);
```
在这里，`view`实例可以访问上面所有的`10`个字节。当然，你也可以对缓冲区的部分字节创建视图。你只需要额外提供两个变量(偏移量和可选的包含的字节数)，如果你不提供可选的字节数参数，那么就从偏移量开始到最后一个字节。如下例子:
```js
buffer = new ArrayBuffer(10),
view = new DataView(buffer, 5, 2);      // 覆盖 5 和 6 字节
```
这样只会操作缓冲区指定位置的字节。最后`view.byteLength`是2个长度。

###### 检索视图信息
视图有一些只读的属性可供你检索:
-`buffer` 这个是`view`绑定的缓冲区
-`byteOffset` 这个是`DataView`构造函数中的第二个参数，如果没有传入，默认是0.
-`byteLength` 这个是`DataView`构造函数的第一个参数，如果没有传入，则默认是缓冲区的字节长度.

使用这些来检查，可以知道视图的位置:
```js
buffer = new ArrayBuffer(10),
view1 = new DataView(buffer),           // 覆盖所有字节
view2 = new DataView(buffer, 5, 2);     // 覆盖 5 和 6 字节

console.log(view1.buffer === buffer);       // true
console.log(view2.buffer === buffer);       // true
console.log(view1.byteOffset);              // 0
console.log(view2.byteOffset);              // 5
console.log(view1.byteLength);              // 10
console.log(view2.byteLength);              // 2
```
当然，仅仅只是读取内存的信息对于我们来说，没啥用，我们更想要的是存入数据到内存，再从内存读取数据。

###### 读取写入数据
对于`js`的八种数字数据类型，`DataView`原型都有一种写入数据的方法和一种读取数据的方法。方法名字都以`set`或者`get`来开头，后面跟着数据类型。例如下面操作`int8`和`uint8`这种情况:
- getInt8(byteOffset, littleEndian) - 通过`byteOffset`开始读取`int8`
- setInt8(byteOffset, value, littleEndian) - 通过`byteOffset`开始写入`int8`
- getUint8(byteOffset, littleEndian) -通过`byteOffset`开始读取`uint8`
- setUint8(byteOffset, value, littleEndian) - 通过`byteOffset`开始写入`uint8`

由此可见：
* `get`方法
   传入两个参数， 第一个是从字节偏移位置开始读取;第二个是一个可选的布尔参数，指示值是否应该作为`little-endian`来读取(Little-endian表示最低有效字节是0字节,而不是最后一个字节)
* `set`方法
  这个传入三个参数: 第一个是写入的字节偏移的位置， 第二个是写入的值，第三个是可选的值，表示是否以`little-endian`格式存储。

下面我们来看一个简单的小例子:
```js
buffer = new ArrayBuffer(2),
view = new DataView(buffer);

view.setInt8(0, 5);
view.setInt8(1, -1);

console.log(view.getInt8(0));       // 5
console.log(view.getInt8(1));
```
这个在创建了缓冲区和视图之后，我们使用`int8`来存储数据。再在对应的偏移位置设置数据。

再来看一个有意思的小例子:
```js
buffer = new ArrayBuffer(2),
view = new DataView(buffer);

view.setInt8(0, 5);
view.setInt8(1, -1);

console.log(view.getInt16(0));      // 1535
console.log(view.getInt8(0));       // 5
console.log(view.getInt8(1));       // -1
```
可以发现`view.getInt16(0)`比较有意思，他读取里面所有的字节，并解释为数字。要理解为什么会这样，得知道他在缓冲区的做了什么。
```js
new ArrayBuffer(2)      0000000000000000
view.setInt8(0, 5);     0000010100000000
view.setInt8(1, -1);    0000010111111111
```
可以看到，数组缓冲是以0开始的16位。比如在第一个字节处写入5，他会引入几个1(5是00000101).在第二个位置设置成-1，他会设置所有的位变成1，这是-1的二进制表示。在第二次调用`set`之后，使用了`getInt16(0)`去读取，将这些位读取为单个16位整数，即十进制的1535。

###### 类型化数组是视图
**`ES6`的类型化数组其实就是数组缓冲的特定类型视图。** 也可以使用强制执行特定数据类型的对象，而不是仅使用泛型`DataView`对象来操作数组缓冲区。八种数据类型都有对应特定的视图，对于`int8`还有附加项。

Constructor Name           | Element Size (in bytes)  | Description | Equivalent C Type 
--------------|:---:|--------:|----
Int8Array	| 1	| 8-bit two’s complement signed integer	| signed char
Uint8Array|	1|	8-bit unsigned integer |	unsigned char
Uint8ClampedArray|	1	| 8-bit unsigned integer (clamped conversion)|	unsigned char
Int16Array	|2|	16-bit two’s complement signed integer|	short
Uint16Array	|2|	16-bit unsigned integer	|unsigned short
Int32Array	|4|	32-bit two’s complement signed integer|	int
Uint32Array	|4|	32-bit unsigned integer|	int
Float32Array	|4|	32-bit IEEE floating point|	float
Float64Array	|8|	64-bit IEEE floating point|	double

看起来有些不同的可能就是`Uint8ClampedArray`吧，其实他和`uint8Array`基本是等价的，除非缓冲区的值小于0或者大于255。他会把低于`0`的值转换成`0`,把高于`255`的值转换成`255`.

类型化数组操作仅适用于特定类型的数据。例如，`Int8Array`上的所有操作都使用`int8`值。类型化数组中元素的大小也取决于数组的类型。虽然`Int8Array`中的元素长度为单字节，但`Float64Array`每个元素使用`8`个字节。幸运的是，使用数字索引访问元素就像常规数组一样，这样可以避免对`DataView`的“set”和“get”方法进行有些别扭的调用。

> ###### Element Size
> 每个类型化数组由许多元素组成，元素大小是每个元素表示的字节数。
> 此值存储在每个构造函数和每个实例的`BYTES_PER_ELEMENT`属性中，因此可以轻松查询元素大小
>
> ```js
>    let ints = new Int8Array(5);
>    console.log(ints.BYTES_PER_ELEMENT);
> ```

###### 创建特定类型的视图
类型化数组的构造函数接受多种类型的参数，因此有几种方法可以创建类型化数组。首先，可以通过传递与`DataView`采用的相同参数（数组缓冲区，可选字节偏移量和可选字节长度）来创建新类型数组。如下：
```js
let buffer = new ArrayBuffer(10),
    view1 = new Int8Array(buffer),
    view2 = new Int8Array(buffer, 5, 2);

console.log(view1.buffer === buffer);       // true
console.log(view2.buffer === buffer);       // true
console.log(view1.byteOffset);              // 0
console.log(view2.byteOffset);              // 5
console.log(view1.byteLength);              // 10
console.log(view2.byteLength);              // 2
```
这里的两个`view`都是使用`Int8Array`的实例来创建数组缓冲区的视图。可以发现这两个实例都具有`DataView`实例的属性方法，这就很容易切换到类型化数组，只要针对数字类型并且使用`DataView`。

另外一种方式创建类型化数组是直接通过传递给构造函数一个数字。**这个数字表示分配给数组的元素数，不是字节数.** 构造函数将创建一个带有正确字节数的新缓冲区来表示该数组元素，并且可以使用`length`属性访问数组中的元素数。如下:
```js
ints = new Int16Array(2),
floats = new Float32Array(5);

console.log(ints.byteLength);       // 4
console.log(ints.length);           // 2

console.log(floats.byteLength);     // 20
console.log(floats.length);         // 5
```

> 注意: 如果没有参数传递给类型化数组构造函数，则构造函数的行为就像传递了`0`一样。这将创建一个无法保存数据的类型化数组，这是因为`0`字节已经分配给缓冲区了。

创建类型化数组的第三种方法是将对象作为构造函数的唯一参数去传递。这个对象是以下任何一种:

- `A Typed Array` 将每个元素复制到新类型数组上的新元素中。例如，如果将`int8`传递给`Int16Array`构造函数，则`int8`值将被复制到`int16`数组中。新类型数组具有与传入的数组缓冲区不同的数组缓冲区。

- `An Iterable` 调用对象的迭代器以检索要插入到类型化数组中的项。如果视图类型的任何元素无效，构造函数将抛出错误。

- `An Array` 数组的元素将复制到新的类型数组中。如果任何元素对于该类型无效，则构造函数将抛出错误。

- `An Array-Like Object` 这个与数组的行为相同

上面这种情况下，每一种都会使用源对象中的数据创建一个新的类型化数组。当想要使用某些值初始化类型化数组时，这就很有用了:
```js
ints1 = new Int16Array([25, 50]),
ints2 = new Int32Array(ints1);

console.log(ints1.buffer === ints2.buffer);     // false

console.log(ints1.byteLength);      // 4
console.log(ints1.length);          // 2
console.log(ints1[0]);              // 25
console.log(ints1[1]);              // 50

console.log(ints2.byteLength);      // 8
console.log(ints2.length);          // 2
console.log(ints2[0]);              // 25
console.log(ints2[1]);              // 50
```
可以看到，上面这种就是属于以上情况的一种，可以直接进行操作。

### 类型化数组和常规数组的相似处
类型化数组和常规数组在几个方面类似，正如您在本文中看到的，在许多情况下，类型化数组可以像常规数组一样使用。例如，可以使用`length`属性检查类型化数组中的元素数量，并且可以使用数字索引直接访问类型化数组的元素。
```js
ints = new Int16Array([25, 50]);

console.log(ints.length);          // 2
console.log(ints[0]);              // 25
console.log(ints[1]);              // 50

ints[0] = 1;
ints[1] = 2;

console.log(ints[0]);              // 1
console.log(ints[1]);              // 2
```

> **注意:** 与常规数组不同的是，类型化数组不可以通过`length`修改数组大小。因为这时的`writable`为`false`,严格模式下会报错。

类型化数组还包括大量与常规数组方法在功能上等效的方法。可以在类型化数组上使用以下数组方法:
- `copyWithin()`
- `entries()`
- `fill()`
- `filter()`
- `find()`
- `findIndex()`
- `forEach()`
- `indexOf()`
- `join()`
- `keys()`
- `lastIndexOf()`
- `map()`
- `reduce()`
- `reduceRight()`
- `reverse()`
- `slice()`
- `some()`
- `sort()`
- `values()`

**记住**，虽然这些方法的行为与`Array.prototype`上的对应方式相同，但它们并不完全相同。类型化数组方法对数值类型安全性进行了额外的检查，并且在返回数组时，将返回一个类型化数组而不是常规数组（由于`Symbol.species`属性）。如下：
```js
ints = new Int16Array([25, 50]),
mapped = ints.map(v => v * 2);

console.log(mapped.length);        // 2
console.log(mapped[0]);            // 50
console.log(mapped[1]);            // 100

console.log(mapped instanceof Int16Array);  // true
```
可见，代码使用`map`方法基于`ints`中的值创建新数组。映射函数将数组中的每个值加倍，并返回一个新的`Int16Array`。

### 相同的`Iterators `
类型化数组也具有与常规数组相同的三个迭代器。这些是`entries`方法，`keys`方法和`values`方法。也就是说可以像使用常规数组一样使用类型数组的扩展运算符和`for-of`循环。
```js
ints = new Int16Array([25, 50]),
intsArray = [...ints];

console.log(intsArray instanceof Array);    // true
console.log(intsArray[0]);                  // 25
console.log(intsArray[1]);
```

### `of`&`from`方法
最后一个就是类型化数组具有静态的`of`和`from`方法类似于常规的数组，唯一的区别就是最终返回的是一个类型化数组而不是常规化的数组。
```js
Int16Array.of(25, 50),
floats = Float32Array.from([1.5, 2.5]);

console.log(ints instanceof Int16Array);        // true
console.log(floats instanceof Float32Array);    // true
console.log(floats instanceof Array) // false

console.log(ints.length);       // 2
console.log(ints[0]);           // 25
console.log(ints[1]);           // 50

console.log(floats.length);     // 2
console.log(floats[0]);         // 1.5
console.log(floats[1]);         // 2.5
```

### 类型化数组和常规数组的区别
类型化数组和常规数组之间最重要的区别是类型化数组不是常规数组。类型化数组不从`Array`继承并且`Array.isArray`在传递类型化数组时返回`false`
```js
ints = new Int16Array([25, 50]);

console.log(ints instanceof Array);     // false
console.log(Array.isArray(ints));       // false
console.log(Object.prototype.toString.call(ints)) // "[object Int16Array]"
```
### 类型化数组和常规数组的行为差异
常规数组在与它们交互时可以改变大小，但是类型化数组始终保持相同的大小。不能像使用常规数组那样为类型化数组中的不存在的数字索引赋值，因为类型化数组会忽略该操作。
```js
ints = new Int16Array([25, 50]);

console.log(ints.length);          // 2
console.log(ints[0]);              // 25
console.log(ints[1]);              // 50

ints[2] = 5;

console.log(ints.length);          // 2
console.log(ints[2]);              // undefined
```
这个就类似于上面提到的那样，不可以通过`length`修改数组大小。

类型化数组也会检查数据类型
```js
ints = new Int16Array(["hi"]);

console.log(ints.length);       // 1
console.log(ints[0]);           // 0
```
我们知道，他不支持`string`,这是个无效的数据，他会以`0`来代替。

修改类型化数组中的值的所有方法都会被强制执行相同的限制。看下面`map`来修改:
```js
ints = new Int16Array([25, 50]),
mapped = ints.map(v => "hi");

console.log(mapped.length);        // 2
console.log(mapped[0]);            // 0
console.log(mapped[1]);            // 0

console.log(mapped instanceof Int16Array);  // true
console.log(mapped instanceof Array);       // false
```

### 缺失的方法
虽然上面列出了不少共有的方法，但是有些方法还是不存在类型化数组中的(会对数据进行突变)。
- `concat()`
- `pop()`
- `push()`
- `shift()`
- `splice()`
- `unshift()`

除了`concat`方法之外，此列表中的方法可以更改数组的大小。因为型化数组不能更改大小，所以这些数组不适用于类型化数组。至于为什么不能使用`concat`方法， 因为可能连接的两个数组不是相同类型的，这个就和类型化数组的初衷相悖了。

### 添加的方法
类型化数组在常规数组方法的基础上添加了两个新的方法`set`和`subarray`。
这两个方法是相反的，因为`set`将另一个数组复制到现有的类型化数组中，而`subarray`将现有类型数组的一部分提取到新的类型数组中。

`set`方法接受一个数组（`typed`或`regular`）和一个可选的偏移量来插入数据,如果没有传递任何内容，则偏移量默认为`0`。数组参数中的数据将复制到目标类型数组中，同时确保仅使用有效的数据类型。如下:
```js
ints = new Int16Array(4);

ints.set([25, 50]);
ints.set([75, 100], 2);

console.log(ints.toString());   // 25,50,75,100
```
很方便对不对，可以直接进行设置。

`subarray`方法接受可选的开始和结束索引（结束索引是独占的，类`slice`方法的索引）并返回一个新的类型化数组。在这里你甚至可以省略两个参数，来创建一个类型化数组的克隆版本。
```js
ints = new Int16Array([25, 50, 75, 100]),
subints1 = ints.subarray(),
subints2 = ints.subarray(2),
subints3 = ints.subarray(1, 3);

console.log(subints1.toString());   // 25,50,75,100
console.log(subints2.toString());   // 75,100
console.log(subints3.toString());   // 50,75
```
可以发现，使用起来也很方便不是。
