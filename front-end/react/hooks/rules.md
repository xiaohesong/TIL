`Hooks`是`JavaScript`函数，但在使用它们时需要遵循两个规则。我们提供了一个`linter`插件来自动执行这些规则：

## 只可以在顶层调用Hook
**不要在循环，条件或嵌套函数中调用Hook。** 相反，总是在`React`函数的顶层使用`Hooks`。通过遵循此规则，可以确保每次组件呈现时都以相同的顺序
调用`Hook`。这就是允许`React`在多个`useState`和`useEffect`调用之间正确保留`Hook`状态的原因。 （如果你很好奇，
我们[将在下面](https://github.com/xiaohesong/TIL/new/master/front-end/react/hooks#%E8%AF%A6%E7%BB%86%E8%AF%B4%E6%98%8E)深入解释。）

## 只从`React Functions`调用`Hooks`
**不要从常规`JavaScript`函数中调用`Hook`。** 相反，你可以：
- 从React函数组件调用Hooks。
- 从自定义Hooks调用Hooks(后面会介绍到)

通过遵循此规则，可以确保组件中的所有有状态逻辑从其源代码中清晰可见。

## ESLint Plugin
我们发布了一个名为[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)的ESLint插件，它强制执行这两个规则。如果您想尝试，可以将此插件添加到项目中：
```shell
npm install eslint-plugin-react-hooks@next
```
```config
// Your ESLint configuration
{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error"
  }
}
```
将来，有打算默认将此插件包含在`Create React App`和类似的工具包中。

## 详细说明
之前有说过，一个组件可以配置多个状态变量或者效果钩子：
```js
function Form() {
  // 1. Use the name state variable
  const [name, setName] = useState('Mary');

  // 2. Use an effect for persisting the form
  useEffect(function persistForm() {
    localStorage.setItem('formData', name);
  });

  // 3. Use the surname state variable
  const [surname, setSurname] = useState('Poppins');

  // 4. Use an effect for updating the title
  useEffect(function updateTitle() {
    document.title = name + ' ' + surname;
  });

  // ...
}
```
那么`React`如何知道哪个状态对应于哪个`useState`调用？答案是 **`React`依赖于调用`Hooks`的顺序。** 我们的示例有效，因为Hook调用的顺序在每个渲染上都是相同的：
```js
// ------------
// First render
// ------------
useState('Mary')           // 1. 初始化`name`状态变量为 'Mary'
useEffect(persistForm)     // 2. 添加一个效果
useState('Poppins')        // 3. 初始化`surname`状态变量为 'Poppins'
useEffect(updateTitle)     // 4. 添加一个效果

// -------------
// Second render
// -------------
useState('Mary')           // 1. 读取`name`状态变量 (参数被忽略)
useEffect(persistForm)     // 2. 替换之前的效果
useState('Poppins')        // 3. 类似于上面的`name state`
useEffect(updateTitle)     // 4. 也是替换成现在的这个
// ...
```
只要`Hook`调用的顺序在渲染之间是相同的，`React`就可以将一些本地状态与它们中的每一个相关联。但是如果我们在条件中放置Hook调用（例如，persistForm效果）会发生什么？
```js
useState('Mary')           // 1. 读取`name`状态变量 (参数被忽略)
// useEffect(persistForm)  // 🔴这个Hook被干掉了
useState('Poppins')        // 🔴 2 (但是之前是第三步). 读取`surname`状态变量失败
useEffect(updateTitle)     // 🔴 3 (但是之前是第四步). 替换`effect`失败
```
`React`不知道第二次`useState Hook`调用返回什么。 `React`期望此组件中的第二个`Hook`调用对应于`persistForm`效果，就像在前一个渲染中一样，但它不再存在。从那时起，在我们跳过的那个之后的每个下一个`Hook`调用也会移动一个，导致错误。

**这就是为什么我们需要在组件顶层调用`Hook`的原因。**  如果我们想要有条件地运行一个效果，我们可以把这个条件放在我们的`Hook`中：
```js
useEffect(function persistForm() {
    // 👍 We're not breaking the first rule anymore
    if (name !== '') {
      localStorage.setItem('formData', name);
    }
  });
```
请注意，**如果使用提供的lint规则，则无需担心此问题。** 但是现在你也知道为什么`Hooks`以这种方式工作，以及规则阻止了哪些问题。

