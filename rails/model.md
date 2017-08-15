` Rails model`
```ruby
class A < ActiveRecord::Base
  has_one :b
end

class B < ActiveRecord::Base
  belongs_to :a
end

a = A.last
a.create_b # a.create_b!
```
