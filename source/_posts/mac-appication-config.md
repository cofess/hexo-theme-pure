---
title: "mac应用配置总结"
date: 2018-06-12
---

## 0x00 前言
我有一种强迫症，如果IDE丑，就会浑身难受，而如果工具长得好看，写代码的动力都会上来的。最近对mac上常用的工具进行了一些配置，让他们看上去更优雅。写个总结的文章。其实总结起来就是Material Design，基本把我的工具都换成了这种风格。

## 0x01 Visual Studio Code
最近沉迷于Material Design的风格，配色很是让我喜欢。因此Visual Studio Code也搞了一套。主题采用的是[Material Palenight Theme](https://marketplace.visualstudio.com/items?itemName=whizkydee.material-palenight-theme)，然后把字体改成了`Meslo LG M Regular`，最近也是沉迷于这个字体。具体的配置如下，图标等也换了一下，感觉还不错。
``` json
"workbench.colorTheme": "Material Theme Palenight",
"editor.fontFamily": "Meslo LG M Regular ,Menlo, Monaco, 'Courier New' monospace",
"editor.fontSize": 14,
"materialTheme.fixIconsRunning": false,
"workbench.iconTheme": "eq-material-theme-icons-palenight"
```

## 0x02 Clion IntelliJ
Jetbrains全家桶简直的棒呆。Clion用来写C++的代码也是非常的爽，而且还能够调试远程Linux环境下的代码，一直苦于离开Windows平台不能好好写C++的代码的结终于解了。

Clion的主题同样是Material Design，直接在`Plugin`中搜索`Material Design UI`就可以了。然后调整一下字体还有字号，再把一些没有必要的错误警告提示的下划波浪形取消，就差不多了。风格的话选择`Atom One Dark Theme`，虽然说Atom软件做的不怎么样，但是这个设计的IDE风格确实是不错。

## 0x03 Iterm2
首先是基于[这篇文章](https://medium.com/@Clovis_app/configuration-of-a-beautiful-efficient-terminal-and-prompt-on-osx-in-7-minutes-827c29391961)对Iterm2进行改造，可以实现一些很实用的功能，并且看着也不错。

主题设置好了，但是标题栏还是很丑，和整个界面不搭。再设置一下这个。
具体的配置见如下截图。
![](https://joeltsui.github.io/assets/images/2018-6-12-mac-theme-appearance.png)
![](https://joeltsui.github.io/assets/images/2018-6-12-mac-theme-profiles.png)
上面主要是把标题栏下面的白线去掉，然后启动标题栏的颜色设置。但是想要把标题栏的颜色呵背景颜色设置成一样的发现无法生效。google了才知道，mac High Serria版本已经不能修改标题栏颜色了。但是有人搞出了一些很厉害的东西，不得不佩服，见[这里](https://gitlab.com/gnachman/iterm2/issues/4080)，下面有个人分别对标题栏还有背景设置了不一样的颜色，但是最后显示出来就是背景与标题栏融合了。非常厉害。



