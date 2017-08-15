### 别名服务器
```shell
cd ~/.ssh
```
```shell
# vim config
Host nickname #你的别名
User user #你的远程用户
HostName 192.168.2.2 #你的远程ip
Port 22 #你的远程端口号
ForwardAgent yes
ServerAliveInterval 60 #断开时间
```
再运行之前,还需要把`ssh`添加到远程服务器

```shell
ssh-keygen #如果没有 ssh
ssh-copy-id user@ip
```
然后就可以别名登录远程服务器了.
```shell
ssh nickname
```

### 禁止root登录ssh
```shell
# sudo vim /etc/ssh/ssh-config
Port 12345 #可以设置你想要的端口
PermitRootLogin no # 禁止root登录
```
