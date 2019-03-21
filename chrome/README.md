1. 浏览器会自动记住https的模式，并直接跳转过去。
   因为网站由之前的(https)转到了(http)， 直接输入域名会跳转到(https)。

   解决方法是在(chrome://net-internals/#hsts)里找到`Delete domain security policies`然后输入你的域名点击`delete`
