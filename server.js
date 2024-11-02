const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require("mysql");


// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({server});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

const clients = [];

let connId = 0;


const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "coffee",
    port: 3306
});

conn.connect(function (err) {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
});

function getUsernamePasswordFromAuth(auth) {
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    //const [username, password] = credentials.split(':');
    return credentials.split(':');
}

function getSqlDate() {
    let date_time = new Date();
    return date_time.getFullYear() + "-" + (date_time.getMonth() + 1) + "-" + date_time.getDate();
}

app.get("/", (req, res) => {
    res.render("customer_auth");
})


app.get("/getAllDrinks", (req, res) => {

    conn.query("SELECT * FROM drink", (err, results) => {
        res.json(results);
    })
})

app.get("/getUntakenTasks", (req, res) => {

    conn.query("\n" +
        "select * from TaskType where id not in (select CustomerTask.task_type_id from CustomerTask)", (err, results) => {
        res.json(results);
    })
})


app.post("/register", (req, res) => {

    conn.query("select count(*) as amount from Customer where username = ?", [req.body.username], (err, result) => {

        if (result[0].amount !== 0) {
            res.status(401).send("username exists.");
            return;
        }

        conn.query("insert into Customer(username, password, register_date) values(?,?,?)", [req.body.username, req.body.password, getSqlDate()], (err, result) => {
            res.redirect("/customer?username="+username);
        })
    })
})


app.get("/login", (req, res) => {


    conn.query("select id as customer_id from Customer where username=? and password =?", [req.query.username, req.query.password], (err, results) => {

        //res.json(customer_id);
        // res.json(cookieEncrypter.encryptCookie(customer_id.toString(),  {algorithm: "aes256", key:secretKey}));
        //res.cookie('customer_id', customer_id, cookieParams).send("customer_auth.ejs");
        //console.log(customer_id);

        let id = results[0].customer_id;
        res.cookie("customer_id", id).redirect("/customer?username="+req.query.username);

    });
})



app.get("/customer", (req, res) => {

    console.log(req.query.username);
    res.render("customer_page", {username: req.query.username});
})


wss.on('connection', (ws) => {
    console.log('New client connected');
    let username =
        clients[connId] = ws;
    console.log(connId);
    ws.send(JSON.stringify({type: 'init', connId: connId}));

    connId++;
    ws.on('message', (message) => {



        const parsedMessage = JSON.parse(message);


        let ws_data = parsedMessage.ws_data;
        const customer_id = ws_data.customer_id;

        const section = ws_data.section;

        console.log(section);
        switch (section) {
            case "order":
                saveOrder(customer_id, ws_data.data)
                break;
            case "task":
                processTask(customer_id, ws_data.data)
                break;

        }


        // const {connId, request} = parsedMessage;
        //
        // console.log("incoming message from " + message);
        // const client = clients[connId];
        //
        // if (client.readyState === WebSocket.OPEN && request === ":)") {
        //     console.log("sending a joke");
        //     client.send(JSON.stringify({type: 'joke', response: jokes[Math.floor(Math.random() * jokes.length)]}));
        // }
    });

    // When a client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


function saveOrder(customer_id, data) {

    let drinks = data.drinks;

    let query = `INSERT INTO DrinkOrder (customer_id, drink_id, amount, order_date) values `;

    let i = 0;
    for (drink of drinks) {

        if(drink.amount != 0)
        {
            console.log(drink.amount);
            query += `${(i === 0) ? "" : ","}('${customer_id}','${drink.drink_id}','${drink.amount}','${getSqlDate()}') `;
            i++;
        }
    }

    console.log(query);

    conn.query(query), (err, results) => {
        if (err) {
            res.status(500).send('Error saving drinks');
            return;
        }
        console.log(results);
    }


}

function processTask(customer_id, data) {
    if (data.action === "register") {
        conn.query("insert into CustomerTask (customer_id, task_type_id) values (null,?)", [data.task_type_id], (err, results) => {

        })
    } else if (data.action === "take") {
        conn.query("update CustomerTask set customer_id = ? where task_type_id = ?", [customer_id, data.task_type_id], (err, results) => {

        })
    } else if (data.action === "complete") {
        conn.query("delete from CustomerTask where customer_id = ? and task_type_id = ?", [customer_id, data.task_type_id], (err, results) => {

        })


    }}

    function generateResponseData() {
        responseData = {}
        responseData.terminal = {drink_data: [], joined: []}
        responseData.tasks = []

        let date_time = new Date();

        let year = date_time.getFullYear();
        let month = date_time.getMonth() + 1;

        conn.query("select Customer.username, Drink.name as drink_name, sum(DrinkOrder.amount) as amount from DrinkOrder inner join Drink on DrinkOrder.drink_id = Drink.id \n" +
            "inner join Customer on DrinkOrder.customer_id = Customer.id\n" +
            "where month(DrinkOrder.order_date)=? and year(DrinkOrder.order_date)=?\n" +
            "group by Customer.username, Drink.name", [month, year], (err, results) => {


            results.map(a => a.username)


            drinks = [];
            for (username of [...new Set(results.map(a => a.username))]) {
                // drinks.push({username: username, drinkData: []})

                drinks[username] = []
                //console.log(username)
                //responseData.terminal.drinks[username] = []
            }

            for (data of results) {
                // responseData.terminal.drinks[data.username].push({drinkName: data.drink_name, amount: data.amount})

                drinks[data.username].push({drink_name: data.drink_name, amount: data.amount})
            }


            for (key of Object.keys(drinks)) {
                responseData.terminal.drink_data.push(
                    {
                        username: key,
                        data: drinks[key]
                    })

            }

            conn.query("select Customer.username from Customer where month(Customer.register_date) =? and year(Customer.register_date) =?", [month, year], (err, results) => {
                responseData.terminal.joined = results.map(a => a.username);

                conn.query("select Customer.username, TaskType.task_text, TaskType.id as task_type_id from CustomerTask left join Customer on CustomerTask.customer_id = Customer.id inner join TaskType on CustomerTask.task_type_id = TaskType.id", (err, results) => {

                    for (data of results) {
                        responseData.tasks.push({task_text: data.task_text, username: data.username});
                    }


                    sendToCustomers(responseData);
                    // console.log(JSON.stringify(responseData, null, 2));
                })
            })
        })
    }

    function sendToCustomers(responseData) {
        let json = JSON.stringify(responseData);
        for (client of clients) {
            client.send(json);
        }
    }

    setInterval(() => {
        generateResponseData();
    }, 2000)


//generateResponseData();

//console.log(getSqlDate())

    const PORT = 8082;
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    });
