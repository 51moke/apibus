'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Register = exports.EmitterPromise = exports.res = exports.use = undefined;

var _EmitterPromise = require('./util/EmitterPromise');

var _EmitterPromise2 = _interopRequireDefault(_EmitterPromise);

var _Interceptor = require('./util/Interceptor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by laomao on 2018/3/25.
 */
exports.use = _Interceptor.use;
exports.res = _Interceptor.res;
exports.EmitterPromise = _EmitterPromise2.default;

var apiData = {};
//总出口response
_Interceptor.response.output(function (formData, data) {
    //console.log('response总出口:', JSON.stringify({formData, data}))

});
//总出口restful
_Interceptor.restful.output(function (formData, data) {
    //console.log('restful总出口:', JSON.stringify({formData, data}))
});

/**
 * 注册api
 * @param obj
 */
/*export const Register = (obj)=> {
 //console.log('注册', obj);
 for (let i in obj) {
 let apiSerice = obj[i];
 let type = typeof apiSerice;
 if (type == 'function') {
 apiData[i] = (...a)=> {
 return Promise.resolve(apiSerice(...a));
 }
 } else if (type == 'object') {
 //console.log('对象', apiSerice);
 apiData[i] = apiSerice
 }


 }
 }*/

//注册
var Register = exports.Register = function Register(apiModuleName) {
    //console.log('!!!!', arg);
    return function (c) {
        var _service = function _service() {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var ServiceClass = new (Function.prototype.bind.apply(c, [null].concat(args)))();
            //console.log('创建的类', ServiceClass);
            var serviceFuns = Object.getOwnPropertyNames(Object.getPrototypeOf(ServiceClass));

            //类属性

            var _loop = function _loop(i) {
                var attr = ServiceClass[i];
                if (typeof attr != 'function') {
                    //console.log('有效属性', i, attr);
                    Object.defineProperty(_this, i, {
                        get: function get() {
                            return ServiceClass[i];
                        },
                        set: function set(value) {
                            //console.log('VVVVVVVVV', value);
                            ServiceClass[i] = value;
                        },
                        enumerable: true
                    });
                }
            };

            for (var i in ServiceClass) {
                _loop(i);
            }

            //类函数

            var _loop2 = function _loop2(i) {
                var name = serviceFuns[i];

                //过滤es6 class虚构函数
                if (name == 'constructor') return 'continue';

                //查找使用this.fun=()={}, bb=()=>{}定义的方法
                if (/^__.*__REACT_HOT_LOADER__$/.test(name)) {
                    name = name.replace(/^__(.*)__REACT_HOT_LOADER__$/, function (a, b) {
                        return b;
                    });
                }

                //以_开头为私有,过滤
                if (name.indexOf("_") === 0) return 'continue';

                /*_service.prototype[name] = function (...param) {
                 //this[name] = function (...param) {
                   ServiceClass[name](...param);
                     }.bind(ServiceClass);*/

                Object.defineProperty(_this, name, {
                    get: function get() {
                        return ServiceClass[name];

                        return function () {
                            for (var _len2 = arguments.length, p = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                p[_key2] = arguments[_key2];
                            }

                            //console.log('调用》', apiModuleName + '.' + name);
                            var _lnterceptName = apiModuleName + '.' + name;
                            _Interceptor.restful.action(_lnterceptName, function (formData, req) {
                                //console.log('use::::::::::::::::', formData, req);
                                req.dispatch({ res: formData.data });
                            });
                            _Interceptor.response.action(_lnterceptName, function (formData, req) {
                                //console.log('res::::::::::::::::', formData, req);
                                req.dispatch({ res: formData.data });
                            });

                            // console.time(_lnterceptName)


                            _Interceptor.response.entry(_lnterceptName, {
                                formData: p,
                                data: p
                            }, function (formData, obj) {
                                // console.log('response出出出》', formData, obj);

                                _Interceptor.restful.entry(_lnterceptName, {
                                    formData: p,
                                    data: p
                                }, function (formData, obj) {
                                    // console.log('restful出出出》', formData, obj);
                                    //console.timeEnd(_lnterceptName);

                                });
                            });
                            return ServiceClass[name].apply(null, p);
                        };

                        return function () {
                            for (var _len3 = arguments.length, p = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                                p[_key3] = arguments[_key3];
                            }

                            console.log('调用》', apiModuleName + '.' + name);
                            var _lnterceptName = apiModuleName + '.' + name;
                            _Interceptor.restful.action(_lnterceptName, function (formData, req) {
                                //console.log('use::::::::::::::::', formData, req);
                                req.dispatch({ res: formData.data });
                            });
                            _Interceptor.response.action(_lnterceptName, function (formData, req) {
                                //console.log('res::::::::::::::::', formData, req);
                                req.dispatch({ res: formData.data });
                            });

                            console.time(_lnterceptName);
                            return new Promise(function (resolve) {

                                _Interceptor.response.entry(_lnterceptName, {
                                    formData: p,
                                    data: p
                                }, function (formData, obj) {
                                    console.log('response出出出》', formData, obj);

                                    return Promise.resolve(obj.res).then(function (data) {
                                        console.log('进入最后的转换', data);

                                        _Interceptor.restful.entry(_lnterceptName, {
                                            formData: p,
                                            data: ServiceClass[name].apply(null, data)
                                        }, function (formData, obj) {
                                            console.log('restful出出出》', formData, obj);
                                            console.timeEnd(_lnterceptName);
                                            resolve(obj.res);
                                        });
                                    });
                                });
                            });
                        };
                    },
                    enumerable: false
                });

                //console.log('name:>', name/*,ServiceClass[name]*/);
            };

            for (var i in serviceFuns) {
                var _ret2 = _loop2(i);

                if (_ret2 === 'continue') continue;
            }
        };
        return _service;
    };
};

exports.default = apiData;