- 重构路由
有些项目是`api`和页面共存的. 大量充斥着重复的代码.

```ruby
# 重构前
namespace :a do
  resources :users
  resources :orders
end

namespace :b do
  resources :users
  resources :orders
end

# 重构后
concern :base do
  resources :users
  resources :orders
end

namespace :a do
  concerns :base
end

namespace :b do
  concerns :base
end
```

[来看看D大神的说法](https://github.com/rails/rails/commit/0dd24728a088fcb4ae616bb5d62734aca5276b1b#commitcomment-1749011)

- 拆分重构

- 将`routes`的内容移到其他文件里.
1. 首先创建一个实例.
```ruby
# vim config/initializers/routing_draw.rb
# Adds draw method into Rails routing
# It allows us to keep routing splitted into files
class ActionDispatch::Routing::Mapper
  def draw(routes_name)
    instance_eval(File.read(Rails.root.join("config/routes/#{routes_name}.rb")))
  end
end
```
2. routes文件里使用

```ruby
Rails.application.routes.draw do
  draw :admin
end
```

3. 创建对应的文件
ps: 方便管理,在配置文件下创建一个路由文件夹.

```ruby
#vim config/routes/admin.rb
namespace :admin do
  resources :users
end
```
