'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by laomao on 2018/3/27.
 */
var EmitterPromise = function () {
    function EmitterPromise() {
        _classCallCheck(this, EmitterPromise);

        this._config = {
            middles: {},
            middles_g: []
            //middles_group: [],
        };
    }

    _createClass(EmitterPromise, [{
        key: 'use',
        value: function use(name, func) {
            var _this = this;

            //console.log('use', name, func && func._type)
            if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object') {
                for (var i in name) {
                    var _name = name[i];
                    this.use(_name, function () {
                        return func.apply(undefined, arguments);
                    });
                }
                return this;
            }
            if (typeof name == 'function') {
                name._type = "_global";
                this._config.middles_g.push(name);
                for (var _i in this._config.middles) {
                    var _f = function _f() {
                        return name.apply(undefined, arguments);
                    };
                    _f._type = "global";
                    this.use(_i, _f);
                }
                return this;
            }
            //console.log('!!!!!!!!!!!', name, name.lastIndexOf('.*'), name.length - 2);

            var _group = name.lastIndexOf('.*');
            var _length = name.length - 2;
            if (!func._type && _group != -1 && _group === _length) {
                func._name = name;
                func._type = "_group";
                this._config.middles_g.push(func);
                //console.log('查找到了组监听', name);
                for (var _i2 in this._config.middles) {
                    var _o = this._config.middles[_i2];
                    var _n = _o._name.substring(0, _length + 1) + '*';
                    //console.log('监听器', name, _n, _o._type);
                    if (name === _n) {
                        //console.log('符合组', _o._name);
                        var _f2 = function _f2() {
                            return func.apply(undefined, arguments);
                        };
                        _f2._type = "group";
                        this.use(_o._name, _f2);
                    }
                }
                return this;
            }

            var list = this._config.middles[name];
            if (!list) {

                /*if (func._type == 'group') {
                 func._name = name;
                 this._config.middles[name] = func;
                 }*/

                if (!func.__g) {
                    var _loop = function _loop(_i3) {
                        var _func = _this._config.middles_g[_i3];
                        if (!_this._config.middles[name]) {
                            _this._config.middles[name] = function () {
                                return _func.apply(undefined, arguments);
                            };
                            _this._config.middles[name]._type = "global";
                            _this._config.middles[name]._name = name;
                        } else {
                            var _g = function _g() {
                                return _func.apply(undefined, arguments);
                            };
                            _g._type = "global";
                            _g._name = name;
                            _this.use(name, _g);
                        }
                    };

                    //console.log('嵌入全局', name);
                    //嵌入全局
                    for (var _i3 in this._config.middles_g) {
                        _loop(_i3);
                    }
                }

                if (this._config.middles[name]) {
                    /*func._type = 'group' || */
                    this.use(name, func);
                } else {
                    func._name = name;
                    this._config.middles[name] = func;
                }
                return;
            }

            var current = list;
            while (current.next) {
                current = current.next;
            }
            func._name = name;
            current.next = func;
            return this;
        }
    }, {
        key: 'entry',
        value: function entry(name, data, callback) {
            var _this2 = this;

            var formData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var id = void 0;
            if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object') {
                id = name.id;
                name = name.name;
            }
            /*let formData = {
             name: id || name
             }*/
            if ((typeof formData === 'undefined' ? 'undefined' : _typeof(formData)) !== 'object') {
                formData = {};
            }
            formData.name = id || name;

            var middles = this._config.middles[name];
            if (middles) {
                //console.log('执行中间件');
                var func = middles;
                var _func2 = function _func2(promise) {
                    return func(promise, formData).then(function (res) {
                        //console.log('走这里');
                        if (func.next) {
                            func = func.next;
                            return _func2(Promise.resolve(res), formData);
                        }
                        return res;
                    }).catch(function (err) {
                        if (func.next) {
                            func = func.next;
                            return _func2(Promise.reject(err), formData);
                        }
                        return Promise.reject(err);
                    });
                };
                //callback(_func(Promise.resolve(data)), formData);
                if (callback) {
                    return callback(_func2(Promise.resolve(data)), formData);
                }
                return _func2(Promise.resolve(data));
            }

            /*if (this._config.middles_group.length) {
             let isG = false;
             for (let i in this._config.middles_group) {
             let f = this._config.middles_group[i];
             let _n = name.substring(0, f._name.length - 1) + '*';
             //console.log('middles_group', _n, f._name, name);
             if (_n === f._name) {
             //console.log('成立', name);
             isG = true;
             let _f = (...args)=>f(...args);
             _f._type = "group";
             this.use(name, _f)
             }
              }
             if (isG) {
             return this.entry(name, data, callback,formData);
             }
             }*/

            //console.log('middles_g!!!!!!!!!!!!!!!!', name);//全局
            if (this._config.middles_g.length) {
                var isG = false;

                var _loop2 = function _loop2(i) {
                    var f = _this2._config.middles_g[i];
                    //console.log('绑定', f._type);
                    if (f._type == "_global") {

                        var _f = function _f() {
                            return f.apply(undefined, arguments);
                        };
                        isG = true;
                        _f.__g = true;
                        _f._type = "global";
                        _f._name = name;
                        _this2.use(name, _f);
                    } else if (f._type == "_group") {
                        var _n = name.substring(0, f._name.length - 1) + '*';
                        //console.log('middles_group', _n, f._name, name);
                        if (_n === f._name) {
                            //console.log('成立', name);
                            var _f3 = function _f3() {
                                return f.apply(undefined, arguments);
                            };
                            isG = true;
                            _f3.__g = true;
                            _f3._type = "group";
                            _f3._name = name;
                            _this2.use(name, _f3);
                        }
                    }
                };

                for (var i in this._config.middles_g) {
                    _loop2(i);
                }
                if (isG) {
                    return this.entry(name, data, callback, formData);
                }
            }

            //callback(Promise.resolve(data), formData);
            if (callback) {
                return callback(Promise.resolve(data), formData);
            }
            return Promise.resolve(data);
        }
    }]);

    return EmitterPromise;
}();

exports.default = EmitterPromise;