'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.res = exports.use = exports.response = exports.restful = undefined;

var _Emitter = require('./Emitter');

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var restful = exports.restful = new _Emitter2.default(); /**
                                                          * Created by laomao on 2017/12/12.
                                                          */
var response = exports.response = new _Emitter2.default();

var emit = function emit(serviceName, func, type) {
    if (typeof serviceName == 'function') {
        if (type == 'restful') {
            restful.use(serviceName);
            return;
        }
        if (type == 'response') {
            response.use(serviceName);
            return;
        }
    }
    if (typeof serviceName == 'string') {
        if (type == 'restful') {
            restful.use(serviceName, func);
        }
        if (type == 'response') {
            response.use(serviceName, func);
        }
        return;
    }
    if (Array.isArray(serviceName)) {
        for (var i in serviceName) {
            var name = serviceName[i];
            if (type == 'restful') {
                restful.use(name, function () {
                    func.apply(undefined, arguments);
                });
            }
            if (type == 'response') {
                response.use(name, function () {
                    func.apply(undefined, arguments);
                });
            }
        }
        return;
    }
};

var use = exports.use = function use(serviceName, func) {
    return emit(serviceName, func, 'response');
};

var res = exports.res = function res(serviceName, func) {
    return emit(serviceName, func, 'restful');
};