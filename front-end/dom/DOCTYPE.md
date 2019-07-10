写html页面的时候，首行就必须是要写一个`DOCTYPE`。

首先需要声明的一点就是**DOCTYPE** 是开头必要的。你可能会说，我不写也可以运行啊，似乎没啥问题啊。

那么看看这个是干啥的，我们再回来说到底有没有问题。

> **注意：** 我们需要确定一点，为什么需要这个DOCTYPE。因为遗留原因。如果你省略了这个声明，浏览器会倾向于使用一些与规范不兼容的其他渲染模式。换句话说，document里包含了DOCTYPE，就可以确保浏览器尽可能的去遵守相关的规范。

既然都这么说了，如果不写这个声明会有什么问题？不兼容的问题。例如css或者html不兼容等。如果你没有写，并且没有出现问题，那么只能说明你的运气比较好，赶紧偷偷的加上这个说明。

DOCTYPE必须由以下组件组成，顺序如下:

1. 一个[不区分大小写的ASCII](https://www.w3.org/TR/html5/infrastructure.html#ascii-case-insensitive)字符串匹配"`&lt;!DOCTYPE`"（`<!DOCTYPE`）

   > 以 **ASCII不区分大小写** 的方式比较两个字符串意味着精确地比较它们，代码点对代码点，除了范围为U+0041到U+005A(即，拉丁文大写字母A至拉丁文大写字母Z)及U+0061至U+007A范围内的对应字符(即，拉丁文小写字母A到拉丁文小写字母Z)也被认为是匹配的。

2. 一个或多个[空格字符](https://www.w3.org/TR/html5/infrastructure.html#space-characters)。(`<!DOCTYPE `)

   > 就本规范而言，空格字符是 U+0020 SPACE, U+0009 CHARACTER TABULATION (tab), U+000A LINE FEED (LF), U+000C FORM FEED (FF), and U+000D CARRIAGE RETURN (CR).

3. 一个[不区分大小写的ASCII](https://www.w3.org/TR/html5/infrastructure.html#ascii-case-insensitive)字符串匹配"`html`"(`<!DOCTYPE html`)

4. 零个或多个空格字符。

5. 可选的，DOCTYPE遗留字符串，下面会说。

6. 一个U+003E大于符号字符(>)。(`<!DOCTYPE html>`)

> **注意：** 换句话说，`<!DOCTYPE html>` , 不区分大小写。

对于无法使用简短DOCTYPE "`<！DOCTYPE html>`"输出HTML标记的HTML生成器，可以将 **DOCTYPE遗留字符串** 插入DOCTYPE（在上面定义的位置）。该字符串必须包含：

1. 一个或多个[空格字符](https://www.w3.org/TR/html5/infrastructure.html#space-characters)。(`<!DOCTYPE html >`)
2. 一个[不区分大小写的ASCII](https://www.w3.org/TR/html5/infrastructure.html#ascii-case-insensitive)字符串匹配"`SYSTEM`" (`<!DOCTYPE html SYSTEM>`)
3. 一个或多个[空格字符](https://www.w3.org/TR/html5/infrastructure.html#space-characters)。(`<!DOCTYPE html SYSTEM >`)
4. U+0022引号或U+0027撇号字符(引号)。(`<!DOCTYPE html SYSTEM '>`)
5. 文字字符串"`about: legacy-compat`"。(`<!DOCTYPE html SYSTEM 'about: legacy-compat>`)
6. 一个匹配的U+0022引号或U+0027撇号字符(即，与前一步(4)标记为引号的字符相同)。 (`<!DOCTYPE html SYSTEM 'about: legacy-compat'>`)

> **注意：** 换句话说，就是`<!DOCTYPE html SYSTEM "about:legacy-compat">` 或 `<!DOCTYPE html SYSTEM 'about:legacy-compat'>`, 不区分大小写，但是引号中的内容除外(区分大小写)。

不应该使用DOCTYPE遗留字符串，除非你无法从较短字符串的系统生成文档。

