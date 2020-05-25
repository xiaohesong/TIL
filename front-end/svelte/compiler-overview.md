svelte小记

## compile

解析:

1. 解析源码成为抽象语法树(AST)
2. 跟踪引用和依赖项
3. 创建代码块和fragments
4. 生成代码

大致可以用下图来解释：

![](https://lihautan.com/static/8ab733c6a095f91034a7e221221fcdb4/ae92f/overview.png)

如果用一段伪代码来实现，就是：

```js
const source = fs.readFileSync('App.svelte');

// parse source code into AST
const ast = parse(source);

// tracking references and dependencies
const component = new Component(ast);

// creating code blocks and fragments
const renderer =
  options.generate === 'ssr' ? SSRRenderer(component) : DomRenderer(component);

// Generate code
const { js, css } = renderer.render();

fs.writeFileSync('App.js', js);
fs.writeFileSync('App.css', css);
```

### 1.解析源码到AST

![](https://lihautan.com/static/6f446bed0985ebf8426f93d997165343/ae92f/step-1.png)

```js
// parse source code into AST
const ast = parse(source);
```

Svelte是HTML的超级。Svelte实现了自己的解析器用于Svelte语法，处理<script>和<style>。

怎么处理的呢？当这个解析器碰到<script>标签的时候，使用[acorn](https://www.npmjs.com/package/acorn)去解析标签内的内容。当解析器碰到<style>标签时，使用[css-tree](https://www.npmjs.com/package/css-tree)去解析CSS内容。

并且，Svelte解析器区别对待了script的实例，<script>和module script，<script context="module">。

Svelte的AST就像下面这样：

```js
{
  html: { type: 'Fragment', children: [...] },
  css: { ... },
  instance: { context: 'default', content: {...} },
  module: { context: 'context', content: {...} },
}
```

可以在[ASTExplorer](https://astexplorer.net/#/gist/828907dd1600c208a4e315962c635b4a/e1c895d49e8899a3be849a137fc557ba66eb2423)试试Svelte的解析器。可以在**HTML > Svelte**下找到。

##### 源码的何处是解析器

解析从[这里](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/index.ts#L79)开始。解析器在[src/compiler/parse/index.ts](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/parse/index.ts)实现。

##### 哪里可以学习Javascript中的解析

[“JSON Parser with JavaScript”](https://lihautan.com/json-parser-with-javascript)这个文章里有介绍，并指导一步步的写了一个JSON解析器。

如果第一次看解析器，还是狠推荐去学习一下上文。

### 2.跟踪引用和依赖

![](https://lihautan.com/static/b72ac678bfbb893f0087ea4bafa5f264/ae92f/step-2.png)

```js
// tracking references and dependencies
const component = new Component(ast);
```

在这一步，Svelte会traverse这个AST去跟踪所有声明和引用的变量及依赖项。

##### a. Svelte创建一个Component实例

`Component`这个类，存储Svelte组件的信息，包含信息如下：

- HTML片段，[`fragment`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L52)
- 实例的脚本和模块脚本的AST及其词法作用域，[`instance_scope`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L54)和[`module_scope`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L53)
- 实例的变量，[`vars`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L62)
- reactive的变量，[`reactive_declarations`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L71)
- [`slots`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L94)
- [使用的变量名](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L351)用以防止当创建临时变量时命名冲突。
- [warnings](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L43)和[errors](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L396)
- [compile options](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L51)和[ignored warnings](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts#L44)

##### b. Traverse 实例脚本和模块脚本的 AST

`Component`会遍历(traverse)AST的实例脚本和模块脚本去 **找出所有的声明，引用和更新的变量** 。

Svelte会在遍历模版之前标识出所有可用的变量。当在遍历模版的过程中遇到变量时，Svelte会标记这个变量被模板引用了(`referenced`)。

##### c. Traverse template(遍历模板)

Svelte会遍历模板的AST，并且会从这个模板AST创建一个[Fragment](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Fragment.ts)树。

每个fragment节点会包含一些信息：

**- expression and dependencies（表达式和依赖关系）**

逻辑块(`{#if}`)，mustache标签(`{ data }`)，包含表达式和表达式的依赖项。

**- scope**

`{#each}`和`{#await}`逻辑块及`let:`绑定，为子模板创建了新的变量。

Svelte为AST中的每种类型的节点创建不同的片段节点，因为不同类型的片段节点处理事情的方式不同

- [Element node](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Element.ts)验证[attribute](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Element.ts#L280)，[bindings](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Element.ts#L461)，[content](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Element.ts#L647)，[event handlers](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Element.ts#L658)
- [Slot node](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/Slot.ts)注册了一个slot名称到`Component`
- [EachBlock node](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/nodes/EachBlock.ts)创建了一个新的作用域和跟踪迭代列表里的`key`，`index`和名称，
- 还有其他的一些

##### d. Traverse 实例脚本 AST

遍历模板后，Svelte就知道组件中是否更新或引用了某个变量。

有了这些信息，Svelte尝试为优化输出做一些准备，譬如：

- 确定哪些变量或函数可以安全的从`instance`函数提升。
- 确定反应性的声明不需要反应。

##### e. 更新CSS选择器去组件内样式声明

Svelte更新CSS选择器，在必要时向选择器添加`.Svelte -xxx` class。

在这一步的最后，Svelte有足够的信息来生成编译后的代码，下一个步骤再看。

##### 哪里可以找到这个源码

可以从[这里](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/index.ts#L83-L90)开始拜读。其中`Component`实现在[src/compiler/compile/Component.ts](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/Component.ts)。

##### 在哪里可以学习有关JavaScript遍历(traversing)的信息

[“Manipulating AST with JavaScript”](https://lihautan.com/manipulating-ast-with-javascript#traversing-an-ast)这个文章里有相关的知识点。

### 3.创建代码块和片段

![Step 3](https://lihautan.com/static/f3876e59140a31ded960358a9c5dfab8/799d3/step-3.png)

```js
// creating code blocks and fragments
const renderer =
  options.generate === 'ssr' ? SSRRenderer(component) : DomRenderer(component);
```

在这一步，Svelte创建了一个`Renderer`实例，该实例跟踪生成编译输出所需的必要信息。取决于输出DOM还是SSR代码([参见编译选项中的generate](https://svelte.dev/docs#svelte_compile))， Svelte分别实例化不同的`Renderer`。

##### DOM Renderer

DOM Renderer保持跟踪[一个块](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_dom/Renderer.ts#L31)和一个[上下文](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_dom/Renderer.ts#L28)。

一个[Block](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_dom/Block.ts)包含代码片段去生成[`create_fragment`](https://lihautan.com/compile-svelte-in-your-head-part-1/#create_fragment)函数。

上下文跟踪一个[实例变量](https://lihautan.com/compile-svelte-in-your-head-part-2/#ctx)列表，并呈现在编译输出的`$$.ctx`中。

在renderer中，Svelte从片段树创建了一个[渲染树](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_dom/wrappers/Fragment.ts)。

渲染树中的每个节点都实现了render函数，该函数生成用于创建和更新该节点的DOM的代码。

##### SSR Renderer

SSR渲染器提供了一些帮助来在编译后的输出中生成[模板文本](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)，比如[`add_string(str)`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_ssr/Renderer.ts#L63)和[`add_expression(node)`](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_ssr/Renderer.ts#L67)。

##### `Renderer`在源码的哪里可以找到

DOM Renderer实现在[src/compiler/compile/render_dom/Renderer.ts](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_dom/Renderer.ts)，SSR Renderer实现在[src/compiler/compile/render_ssr/Renderer.ts](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_ssr/Renderer.ts)。

### 4. 生成代码

![Step 4](https://lihautan.com/static/adc36d2564cf00a8bb1e20058c100e29/799d3/step-4.png)

```js
// Generate code
const { js, css } = renderer.render();
```

不同的渲染器以不同的方式渲染。

**DOM Renderer** 遍历渲染树并在此过程中调用每个节点的`render`函数。`Block`实例被传递到`render`函数中，因此每个节点都将代码插入到适当的`create_fragment`函数中。

另一方面，**SSR Renderer** 依赖于不同的[**节点处理程序**](https://github.com/sveltejs/svelte/blob/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/compiler/compile/render_ssr/Renderer.ts#L23-L40)将字符串或表达式插入最终模板文字中。

render函数返回`js`和`css`，分别通过rollup的[rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)和webpack的[svelte-loader](https://github.com/sveltejs/svelte-loader)用于bundler使用。

## runtime

为了在编译输出中删除重复的代码，Svelte提供了util函数，可以在[src/runtime/internal](https://github.com/sveltejs/svelte/tree/aa3dcc06d6b0fcb079ccd993fa6e3455242a2a96/src/runtime/internal)中找到它，例如：

- dom相关的， `append`, `insert`, `detach`
- 调度相关的， `schedule_update`, `flush`
- 声明周期相关，onMount`, `beforeUpdate
- 动画相关的，`create_animation`

参考：[svelte-compiler-handbook](https://lihautan.com/the-svelte-compiler-handbook/)



