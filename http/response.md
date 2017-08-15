- HTTP get response to json, playable
```ruby
# like http get
response = "{\n  \"userId\": 1,\n  \"id\": 1,\n  \"title\": \"sunt aut facere repellat provident occaecati excepturi optio reprehenderit\"\n}"

# first
body = JSON.parse(response)
=>{"userId"=>1, "id"=>1, "title"=>"sunt aut facere repellat provident occaecati excepturi optio reprehenderit"}
 body["id"] => 1

# second
body = JSON.parse(response, symbolize_names: true)
=> {:userId=>1, :id=>1, :title=>"sunt aut facere repellat provident occaecati excepturi optio reprehenderit"}
body[:id] => 1

# third
body = JSON.parse(response, object_class: OpenStruct)
=> #<OpenStruct userId=1, id=1, title="sunt aut facere repellat provident occaecati excepturi optio reprehenderit">
body.id => 1
```
