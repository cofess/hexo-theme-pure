---
title: "SSH端口转发及内网穿透总结"
date: 2018-04-18
---

## 0x00 前言

IPV4下，公网IP是奢侈的资源，就算是家里的宽带也不一定能有公网IP，为了能够远程连接家里的Ubuntu，就需要进行内网穿透。

已有的方案包括很多，其中TeamViewer、VNC还能做到可视化界面，但是平时的开发并不需要这么重，界面传输反而会加重网络的负担。ngrok、花生壳也可以实现，但是前者很麻烦，后者收费。

用SSH实现就非常的优雅，并且可以进行很多的扩展。

## 0x01 什么是SSH
SSH表示的是一种网络协议，它定义了一种通过网络建立安全通信的方法，SSH协议从1995年提出以来，演化出了两个大版本，分别是SSH-1和SSH-2.两个版本并不兼容，SSH-2相比于SSH-1安全性更高，并且增加了一些特性。

SSH采用的是client/server模型，通过在client和server之间建立加密通道，从认证、加密和数据的完整性三个方面保障通信安全。

> SSH协议及基于其开发的产品在名称上很容易混淆，先进行简单的说明。
SSH-1/SSH-2 表示的是协议。
SSH1/SSH2表示的是基于SSH1和SSH2协议开发的产品
ssh/ssh1/ssh2等表示的是客户端程序
OpenSSH是OpenBSD项目的一个产品，它实现了SSH-1和SSH-2协议。

## 0x02 SSH的端口转发
平时我们用的最多的就是通过SSH实现远程登陆，以及通过scp传输文件。

通过SSH协议我们可以在两个计算机之间建立一个安全通道，并且这个通道是双向的。基于这个通道可以实现端口的转发。也就是将这个通道给其他的应用使用，而不仅仅是SSH。

<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/ssh_0904.gif" alt="SSH通道建立" title style/>

### 本地端口转发
假设，我有个服务运行在远程服务器上，如上图中的Host B，这个服务会监听远程服务器的143端口，当有消息过来的时候进行处理。

在本地有个应用程序的客户端，它可以通过TCP/IP与远程服务进行通信。现在我希望本地的客户端程序通过SSH隧道进行通信。

就可以使用以下的命令：
```
ssh -L <localhost>:<localport>:<remotehost>:<remoteport> <SSH hostname>
```
`-L`表示"local forwarding"，`localhost`表示本机地址，`localport`表示本地端口，`remotehost`表示远程服务主机地址，`remoteport`表示远程服务的监听端口，也就是说把所有发送到本地的端口的数据都转发到远程服务器的端口上。然后在本地的应用程序上配置代理到本地端口。

<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/ssh_0905.gif" alt="SSH通道建立" title style/>

但是，实际的使用中，我们省略了`localhost`，并且用`localhost`代替`remotehost`，这是为什么呢？
```
ssh -L <localport>:localhost:<remoteport> <SSH hostname>
```

第一个`localhost`保留和去掉的含义不太一样，如果保留`localhost`，表示只能本地的用户链接到这个端口，通过这个端口转发数据，如果你想通过Host C然后把数据通过Host A转发到Host B，这是不允许的。但是可以通过配置中的`GatewayPorts`来改变默认值，或者在命令中加`-g`。或者直接去掉，或者额用"*"代替。

为了回答第二个问题，需要先问：`remotehost`和`SSH hostname`一定要同一台机器吗？其实不用。`remotehost`和`remoteport`只要是`SSH hostname`可以访问的机器和端口就可以。

其实整个的端口转发过程分成两部分，一部分是在客户端这边，将发往本地端口的数据都通过SSH隧道发送到SSH server上。然后server上再把数据发送到`remotehost:remoteport`上。也就是说前半部分是SSH的客户端的参数，后半部分是SSH服务端的参数

整个的端口转发过程变成了SSH客户端和SSH服务端的数据接力。

### 远程端口转发
首先需要注意的是，不管是远程端口转发还是本地端口转发，都是在本地机器上进行的操作，也就是都是在Host A上输入的命令。远程端口转发顾名思义就是对远程的机器上的端口数据转发到本地来

远程端口转发和本地端口转发的数据转发方向刚好是相反的，远程端口转发我们希望的是把所有发到远程主机端口上的数据转发到本机来。

命令参数的解析也就相反了。
```
ssh -R <remotehost>:<remoteport>:<localhost>:<localport> <SSH hostname>
```
`-R`表示"remote forwarding"，其余的参数含义和本地端口转发一致，但是参数的方向不同，前半部分是给SSH服务端解析的，后半部分是SSH客户端解析的。

同样也能进行简化
```
ssh -R <remoteport>:localhost:<localport> <SSH hostname>
```

> （1）SSH只能对基于TCP/IP协议的应用进行端口转发，并不支持UDP等；（2）


## 0x03 内网穿透隧道建立

通过ssh实现内网穿透需要有一台有外网ip的主机，因此整个过程实际上有三个对象：


| 机器代号 | 机器位置 | 用户 | ip地址 |
| :-----:|:------:|:------:|:-----:|
| A | 内网 | user.a | 192.168.1.155 |
| B | 外网 | user.b | 30.23.1.23 |
| C | 内网 | user.c | 192.168.1.22|

> 注意，A和C虽然都在内网，但是是不同的内网。

首先内网的机器是可以ssh到外网的服务器上的，那么我就希望这个通道能够一直保持，并且我能通过这个通道从外网ssh到内网来。

在内网机器A上与外网机器B建立一个远程端口转发通道，当我在机器C上企图对转发端口建立SSH链接时，就会将数据转发到机器A上，这样就实现了内网穿透。

通过一下命令就能实现上述的功能。

``` bash
$ ssh -fNR 1234:localhost:22 user.b@30.23.1.23
```

`-N`表示不需要执行远程命令；
`-f`表示建立通道后ssh到后台运行


此时就能建立了一个内网上的机器和外网的机器的一个反向隧道（实际上就是一个从外网机器到内网机器的正向隧道）。
> 注意，这里的`NR`的位置是不能错的，一定要`R`在后面，因为后面跟的是`R`的参数值。

此时，你就能够在B机器上通过`1234`端口ssh到A机器上了。但是要注意以下命令中的用户名:

``` bash
$ ssh -p1234 user.a@30.23.1.23
```

## 0x04 内网穿透隧道的维护
ssh的连接是会超时关闭的，一旦连接关闭，所谓的隧道也就不存在了，因此需要一个工具，能够在ssh连接断开的时候自动重连。

autossh就是这样一个工具。

所以首先需要知道ssh连接断开没有，可以通过监听某个端口来判断，一旦发现连接断开了，就重连ssh。autossh会通过发送测试数据，然后根据返回情况来判断连接情况。

在autossh中就可以通过以下命令建立维护内网穿透隧道了。

``` bash
$ autossh -M2345 -NR 1234:localhost:22 user.b@30.23.1.23
```

在autossh中，`-M`参数就是用来指定监听端口的。

我们只是指定了一个`port`端口，实际上`port+1`也被征用了，一个用来发送测试数据，一个用来接收。

当`port`设置为`0`时，表示关闭监控功能，这种情况下，只有当ssh退出的时候才会进行重启。最新版的OpenSSH多了一些参数，可以通过增加`ServerAliveInterval`和`ServerAliveCountMax`，确保当ssh发现没有和服务端连接的时候进行重连。

autossh中也有个`-f`的参数，加了这个参数就不让你输入密码了，然后就连不上了。然后查看进程的时候就总是有它，想要在这个端口重新进行连接就没用了，死活连不上。普通的kill还没办法kill掉。通过`kill -9 PIDNumber`可以关闭它。所以如果你是通过密码进行autossh连接的时候，不要加`-f`参数。


或者可以通过帮助文档中推荐的方式：

``` bash
$ autossh -M0 -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -NR 1234:localhost:22 user.b@30.23.1.23
```

然后同理

``` bash
$ ssh -p1234 user.a@30.23.1.23
```

可以借助于这个外网的机器作为跳板机，实现内网穿透。

不过注意，少了`-f`的参数，是没办法在后台运行的，后台直接运行的前提是已经配置过ssh的密钥了。

## 0x05 服务器重启怎么办？

首先，要应付服务器重启的情况，那肯定是不能通过输入密码的方式，这里就要用到ssh连接中的通过ssh key实现无密连接了。这个过程其他教程也写了。


``` bash
$ ssh-keygen
```

提示输入`passphrase`的时候，直接回车，不然还是要输入密码。这个命令会生成一个私钥一个公钥。为了防止文件被覆盖，可以通过参数`-f`进行重命名密钥文件。不过记得提供完整的路径，不然会生成在当前目录下。


``` bash
$ ssh-copy-id -i /path/to/ssh-key.pub user.b@30.23.1.23
```

上面的命令可以吧选定的公钥文件拷贝到远程主机上，此时，就不需要输入密码就能ssh登陆远程主机了。

ssh通过密钥进行登录是有默认文件的，默认情况下会通过`/home/user/.ssh/id_rsa`的私钥与远程中的进行匹配，匹配正确就不需要密码了。如果你是自定义的文件名，需要指定秘钥的路径进行免密登陆。

``` bash
$ ssh user.b@30.23.1.23 -i /path/to/ssh-key
```

然后可以配置脚本开机自启动。


## ox06 其余参考链接
[1] https://www.digitalocean.com/community/tutorials/how-to-install-and-manage-supervisor-on-ubuntu-and-debian-vps
[2] [使用SSH反向隧道进行内网穿透](http://arondight.me/2016/02/17/%E4%BD%BF%E7%94%A8SSH%E5%8F%8D%E5%90%91%E9%9A%A7%E9%81%93%E8%BF%9B%E8%A1%8C%E5%86%85%E7%BD%91%E7%A9%BF%E9%80%8F/)
[3] [SSH反向连接及Autossh](https://www.cnblogs.com/eshizhan/archive/2012/07/16/2592902.html)
[4] [利用ssh反向代理以及autossh实现从外网连接内网服务器](https://www.cnblogs.com/kwongtai/p/6903420.html)
[5] [使用 autossh 建立反向 SSH 隧道管理个人计算机](https://blog.windrunner.me/sa/reverse-ssh.html)
[6] https://docstore.mik.ua/orelly/networking_2ndEd/ssh/ch09_02.htm
[7] https://www.ibm.com/developerworks/cn/linux/l-cn-sshforward/index.html
[8] https://unix.stackexchange.com/questions/236865/what-does-bind-address-mean-in-ssh-port-forwarding/236867

