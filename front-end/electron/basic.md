用近一个月的时间写了个electron app.碰到了一些坑，这里记录下。

- code splitting

  编译之后，路由跳转，发现页面是空白的，查看sources,找不到。
  [原因是browserHistory different hashHistory](https://github.com/electron-userland/electron-builder/issues/2167)

- update notice

  这里耽误了不少时间，公司内部的系统，代码托管在gitlab，想直接在gitlab上做更新，不行，自己搭了一个服务器可以，页面读取yml发现和gitlab的不同，
  不是纯文本(raw&blob)。[比如这个纯文本raw](https://raw.githubusercontent.com/xiaohesong/electron-auto-update/master/dist/latest.yml)
  就可以。
  
  因为项目是私有的，所以需要private-token,这个在access-token里加一个就可以了。但是这里是有问题的，[可查看这个issue](https://github.com/electron-userland/electron-builder/issues/3076)
  这个已经修复，我目前的版本是:
  ```json
  "electron-updater": "3.0.2",
  "electron": "^2.0.3",
  "electron-builder": "20.23.1",
  ```

- react code splitting

  这个不可以工作，是因为[browserHistory different hashHistory](https://github.com/electron-userland/electron-builder/issues/2167)
  
  

