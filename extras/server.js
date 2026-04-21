const mysql = require ('mysql2');
const exress = require('express');
const app = exress();  
const port = 3000; 

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'drkhan1986',
    database: 'myDB'
});

connection.connect(function(err) {
    if (err) {
        console.log('error connecting: ' + err.stack);
    }else {
        console.log('connected as id ' + connection.threadId);
    }
});


connection.query('SELECT * FROM products WHERE product_name LIKE "a%"', function (error, results, fields) {
    //if (error) throw error;
    console.log(results);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});