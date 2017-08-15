Rails的框架太重,很多人以Api为主的项目,都会选择其他的框架.`sinatra`,`rabl`,`grape`..诸如此类的框架.
其实用Rails也还是可以的.直接`controller`继承自`ActionControll::Metal`.仅仅加载用到的模块的模块.
[参考这里](https://www.slideshare.net/artellectual/developing-api-with-rails-metal)
