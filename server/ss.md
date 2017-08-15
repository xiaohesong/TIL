## 客户端配置

### ubuntu
1. 安装相关包
```shell
sudo apt-get install python-pip
sudo pip install shadowsocks
```

```shell
# sudo vim /ss-conf.json
{
  "server":"remote ip",
  "server_port":你的端口,
  "local_address":"127.0.0.1",
  "local_port":1080,
  "password":"password",    
  "timeout":600,
  "method":"aes-256-cfb"
}
```
可以通过`sslocal -c /ss-conf.json`来启动。

每次这样启动比较麻烦，加入开机自动启动.
- 添加自动动脚本
```shell
# sudo vim /home/shadowsock.sh
#！/bin/bash
sslocal -c /ss-conf.json
```
- 加入自启动
```shell
# sudo vim /etc/rc.local
nohup bash /home/shadowsock.sh > /home/ss-log.txt &
# 上面这个加在`exit 0`之前
```

```shell
sudo cp /usr/local/bin/sslocal /bin/
sudo reboot
```

## 服务端配置
### ubuntu
1. 安装相关的包
```shell
sudo apt-get update
sudo apt-get install python-pip
sudo pip install shadowsocks
```
不出意外,会安装成功了这里.然后添加一个配置文件
` sudo vim shadowsocks-conf.json`:
```shell
{
  "server":"0.0.0.0",
  "server_port":8888,
  "local_address":"127.0.0.1",
  "local_port":1080,
  "password":"这里是你的链接ss的密码",    
  "timeout":600,
  "method":"aes-256-cfb"
}
```
上面就是对应的配置文件,服务端配置好之后,启动`shadowsocks`:
```shell
sudo ssserver -c shadowsocks-conf.json -d start
```
