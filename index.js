/**
 * Created by laomao on 2018/3/25.
 */
import EmitterPromise from './util/EmitterPromise';
const restful = new EmitterPromise();
const response = new EmitterPromise();
const use = response.use.bind(response);
const res = restful.use.bind(restful);

let apiData = {};

//注册api
export const Register = function (apiModuleName, classArgs = []) {

    /**
     * 绑定属性
     * @param obj
     * @param key
     * @param serviceClass
     */
    let bindAttr = (obj, key, serviceClass)=> {
        Object.defineProperty(obj, key, {
            get: function () {
                return serviceClass[key]
            },
            set: function (value) {
                //console.log('VVVVVVVVV', value);
                serviceClass[key] = value;
            },
            enumerable: true
        })
    }

    /**
     * 拦截器名称，api方法，参数
     * @param _lnterceptName
     * @param apiFunc
     * @param args
     * @returns {Promise<T>|Promise}
     */
    let setEmitter = (_lnterceptName, apiFunc, args)=> {
        return new Promise((resolve)=> {
            //let _lnterceptName = apiModuleName ? apiModuleName + '.' + name : name;
            let _formData;
            resolve(response.entry(_lnterceptName, args, (res, formData)=> {
                //console.log('拿到', formData);
                _formData = formData;
                return res;
            }).then(arg=> {
                //console.log('转换', arg);
                return Promise.resolve(apiFunc(...arg)).then(_data=> {
                    //console.log('结果', _data,_formData);
                    return restful.entry(_lnterceptName, _data, null, _formData);
                }).catch(err=> {
                    //console.log('出错了111', err);
                    return Promise.reject(err);
                })
            }).catch(err=> {
                //console.log('走异常了', err);
                return restful.entry(_lnterceptName, Promise.reject(err), null, _formData);
            }));

        })
    }

    /**
     * 绑定功能
     * @param obj
     * @param name
     * @param serviceClass
     */
    let bindAction = (obj, name, serviceClass)=> {
        Object.defineProperty(obj, name, {
            get: function () {
                //return serviceClass[name];
                return (...args)=> {
                    let _lnterceptName = apiModuleName ? apiModuleName + '.' + name : name;
                    let apiFunc = serviceClass[name];
                    return setEmitter(_lnterceptName, apiFunc, args);
                }
            },
            enumerable: false
        })
    }

    /**
     * 单个方法解析
     */
    if (typeof classArgs == 'function') {
        let serviceClass = {};
        let _o = {};
        let name = apiModuleName;
        apiModuleName = null;
        serviceClass[name] = classArgs;
        bindAction(_o, name, serviceClass);
        apiData[name] = _o[name].bind(_o);
        return;
    }

    /**
     * 对象解析
     */
    if (!Array.isArray(classArgs) && typeof classArgs == 'object') {
        let serviceClass = classArgs;
        let _o = {};
        for (let name in serviceClass) {
            if (name.indexOf("_") === 0)continue;
            let f = serviceClass[name];
            if (typeof f !== 'function') {
                bindAttr(_o, name, serviceClass);
            } else {
                bindAction(_o, name, serviceClass);
            }
        }
        apiData[apiModuleName] = _o;
        return;
    }

    /**
     * 解析类
     * @param c
     * @returns {_service}
     */
    return function (c, isProxy = false) {

        if (isProxy) {
            apiData[apiModuleName] = new Proxy({}, {
                get: function (target, key, receiver) {
                    console.log(`getting ${key}!`);
                    return (...args)=> {
                        return setEmitter(apiModuleName + '.' + key, (...param)=> {
                            //console.log('接收到的参数',param);
                            let api = c(key);
                            if (typeof api == 'function') {
                                return api(...param);
                            }
                            throw Error('api.' + apiModuleName + '.' + key + ' is not a function')
                        }, args);
                    };
                }
            });
            return;
        }

        const _service = function (...args) {

            let serviceClass = new c(...args);
            //console.log('创建的类', serviceClass);
            let serviceFuns = Object.getOwnPropertyNames(Object.getPrototypeOf(serviceClass));
            //console.log('方法', serviceFuns);
            //类属性
            for (let i in serviceClass) {
                let attr = serviceClass[i];
                if (typeof attr != 'function') {
                    //console.log('有效属性', i, attr);
                    bindAttr(this, i, serviceClass);
                }
            }

            //类函数
            for (let i in serviceFuns) {
                let name = serviceFuns[i];

                //过滤es6 class虚构函数
                if (name == 'constructor')continue;

                //查找使用this.fun=()={}, bb=()=>{}定义的方法
                if (/^__.*__REACT_HOT_LOADER__$/.test(name)) {
                    name = name.replace(/^__(.*)__REACT_HOT_LOADER__$/, function (a, b) {
                        return b;
                    })
                }

                //以_开头为私有,过滤
                if (name.indexOf("_") === 0)continue;

                /*_service.prototype[name] = function (...param) {
                 //this[name] = function (...param) {

                 serviceClass[name](...param);


                 }.bind(serviceClass);*/

                bindAction(this, name, serviceClass);
                //console.log('name:>', name/*,serviceClass[name]*/);
            }
        }
        apiData[apiModuleName] = new _service(...classArgs);
        return _service;
    }

}

export default {Register, use, res, EmitterPromise};
export let api = apiData;
