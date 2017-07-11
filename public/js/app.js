(function(mui, app) {
	app.ready = function(callback, subpages, webApp) {

		mui.init({
			preloadLimit: 1,
			statusBarBackground: '#f7f7f7',
			beforeback: function() {
				if(window.plus) {
					var currentWebview = plus.webview.currentWebview()
					console.log(currentWebview.id)
					switch(currentWebview.id) {
						case "recharge":
							var toPage = plus.webview.getWebviewById("prerecord")
							mui.fire(toPage, 'refreshFire', {});

							var packet = plus.webview.getWebviewById("packet");
							mui.fire(packet, 'packetInit', {});
							break;
						case "mailingSuccess":
							var mailingAddress = plus.webview.getWebviewById("mailingAddress");
							mui.fire(mailingAddress, 'mailingAddressInit', {});
							break;
						case "detail.html":
							var list = plus.webview.getWebviewById("list")
							mui.fire(list, 'refreshFire', {});

							var lookForGoods = plus.webview.getWebviewById("lookForGoods")
							mui.fire(lookForGoods, 'refreshFireDetail', {});
							break;
						case "list":
							var lookForGoods = plus.webview.getWebviewById("lookForGoods")
							mui.fire(lookForGoods, 'refreshBidding', {});
							break;
						default:
							console.log("default");
					}
					var view = mui.currentWebview.opener()
				}
				return true
			},
			gestureConfig: {
				tap: true, //默认为true
				doubletap: true, //默认为false
				longtap: true, //默认为false
				swipe: true, //默认为true
				drag: true, //默认为true
				hold: false, //默认为false，不监听
				release: false //默认为false，不监听
			},
			subpages: subpages
		})

		// 显示手机状态栏
		if(window.plus)
			plus.navigator.setFullscreen(false);

		if(window.plus) {
			plus.share.getServices(function(s) {
				app.shares = {};
				for(var i in s) {
					var t = s[i];
					app.shares[t.id] = t;
				}
				console.log(JSON.stringify(app.shares.weixin))
			}, function(e) {
				console.log("获取分享服务列表失败：" + e.message);
			});
		}

		app.back = function() {
			mui.back()
		}
		app.readyCallback = function() {
			window.addEventListener('error', function(event) {
				app.actionRecord(app.getStoredItem("mobile"), "ERROR", JSON.stringify(event));
			});
			//监听推送信息
			if(!app.chromeDebug && !webApp) {
				plus.push.addEventListener("click", function(msg) {
					$("[es-href='lookForGoods']").trigger("click")
				});
				plus.push.addEventListener("receive", function(msg) {
					$("[es-href='lookForGoods']").trigger("click")
				})
			}
			//监听推送信息
			$(".page").removeClass("d-n")

			$(document).on("click", ".modal-overlay-visible", function(e) {
				if($(".actions-modal").length) {
					$.closeModal('.actions-modal');
				}
			})

			app.toH5 = function(str, config, isRemovePage) {
				var time = new Date().getTime();
				var defaultObj = {
					url: app.serverRoot + "/m/f-driver/pages/zh-cn/" + str + ".html?token=" + encodeURIComponent(app.getStoredItem('token')) + "&mobile=" + encodeURIComponent(app.getStoredItem('mobile')) + "&time=" + time,
					id: str,
					style: {
						cachemode: "noCache"
					}
				}
				var winObj = $.extend(defaultObj, config);
				if(winObj.styles) {
					winObj.styles.cachemode = "noCache";
				} else {
					winObj.styles = {
						cachemode: "noCache"
					};
				}
				console.log(JSON.stringify(winObj))
				mui.openWindow(winObj)
			}

			$(document).on("click", "[es-href-outer]", function(e) {
				var isStatistics = $(this).attr("data-record"),
					recordKey = $(this).attr("data-key");
				if($(this).hasClass("disabled")) return false;
				var href = $(this).attr("es-href-outer");
				app.toH5(href);
				if(isStatistics) {
					app.actionRecord(app.getStoredItem("mobile"), recordKey);
				}
			});
			
			$(document).on("click", "[es-href]", function(e) {
				if($(this).hasClass("disabled")) return false;
				var href = $(this).attr("es-href");
				var toPage = plus.webview.getWebviewById(href)

				switch(href) {
					case "find-tab":
						break;
					case "personal":
						app.toH5(href);
						break;
					case "map":
						app.toH5(href);
						break;
					case "packet":
						app.toH5(href);
						break;
					case "task-list":
						app.actionRecord(app.getStoredItem("mobile"), "RENWU");
						app.toH5(href);
						break;
					case "majorNum":
						app.actionRecord(app.getStoredItem("mobile"), "DIANHUA");
						app.toH5(href);
						break;
					case "lookForGoods":
						mui.fire(toPage, 'refreshFire', {});
						app.actionRecord(app.getStoredItem("mobile"), "ZHAOHUO");
						mui.openWindow({
							url: href + '.html',
							id: href
						});
						break;
					case "mailingAddress":
						app.actionRecord(app.getStoredItem("mobile"), "JIDAN");
						app.toH5("deliverToTruck");
						break;
					case "invitation":
						app.actionRecord(app.getStoredItem("mobile"), "INVITE");
						mui.openWindow({
							url: href + '.html',
							id: href
						});
						break;
					case "prerecord":
						app.actionRecord(app.getStoredItem("mobile"), "YULU");
						mui.openWindow({
							url: href + '.html',
							id: href
						});
						break;
					case "home":
						mui.openWindow({
							url: href + '.html',
							id: href
						});
						break;
					case "mine":
						mui.openWindow({
							url: href + '.html',
							id: href
						});
						break;
					default:
						app.actionRecord(app.getStoredItem("mobile"), href.toUpperCase());
						mui.openWindow({
							url: href + '.html',
							id: href
						});
				}
			});

			$(document).on('click', '[popup]', function() {
				if($(this).hasClass("disabled")) return false;
				if($(this).hasClass("swiper-slide"))
					app.actionRecord(app.getStoredItem("mobile"), "BANNER");
				var cls = $(this).data("cls")
				var string = $(this).data("detail").replace(/\n/g, '_@').replace(/\r/g, '_#').replace(/_#_@/g, '<br/>').replace(/_@/g, '<br/>').replace(/\s/g, '&nbsp;');
				var popupHTML =
					'<div class="popup ' + cls + '">' +
					'<header class="bar bar-nav bg-263846"><a class="pull-left icon iconfont icon-close color-white close-popup' + (cls ? "-" + cls : "") + '"></a><h1 class="title close-popup' + (cls ? "-" + cls : "") + '">' + $(this).data("title") + '</h1></header>' +
					'<div class="content-block" style="top: 2rem; overflow-y: overlay;position: absolute;bottom: 0;">' +
					'<p>' + string + '</p>' +
					'</div>' +
					'</div>'
				$.popup(popupHTML);

				if(cls) {
					$(".close-popup-" + cls).on("click", function() {
						$.closeModal('.' + cls);
					})
				}
			});
			//仅用于预录
			$(document).on('click', '.prerecordDetail', function() {
				if($(this).hasClass("disabled")) return false;
				var info = $(this).data("detail")
				info = "" + info
				var string = info.replace(/\n/g, '_@').replace(/\r/g, '_#').replace(/_#_@/g, '<br/>').replace(/_@/g, '<br/>').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br/>');
				var popupHTML =
					'<div class="popup ticket-popup">' +
					'<header class="bar bar-nav bg-263846"><a class="pull-left icon iconfont icon-close bg-263846 close-ticket-popup"></a><h1 class="title close-ticket-popup">EDI信息</h1></header>' +
					'<header class="bar bar-nav" style="top: 2.2rem;"><a data-detail="' + info + '" class="button copyToClip bg-success" style="top: 0;border-radius: 0.2rem;margin: 0.2rem 0;height: 1.8rem;line-height: 1.8rem;" href="javascript:void(0)">复制小票信息</a></header>' +
					'<div class="content-block" style="top: 3.4rem; overflow-y: overlay;position: absolute;bottom: 0;">' +
					// '<p><span class="color-primary">未来司机郑重承诺：</span><br>拍照预录服务以您提供的照片信息为准，<span class="color-primary">拿到小票后请务必核对信息</span>。<br>在进港前发现错误，并联系客服，免费改单；<br>在进港后发现错误，需要自行承担一切后果。<br>过期未来司机不予负责，特此声明。</p>' +
					'<p>' + string + '</p>' +
					'</div>' +
					'</div>'
				$.popup(popupHTML);
			});

			$(document).on('click', '.close-ticket-popup', function() {
				$.closeModal('.ticket-popup');
			})

			$(document).on('click', '.copyToClip', function() {
				if($(this).hasClass("disabled")) return false;
				var info = $(this).data("detail");
				info = "" + info
				var string = info.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n').replace(/\\n/g, '\n');
				if(info) {
					app.copyToClip(string)
				}
			});

			$(document).on('click', '.icon-information', function(e) {
				if($(this).hasClass("disabled")) return false;

				if($(this).attr("tip-title")) {
					swal({
						title: $(this).attr("tip-title"),
						text: $(this).attr("tip-info"),
						type: $(this).attr("tip-type"),
						confirmButtonText: "关闭窗口",
						html: true
					}, function() {});
				}
			})
			mui('.mui-bar-nav').on('tap', '#refreshBtn', function() {
				if(window.app.refresh)
					window.app.refresh()
			})
			mui('.mui-scroll-wrapper').scroll()
				// i18n settings
			window.app.cn = 'zh-cn'
			window.app.en = 'en-us'
			window.app.id = 'id-id';
			if(!window.app.locale) {
				window.app.locale = window.app.en
			}
			window.app.initi18n()
			window.app.webview = window.plus ? plus.webview.currentWebview() : {}
			if(!window.plus) {
				var query = location.search.match(new RegExp("[?&]" + 'param' + "=([^&]*)(&?)", "i"))
				var queryValue = query ? query[1] : query
				if(queryValue) {
					queryValue = JSON.parse(decodeURIComponent(queryValue))
				}
				if(queryValue) {
					for(var q in queryValue) {
						if(!queryValue.hasOwnProperty(q)) {
							continue
						}
						window.app.webview[q] = queryValue[q]
					}
				}
			}
			if(callback)
				callback.apply(window.app, [mui])

		}

		// chrome debug mode not suport plus and plus ready event
		var readyFunction = !window.app.chromeDebug ? mui.plusReady : mui.ready
		if(webApp) readyFunction = mui.ready
		readyFunction(app.readyCallback)
	}
	app.refresh = function(callback) {
		var html = ['<div class="pull-to-refresh-layer">',
			'<div class="preloader"></div>',
			'<div class="pull-to-refresh-arrow"></div>',
			'</div>'
		].join('')
		if($(".pull-to-refresh-layer").length) {
			$(".pull-to-refresh-layer").remove()
		}
		$(document).find('.pull-to-refresh-content').prepend($(html))
		$(document).on('refresh', '.pull-to-refresh-content', function(e) {
			setTimeout(function() {
				if(callback) {
					callback(e)
				}
				$.pullToRefreshDone('.pull-to-refresh-content'); // 加载完毕需要重置
			}, 2000);
		});
	}

	app.updateUrlWgt = "";
	app.updateUrlApk = "";
	app.updateUrlWgtu = "";
	//下载apk安装包
	app.upgrade = function() {
		if(window.plus)
			$.showPreloader(app.i18n.DOWNLOAD_RESOURCE)
		var dtask = plus.downloader.createDownload(app.updateUrlApk, {
			filename: "_downloads/"
		}, function(d, status) {
			if(status == 200) { // 下载成功
				var path = d.filename;
				plus.runtime.install(path);
			} else { //下载失败
				plus.nativeUI.alert(app.i18n.DOWNLOAD_RESOURCE_FAILED, "", "", app.i18n.CONFIRM);
			}
		}).start();
	}

	//下载wgt安装包
	app.downWgt = function() {
		if(window.plus)
			$.showPreloader(app.i18n.SYSTEM_UPDATING)
			// plus.nativeUI.showWaiting(app.i18n.SYSTEM_UPDATING);
		plus.downloader.createDownload(app.updateUrlWgt, {
			filename: "_downloads/"
		}, function(d, status) {
			if(status == 200) {
				app.installWgt(d.filename); // 安装wgt包
			} else {
				app.upgrade();
			}
		}).start();
	}

	app.installWgt = function(path) {
		$.showPreloader(app.i18n.INSTALLING_UPDATE_FILES)
		plus.runtime.install(path, {}, function() {
			plus.runtime.restart();
		}, function(e) {
			app.upgrade();
		});
	}

	app.installWgtu = function(path) {
		$.showPreloader("数据更新中...")
		var dtask = plus.downloader.createDownload(app.updateUrlWgtu, {
			filename: "_downloads/"
		}, function(d, status) {
			if(status == 200) {
				console.log("Download wgtu success: " + d.filename);
				plus.runtime.install(d.filename, {}, function() {
					plus.runtime.restart();
				}, function(e) {
					app.upgrade();
				});
			} else {
				app.upgrade();
				console.log("更新失败: " + status);
			}
		});
		dtask.addEventListener('statechanged', function(d, status) {
		});
		dtask.start();
	}
	
	
	app.checkForUpdates = function(cb) {
		app.ajaxGetJsonP('/version', {}, function(res) {
			var version = res[app.project.version.key];
			var currentV = app.version;
			if(window.plus && (version > currentV)) {
				this.updateUrlWgt = app.serverRoot + "/resource/" + app.project.No + "-" + version + "-" + app.locale + ".wgt";
				this.updateUrlApk = app.serverRoot + "/resource/" + app.project.No + "-" + version + "-" + app.locale + ".apk";
				this.updateUrlWgtu = app.serverRoot + "/resource/" + app.project.No + "-" + version + "-" + app.locale + ".wgtu";
				this.unmask()
				
				$(".modal-overlay").removeClass("modal-overlay-visible")
				if(res[app.project.version.type] == "wgtu") {
					var versionNum = version.split(".").join("")-0
					var currentVNum = currentV.split(".").join("")-0
					if(versionNum - currentVNum >= 2){
						this.downWgt(this.loginInit)
					}else{
						this.installWgtu(this.loginInit)
					}
				} else if(res[app.project.version.type] == "apk") {
					this.upgrade(this.loginInit)
				} else if(res[app.project.version.type] == "wgt") {
					this.downWgt(this.loginInit)
				}
			} else {
				this.unmask()
				$(".modal-overlay").removeClass("modal-overlay-visible")
				if(cb) {
					cb();
				}
			}
		})
	}

	app.mask = function() {
		$(".page").length ? $(".page").append("<div class='nprogress'>") : $("body").append("<div class='nprogress'>");
		NProgress.start();
	}

	app.unmask = function() {
		NProgress.done();
		$(".nprogress").remove();
	}
	app.ajaxGetJsonP = function(reqUrl, data, callback, errorCallback) {
		console.log("ajaxGetJsonP:" + window.app.server + reqUrl);
		data.locale = window.app.locale
		if(window.app.locale == "id-id") {
			data.locale = "en-us"
		}

		$.ajax({
			type: 'GET',
			url: window.app.server + reqUrl,
			context: window.app,
			timeout: 120000,
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			data: data,
			dataType: 'jsonp',
			jsonp: 'callback',
			headers: {
				'X-Requested-By': 'eshipping',
				'Cookie': 'lang=en-us'
			},
			success: function(res) {
				if(res) {
					if(callback)
						callback.apply(window.app, [res])
				} else {
					app.toast(app.i18n.SERVER_BUSY)
				}
			},
			error: function(xhr, type, e) {
				app.unmask()
				console.log(reqUrl + ':' + 'error')
				console.log(e)
				app.toast(app.i18n.NETWORK_ERROR)
				if(errorCallback) {
					errorCallback(xhr, type, e)
				}
			}
		})
	}
	app.ajaxGet = function(reqUrl, data, callback, errorCallback) {
		data.locale = window.app.locale
		if(window.app.locale == "id-id") {
			data.locale = "en-us"
		}
		$.ajax({
			type: 'GET',
			url: window.app.server + reqUrl,
			context: window.app,
			timeout: 20000,
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			data: data,
			dataType: 'json',
			headers: {
				'X-Requested-By': 'eshipping'
			},
			success: function(res) {
				if(res) {
					if(callback)
						callback.apply(window.app, [res])
				} else {
					app.toast(app.i18n.SERVER_BUSY)
				}
			},
			error: function(xhr, type, e) {
				app.unmask()
				console.log(reqUrl + ':' + 'error')
				console.log(e)
				app.toast(app.i18n.NETWORK_ERROR)
				if(errorCallback) {
					errorCallback(xhr, type, e)
				}
			}
		})
	}
	app.actionRecord = function(phone, action, remark) {
		// app.ajaxGetJsonP("/action/record", {
		// 	phone: phone,
		// 	action: action,
		// 	remark: remark
		// });
	}
	app.ajaxGetNeedLogin = function(reqUrl, data, callback, errorCallback) {
		console.log(window.app.server + reqUrl)
		app.ajaxGet(reqUrl, data, function(res) {
			if(res.success) {
				callback.apply(app, [res])
				return
			}
			var autoLoginCallback = function(res) {
				if(res.success) {
					app.ajaxGet(reqUrl, data, callback)
					app.actionRecord(app.getStoredItem("mobile"), "LOGIN");
				} else {
					app.navigate('login.html')
				}
			}
			if(res.message == 'driver_need_login') {
				var token = app.query_string("token") || app.getStoredItem('token')
				var mobile = app.query_string("mobile") || app.getStoredItem('mobile')
					// auto login
				if(token) {
					app.ajaxGet('/auto/login', {
						mobile: mobile,
						imei: app.getImei(),
						token: token
					}, autoLoginCallback)
				} else {
					// app.closeAllWebview()
					app.toast(app.i18n.DRIVER_NEED_LOGIN);
					app.removeStoredItem('token');
					app.removeStoredItem('mobile');
					app.navigate('login.html');
				}
			}
		}, function() {
			if(errorCallback) errorCallback();
		})
	}
	app.ajaxPost = function(reqUrl, data, callback, errorCallback) {
		data.locale = window.app.locale
		if(window.app.locale == "id-id") {
			data.locale = "en-us"
		}
		data = JSON.stringify(data)
		$.ajax({
			type: 'POST',
			data: data,
			processData: false,
			url: window.app.server + reqUrl,
			dataType: 'json',
			headers: {
				'X-Requested-By': 'eshipping'
			},
			context: window.app,
			timeout: 20000,
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			success: function(res) {
				if(res) {
					if(callback)
						callback.apply(window.app, [res])
				} else {
					app.toast(app.i18n.SERVER_BUSY)
				}
			},
			error: function(xhr, type, e) {
				app.unmask()
				console.log(JSON.stringify(xhr))
				console.log(type)
				console.log('error')
				console.log(JSON.stringify(e))
				app.toast(app.i18n.NETWORK_ERROR)
				if(errorCallback) {
					errorCallback(xhr, type, e)
				}
			}
		})
	}
	app.ajaxPostNeedLogin = function(reqUrl, data, callback, errorCallback) {

		app.ajaxPost(reqUrl, data, function(res) {
			if(res.success) {
				callback.apply(app, [res])
				return
			}
			var autoLoginCallback = function(res) {
				if(res.success) {
					app.ajaxPost(reqUrl, data, callback)
					app.actionRecord(app.getStoredItem("mobile"), "LOGIN");
				} else {
					app.navigate('login.html');
				}
			}
			if(res.message == 'driver_need_login') {
				var token = app.query_string("token") || app.getStoredItem('token')
				var mobile = app.query_string("mobile") || app.getStoredItem('mobile')
					// auto login
				if(token) {
					app.ajaxGet('/auto/login', {
						mobile: mobile,
						imei: app.getImei(),
						token: token
					}, autoLoginCallback)
				} else {
					// app.closeAllWebview()
					app.toast(app.i18n.DRIVER_NEED_LOGIN);
					app.removeStoredItem('token');
					app.removeStoredItem('mobile');
					app.navigate('login.html');
				}
			}
		})
	}

	app.confirmDialog = function(config) {
		swal({
				title: config.title,
				text: config.text,
				showCancelButton: true,
				confirmButtonColor: "#fff",
				confirmButtonText: config.confirmButtonText,
				cancelButtonText: config.cancelButtonText,
				closeOnConfirm: true
			},
			function() {
				config.Callbacks()
			});
	}

	app.navigate = function(to, param, config) {
		var cwb = window.plus ? plus.webview.currentWebview() : {};
		if(cwb.id === undefined || to !== cwb.id) {
			var locale = window.app.locale
			var pre = config && config.pre ? config.pre : ''
			var page = to
			if(config && config.unlocale) {
				page = '../' + pre + page
			} else {
				page = '../' + pre + locale + '/' + page
			}
			var reqParam = !window.plus && param ? '?param=' + encodeURIComponent(JSON.stringify(param)) : ''
			if(window.plus) {
				var wb = plus.webview.getWebviewById(to)
				if(wb) {
					// wb.close()
				}
			}
			var newView = mui.openWindow({
				url: page + reqParam,
				id: to,
				styles: {
					top: 0,
					bottom: 0
				},
				extras: param,
				createNew: true,
				show: {
					autoShow: true,
					aniShow: 'slide-in-right',
				},
				waiting: {
					autoShow: false,
					title: '正在加载...',
					options: {}
				}
			})
			return newView
		} else {
			return false
		}
	}
	app.getPosition = function(callback) {
		console.log('start get geo position')
		if(!window.plus) {
			if(callback) {
				callback(true, {
					coords: {
						latitude: 200,
						longitude: 100
					}
				})
			}
			return
		}
		plus.geolocation.getCurrentPosition(function(pos) {
			console.log(JSON.stringify(pos))
			if(callback) {
				callback(true, pos)
			}
		}, function(e) {
			if(callback) {
				callback(false)
			}
		}, {
			geocode: false
		})
	}

	app.LocationManager = function() {
		if(window.plus && plus.os.name == "Android") {
			var context = plus.android.importClass("android.content.Context");
			var locationManager = plus.android.importClass("android.location.LocationManager");
			var main = plus.android.runtimeMainActivity();
			var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
			var gpsProvider = mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER); //检查是否开启了GPS
			if(!gpsProvider) {
				var message = "为了获取您的精准位置，请开启GPS设备。";
				var title = "GPS未启用";
				var alertCB = function() {
					var Intent = plus.android.importClass("android.content.Intent");
					var mIntent = new Intent('android.settings.LOCATION_SOURCE_SETTINGS');
					main.startActivity(mIntent); //打开GPS设置
				}
				plus.nativeUI.alert(message, alertCB, title);
			} else {
				// setInterval("app.getPosition()", 5000);
			}
		}
	}

	app.posWatcher = null
	app.watchPosition = function(callback) {
		if(!window.plus || app.posWatcher) {
			return
		}
		app.posWatcher = plus.geolocation.watchPosition(function(p) {
			console.log("watch pos event")
			callback(true, p)
		}, function(e) {
			console.log("fail watch pos event" + e.message);
			callback(false, p)
		}, {
			geocode: false
		})
	}
	app.stopWatchPosition = function() {
		if(!window.plus || app.posWatcher) {
			console.log("stop watching pos")
			plus.geolocation.clearWatch(app.posWatcher)
			app.posWatcher = null
		}
	}
	app.captureImage = function(callback) {
		if(!window.plus) return
		var cmr = plus.camera.getCamera()
		cmr.captureImage(function(path) {
			plus.gallery.save(path)
			plus.io.resolveLocalFileSystemURL(path, function(entry) {
				var localurl = entry.toLocalURL(); //把拍照的目录路径，变成本地url路径，例如file:///........之类的。
				console.log("img saved")
				callback(localurl)
			});
		}, function(e) {
			console.log("cancel")
		}, {
			filename: "_doc/gallery/",
			index: 1
		})
	}
	app.pickImage = function(callback) {
		if(!window.plus) return
		plus.gallery.pick(function(path) {
			console.log("img picked")
			callback(path)
		}, function(e) {
			console.log(JSON.stringify(e));
			console.log("cancel");
		}, {
			filter: "image"
		})
	}

	app.uploadFiles = function(reqUrl, uploadFile, data, callback, errorCallback) {
		data = data || {}

		var task = plus.uploader.createUpload(window.app.server + reqUrl, {
				method: "POST",
				blocksize: 0,
				priority: 100
			},
			function(t, status) {
				app.unmask()

				if(status == 200) {
					if(!JSON.parse(t.responseText).success) {
						if(app.page) {
							mui.fire(app.page, 'myerror', {
								data: t
							})
						}
						$.hidePreloader();
						swal({
							title: "错误警告",
							text: JSON.parse(t.responseText).message,
							type: "error",
							confirmButtonText: "关闭窗口",
						}, function() {
							$.hidePreloader();
						});
						return false
					}
					console.log("Upload success: " + JSON.stringify(t))
					if(callback)
						callback(t)
				} else {
					console.log("Upload failed: " + status)
					if(errorCallback) errorCallback(status);
				}
			}
		)
		task.addFile(uploadFile, {
			key: 'file'
		})
		task.setRequestHeader('X-Requested-By', 'eshipping')
		for(var k in data) {
			if(data.hasOwnProperty(k)) {
				task.addData('' + k, '' + data[k])
			}
		}
		task.start()
		app.mask()
	}
	app.compressImage = function(path, successCB, errorCB) {
		var date = new Date().getTime();
		var picName = date + "_" + path.substring(path.lastIndexOf('\/') + 1, path.length);
		var imgtemp = new Image(); //创建一个image对象
		imgtemp.src = path;
		imgtemp.onload = function() { //图片加载完成后执行
			realWidth = this.width;
			realHeight = this.height;
			var options = {
				src: path,
				dst: path.substring(0, path.lastIndexOf('\/')) + "/_yht/" + picName
			}
			if(realWidth >= realHeight && realWidth > 1440) {
				options.width = "1440px"
			} else if(realHeight > realWidth && realHeight > 1440) {
				options.height = "1440px"
			} else {
				// app.toast("注意：图片可能略小！")
				successCB({
					target: path
				})
				return false;
			}
			var compressImage = plus.zip.compressImage(options, successCB, errorCB);
		};
	}

	app.setStoredItem = function(key, value) {
		return window.plus ? plus.storage.setItem(key, value) : localStorage.setItem(key, value)
	}
	app.getStoredItem = function(key) {
		return window.plus ? plus.storage.getItem(key) : localStorage.getItem(key)
	}
	app.removeStoredItem = function(key) {
		return window.plus ? plus.storage.removeItem(key) : localStorage.removeItem(key)
	}
	app.toast = function(msg) {
		if(window.plus) {
			plus.nativeUI.toast(msg, {
				duration: "long"
			})
		} else {
			$.toast(msg);
		}
	}
	app.changeLocale = function(locale) {
		app.setStoredItem('locale', locale)
		app.locale = locale
	}
	app.verifyContainerCode = function(strCode) {
		strCode = strCode.toUpperCase()
		var Charcode = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ";
		var regex = /^[A-Z]{4}\d{7}$/;
		if(!regex.test(strCode)) return false;
		var num = 0;
		for(var i = 0; i < 10; i++) {
			var idx = Charcode.indexOf(strCode[i]);
			idx = idx * Math.pow(2, i);
			num += idx;
		}
		num = (num % 11) % 10;
		return parseInt(strCode[10]) == num;
	}
	app.closeOpener = function() {
		if(window.plus && window.plus.currentWebview) {
			var view = window.plus.currentWebview.opener()
			window.plus.webview.close(view)
		}
	}

	app.quitApp = function() {
		var preTime = 0
		mui.back = function() {
			var now = new Date().getTime();
			if(now - preTime > 2000) {
				preTime = now;
				mui.toast(app.i18n.CLICK_EXIT);
			} else {
				if(window.plus) {
					var main = plus.android.runtimeMainActivity();
					main && main.moveTaskToBack(false);
					// plus.runtime.quit();
				}
			}
		}
	}
	app.getImei = function() {
		return window.plus ? plus.device.imei : "";
	}

	app.copyToClip = function(info) {
		if(window.plus && plus.os.name == "Android") {
			var Context = plus.android.importClass("android.content.Context");
			var main = plus.android.runtimeMainActivity();
			var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
			plus.android.invoke(clip, "setText", "" + info);

			app.toast("信息复制成功");
		}
	}

	app.query_string = function(key, def) {
		var svalue = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"))
		var ret = svalue ? svalue[1] : svalue,
			returnValue = decodeURIComponent(ret);
		if(def != null && def != undefined) {
			if(!ret) {
				returnValue = decodeURIComponent(def)
			}
		}
		if(returnValue == "null" || returnValue == "undefined") {
			returnValue = undefined;
		}
		return returnValue;
	}

	app.startSpeaking = function(text, cb) {

		if(window.plus && plus.os.name == "Android") {
			// 会崩溃 请勿使用
			var receiver;
			receiver = plus.android.implements('com.iflytek.cloud.SynthesizerListener', {
				onSpeakBegin: function() {
					console.log("开始阅读");
				},
				onSpeakPaused: function() {
					console.log("暂停播放");
				},
				onSpeakResumed: function() {
					console.log("继续播放");
				},
				onBufferProgress: function(percent, beginPos, endPos, info) {
					console.log("合成进度");
				},
				onSpeakProgress: function(percent, beginPos, endPos) {
					console.log("播放进度");
				},
				onCompleted: function(error) {
					//                  if (cb) {
					//                      cb()
					//                  }
					console.log("播放完毕");
				}
			});

			var main = plus.android.runtimeMainActivity();
			var SpeechUtility = plus.android.importClass('com.iflytek.cloud.SpeechUtility');
			SpeechUtility.createUtility(main, "appid=io.dcloud.H5D7DD228");
			var SynthesizerPlayer = plus.android.importClass('com.iflytek.cloud.SpeechSynthesizer');
			var play = SynthesizerPlayer.createSynthesizer(main, null);
			play.startSpeaking(text, null);
		}
	}
	app.correctDate = function(date, type) {
		var date = date.replace(/-/g, "/"),
			newDate = new Date(date),
			m = newDate.getMonth() + 1,
			d = newDate.getDate(),
			h = newDate.getHours(),
			w = newDate.getDay();
		var week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
		var value = m + "月" + d + "号" + h + "点";
		if(type == "ready") {
			value = m + "月" + d + "日(" + week[w] + ")/" + h + "点";
		}
		if(type == "isNotHour") {
			value = m + "月" + d + "号";
		}
		return value;
	}
	app.callphone = function(number, dom) {
		var arr = number.split(",")
		var newArr = [];
		var str = "";
		var call = function(value) {
			if(window.plus) {
				plus.device.dial(value + "", true);
			} else {
				$('<a href="tel:' + value + '">').click()
			}
		}
		arr.forEach(function(item, index) {
			if(item.trim()) {
				newArr.push(item.trim())
				str += '<div class="card-header" style="justify-content: center;">' + item + '</div>'
			}
		})
		if(!newArr.length) {
			app.toast("暂无可拨打的手机号")
			return false;
		} else if(newArr.length == 1) {
			call(newArr[0])
			return false;
		}

		$(".phoneModal").remove()
		$(".page-group .page").append(
			'<div class="phoneModal modal-overlay modal-overlay-visible" style="opacity: 1;"></div>' +
			'<div class="phoneModal card" style="z-index: 10600; top: 50%; transform: translateY(-50%);">' +
			str +
			'</div>'
		)
        mui(".phoneModal").on("tap", ".card-header", function() {
			console.log($(this).text())
			call($(this).text())
		})
		$(".phoneModal.modal-overlay").on("click", function() {
			$(".phoneModal").remove()
		})
	}
    app.appConfirm = function(conf) {
        var config = conf || {},
            popupTitle = config.popupTitle || "未来司机",
            submitBtnName = config.submitBtnName || "确定",
            cancelBtnName = config.cancelBtnName || "取消",
            submitBtnClass = config.submitBtnClass || "",
            cancelBtnClass = config.cancelBtnClass || "",
            isDisplaySubmit = config.isDisplaySubmit,
            isDisplayCancel = config.isDisplayCancel,
            confirmContent = config.confirmContent || "",
            isCloseIcon = config.isCloseIcon,
            request = config.request || {},
            popupHtml = "<div class='popup-app js-app-popup' style='visibility:hidden;'>" +
            "{{#if isCloseIcon}}<i class='js-popup-cancel iconfont icon-close popup-icon-close'></i>{{/if}}"+
            "<div class='popup-app-title'>{{popupTitle}}</div>" +
            "<div class='popup-app-content'>{{{confirmContent}}}</div>" +
            "<div class='popup-app-operation'>" +
            "<a class='popup-btn js-popup-cancel cancel {{cancelBtnClass}}' style='display: {{isDisplayCancel}};'>{{cancelBtnName}}</a>" +
            "<a class='popup-btn js-popup-submit {{submitBtnClass}}' style='display: {{isDisplaySubmit}};'>{{submitBtnName}}</a>" +
            "</div>" +
            "</div>" +
            "<div class='popup-mask js-popup-mask'  style='visibility:hidden;'></div>",
            popupTemplate = Handlebars.compile(popupHtml),
            data = {
                popupTitle: popupTitle,
                confirmContent: confirmContent,
                submitBtnClass: submitBtnClass,
                cancelBtnClass: cancelBtnClass,
                isDisplaySubmit: isDisplaySubmit ? "inline-block" : "none",
                isDisplayCancel: isDisplayCancel ? "inline-block" : "none",
                submitBtnName: submitBtnName,
                cancelBtnName: cancelBtnName,
                isCloseIcon: isCloseIcon
            };
        $("body").append(popupTemplate(data));
        if (config.beforeMethod) config.beforeMethod();
        var setStyle = function(){
            var popupHeight = $(".js-app-popup").height(),
            clientHeight = document.body.clientHeight,
            top = (clientHeight - popupHeight) / 2;
            if (top < 0) {
                top = 0;
            }
            $(".js-app-popup").css({
                "top": top,
                "visibility": "visible"
            });
             $(".js-popup-mask").css({
                "visibility": "visible"
            });
        }
        if(config.isLoadinig){
            setTimeout(setStyle,500);
        }else{
            setStyle();
        }
        $(".js-popup-cancel").unbind().bind("click", function() {
            $(".js-popup-mask").remove();
            $(".js-app-popup").remove();
        });

		$(".js-popup-submit").unbind().bind("click", function() {
            var url = request.url || "",
                type = request.type || "POST",
                requestData = config.requestData ? config.requestData() : {};
            if (config.validate && config.validate()) {
                $.showIndicator();
                $(".js-popup-mask").remove();
                $(".js-app-popup").remove();
                if (type == "POST") {
                    app.ajaxPost(url, requestData, function(res) {
                        $.hideIndicator();
                        if (config.callback) config.callback(res);
                    }, function() {
                        $.hideIndicator();
                        if (config.errorCallback) config.errorCallback();
                    })
                } else if (type == "GET") {
                    app.ajaxGet(url, requestData, function(res) {
                        $.hideIndicator();
                        if (config.callback) config.callback(res);
                    }, function() {
                        $.hideIndicator();
                        if (config.errorCallback) config.errorCallback();
                    })
                }
            }
        });
    };	
	app.selectedPlateNumber = function(conf) {
		var config = conf || {},
			el = config.el || "",
			title = config.title || "请输入车牌号码",
			submitBtnName = config.submitBtnName || "确定",
			cancelBtnName = config.cancelBtnName || "取消",
			submitBtnClass = config.submitBtnClass || "",
			cancelBtnClass = config.cancelBtnClass || "",
			isDisplaySubmit = config.isDisplaySubmit || true,
			isDisplayCancel = config.isDisplayCancel || true,
			componentConfig = {
				province: ["鲁", "豫", "沪", "皖", "京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "苏", "浙", "闽", "赣", "鄂", "湘", "粤", "桂", "琼", "俞", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新"],
				provinceAk: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
				Codeword: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "挂"]
			},
			htmlTemplate = "<div class='popup-app js-app-popup plate'>" +
			"<div class='popup-app-title'>{{title}}</div>" +
			"<input type='hidden' class='js-plate-value'/>" +
			"<div class='input-plate js-input-plate'>" +
			"{{#each value}}" +
			"<span class='{{#if isActive}}active{{/if}}'>{{name}}</span>" +
			"{{/each}}" +
			"</div>" +
			"<div class='js-selected-box selected-box'></div>" +
			"<div class='popup-app-operation'>" +
			"<a class='popup-btn plate js-popup-cancel cancel {{cancelBtnClass}}' style='display: {{isDisplayCancel}};'>{{cancelBtnName}}</a>" +
			"<a class='popup-btn plate js-popup-submit {{submitBtnClass}}' style='display: {{isDisplaySubmit}};'>{{submitBtnName}}</a>" +
			"</div>" +
			"</div>" +
			"<div class='popup-mask js-popup-mask mask-plate'></div>",
			selectedContent = "{{#each data}}<span data-value='{{../type}}'>{{this}}</span>{{/each}}<i class='iconfont icon-huishan js-back-delete back-delete'></i>",
			defaultTemplate = Handlebars.compile(htmlTemplate),
			selectedTemplate = Handlebars.compile(selectedContent),
			data = {
				title: title,
				submitBtnClass: submitBtnClass,
				cancelBtnClass: cancelBtnClass,
				isDisplaySubmit: isDisplaySubmit ? "inline-block" : "none",
				isDisplayCancel: isDisplayCancel ? "inline-block" : "none",
				submitBtnName: submitBtnName,
				cancelBtnName: cancelBtnName,
				value: [{
					name: "",
					isActive: true
				}, {
					name: ""
				}, {
					name: ""
				}, {
					name: ""
				}, {
					name: ""
				}, {
					name: ""
				}, {
					name: ""
				}]
			},
			domEl = $("#" + el).length > 0 ? $("#" + el) : $("." + el);

		if(el == "") {
			return;
		}

		var show = function() {
			var value = domEl.val().toString().trim(),
				selectedData = componentConfig.Codeword,
				type = "CODE",
				reviewData = $.extend({}, data);
			if(value.length != 7) {
				selectedData = componentConfig.province;
				type = "PROVINCE";
			} else {
				var backValue = [];
				$.each(value.split(""), function(_, v) {
					var name = v,
						isActive = false;
					if(_ + 1 == value.length) {
						isActive = true;
					}
					backValue.push({
						name: name,
						isActive: isActive
					})
				});
				reviewData.value = backValue;
			}
			$(".js-app-popup").hide();
			$("body").append(defaultTemplate(reviewData));
			if(config.beforeMethod) config.beforeMethod();
			$(".js-plate-value").val(value.split("").join(","));
			$(".js-selected-box").html(selectedTemplate({
				data: selectedData,
				type: type
			}));
			var resizeTop = function() {
				var popupHeight = $(".js-app-popup.plate").height(),
					popupWidth = $(".js-app-popup.plate").width(),
					clientHeight = document.body.clientHeight,
					top = (clientHeight - popupHeight) / 2,
					left = popupWidth / 2;
				if(top < 0) {
					top = 0;
				}
				$(".js-app-popup.plate").css({
					"top": top,
					"marginLeft": -left
				});
			};
			resizeTop();
			//事件绑定
			$(".js-popup-cancel.plate").unbind("click").bind("click", function() {
				$(".js-app-popup.plate").remove();
				$(".js-popup-mask.mask-plate").remove();
				$(".js-app-popup").show();
			});

			$(".js-popup-submit.plate").unbind("click").bind("click", function() {
				var lengthIndex = $(".js-input-plate span").length,
					activeIndex = $(".js-input-plate span.active").index(),
					activeHtml = $(".js-input-plate span").eq(lengthIndex - 1).html();
				if(activeIndex + 1 != $(".js-input-plate span").length || activeHtml == "") {
					$.each($(".js-input-plate span"), function(_, v) {
						if($(v).html() == "") {
							$(v).addClass("error");
						}
					});
					return;
				}
				$(".js-app-popup").show();
				var setValue = $(".js-plate-value").val();
				domEl.val(setValue.split(",").join("").trim()).change();
				$(".js-app-popup.plate").remove();
				$(".js-popup-mask.mask-plate").remove();
			});

			$(".js-selected-box").delegate("span", "click", function() {
				var type = $(this).data("value"),
					value = $(this).html().toString().trim(),
					inputLength = $(".js-input-plate span").length,
					activeIndex = $(".js-input-plate span.active").index(),
					plate = $(".js-plate-value").val();
				if(activeIndex < 0) {
					return;
				}
				$(".js-input-plate span.active").removeClass("error");
				if(type == "PROVINCE") {
					$(".js-input-plate span.active").html(value);
					$(".js-plate-value").val(plate + value + ",");
					if(plate != "") {
						$(".js-plate-value").val(value + ",");
					}
					$(".js-input-plate span").eq(activeIndex).removeClass("active");
					$(".js-input-plate span").eq(activeIndex + 1).addClass("active");
					$(".js-selected-box").html(selectedTemplate({
						data: componentConfig.provinceAk,
						type: "PROVINCE_AK"
					}));
					resizeTop();
					return;
				} else if(type == "PROVINCE_AK") {
					$(".js-input-plate span.active").html(value);
					$(".js-plate-value").val(plate + value + ",");
					$(".js-input-plate span").eq(activeIndex).removeClass("active");
					$(".js-input-plate span").eq(activeIndex + 1).addClass("active");
					$(".js-selected-box").html(selectedTemplate({
						data: componentConfig.Codeword,
						type: "CODE"
					}));
					resizeTop();
					return;
				}

				$(".js-input-plate span.active").html(value);
				if(inputLength == activeIndex + 1 && plate.split(",").length < 7) {
					$(".js-plate-value").val(plate + value);
				} else if(plate.split(",").length == 7 && inputLength == activeIndex + 1) {
					plate = plate.split(",");
					plate[6] = value;
					$(".js-plate-value").val(plate.join());
				}
				if(inputLength == activeIndex + 1) {
					return;
				}
				$(".js-plate-value").val(plate + value + ",");
				$(".js-input-plate span").eq(activeIndex).removeClass("active");
				$(".js-input-plate span").eq(activeIndex + 1).addClass("active");
				resizeTop();
			});
			$(".js-selected-box").delegate("i.js-back-delete", "click", function() {
				var activeEl = $(".js-input-plate span.active"),
					activeIndex = activeEl.index(),
					plate = $(".js-plate-value").val();
				if(plate.substr(plate.length - 1) == ",") {
					plate = plate.substr(0, plate.lastIndexOf(","));
				}
				plate = plate.split(",");
				plate.length -= 1;
				$(".js-plate-value").val(plate.join(",") + ",");
				if(activeEl.html() == "") {
					$(".js-input-plate span").eq(activeIndex).removeClass("active");
					$(".js-input-plate span").eq(activeIndex - 1).addClass("active").html("");
				} else {
					activeEl.html("");
				}

				if(activeIndex == 1) {
					$(".js-selected-box").html(selectedTemplate({
						data: componentConfig.province,
						type: "PROVINCE"
					}));
					resizeTop();
					$(".js-back-delete").hide();
				} else if(activeIndex == 2) {
					$(".js-selected-box").html(selectedTemplate({
						data: componentConfig.provinceAk,
						type: "PROVINCE_AK"
					}));
					resizeTop();
				}
			});
			//事件绑定
		};
		domEl.unbind("click").bind("click", function() {
			show();
		});
	};
}(mui, window.app = {
    locale: "zh-cn",
    version: "1.1.1.3",
    appIdentify: "futureIdentify",
    project: {
        No: "eshipping",
        version: {
            key: "version",
            type: "upgradeType",
        }
    },
    chromeDebug: true,
    serverRoot: "http://localhost:3000",
    server: "http://localhost:3000/ws-truck-app/app"
}))