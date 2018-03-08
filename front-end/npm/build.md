这里我们要说的是如何创建一个自己的`npm`包。

首先在`npm`[官网注册](www.npmjs.com)一个账号,然后验证邮箱。

比如我创建了一个`aliyun-product-js-sdk`.先创建一个文件夹，就是你的包名字。

- npm init

这个是初始化包管理。

- npm login

这个是输入用户名密码登陆到`npm`

- npm publish

这个是发布到`npm`。

- npm link

这个是本地测试使用。

```shell
cd path/my_project
npm link path/my_npm_package
```

这样就可以直接引入了，修改之后，重新引入.
