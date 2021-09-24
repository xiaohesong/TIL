缓存，这个就好说了，浏览器自己会给你缓存。

- Cache-Control

  如果这个设置了时间， 那么第一次加载的时候会把资源写入磁盘存起来，后续的请求在这一段时间之内，都会去优先在本地去读取，如果找不到资源会去服务器请求。
  所以为啥在前端项目里设置资源`hash`值，为的就是唯一。
  
  
  
- 304

  **这个是在Cache-Control没有设置的情况下** ，不会请求浏览器本地的缓存，会去服务器请求资源。 
  请求的头部有携带`If-Modified-Since: time; If-None-Match: W/"1a3a-16565bcda71"`,会和服务器的`etag`进行匹配，如果相同，服务器认为你没有更改
  资源，那么就会返回给你304告诉你没有改变数据。但是这个是有http交互的，还是有请求时间的。
  
  
  
> 复习的时候发现上面说的不明了

强制缓存：

- http1.0 用的 Expires
- http1.1 用的 Cache-Control

Expires 和 Cache-Control 共存的时候，Cache-Control 的优先级要高。

> 为啥Expires会被Cache-control所代替，主要是Expires有误差(比如时区的问题)。

协商缓存用的是： 

- Last-Modified/If-Modified-Since
- Etag/If-None-Match

Etag/If-None-Match优先级比Last-Modified/If-Modified-Since高

强制缓存优先于协商缓存。

参考： 
- [anhuiliujun cache](https://github.com/anhuiliujun/anhuiliujun.github.io/blob/master/_posts/2016-11-28-cache.markdown)
- [HTTP缓存之协商缓存和强制缓存](https://zhuanlan.zhihu.com/p/143064070)


