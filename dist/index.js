'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.api = exports.Register = exports.SetGlobal = exports.G = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _EmitterPromise = require('./util/EmitterPromise');

var _EmitterPromise2 = _interopRequireDefault(_EmitterPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Created by laomao on 2018/3/25.
                                                                                                                                                                                                     */


var response = new _EmitterPromise2.default();
var request = new _EmitterPromise2.default();
var Req = request.use.bind(request);
var Res = response.use.bind(response);
// request
// response

var apiData = {};

var G = exports.G = {};

var SetGlobal = exports.SetGlobal = function SetGlobal(name, value) {
    if (name !== '') {
        G[name] = value;
        return true;
    }
    return false;
};

//注册api
var Register = exports.Register = function Register(apiModuleName) {
    var classArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


    /**
     * 绑定属性
     * @param obj
     * @param key
     * @param serviceClass
     */
    var bindAttr = function bindAttr(obj, key, serviceClass) {
        Object.defineProperty(obj, key, {
            get: function get() {
                return serviceClass[key];
            },
            set: function set(value) {
                //console.log('VVVVVVVVV', value);
                serviceClass[key] = value;
            },
            enumerable: true
        });
    };

    /**
     * 拦截器名称，api方法，参数
     * @param _lnterceptName
     * @param apiFunc
     * @param args
     * @returns {Promise<T>|Promise}
     */
    var setEmitter = function setEmitter(_lnterceptName, apiFunc, args) {
        return new Promise(function (resolve) {
            //let _lnterceptName = apiModuleName ? apiModuleName + '.' + name : name;
            var _formData = void 0;
            resolve(request.entry(_lnterceptName, args, function (res, formData) {
                //console.log('拿到', formData);
                _formData = formData;
                return res;
            }).then(function (arg) {
                //console.log('转换', arg);
                //修复拦截器不返回或返回不是数组异常
                if (!Array.isArray(arg)) {
                    arg = [];
                }
                return Promise.resolve(apiFunc.apply(undefined, _toConsumableArray(arg))).then(function (_data) {
                    //console.log('结果', _data,_formData);
                    return response.entry(_lnterceptName, _data, null, _formData);
                }).catch(function (err) {
                    //console.log('出错了111', err);
                    return Promise.reject(err);
                });
            }).catch(function (err) {
                //console.log('走异常了', err);
                return response.entry(_lnterceptName, Promise.reject(err), null, _formData);
            }));
        });
    };

    /**
     * 绑定功能
     * @param obj
     * @param name
     * @param serviceClass
     */
    var bindAction = function bindAction(obj, name, serviceClass) {
        if (obj[name]) {
            return;
        }
        Object.defineProperty(obj, name, {
            get: function get() {
                //return serviceClass[name];
                return function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    var _lnterceptName = apiModuleName ? apiModuleName + '.' + name : name;
                    var apiFunc = serviceClass[name].bind(serviceClass);
                    //console.log('!!!!!!!!!!!!!!!!!',apiFunc,serviceClass)

                    return setEmitter(_lnterceptName, apiFunc, args);
                };
            },
            enumerable: false
        });
    };

    /**
     * 单个方法解析
     */
    if (typeof classArgs == 'function') {
        var serviceClass = {};
        var _o = {};
        var name = apiModuleName;
        apiModuleName = null;
        serviceClass[name] = classArgs;
        bindAction(_o, name, serviceClass);
        apiData[name] = _o[name].bind(_o);
        return;
    }

    /**
     * 对象解析
     */
    if (!Array.isArray(classArgs) && (typeof classArgs === 'undefined' ? 'undefined' : _typeof(classArgs)) == 'object') {
        var _serviceClass = classArgs;
        var _o2 = {};
        for (var _name in _serviceClass) {
            if (_name.indexOf("_") === 0) continue;
            var f = _serviceClass[_name];
            if (typeof f !== 'function') {
                bindAttr(_o2, _name, _serviceClass);
            } else {
                bindAction(_o2, _name, _serviceClass);
            }
        }
        apiData[apiModuleName] = _o2;
        return;
    }

    /**
     * 解析类
     * @param c
     * @returns {_service}
     */
    return function (c) {
        var isProxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


        if (isProxy) {
            apiData[apiModuleName] = new Proxy({}, {
                get: function get(target, key, receiver) {
                    console.log('getting ' + key + '!');
                    return function () {
                        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            args[_key2] = arguments[_key2];
                        }

                        return setEmitter(apiModuleName + '.' + key, function () {
                            //console.log('接收到的参数',param);
                            var api = c(key);
                            if (typeof api == 'function') {
                                return api.apply(undefined, arguments);
                            }
                            throw Error('api.' + apiModuleName + '.' + key + ' is not a function');
                        }, args);
                    };
                }
            });
            return;
        }

        var _service = function _service() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            var serviceClass = new (Function.prototype.bind.apply(c, [null].concat(args)))();

            //解析extends
            var base = [];
            if (serviceClass.constructor.__proto__.prototype) {
                base = Object.getOwnPropertyNames(serviceClass.constructor.__proto__.prototype);
            }

            //console.log('创建的类', serviceClass);
            var serviceFuns = [].concat(_toConsumableArray(Object.getOwnPropertyNames(Object.getPrototypeOf(serviceClass))), _toConsumableArray(base));
            //console.log('方法', serviceFuns);
            //类属性
            for (var i in serviceClass) {
                var attr = serviceClass[i];
                if (typeof attr != 'function') {
                    //console.log('有效属性', i, attr);
                    bindAttr(this, i, serviceClass);
                }
            }

            //类函数
            for (var _i in serviceFuns) {
                var _name2 = serviceFuns[_i];

                //过滤es6 class虚构函数
                if (_name2 == 'constructor') continue;

                //查找使用this.fun=()={}, bb=()=>{}定义的方法
                if (/^__.*__REACT_HOT_LOADER__$/.test(_name2)) {
                    _name2 = _name2.replace(/^__(.*)__REACT_HOT_LOADER__$/, function (a, b) {
                        return b;
                    });
                }

                //以_开头为私有,过滤
                if (_name2.indexOf("_") === 0) continue;

                /*_service.prototype[name] = function (...param) {
                 //this[name] = function (...param) {
                  serviceClass[name](...param);
                   }.bind(serviceClass);*/

                bindAction(this, _name2, serviceClass);
                //console.log('name:>', name/*,serviceClass[name]*/);
            }
        };
        apiData[apiModuleName] = new (Function.prototype.bind.apply(_service, [null].concat(_toConsumableArray(classArgs))))();
        return _service;
    };
};

exports.default = { Register: Register, Req: Req, Res: Res, EmitterPromise: _EmitterPromise2.default, G: G, SetGlobal: SetGlobal };
var api = exports.api = apiData;