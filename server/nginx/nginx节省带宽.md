#### 开启压缩

默认nginx(`nginx.conf`配置)是不开启压缩的，有些linux版本除外。

```json
gzip on;
gzip_types application/xml application/json text/css text/javascript application/javascript;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 500;
```

#### 开启缓存头

```json
location ~* \.(?:jpg|jpeg|gif|png|ico|woff2)$ {
    expires 1M;
    add_header Cache-Control "public";
}
```

#### 启用http/2

nginx1.9.5之后支持http2，开启也不是很难（确保电脑其他的环境也支持）。

```json
listen 443 ssl http2;
```

#### 优化日志

通过减少或消除不必要的日志记录，可以节省服务器上的磁盘存储，CPU和I / O操作。

- 减少页面资源的记录

  ```json
  location ~* \.(?:jpg|jpeg|gif|png|ico|woff2|js|css)$ {
      access_log off;
  }
  ```

- 禁用成功请求的日志

  ```json
  map $status $loggable {
      ~^[23] 0;
      default 1;
  }
  
  access_log /var/log/nginx/access.log combined if=$loggable;
  ```

- buffering来最小化io的操作

  ```json
  access_log /var/log/nginx/access.log combined buffer=512k flush=1m;
  ```

#### 特定的URL限制带宽

```json
location /download/ {
    limit_rate 50k;
}
```

或者想针对大的文件做处理，可以设置一个阈值：

```json
location / {
    limit_rate_after 500k;
    limit_rate 50k;
}
```

这里前500K不限制，500k之后的速度就是50k/s。



不扯了，还是原文写的详细啊，请移步以下地址：

https://www.nginx.com/blog/help-the-world-by-healing-your-nginx-configuration/
