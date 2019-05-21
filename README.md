
# cesium-print Plugin
Cesium 动态打印插件
cesium-print is a plugin for cesium printing 

## Usage

Include it in your code after importing npm, like:

```
	npm install cesium-print -dev
```

Use it like:

```js
   import CesiumPrint from "cesium-print";
```

```js
      
	  viewer = new Cesium.Viewer("cesiumContainer", {
        contextOptions: {
          id: "cesiumCanvas",//must
          webgl: {
            preserveDrawingBuffer: true
          }
        }
      }
      
      //打印cesium canvas dom
      CesiumPrint.drawArea("cesiumCanvas", {
        penColor: "yellow", //画笔颜色
        strokeWidth: 1 //单位 px
      })
        .then(base64url => {
          //base64url is images
          //print drawArea dom
          CesiumPrint.print(base64url);
        })
        .catch(error => {
          console.error(error);
        });
```
	
You can submit the options object like:
```js
	//打印cesium canvas dom
      CesiumPrint.drawArea("cesiumCanvas", {
        penColor: "yellow", //画笔颜色
        strokeWidth: 1 //单位 px
      })
        .then(base64url => {
          //自定义打印（设置纸张大小，打印标题）
          //     高       宽
          // A0：1189mm * 841mm
          // A1：841mm * 594mm
          // A2：594mm * 420mm
          // A3：420mm * 297mm
          // A4：297mm * 210mm
          //  页边距： 0.75 inch
          // A1: 23.39x33.11 inch
          // 打印机DPI：300DPI
          // 屏幕DPI  : 96DPI
          // width　=　(23.39 - 0.75 * 2) * 96  = 2101 px
          // height =  (33.11 - 0.75 * 2)* 96  = 3034 px
          // A4: 8.27x11.69 inch
          // 打印机DPI：300DPI
          // 屏幕DPI  : 96DPI
          // width　=　(8.27 - 0.75 * 2) * 96  = 650 px
          // height =  (11.69 - 0.75 * 2)* 96  = 978 px
          // 所以，当<table> 的width=650px, height=978px时，用IE 打印时，刚好能打印一页的A4纸．
          // //a1横向打印尺寸
          // var a1 = { width: "3034", height: "2101" };
          // //a4横向打印尺寸
          var a4 = { width: "978", height: "650" };
            let printOptions = {
              title: "打印标题(print title)",
              width: a4.width,
              height: a4.height,
              fontSize: "30",
              downLoadEnable: true //是否下载打印文件
            };
            CesiumPrint.print(base64url, printOptions);
          });
        })
        .catch(error => {
          console.error(error);
        });
```

Currently this plugin supports the following options:

#### penColor

 - Default: `red`  
 - Acceptable-Values: color string  
 - Function Desc: pen Color 

#### strokeWidth

 - Default: `1`  
 - Acceptable-Values: number  
 - Function: stroke width ( unit px )

#### width

 - Default: `978`
 - Acceptable-Values: number
 - Function: print width ( unit px )

#### height

 - Default: `650`, creates a hidden iframe if no-vaild iframe selector is passed
 - Acceptable-Values: number
 - Function: print width ( unit px )

#### fontSize

 - Default: `32`
 - Acceptable-Values: number
 - Function: print title font size ( unit px )

#### downLoadEnable

 - Default: `true`
 - Acceptable-Values: Boolean
 - Function: down load print file enable 


#### title

 - Default: `print`, uses the host page title
 - Acceptable-Values: Any single-line string
 - Function: To change the printed title



### Browsers
* Google Chrome - v ...
* Firefox - v ...

## License
....

## Demo
[cesium plugin /demo](https://richard1015.github.io/cesium/)
# Code Demo
[https://github.com/richard1015/cesium-vue-example /(cesium-print,cesium-navigation-es6)](https://github.com/richard1015/cesium-vue-example/blob/master/src/components/CesiumViewer.vue)

## Other Cesium Plugin 
[cesium-navigation-es6 /github](https://github.com/richard1015/cesium-navigation-es6)

---------------------------------------
Like our [work](https://github.com/richard1015)? [Get in touch 51844712@qq.com!](mailto:51844712@qq.com)
