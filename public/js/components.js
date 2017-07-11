Vue.component('my-nav', {
    props: ['active', 'ishidebadgeprop', 'biddingnumprop'],
    template: '<nav class="bar bar-tab" id="footer" @click="getNav">' +
        '<a v-for="nav in navTabs" @click="toNavPage(nav.href)" v-if="nav.enabled" class="tab-item external" :name="nav.href" :class="{\'tab-active color-primary\':nav.href == activeTab}">' +
       '<span class="badge"  :class="{\'hide\':ishidebadgeprop}" v-text="biddingnumprop" v-if="nav.isShowBadge">asdfas</span>' +
       '<span class="iconfont" :class="nav.icon"></span>' +
        '<span class="tab-label" v-text="nav.text"></span>' +
        '</a>' +
        '</nav>',
    data: function() {
        return {
            navTabs:[],
            activeTab: ""
        }
    },
    mounted: function(){
    	var self = this
    	this.activeTab = this.active
        this.getNav()
    },
    methods: {
		toNavPage: function(e){
			if(window.plus){
				plus.webview.show(e);
				this.activeTab = e
				app.actionRecord(app.getStoredItem("mobile"), e.toUpperCase());
				mui.fire(plus.webview.getWebviewById(e), 'refreshFire')
			}
		},
		getNav: function(){
			var self = this
			if(this.navTabs.length){
				return false
			}
			app.ajaxGetNeedLogin('/nav/config', {}, function(res) {
			    self.navTabs = res.navTabs
			})
		}
    }
})