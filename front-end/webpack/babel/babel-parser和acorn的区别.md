知道`acorn`是js的解析器，也知道`babel-parser`也是js的解析器，但是他们两个有什么区别吗？

首先，`@babel/parser`（之前就是`babylon`）是从`acorn` fork 出来的，只是基本都被重写了，但是有些acorn的算法仍热被沿用下来了。

他们区别还是有一些的：

- `@babel/parser`不支持第三方的插件。
- `acorn`只支持第四阶段的提案(基本等于写入标准了，只是时间的问题 [见此](https://github.com/tc39/proposals/blob/master/finished-proposals.md))。
- AST的格式不同，不过可以启动`@babel/parser`的`estree`插件来和acorn的AST格式匹配

[babel/issues#11393](https://github.com/babel/babel/issues/11393#issuecomment-611073646)

