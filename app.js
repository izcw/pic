const express = require('express');
const app = express();
const router = require('./router/');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

// 使用静态资源
app.use('/picfile/', express.static('./picfile/'))


app.use(router);

app.listen(7060, () => {
    console.log("服务器：http://127.0.0.1:7060");
})


