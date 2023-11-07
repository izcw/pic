const express = require('express');
const router = express.Router();

const pathup = 'picfile/';// 指明存储的目录
const pathjson = 'picfile/picdata.json';// 指明存储的json

const bcrypt = require("bcryptjs"); //密码验证
const jwt = require("jsonwebtoken"); //token

// 令牌验证
const SECRET = "hhbmdAcXEuY29tIiwicGFzc3dvcmQiOiJCaHp5MDQyMCIsImlhdCI6MTY4NTg4MTg2M30.uxCUGGInMAAKYRHUKBskDE3VwWkKc8";
const users = '$2a$06$8kmmHhM.hqdyKpVkzNS/H.BXz5N1UoQduLBIM80EEvOo/afNeufBO';
const pass = '$2b$10$1JhcdTVx8i32Ruw.UMq1JOTskXiL0d7rGlfhoCmAydISnKSRu5PKa';
// const pass = bcrypt.hashSync("", 6); // 加密密码
// console.log(pass, "账号或密码加密");


//登录
var getlog = 0;
router.post("/logon", (req, res) => {
    if (req.body.data.user == '' || req.body.data.user == null || req.body.data.user == undefined) return res.json({
        status: 500,
        msg: "账号不能为空",
    });

    if (req.body.data.password == '' || req.body.data.password == null || req.body.data.password == undefined) return res.json({
        status: 500,
        msg: "密码不能为空",
    });

    getlog = getlog + 1
    getlog = getlog >= 3 ? 3 : getlog
    // console.log(getlog);

    if (getlog >= 3) {
        res.json({
            status: 501,
            msg: "登录失败！账号或密码错误，30秒后重试",
            waiting: 30000
        });
        setTimeout(() => {
            getlog = 0;
        }, 30000)
    } else {
        logon(req, res)
    }
});

function logon(req, res) {
    let loginrequest = req.body.data;

    let isTrueuser = bcrypt.compareSync(loginrequest.user, users);
    let isTruepass = bcrypt.compareSync(loginrequest.password, pass);
    // console.log("验证账号密码是否正确", isTrueuser, isTruepass);

    if (isTrueuser === true && isTruepass === true) {
        const token = jwt.sign(loginrequest, SECRET);
        // console.log(token, "登录成功的token");
        res.json({
            status: 200,
            msg: "登录成功",
            token: token,
        });
        getlog = 0;
    } else {
        res.json({
            status: 500,
            msg: "登录失败！账号或密码错误",
        });
    }
}


//令牌
const verifyToken = (req, res, next) => {
    var authorization = req.headers.authorization;
    // console.log(authorization, "获取回来的toekn信息",req.headers);

    if (authorization == "Bearer token") return res.json({
        status: 500,
        msg: "这不是token,而是Bearer",
    });

    if (authorization == '' || authorization == undefined || authorization == null) {
        res.json({
            status: 500,
            msg: "请登录",
        });
    } else {
        // 解析token
        let token = jwt.verify(authorization, SECRET);
        // console.log(token, "解析token？");

        let isTrueuser = bcrypt.compareSync(token.user, users);
        let isTruepass = bcrypt.compareSync(token.password, pass);
        // console.log("验证账号密码是否正确", isTrueuser, isTruepass);

        if (isTrueuser === true && isTruepass === true) {
            // console.log("验证正确");
            next();
        } else {
            res.json({
                status: 500,
                msg: "token验证失败！token错误",
            });
        }
    }
};



// 异步读取json文件
const getJSON = function (url) {
    const promise = new Promise(function (resolve, reject) {
        // 异步操作：网络请求代码
        fs.readFile(url, (err, data) => {
            if (!err) {
                resolve({
                    "status": 200,
                    "message": url + "查询成功", "data": JSON.parse(data)
                })
            } else {
                reject(
                    {
                        "status": 500,
                        "message": url + "查询失败"
                    }
                )
            }
        })
    })
    return promise;
}

// 首页
router.get("/", verifyToken, (req, res) => {
    getJSON(pathjson)
        .then(function (data) {
            res.json({ status: 200, data: data.data, msg: "获取数据成功" });
        }, function (error) {
            // console.log(error);
            res.json({ status: 500, msg: "获取数据失败" })
        })
});


// 上传文件
const path = require('path');// 1.导入node的核心模块path
const fs = require('fs');// 2.导入方式模块，处理文件
const multer = require('multer');// 3.导入multer文件 npm i nulter
const sd = require('silly-datetime');// 4.下载时间插件，用户来处理时间格式的：npm i silly-datetime

// 上传文件中间件
// 配置multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {//配置存储的目录
        let result = file.mimetype.match(/.+(?=\/)/g)[0]; // 文件类型
        var day = sd.format(new Date(), 'YYYYMM');
        // 创建文件夹的路径
        var dir = path.join(pathup, result, day);

        if (req.query.urlname === undefined) {
            // 根据路径去生成文件夹
            mkdirsSync(dir)
            cb(null, dir)
        } else {
            cb(null, dir)
        }
    },
    filename: (req, file, cb) => {//配置上传文件的存储文件名
        var stime = Date.now();// 获取时间戳
        var exname = path.extname(file.originalname);// 获取上传文件的后缀
        var sun = sd.format(new Date(), 'DD');

        if (req.query.urlname === undefined) {
            // 第一个参数：null
            // 第二个参数，存储的文件名，将file.originalname// 指定存储的文件名 ：时间戳+后缀名
            cb(null, sun + '-' + stime + exname)
        } else {
            cb(null, req.query.urlname)
        }

    }
})
const upload = multer({ storage });// 创建一个upload

// 创建dist下生产的文件夹
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

// 上传文件
// upload.single 一整个上传 req.file.path
// upload.array 数组方式上传 req.files.path
router.post('/ingupload', verifyToken, upload.single('file'), (req, res) => {
    // console.log(req.file, "文件信息", req.file.originalname);
    req.file.originalname = Buffer.from(req.file.originalname, "latin1").toString("utf8"); // 解决文件名字中文乱码问题
    addartJson(req, res);
})


// 生成id
const uuid = require('uuid');

// 添加数据
function addartJson(req, res) {
    var datetime = sd.format(new Date(), 'YYYY-MM-DD');
    let imgurl = req.file.path.replace(/\\/g, "/");

    fs.readFile(pathjson, (err, data) => {
        if (err) return res.send(500);
        data = JSON.parse(data);
        let resultcolumn = req.file.mimetype.match(/.+(?=\/)/g)[0]; // 文件栏目 image
        let resulttype = req.file.mimetype.match(/(?<=\/).+/g)[0]; // 文件格式 png
        let exnames = path.extname(req.file.originalname).match(/(?<=\.).+/g)[0];
        let nameformat = path.basename(req.file.originalname, path.extname(req.file.originalname)); // 提取无后缀名字
        let imgurlname = path.basename(imgurl); // 提取名字

        data.datalist.unshift({
            id: uuid.v1().replace(/-/g, ''), // 去除横线-
            url: imgurl,
            urlname: imgurlname,
            date: datetime,
            name: nameformat,
            class: '',
            tag: [],
            column: resultcolumn,
            type: resulttype,
            size: ByteConversion(req.file.size),
            exname: exnames
        });
        fs.writeFile(pathjson, JSON.stringify(data), (err) => {
            if (err) return console.log("添加失败"), res.json({ status: 500, msg: "添加失败" });
            res.json({ status: 200, msg: "添加成功" })
        });
    })
}

// 字节大小转换格式
function ByteConversion(size) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (size === 1) return '1 byte';
    let l = 0, n = parseInt(size, 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    size = n.toFixed(n < 10 && l > 0 ? 1 : 0) + units[l];
    return size
}



// 删除
router.post('/delfile', verifyToken, (req, res) => {
    let pathid = req.body.data.id;
    let pathurl = req.body.data.url;

    fs.unlink(pathurl, (err, ret) => { // 删除文件
        if (err) console.log("删除文件失败,或者目录下没有此文件");

        fs.readFile(pathjson, (err, data) => { // 删除数据
            if (err) return console.log("文件删除查找失败"), res.json({ status: 500, msg: "文件删除查找失败" });
            data = JSON.parse(data);

            let Searchjud = data.datalist.filter((item) => { return item.id === pathid });
            if (Searchjud.length === 0) return res.json({ status: 200, msg: "删除失败，没有此id" });

            data.datalist = data.datalist.filter((item) => { return item.id !== pathid });
            fs.writeFile(pathjson, JSON.stringify(data), (err) => {
                if (err) return console.log("文件删除失败"), res.json({ status: 500, msg: "文件删除失败" });
                res.json({ status: 200, msg: "文件删除成功" });
            })
        })// 删除数据end

    })
})

// 删除旧的
router.post('/edituploaddel', verifyToken, (req, res) => {
    let pathurl = req.body.data.url;
    fs.unlink(pathurl, (err, ret) => { // 删除文件
        if (err) console.log("删除文件失败,或者目录下没有此文件"), res.json({ status: 500, msg: "文件删除失败" });
        res.json({ status: 200, msg: "文件删除成功" });
    })
})


// 替换新的
router.post('/editupload', verifyToken, upload.single('file'), (req, res) => {
    // console.log("编辑上传", req.query.urlname, req.query.editid, req.file);
    replaceartJson(req, res);
})


function replaceartJson(req, res) {
    fs.readFile(pathjson, (err, data) => {
        if (err) return res.send(500);
        data = JSON.parse(data);
        let resulttype = req.file.mimetype.match(/(?<=\/).+/g)[0]; // 文件格式 png
        let exnames = path.extname(req.file.originalname).match(/(?<=\.).+/g)[0];

        let repla = {
            type: resulttype,
            size: ByteConversion(req.file.size),
            exname: exnames
        }

        data.datalist.find((item, index) => {
            // console.log(req.query.editid);
            if (item.id === req.query.editid) {
                data.datalist[index].size = repla.size
            }
        })
        fs.writeFile(pathjson, JSON.stringify(data), (err) => {
            if (err) return console.log("替换失败"), res.json({ status: 500, msg: "替换失败" });
            res.json({ status: 200, msg: "替换成功" })
        });
    })
}

// 编辑
router.post('/editfile', verifyToken, (req, res) => {
    let pathid = req.body.data.id;
    let pathedit = req.body.data.data;

    fs.readFile(pathjson, (err, data) => { // 编辑数据
        if (err) return console.log("数据查找失败"), res.json({ status: 500, msg: "数据查找失败" });
        data = JSON.parse(data);

        data.datalist.find((item, index) => {
            if (item.id === pathid) {
                data.datalist[index] = pathedit
            }
        })

        fs.writeFile(pathjson, JSON.stringify(data), (err) => {
            if (err) return console.log("编辑失败"), res.json({ status: 500, msg: "编辑失败" });
            res.json({ status: 200, msg: "编辑成功" });
        })
    })// 编辑数据end
})



module.exports = router;
