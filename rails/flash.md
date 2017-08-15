### Rails flash
- `Rails`的消息提示有`notice, alert`,其实还可以追加类型.
```ruby
class ApplicationController < ActionController::Base
  add_flash_types :warning, :success, :danger
end
```

- `notice`的区别

```ruby
# 1. 新建失败时,可以
 render 'new', flash.now[:notice] = '嘻嘻嘻'
# 2. 新建成功时,可以
redirect_to xx_path, flash['notice']= '嘻嘻嘻'
```
