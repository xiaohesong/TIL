https://github.com/babel/babel/releases/tag/v7.11.0 前段时间babel升级到了7.11.0。

主要的变更包含了几个语法的支持 https://babeljs.io/blog/2020/07/30/7.11.0 。



之前看过一篇文章，[Avoid Heavy Babel Transformations by (Sometimes) Not Writing Modern JavaScript](https://css-tricks.com/avoid-heavy-babel-transformations-by-sometimes-not-writing-modern-javascript/),
感觉现在babel有点这个意思。



但是有些好奇，是怎么包含的，所以就进去看了下。



分成了那么几步：



1. 获取插件
   1. 基本插件
   2. 用户指定的插件
   3. 默认包含的插件
2. 过滤插件

### 获取插件

https://github.com/babel/babel/blob/main/packages/babel-preset-env/src/index.js

#### 基本的一些插件

```js
// 一些基本插件
  const compatData = getPluginList(shippedProposals, bugfixes);
  const pluginLists = {
  withProposals: {
    withoutBugfixes: pluginsList,
    withBugfixes: Object.assign({}, pluginsList, pluginsBugfixesList),
  },
  withoutProposals: {
    withoutBugfixes: filterStageFromList(pluginsList, proposalPlugins),
    withBugfixes: filterStageFromList(
      Object.assign({}, pluginsList, pluginsBugfixesList),
      proposalPlugins,
    ),
  },
};

function getPluginList(proposals: boolean, bugfixes: boolean) {
  if (proposals) {
    if (bugfixes) return pluginLists.withProposals.withBugfixes;
    else return pluginLists.withProposals.withoutBugfixes;
  } else {
    if (bugfixes) return pluginLists.withoutProposals.withBugfixes;
    else return pluginLists.withoutProposals.withoutBugfixes;
  }
}
```

#### 用户指定的插件

`options.include`

#### 默认的插件获取

https://github.com/babel/babel/blob/v7.11.5/packages/babel-preset-env/src/index.js#L97-L148

```js
export const getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom,
  shouldParseTopLevelAwait,
}: {|
  modules: ModuleOption,
  transformations: ModuleTransformationsType,
  shouldTransformESM: boolean,
  shouldTransformDynamicImport: boolean,
  shouldTransformExportNamespaceFrom: boolean,
  shouldParseTopLevelAwait: boolean,
|}) => {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }

    if (
      shouldTransformDynamicImport &&
      shouldTransformESM &&
      modules !== "umd"
    ) {
      modulesPluginNames.push("proposal-dynamic-import");
    } else {
      if (shouldTransformDynamicImport) {
        console.warn(
          "Dynamic import can only be supported when transforming ES modules" +
            " to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled.",
        );
      }
      modulesPluginNames.push("syntax-dynamic-import");
    }
  } else {
    modulesPluginNames.push("syntax-dynamic-import");
  }

  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("proposal-export-namespace-from");
  } else {
    modulesPluginNames.push("syntax-export-namespace-from");
  }

  if (shouldParseTopLevelAwait) {
    modulesPluginNames.push("syntax-top-level-await");
  }

  return modulesPluginNames;
};

const shouldSkipExportNamespaceFrom =
    (modules === "auto" && api.caller?.(supportsExportNamespaceFrom)) ||
    (modules === false &&
      !isRequired("proposal-export-namespace-from", transformTargets, {
        compatData,
        includes: include.plugins,
        excludes: exclude.plugins,
      }));

const modulesPluginNames = getModulesPluginNames({
  modules,
  transformations: moduleTransformations,
  // TODO: Remove the 'api.caller' check eventually. Just here to prevent
  // unnecessary breakage in the short term for users on older betas/RCs.
  shouldTransformESM: modules !== "auto" || !api.caller?.(supportsStaticESM),
  shouldTransformDynamicImport:
    modules !== "auto" || !api.caller?.(supportsDynamicImport),
  shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
  shouldParseTopLevelAwait: !api.caller || api.caller(supportsTopLevelAwait),
});
```



### 过滤插件

主要的过滤是在`filterItems`方法里

```js
const pluginNames = filterItems(
  // {[pluginName]: {chrome: '', safari: 'x'}} 等版本信息
  compatData,
  include.plugins,
  exclude.plugins,
  transformTargets,
  modulesPluginNames,
  getOptionSpecificExcludesFor({ loose }),
  pluginSyntaxMap,
);

```

https://github.com/babel/babel/blob/v7.11.5/packages/babel-helper-compilation-targets/src/filter-items.js#L78

过滤完成之后会对结果再次进行过滤：

```js
removeUnnecessaryItems(pluginNames, overlappingPlugins);
// 去除重复的
export function removeUnnecessaryItems(
  items: Set<string>,
  overlapping: { [name: string]: string[] },
) {
  items.forEach(item => {
    // 存在列出的插件，里面对应的转换移除
    overlapping[item]?.forEach(name => items.delete(name));
  });
}
```

得到需要最终使用到的插件名之后就去`[aviable-plugins.js](https://github.com/babel/babel/blob/v7.11.5/packages/babel-preset-env/src/available-plugins.js)`去获取对应的插件。

有段时间没有关注babel动态，发现此插件包含了`bugfixes, shippedProposals`选项，可以发现，这个选项具有相对的优化作用(通过这些参数来决定要启动哪些插件)。

所以你的`.babelrc.js`里还有很多的配置插件吗？也许他已经在规范里已经更新到了env插件里了，也许那些插件可以让env插件去决定是不是使用，尝试给你的`.babelrc.js`配置文件廋廋身吧。
