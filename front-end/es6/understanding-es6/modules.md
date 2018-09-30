# 什么是模块
模块就是`javascript`文件以不同方式去加载(这个就和`scripts`的方式相反了，`scripts`是以原始的`javascript`工作方式加载的)。这种不同的模式很有必要，并且他们代表的语义也是不一样的：
- 模块模式会自动运行在严格模式下，没有办法选择。
- 模块顶层创建的变量不会共享到全局范围，仅在模块的范围内。
- 模块的顶层的`this`值是`undefined`。
- 模块不允许在代码中使用HTML样式的注释（`JavaScript`早期浏览器时代的遗留功能）。
- 模块必须导出模块外部代码可用的任何内容。
- 模块可以从其他模块导入绑定

这些差异乍一看似乎很小，但它们代表了`JavaScript`代码加载和评估方式的重大变化，下面会进行介绍。模块的真正强大之处在于能够仅导出和导入所需的内容，而不是文件中的所有内容。

### Basic Exporting
使用`export`把外部需要的内容导出。在最简单的情况下，将`export`放在任何变量，函数或类声明的前面，这样从模块中导出它。

```js
export var name = 'my name'
export const say = () => 'your name'

// this function is private to the module
function subtract(num1, num2) {
    return num1 - num2;
}

// define a function...
function multiply(num1, num2) {
    return num1 * num2;
}

// ...and then export it later
export { multiply };
```
可以看出，每个导出都有个名称，除非你导出默认(后面会说)。否则没法子使用这个语法导出匿名函数或类。当然也可以声明之后再导出。

### Basic Importing
```js
import { identifier1, identifier2 } from "./example.js";
```
这个看起来类似于解构对象，但它不是。
当你从`module import`的时候，他的行为就像`const`一样。这意味着无法定义具有相同名称的另一个变量（包括导入同名的另一个`export`），在`import`语句之前使用标识符，或更改值。

### Importing All of a Module
```js
import * as example from "./example.js";
```
这里值得一提的是，无论在`import`语句中使用模块多少次，模块都只执行一次。在导入模块的代码执行之后，实例化的模块保存在内存中，并在另一个`import`语句引用它时重用。
```js
import { sum } from "./example.js";
import { multiply } from "./example.js";
import { magicNumber } from "./example.js";
```
尽管这里使用了多次`module`,但是只会加载一次。如果同一应用程序中的其他模块要从`example.js`导入，那么这些模块将使用此代码使用的相同模块实例。

> 模块语法限制
    导出和导入的一个重要限制是它们必须在其他语句和函数之外使用。
> ```js
>    if (flag) {
>        export flag;    // syntax error
 >   }
 > ```
> `export`在`if`语句里，这是不被允许的。`export`是不可以有条件的，也不可以以其他的方式动态`export`。这是为了静态的确定需要导出的内容。
同样的，`import`也存在这个限制:
>```js
>function tryImport() {
>    import flag from "./example.js";    // syntax error
>}
>```
你不可以动态的导入模块就像你不能动态的导出模块那样。导出和导入关键字设计为静态，因此文本编辑器等工具可以轻松地告知模块中可用的信息。

### A Subtle Quirk of Imported Bindings
这个是有些意思，你可以在导出的内部更改，但是导出之后，就不可以更改了。
```js
# export.js
export var name = "Nicholas";
export function setName(newName) {
    name = newName;
}

# import.js
import { name, setName } from "./example.js";

console.log(name);       // "Nicholas"
setName("Greg");
console.log(name);       // "Greg"

name = "Nicholas";       // error
```

### Renaming Exports and Imports
这个就是通过`as`来改名字。
```js
#export.js
function sum(num1, num2) {
    return num1 + num2;
}

export { sum as add };

#import.js
import { add as sum } from "./example.js";
console.log(typeof add);            // "undefined"
console.log(sum(1, 2));             // 3
```

### Exporting Default Values
这个和上面的差不多，就是在导出的时候加上`default`关键字。大同小异吧。

### Importing Without Bindings
某些模块可能不会导出任何内容，而只是对全局范围内的对象进行修改。尽管模块内的顶级变量，函数和类不会自动结束于全局范围，但这并不意味着模块无法访问全局范围。
可以在模块内部访问内置对象（如`Array`和`Object`）的共享定义，对这些对象的更改将反映在其他模块中。
```js
#export.js
// module code without exports or imports
Array.prototype.pushAll = function(items) {

    // items must be an array
    if (!Array.isArray(items)) {
        throw new TypeError("Argument must be an array.");
    }

    // use built-in push() and spread operator
    return this.push(...items);
};

#import.js
import "./export.js";

let colors = ["red", "green", "blue"];
let items = [];

items.pushAll(colors);
```
像这种没有具体内容的导出，多用于垫片之类的功能。

### Loading Modules
虽然ECMAScript 6定义了模块的语法，但它没有定义如何加载它们。这是规范的复杂性的一部分，该规范应该与实现环境无关。
`ECMAScript 6不是尝试创建适用于所有`JavaScript`环境的单一规范，而是仅指定语法并将加载机制抽象为未定义的内部操作`HostResolveImportedModule`。
`Web`浏览器和`Node.js`将决定如何以对各自环境有意义的方式实现`HostResolveImportedModule`。

#### Using Modules in Web Browsers
`ECMAScript 6`之前，`Web`浏览器就有多种方法可以在`Web`应用程序中包含`JavaScript`。脚本加载有：
1. 使用带有`src`属性的`<script>`元素加载`JavaScript`代码文件，该属性指定加载代码的位置。
2. 使用没有`src`属性的`<script>`元素嵌入`JavaScript`代码。
3. 加载`JavaScript`代码文件以作为`worker`（例如`web worker`或`service worker`）执行。

为了完全支持模块，`Web`浏览器必须更新每个机制。这些细节在`HTML`规范中定义，在这里对它们进行总结。

###### Using Modules With <script>
    
`<script>`元素的默认行为是将`JavaScript`文件作为脚本（而不是模块）加载。缺少`type`属性或`type`属性包含`JavaScript`内容类型（例如`“text / javascript”`）时会发生这种情况。然后，`<script>`元素可以执行内联代码或加载`src`中指定的文件。为了支持模块，“模块”值被添加​​为类型选项。将类型设置为`“module”`会告诉浏览器将`src`指定的文件中包含的任何内联代码或代码作为模块而不是脚本加载。

```js
<!-- load a module JavaScript file -->
<script type="module" src="module.js"></script>

<!-- include a module inline -->
<script type="module">

import { sum } from "./example.js";

let result = sum(1, 2);

</script>
```

第一个加载外部的`module`.第二个<script>元素包含直接嵌入网页的模块。变量结果不会全局公开，因为它仅存在于模块中（由<script>元素定义），因此不会作为属性添加到窗口中。

正如所见，包括网页中的模块相当简单，类似于包含脚本。但是，模块的加载方式存在一些差异。

> 可能已经注意到“模块”不是像`“text / javascript”`类型那样的内容类型。模块`JavaScript`文件使用与脚本`JavaScript`文件相同的内容类型提供，
因此无法仅根据内容类型进行区分。此外，当类型无法识别时，浏览器会忽略`<script>`元素，因此不支持模块的浏览器将自动忽略`<script type =“module”>`行，
从而提供良好的向后兼容性。

###### Module Loading Sequence in Web Browsers

模块的独特之处在于，与脚本不同，它们可以使用import来指定必须加载其他文件才能正确执行。为了支持该功能，`<script type =“module”>`始终表现为
应用了`defer`属性。`defer`属性对于加载脚本文件是可选的，但始终应用于加载模块文件。 一旦HTML解析器遇到带有`src`属性的`<script type =“module”>`，
模块文件就会开始下载，但是在完全解析`Document`之后才会执行。模块也按它们在`HTML`文件中出现的顺序执行。这意味着第一个`<script type =“module”>`
始终保证在第二个之前执行，即使一个模块包含内联代码而不是指定`src`。

[关于defer和async作用的script可以戳这里了解](https://github.com/xiaohesong/TIL/blob/master/front-end/javascript/events/%E9%A1%B5%E9%9D%A2%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.md#domcontentloaded)

```js
<!-- this will execute first -->
<script type="module" src="module1.js"></script>

<!-- this will execute second -->
<script type="module">
import { sum } from "./example.js";

let result = sum(1, 2);
</script>

<!-- this will execute third -->
<script type="module" src="module2.js"></script>
```
每个模块可以从一个或多个其他模块导入，这使问题复杂化。 这就是为什么首先完全解析模块以识别所有`import`语句的原因。 然后，每个`import`语句都会触发一次
获取（来自网络或来自缓存），并且在首次加载和执行所有导入资源之前不会执行任何模块。

所有模块，包括使用`<script type =“module”>`显式包含的模块和使用import隐式包含的模块，都按顺序加载和执行。在前面的示例中，完整的加载顺序是：

1. 下载解析`module1.js.`
2. 递归下载并解析`module1.js`中的导入资源。
3. 解析内联模块。
4. 递归下载并解析内联模块中的导入资源
5. 下载解析`module2.js`
6. 递归下载并解析`module2.js`中的导入资源。

加载完成后，在文档完全解析之后才会执行任何操作。文档解析完成后，将执行以下操作:
1. 递归执行`module1.js`的导入资源
2. 执行 `module1.js`
3. 递归执行内联模块的导入资源
4. 执行内联模块
5. 递归执行`module2.js`的导入资源
6. 执行`module2.js`

内联模块的作用与其他两个模块类似，不是先下载代码。加载导入资源和执行模块的顺序完全相同。

> 在`<script type =“module”>`上会忽略`defer`属性，因为它的行为就像应用了defer一样。

###### Asynchronous Module Loading in Web Browsers
与脚本一起使用时，`async`会在下载和解析文件后立即执行脚本文件。 但是，文档中异步脚本的顺序不会影响脚本的执行顺序。 脚本在完成下载后始终执行，而不等待包含文档完成解析。

`async`属性也可以应用于模块。 在`<script type =“module”>`上使用`async`会导致模块以类似于脚本的方式执行。 唯一的区别是模块的所有导入资源都是在执行模块之前下载的。 这保证了模块执行前所需的所有资源都将被下载; 但是你无法保证模块何时执行。看下面的代码：
```js
<!-- 不确定哪个先被执行 -->
<script type="module" async src="module1.js"></script>
<script type="module" async src="module2.js"></script>
```

###### Loading Modules as Workers

`Web Worker`和`Service Worker`等`Worker`在`Web`页面上下文之外执行`JavaScript`代码。 创建新`worker`需要创建一个新的实例`Worker`（或另一个类）并传入`JavaScript`文件的位置。 默认加载机制是将文件作为脚本加载，如下所示：

```js
// load script.js as a script
let worker = new Worker("script.js");
```

为了支持加载模块，`HTML`标准的开发人员为这些构造函数添加了第二个参数，第二个参数是一个具有`type`属性的对象，其默认值为`“script”`。您可以将类型设置为`“module”`以加载模块文件：

```js
// load module.js as a module
let worker = new Worker("module.js", { type: "module" });
```

`module type worker`一般类似于`script type worker`，但是有些例外。
首先，`script worker`限制于同源，但是`module worker`不存在这些同源限制。 虽然`module worker`具有相同的默认限制，
但它们也可以加载具有适当的跨源资源共享（CORS）标头的文件以允许访问。
其次，虽然`script worker`可以使用`self.importScripts`方法将其他脚本加载到`worker`中，但`self.importScripts`总是在`module worker`上失败
，因为更应该使用`import`。
