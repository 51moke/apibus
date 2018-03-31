/**
 * Created by laomao on 2018/3/25.
 */
import EmitterPromise from './util/EmitterPromise';
import {response,restful,use,res} from './util/Interceptor';
export {use,res,EmitterPromise};
let apiData = {};
//总出口response
response.output((formData, data) => {
    //console.log('response总出口:', JSON.stringify({formData, data}))

});
//总出口restful
restful.output((formData, data) => {
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
export const Register = function (apiModuleName) {
    //console.log('!!!!', arg);
    return function (c) {
        const _service = function (...args) {
            const ServiceClass = new c(...args);
            //console.log('创建的类', ServiceClass);
            const serviceFuns = Object.getOwnPropertyNames(Object.getPrototypeOf(ServiceClass));

            //类属性
            for (let i in ServiceClass) {
                let attr = ServiceClass[i];
                if (typeof attr != 'function') {
                    //console.log('有效属性', i, attr);
                    Object.defineProperty(this, i, {
                        get: function () {
                            return ServiceClass[i]
                        },
                        set: function (value) {
                            //console.log('VVVVVVVVV', value);
                            ServiceClass[i] = value;
                        },
                        enumerable: true
                    })
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

                 ServiceClass[name](...param);


                 }.bind(ServiceClass);*/

                Object.defineProperty(this, name, {
                    get: function () {
                        return ServiceClass[name];

                        return (...p)=> {
                            //console.log('调用》', apiModuleName + '.' + name);
                            let _lnterceptName = apiModuleName + '.' + name;
                            restful.action(_lnterceptName, (formData, req) => {
                                //console.log('use::::::::::::::::', formData, req);
                                req.dispatch({res: formData.data});
                            });
                            response.action(_lnterceptName, (formData, req) => {
                                //console.log('res::::::::::::::::', formData, req);
                                req.dispatch({res: formData.data});
                            });

                            // console.time(_lnterceptName)


                            response.entry(_lnterceptName, {
                                formData: p,
                                data: p,
                            }, (formData, obj) => {
                                // console.log('response出出出》', formData, obj);

                                restful.entry(_lnterceptName, {
                                    formData: p,
                                    data: p,
                                }, (formData, obj) => {
                                    // console.log('restful出出出》', formData, obj);
                                    //console.timeEnd(_lnterceptName);

                                });


                            });
                            return ServiceClass[name].apply(null, p)


                        };

                        return (...p)=> {
                            console.log('调用》', apiModuleName + '.' + name);
                            let _lnterceptName = apiModuleName + '.' + name;
                            restful.action(_lnterceptName, (formData, req) => {
                                //console.log('use::::::::::::::::', formData, req);
                                req.dispatch({res: formData.data});
                            });
                            response.action(_lnterceptName, (formData, req) => {
                                //console.log('res::::::::::::::::', formData, req);
                                req.dispatch({res: formData.data});
                            });

                            console.time(_lnterceptName)
                            return new Promise((resolve)=> {

                                response.entry(_lnterceptName, {
                                    formData: p,
                                    data: p,
                                }, (formData, obj) => {
                                    console.log('response出出出》', formData, obj);

                                    return Promise.resolve(obj.res).then(data=> {
                                        console.log('进入最后的转换', data);


                                        restful.entry(_lnterceptName, {
                                            formData: p,
                                            data: ServiceClass[name].apply(null, data),
                                        }, (formData, obj) => {
                                            console.log('restful出出出》', formData, obj);
                                            console.timeEnd(_lnterceptName);
                                            resolve(obj.res);
                                        });


                                    })


                                });

                            })


                        };
                    },
                    enumerable: false
                })

                //console.log('name:>', name/*,ServiceClass[name]*/);
            }
        }
        return _service;
    }
}

export default apiData;
