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
