if (!_) {
    var _ = {};
}
if (!_.util)
    _.util = {}

_.util.format_string = function(tpl, map) {
    var s = tpl
    for (var i in map) {
        if (map.hasOwnProperty(i)) {
            var reg = new RegExp("\\{{" + i + "\\}}", "gm")
            s = s.replace(reg, map[i])
        }
    }
    return s
}
_.util.date_to_string = function(d, format, hasTime) {
    if (!format) {
        if (hasTime) {
            format = '{{y}}-{{m}}-{{d}} {{h}}:{{M}}:{{s}}'
        } else {
            format = '{{y}}-{{m}}-{{d}}'
        }
    }
    d = new Date(d)
    var curr_date = d.getDate();
    if (curr_date < 10) {
        curr_date = '0' + curr_date
    }
    var curr_month = d.getMonth() + 1; //Months are zero based
    if (curr_month < 10) {
        curr_month = '0' + curr_month
    }
    var curr_year = d.getFullYear();

    var curr_hour = d.getHours()
    if (curr_hour < 10) {
        curr_hour = '0' + curr_hour
    }
    var curr_Minutes = d.getMinutes()
    if (curr_Minutes < 10) {
        curr_Minutes = '0' + curr_Minutes
    }
    var curr_seconds = d.getSeconds()
    if (curr_seconds < 10) {
        curr_seconds = '0' + curr_seconds
    }

    if (hasTime) {
        return _.util.format_string(format, {
            y: curr_year,
            m: curr_month,
            d: curr_date,
            h: curr_hour,
            M: curr_Minutes,
            s: '00'
        })
    } else {
        return _.util.format_string(format, {
            y: curr_year,
            m: curr_month,
            d: curr_date
        })
    }
}
_.util.query_string = function(key, def) {
    var svalue = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"))
    var ret = svalue ? svalue[1] : svalue
    if (def != null && def != undefined) {
        if (!ret) {
            return def
        }
    }
    return ret
}