### Pic DuoYu Cloud - 图床
[官网](https://pic.duoyu.link "Pic DuoYu Cloud - 图床")


### 预览

登录页
![登录页](https://picserver.duoyu.link/picfile/image/202311/07-1699368097546.png "登录页")

首页
![首页](https://picserver.duoyu.link/picfile/image/202311/08-1699373072101.png "首页")

详情页
![首页](https://picserver.duoyu.link/picfile/image/202311/08-1699373148716.png "详情页")

### 框架
1. node.js
2. vue.js
3. express
4. jsonwebtoken
5. multer

### 使用

根目录新建`picfile`文件夹，用于存放文件资源

```python

npm i # 下载依赖
nodemon app.js # 启动

```

<br />

#### 修改密码

打开router/index.js
第10至15行

依次获取加密后的账号或密码
```javascript
const pass = bcrypt.hashSync("需要设置的账号或密码", 6); // 加密密码
console.log(pass, "账号或密码加密，打印");
```

<br />

替换
```javascript
const SECRET = "可设置为你的个人令牌，如：djsioIVOBHBKJhkbhkhHKvneHG%H4$4658*b#，可随意输入字符串，中文除外";
const users = '替换成你的账号密文';
const pass = '替换成你的密码密文';
```
