之前一直没有注意`package.json`里的`main`和`module`字段，之前也不知道，看到sortablejs里有module就顺带查了下，感觉还不错。

这两个都是设置引入文件的入口，但是有优先级，默认是`module`高于`main`字段，这个也可以改变他的优先级。

默认优先级在webpack模式下，会根据`target`属性来确定`mainFields`属性：

- web, webworker 或者其他的target值，默认的顺序是:
   
  `mainFields: ["browser", "module", "main"]`
  
- node
  
  `mainFields: ["module", "main"]`
  
 
可以发现，默认情况下，main的优先级是很低的。

rollup的也可以看看： https://github.com/rollup/rollup/wiki/pkg.module

参考：https://2ality.com/2017/04/setting-up-multi-platform-packages.html
