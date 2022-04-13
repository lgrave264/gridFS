const express = require('express');
const app = express();
const upload = require ('express-fileupload');
const routes = [require('./routes/nav'),require('./routes/users')];

app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use(routes);

const port = 3000 || process.env.PORT;
(async () => {
    try {
        app.listen(port , () => console.log('listening on port 3000'));
    } catch (error) {console.log(error) }
})()