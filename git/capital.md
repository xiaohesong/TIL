重命名一些文件的时候，会出现被忽略的情况，不知道各位有没有注意到这个情况。

`src/a.css`变成了`src/A.css`之后，push到远程仓库之后没有被改变。

查了之后，有解决方法：

```shell
git mv src/a.css src/A.css
```

这样就可以生效，但是比较麻烦， 可以自己配置下：

```shell
git config core.ignorecase false
```

具体可以[查看文档](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreignoreCase)。
