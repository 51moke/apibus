/**
 * Created by laomao on 2017/11/23.
 */
export default class Emitter {

    constructor() {
        this._config = {
            events: {},
            middles: {},
            action: {},
            middles_g: [],
            output: null,
        }
        // 注册中间件
        this.use = (type, middle) => {

            //console.log('注册中间件：', typeof type);
            if (typeof type == 'function') {
                this._config.middles_g.push(type);
                for (let i in this._config.middles) {
                    let guse = (...args) => {
                        type(...args)
                    }
                    this.use._use(i, guse);
                }
            } else {
                this.use.g_use(type);
                this.use._use(type, middle);
            }
        }
        this.use._use = (type, middle) => {
            const list = this._config.middles[type];
            if (!list) {
                this._config.middles[type] = middle;
                return;
            }

            let current = list;
            while (current.next) {
                current = current.next;
            }
            current.next = middle;
        }
        this.use.g_use = (type) => {
            if (!this._config.middles[type]) {
                //注入全局组件
                for (let i = 0; i < this._config.middles_g.length; i++) {
                    //console.log('全局', type, this._config.middles_g[i]);
                    let g = (...arg) => {
                        this._config.middles_g[i](...arg)
                    }
                    this.use._use(type, g);
                }
            }
        }
    }

    //入口
    entry(type, formData = {formData: '', data: ''}, this_output = () => {
    }) {
        //console.log('入口',type,data);
        if (this._config.action[type]) {

            formData = {type, formData: formData.formData, data: formData.data};
            //派发
            const dispatch = (data) => {
                //console.log('派发', JSON.stringify({type, formData, data}));
                // 调用 middleware
                const middle = this._config.middles[type];
                const output = (func) => {
                    //console.log('完成了:', JSON.stringify({type, formData, data}))
                    this_output(formData, data);
                    if (!this._config.output) {
                        console.error("没有定义出口");
                        return;
                    }
                    this._config.output(formData, data);
                }

                if (middle) {
                    function wrapNext(m) {
                        //console.log('m', JSON.stringify({formData, data, m}))
                        return function () {
                            if (m.next) {
                                m.next(formData, data, wrapNext(m.next));
                            } else {
                                output()
                            }
                        };
                    }

                    middle(formData, data, wrapNext(middle));
                } else {
                    output();
                }
            }
            this._config.action[type](formData, {dispatch});
        } else {
            console.log(type + ' action不存在');
        }
    }

    //事务
    action(type, func) {
        if (this._config.action[type]) {
            console.error('action必须是唯一的')

            return;
        }
        //console.log(JSON.stringify(this._config.middles))
        this.use.g_use(type);

        this._config.action[type] = func;
    }

    //出口
    output(func) {
        if (this._config.output) {
            console.error("出口必须是唯一的")
            return;
        }
        this._config.output = func;
    }


}