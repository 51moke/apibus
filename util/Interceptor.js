/**
 * Created by laomao on 2017/12/12.
 */
import Emitter from './Emitter';
export const restful = new Emitter();
export const response = new Emitter();


let emit = (serviceName, func, type)=> {
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
        for (let i in serviceName) {
            let name = serviceName[i];
            if (type == 'restful') {
                restful.use(name, (...pp)=> {
                    func(...pp);
                });
            }
            if (type == 'response') {
                response.use(name, (...pp)=> {
                    func(...pp);
                });
            }
        }
        return;
    }

}

export const use = function (serviceName, func) {
    return emit(serviceName, func, 'response');
}

export const res = function (serviceName, func) {
    return emit(serviceName, func, 'restful');
}