/**
 * Created by laomao on 2018/3/27.
 */
export default class EmitterPromise {
    constructor() {
        this._config = {
            middles: {},
            middles_g: [],
            //middles_group: [],
        }
    }

    use(name, func) {
        //console.log('use', name, func && func._type)
        if (typeof name == 'object') {
            for (let i in name) {
                let _name = name[i];
                this.use(_name, (...args)=>func(...args));
            }
            return this;
        }
        if (typeof name == 'function') {
            name._type = "_global";
            this._config.middles_g.push(name);
            for (let i in this._config.middles) {
                let _f = (...args)=>name(...args);
                _f._type = "global"
                this.use(i, _f);
            }
            return this;
        }
        //console.log('!!!!!!!!!!!', name, name.lastIndexOf('.*'), name.length - 2);

        let _group = name.lastIndexOf('.*');
        let _length = (name.length - 2);
        if (!func._type && _group != -1 && _group === _length) {
            func._name = name;
            func._type = "_group";
            this._config.middles_g.push(func);
            //console.log('查找到了组监听', name);
            for (let i in this._config.middles) {
                let _o = this._config.middles[i];
                let _n = _o._name.substring(0, _length + 1) + '*';
                //console.log('监听器', name, _n, _o._type);
                if (name === _n) {
                    //console.log('符合组', _o._name);
                    let _f = (...arg)=>func(...arg);
                    _f._type = "group";
                    this.use(_o._name, _f);
                }
            }
            return this;
        }

        const list = this._config.middles[name];
        if (!list) {

            /*if (func._type == 'group') {
             func._name = name;
             this._config.middles[name] = func;
             }*/

            if (!func.__g) {
                //console.log('嵌入全局', name);
                //嵌入全局
                for (let i in this._config.middles_g) {
                    let _func = this._config.middles_g[i]
                    if (!this._config.middles[name]) {
                        this._config.middles[name] = (...args)=>_func(...args);
                        this._config.middles[name]._type = "global";
                        this._config.middles[name]._name = name;
                    } else {
                        let _g = (...args)=>_func(...args);
                        _g._type = "global";
                        _g._name = name;
                        this.use(name, _g);
                    }
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

        let current = list;
        while (current.next) {
            current = current.next;
        }
        func._name = name;
        current.next = func;
        return this;
    }

    entry(name, data, callback, formData = {}) {
        let id;
        if (typeof name == 'object') {
            id = name.id;
            name = name.name;
        }
        /*let formData = {
         name: id || name
         }*/
        if (typeof formData !== 'object') {
            formData = {};
        }
        formData.name = id || name;

        let middles = this._config.middles[name];
        if (middles) {
            //console.log('执行中间件');
            let func = middles;
            let _func = (promise)=> {
                return func(promise, formData).then(res=> {
                    //console.log('走这里');
                    if (func.next) {
                        func = func.next;
                        return _func(Promise.resolve(res), formData);
                    }
                    return res;
                }).catch(err=> {
                    if (func.next) {
                        func = func.next;
                        return _func(Promise.reject(err), formData);
                    }
                    return Promise.reject(err);
                });
            }
            //callback(_func(Promise.resolve(data)), formData);
            if (callback) {
                return callback(_func(Promise.resolve(data)), formData);
            }
            return _func(Promise.resolve(data));
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
            let isG = false;
            for (let i in this._config.middles_g) {
                let f = this._config.middles_g[i];
                //console.log('绑定', f._type);
                if (f._type == "_global") {

                    let _f = (...arg)=>f(...arg);
                    isG = true;
                    _f.__g = true;
                    _f._type = "global";
                    _f._name = name;
                    this.use(name, _f);
                } else if (f._type == "_group") {
                    let _n = name.substring(0, f._name.length - 1) + '*';
                    //console.log('middles_group', _n, f._name, name);
                    if (_n === f._name) {
                        //console.log('成立', name);
                        let _f = (...args)=>f(...args);
                        isG = true;
                        _f.__g = true;
                        _f._type = "group";
                        _f._name = name;
                        this.use(name, _f)
                    }
                }

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
}
