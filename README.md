# purabo

## About [purabo](https://github.com/abobot/hexo-theme-purabo)

Forked from [hexo-theme-pure](https://github.com/cofess/hexo-theme-pure)

[Origin English documentation](README.origin.md) | [原始中文文档](README.cn.origin.md)

## New functions



## How to use

Open `cmd` in your `theme` directoery.

### install theme

Run `git clone https://github.com/abobot/hexo-theme-purabo purabo`
> You can replace the name of `purabo` as your theme name.

### Update theme
```bash
cd purabo
git pull
```

### Use theme
Find the `theme: landscape` in `site` `_config.yml` and change to `theme: purabo`.
> `purabo` is the theme name you named.

## Install plugins

### [hexo-wordcount](https://github.com/willin/hexo-wordcount)

```
npm install hexo-wordcount --save
```
### [hexo-generator-json-content](https://github.com/alexbruno/hexo-generator-json-content)

```
npm install hexo-generator-json-content --save
```
### [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed)

```
npm install hexo-generator-feed --save
```
### [hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)

```
npm install hexo-generator-sitemap --save
```
### [hexo-generator-baidu-sitemap](https://github.com/coneycode/hexo-generator-baidu-sitemap)

```
npm install hexo-generator-baidu-sitemap --save
```
### Plugins for blog optimization

#### [hexo-neat](https://github.com/rozbo/hexo-neat)

> auto Minify html、js、css and make it neat

```
npm install hexo-neat --save
```

You can configure this plugin in `_config.yml`.

```
# hexo-neat
neat_enable: true
neat_html:
  enable: true
  exclude:  
neat_css:
  enable: true
  exclude:
    - '*.min.css'
neat_js:
  enable: true
  mangle: true
  output:
  compress:
  exclude:
    - '*.min.js' 
```

#### [hexo-baidu-url-submit](https://github.com/huiwang/hexo-baidu-url-submit)

```
npm install hexo-baidu-url-submit --save
```

#### [hexo-translate-title](https://github.com/cometlj/hexo-translate-title)
> translate the chinese title of Hexo blog to english words automatially

```
npm install hexo-translate-title --save
```

You can configure this plugin in `_config.yml`.

```yml
translate_title:
  translate_way: google    #google | baidu | youdao
  youdao_api_key: XXX
  youdao_keyfrom: XXX
  is_need_proxy: true     #true | false
  proxy_url: http://localhost:8123
```
## Mathjax Support

#### [hexo-renderer-markdown-it-plus](https://github.com/CHENXCHEN/hexo-renderer-markdown-it-plus)

install

```
npm un hexo-renderer-marked --save
npm i hexo-renderer-markdown-it-plus --save
```

You can configure this plugin in `_config.yml`.

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

install markdown-it-katex dependency for markdown-it-plus
`npm install --save markdown-it-katex`

Article enable mathjax

```
title: Hello World
mathjax: true
```


## Data files

Sometimes you may need to use some data in templates which is not directly available in your posts, or you want to reuse the data elsewhere. For such use cases, Hexo 3 introduced the new Data files. This feature loads YAML or JSON files in `source/_data` folder so you can use them in your site.

For example, add `links.yml` in `source/_data` folder.

The format of the link:

```yml
Name:
    link: http://example.com
    avatar: http://example.com/avatar.png
    desc: description
```
