*20230923*

+ [如何取消文章目录的自动编号](https://hwame.top/20200520/hello-hexo-troubleshooting.html#3-%E5%A6%82%E4%BD%95%E5%8F%96%E6%B6%88%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E7%9A%84%E8%87%AA%E5%8A%A8%E7%BC%96%E5%8F%B7)

+ 添加一个温馨提示

  文件位置`./themes/pure/layout/_partial/article.ejs`
  ```html
    <div class="article-header">***省略***</div>
    <div style="background-color:#D7BDE2;border:1px solid #D7BDE2;border-radius:10px;padding:5px">
    <b>温馨提示</b>：点击页面下方<i style="color:red" class="icon icon-anchor"></i>以展开或折叠目录~
    </div>
  ```
    ![20230923212035](https://raw.githubusercontent.com/abobot/blog-img/master/win/202309/20230923212035.png)

+ 修改代码字体及图片居中
+ 点击图片放大
+ 添加相册
+ 添加访问量和访客数
  + 问题：文章阅读量和站点点击量访客量会使用两次**不蒜子**
+ 添加站点使用时间
+ 调整菜单栏高度
+ 添加go to top 按钮
+ valine av-min.js cdn过期，更换为`<script src="//code.bdstatic.com/npm/leancloud-storage@4.12.0/dist/av-min.js"></script>`

**20230924**

+ 启用toc功能
  > 第一步：vi ./node_modules/hexo/lib/plugins/helper/toc.js</br>
  > 第二步：修改其中list_number: true的属性值，默认true为使用自动编号，改为false(大概在第16行)

+ 设置文章置顶
  > 安装插件

  > `npm uninstall hexo-generator-index --save`

  > `npm install hexo-generator-index-pin-top --save`

+ 添加文章更新时间
+ 自定义图片功能
+ 添加utterances评论支持
+ 添加复制按钮