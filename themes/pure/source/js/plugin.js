/**
 * baiduTemplate简单好用的Javascript模板引擎 1.0.6 版本
 * http://baidufe.github.com/BaiduTemplate
 * 开源协议：BSD License
 * 浏览器环境占用命名空间 baidu.template ，nodejs环境直接安装 npm install baidutemplate
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @author wangxiao 
 * @email 1988wangxiao@gmail.com
*/

;(function(window){

    //取得浏览器环境的baidu命名空间，非浏览器环境符合commonjs规范exports出去
    //修正在nodejs环境下，采用baidu.template变量名
    var baidu = typeof module === 'undefined' ? (window.baidu = window.baidu || {}) : module.exports;

    //模板函数（放置于baidu.template命名空间下）
    baidu.template = function(str, data){

        //检查是否有该id的元素存在，如果有元素则获取元素的innerHTML/value，否则认为字符串为模板
        var fn = (function(){

            //判断如果没有document，则为非浏览器环境
            if(!window.document){
                return bt._compile(str);
            };

            //HTML5规定ID可以由任何不包含空格字符的字符串组成
            var element = document.getElementById(str);
            if (element) {
                    
                //取到对应id的dom，缓存其编译后的HTML模板函数
                if (bt.cache[str]) {
                    return bt.cache[str];
                };

                //textarea或input则取value，其它情况取innerHTML
                var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML;
                return bt._compile(html);

            }else{

                //是模板字符串，则生成一个函数
                //如果直接传入字符串作为模板，则可能变化过多，因此不考虑缓存
                return bt._compile(str);
            };

        })();

        //有数据则返回HTML字符串，没有数据则返回函数 支持data={}的情况
        var result = bt._isObject(data) ? fn( data ) : fn;
        fn = null;

        return result;
    };

    //取得命名空间 baidu.template
    var bt = baidu.template;

    //标记当前版本
    bt.versions = bt.versions || [];
    bt.versions.push('1.0.6');

    //缓存  将对应id模板生成的函数缓存下来。
    bt.cache = {};
    
    //自定义分隔符，可以含有正则中的字符，可以是HTML注释开头 <! !>
    bt.LEFT_DELIMITER = bt.LEFT_DELIMITER||'{%';
    bt.RIGHT_DELIMITER = bt.RIGHT_DELIMITER||'%}';

    //自定义默认是否转义，默认为默认自动转义
    bt.ESCAPE = true;

    //HTML转义
    bt._encodeHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/\\/g,'&#92;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    };

    //转义影响正则的字符
    bt._encodeReg = function (source) {
        return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g,'\\$1');
    };

    //转义UI UI变量使用在HTML页面标签onclick等事件函数参数中
    bt._encodeEventHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;')
            .replace(/\\\\/g,'\\')
            .replace(/\\\//g,'\/')
            .replace(/\\n/g,'\n')
            .replace(/\\r/g,'\r');
    };

    //将字符串拼接生成函数，即编译过程(compile)
    bt._compile = function(str){
        var funBody = "var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('"+bt._analysisStr(str)+"');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";
        return new Function("_template_object",funBody);
    };

    //判断是否是Object类型
    bt._isObject = function (source) {
        return 'function' === typeof source || !!(source && 'object' === typeof source);
    };

    //解析模板字符串
    bt._analysisStr = function(str){

        //取得分隔符
        var _left_ = bt.LEFT_DELIMITER;
        var _right_ = bt.RIGHT_DELIMITER;

        //对分隔符进行转义，支持正则中的元字符，可以是HTML注释 <!  !>
        var _left = bt._encodeReg(_left_);
        var _right = bt._encodeReg(_right_);

        str = String(str)
            
            //去掉分隔符中js注释
            .replace(new RegExp("("+_left+"[^"+_right+"]*)//.*\n","g"), "$1")

            //去掉注释内容  <%* 这里可以任意的注释 *%>
            //默认支持HTML注释，将HTML注释匹配掉的原因是用户有可能用 <! !>来做分割符
            .replace(new RegExp("<!--.*?-->", "g"),"")
            .replace(new RegExp(_left+"\\*.*?\\*"+_right, "g"),"")

            //把所有换行去掉  \r回车符 \t制表符 \n换行符
            .replace(new RegExp("[\\r\\t\\n]","g"), "")

            //用来处理非分隔符内部的内容中含有 斜杠 \ 单引号 ‘ ，处理办法为HTML转义
            .replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function (item, $1) {
                var str = '';
                if($1){

                    //将 斜杠 单引 HTML转义
                    str = $1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;');
                    while(/<[^<]*?&#39;[^<]*?>/g.test(str)){

                        //将标签内的单引号转义为\r  结合最后一步，替换为\'
                        str = str.replace(/(<[^<]*?)&#39;([^<]*?>)/g,'$1\r$2')
                    };
                }else{
                    str = item;
                }
                return str ;
            });


        str = str 
            //定义变量，如果没有分号，需要容错  <%var val='test'%>
            .replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_)

            //对变量后面的分号做容错(包括转义模式 如<%:h=value%>)  <%=value;%> 排除掉函数的情况 <%fun1();%> 排除定义变量情况  <%var val='test';%>
            .replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_)

            //按照 <% 分割为一个个数组，再用 \t 和在一起，相当于将 <% 替换为 \t
            //将模板按照<%分为一段一段的，再在每段的结尾加入 \t,即用 \t 将每个模板片段前面分隔开
            .split(_left_).join("\t");

        //支持用户配置默认是否自动转义
        if(bt.ESCAPE){
            str = str

                //找到 \t=任意一个字符%> 替换为 ‘，任意字符,'
                //即替换简单变量  \t=data%> 替换为 ',data,'
                //默认HTML转义  也支持HTML转义写法<%:h=value%>  
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'");
        }else{
            str = str
                
                //默认不转义HTML转义
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$1,'");
        };

        str = str

            //支持HTML转义写法<%:h=value%>  
            .replace(new RegExp("\\t:h=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'")

            //支持不转义写法 <%:=value%>和<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$1,'")

            //支持url转义 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':encodeURIComponent($1),'")

            //支持UI 变量使用在HTML页面标签onclick等事件函数参数中  <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':baidu.template._encodeEventHTML($1),'")

            //将字符串按照 \t 分成为数组，在用'); 将其合并，即替换掉结尾的 \t 为 ');
            //在if，for等语句前面加上 '); ，形成 ');if  ');for  的形式
            .split("\t").join("');")

            //将 %> 替换为_template_fun_array.push('
            //即去掉结尾符，生成函数中的push方法
            //如：if(list.length=5){%><h2>',list[4],'</h2>');}
            //会被替换为 if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")

            //将 \r 替换为 \
            .split("\r").join("\\'");

        return str;
    };

})(window);

!function(t){if("object"==typeof exports)module.exports=t();else if("function"==typeof define&&define.amd)define(t);else{var r;"undefined"!=typeof window?r=window:"undefined"!=typeof global?r=global:"undefined"!=typeof self&&(r=self),r.GeoPattern=t()}}(function(){return function t(r,s,e){function i(o,a){if(!s[o]){if(!r[o]){var h="function"==typeof require&&require;if(!a&&h)return h(o,!0);if(n)return n(o,!0);throw new Error("Cannot find module '"+o+"'")}var l=s[o]={exports:{}};r[o][0].call(l.exports,function(t){var s=r[o][1][t];return i(s?s:t)},l,l.exports,t,r,s,e)}return s[o].exports}for(var n="function"==typeof require&&require,o=0;o<e.length;o++)i(e[o]);return i}({1:[function(t,r){r.exports=t("./lib/")},{"./lib/":3}],2:[function(t,r){"use strict";function s(t){var r=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;t=t.replace(r,function(t,r,s,e){return r+r+s+s+e+e});var s=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return s?{r:parseInt(s[1],16),g:parseInt(s[2],16),b:parseInt(s[3],16)}:null}function e(t){return"#"+["r","g","b"].map(function(r){return("0"+t[r].toString(16)).slice(-2)}).join("")}function i(t){var r=t.r,s=t.g,e=t.b;r/=255,s/=255,e/=255;var i,n,o=Math.max(r,s,e),a=Math.min(r,s,e),h=(o+a)/2;if(o===a)i=n=0;else{var l=o-a;switch(n=h>.5?l/(2-o-a):l/(o+a),o){case r:i=(s-e)/l+(e>s?6:0);break;case s:i=(e-r)/l+2;break;case e:i=(r-s)/l+4}i/=6}return{h:i,s:n,l:h}}function n(t){function r(t,r,s){return 0>s&&(s+=1),s>1&&(s-=1),1/6>s?t+6*(r-t)*s:.5>s?r:2/3>s?t+(r-t)*(2/3-s)*6:t}var s,e,i,n=t.h,o=t.s,a=t.l;if(0===o)s=e=i=a;else{var h=.5>a?a*(1+o):a+o-a*o,l=2*a-h;s=r(l,h,n+1/3),e=r(l,h,n),i=r(l,h,n-1/3)}return{r:Math.round(255*s),g:Math.round(255*e),b:Math.round(255*i)}}r.exports={hex2rgb:s,rgb2hex:e,rgb2hsl:i,hsl2rgb:n,rgb2rgbString:function(t){return"rgb("+[t.r,t.g,t.b].join(",")+")"}}},{}],3:[function(t,r){!function(s){"use strict";function e(t){return function(r,s){return"object"==typeof r&&(s=r,r=null),(null===r||void 0===r)&&(r=(new Date).toString()),s||(s={}),t.call(this,r,s)}}var i=t("./pattern"),n=r.exports={generate:e(function(t,r){return new i(t,r)})};s&&(s.fn.geopattern=e(function(t,r){return this.each(function(){var e=s(this).attr("data-title-sha");e&&(r=s.extend({hash:e},r));var i=n.generate(t,r);s(this).css("background-image",i.toDataUrl())})}))}("undefined"!=typeof jQuery?jQuery:null)},{"./pattern":4}],4:[function(t,r){(function(s){"use strict";function e(t,r,s){return parseInt(t.substr(r,s||1),16)}function i(t,r,s,e,i){var n=parseFloat(t),o=s-r,a=i-e;return(n-r)*a/o+e}function n(t){return t%2===0?C:j}function o(t){return i(t,0,15,M,W)}function a(t){var r=t,s=r/2,e=Math.sin(60*Math.PI/180)*r;return[0,e,s,0,s+r,0,2*r,e,s+r,2*e,s,2*e,0,e].join(",")}function h(t,r){var s=.66*r;return[[0,0,t/2,r-s,t/2,r,0,s,0,0],[t/2,r-s,t,0,t,s,t/2,r,t/2,r-s]].map(function(t){return t.join(",")})}function l(t){return[[t,0,t,3*t],[0,t,3*t,t]]}function c(t){var r=t,s=.33*r;return[s,0,r-s,0,r,s,r,r-s,r-s,r,s,r,0,r-s,0,s,s,0].join(",")}function f(t,r){var s=t/2;return[s,0,t,r,0,r,s,0].join(",")}function u(t,r){return[t/2,0,t,r/2,t/2,r,0,r/2].join(",")}function p(t){return[0,0,t,t,0,t,0,0].join(",")}function g(t,r,s,e,i){var a=p(e),h=o(i[0]),l=n(i[0]),c={stroke:S,"stroke-opacity":A,"fill-opacity":h,fill:l};t.polyline(a,c).transform({translate:[r+e,s],scale:[-1,1]}),t.polyline(a,c).transform({translate:[r+e,s+2*e],scale:[1,-1]}),h=o(i[1]),l=n(i[1]),c={stroke:S,"stroke-opacity":A,"fill-opacity":h,fill:l},t.polyline(a,c).transform({translate:[r+e,s+2*e],scale:[-1,-1]}),t.polyline(a,c).transform({translate:[r+e,s],scale:[1,1]})}function v(t,r,s,e,i){var a=o(i),h=n(i),l=p(e),c={stroke:S,"stroke-opacity":A,"fill-opacity":a,fill:h};t.polyline(l,c).transform({translate:[r,s+e],scale:[1,-1]}),t.polyline(l,c).transform({translate:[r+2*e,s+e],scale:[-1,-1]}),t.polyline(l,c).transform({translate:[r,s+e],scale:[1,1]}),t.polyline(l,c).transform({translate:[r+2*e,s+e],scale:[-1,1]})}function y(t,r){var s=t/2;return[0,0,r,s,0,t,0,0].join(",")}var d=t("extend"),b=t("./color"),m=t("./sha1"),k=t("./svg"),x={baseColor:"#933c3c"},w=["octogons","overlappingCircles","plusSigns","xes","sineWaves","hexagons","overlappingRings","plaid","triangles","squares","concentricCircles","diamonds","tessellation","nestedSquares","mosaicSquares","chevrons"],j="#222",C="#ddd",S="#000",A=.02,M=.02,W=.15,H=r.exports=function(t,r){return this.opts=d({},x,r),this.hash=r.hash||m(t),this.svg=new k,this.generateBackground(),this.generatePattern(),this};H.prototype.toSvg=function(){return this.svg.toString()},H.prototype.toString=function(){return this.toSvg()},H.prototype.toBase64=function(){var t,r=this.toSvg();return t="undefined"!=typeof window&&"function"==typeof window.btoa?window.btoa(r):new s(r).toString("base64")},H.prototype.toDataUri=function(){return"data:image/svg+xml;base64,"+this.toBase64()},H.prototype.toDataUrl=function(){return'url("'+this.toDataUri()+'")'},H.prototype.generateBackground=function(){var t,r,s,n;this.opts.color?s=b.hex2rgb(this.opts.color):(r=i(e(this.hash,14,3),0,4095,0,359),n=e(this.hash,17),t=b.rgb2hsl(b.hex2rgb(this.opts.baseColor)),t.h=(360*t.h-r+360)%360/360,t.s=n%2===0?Math.min(1,(100*t.s+n)/100):Math.max(0,(100*t.s-n)/100),s=b.hsl2rgb(t)),this.color=b.rgb2hex(s),this.svg.rect(0,0,"100%","100%",{fill:b.rgb2rgbString(s)})},H.prototype.generatePattern=function(){var t=this.opts.generator;if(t){if(w.indexOf(t)<0)throw new Error("The generator "+t+" does not exist.")}else t=w[e(this.hash,20)];return this["geo"+t.slice(0,1).toUpperCase()+t.slice(1)]()},H.prototype.geoHexagons=function(){var t,r,s,h,l,c,f,u,p=e(this.hash,0),g=i(p,0,15,8,60),v=g*Math.sqrt(3),y=2*g,d=a(g);for(this.svg.setWidth(3*y+3*g),this.svg.setHeight(6*v),s=0,u=0;6>u;u++)for(f=0;6>f;f++)c=e(this.hash,s),t=f%2===0?u*v:u*v+v/2,h=o(c),r=n(c),l={fill:r,"fill-opacity":h,stroke:S,"stroke-opacity":A},this.svg.polyline(d,l).transform({translate:[f*g*1.5-y/2,t-v/2]}),0===f&&this.svg.polyline(d,l).transform({translate:[6*g*1.5-y/2,t-v/2]}),0===u&&(t=f%2===0?6*v:6*v+v/2,this.svg.polyline(d,l).transform({translate:[f*g*1.5-y/2,t-v/2]})),0===f&&0===u&&this.svg.polyline(d,l).transform({translate:[6*g*1.5-y/2,5*v+v/2]}),s++},H.prototype.geoSineWaves=function(){var t,r,s,a,h,l,c,f=Math.floor(i(e(this.hash,0),0,15,100,400)),u=Math.floor(i(e(this.hash,1),0,15,30,100)),p=Math.floor(i(e(this.hash,2),0,15,3,30));for(this.svg.setWidth(f),this.svg.setHeight(36*p),r=0;36>r;r++)l=e(this.hash,r),s=o(l),t=n(l),c=f/4*.7,h={fill:"none",stroke:t,opacity:s,"stroke-width":""+p+"px"},a="M0 "+u+" C "+c+" 0, "+(f/2-c)+" 0, "+f/2+" "+u+" S "+(f-c)+" "+2*u+", "+f+" "+u+" S "+(1.5*f-c)+" 0, "+1.5*f+", "+u,this.svg.path(a,h).transform({translate:[-f/4,p*r-1.5*u]}),this.svg.path(a,h).transform({translate:[-f/4,p*r-1.5*u+36*p]})},H.prototype.geoChevrons=function(){var t,r,s,a,l,c,f,u=i(e(this.hash,0),0,15,30,80),p=i(e(this.hash,0),0,15,30,80),g=h(u,p);for(this.svg.setWidth(6*u),this.svg.setHeight(6*p*.66),r=0,f=0;6>f;f++)for(c=0;6>c;c++)l=e(this.hash,r),s=o(l),t=n(l),a={stroke:S,"stroke-opacity":A,fill:t,"fill-opacity":s,"stroke-width":1},this.svg.group(a).transform({translate:[c*u,f*p*.66-p/2]}).polyline(g).end(),0===f&&this.svg.group(a).transform({translate:[c*u,6*p*.66-p/2]}).polyline(g).end(),r+=1},H.prototype.geoPlusSigns=function(){var t,r,s,a,h,c,f,u,p=i(e(this.hash,0),0,15,10,25),g=3*p,v=l(p);for(this.svg.setWidth(12*p),this.svg.setHeight(12*p),s=0,u=0;6>u;u++)for(f=0;6>f;f++)c=e(this.hash,s),a=o(c),r=n(c),t=u%2===0?0:1,h={fill:r,stroke:S,"stroke-opacity":A,"fill-opacity":a},this.svg.group(h).transform({translate:[f*g-f*p+t*p-p,u*g-u*p-g/2]}).rect(v).end(),0===f&&this.svg.group(h).transform({translate:[4*g-f*p+t*p-p,u*g-u*p-g/2]}).rect(v).end(),0===u&&this.svg.group(h).transform({translate:[f*g-f*p+t*p-p,4*g-u*p-g/2]}).rect(v).end(),0===f&&0===u&&this.svg.group(h).transform({translate:[4*g-f*p+t*p-p,4*g-u*p-g/2]}).rect(v).end(),s++},H.prototype.geoXes=function(){var t,r,s,a,h,c,f,u,p=i(e(this.hash,0),0,15,10,25),g=l(p),v=3*p*.943;for(this.svg.setWidth(3*v),this.svg.setHeight(3*v),s=0,u=0;6>u;u++)for(f=0;6>f;f++)c=e(this.hash,s),a=o(c),t=f%2===0?u*v-.5*v:u*v-.5*v+v/4,r=n(c),h={fill:r,opacity:a},this.svg.group(h).transform({translate:[f*v/2-v/2,t-u*v/2],rotate:[45,v/2,v/2]}).rect(g).end(),0===f&&this.svg.group(h).transform({translate:[6*v/2-v/2,t-u*v/2],rotate:[45,v/2,v/2]}).rect(g).end(),0===u&&(t=f%2===0?6*v-v/2:6*v-v/2+v/4,this.svg.group(h).transform({translate:[f*v/2-v/2,t-6*v/2],rotate:[45,v/2,v/2]}).rect(g).end()),5===u&&this.svg.group(h).transform({translate:[f*v/2-v/2,t-11*v/2],rotate:[45,v/2,v/2]}).rect(g).end(),0===f&&0===u&&this.svg.group(h).transform({translate:[6*v/2-v/2,t-6*v/2],rotate:[45,v/2,v/2]}).rect(g).end(),s++},H.prototype.geoOverlappingCircles=function(){var t,r,s,a,h,l,c,f=e(this.hash,0),u=i(f,0,15,25,200),p=u/2;for(this.svg.setWidth(6*p),this.svg.setHeight(6*p),r=0,c=0;6>c;c++)for(l=0;6>l;l++)h=e(this.hash,r),s=o(h),t=n(h),a={fill:t,opacity:s},this.svg.circle(l*p,c*p,p,a),0===l&&this.svg.circle(6*p,c*p,p,a),0===c&&this.svg.circle(l*p,6*p,p,a),0===l&&0===c&&this.svg.circle(6*p,6*p,p,a),r++},H.prototype.geoOctogons=function(){var t,r,s,a,h,l,f=i(e(this.hash,0),0,15,10,60),u=c(f);for(this.svg.setWidth(6*f),this.svg.setHeight(6*f),r=0,l=0;6>l;l++)for(h=0;6>h;h++)a=e(this.hash,r),s=o(a),t=n(a),this.svg.polyline(u,{fill:t,"fill-opacity":s,stroke:S,"stroke-opacity":A}).transform({translate:[h*f,l*f]}),r+=1},H.prototype.geoSquares=function(){var t,r,s,a,h,l,c=i(e(this.hash,0),0,15,10,60);for(this.svg.setWidth(6*c),this.svg.setHeight(6*c),r=0,l=0;6>l;l++)for(h=0;6>h;h++)a=e(this.hash,r),s=o(a),t=n(a),this.svg.rect(h*c,l*c,c,c,{fill:t,"fill-opacity":s,stroke:S,"stroke-opacity":A}),r+=1},H.prototype.geoConcentricCircles=function(){var t,r,s,a,h,l,c=e(this.hash,0),f=i(c,0,15,10,60),u=f/5;for(this.svg.setWidth(6*(f+u)),this.svg.setHeight(6*(f+u)),r=0,l=0;6>l;l++)for(h=0;6>h;h++)a=e(this.hash,r),s=o(a),t=n(a),this.svg.circle(h*f+h*u+(f+u)/2,l*f+l*u+(f+u)/2,f/2,{fill:"none",stroke:t,opacity:s,"stroke-width":u+"px"}),a=e(this.hash,39-r),s=o(a),t=n(a),this.svg.circle(h*f+h*u+(f+u)/2,l*f+l*u+(f+u)/2,f/4,{fill:t,"fill-opacity":s}),r+=1},H.prototype.geoOverlappingRings=function(){var t,r,s,a,h,l,c,f=e(this.hash,0),u=i(f,0,15,10,60),p=u/4;for(this.svg.setWidth(6*u),this.svg.setHeight(6*u),r=0,c=0;6>c;c++)for(l=0;6>l;l++)h=e(this.hash,r),s=o(h),t=n(h),a={fill:"none",stroke:t,opacity:s,"stroke-width":p+"px"},this.svg.circle(l*u,c*u,u-p/2,a),0===l&&this.svg.circle(6*u,c*u,u-p/2,a),0===c&&this.svg.circle(l*u,6*u,u-p/2,a),0===l&&0===c&&this.svg.circle(6*u,6*u,u-p/2,a),r+=1},H.prototype.geoTriangles=function(){var t,r,s,a,h,l,c,u,p=e(this.hash,0),g=i(p,0,15,15,80),v=g/2*Math.sqrt(3),y=f(g,v);for(this.svg.setWidth(3*g),this.svg.setHeight(6*v),r=0,u=0;6>u;u++)for(c=0;6>c;c++)l=e(this.hash,r),s=o(l),t=n(l),h={fill:t,"fill-opacity":s,stroke:S,"stroke-opacity":A},a=u%2===0?c%2===0?180:0:c%2!==0?180:0,this.svg.polyline(y,h).transform({translate:[c*g*.5-g/2,v*u],rotate:[a,g/2,v/2]}),0===c&&this.svg.polyline(y,h).transform({translate:[6*g*.5-g/2,v*u],rotate:[a,g/2,v/2]}),r+=1},H.prototype.geoDiamonds=function(){var t,r,s,a,h,l,c,f,p=i(e(this.hash,0),0,15,10,50),g=i(e(this.hash,1),0,15,10,50),v=u(p,g);for(this.svg.setWidth(6*p),this.svg.setHeight(3*g),s=0,f=0;6>f;f++)for(c=0;6>c;c++)l=e(this.hash,s),a=o(l),r=n(l),h={fill:r,"fill-opacity":a,stroke:S,"stroke-opacity":A},t=f%2===0?0:p/2,this.svg.polyline(v,h).transform({translate:[c*p-p/2+t,g/2*f-g/2]}),0===c&&this.svg.polyline(v,h).transform({translate:[6*p-p/2+t,g/2*f-g/2]}),0===f&&this.svg.polyline(v,h).transform({translate:[c*p-p/2+t,g/2*6-g/2]}),0===c&&0===f&&this.svg.polyline(v,h).transform({translate:[6*p-p/2+t,g/2*6-g/2]}),s+=1},H.prototype.geoNestedSquares=function(){var t,r,s,a,h,l,c,f=i(e(this.hash,0),0,15,4,12),u=7*f;for(this.svg.setWidth(6*(u+f)+6*f),this.svg.setHeight(6*(u+f)+6*f),r=0,c=0;6>c;c++)for(l=0;6>l;l++)h=e(this.hash,r),s=o(h),t=n(h),a={fill:"none",stroke:t,opacity:s,"stroke-width":f+"px"},this.svg.rect(l*u+l*f*2+f/2,c*u+c*f*2+f/2,u,u,a),h=e(this.hash,39-r),s=o(h),t=n(h),a={fill:"none",stroke:t,opacity:s,"stroke-width":f+"px"},this.svg.rect(l*u+l*f*2+f/2+2*f,c*u+c*f*2+f/2+2*f,3*f,3*f,a),r+=1},H.prototype.geoMosaicSquares=function(){var t,r,s,n=i(e(this.hash,0),0,15,15,50);for(this.svg.setWidth(8*n),this.svg.setHeight(8*n),t=0,s=0;4>s;s++)for(r=0;4>r;r++)r%2===0?s%2===0?v(this.svg,r*n*2,s*n*2,n,e(this.hash,t)):g(this.svg,r*n*2,s*n*2,n,[e(this.hash,t),e(this.hash,t+1)]):s%2===0?g(this.svg,r*n*2,s*n*2,n,[e(this.hash,t),e(this.hash,t+1)]):v(this.svg,r*n*2,s*n*2,n,e(this.hash,t)),t+=1},H.prototype.geoPlaid=function(){var t,r,s,i,a,h,l,c=0,f=0;for(r=0;36>r;)i=e(this.hash,r),c+=i+5,l=e(this.hash,r+1),s=o(l),t=n(l),a=l+5,this.svg.rect(0,c,"100%",a,{opacity:s,fill:t}),c+=a,r+=2;for(r=0;36>r;)i=e(this.hash,r),f+=i+5,l=e(this.hash,r+1),s=o(l),t=n(l),h=l+5,this.svg.rect(f,0,h,"100%",{opacity:s,fill:t}),f+=h,r+=2;this.svg.setWidth(f),this.svg.setHeight(c)},H.prototype.geoTessellation=function(){var t,r,s,a,h,l=i(e(this.hash,0),0,15,5,40),c=l*Math.sqrt(3),f=2*l,u=l/2*Math.sqrt(3),p=y(l,u),g=3*l+2*u,v=2*c+2*l;for(this.svg.setWidth(g),this.svg.setHeight(v),r=0;20>r;r++)switch(h=e(this.hash,r),s=o(h),t=n(h),a={stroke:S,"stroke-opacity":A,fill:t,"fill-opacity":s,"stroke-width":1},r){case 0:this.svg.rect(-l/2,-l/2,l,l,a),this.svg.rect(g-l/2,-l/2,l,l,a),this.svg.rect(-l/2,v-l/2,l,l,a),this.svg.rect(g-l/2,v-l/2,l,l,a);break;case 1:this.svg.rect(f/2+u,c/2,l,l,a);break;case 2:this.svg.rect(-l/2,v/2-l/2,l,l,a),this.svg.rect(g-l/2,v/2-l/2,l,l,a);break;case 3:this.svg.rect(f/2+u,1.5*c+l,l,l,a);break;case 4:this.svg.polyline(p,a).transform({translate:[l/2,-l/2],rotate:[0,l/2,u/2]}),this.svg.polyline(p,a).transform({translate:[l/2,v- -l/2],rotate:[0,l/2,u/2],scale:[1,-1]});break;case 5:this.svg.polyline(p,a).transform({translate:[g-l/2,-l/2],rotate:[0,l/2,u/2],scale:[-1,1]}),this.svg.polyline(p,a).transform({translate:[g-l/2,v+l/2],rotate:[0,l/2,u/2],scale:[-1,-1]});break;case 6:this.svg.polyline(p,a).transform({translate:[g/2+l/2,c/2]});break;case 7:this.svg.polyline(p,a).transform({translate:[g-g/2-l/2,c/2],scale:[-1,1]});break;case 8:this.svg.polyline(p,a).transform({translate:[g/2+l/2,v-c/2],scale:[1,-1]});break;case 9:this.svg.polyline(p,a).transform({translate:[g-g/2-l/2,v-c/2],scale:[-1,-1]});break;case 10:this.svg.polyline(p,a).transform({translate:[l/2,v/2-l/2]});break;case 11:this.svg.polyline(p,a).transform({translate:[g-l/2,v/2-l/2],scale:[-1,1]});break;case 12:this.svg.rect(0,0,l,l,a).transform({translate:[l/2,l/2],rotate:[-30,0,0]});break;case 13:this.svg.rect(0,0,l,l,a).transform({scale:[-1,1],translate:[-g+l/2,l/2],rotate:[-30,0,0]});break;case 14:this.svg.rect(0,0,l,l,a).transform({translate:[l/2,v/2-l/2-l],rotate:[30,0,l]});break;case 15:this.svg.rect(0,0,l,l,a).transform({scale:[-1,1],translate:[-g+l/2,v/2-l/2-l],rotate:[30,0,l]});break;case 16:this.svg.rect(0,0,l,l,a).transform({scale:[1,-1],translate:[l/2,-v+v/2-l/2-l],rotate:[30,0,l]});break;case 17:this.svg.rect(0,0,l,l,a).transform({scale:[-1,-1],translate:[-g+l/2,-v+v/2-l/2-l],rotate:[30,0,l]});break;case 18:this.svg.rect(0,0,l,l,a).transform({scale:[1,-1],translate:[l/2,-v+l/2],rotate:[-30,0,0]});break;case 19:this.svg.rect(0,0,l,l,a).transform({scale:[-1,-1],translate:[-g+l/2,-v+l/2],rotate:[-30,0,0]})}}}).call(this,t("buffer").Buffer)},{"./color":2,"./sha1":5,"./svg":6,buffer:8,extend:9}],5:[function(t,r){"use strict";function s(){function t(){for(var t=16;80>t;t++){var r=f[t-3]^f[t-8]^f[t-14]^f[t-16];f[t]=r<<1|r>>>31}var s,e,i=o,n=a,p=h,g=l,v=c;for(t=0;80>t;t++){20>t?(s=g^n&(p^g),e=1518500249):40>t?(s=n^p^g,e=1859775393):60>t?(s=n&p|g&(n|p),e=2400959708):(s=n^p^g,e=3395469782);var y=(i<<5|i>>>27)+s+v+e+(0|f[t]);v=g,g=p,p=n<<30|n>>>2,n=i,i=y}for(o=o+i|0,a=a+n|0,h=h+p|0,l=l+g|0,c=c+v|0,u=0,t=0;16>t;t++)f[t]=0}function r(r){f[u]|=(255&r)<<p,p?p-=8:(u++,p=24),16===u&&t()}function s(t){var s=t.length;g+=8*s;for(var e=0;s>e;e++)r(t.charCodeAt(e))}function e(t){if("string"==typeof t)return s(t);var e=t.length;g+=8*e;for(var i=0;e>i;i++)r(t[i])}function i(t){for(var r="",s=28;s>=0;s-=4)r+=(t>>s&15).toString(16);return r}function n(){r(128),(u>14||14===u&&24>p)&&t(),u=14,p=24,r(0),r(0),r(g>0xffffffffff?g/1099511627776:0),r(g>4294967295?g/4294967296:0);for(var s=24;s>=0;s-=8)r(g>>s);return i(o)+i(a)+i(h)+i(l)+i(c)}var o=1732584193,a=4023233417,h=2562383102,l=271733878,c=3285377520,f=new Uint32Array(80),u=0,p=24,g=0;return{update:e,digest:n}}r.exports=function(t){if(void 0===t)return s();var r=s();return r.update(t),r.digest()}},{}],6:[function(t,r){"use strict";function s(){return this.width=100,this.height=100,this.svg=new i("svg"),this.context=[],this.setAttributes(this.svg,{xmlns:"http://www.w3.org/2000/svg",width:this.width,height:this.height}),this}var e=t("extend"),i=t("./xml");r.exports=s,s.prototype.currentContext=function(){return this.context[this.context.length-1]||this.svg},s.prototype.end=function(){return this.context.pop(),this},s.prototype.currentNode=function(){var t=this.currentContext();return t.lastChild||t},s.prototype.transform=function(t){return this.currentNode().setAttribute("transform",Object.keys(t).map(function(r){return r+"("+t[r].join(",")+")"}).join(" ")),this},s.prototype.setAttributes=function(t,r){Object.keys(r).forEach(function(s){t.setAttribute(s,r[s])})},s.prototype.setWidth=function(t){this.svg.setAttribute("width",Math.floor(t))},s.prototype.setHeight=function(t){this.svg.setAttribute("height",Math.floor(t))},s.prototype.toString=function(){return this.svg.toString()},s.prototype.rect=function(t,r,s,n,o){var a=this;if(Array.isArray(t))return t.forEach(function(t){a.rect.apply(a,t.concat(o))}),this;var h=new i("rect");return this.currentContext().appendChild(h),this.setAttributes(h,e({x:t,y:r,width:s,height:n},o)),this},s.prototype.circle=function(t,r,s,n){var o=new i("circle");return this.currentContext().appendChild(o),this.setAttributes(o,e({cx:t,cy:r,r:s},n)),this},s.prototype.path=function(t,r){var s=new i("path");return this.currentContext().appendChild(s),this.setAttributes(s,e({d:t},r)),this},s.prototype.polyline=function(t,r){var s=this;if(Array.isArray(t))return t.forEach(function(t){s.polyline(t,r)}),this;var n=new i("polyline");return this.currentContext().appendChild(n),this.setAttributes(n,e({points:t},r)),this},s.prototype.group=function(t){var r=new i("g");return this.currentContext().appendChild(r),this.context.push(r),this.setAttributes(r,e({},t)),this}},{"./xml":7,extend:9}],7:[function(t,r){"use strict";var s=r.exports=function(t){return this instanceof s?(this.tagName=t,this.attributes=Object.create(null),this.children=[],this.lastChild=null,this):new s(t)};s.prototype.appendChild=function(t){return this.children.push(t),this.lastChild=t,this},s.prototype.setAttribute=function(t,r){return this.attributes[t]=r,this},s.prototype.toString=function(){var t=this;return["<",t.tagName,Object.keys(t.attributes).map(function(r){return[" ",r,'="',t.attributes[r],'"'].join("")}).join(""),">",t.children.map(function(t){return t.toString()}).join(""),"</",t.tagName,">"].join("")}},{}],8:[function(){},{}],9:[function(t,r){function s(t){if(!t||"[object Object]"!==i.call(t)||t.nodeType||t.setInterval)return!1;var r=e.call(t,"constructor"),s=e.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!r&&!s)return!1;var n;for(n in t);return void 0===n||e.call(t,n)}var e=Object.prototype.hasOwnProperty,i=Object.prototype.toString;r.exports=function n(){var t,r,e,i,o,a,h=arguments[0]||{},l=1,c=arguments.length,f=!1;for("boolean"==typeof h&&(f=h,h=arguments[1]||{},l=2),"object"!=typeof h&&"function"!=typeof h&&(h={});c>l;l++)if(null!=(t=arguments[l]))for(r in t)e=h[r],i=t[r],h!==i&&(f&&i&&(s(i)||(o=Array.isArray(i)))?(o?(o=!1,a=e&&Array.isArray(e)?e:[]):a=e&&s(e)?e:{},h[r]=n(f,a,i)):void 0!==i&&(h[r]=i));return h}},{}]},{},[1])(1)});
/*!
 * IE10 viewport hack for Surface/desktop Windows 8 bug
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

// See the Getting Started docs for more information:
// http://getbootstrap.com/getting-started/#support-ie10-width

(function () {
  'use strict';

  if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }

})();

/*!
 * jquery.okayNav.js 2.0.4 (https://github.com/VPenkov/okayNav)
 * Author: Vergil Penkov (http://vergilpenkov.com/)
 * MIT license: https://opensource.org/licenses/MIT
 */

;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory); // AMD
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function(root, jQuery) { // Node/CommonJS
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        factory(jQuery); // Browser globals
    }
}(function($) {
    // Defaults

    var okayNav = 'okayNav',
        defaults = {
            parent: '', // will call nav's parent() by default
            toggle_icon_class: 'okayNav__menu-toggle',
            toggle_icon_content: '<span /><span /><span />',
            align_right: true, // If false, the menu and the kebab icon will be on the left
            swipe_enabled: true, // If true, you'll be able to swipe left/right to open the navigation
            threshold: 50, // Nav will auto open/close if swiped >= this many percent
            resize_delay: 10, // When resizing the window, okayNav can throttle its recalculations if enabled. Setting this to 50-250 will improve performance but make okayNav less accurate.
            beforeOpen: function() {}, // Will trigger before the nav gets opened
            afterOpen: function() {}, // Will trigger after the nav gets opened
            beforeClose: function() {}, // Will trigger before the nav gets closed
            afterClose: function() {}, // Will trigger after the nav gets closed
            itemHidden: function() {},
            itemDisplayed: function() {}
        };

    // Begin
    function Plugin(element, options) {
        var self = this;
        this.options = $.extend({}, defaults, options);

        self.navigation = $(element);
        self.document = $(document);
        self.window = $(window);

        this.options.parent == '' ? this.options.parent = self.navigation.parent() : '';

        self.nav_open = false; // Store the state of the hidden nav
        self.parent_full_width = 0;

        // Swipe stuff
        self.radCoef = 180 / Math.PI;
        self.sTouch = {
            x: 0,
            y: 0
        };
        self.cTouch = {
            x: 0,
            y: 0
        };
        self.sTime = 0;
        self.nav_position = 0;
        self.percent_open = 0;
        self.nav_moving = false;


        self.init();
    }

    $.extend(Plugin.prototype, {

        init: function() {
            var self = this;

            $('body').addClass('okayNav-loaded');

            // Add classes
            self.navigation
                .addClass('okayNav loaded')
                .children('ul').addClass('okayNav__nav--visible');

            // Append elements
            if (self.options.align_right) {
                self.navigation
                    .append('<ul class="okayNav__nav--invisible transition-enabled nav-right" />')
                    .append('<a href="#" class="' + self.options.toggle_icon_class + ' okay-invisible">' + self.options.toggle_icon_content + '</a>')
            } else {
                self.navigation
                    .prepend('<ul class="okayNav__nav--invisible transition-enabled nav-left" />')
                    .prepend('<a href="#" class="' + self.options.toggle_icon_class + ' okay-invisible">' + self.options.toggle_icon_content + '</a>')
            }

            // Cache new elements for further use
            self.nav_visible = self.navigation.children('.okayNav__nav--visible');
            self.nav_invisible = self.navigation.children('.okayNav__nav--invisible');
            self.toggle_icon = self.navigation.children('.' + self.options.toggle_icon_class);

            self.toggle_icon_width = self.toggle_icon.outerWidth(true);
            self.default_width = self.getChildrenWidth(self.navigation);
            self.parent_full_width = $(self.options.parent).outerWidth(true);
            self.last_visible_child_width = 0; // We'll define this later

            // Events are up once everything is set
            self.initEvents();

            // Trim white spaces between visible nav elements
            self.nav_visible.contents().filter(function() {
                return this.nodeType = Node.TEXT_NODE && /\S/.test(this.nodeValue) === false;
            }).remove();

            if (self.options.swipe_enabled == true) self.initSwipeEvents();
        },

        initEvents: function() {
            var self = this;
            // Toggle hidden nav when hamburger icon is clicked and
            // Collapse hidden nav on click outside the header
            self.document.on('click.okayNav', function(e) {
                var _target = $(e.target);

                if (self.nav_open === true && _target.closest('.okayNav').length == 0)
                    self.closeInvisibleNav();

                if (e.target === self.toggle_icon.get(0)) {
                    e.preventDefault();
                    self.toggleInvisibleNav();
                }
            });

            var optimizeResize = self._debounce(function() {
                self.recalcNav()
            }, self.options.resize_delay);
            self.window.on('load.okayNav resize.okayNav', optimizeResize);
        },

        initSwipeEvents: function() {
            var self = this;
            self.document
                .on('touchstart.okayNav', function(e) {
                    self.nav_invisible.removeClass('transition-enabled');

                    //Trigger only on touch with one finger
                    if (e.originalEvent.touches.length == 1) {
                        var touch = e.originalEvent.touches[0];
                        if (
                            ((touch.pageX < 25 && self.options.align_right == false) ||
                                (touch.pageX > ($(self.options.parent).outerWidth(true) - 25) &&
                                    self.options.align_right == true)) ||
                            self.nav_open === true) {

                            self.sTouch.x = self.cTouch.x = touch.pageX;
                            self.sTouch.y = self.cTouch.y = touch.pageY;
                            self.sTime = Date.now();
                        }

                    }
                })
                .on('touchmove.okayNav', function(e) {
                    var touch = e.originalEvent.touches[0];
                    self._triggerMove(touch.pageX, touch.pageY);
                    self.nav_moving = true;
                })
                .on('touchend.okayNav', function(e) {
                    self.sTouch = {
                        x: 0,
                        y: 0
                    };
                    self.cTouch = {
                        x: 0,
                        y: 0
                    };
                    self.sTime = 0;

                    //Close menu if not swiped enough
                    if (self.percent_open > (100 - self.options.threshold)) {
                        self.nav_position = 0;
                        self.closeInvisibleNav();

                    } else if (self.nav_moving == true) {
                        self.nav_position = self.nav_invisible.width();
                        self.openInvisibleNav();
                    }

                    self.nav_moving = false;

                    self.nav_invisible.addClass('transition-enabled');
                });
        },

        _getDirection: function(dx) {
            if (this.options.align_right) {
                return (dx > 0) ? -1 : 1;
            } else {
                return (dx < 0) ? -1 : 1;
            }
        },

        _triggerMove: function(x, y) {
            var self = this;

            self.cTouch.x = x;
            self.cTouch.y = y;

            var currentTime = Date.now();
            var dx = (self.cTouch.x - self.sTouch.x);
            var dy = (self.cTouch.y - self.sTouch.y);

            var opposing = dy * dy;
            var distance = Math.sqrt(dx * dx + opposing);
            //Length of the opposing side of the 90deg triagle
            var dOpposing = Math.sqrt(opposing);

            var angle = Math.asin(Math.sin(dOpposing / distance)) * self.radCoef;
            var speed = distance / (currentTime - self.sTime);

            //Set new start position
            self.sTouch.x = x;
            self.sTouch.y = y;

            //Remove false swipes
            if (angle < 20) {
                var dir = self._getDirection(dx);

                var newPos = self.nav_position + dir * distance;
                var menuWidth = self.nav_invisible.width();
                var overflow = 0;


                if (newPos < 0) {
                    overflow = -newPos;
                } else if (newPos > menuWidth) {
                    overflow = menuWidth - newPos;
                }

                var size = menuWidth - (self.nav_position + dir * distance + overflow);
                var threshold = (size / menuWidth) * 100;

                //Set new position and threshold
                self.nav_position += dir * distance + overflow;
                self.percent_open = threshold;

                // self.nav_invisible.css('transform', 'translateX(' + (self.options.align_right ? 1 : -1) * threshold + '%)');
            }

        },

        /*
         * A few methods to allow working with elements
         */
        getParent: function() {
            return this.options.parent;
        },

        getVisibleNav: function() { // Visible navigation
            return this.nav_visible;
        },

        getInvisibleNav: function() { // Hidden behind the kebab icon
            return this.nav_invisible;
        },

        getNavToggleIcon: function() { // Kebab icon
            return this.toggle_icon;
        },

        /*
         * Operations
         */
        _debounce: function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        openInvisibleNav: function() {
            var self = this;

            !self.options.enable_swipe ? self.options.beforeOpen.call() : '';

            self.toggle_icon.addClass('icon--active');
            self.nav_invisible.addClass('nav-open');
            self.nav_open = true;
            // self.nav_invisible.css({
            //     '-webkit-transform': 'translateX(0%)',
            //     'transform': 'translateX(0%)'
            // });

            self.options.afterOpen.call();
        },

        closeInvisibleNav: function() {
            var self = this;
            !self.options.enable_swipe ? self.options.beforeClose.call() : '';

            self.toggle_icon.removeClass('icon--active');
            self.nav_invisible.removeClass('nav-open');

            // if (self.options.align_right) {
            //     self.nav_invisible.css({
            //         '-webkit-transform': 'translateX(100%)',
            //         'transform': 'translateX(100%)'
            //     });
            // } else {
            //     self.nav_invisible.css({
            //         '-webkit-transform': 'translateX(-100%)',
            //         'transform': 'translateX(-100%)'
            //     });
            // }
            self.nav_open = false;

            self.options.afterClose.call();
        },

        toggleInvisibleNav: function() {
            var self = this;
            if (!self.nav_open) {
                self.openInvisibleNav();
            } else {
                self.closeInvisibleNav();
            }
        },


        /*
         * Math stuff
         */
        getChildrenWidth: function(el) {
            var children_width = 0;
            var children = $(el).children();
            for (var i = 0; i < children.length; i++) {
                children_width += $(children[i]).outerWidth(true);
            };

            return children_width;
        },

        getVisibleItemCount: function() {
            return $('li', this.nav_visible).length;
        },
        getHiddenItemCount: function() {
            return $('li', this.nav_invisible).length;
        },

        recalcNav: function() {
            var self = this;
            var wrapper_width = $(self.options.parent).outerWidth(true),
                space_taken = self.getChildrenWidth(self.options.parent),
                nav_full_width = self.navigation.outerWidth(true),
                visible_nav_items = self.getVisibleItemCount(),
                collapse_width = self.nav_visible.outerWidth(true) + self.toggle_icon_width,
                expand_width = space_taken + self.last_visible_child_width + self.toggle_icon_width,
                expandAll_width = space_taken - nav_full_width + self.default_width;

            if (wrapper_width > expandAll_width) {
                self._expandAllItems();
                self.toggle_icon.addClass('okay-invisible');
                return;
            }

            if (visible_nav_items > 0 &&
                nav_full_width <= collapse_width &&
                wrapper_width <= expand_width) {
                self._collapseNavItem();
            }

            if (wrapper_width > expand_width + self.toggle_icon_width + 15) {
                self._expandNavItem();
            }


            // Hide the kebab icon if no items are hidden
            self.getHiddenItemCount() == 0 ?
                self.toggle_icon.addClass('okay-invisible') :
                self.toggle_icon.removeClass('okay-invisible');
        },

        _collapseNavItem: function() {
            var self = this;
            var $last_child = $('li:last-child', self.nav_visible);
            self.last_visible_child_width = $last_child.outerWidth(true);
            self.document.trigger('okayNav:collapseItem', $last_child);
            $last_child.detach().prependTo(self.nav_invisible);
            self.options.itemHidden.call();
            // All nav items are visible by default
            // so we only need recursion when collapsing

            self.recalcNav();
        },

        _expandNavItem: function() {
            var self = this;
            var $first = $('li:first-child', self.nav_invisible);
            self.document.trigger('okayNav:expandItem', $first);
            $first.detach().appendTo(self.nav_visible);
            self.options.itemDisplayed.call();
        },

        _expandAllItems: function() {
            var self = this;
            $('li', self.nav_invisible).detach().appendTo(self.nav_visible);
            self.options.itemDisplayed.call();
        },

        _collapseAllItems: function() {
            var self = this;
            $('li', self.nav_visible).detach().appendTo(self.nav_invisible);
            self.options.itemHidden.call();
        },

        destroy: function() {
            var self = this;
            $('li', self.nav_invisible).appendTo(self.nav_visible);
            self.nav_invisible.remove();
            self.nav_visible.removeClass('okayNav__nav--visible');
            self.toggle_icon.remove();

            self.document.unbind('.okayNav');
            self.window.unbind('.okayNav');
        }

    });

    // Plugin wrapper
    $.fn[okayNav] = function(options) {
        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + okayNav)) {
                    $.data(this, 'plugin_' + okayNav, new Plugin(this, options));
                }
            });

        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            var returns;
            this.each(function() {
                var instance = $.data(this, 'plugin_' + okayNav);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }

                if (options === 'destroy') {
                    $.data(this, 'plugin_' + okayNav, null);
                }
            });

            return returns !== undefined ? returns : this;
        }
    };
}));

!function(r){"use strict";function t(t,e,n,o){function i(r,t){return r-=o,t-=o,!(0>r||r>=u||0>t||t>=u)&&a.isDark(r,t)}var a=r(n,e);a.addData(t),a.make(),o=o||0;var u=a.getModuleCount(),f=a.getModuleCount()+2*o,c=function(r,t,e,n){var o=this.isDark,i=1/f;this.isDark=function(a,u){var f=u*i,c=a*i,s=f+i,l=c+i;return o(a,u)&&(r>s||f>e||t>l||c>n)}};this.text=t,this.level=e,this.version=n,this.moduleCount=f,this.isDark=i,this.addBlank=c}function e(r,e,n,o,i){n=Math.max(1,n||1),o=Math.min(40,o||40);for(var a=n;o>=a;a+=1)try{return new t(r,e,a,i)}catch(r){}}function n(r,t,e){var n=e.size,o="bold "+e.mSize*n+"px "+e.fontname,i=p("<canvas/>")[0].getContext("2d");i.font=o;var a=i.measureText(e.label).width,u=e.mSize,f=a/n,c=(1-f)*e.mPosX,s=(1-u)*e.mPosY,l=c+f,h=s+u,d=.01;1===e.mode?r.addBlank(0,s-d,n,h+d):r.addBlank(c-d,s-d,l+d,h+d),t.fillStyle=e.fontcolor,t.font=o,t.fillText(e.label,c*n,s*n+.75*e.mSize*n)}function o(r,t,e){var n=e.size,o=e.image.naturalWidth||1,i=e.image.naturalHeight||1,a=e.mSize,u=a*o/i,f=(1-u)*e.mPosX,c=(1-a)*e.mPosY,s=f+u,l=c+a,h=.01;3===e.mode?r.addBlank(0,c-h,n,l+h):r.addBlank(f-h,c-h,s+h,l+h),t.drawImage(e.image,f*n,c*n,u*n,a*n)}function i(r,t,e){p(e.background).is("img")?t.drawImage(e.background,0,0,e.size,e.size):e.background&&(t.fillStyle=e.background,t.fillRect(e.left,e.top,e.size,e.size));var i=e.mode;1===i||2===i?n(r,t,e):(3===i||4===i)&&o(r,t,e)}function a(r,t,e,n,o,i,a,u){r.isDark(a,u)&&t.rect(n,o,i,i)}function u(r,t,e,n,o,i,a,u,f,c){a?r.moveTo(t+i,e):r.moveTo(t,e),u?(r.lineTo(n-i,e),r.arcTo(n,e,n,o,i)):r.lineTo(n,e),f?(r.lineTo(n,o-i),r.arcTo(n,o,t,o,i)):r.lineTo(n,o),c?(r.lineTo(t+i,o),r.arcTo(t,o,t,e,i)):r.lineTo(t,o),a?(r.lineTo(t,e+i),r.arcTo(t,e,n,e,i)):r.lineTo(t,e)}function f(r,t,e,n,o,i,a,u,f,c){a&&(r.moveTo(t+i,e),r.lineTo(t,e),r.lineTo(t,e+i),r.arcTo(t,e,t+i,e,i)),u&&(r.moveTo(n-i,e),r.lineTo(n,e),r.lineTo(n,e+i),r.arcTo(n,e,n-i,e,i)),f&&(r.moveTo(n-i,o),r.lineTo(n,o),r.lineTo(n,o-i),r.arcTo(n,o,n-i,o,i)),c&&(r.moveTo(t+i,o),r.lineTo(t,o),r.lineTo(t,o-i),r.arcTo(t,o,t+i,o,i))}function c(r,t,e,n,o,i,a,c){var s=r.isDark,l=n+i,h=o+i,d=e.radius*i,g=a-1,v=a+1,p=c-1,w=c+1,m=s(a,c),T=s(g,p),y=s(g,c),E=s(g,w),A=s(a,w),B=s(v,w),k=s(v,c),b=s(v,p),C=s(a,p);m?u(t,n,o,l,h,d,!y&&!C,!y&&!A,!k&&!A,!k&&!C):f(t,n,o,l,h,d,y&&C&&T,y&&A&&E,k&&A&&B,k&&C&&b)}function s(r,t,e){var n,o,i=r.moduleCount,u=e.size/i,f=a;for(m&&e.radius>0&&e.radius<=.5&&(f=c),t.beginPath(),n=0;i>n;n+=1)for(o=0;i>o;o+=1){var s=e.left+o*u,l=e.top+n*u,h=u;f(r,t,e,s,l,h,n,o)}if(p(e.fill).is("img")){t.strokeStyle="rgba(0,0,0,0.5)",t.lineWidth=2,t.stroke();var d=t.globalCompositeOperation;t.globalCompositeOperation="destination-out",t.fill(),t.globalCompositeOperation=d,t.clip(),t.drawImage(e.fill,0,0,e.size,e.size),t.restore()}else t.fillStyle=e.fill,t.fill()}function l(r,t){var n=e(t.text,t.ecLevel,t.minVersion,t.maxVersion,t.quiet);if(!n)return null;var o=p(r).data("qrcode",n),a=o[0].getContext("2d");return i(n,a,t),s(n,a,t),o}function h(r){var t=p("<canvas/>").attr("width",r.size).attr("height",r.size);return l(t,r)}function d(r){return p("<img/>").attr("src",h(r)[0].toDataURL("image/png"))}function g(r){var t=e(r.text,r.ecLevel,r.minVersion,r.maxVersion,r.quiet);if(!t)return null;var n,o,i=r.size,a=r.background,u=Math.floor,f=t.moduleCount,c=u(i/f),s=u(.5*(i-c*f)),l={position:"relative",left:0,top:0,padding:0,margin:0,width:i,height:i},h={position:"absolute",padding:0,margin:0,width:c,height:c,"background-color":r.fill},d=p("<div/>").data("qrcode",t).css(l);for(a&&d.css("background-color",a),n=0;f>n;n+=1)for(o=0;f>o;o+=1)t.isDark(n,o)&&p("<div/>").css(h).css({left:s+o*c,top:s+n*c}).appendTo(d);return d}function v(r){return w&&"canvas"===r.render?h(r):w&&"image"===r.render?d(r):g(r)}var p=jQuery,w=function(){var r=document.createElement("canvas");return Boolean(r.getContext&&r.getContext("2d"))}(),m="[object Opera]"!==Object.prototype.toString.call(window.opera),T={render:"canvas",minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:0,quiet:0,mode:0,mSize:.1,mPosX:.5,mPosY:.5,label:"no label",fontname:"sans",fontcolor:"#000",image:null};p.fn.qrcode=function(r){var t=p.extend({},T,r);return this.each(function(){"canvas"===this.nodeName.toLowerCase()?l(this,t):p(this).append(v(t))})}}(function(){var r=function(){function r(t,e){if("undefined"==typeof t.length)throw new Error(t.length+"/"+e);var n=function(){for(var r=0;r<t.length&&0==t[r];)r+=1;for(var n=new Array(t.length-r+e),o=0;o<t.length-r;o+=1)n[o]=t[o+r];return n}(),o={};return o.getAt=function(r){return n[r]},o.getLength=function(){return n.length},o.multiply=function(t){for(var e=new Array(o.getLength()+t.getLength()-1),n=0;n<o.getLength();n+=1)for(var i=0;i<t.getLength();i+=1)e[n+i]^=a.gexp(a.glog(o.getAt(n))+a.glog(t.getAt(i)));return r(e,0)},o.mod=function(t){if(o.getLength()-t.getLength()<0)return o;for(var e=a.glog(o.getAt(0))-a.glog(t.getAt(0)),n=new Array(o.getLength()),i=0;i<o.getLength();i+=1)n[i]=o.getAt(i);for(var i=0;i<t.getLength();i+=1)n[i]^=a.gexp(a.glog(t.getAt(i))+e);return r(n,0).mod(t)},o}var t=function(t,e){var o=236,a=17,s=t,l=n[e],h=null,d=0,v=null,p=new Array,w={},m=function(r,t){d=4*s+17,h=function(r){for(var t=new Array(r),e=0;r>e;e+=1){t[e]=new Array(r);for(var n=0;r>n;n+=1)t[e][n]=null}return t}(d),T(0,0),T(d-7,0),T(0,d-7),A(),E(),k(r,t),s>=7&&B(r),null==v&&(v=M(s,l,p)),b(v,t)},T=function(r,t){for(var e=-1;7>=e;e+=1)if(!(-1>=r+e||r+e>=d))for(var n=-1;7>=n;n+=1)-1>=t+n||t+n>=d||(e>=0&&6>=e&&(0==n||6==n)||n>=0&&6>=n&&(0==e||6==e)||e>=2&&4>=e&&n>=2&&4>=n?h[r+e][t+n]=!0:h[r+e][t+n]=!1)},y=function(){for(var r=0,t=0,e=0;8>e;e+=1){m(!0,e);var n=i.getLostPoint(w);(0==e||r>n)&&(r=n,t=e)}return t},E=function(){for(var r=8;d-8>r;r+=1)null==h[r][6]&&(h[r][6]=r%2==0);for(var t=8;d-8>t;t+=1)null==h[6][t]&&(h[6][t]=t%2==0)},A=function(){for(var r=i.getPatternPosition(s),t=0;t<r.length;t+=1)for(var e=0;e<r.length;e+=1){var n=r[t],o=r[e];if(null==h[n][o])for(var a=-2;2>=a;a+=1)for(var u=-2;2>=u;u+=1)-2==a||2==a||-2==u||2==u||0==a&&0==u?h[n+a][o+u]=!0:h[n+a][o+u]=!1}},B=function(r){for(var t=i.getBCHTypeNumber(s),e=0;18>e;e+=1){var n=!r&&1==(t>>e&1);h[Math.floor(e/3)][e%3+d-8-3]=n}for(var e=0;18>e;e+=1){var n=!r&&1==(t>>e&1);h[e%3+d-8-3][Math.floor(e/3)]=n}},k=function(r,t){for(var e=l<<3|t,n=i.getBCHTypeInfo(e),o=0;15>o;o+=1){var a=!r&&1==(n>>o&1);6>o?h[o][8]=a:8>o?h[o+1][8]=a:h[d-15+o][8]=a}for(var o=0;15>o;o+=1){var a=!r&&1==(n>>o&1);8>o?h[8][d-o-1]=a:9>o?h[8][15-o-1+1]=a:h[8][15-o-1]=a}h[d-8][8]=!r},b=function(r,t){for(var e=-1,n=d-1,o=7,a=0,u=i.getMaskFunction(t),f=d-1;f>0;f-=2)for(6==f&&(f-=1);;){for(var c=0;2>c;c+=1)if(null==h[n][f-c]){var s=!1;a<r.length&&(s=1==(r[a]>>>o&1));var l=u(n,f-c);l&&(s=!s),h[n][f-c]=s,o-=1,-1==o&&(a+=1,o=7)}if(n+=e,0>n||n>=d){n-=e,e=-e;break}}},C=function(t,e){for(var n=0,o=0,a=0,u=new Array(e.length),f=new Array(e.length),c=0;c<e.length;c+=1){var s=e[c].dataCount,l=e[c].totalCount-s;o=Math.max(o,s),a=Math.max(a,l),u[c]=new Array(s);for(var h=0;h<u[c].length;h+=1)u[c][h]=255&t.getBuffer()[h+n];n+=s;var d=i.getErrorCorrectPolynomial(l),g=r(u[c],d.getLength()-1),v=g.mod(d);f[c]=new Array(d.getLength()-1);for(var h=0;h<f[c].length;h+=1){var p=h+v.getLength()-f[c].length;f[c][h]=p>=0?v.getAt(p):0}}for(var w=0,h=0;h<e.length;h+=1)w+=e[h].totalCount;for(var m=new Array(w),T=0,h=0;o>h;h+=1)for(var c=0;c<e.length;c+=1)h<u[c].length&&(m[T]=u[c][h],T+=1);for(var h=0;a>h;h+=1)for(var c=0;c<e.length;c+=1)h<f[c].length&&(m[T]=f[c][h],T+=1);return m},M=function(r,t,e){for(var n=u.getRSBlocks(r,t),c=f(),s=0;s<e.length;s+=1){var l=e[s];c.put(l.getMode(),4),c.put(l.getLength(),i.getLengthInBits(l.getMode(),r)),l.write(c)}for(var h=0,s=0;s<n.length;s+=1)h+=n[s].dataCount;if(c.getLengthInBits()>8*h)throw new Error("code length overflow. ("+c.getLengthInBits()+">"+8*h+")");for(c.getLengthInBits()+4<=8*h&&c.put(0,4);c.getLengthInBits()%8!=0;)c.putBit(!1);for(;!(c.getLengthInBits()>=8*h)&&(c.put(o,8),!(c.getLengthInBits()>=8*h));)c.put(a,8);return C(c,n)};return w.addData=function(r){var t=c(r);p.push(t),v=null},w.isDark=function(r,t){if(0>r||r>=d||0>t||t>=d)throw new Error(r+","+t);return h[r][t]},w.getModuleCount=function(){return d},w.make=function(){m(!1,y())},w.createTableTag=function(r,t){r=r||2,t="undefined"==typeof t?4*r:t;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+t+"px;",e+='">',e+="<tbody>";for(var n=0;n<w.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<w.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+r+"px;",e+=" height: "+r+"px;",e+=" background-color: ",e+=w.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},w.createImgTag=function(r,t){r=r||2,t="undefined"==typeof t?4*r:t;var e=w.getModuleCount()*r+2*t,n=t,o=e-t;return g(e,e,function(t,e){if(t>=n&&o>t&&e>=n&&o>e){var i=Math.floor((t-n)/r),a=Math.floor((e-n)/r);return w.isDark(a,i)?0:1}return 1})},w};t.stringToBytes=function(r){for(var t=new Array,e=0;e<r.length;e+=1){var n=r.charCodeAt(e);t.push(255&n)}return t},t.createStringToBytes=function(r,t){var e=function(){for(var e=h(r),n=function(){var r=e.read();if(-1==r)throw new Error;return r},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n(),c=n(),s=String.fromCharCode(a<<8|u),l=f<<8|c;i[s]=l,o+=1}if(o!=t)throw new Error(o+" != "+t);return i}(),n="?".charCodeAt(0);return function(r){for(var t=new Array,o=0;o<r.length;o+=1){var i=r.charCodeAt(o);if(128>i)t.push(i);else{var a=e[r.charAt(o)];"number"==typeof a?(255&a)==a?t.push(a):(t.push(a>>>8),t.push(255&a)):t.push(n)}}return t}};var e={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},n={L:1,M:0,Q:3,H:2},o={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},i=function(){var t=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],n=1335,i=7973,u=21522,f={},c=function(r){for(var t=0;0!=r;)t+=1,r>>>=1;return t};return f.getBCHTypeInfo=function(r){for(var t=r<<10;c(t)-c(n)>=0;)t^=n<<c(t)-c(n);return(r<<10|t)^u},f.getBCHTypeNumber=function(r){for(var t=r<<12;c(t)-c(i)>=0;)t^=i<<c(t)-c(i);return r<<12|t},f.getPatternPosition=function(r){return t[r-1]},f.getMaskFunction=function(r){switch(r){case o.PATTERN000:return function(r,t){return(r+t)%2==0};case o.PATTERN001:return function(r,t){return r%2==0};case o.PATTERN010:return function(r,t){return t%3==0};case o.PATTERN011:return function(r,t){return(r+t)%3==0};case o.PATTERN100:return function(r,t){return(Math.floor(r/2)+Math.floor(t/3))%2==0};case o.PATTERN101:return function(r,t){return r*t%2+r*t%3==0};case o.PATTERN110:return function(r,t){return(r*t%2+r*t%3)%2==0};case o.PATTERN111:return function(r,t){return(r*t%3+(r+t)%2)%2==0};default:throw new Error("bad maskPattern:"+r)}},f.getErrorCorrectPolynomial=function(t){for(var e=r([1],0),n=0;t>n;n+=1)e=e.multiply(r([1,a.gexp(n)],0));return e},f.getLengthInBits=function(r,t){if(t>=1&&10>t)switch(r){case e.MODE_NUMBER:return 10;case e.MODE_ALPHA_NUM:return 9;case e.MODE_8BIT_BYTE:return 8;case e.MODE_KANJI:return 8;default:throw new Error("mode:"+r)}else if(27>t)switch(r){case e.MODE_NUMBER:return 12;case e.MODE_ALPHA_NUM:return 11;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 10;default:throw new Error("mode:"+r)}else{if(!(41>t))throw new Error("type:"+t);switch(r){case e.MODE_NUMBER:return 14;case e.MODE_ALPHA_NUM:return 13;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 12;default:throw new Error("mode:"+r)}}},f.getLostPoint=function(r){for(var t=r.getModuleCount(),e=0,n=0;t>n;n+=1)for(var o=0;t>o;o+=1){for(var i=0,a=r.isDark(n,o),u=-1;1>=u;u+=1)if(!(0>n+u||n+u>=t))for(var f=-1;1>=f;f+=1)0>o+f||o+f>=t||(0!=u||0!=f)&&a==r.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(var n=0;t-1>n;n+=1)for(var o=0;t-1>o;o+=1){var c=0;r.isDark(n,o)&&(c+=1),r.isDark(n+1,o)&&(c+=1),r.isDark(n,o+1)&&(c+=1),r.isDark(n+1,o+1)&&(c+=1),(0==c||4==c)&&(e+=3)}for(var n=0;t>n;n+=1)for(var o=0;t-6>o;o+=1)r.isDark(n,o)&&!r.isDark(n,o+1)&&r.isDark(n,o+2)&&r.isDark(n,o+3)&&r.isDark(n,o+4)&&!r.isDark(n,o+5)&&r.isDark(n,o+6)&&(e+=40);for(var o=0;t>o;o+=1)for(var n=0;t-6>n;n+=1)r.isDark(n,o)&&!r.isDark(n+1,o)&&r.isDark(n+2,o)&&r.isDark(n+3,o)&&r.isDark(n+4,o)&&!r.isDark(n+5,o)&&r.isDark(n+6,o)&&(e+=40);for(var s=0,o=0;t>o;o+=1)for(var n=0;t>n;n+=1)r.isDark(n,o)&&(s+=1);var l=Math.abs(100*s/t/t-50)/5;return e+=10*l},f}(),a=function(){for(var r=new Array(256),t=new Array(256),e=0;8>e;e+=1)r[e]=1<<e;for(var e=8;256>e;e+=1)r[e]=r[e-4]^r[e-5]^r[e-6]^r[e-8];for(var e=0;255>e;e+=1)t[r[e]]=e;var n={};return n.glog=function(r){if(1>r)throw new Error("glog("+r+")");return t[r]},n.gexp=function(t){for(;0>t;)t+=255;for(;t>=256;)t-=255;return r[t]},n}(),u=function(){var r=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],t=function(r,t){var e={};return e.totalCount=r,e.dataCount=t,e},e={},o=function(t,e){switch(e){case n.L:return r[4*(t-1)+0];case n.M:return r[4*(t-1)+1];case n.Q:return r[4*(t-1)+2];case n.H:return r[4*(t-1)+3];default:return}};return e.getRSBlocks=function(r,e){var n=o(r,e);if("undefined"==typeof n)throw new Error("bad rs block @ typeNumber:"+r+"/errorCorrectLevel:"+e);for(var i=n.length/3,a=new Array,u=0;i>u;u+=1)for(var f=n[3*u+0],c=n[3*u+1],s=n[3*u+2],l=0;f>l;l+=1)a.push(t(c,s));return a},e}(),f=function(){var r=new Array,t=0,e={};return e.getBuffer=function(){return r},e.getAt=function(t){var e=Math.floor(t/8);return 1==(r[e]>>>7-t%8&1)},e.put=function(r,t){for(var n=0;t>n;n+=1)e.putBit(1==(r>>>t-n-1&1))},e.getLengthInBits=function(){return t},e.putBit=function(e){var n=Math.floor(t/8);r.length<=n&&r.push(0),e&&(r[n]|=128>>>t%8),t+=1},e},c=function(r){var n=e.MODE_8BIT_BYTE,o=t.stringToBytes(r),i={};return i.getMode=function(){return n},i.getLength=function(r){return o.length},i.write=function(r){for(var t=0;t<o.length;t+=1)r.put(o[t],8)},i},s=function(){var r=new Array,t={};return t.writeByte=function(t){r.push(255&t)},t.writeShort=function(r){t.writeByte(r),t.writeByte(r>>>8)},t.writeBytes=function(r,e,n){e=e||0,n=n||r.length;for(var o=0;n>o;o+=1)t.writeByte(r[o+e])},t.writeString=function(r){for(var e=0;e<r.length;e+=1)t.writeByte(r.charCodeAt(e))},t.toByteArray=function(){return r},t.toString=function(){var t="";t+="[";for(var e=0;e<r.length;e+=1)e>0&&(t+=","),t+=r[e];return t+="]"},t},l=function(){var r=0,t=0,e=0,n="",o={},i=function(r){n+=String.fromCharCode(a(63&r))},a=function(r){if(0>r);else{if(26>r)return 65+r;if(52>r)return 97+(r-26);if(62>r)return 48+(r-52);if(62==r)return 43;if(63==r)return 47}throw new Error("n:"+r)};return o.writeByte=function(n){for(r=r<<8|255&n,t+=8,e+=1;t>=6;)i(r>>>t-6),t-=6},o.flush=function(){if(t>0&&(i(r<<6-t),r=0,t=0),e%3!=0)for(var o=3-e%3,a=0;o>a;a+=1)n+="="},o.toString=function(){return n},o},h=function(r){var t=r,e=0,n=0,o=0,i={};i.read=function(){for(;8>o;){if(e>=t.length){if(0==o)return-1;throw new Error("unexpected end of file./"+o)}var r=t.charAt(e);if(e+=1,"="==r)return o=0,-1;r.match(/^\s$/)||(n=n<<6|a(r.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i};var a=function(r){if(r>=65&&90>=r)return r-65;if(r>=97&&122>=r)return r-97+26;if(r>=48&&57>=r)return r-48+52;if(43==r)return 62;if(47==r)return 63;throw new Error("c:"+r)};return i},d=function(r,t){var e=r,n=t,o=new Array(r*t),i={};i.setPixel=function(r,t,n){o[t*e+r]=n},i.write=function(r){r.writeString("GIF87a"),r.writeShort(e),r.writeShort(n),r.writeByte(128),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(0),r.writeByte(255),r.writeByte(255),r.writeByte(255),r.writeString(","),r.writeShort(0),r.writeShort(0),r.writeShort(e),r.writeShort(n),r.writeByte(0);var t=2,o=u(t);r.writeByte(t);for(var i=0;o.length-i>255;)r.writeByte(255),r.writeBytes(o,i,255),i+=255;r.writeByte(o.length-i),r.writeBytes(o,i,o.length-i),r.writeByte(0),r.writeString(";")};var a=function(r){var t=r,e=0,n=0,o={};return o.write=function(r,o){if(r>>>o!=0)throw new Error("length over");for(;e+o>=8;)t.writeByte(255&(r<<e|n)),o-=8-e,r>>>=8-e,n=0,e=0;n|=r<<e,e+=o},o.flush=function(){e>0&&t.writeByte(n)},o},u=function(r){for(var t=1<<r,e=(1<<r)+1,n=r+1,i=f(),u=0;t>u;u+=1)i.add(String.fromCharCode(u));i.add(String.fromCharCode(t)),i.add(String.fromCharCode(e));var c=s(),l=a(c);l.write(t,n);var h=0,d=String.fromCharCode(o[h]);for(h+=1;h<o.length;){var g=String.fromCharCode(o[h]);h+=1,i.contains(d+g)?d+=g:(l.write(i.indexOf(d),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(d+g)),d=g)}return l.write(i.indexOf(d),n),l.write(e,n),l.flush(),c.toByteArray()},f=function(){var r={},t=0,e={};return e.add=function(n){if(e.contains(n))throw new Error("dup key:"+n);r[n]=t,t+=1},e.size=function(){return t},e.indexOf=function(t){return r[t]},e.contains=function(t){return"undefined"!=typeof r[t]},e};return i},g=function(r,t,e,n){for(var o=d(r,t),i=0;t>i;i+=1)for(var a=0;r>a;a+=1)o.setPixel(a,i,e(a,i));var u=s();o.write(u);for(var f=l(),c=u.toByteArray(),h=0;h<c.length;h+=1)f.writeByte(c[h]);f.flush();var g="";return g+="<img",g+=' src="',g+="data:image/gif;base64,",g+=f,g+='"',g+=' width="',g+=r,g+='"',g+=' height="',g+=t,g+='"',n&&(g+=' alt="',g+=n,g+='"'),g+="/>"};return t}();return function(r){"function"==typeof define&&define.amd?define([],r):"object"==typeof exports&&(module.exports=r())}(function(){return r}),!function(r){r.stringToBytes=function(r){function t(r){for(var t=[],e=0;e<r.length;e++){var n=r.charCodeAt(e);128>n?t.push(n):2048>n?t.push(192|n>>6,128|63&n):55296>n||n>=57344?t.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&r.charCodeAt(e)),t.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return t}return t(r)}}(r),r}()),function(r){r.fn.share=function(t){function e(t,e){var n=o(e);"prepend"==e.mode?n.reverse():n,n.length&&r.each(n,function(n,o){var a=i(o,e),u=e.initialized?t.find(".icon-"+o):r('<a class="icon icon-'+o+'"></a>');return!u.length||(u.prop("aria-label","分享到 "+h[o]),u.prop("href",a),"wechat"===o?u.prop("tabindex",-1):u.prop("target","_blank"),void(e.initialized||("prepend"==e.mode?t.prepend(u):t.append(u))))})}function n(r,t){var e=r.find("a.icon-wechat");e.length&&(e.append('<div class="wechat-qrcode"><h4>'+t.wechatQrcodeTitle+'</h4><div class="qrcode"></div><div class="help">'+t.wechatQrcodeHelper+"</div></div>"),e.find(".qrcode").qrcode({render:"image",size:t.wechatQrcodeSize,text:t.url}),e.offset().top<100&&e.find(".wechat-qrcode").addClass("bottom"))}function o(t){0===t.mobileSites.length&&t.sites.length&&(t.mobileSites=t.sites);var e=(u()?t.mobileSites:t.sites.length?t.sites:[]).slice(0),n=t.disabled;return"string"==typeof e&&(e=e.split(/\s*,\s*/)),"string"==typeof n&&(n=n.split(/\s*,\s*/)),a()&&n.push("wechat"),n.length&&r.each(n,function(t,n){var o=r.inArray(n,e);o!==-1&&e.splice(o,1)}),e}function i(r,t){var e=l[r];t.summary=t.description;for(var n in t)if(t.hasOwnProperty(n)){var o=r+n.replace(/^[a-z]/,function(r){return r.toUpperCase()}),i=encodeURIComponent(void 0===t[o]?t[n]:t[o]);e=e.replace(new RegExp("{{"+n.toUpperCase()+"}}","g"),i)}return e}function a(){return/MicroMessenger/i.test(navigator.userAgent)}function u(){return r(window).width()<=768}var f=r(document.head),c={url:location.href,site_url:location.origin,source:f.find("[name=site], [name=Site]").attr("content")||document.title,title:f.find("[name=title], [name=Title]").attr("content")||document.title,description:f.find("[name=description], [name=Description]").attr("content")||"",image:r("img:first").prop("src")||"",imageSelector:void 0,weiboKey:"",wechatQrcodeTitle:"微信扫一扫：分享",wechatQrcodeHelper:"<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>",wechatQrcodeSize:100,mobileSites:[],sites:["weibo","qq","wechat","tencent","douban","qzone","linkedin","diandian","facebook","twitter","google"],disabled:[],initialized:!1},s=r.extend({},c,t),l={qzone:"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{URL}}&title={{TITLE}}&desc={{DESCRIPTION}}&summary={{SUMMARY}}&site={{SOURCE}}",qq:"http://connect.qq.com/widget/shareqq/index.html?url={{URL}}&title={{TITLE}}&source={{SOURCE}}&desc={{DESCRIPTION}}&pics={{IMAGE}}",tencent:"http://share.v.t.qq.com/index.php?c=share&a=index&title={{TITLE}}&url={{URL}}&pic={{IMAGE}}",weibo:"http://service.weibo.com/share/share.php?url={{URL}}&title={{TITLE}}&pic={{IMAGE}}&appkey={{WEIBOKEY}}",wechat:"javascript:;",douban:"http://shuo.douban.com/!service/share?href={{URL}}&name={{TITLE}}&text={{DESCRIPTION}}&image={{IMAGE}}&starid=0&aid=0&style=11",diandian:"http://www.diandian.com/share?lo={{URL}}&ti={{TITLE}}&type=link",linkedin:"http://www.linkedin.com/shareArticle?mini=true&ro=true&title={{TITLE}}&url={{URL}}&summary={{SUMMARY}}&source={{SOURCE}}&armin=armin",facebook:"https://www.facebook.com/sharer/sharer.php?u={{URL}}&title={{TITLE}}&description={{DESCRIPTION}}&caption={{SUBHEAD}}&link={{URL}}&picture={{IMAGE}}",twitter:"https://twitter.com/intent/tweet?text={{TITLE}}&url={{URL}}&via={{SITE_URL}}",google:"https://plus.google.com/share?url={{URL}}"},h={qzone:"QQ空间",qq:"QQ",tencent:"腾讯微博",weibo:"微博",wechat:"微信",douban:"豆瓣",diandian:"点点",linkedin:"LinkedIn",facebook:"Facebook",twitter:"Twitter",google:"Google"};this.each(function(){if(r(this).data("initialized"))return!0;var t=r.extend({},s,r(this).data());t.imageSelector&&(t.image=r(t.imageSelector).map(function(){return r(this).prop("src")}).get().join("||"));var o=r(this).addClass("share-component social-share");e(o,t),n(o,t),r(this).data("initialized",!0)})},r(function(){r(".share-component,.social-share").share()})}(jQuery);
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.8
 *
 */
(function(e){e.fn.extend({slimScroll:function(f){var a=e.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},f);this.each(function(){function v(d){if(r){d=d||window.event;
var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);e(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&n(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}}function n(d,g,e){k=!1;var f=b.outerHeight()-c.outerHeight();g&&(g=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),g=Math.min(Math.max(g,0),f),g=0<d?Math.ceil(g):Math.floor(g),c.css({top:g+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());g=
l*(b[0].scrollHeight-b.outerHeight());e&&(g=d,d=g/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),f),c.css({top:d+"px"}));b.scrollTop(g);b.trigger("slimscrolling",~~g);w();p()}function x(){u=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),30);c.css({height:u+"px"});var a=u==b.outerHeight()?"none":"block";c.css({display:a})}function w(){x();clearTimeout(B);l==~~l?(k=a.allowPageScroll,C!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;C=l;u>=b.outerHeight()?k=!0:(c.stop(!0,
!0).fadeIn("fast"),a.railVisible&&m.stop(!0,!0).fadeIn("fast"))}function p(){a.alwaysVisible||(B=setTimeout(function(){a.disableFadeOut&&r||y||z||(c.fadeOut("slow"),m.fadeOut("slow"))},1E3))}var r,y,z,B,A,u,l,C,k=!1,b=e(this);if(b.parent().hasClass(a.wrapperClass)){var q=b.scrollTop(),c=b.siblings("."+a.barClass),m=b.siblings("."+a.railClass);x();if(e.isPlainObject(f)){if("height"in f&&"auto"==f.height){b.parent().css("height","auto");b.css("height","auto");var h=b.parent().parent().height();b.parent().css("height",
h);b.css("height",h)}else"height"in f&&(h=f.height,b.parent().css("height",h),b.css("height",h));if("scrollTo"in f)q=parseInt(a.scrollTo);else if("scrollBy"in f)q+=parseInt(a.scrollBy);else if("destroy"in f){c.remove();m.remove();b.unwrap();return}n(q,!1,!0)}}else if(!(e.isPlainObject(f)&&"destroy"in f)){a.height="auto"==a.height?b.parent().height():a.height;q=e("<div></div>").addClass(a.wrapperClass).css({position:"relative",overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",
width:a.width,height:a.height});var m=e("<div></div>").addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),c=e("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,
WebkitBorderRadius:a.borderRadius,zIndex:99}),h="right"==a.position?{right:a.distance}:{left:a.distance};m.css(h);c.css(h);b.wrap(q);b.parent().append(c);b.parent().append(m);p();a.railDraggable&&c.bind("mousedown",function(a){var b=e(document);z=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);n(0,c.position().top,!1)});b.bind("mouseup.slimscroll",function(a){z=!1;p();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",
function(a){a.stopPropagation();a.preventDefault();return!1});m.hover(function(){w()},function(){p()});c.hover(function(){y=!0},function(){y=!1});b.hover(function(){r=!0;w();p()},function(){r=!1;p()});b.bind("touchstart",function(a,b){a.originalEvent.touches.length&&(A=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&(n((A-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),A=b.originalEvent.touches[0].pageY)});
x();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),n(0,!0)):"top"!==a.start&&(n(e(a.start).position().top,null,!0),a.alwaysVisible||c.hide());window.addEventListener?(this.addEventListener("DOMMouseScroll",v,!1),this.addEventListener("mousewheel",v,!1)):document.attachEvent("onmousewheel",v)}});return this}});e.fn.extend({slimscroll:e.fn.slimScroll})})(jQuery);
/*! ###########################################################################

 Source: https://github.com/dutchcelt/Keep-in-View

 Copyright (C) 2011 - 2013,  Lunatech Labs B.V., C. Egor Kloos. All rights reserved.
 GNU General Public License, version 3 (GPL-3.0)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see http://www.opensource.org/licenses/gpl-3.0.html

 ########################################################################### */

// Uses AMD or browser globals to create a jQuery plugin.

(function(factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }

}(function($) {

  $.fn.keepInView = function(settings) {

    return this.each(function(index, stickyElem) {

      var $elem;
      var $parent;

      var defaults = {

        // Position will be fixed regardless of scroll position when set to true
        fixed: false,

        // Vertical offset that applies to both top and bottom;
        edgeOffset: 0,

        // Override z-index if you can't or don't want to set this with CSS
        zindex: $(stickyElem).css('zIndex'),

        // Override all scripted positions with your own custom CSS classname
        // The set classname will be triggered when element scrolls out of view
        // The Script will add a suffix of '-top' or '-bottom'
        customClass: false,

        //  Only trigger this script on scrolling out at the 'top', 'bottom' the default is 'both'.
        trigger: 'both',

        // Scrollable box
        scrollable: false,

        //  Set the height and width (user can override these if necessary)
        h: $(stickyElem).height(),
        w: $(stickyElem).width(),

        //  If a pageload scrolls to a hash you can use this to offset anchors if the 'sticky' element is covering the anchored content
        //  Beware that if the anchor itself contains content that it will also move up the page.
        //  This feature is best used with the clone feature below.
        offsetAnchor: false, // boolean.

        //  Clone the sticky element and prepend to its parent.
        //  Beware that the original item is not removed from the page so make sure that the cloned element will cover it.
        //  The cloned item can be styled via the classname "KIV-cloned"
        cloned: false // boolean.

      };

      var options = $.extend({}, defaults, settings);

      if (options.cloned) {
        $parent = $(stickyElem).parents().eq(0);
        $elem = $(stickyElem).clone().prependTo($parent).hide().addClass("KIV-cloned");
        $(stickyElem).addClass("KIV-original")
      } else {
        $elem = $(stickyElem);
      }

      var offset = $(stickyElem).offset(),
        position = $(stickyElem).css('position'),
        leftPosition = $(stickyElem).css('left'),
        marginOffset = (leftPosition === "auto") ? parseInt($(stickyElem).css('marginLeft'), 10) : 0,
        cssObject = (function() {
          return {
            position: 'fixed',
            left: leftPosition - marginOffset + 'px',
            width: (options.scrollable) ? options.w - 15 : options.w,
            height: (options.scrollable) ? ($(window).height() - offset.top) + "px" : options.h,
            zIndex: options.zindex
          }
        })(),
        prepCSS = function(cssSettings) {
          $elem.css($.extend({}, cssObject, cssSettings));
        },
        fixCSS = function(t) {
          $elem.css({ top: t + 'px' });
          if (options.offsetAnchor) {
            $(stickyElem).css({ visibility: "hidden" });
            $elem.slideDown("normal");
          }
        }

      if (options.offsetAnchor) {

        // It is possible that there a lot of anchors!
        // Using an array instead of a loop by 'shifting' the array
        // This speeds up the iterations and setTimeout prevents the browser from locking up.

        // put all the dom elements collected by jQuery in to an array
        var $anchors = $("a[name]");
        var anchorArray = $.makeArray($anchors);

        var arrayShifter = function() {

          var start = +new Date();

          do {

            var anchor = anchorArray.shift();
            //  Invoke lazyLoad method with the current item
            if (anchorArray[0] !== void 0) {
              $(anchor).css({ position: "relative", display: "block", top: "-" + $elem.outerHeight() + "px" });
            }

          } while (anchorArray[0] !== void 0 && (+new Date() - start < 50)); // increase to 100ms if needed.

          if (anchorArray[0] !== void 0) {
            setTimeout(arrayShifter, 0);
          }

        };
        arrayShifter();
      }


      var setElem = function(opts) {

        //  Making sure that $elem doesn't fire if it is taller than the window (like a sidebar)
        //  To prevent elastic scrolling fireing set the body in css to 'overflow: hidden'.
        //  Then wrap your content in a div with 'overflow: auto'.

        if ($elem.height() > $(window).height() && !options.scrollable) {
          return false;
        }

        if (options.clearStyle) {
          $elem.removeAttr("style");
        }
        var scrolledOutAt = "";
        var windowHeight = $(window).height();
        var outerHeight = $elem.outerHeight();
        $parent = $(stickyElem).parents().eq(0);
        if (windowHeight < parseInt(offset.top + outerHeight - Math.abs($(window).scrollTop()) + options.edgeOffset, 10) && !options.fixed) {
          scrolledOutAt = "bottom";
        }

        if (($(window).scrollTop()) > offset.top - options.edgeOffset && !options.fixed) {
          scrolledOutAt = "top";
        }

        // if (!options.customClass) {


        if (options.scrollable) {
          prepCSS({ height: (windowHeight - offset.top) + "px", overflow: "auto" });
        } else {
          prepCSS();

        }

        if (scrolledOutAt === "bottom" && (options.trigger === 'both' || options.trigger === 'bottom')) {
          if (options.scrollable) {
            prepCSS({ height: windowHeight + "px", top: (windowHeight - outerHeight - options.edgeOffset) + "px", overflow: "auto" });
          } else {
            fixCSS((windowHeight - outerHeight - options.edgeOffset));
          }

        } else if (scrolledOutAt === "top" && (options.trigger === 'both' || options.trigger === 'top')) {
          if (options.scrollable) {
            prepCSS({ height: windowHeight + "px", top: options.edgeOffset + "px", overflow: "auto" });
          } else {
            fixCSS(options.edgeOffset);
          }

        } else if (options.fixed) {
          $elem.css({ top: options.edgeOffset, left: offset.left, height: "auto" });
        } else {
          if (options.scrollable) {
            $elem.css({ position: position, top: offset.top + "px", height: (windowHeight - offset.top + $(window).scrollTop()) + "px" });
          } else {
            if (options.offsetAnchor) {
              $(stickyElem).css({ visibility: "visible" });
              $elem.hide();
            } else {
              $elem.removeAttr('style');
            }
          }
        }

        // } else 
        if (options.customClass) {
          // console.log(scrolledOutAt);
          if (options.trigger === 'both') {
            if (scrolledOutAt === "bottom" || scrolledOutAt === "top") {
              $elem.addClass(options.customClass + "-" + scrolledOutAt);
            } else if (!scrolledOutAt) {
              $elem.removeClass(options.customClass + "-top").removeClass(options.customClass + "-bottom");
            }
          } else if (scrolledOutAt === options.trigger) {
            $elem.addClass(options.customClass + "-" + options.trigger);
          } else if (!scrolledOutAt) {
            $elem.removeClass(options.customClass + "-" + options.trigger);
          }
        }

        if (options.parentClass) {
          if (options.trigger === 'both') {
          	var elemClass = options.customClass + "-";
            if ($parent.find('[class*="'+elemClass+'"]')) {
              $parent.addClass(options.parentClass);
            } else {
              $parent.removeClass(options.parentClass);
            }
          } else if (scrolledOutAt === options.trigger) {
          	var elemClass = options.customClass + "-" + options.trigger;
            if ($parent.find('[class*="'+elemClass+'"]')) {
              $parent.addClass(options.parentClass);
            } else {
              $parent.removeClass(options.parentClass);
            }
          } else if (!scrolledOutAt) {
            $parent.removeClass(options.parentClass);
          }
        }
        // end if
      }

      var staySticky = function() {
        options.w = $elem.width();
        options.h = $elem.height();
        offset = $elem.offset();
        options.clearStyle = true;
        requestAnimationFrame(setElem);
      }
      var setElemRequest = function() {
        options.clearStyle = false;
        requestAnimationFrame(setElem);
      }

      var killSticky = function() {
        $elem.removeAttr('style').off(".sticky");
        $(window).off('.sticky', staySticky).off('.sticky', setElemRequest);
      }

      $elem.on('update.sticky', staySticky);
      $elem.on('unstick.sticky', killSticky);
      $(window).on('resize.sticky', $elem, staySticky).on('scroll.sticky', $elem, setElemRequest).trigger('scroll');

    });
  };

}));

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

//# sourceMappingURL=plugin.js.map
