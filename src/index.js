import Observer from "./observer";
import Compiler from "./compiler";

export default class Vue{
    constructor(options) {
        //获取元素dom对象
        this.$el=document.querySelector(options.el);
        //转存数据
        this.$data=options.data||{};
        //数据和函数的代理
        this._proxyData(this.$data);
        this._proxyMethods(options.methods)
        //数据劫持
        new Observer(this.$data);
        //模板编译
        new Compiler(this);
    }

    /**
     * 数据代理
     * @param data
     * @private
     */
    _proxyData(data){
        Object.keys(data).forEach((key) =>{
            Object.defineProperty(this,key,{
                set(newValue){
                    data[key]=newValue;
                },
                get(){
                    return data[key];
                },
            });
        });
    }

    /**
     * 函数的代理
     */
    _proxyMethods(methods){
        if(methods&&typeof methods==="object"){
           Object.keys(methods).forEach((key) =>{
               this[key] = methods[key];
           }) ;
        }
    }
}
window.Vue=Vue;