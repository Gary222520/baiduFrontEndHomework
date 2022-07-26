import Vue from "../src/index";
import fs from "fs";
import {JSDOM} from "jsdom";

test('tests',() =>{
    const fs = require("fs");
    const { JSDOM } = require("jsdom");
    document.body.innerHTML = fs.readFileSync("example/demo.html")
    const html = fs.readFileSync("example/demo.html");
    const page = new JSDOM(html)
    let obj= {
        el: '#app',
        data: {
            msg: "hello world"
        },
        methods: {
            handleClick: function () {
                this.msg="hello world"
            }
        }
    }
    document=page.window.document
    new Vue(obj)
    //测试初始化界面
    expect(document.getElementById("message").innerHTML).toBe("hello world")
    //测试单向绑定，修改msg的值
    obj.data.msg="emo"
    expect(document.getElementById("message").innerHTML).toBe("emo")
    //测试双向绑定，修改input的值
    let input=document.querySelector("input")
    input.value="message"
    let evt=document.createEvent('HTMLEvents')
    evt.initEvent("input",true,true)
    input.dispatchEvent(evt)
    expect(document.getElementById("message").innerHTML).toBe("message")
    //测试函数
    document.getElementById("click").click()
    expect(document.getElementById("message").innerHTML).toBe("hello world")
})