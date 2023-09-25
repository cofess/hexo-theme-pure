// Copyright © 2016 TangDongxin

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

var fs = require("hexo-fs");
var pathFn = require("path");
var Hexo = require("hexo");
var log = require("hexo-log")({
  debug: false,
  silent: false
});

hexo.extend.filter.register("after_generate", function(post) {
  var libPath = pathFn.join(pathFn.join(hexo.public_dir, "js"), "tagcloud")

  var tagcanvasPubPath = pathFn.join(
    pathFn.join(hexo.public_dir, "js/tagcloud"),
    "tagcanvas.js"
  );
  var tagcloudPubPath = pathFn.join(
    pathFn.join(hexo.public_dir, "js/tagcloud"),
    "tagcloud.js"
  );

  log.info("---- START COPYING TAG CLOUD FILES ----");
  fs.copyFile(pathFn.join(libPath, "tagcanvas.js"), tagcanvasPubPath);

  var textFont = "Helvetica";
  var textColor = "#333";
  var textHeight = "15";
  var outlineColor = "#E2E1C1";
  var maxSpeed = "0.03";
  var pauseOnSelected = true;

  if (theme.tag_cloud) {
    if (theme.tag_cloud.textColor) {
      textColor = theme.tag_cloud.textColor;
    }
    if (theme.tag_cloud.textFont) {
      textFont = theme.tag_cloud.textFont;
    }
    if (theme.tag_cloud.textHeight) {
      textHeight = theme.tag_cloud.textHeight;
    }
    if (theme.tag_cloud.outlineColor) {
      outlineColor = theme.tag_cloud.outlineColor;
    }
    if (theme.tag_cloud.maxSpeed) {
      maxSpeed = theme.tag_cloud.maxSpeed;
    }
    if (theme.tag_cloud.pauseOnSelected != undefined) {
      pauseOnSelected = theme.tag_cloud.pauseOnSelected;
    }
  }

  var tagCloudJsContent =
    " function addLoadEvent(func) {\n" +
    "     var oldonload = window.onload;\n" +
    "     if (typeof window.onload != 'function') {\n" +
    "         window.onload = func;\n" +
    "     } else {\n" +
    "         window.onload = function() {\n" +
    "             oldonload();\n" +
    "             func();\n" +
    "         }\n" +
    "     }\n" +
    " }\n" +
    "\n" +
    " addLoadEvent(function() {\n" +
    "     console.log('tag cloud plugin rock and roll!');\n" +
    "\n" +
    "     try {\n" +
    "         TagCanvas.textFont = '${textFont}';\n" +
    "         TagCanvas.textColour = '${textColor}';\n" +
    "         TagCanvas.textHeight = ${textHeight};\n" +
    "         TagCanvas.outlineColour = '${outlineColor}';\n" +
    "         TagCanvas.maxSpeed = ${maxSpeed};\n" +
    "         TagCanvas.freezeActive = ${pauseOnSelected};\n" +
    "         TagCanvas.outlineMethod = 'block';\n" +
    "         TagCanvas.minBrightness = 0.2;\n" +
    "         TagCanvas.depth = 0.92;\n" +
    "         TagCanvas.pulsateTo = 0.6;\n" +
    "         TagCanvas.initial = [0.1,-0.1];\n" +
    "         TagCanvas.decel = 0.98;\n" +
    "         TagCanvas.reverse = true;\n" +
    "         TagCanvas.hideTags = false;\n" +
    "         TagCanvas.shadow = '#ccf';\n" +
    "         TagCanvas.shadowBlur = 3;\n" +
    "         TagCanvas.weight = false;\n" +
    "         TagCanvas.imageScale = null;\n" +
    "         TagCanvas.fadeIn = 1000;\n" +
    "         TagCanvas.clickToFront = 600;\n" +
    "         TagCanvas.lock = false;\n" +
    "         TagCanvas.Start('resCanvas');\n" +
    "         TagCanvas.tc['resCanvas'].Wheel(true)\n" +
    "     } catch(e) {\n" +
    "         console.log(e);\n" +
    "         document.getElementById('myCanvasContainer').style.display = 'none';\n" +
    "     }\n" +
    " });\n";

  tagCloudJsContent = tagCloudJsContent.replace("${textFont}", textFont);
  tagCloudJsContent = tagCloudJsContent.replace("${textColor}", textColor);
  tagCloudJsContent = tagCloudJsContent.replace("${textHeight}", textHeight);
  tagCloudJsContent = tagCloudJsContent.replace("${outlineColor}", outlineColor);
  tagCloudJsContent = tagCloudJsContent.replace("${maxSpeed}", maxSpeed);
  tagCloudJsContent = tagCloudJsContent.replace("${pauseOnSelected}", pauseOnSelected);

  fs.writeFile(tagcloudPubPath, tagCloudJsContent);
  log.info("---- END COPYING TAG CLOUD FILES ----");
});