window.app.ready(function(mui) {
	console.log('ready index');

	app.mask()
	var callbacks = [];
	var receiver;
	var filter;
	var main;
	var isInit = false;
	var isRegistered = false;
	var isOlderVersion = false;

	/**
	 * 初始化
	 */
	var init = function(callback) {
		//仅支持Android版本
		if(window.plus && plus.os.name !== 'Android') {
			return;
		}
		try {
			var version = plus.runtime.innerVersion.split('.');
			isOlderVersion = parseInt(version[version.length - 1]) < 22298;
			main = plus.android.runtimeMainActivity();
			var Intent = plus.android.importClass('android.content.Intent');
			var IntentFilter = plus.android.importClass('android.content.IntentFilter');
			var SmsMessage = plus.android.importClass('android.telephony.SmsMessage');
			var receiverClass = 'io.dcloud.feature.internal.reflect.BroadcastReceiver';
			if(isOlderVersion) {
				receiverClass = 'io.dcloud.feature.internal.a.a';
			}
			filter = new IntentFilter();
			var onReceiveCallback = function(context, intent) {
				try {
					var action = intent.getAction();
					if(action == "android.provider.Telephony.SMS_RECEIVED") {
						var pdus = intent.getSerializableExtra("pdus");
						var msgs = [];
						for(var i = 0, len = pdus.length; i < len; i++) {
							msgs.push(SmsMessage.createFromPdu(pdus[i]));
						}
						for(var i = 0, len = callbacks.length; i < len; i++) {
							callbacks[i](msgs);
						}
					}
				} catch(e) {}
			}
			receiver = plus.android.implements(receiverClass, {
				a: onReceiveCallback,
				onReceive: onReceiveCallback
			});
			filter.addAction("android.provider.Telephony.SMS_RECEIVED");
			callback && callback();
		} catch(e) {}
	}

	//注册短信监听
	var register = function(callback) {
		callbacks.push(callback);
		if(!isInit) {
			isInit = isRegistered = true;
			init(function() {
				setTimeout(function() {
					try {
						if(isOlderVersion) {
							main.a(receiver, filter);
						} else {
							main.registerReceiver(receiver, filter); //注册监听
						}
					} catch(e) {}
				}, 300);
			});
		} else if(!isRegistered) {
			//      console.log('registerReceiver');
			try {
				if(isOlderVersion) {
					main.a(receiver, filter);
				} else {
					main.registerReceiver(receiver, filter); //注册监听
				}
			} catch(e) {}
		}
	};
	//注销监听，在登录成功或从登录页跳转到其它页面后调用
	var unregister = function(callback, remove) {
		for(var i = 0, len = callbacks.length; i < len; i++) {
			if(callbacks[i] === callback) {
				callbacks.splice(i, 1);
			}
		}
		if(remove && !callbacks.length) {
			if(main && isRegistered) {
				try {
					if(isOlderVersion) {
						main.a(receiver);
					} else {
						main.unregisterReceiver(receiver);
					}
				} catch(e) {}
				isRegistered = false;
				//          console.log('unregisterReceiver');
			}
		}
	};

	//验证码匹配规则，需要根据实际站点匹配
	var codeRegex = /[0-9]{4}/g;

	var handleSMS = function(msgs) {
		console.log(JSON.stringify(msgs))
		for(var i = 0, len = msgs.length; i < len; i++) {
			var content = msgs[i].getDisplayMessageBody();
			//匹配短信内容，若短信内容包含“拖车通”，则认为初步匹配成功
			if(~content.indexOf('拖车通') || ~content.indexOf('一海通') || ~content.indexOf('未来司机')) {
				//匹配验证码规则，比如包含4位数字
				var matches = content.match(codeRegex);
				if(matches && matches.length) {
					var code = matches[0];
					//验证码输入框控件，需根据实际页面修改选择器
					console.log(code)
					var codeElem = document.querySelector('#phoneCode');
					if(codeElem) {
						codeElem.value = code;
						//TODO 这里可以取消短信监听
						//模拟表单提交，需根据实际页面修改选择器
						plus.nativeUI.toast('自动获取短信验证码成功');
					}
					break;
				}
			}
		}
	};

	//登录页面注册短信监听事件
	register(handleSMS);

	this.codeClick = function() {
		if($('#codeBtn').hasClass('btn-disabled')) {
			return
		}
		console.log('click code')
		$('#account').closest(".item-content").css("background-color", "initial")
		if(($('#account').val().trim() == '' || !new RegExp(/^1[3|4|5|7|8][0-9]\d{8}$/).test($('#account').val().trim())) && $('#account').val().trim() != "22936500951") {
			$('#account').closest(".item-content").css("background-color", "mistyrose")
			return
		}
		app.mask()
		$('#codeBtn').addClass('btn-disabled')
		$('#codeBtn span').html('(30)').attr('data-num', 30)
		app.ajaxGet('/send_phone_code', {
			mobile: $('#account').val().trim(),
			appIdentify: app.appIdentify
		}, app.codeCallback)
	}
	this.refreshCodeTimer = function() {
		setTimeout(function() {
			var time = (+$('#codeBtn span').attr('data-num')) - 1
			$('#codeBtn span').html('(' + time + ')').attr('data-num', time)
			if(time <= 0) {
				$('#codeBtn').removeClass('btn-disabled')
				$('#codeBtn span').html('').attr('data-num', 0)
			} else {
				app.refreshCodeTimer()
			}
		}, 1000)
	}

	this.codeCallback = function(res) {
		app.unmask()
		if(!res.success) {

			if(app.locale == "zh-cn") {
				app.toast("用户名或验证码错误")
			} else {
				app.toast(app.i18n[res.message.toUpperCase()])
			}
		} else {
			app.refreshCodeTimer()
			app.toast(app.i18n.INPUT_LOGIN_CODE)
		}
	}

	this.validateInput = function(dom) {
		if(dom.length == 0) {
			return true
		}
		dom.closest(".item-content").css("background-color", "initial")
		if(dom.val().trim() == '') {
			dom.closest(".item-content").css("background-color", "mistyrose")
			return false
		}
		return true
	}
	this.getValueInput = function(dom) {
		if(dom.length == 0) {
			return undefined
		}
		return dom.val().trim()
	}
	this.loginClick = function() {
		var result = app.validateInput($('#account'))
		result = result && app.validateInput($('#password'))
		result = result && app.validateInput($('#phoneCode'))
		if(app.validateInput($('#account')) && !app.validateInput($('#phoneCode'))) {
			app.codeClick();
			return;
		}
		if(!result) {
			return
		}
		app.mask()
		var reqUrl = (app.locale == app.en || app.locale == app.id) ? '/login_pwd' : '/login'
		app.ajaxPost(reqUrl, {
			mobile: app.getValueInput($('#account')),
			pwd: app.getValueInput($('#password')),
			code: app.getValueInput($('#phoneCode')),
			imei: app.getImei(),
			autoLogin: true
		}, app.loginCallback)
	}
	this.loginCallback = function(res) {
		console.log(JSON.stringify(res))
		app.unmask();
		app.setStoredItem('isShowFindOrder', "Y");
		if(!res.success) {
			var msg = app.i18n[res.message.toUpperCase()]
			if(!msg) {
				msg = res.message
			}
			app.toast(msg)
			app.removeStoredItem('token')
			app.removeStoredItem('mobile')
			app.removeStoredItem('name')

			if(window.plus) {
				plus.navigator.closeSplashscreen();
			}

			$.init();
		} else {
			app.actionRecord(app.getStoredItem("mobile"), "LOGIN");
			app.setStoredItem('token', res.driver.token)
			app.setStoredItem('mobile', res.driver.mobile)
			app.setStoredItem('name', res.driver.name || "")

			if(window.plus) {
				_.forEach(plus.webview.all(), function(item, i) {
					if(item.id != plus.runtime.appid && item.id != "login.html" && item.id != "lookForGoods" && item.id != "home" && item.id != "mine" && item.id != "find-tab") {
						console.log(JSON.stringify(item))
						item.close()
					}
				})
			}
			if(window.plus) {
				var toPage = plus.webview.getWebviewById(plus.runtime.appid)
				mui.fire(toPage, 'refreshFire', {});
			}
			if(!res.driver.pushClientId) {
				var setClientId = function() {
					var info = plus.push.getClientInfo(),
						clientId = info.clientid;
					if(clientId && clientId != "" && clientId != "null") {
						app.ajaxGet('/bindDriverClientId', {
							pushClientId: clientId,
							driverId: res.driver.id
						}, function(res) {
							if(res.success) {
								console.log("保存clientId成功");
							}
						})
					} else {
						setTimeout(setClientId, 3000);
					}

				}
				setTimeout(setClientId, 3000);
			}

			mui.openWindow({
				url: 'index.html',
				id: plus.runtime.appid,
				show: {
					aniShow: 'fade-in',
					duration: 200
				},
				waiting: {
					autoShow: false
				}
			});
		}
	}
	this.loginInit = function() {
		this.unmask()
		$('#loginBtn').on('click', this.loginClick)
		$('#codeBtn').on('click', this.codeClick)

		var token = app.getStoredItem('token')
		var mobile = app.getStoredItem('mobile')
		if(token) {
			app.ajaxGet('/auto/login', {
				mobile: mobile,
				token: token
			}, app.loginCallback)
		} else {
			$.init();
		}
	}
	this.quitApp();

	this.loginInit()
})