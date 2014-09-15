define(['relationship'], function (relationship) {
    /**
    * 转换数据模型
    */
    function convert(data1, mapping, originData1) {
        var originData1 = originData1 || data1;
        var data2 = {};
        if (typeof (mapping) == 'object') {
            for (var k in mapping) {
                var v = mapping[k];
                if (typeof (v) == 'object') {
                    data2[k] = convert(data1[k], v, originData1);
                } else if (typeof (v) == 'function') {
                    data2[k] = v.apply(data2, [originData1, k, data1]);
                } else if (typeof (v) == 'string') {
                    if (v.length > 1 && v.substring(0, 1) == '&') {
                        var v1 = v.substring(1);
                        var v2;
                        try {
                            var a = v1.split('.');
                            var exp = '';
                            for (var i = 0; i < a.length; i++) {
                                exp += '[\'';
                                exp += a[i];
                                exp += '\']';
                            }
                            v2 = eval((originData1 ? 'originData1' : 'data1') + exp);
                        } catch (e) {
                        }
                        data2[k] = v2;
                    } else {
                        data2[k] = v;
                    }
                } else {
                    data2[k] = v;
                }
            }
        } else if (typeof (mapping) == 'function') {
            data2 = mapping.apply(data2, [originData1, k, data1]);
        }
        return data2;
    }
    /**
    * 根据URL映射关系转换
    */
    function translate(url, data) {
        var mm;
        for (var exp in relationship) {
            if (new RegExp(exp).test(url)) {
                mm = relationship[exp];
                break;
            }
        }
        if (mm) {
            return convert(data, mm);
        }
        return data;
    }
    return {
        convert: convert,
        translate: translate
    }
})
