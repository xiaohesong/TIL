这里记下如果把域名指向非80端口直接进行访问。

```shell
#app.conf
server {
    listen 7979;
    root /home/user/www/react_app/dist/;
    location / {
      try_files $uri /index.html;
      gzip_static on;
      expires max;
      add_header Cache-Control public;
    }
}

server {
   server_name react.example.com;
   location / {
        proxy_pass http://localhost:7979/;
        proxy_set_header Host $host;
   }
}
```
