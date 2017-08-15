### Middleware Metal的区别
Middleware 是 `Action Dispatch` 实现的，而 Metal 是 `Action Controller` 实现的。
Middleware 是在请求进入 `action` 之前，而 Metal 是在请求进入 `action` 之后。
Middleware 需要的环境是 `env`，作用的是 `app`；而 Metal 增强组件需要的环境是 `Controller & action`，目的主要是对请求做处理，并响应。
