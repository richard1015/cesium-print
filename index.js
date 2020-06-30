/*
 * @Description: Custom Printing 自定义打印工具类
 * @Author: richard1015
 * @Date: 2019-01-02 10:03:25
 * @LastEditTime: 2019-05-21 13:47:00
 * @LastEditors: Please set LastEditors
 */
/* eslint-disable */

var $ = require("./jquery.min.js");
window.jQuery = $;
window.$ = $;
require("./jquery.print.js");
require('./jquery.jcanvas.js');
import html2canvas from "html2canvas";
export default {
    //鼠标开始x
    start_x: 0,
    //鼠标开始y
    start_y: 0,
    //最终区域宽
    area_width: 0,
    //最终区域高
    area_height: 0,
    //默认画笔线宽    
    defaultStrokeWidth: 1,
    //默认画笔颜色
    defaultPenColor: "red",
    //进行打印的canvas dom
    printCanvasDom: {},
    //是否打印指北针
    defaultAddCompass:true,
    //绘制打印区域
    drawArea: function (documentId, options) {
        if (typeof documentId === "string") {
            var dom = document.getElementById(documentId);
            if (dom.tagName == "CANVAS") {
                this.printCanvasDom = dom;
                return this.drawRect(options);
            } else {
                throw Error('documentId tag must is Canvas !')
            }
        } else {
            throw Error('documentId must string and is Canvas tag!')
        }
    },
    /**
     * 绘制（选择打印区域）
     * @param {object} options 绘制自定义参数
     * @return {Pormise}  返回选定区域坐标
     */
    drawRect: function (options) {
        var that = this;
        return new Promise((resolve, reject) => {
            try {
                that.penColor = options.penColor || that.defaultPenColor;
                that.penWidth = options.strokeWidth || that.defaultStrokeWidth;
                //创建全屏打印区域
                var canvas = document.createElement('canvas');
                // 网页可见区域宽设置
                canvas.width = document.body.clientWidth
                // 网页可见区域高设置
                canvas.height = document.body.clientHeight
                canvas.style = "position: absolute;left: 0;top: 0;"
                document.body.appendChild(canvas);

                //canvas 的矩形框
                var canvasRect = canvas.getBoundingClientRect();
                //矩形框的左上角坐标
                var canvasLeft = canvasRect.left;
                var canvasTop = canvasRect.top;

                var x = 0;
                var y = 0;

                //鼠标点击按下事件，画图准备
                canvas.onmousedown = function (e) {
                    //添加屏幕缩放比例window.devicePixelRatio
                    that.start_x = e.clientX*window.devicePixelRatio + that.defaultStrokeWidth
                    that.start_y = e.clientY*window.devicePixelRatio + that.defaultStrokeWidth
                    //设置画笔颜色和宽度
                    var color = that.penColor;
                    var penWidth = that.penWidth;

                    x = e.clientX - canvasLeft;
                    y = e.clientY - canvasTop;
                    $(canvas).addLayer({
                        type: 'rectangle',
                        strokeStyle: color,
                        strokeWidth: penWidth,
                        name: 'areaLayer',
                        fromCenter: false,
                        x: x, y: y,
                        width: 1,
                        height: 1
                    });

                    $(canvas).drawLayers();
                    $(canvas).saveCanvas();
                    //鼠标移动事件，画图
                    canvas.onmousemove = function (e) {
                        that.area_width = e.clientX*window.devicePixelRatio - that.start_x - that.defaultStrokeWidth
                        that.area_height = e.clientY*window.devicePixelRatio - that.start_y - that.defaultStrokeWidth
                        var width = e.clientX - canvasLeft - x;
                        var height = e.clientY - canvasTop - y;
                        $(canvas).removeLayer('areaLayer');

                        $(canvas).addLayer({
                            type: 'rectangle',
                            strokeStyle: color,
                            strokeWidth: penWidth,
                            name: 'areaLayer',
                            fromCenter: false,
                            x: x, y: y,
                            width: width,
                            height: height
                        });

                        $(canvas).drawLayers();
                    }
                };
                //鼠标抬起
                canvas.onmouseup = function (e) {

                    var color = that.penColor;
                    var penWidth = that.penWidth;

                    canvas.onmousemove = null;
                    //添加屏幕缩放比例window.devicePixelRatio
                    var width = e.clientX*window.devicePixelRatio - canvasLeft - x;
                    var height = e.clientY*window.devicePixelRatio - canvasTop - y;

                    $(canvas).removeLayer('areaLayer');

                    $(canvas).addLayer({
                        type: 'rectangle',
                        strokeStyle: color,
                        strokeWidth: penWidth,
                        name: 'areaLayer',
                        fromCenter: false,
                        x: x, y: y,
                        width: width,
                        height: height
                    });

                    $(canvas).drawLayers();
                    $(canvas).saveCanvas();
                    $(canvas).removeLayer('areaLayer');
                    //删除画笔区域
                    document.body.removeChild(canvas);

                    resolve(that.printClip());
                }
            } catch (error) {
                reject(error)
            }
        });
    },

    /**
     * 将需要打印的canvas进行裁剪，在drawRect方法我们已经 得到 裁剪坐标
     * @returns {string} clipImgBase64
     */
    printClip() {
        var that = this;
        console.log(`print canvas dom area width : ${that.printCanvasDom.width} height: ${that.printCanvasDom.height}`)
        //创建裁剪canvas
        var clipCanvas = document.createElement('canvas')
        console.log('实际打印区域', that.start_x, that.start_y, that.area_width, that.area_height)
        //设置实际打印区域宽高
        clipCanvas.width = that.area_width
        clipCanvas.height = that.area_height
        //按坐标进行裁剪
        clipCanvas.getContext('2d').drawImage(that.printCanvasDom, that.start_x, that.start_y, that.area_width, that.area_height, 0, 0, that.area_width, that.area_height)
        //实际打印 imgbase64码
        return clipCanvas.toDataURL();
    },
    /**
     * 设置打印参数
     * @param {*} clipImgBase64 
     */
    print(clipImgBase64, options) {
        var that = this;
        //打印dom外壳创建
        var div = document.createElement("div");

        var clipImg = new Image()
        clipImg.src = clipImgBase64;
        // clipImg.style = `width:${that.area_width}px;height:${that.area_height}px;`
        // 宽大于高 > 则把宽度放到100% 进行等比例缩放 ，  高大于宽 > 则把高放到90% （10%预留指北针 和 标题区域） 进行等比例缩放；
        if (that.area_width > that.area_height) {
            clipImg.style = `width: 100%;
                              height:auto;
                              max-width: 100%;
                              max-height: 100%;`;
        } else {
            clipImg.style = `width: auto;
                              height: 90%;
                              max-width: 100%;
                              max-height: 100%;`;
        }
        //添加实际打印图
        div.appendChild(clipImg);
        //获取 cesium-navigation 插件，目的将指北针拼接打印
        //此处获取 指北针dom元素进行 拼接打印
        let isAddCompass =
        options.isAddCompass === undefined || options.isAddCompass === null
          ? that.defaultAddCompass
          : options.isAddCompass;
  
      if (navigationDom.length && isAddCompass) {
            html2canvas(navigationDom[0], {
                scale: 1,
                allowTaint: false,
                logging: true,
                useCORS: true
            }).then(canvas => {
                let img = canvas.toDataURL("image/jpeg")
                img = img.replace('data:image/jpeg;base64,', '')
                let finalImageSrc = 'data:image/jpeg;base64,' + img
                var clipImg1 = new Image()
                clipImg1.src = finalImageSrc;
                clipImg1.style = "position: absolute;right: 0px;top: 0px;width:8%;height:auto;";
                //打印壳子添加指北针图
                div.appendChild(clipImg1);
                that.printCustomSize(div, options);
            });
        } else {
            that.printCustomSize(div, options);
        }
    },
    printCustomSize(div, options) {
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

        //a1横向打印尺寸
        // var a1 = { width: "3034", height: "2101" };
        //a4横向打印尺寸
        var a4 = { width: "978", height: "650" };
        if (typeof options.downLoadEnable !== 'boolean') {
            options.downLoadEnable = true;
        }
        var pageWidth = options.width || a4.width,
            pageHeight = options.height || a4.height,
            title = options.title || 'printTitle',
            downLoadEnable = options.downLoadEnable,
            fontSize = options.fontSize || '28';
        div.style = `width: ${pageWidth}px;
                     height: ${pageHeight}px;
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
                     position: relative;`;
        var h1 = document.createElement('h1')
        h1.innerHTML = title;
        h1.style = `font-size:${fontSize}px;margin:10px 0;text-align:center;width:100%;`;
        div.insertBefore(h1, div.firstChild);

        if (downLoadEnable) {
            this.downLoadFile(div, title, pageWidth, pageHeight);
        } else {
            // 打印文档
            $(div).print({
                globalStyles: false,
                width: pageWidth,
                height: pageHeight,
            });
        }
    },
    downLoadFile(obj, filename, pageWidth, pageHeight) {
        var that = this;
        return new Promise((resolve, reject) => {
            document.body.appendChild(obj);
            html2canvas(obj).then(canvas => {
                //删除画笔区域
                document.body.removeChild(obj);
                var base64Img = canvas.toDataURL("image/png"); //base64数据
                //打印下载后的图片
                var printImgObj = new Image()
                printImgObj.src = base64Img;
                printImgObj.style = `width: ${pageWidth}px;height: ${pageHeight}px;`
                printImgObj.onload = function () {
                    $(this).print({
                        width: pageWidth,
                        height: pageHeight,
                        globalStyles: false,
                    });
                }
                resolve(true)
                //由于base64过长，转blob进行a标签下载
                that.dataURIToBlob(base64Img, function (blob) {
                    var a = document.createElement('a');
                    a.download = filename + '.png';
                    a.innerHTML = 'download';
                    // the string representation of the object URL will be small enough to workaround the browser's limitations
                    a.href = URL.createObjectURL(blob);

                    // you must revoke the object URL, 
                    //   but since we can't know when the download occured, we have to attach it on the click handler..
                    // a.onclick = function () {
                    //     // ..and to wait a frame
                    //     requestAnimationFrame(function () {
                    //         URL.revokeObjectURL(a.href);
                    //     });
                    //     a.removeAttribute('href')
                    // };

                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    a.dispatchEvent(event);
                });



            });
        })

    },
    // 解决base64文件过大时 图片下载失败问题
    // edited from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
    dataURIToBlob(dataURI, callback) {
        var binStr = atob(dataURI.split(',')[1]),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }

        callback(new Blob([arr]));
    }
}