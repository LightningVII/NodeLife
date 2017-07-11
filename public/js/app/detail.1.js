window.app.ready(function(mui) {
    console.log('ready detail')
    this.init = function() {
        $.init();
        this.query()
        this.addEvents()
        if (window.app.refresh) {
            window.app.refresh(function() {
                console.log(123)
                app.query();
            });
        }
        //多个标签页下的无限滚动
    }
    this.OPT_PK = 'PK'
    this.OPT_GR = 'GR'
    this.GATE_TYPE_SCAN = 'QR'
    this.GATE_TYPE_RECEIPT = 'RECEIPT'
    this.DETAIL_TITLE = ''
    this.CONSTS_NODE_IN = app.i18n.TRACKING_NODE_IN
    this.CONSTS_NODE_OUT = app.i18n.TRACKING_NODE_OUT
    this.TRACKING_NODE_CONSTANTS = app.i18n.TRACKING_NODE_CONSTANTS
    this.customBack = mui.back
    this.hideInputForm = function() {
        $('#detail-main').removeClass("d-n")
        $('#detail-container').addClass("d-n")
        $('.title span').eq(1).addClass("d-n")
        $('.title span').eq(0).removeClass("d-n")
        $('#footer').show()
    }
    this.addEvents = function() {
        $('#footer').on('tap', '#requestBtn', function() {
            if ($(this).hasClass('btn-disabled')) {
                return
            }
            app.mask()
            app.nextStep = $(this).data('value')
            var positionCallback = function(success, pos) {
                if (!success) {
                    app.toast(app.i18n.LOCATE_ERROR);
                }
                app.ajaxPostNeedLogin('/add/container_track2', {
                    containerId: app.ids,
                    statusId: app.nextStep,
                    longitude: pos ? pos.coords.longitude : null,
                    latitude: pos ? pos.coords.latitude : null,
                    ignore: false
                }, function(res) {
                    console.log(JSON.stringify(res))
                    app.unmask();
                    if (!app.checkMessage(res)) {} else {
                        app.query()
                        app.setStoredItem('status-refresh-time-' + app.ids, (new Date()).toJSON())
                    }
                });
            }

            $(this).removeClass("bg-primary").addClass('btn-disabled bg-gray')
            app.getPosition(positionCallback)

        })
        $('#detail-container').on('tap', '#closeBtn', this.hideInputForm)
        $('#detail-container').on('tap', '#saveBtn', function() {
            $(".item-content").removeClass('error')
            var result = app.validateContainer($('#ctnNo'))
            result = app.validateTareweight($('#tareWeight')) && result
            var sizeList = [{
                contaienrNo: $('#ctnNo').val().trim(),
                tareWeight: $('#tareWeight').val().trim(),
                sealNO: $('#sealNo').val().trim()
            }]
            if (!result) {
                return
            }
            app.mask()

            app.ajaxPostNeedLogin('/update/ctn_info', {
                containerId: app.ids,
                containsizes: sizeList,
                imgPaths: []
            }, function(res) {
                console.log(JSON.stringify(res))
                app.unmask()
                app.hideInputForm()
                app.query()
            })
        })
        $("#detail-main").on("tap", ".openDetail", function() {
            var ele = $(this).closest(".itemContent").find(".media");
            if (ele.find(".d-n").length) {
                ele.find(".d-n").addClass("d-b").removeClass("d-n");
                $(this).html("收起详情")
            } else {
                ele.find(".d-b").addClass("d-n").removeClass("d-b")
                $(this).html("展开详情")
            }
        })
        $('#detail-main').on('tap', '.mailingAddress', function(e) {
            mui.openWindow({
                url: "combox.html",
                id: "combox",
                extras: {
                    mailingId: $(this).attr("data-mailingId"),
                    containerId: $(this).attr("data-containerId")
                }
            })
        })
        $('#detail-main').on('tap', '#captureBtn', function(e) {
            var bts = [{
                title: app.i18n.PLS_INPUT_CTN_NO
            }, {
                title: app.i18n.CAPTURE_NEW_PHOTO
            }, {
                title: app.i18n.SELECT_FROM_GALLERY
            }]

            var popoverCallback = function(e) {
                var index = e.index
                switch (index) {
                    case 1:
                        $('#detail-main').addClass("d-n")
                        $('#detail-container').removeClass("d-n")
                        $('.title span').eq(1).removeClass("d-n")
                        $('.title span').eq(0).addClass("d-n")
                        $('#footer').hide()
                        break
                    case 2:
                        var captureCallback = function(path) {
                            console.log(path)
                            app.mask();
                            app.compressImage(path, function(e) {
                                console.log("new image url：" + e.target);
                                console.log(app.i18n.COMPRESS_IMAGE_SUCCESS);
                                console.log(app.currentIds);
                                app.uploadFiles('/upload/image_v2', e.target, {
                                    ctnid: app.currentIds,
                                    id: app.currentIds ? app.currentIds : ''
                                }, function() {
                                    if (window.app.query)
                                        window.app.query();
                                })
                            }, function(e) {
                                app.unmask();
                                console.log(app.i18n.COMPRESS_IMAGE_ERROR);
                                mui.toast(app.i18n.COMPRESS_IMAGE_ERROR);
                            })
                        }
                        app.captureImage(captureCallback)
                        break
                    case 3:
                        var pickImageCallback = function(path) {
                            console.log(path);
                            app.mask();
                            app.compressImage(path, function(e) {
                                console.log("new image url：" + e.target);
                                console.log(app.i18n.COMPRESS_IMAGE_SUCCESS);
                                app.uploadFiles('/upload/image_v2', e.target, {
                                    ctnid: app.currentIds,
                                    id: app.currentIds ? app.currentIds : ''
                                }, function() {
                                    if (window.app.query)
                                        window.app.query();
                                })
                            }, function(e) {
                                app.unmask();
                                console.log(app.i18n.COMPRESS_IMAGE_ERROR);
                                mui.toast(app.i18n.COMPRESS_IMAGE_ERROR);
                            })
                        }
                        app.pickImage(pickImageCallback)
                        break
                    default:
                        break
                }
            }

            var containerPopoverCallback = function(e) {
                var index = e.index
                app.currentIds = app.res.containers[index - 1]["id"];

                plus.nativeUI.actionSheet({
                    cancel: app.i18n.CANCEL,
                    buttons: bts
                }, popoverCallback)
            }
            if (app.res.containers.length > 1) {
                var containerPopover = []

                $.each(app.res.containers, function(name, value) {
                    containerPopover.push({
                        title: value.contaienrNo ? value.contaienrNo : app.i18n.CTN + (name - 0 + 1)
                    })
                });

                plus.nativeUI.actionSheet({
                    title: app.i18n.PLS_SELECT_CTN,
                    cancel: app.i18n.CANCEL,
                    buttons: containerPopover
                }, containerPopoverCallback)
            } else {
                console.log(app.ids)
                app.currentIds = app.ids;
                console.log(app.currentIds)
                plus.nativeUI.actionSheet({
                    cancel: app.i18n.CANCEL,
                    buttons: bts
                }, popoverCallback)
            }

            e.preventDefault()
            return false
        })
    }

    this.validateContainer = function(dom) {
        if (!app.verifyContainerCode(dom.val().trim())) {
            dom.closest(".item-content").addClass('error')
            app.toast(app.i18n.CONTAINER_NO_ERROR)
            return false
        }
        return true
    }
    this.validateTareweight = function(dom) {
        if ((!_.isNumber(+dom.val().trim()) && dom.val().trim() !== "") || _.isNaN(+dom.val().trim())) {
            dom.closest(".item-content").addClass('error')
            app.toast(app.i18n.TAREWEIGHT_ERROR)
            return false
        }
        return true
    }
    this.refreshRequestBtnStatus = function() {
        var reqTime = app.getStoredItem('status-refresh-time-' + app.ids)
        if (reqTime != null && new Date() - new Date(reqTime) < 60000) {
            return true
        } else {
            app.removeStoredItem('status-refresh-time-' + app.ids)
            return false
        }
    }
    this.refreshRequestBtnTimer = function() {
        setTimeout(function() {
            var disabled = app.refreshRequestBtnStatus()
            if (!disabled) {
                $('#requestBtn').removeClass('btn-disabled')
            } else {
                app.refreshRequestBtnTimer()
            }
        }, 500)
    }
    this.query = function() {
        app.unmask()
        app.mask()
        app.ajaxGetNeedLogin('/order/info', {
            containerIds: this.ids
        }, this.queryCallback)
    }
    this.checkMessage = function(res) {
        if (res.message == 'container_status_change') {
            plus.nativeUI.alert(app.i18n[res.message.toUpperCase()], function() {
                app.query()
            }, "", app.i18n.CONFIRM);

            return false
        } else if (res.message == 'change_driver' || res.message == 'cancle_truck') {
            plus.nativeUI.alert(app.i18n['change_driver'.toUpperCase()], function() {
                app.customBack()
            }, "", app.i18n.CONFIRM);
            return false
        }
        return true
    }
    this.queryCallback = function(res) {
        console.log(JSON.stringify(res));

        app.unmask()
        if (!app.checkMessage(res)) {
            return
        }

        // reset display state
        $('#footer').html('')
        $("#timeLine").remove()
        $(".list-block.mt0").remove()
        $('#detail-container').html('')
        $('#detail-main').removeClass("d-n")
        $('#detail-container').addClass("d-n")

        $('#footer').show()
        res.isOut = res.truckOrderType == "DOOR_CY"
        if (res.nextNode && (res.orderStatus != "ORDER_TERMINATION")) {
            res.incompleted = true
        }

        var truckOrderType = res.isOut ? 0 : 1;
        app.DETAIL_TITLE = res.incompleted ? this.TRACKING_NODE_CONSTANTS[res.nextNode][truckOrderType] : app.i18n.COMPLETED
        res.containers = res.containers || []
        var hasAppointNumber = false
        for (var i = 0; i < res.containers.length; i++) {
            res.containers[i].index = i + 1
            for (var t = 0; t < res.containers[i].ctnImgPaths.length; t++) {
                res.containers[i].ctnImgPaths[t] = window.app.server + '/image/ctnnum?path=' + res.containers[i].ctnImgPaths[t]
                console.log(res.containers[i].ctnImgPaths[t])
            }
            if (res.containers[i].appointNum) {
                hasAppointNumber = true
            }
        }
        // display gate option
        res.displayGateAction = res.supportAutoGate && hasAppointNumber &&
            (res.nextNode == 'CONTAINER_TRACKING_PICKED_UP' || res.nextNode == 'CONTAINER_TRACKING_COMPLETE')

        res.requestBtnDisplay = res.isOut ? app.CONSTS_NODE_OUT[res.nextNode] : app.CONSTS_NODE_IN[res.nextNode]
        res.disableBtn = this.refreshRequestBtnStatus()
        var detailTemplate = $("#detail-template").html()
        var detailTemplateCompiled = _.template(detailTemplate, {
            'imports': { 'timeago': timeago }
        });
        var detailTemplateCompiledHtml = detailTemplateCompiled({
            data: res
        });
        $('#detail-main').append(detailTemplateCompiledHtml);

        var btnWrapTemplate = $("#btn-wrap-template").html()
        var btnWrapTemplateCompiled = _.template(btnWrapTemplate);
        var btnWrapTemplateCompiledHtml = btnWrapTemplateCompiled({
            data: res
        });
        $('#footer').html(btnWrapTemplateCompiledHtml)

        this.refreshRequestBtnTimer()
        if (res.isOut) {
            var containerInputTemplate = $("#container-input-template").html()
            var containerInputTemplateCompiled = _.template(containerInputTemplate);
            var containerInputTemplateCompiledHtml = containerInputTemplateCompiled({
                data: res.containers[0]
            });
            $('#detail-container').append(containerInputTemplateCompiledHtml)
            $("#isOut").text(app.i18n.RETURN_TERMINAL + "：");
            mui.back = function() {
                var visible = $('#detail-container').css('display')
                var visiblePop = $('.popup').css('display')
                if (visible === 'block') {
                    app.hideInputForm()
                } else if (visiblePop === 'block') {
                    $.closeModal('.popup');
                } else {
                    app.customBack();
                }
            };
        } else {
            $("#isOut").text(app.i18n.PICK_UP_TERMINAL + "：");
        }
        this.res = res

        $("#imgThumb ul .image-close").on('tap', function(e) {
            var sizeList = [{
                contaienrNo: $('#ctnNo').val().trim(),
                tareWeight: $('#tareWeight').val().trim(),
                sealNO: $('#sealNo').val().trim()
            }]
            var data = {
                containerId: app.ids,
                containsizes: sizeList,
                imgPaths: []
            }

            var imgPaths = $(this).prev().attr("src");
            imgPaths = imgPaths.substring(imgPaths.indexOf("path=") + 5, imgPaths.length)
            data.imgPaths.push(imgPaths);
            app.ajaxPostNeedLogin('/update/ctn_info', data, function(res) {
                $(e.target).parent().parent().remove();
                app.unmask()
                app.query()
            })
        })

        // update padding bottom
        $('#detail-main').css('padding-bottom', $('.btn-wrap').height())
        $("#imgThumb").css('width', $("body").width());
        // gate upload logic
        if (app.gateResult &&
            (res.pickupGateType == app.GATE_TYPE_SCAN || res.returnGateType == app.GATE_TYPE_SCAN)) {
            console.log(app.gateResult)
            var result = eval('(' + app.gateResult + ')')
            if (!result || !result.name) {
                app.toast(app.i18n.WRONG_QR)
                return
            }
            app.mask()
            var req = app.gateType == app.OPT_PK ? '/enter/gate' : '/out/gate'
            app.ajaxGetNeedLogin(req, {
                containerIds: app.gateContainerId,
                operationType: app.gateType,
                gateId: result.name
            }, function() {
                app.toast(app.i18n.SUBMIT_SUCCESS)
                app.unmask()
            })
        }

        mui.previewImage();
    }
    this.ids = this.webview.containerIds
        // this.webview.containerIds
    this.currentIds = null;
    this.scanObj = null

    this.gateContainerId = this.webview.gateContainerId
    this.gateType = this.webview.gateType
    this.gateResult = this.webview.gateResult

    this.init()

    window.addEventListener('refreshFire', function(event) {
        app.init()
    });
    if (window.plus)
        plus.navigator.closeSplashscreen();
})