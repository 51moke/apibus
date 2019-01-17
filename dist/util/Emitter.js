'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by laomao on 2017/11/23.
 */
var Emitter = function () {
    function Emitter() {
        var _this = this;

        _classCallCheck(this, Emitter);

        this._config = {
            events: {},
            middles: {},
            action: {},
            middles_g: [],
            output: null
            // 注册中间件
        };this.use = function (type, middle) {

            //console.log('注册中间件：', typeof type);
            if (typeof type == 'function') {
                _this._config.middles_g.push(type);
                for (var i in _this._config.middles) {
                    var guse = function guse() {
                        type.apply(undefined, arguments);
                    };
                    _this.use._use(i, guse);
                }
            } else {
                _this.use.g_use(type);
                _this.use._use(type, middle);
            }
        };
        this.use._use = function (type, middle) {
            var list = _this._config.middles[type];
            if (!list) {
                _this._config.middles[type] = middle;
                return;
            }

            var current = list;
            while (current.next) {
                current = current.next;
            }
            current.next = middle;
        };
        this.use.g_use = function (type) {
            if (!_this._config.middles[type]) {
                var _loop = function _loop(i) {
                    //console.log('全局', type, this._config.middles_g[i]);
                    var g = function g() {
                        var _config$middles_g;

                        (_config$middles_g = _this._config.middles_g)[i].apply(_config$middles_g, arguments);
                    };
                    _this.use._use(type, g);
                };

                //注入全局组件
                for (var i = 0; i < _this._config.middles_g.length; i++) {
                    _loop(i);
                }
            }
        };
    }

    //入口


    _createClass(Emitter, [{
        key: 'entry',
        value: function entry(type) {
            var _this2 = this;

            var formData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { formData: '', data: '' };
            var this_output = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

            //console.log('入口',type,data);
            if (this._config.action[type]) {

                formData = { type: type, formData: formData.formData, data: formData.data };
                //派发
                var dispatch = function dispatch(data) {
                    //console.log('派发', JSON.stringify({type, formData, data}));
                    // 调用 middleware
                    var middle = _this2._config.middles[type];
                    var output = function output(func) {
                        //console.log('完成了:', JSON.stringify({type, formData, data}))
                        this_output(formData, data);
                        if (!_this2._config.output) {
                            console.error("没有定义出口");
                            return;
                        }
                        _this2._config.output(formData, data);
                    };

                    if (middle) {
                        var _wrapNext = function _wrapNext(m) {
                            //console.log('m', JSON.stringify({formData, data, m}))
                            return function () {
                                if (m.next) {
                                    m.next(formData, data, _wrapNext(m.next));
                                } else {
                                    output();
                                }
                            };
                        };

                        middle(formData, data, _wrapNext(middle));
                    } else {
                        output();
                    }
                };
                this._config.action[type](formData, { dispatch: dispatch });
            } else {
                console.log(type + ' action不存在');
            }
        }

        //事务

    }, {
        key: 'action',
        value: function action(type, func) {
            if (this._config.action[type]) {
                console.error('action必须是唯一的');

                return;
            }
            //console.log(JSON.stringify(this._config.middles))
            this.use.g_use(type);

            this._config.action[type] = func;
        }

        //出口

    }, {
        key: 'output',
        value: function output(func) {
            if (this._config.output) {
                console.error("出口必须是唯一的");
                return;
            }
            this._config.output = func;
        }
    }]);

    return Emitter;
}();

exports.default = Emitter;