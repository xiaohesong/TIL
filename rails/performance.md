- method argument

```ruby
def hello(foo: nil, bar: nil)
end
10_000.times { hello(foo: 1, bar: 2) }

# Runtime => 10.354 ms
```

```ruby
def hello(options = {})
  foo, bar = options[:foo], options[:bar]
end
10_000.times { hello(foo: 1, bar: 2) }
# Runtime => 5.064 ms
```

- obj.method VS obj attr_reader
```ruby
class Foo
  def initialize(val)
    @val = val
  end

  def val
    @val
  end
end

object = Foo.new("bar")
100_000.times { object.val }
# Runtime => 9.284 ms
```

```ruby
class Foo
  def initialize(val)
    @val = val
  end

  attr_reader :val
end

object = Foo.new("bar")
100_000.times { object.val }
# Runtime => 6.966 ms
```

- Array rand

```ruby
(1..100_000).to_a.shuffle!
# Runtime => 6.968 ms
```

```ruby
(1..100_000).to_a.sort_by { rand }
# Runtime => 94.396 ms
```

- each VS while

```ruby
100_000.times do |n|
  # Do something
end
# Runtime: 4.395 ms
```

```ruby
n = 0

while n < 100_000
  # Do something
  n += 1
end
# Runtime: 1.878 ms
```

- Block

```ruby
def hello(&block)
  block.call
end

100_000.times do
  hello { "world" }
end
# Runtime: 72.739 ms
```

```ruby
def hello
  yield
end

100_000.times do
  hello { "world" }
end
# Runtime: 18.987 ms
```


- 这里只是一些小例子,可参考 [All code challenges](https://therubychallenge.com/code_challenges)
- 另外一个[大神的github](https://github.com/JuanitoFatas/fast-ruby).
