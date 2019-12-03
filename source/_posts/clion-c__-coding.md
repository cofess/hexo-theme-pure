---
title: "Clion远程Debug"
date: 2018-06-13
---

## 0x00
在Mac上如何优雅的写C++代码一直困扰着我，起初有了Visual Studio Code，但是代码自动补全的能力真的是太弱了，导致有一段时间一写C++的代码就要带上Windows的电脑，非常的麻烦。不仅仅是Mac，在Linux平台下也是，没有了Visual Studio的支持，我就完全没法写C++代码了，让我非常痛苦。终于，Clion救世主出现了，跨平台，基于CMakelist.txt编译，颜值又高，功能齐全！

它的功能就不多说了，可以到官网去学习。这次主要说一下远程调试的问题，总结一下。初学者可以先看官网上关于[远程调试](https://www.jetbrains.com/help/clion/run-debug-configuration-remote-gdb.html)的部分。

## 0x01
首先第一步是要同步代码，把本地的代码和远程的代码同步一下，不然修改代码就会变得很麻烦。

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/deployment1.png" alt="配置代码同步" title style/>
</p>

选择`SFTP`，这样的话可以通过`SSH`进行文件的同步。
<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/deployment2.png" alt="配置代码同步" title style/>
</p>

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/deployment3.png" alt="配置代码同步" title style/>
</p>

把本地需要同步的路径和远程主机的路径关联上。

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/deployment4.png" alt="配置代码同步" title style/>
</p>

配置好各个路径以后直接把本地的代码上传上去，还能设置自动上传代码。登陆远程服务器，就可以看到代码了。

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/deployment5.png" alt="配置代码同步" title style/>
</p>

然后就能随心所欲上传下载更新文件了，调试利器。

## 0x02
现在可以进行代码调试了。

先说说远程debug的基本原理。其实就是首先在远程端运行程序，运行了就马上暂停，同时监听配置的端口，然后本地开始运行，运行就会发消息给远程服务器，两个端口一对上就开始debug了。

首先，我们要让远程的代码先跑起来，先在远程端对代码进行编译，在编译的时候一定要注意，如果你要进行debug，必须加上参数`-DCMAKE_BUILD_TYPE=Debug`，否则你在Clion上怎么打断点也没用。

另外为了能够远程debug，需要在远程服务器上安装**gdbserver**，直接`apt-get install`一下。另外需要注意的是，远程主机上的`GDB`版本要和本地的版本一致，否则会出问题。


编译好以后我们回到本地，对本地进行一些配置。

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/remotedebug1.png" alt="远程调试" title style/>
</p>

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/remotedebug2.png" alt="远程调试" title style/>
</p>

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/remotedebug3.png" alt="远程调试" title style/>
</p>


看上面的几个参数，看看都是怎么来的。

首先是`GDB`，这个必须是编译出来的基于Linux平台的才可以，而不是基于Mac平台的。具体的教程参考[这里](https://blog.jetbrains.com/clion/2016/07/clion-2016-2-eap-remote-gdb-debug/)，编译好了选择相应的程序就可以了。

这个`target remote args`比较好理解，按照这个格式写，最后的端口是自定义的，与后面的远程端的匹配就可以了。

`Symbol file`其实是在远程端生成的程序，同步下来，选中。

`Sysroot`是本地的源代码的路径，这个填不填都能debug，但是我发现没有加这个话调试起来非常慢。

`Path Mappings`顾名思义就是把远程的和本地的路径进行关联。这步是必须做的，否则断点打了也没用。

现在这样的配置就完成了。可以开始debug了。

在远程端运行
``` bash
gdbserver localhost:7000 ./remoteTest 
```
此时，远程端的程序就会监听7000端口，同时会一直等待。此时在本机启动调试。

<p align="center"><img src="https://joeltsui-blog.oss-cn-hangzhou.aliyuncs.com/remotedebug4.png" alt="远程调试" title style/>
</p>

## 0x03 one more thing

如果是在同一个局域网中的机器，毫无疑问，是一点问题都没有的，如果远程主机有外网ip也是可以的。

但是，如果没有外网ip，又不在同一个局域网怎么办呢？

这里就到了`SSH`发挥作用的时候了。

如果要对这种主机进行debug，首先需要能够连接`ssh`，按照之前的教程先建立这个隧道。然后在远程主机和外网服务器之间建立一个远程端口转发。相当于把外网主机的7000端口的请求转发到远程服务器的7000端口上，完美实现调试！

`ssh -NR 7000:localhost:7000 root@10.12.1.3`

然后就是按照前面的步骤进行debug就可以了。




