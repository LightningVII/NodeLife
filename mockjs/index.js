var Mock = require('mockjs');
// import Mock from 'mockjs'
Mock.Random.extend({
    constellation: function(data) {
        var constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
        return this.pick(constellations)
    },
    link: function(data) {
        var links = ['jingdian', 'ktv', 'ijingdian', 'ojingdian', 'u']
        return this.pick(links)
    },
    text: function(data) {
        var keys = ['景点', 'ktv', '商场']
        return this.pick(keys)
    },
    colors: function(data) {
        return Mock.Random.image('200x100', Mock.Random.color(), Mock.Random.cword(5))
    }
})

module.exports = Mock