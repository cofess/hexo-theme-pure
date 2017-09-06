# pure

A brand new default theme for [Hexo].

- [Preview](http://cofess.github.io/)

## 界面

- 主页

![](https://raw.githubusercontent.com/cofess/hexo-theme-pure/master/screenshot/pure.png)
- [归档](http://cofess.github.io/archives/)
- [分类](http://cofess.github.io/categories/)
- [标签](http://cofess.github.io/tags/)
- [项目](http://cofess.github.io/repository/)
- [书单](http://cofess.github.io/books/)
- [友链](http://cofess.github.io/links/)
- [关于](http://cofess.github.io/about/)

## Installation

### Install plugin
hexo-wordcount: [https://github.com/willin/hexo-wordcount](https://github.com/willin/hexo-wordcount)
```
npm install hexo-wordcount --save
```
hexo-generator-json-content: [https://github.com/alexbruno/hexo-generator-json-content](https://github.com/alexbruno/hexo-generator-json-content)
```
npm install hexo-generator-json-content --save
```
hexo-generator-feed: [https://github.com/hexojs/hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed)
```
npm install hexo-generator-feed --save
```
hexo-generator-sitemap: [https://github.com/hexojs/hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)
```
npm install hexo-generator-sitemap --save
```
hexo-generator-baidu-sitemap: [https://github.com/coneycode/hexo-generator-baidu-sitemap](https://github.com/coneycode/hexo-generator-baidu-sitemap)
```
npm install hexo-generator-baidu-sitemap --save
```
hexo-neat: [https://github.com/rozbo/hexo-neat](https://github.com/rozbo/hexo-neat)
```
npm install hexo-neat --save
```
hexo-baidu-url-submit: [https://github.com/huiwang/hexo-baidu-url-submit](https://github.com/huiwang/hexo-baidu-url-submit)
```
npm install hexo-baidu-url-submit --save
```

## Run
```
hexo g
hexo s -w
```

## Other
### Clean cache
```
hexo-clean
```
### Data files
For example, add links.yml in source/_data folder.

只需我们同样在 hexo 目录下的 source 文件夹内创建一个名为 _data（禁止改名）的文件夹。

然后在文件内创建一个名为 links.yml 的文件,在其中添加相关数据即可。

这里单个友情链接的格式为：
```
Name:
    link: http://example.com
    avatar: http://example.com/avatar.png
    descr: "这是一个描述"
```
添加多个友情链接，我们只需要根据上面的格式重复填写即可。

. 将 Name 改为友情链接的名字，例如 Viosey。

. http://example.com 为友情链接的地址。

. http://example.com/avatar.png 为友情链接的头像。

. 这是一个描述 为友情链接描述。

## 其他插件
### hexo-translate-title
使用Google翻译，百度翻译和有道翻译将Hexo中的汉字标题转成英文标题
https://github.com/cometlj/hexo-translate-title

#### 安装
```bash
npm install hexo-translate-title --save
```
#### 使用
在博客配置文件`_config.yml`中添加

```yml
translate_title:
  translate_way: google    #google | baidu | youdao
  youdao_api_key: XXX
  youdao_keyfrom: XXX
  is_need_proxy: true     #true | false
  proxy_url: http://localhost:8123
```
**注意**：判断是否需要配置google本地代理，因为我在本地是开启时才能访问google翻译的，如果没有被墙，请将`_config.yml` 下的`is_need_proxy: true`改为false。如果设置为true,请设置本地代理地址

#### 翻译效果评估
google翻译 > baidu翻译 > ~~有道翻译~~

## 数学公式

Hexo默认使用"hexo-renderer-marked"引擎渲染网页，该引擎会把一些特殊的markdown符号转换为相应的html标签

### 解决方案

解决方案有很多，可以网上搜下，为了节省大家的时间，这里只提供亲身测试过的方法。

更换Hexo的markdown渲染引擎，[hexo-renderer-markdown-it-plus](https://github.com/CHENXCHEN/hexo-renderer-markdown-it-plus)引擎替换默认的渲染引擎[hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked)即可。

### 安装hexo-renderer-markdown-it-plus插件

```
npm un hexo-renderer-marked --save
npm i hexo-renderer-markdown-it-plus --save
```

### 配置

安装插件后，如果未正常渲染LaTeX数学公式，在博客配置文件`_config.yml`中添加

```
markdown_it_plus:
  highlight: true
  html: true
  xhtmlOut: true
  breaks: true
  langPrefix:
  linkify: true
  typographer:
  quotes: “”‘’
  plugins:
    - plugin:
        name: markdown-it-katex
        enable: true
    - plugin:
        name: markdown-it-mark
        enable: false  
```

### 文章启用mathjax

```
title: Hello World
mathjax: true
```

