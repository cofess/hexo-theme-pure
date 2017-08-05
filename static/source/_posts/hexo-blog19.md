---
title: Hexo搭建个人博客并部署到Github
date: 2017-04-09 14:49:13
desc: Hexo搭建个人博客并部署到Github
categories:
- Hexo
tags:
- Hexo
---
## 准备
你需要准备好以下软件：
Node.js环境和Git
<!-- more -->
## Hexo安装

```
npm install hexo -g
```
## 升级
更新hexo到最新版

```
npm update hexo -g
```
## 初始化

```
hexo init <folder>
```
如果指定 <folder>，便会在目前的资料夹建立一个名为 <folder> 的新文件夹；否则会在目前资料夹初始化。
## 生成网站

```
hexo g
```
## 启动本地服务

```
hexo s
```
启动服务后，就可以访问：http://localhost:4000/（port 预设为 4000，可在 _config.yml 设定）
## RSS订阅
命令行切换到hexo博客根目录，安装hexo-generator-feed
```
$ npm install hexo-generator-feed --save
```
在博客目录的_config.yml中添加如下代码
```
# feed   
feed:
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content:
```

## sitemap站点地图
命令行切换到hexo博客根目录，分别用下面两个命令来安装针对谷歌和百度的sitemap插件
```
npm install hexo-generator-sitemap --save
npm install hexo-generator-baidu-sitemap --save
```
在博客目录的_config.yml中添加如下代码
```
# sitemap
sitemap:
  path: sitemap.xml
baidusitemap:
  path: baidusitemap.xml 
```
