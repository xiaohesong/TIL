记得之前用aliyun仓库做远程分支库来部署的时候，一直有些问题，需要配置一番才可以。折腾了挺久的。

感觉阿里云服务器快到期了，得把之前的git配置给存下 :smile: 。

阿里云服务器：

`vim ~/.ssh/config`

```json
Host github.com
  Hostname ssh.github.com
  Port 443

Host code.aliyun.com
  HostName code.aliyun.com
  RSAAuthentication yes
  IdentityFIle ~/.ssh/id_rsa
  Port 22
```
