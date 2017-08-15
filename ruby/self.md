- `self`在当前的`initialize`中直指当前的实例对象
```ruby
class Foo
  def initialize(x)
    self.c x
  end

  def c(x)
    puts "c的参数是#{x}"
  end
end
f = Foo.new(1)
```

- 带给我的感觉
`self`在很大程度上类似.都是指定当前的实例.给我的感觉就是
```ruby
self == @
!self.eql?(@)
```
类似于`coffee js`的
```js
this && @
```
例如:
```ruby
class Foo
  attr_accessor :name
  def initialize(x)
    @name = "wo"
  end
end

class Foo
  attr_accessor :name
  def initialize(x)
    self.name = "wo"
  end
end

f = Foo.new(3)
puts f.name
```

再比如
```ruby
class A
  @num = 8
  def show
    puts @num
  end
end

class B < A
  def initialize
    @num = 3
  end
end

b = B.new
b.show
```
