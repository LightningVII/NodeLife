window.app.ready(function(mui) {
    if (app.webview.toList) {
        $('[href="#tab_3"]').trigger("click");
    }

    this.uploadImageUrl == ""
    this.customBack = mui.back

    mui.back = function() {
        console.log("qwerqwerqwe")
        var visible = $('.popup').css('display')
        if (visible === 'block') {
            app.interval = setInterval("app.page.reload(true)", 60000);
            $.closeModal('.popup');
            app.page.show();
        } else if ($('.showSweetAlert').length) {
            $(".sweet-overlay").remove()
            $('.showSweetAlert').remove()
        } else if ($('.actions-modal.modal-in').length) {
            $.closeModal('.actions-modal.modal-in')
        } else {
            app.customBack();
        }
    };
    this.init = function() {
        app.page = mui.preload({
            url: app.serverRoot + "/m/f-driver/pages/zh-cn/prerecord.html?token=" + encodeURIComponent(app.getStoredItem('token')) + "&mobile=" + encodeURIComponent(app.getStoredItem('mobile')),
            id: "prerecord-main",
            styles: {
                top: 0, //新页面顶部位置
                bottom: 0,
                cachemode: "noCache"
            }
        });
        app.page.onloaded = function() {
            app.page.show()
        };
    }

    app.compressImageFn = function(path) {
        app.compressImage(path, function(e) {
            app.uploadImageUrl = e.target;
            $("#uploadPic").find("div").hide()
            $("#uploadPic").css('background-image', 'url(' + e.target + ')')
            $("#submitBtn").addClass("bg-primary").removeClass("bg-gray")
            app.submitBtnClick()
        }, function() {
            app.actionRecord(app.getStoredItem("mobile"), "ERROR", "compressImage:安卓常规压缩bug");
            app.uploadImageUrl = path;
            app.submitBtnClick()
            app.toast("图片异常")
        })
    }

    var imgLoadCallback = function(path) {
        mui.fire(app.page, 'showPreloader')
        app.compressImageFn(path)
            //      var bitmap = new plus.nativeObj.Bitmap();
            //      lrz(path)
            //          .then(function(rst) {
            //          	
            //              bitmap.loadBase64Data(rst.base64, function(e) {
            //                  console.log('加载Base64图片数据成功：' + JSON.stringify(e));
            //              }, function() {
            //                  app.actionRecord("ERROR", "loadBase64Data", "loadBase64Data");
            //                  console.log('加载Base64图片数据失败：' + JSON.stringify(e));
            //              });
            //              var date = new Date().getTime();
            //              console.log(JSON.stringify(bitmap))
            //              bitmap.save('_yht/'+date+'.jpg', {}, function(e) {
            //                  console.log("保存成功" + e.target);
            //                  app.uploadImageUrl = e.target;
            //                  $("#uploadPic").find("div").hide()
            //                  $("#uploadPic").css('background-image', 'url(' + e.target + ')')
            //                  $("#submitBtn").addClass("bg-primary").removeClass("bg-gray")
            //                  app.submitBtnClick()
            //                  bitmap.clear()
            //              }, function(e) {
            //                  console.log('保存失败' + JSON.stringify(e));
            //                  app.actionRecord("ERROR", "bitmapSave", "保存图片失败");
            //                  app.compressImageFn(path)
            //              });
            //          })
            //          .catch(function(err) {
            //              console.log(err)
            //              app.actionRecord("ERROR", "compressImage", "lrz压缩失败");
            //              app.compressImageFn(path)
            //          })
            //          .always(function() {
            //              console.log(path)
            //          });
    }

    this.submitPrerecord = function() {
        var self = this;
        if (!app.uploadImageUrl) {
            return false;
        }
        console.log(app.uploadImageUrl)

        this.uploadFiles('/upload/image_load', app.uploadImageUrl, {
            appIdentify: app.appIdentify
        }, function(res) {
            console.log(JSON.stringify(res))
            mui.fire(app.page, 'uploadFilesCB', res)
        })
    }
    this.queryRestAmount = function(cb) {
        app.ajaxGetNeedLogin('/payment/restAmount', {}, function(res) {
            console.log('/payment/restAmount' + JSON.stringify(res))
            if (res.success) {
                var restTimes = JSON.parse(res.obj.value).restTimes;
                var cost = JSON.parse(res.obj.value).cost;
                app.cost = cost;
                $(".balanceVal").html(restTimes)
                $(".prerocordCost").html("费用: " + cost + " 元/次");
                if (cb) {
                    if (JSON.parse(res.obj.value).spendAmount < JSON.parse(res.obj.value).cost)
                        cb(false)
                    else
                        cb(true)
                }
            }
        })
    }

    this.submitBtnClick = function() {
        if (app.uploadImageUrl == "") {
            return false;
        } else {
            app.submitPrerecord();
        }
    }

    this.init()

    window.addEventListener('refreshFire', function(event) {
        mui.fire(app.page, 'refreshFireMoney')
    });

    window.addEventListener('pickImage', function(event) {
        app.pickImage(imgLoadCallback)
    });

    window.addEventListener('captureImage', function(event) {
        app.captureImage(imgLoadCallback)
    });

    window.addEventListener('closePageFn', function(event) {
        console.log("closePageFn")
        if (plus.webview.getWebviewById("prerecord-main")) {
            plus.webview.getWebviewById("prerecord-main").close()
        }
        if (plus.webview.getWebviewById("prerecord")) {
            plus.webview.getWebviewById("prerecord").close()
        }
    });

    window.addEventListener('toRecharge', function(event) {
        console.log("toRecharge")
        var href = "recharge"
        mui.openWindow({ url: href + '.html', id: href });
    });

    window.addEventListener('toHisList', function(event) {
        console.log("toHisList")
        var href = "prerecord-list"
        app.toH5(href)
    });


})