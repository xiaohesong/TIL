```ruby
http = Net::HTTP.new(uri.host, uri.port)

request = Net::HTTP::Get.new(uri.request_uri)

request['Cookie'] = 'your cookie'

response = http.request(request)
```

或者你可以使用faraday类似的库，但是你需要http-cookie这个包。

```ruby
@conn = Faraday.new(url: url) do |faraday|
  faraday.request :url_encoded
  faraday.adapter :typhoeus
end

response = @conn.get do |req|
  req.headers = {
    'Cookie' => @cookie || set_cookie,
    'user-agent' => 'Mac Safari',
    'Host' => 'xxx.example.com'
  }
end
html = response.body


def set_cookie
  cookies = {
    userId: ['key', 'domain'],
    timexxxx: ['1563612970002', 'xx.example.com'],
    productions: ['key', '.example.com'],
  }

  cookies.map(&->(key, value){
    HTTP::Cookie.new(key.to_s, value[0],
      domain:     value.last,
      for_domain: true,
      path:       '/'
    ).set_cookie_value
  })

  HTTP::Cookie.new("Cookie", new_cookie,
    domain:     'http://xx.example.com',
    for_domain: true,
    path:       '/'
  ).set_cookie_value

  new_cookie #Request Headers Cookie
end
```
