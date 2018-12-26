# 接口总线

## 安装
```
npm install apibus --save

or

yarn add apibus

```

## 1、快捷注册api
###### 使用说明
```
import apibus from 'apibus'
apibus.Register('接口名', 方法);
```

###### 快捷注册实例es6:
```
import apibus from 'apibus'

apibus.Register('login', (userid, password)=> {
    if (userid == 'admin' && password == 'admin') {
        return true;
    }
    return Promise.reject(false);
})
```

###### 快捷注册实例es5:
```
import apibus from 'apibus'
apibus.Register('login', function (userid, password) {
    if (userid == 'admin' && password == 'admin') {
        return true;
    }
    return Promise.reject(false);
})
```
###### 调用api：
```
import {api} from 'apibus'

api.login('admin', 'admin')
    .then(res=> {
        console.log('登陆成功！');
    })
    .catch(err => {
        console.log('账号或密码出错，登陆失败');
    });
```

## 2、对象注册api
###### 使用说明
```
import apibus from 'apibus'
apibus.Register('模型名',对象);
```

###### 对象注册实例:
```
import apibus from 'apibus'

apibus.Register('user', {
    getInfo: ()=> {
        return "info...";
    },
    login: (userid, password)=> {
        if (userid == 'admin' && password == 'admin') {
            return true;
        }
        return Promise.reject(false);
    }
})
```
###### 调用api：
```
import {api} from 'apibus'

api.user.getInfo()
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });

api.user.login('admin', 'admin')
    .then(res=> {
        console.log('登陆成功！');
    })
    .catch(err => {
        console.log('账号或密码出错，登陆失败');
    });
```

## 3、es6 class注册api
###### 使用说明
```
import {Register} from 'apibus'

@Register('模型名', ['实例化参数1', '实例化参数2', '实例化参数n'])
class user {
    //...
}

```

###### es6 class注册实例:
```
import {Register} from 'apibus'

@Register('user')
class user {

    getInfo() {
        return "info...";
    }

    login(userid, password) {
        if (userid == 'admin' && password == 'admin') {
            return true;
        }
        return Promise.reject(false);
    }
}
```
###### 调用api：
```
import {api} from 'apibus'

api.user.getInfo()
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });

api.user.login('admin', 'admin')
    .then(res=> {
        console.log('登陆成功！');
    })
    .catch(err => {
        console.log('账号或密码出错，登陆失败');
    });
```

## 4、es6 私有方法
###### 使用说明
```
对象和es6 class方法名可以以_开头标签为私有方法，不提供外部调用
```

###### 私有方法实例:
```
import apibus,{Register} from 'apibus'

@Register('user')
class user {

    //私有方法，外部无法调用
    _getSex(value) {
        if (value == 1) {
            return '帅哥';
        }
        if (value == 2) {
            return '美女';
        }
        return '人妖';
    }

    //提供外部使用
    getInfo(value) {
        return '你是' + this._getSex(value);
    }

}

//or

apibus.Register('user', {
    //私有方法，外部无法调用
    _getSex: function (value) {
        if (value == 1) {
            return '帅哥';
        }
        if (value == 2) {
            return '美女';
        }
        return '人妖';
    },
    //提供外部使用
    getInfo: function (value) {
        return '你是' + this._getSex(value);
    }
})
```
###### 调用api：
```
import {api} from 'apibus'

//私有方法不可以调用，编译出错
//api.user._getSex(1).then(res=>{})

//可以正常方法
api.user.getInfo(1)
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });
```

## 5、拦截器
###### 基本用法：
```
import apibus from 'apibus'
//拦截器方法第一个参数返回标准的 Promise,第二个参数返回接口相关信息
apibus.Req('模型名.方法名',(标准Promise,api信息)=>{
    return 最终结果;
})
```
###### 拦截指定用法方法:
```
apibus.Req('模型名.方法名',拦截方法)    //调用api之前拦截
apibus.Res('模型名.方法名',拦截方法)    //调用api完成之前返回拦截
```
###### 拦截模型所有方法：
```
apibus.Req('模型名.*',拦截方法)    //拦截模型所有方法，调用api之前拦截
apibus.Res('模型名.*',拦截方法)    //拦截模型所有方法，调用api完成之前返回拦截
```
###### 拦截所有api方法
```
apibus.Req(拦截方法)    //拦截所有api方法，调用api之前拦截
apibus.Res(拦截方法)    //拦截所有api方法，调用api完成之前返回拦截
```
###### 拦截实例(接口进出log)
```
import apibus from 'apibus'

//打接口被调用log
apibus.Req((promise, apiInfo)=> {
    return promise.then(res=> {
        console.log('exec-> api name:', apiInfo.name, ' value:', res);
        return res;
    });
})

//...更多的拦截器

//打接口返回值log
apibus.Res((promise, apiInfo)=> {
    return promise.then(res=> {
        console.log('res-> api name:', apiInfo.name, ' value:', res);
        return res;
    });
})
```


## 6、代理注册api,需要客户端支持Proxy (v1.0.4新加)
###### 使用说明
```
import apibus from 'apibus'
apibus.Register('模型名')((接口名)=>{
    return (...接收到调用接口的参数)=>{
        return 结果
    }
},true);
```

###### 代理注册实例:
```
import apibus from 'apibus'

apibus.Register('proxyService')((name)=> {

  //对auth单独处理
  if (name == 'auth') {
    return (...args)=> {
      return 'auth';
    }
  }
  //对getName单独处理
  if (name == 'getName') {
    return (...args)=> {
      return 'getName';
    }
  }
  //...

  //如果想让proxyService服务有无限方法，可以返回一个通用的（这部是可选）
  return (...args)=> {
    return '通用的proxyService服务->执行了:api.proxyService.' + name;
  }

}, true)
```
###### 调用api：
```
import {api} from 'apibus'

api.proxyService.auth()
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });

api.proxyService.getName()
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });

//调用一个不存在的接口（服务如果有全局就返回全局）
api.proxyService.demo()
    .then(res=> {
        console.log('正常返回', res);
    })
    .catch(err => {
        console.log('异常返回', err);
    });
```
## 7、全局
###### 使用说明
```
import apibus from 'apibus'
//赋值
api.SetGlobal(key,value)
//取值
api.G[key]
```

###### 全局实例:
```
import apibus,{G} from 'apibus'

//赋值
apibus.SetGlobal('funDemo',()=>{
    console.log('this is funDemo')
})
apibus.SetGlobal('stringDemo','string')
apibus.SetGlobal('objDemo',{name:'张三',age:20})

//取值
apibus.G.funDemo()
console.log(apibus.G.stringDemo)
console.log(apibus.G.objDemo)

//or
G.funDemo()
console.log(G.stringDemo)
console.log(G.objDemo)

```

# 版本说明
###### (1.0.8)支持es6类的继承

```
class baseUser{
    mySay(){
        console.log('我是父类')
        return {code:0}
    }
}

@Register('user')
class user extends baseUser {

}

//调用
api.user.mySay().then(res => {
  console.log('res', res)
})

```

[进入github](https://github.com/51moke/apibus.git)