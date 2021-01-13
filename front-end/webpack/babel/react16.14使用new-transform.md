## react使用new transform概要

React使用[new transform](https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#detailed-design)。

首先要babel去支持，要把`@babel/preset-react`这个预设插件升级到`[7.9.0](https://babeljs.io/blog/2020/03/16/7.9.0)及以上`.

然后配置如下：

```js
presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.BABEL_ENV !== 'production'
      }
    ],
    // ...
]
```

React使用这个new transform对于版本也有要求，但是不一定需要react@^17才行，详见[此处](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#how-to-upgrade-to-the-new-jsx-transform),可以看到react17及以上,react16.14.0,react15.7.0和react0.14.0版本都支持。

> 笔者从react16.8升级到了react16.14，由于项目庞大，没有直接升级到大版本,但是也整理了react16.8到react16.14.0的变更点。在文章下面罗列了出来，不感兴趣的可以忽视。

升级react(16.14.0)使用new transform 之后 出现：

```js
'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
```

这个是由于ts不支持，预计在[4.1里支持](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#jsx-factories)。

tsconfig 写上之后，发现对应的jsx选项报错：

```js
Argument for '--jsx' option must be: 'preserve', 'react-native', 'react'.
```

这是由于vscode的ts版本，右下角点击版本号之后进行选择4.1.x。

但是发现tsx里移除React声明之后还是会有问题：

```js
Could not find a declaration file for module 'react/jsx-dev-runtime'. '/Users/username/workspace/project/node_modules/react/jsx-dev-runtime.js' implicitly has an 'any' type.
```

这个是因为@types的react和react-dom版本不支持（目前是16.14.0）版本的react，但是@types里没有对应的版本，17以下只到了16.9.1。为了不出现其他的未知问题，没有更新对应的types到17。

创建一个`xxx.d.ts`文件写下：

```tsx
declare module "react/jsx-runtime" {
  export default any;
}
```

这样基本就可以了。



但是升级了ts到4.1之后, [有些报错](https://github.com/microsoft/TypeScript/issues/41359)，这些报错是 4.1.0-dev.20201101 相对于4.0.5 出现的（11.2号机器人报告），后面就发版了4.1-rc及4.1.2，应该不是bug了，eslint没有检测出来，要手动修改：

```js
Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?ts(2794)
lib.es2015.promise.d.ts(33, 34): An argument for 'value' was not provided.
```

讲道理，ts4.1在[ eslint-4.7](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.7.0)中就支持了。但是还是会出问题。并且`no-misused-promises`被设置成了`checksVoidReturn`和`no-floating-promises`设置成`ignoreVoid`为`false`也不行。

那再看一下4.1的breaking，就是 不被支持了。https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#resolves-parameters-are-no-longer-optional-in-promises

但是为了不出现其他的问题，暂时就先这样，打算过段时间再折腾。

>  请原谅笔者现在才发出来，之前在公司里升级后在预发环境上放了近一个月，算下来这次的更新已经过去了两个月左右了。

由于出现了上面的部分加上不确定因素，为了不影响线上，暂时就没有升级了。

> 因为升级的不单单只有babel和react，还有eslint等配置梳理，很多break change。为了不出其他的幺蛾子，ts暂时就不做大的升级，所以new transform暂时也不做ts支持。



### 杂记

升级之后，你可能也有移除import吧。使用react-codemod会有点问题 https://github.com/reactjs/react-codemod/issues/283



## react16.8 -> react16.14.0

### [16.9](https://github.com/facebook/react/releases/tag/v16.9.0)

##### react

- 移除`unstable_ConcurrentMode `

##### react-dom

- 废弃以前 `UNSAFE_*` 周期方法 
- `javascript:`废弃 （**[breaking change](https://github.com/facebook/react/pull/15047)** ，16.x的版本会在dev警告）
- 弃用 [module pattern](https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#deprecate-module-pattern-components) 组件模式
- `useEffect`里调用`setState`造成的循环进行[提示](https://github.com/facebook/react/pull/15180)
- `Suspense`内使用`findDOMNode`[崩溃](https://github.com/facebook/react/pull/15312)的问题
- 改进effect中的setState执行，[流程改进](https://github.com/facebook/react/pull/15650)

### [16.10](https://github.com/facebook/react/releases/tag/v16.10.0)

##### react-dom

- 修复hook更新没有被记忆的情况 [Reset didReceiveUpdate in beginWork](https://github.com/facebook/react/pull/16359)
- unmount的时候清除一些属性来节省内存 [Clear more properties in detachFiber](https://github.com/facebook/react/pull/16807)
- 修复IE10/11的textContent的问题 [prevent firefox marking required textareas invalid](https://github.com/facebook/react/pull/16578)
- 使用Object.is代替其polyfill [Optimize objectIs](https://github.com/facebook/react/pull/16212)

#### [16.10.1](https://github.com/facebook/react/releases/tag/v16.10.1)

##### react-dom

- nextjs 中的问题

#### [16.10.2](https://github.com/facebook/react/releases/tag/v16.10.2)

##### react-dom

- react-native-web 中的问题

### [16.11.0](https://github.com/facebook/react/releases/tag/v16.11.0)

##### react-dom

- 修复`mouseenter `在嵌套的react容器出发两次 [Fix mouseenter handlers fired twice](https://github.com/facebook/react/pull/16928)

### [16.12.0](https://github.com/facebook/react/releases/tag/v16.12.0)

##### react-dom

- 修复`useEffect`的依赖项在多个root节点没有触发 

  - [[Bugfix] Passive effects triggered by synchronous renders in a multi-root app](https://github.com/facebook/react/pull/17347)
  - [useEffect callback never called](https://github.com/facebook/react/issues/17066)

##### react is

- 修复`lazy`和`memo`的type类型 [Fix react-is memo and lazy type checks](https://github.com/facebook/react/pull/17278)


### [16.13.0](https://github.com/facebook/react/releases/tag/v16.13.0)

##### react

- string类型的ref会加上提示 [Add different string ref warning when owner and self are different](https://github.com/facebook/react/pull/17864/files)  后续可以通过[codemod](https://github.com/reactjs/react-codemod)来进行处理
- 废弃`createFactory ` [Add React.createFactory() deprecation warning](https://github.com/facebook/react/pull/17878)
- 冲突的样式规则会触发警告
  - [Re-enable shorthand CSS property collision warning](https://github.com/facebook/react/pull/18002)
  - [Warn about conflicting style values during updates](https://github.com/facebook/react/pull/14181)
  - [16.13.0/warnings-for-conflicting-style-rules](https://reactjs.org/blog/2020/02/26/react-v16.13.0.html#warnings-for-conflicting-style-rules)
- 一个函数组件在另一个组件渲染阶段被更新时触发警告 [Warn for update on different component in render](https://github.com/facebook/react/pull/17099)
- 增加flag，质疑 `unstable_createPortal `，大版本移除，直接改名`createPortal `  
  - [Add unstable_renderSubtreeIntoContainer and unstable_createPortal feature flags](https://github.com/facebook/react/pull/17880)
  - [instead of unstable](https://zh-hant.reactjs.org/blog/2020/02/26/react-v16.13.0.html#deprecating-reactdomunstable_createportal-in-favor-of-reactdomcreateportal)
- 修复`onMouseEnter `在disabled上面触发的问题 [Fix onMouseEnter is fired on disabled buttons ](https://github.com/facebook/react/pull/17675/files)
- dev环境的`StrictMode`会执行生命周期两次，scu也应如此  [StrictMode should call sCU twice in DEV](https://github.com/facebook/react/pull/17942)
- ReactDOM添加version属性
- `dangerouslySetInnerHTML `不要调用toString() [Remove toString of dangerouslySetInnerHTML](https://github.com/facebook/react/pull/17773)

#### [16.13.1](https://github.com/facebook/react/releases/tag/v16.13.1)

##### react dom

- 传统模式([legacy mode](https://zh-hant.reactjs.org/docs/concurrent-mode-adoption.html#migration-step-blocking-mode))下Suspense的effect的clean-up不触发的问题 [Bugfix: Dropped effects in Legacy Mode Suspense](https://github.com/facebook/react/pull/18238)
- 移除在16.13.0添加的警告信息 [Don't fire the render phase update warning for class lifecycles](https://github.com/facebook/react/pull/18330)

#### [16.14.0](https://github.com/facebook/react/releases/tag/v16.14.0)

##### react dom

 - 支持新的jsx转换 [Introducing the New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) 
