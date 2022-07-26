import Watcher from "./watcher";

export default class Compiler{
    constructor(context) {
        this.$el=context.$el;
        this.context=context;
        if(this.$el){
            //把原始的dom转换为文档片段
            this.$fragment=this.nodeToFragment(this.$el);
            //编译模板
            this.compiler(this.$fragment);
            //把文档片段添加到页面中
            this.$el.appendChild(this.$fragment)
        }
    }

    /**
     * 把所有元素转换为文档片段
     */
    nodeToFragment(node){
        let fragment=document.createDocumentFragment();
        if(node.childNodes &&node.childNodes.length){
            node.childNodes.forEach((child) =>{
                //判断是不是需要添加的节点
                //如果是注释节点或者无用的换行不添加
                if(!this.ignorable(child)){
                    fragment.appendChild(child);
                }
            });
        }
        return fragment;
    }

    /**
     * 忽略哪些节点不添加到文档片段
     */
    ignorable(node){
        let reg=/^[\t\n\r]+/;
        return(
            node.nodeType===8||(node.nodeType===3&&reg.test(node.textContent))
        );
    }
    /**
     * 模板编译
     */
    compiler(fragment){
        if(fragment.childNodes&&fragment.childNodes.length){
            fragment.childNodes.forEach((child) =>{
                if(child.nodeType===1){
                    //当nodeType为1时，说明是元素节点
                    this.compilerElementNode(child)
                }else if(child.nodeType===3){
                    //当nodeType为3时，说明时文本节点
                    this.compilerTextNode(child)
                }
            });
        }
    }

    /**
     * 编译元素节点
     */
    compilerElementNode(node){
        let attrs=[...node.attributes];
        attrs.forEach(attr =>{
            let {name:attrName, value:attrValue}=attr;
            if(attrName.indexOf("v-")===0){
                let dirName=attrName.slice(2)
                switch (dirName){
                    case "text":
                        new Watcher(attrValue,this.context,newValue =>{
                            node.textContent=newValue;
                        });
                        break;
                    case "model":
                        new Watcher(attrValue,this.context,newValue =>{
                            node.value=newValue;
                        });
                        node.addEventListener("input",e =>{
                            this.context[attrValue]=e.target.value;
                        });
                        break;
                }
            }
            if(attrName.indexOf("@")===0){
                this.compilerMethods(this.context,node,attrName,attrValue);
            }
        })
        this.compiler(node);
    }

    /**
     * 函数编译
     */
    compilerMethods(scope,node,attrName,attrValue){
        //获取类型
        let type=attrName.slice(1);
        let fn=scope[attrValue];
        node.addEventListener(type,fn.bind(scope));
    }
    /**
     * 编译文本节点
     */
    compilerTextNode(node){
        let text = node.textContent.trim();
        if(text){
            //把text字符串，转换为表达式
            let exp = this.parseTextExp(text);
            //添加订阅者
            //当表达式依赖的数据发生变化时
            //1.重新计算表达式的值
            //2.node.textContent给最新的值
            //即可完成Model -> View 的响应式
            new Watcher(exp,this.context,newValue=>{
                node.textContent=newValue;
            })
        }
    }

    /**
     * 该函数完成了文本到表达式的转化
     */
    parseTextExp(text){
        //匹配插值表达式正则
        let regText=/\{\{(.+?)\}\}/g;
        //分割插值表达式前后内容
        let pices =text.split(regText);
        //匹配插值表达式
        let matches=text.match(regText)
        //表达式数组
        let tokens=[];
        pices.forEach(item =>{
            if(matches&&matches.indexOf("{{"+item+"}}")>-1){
                tokens.push("("+item+")");
            }else{
                tokens.push("`" + item + "`");
            }
        });
        return tokens.join("+");
    }
}