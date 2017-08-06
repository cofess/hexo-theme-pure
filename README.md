# pure

A brand new default theme for [Hexo].

- [Preview](http://blog.cofess.com/)

## Installation

### Install plugin
hexo-wordcount
```
npm i hexo-wordcount --save
```
hexo-generator-json-content
```
npm i hexo-generator-json-content --save
```
hexo-generator-feed
```
npm i hexo-generator-feed --save
```
hexo-generator-sitemap
```
npm i hexo-generator-sitemap --save
```
hexo-generator-baidu-sitemap
```
npm i hexo-generator-baidu-sitemap --save
```

## Run
```
hexo g
hexo s -w //(-w:watch file change)
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
