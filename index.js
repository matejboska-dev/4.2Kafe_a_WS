const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require("mysql");
const {query, response} = require("express");

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({server});

app.use(express.static('public'));

const clients = {};

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


app.get("/", (req, res) => {


    res.send("index.ejs");


})


wss.on('connection', (ws) => {
    console.log('New client connected');

    clients[connId] = ws;
    console.log(connId);
    ws.send(JSON.stringify({type: 'init', connId: connId, response: jokes[Math.floor(Math.random() * jokes.length)]}));

    connId++;
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        const section = parsedMessage.section;

        switch (section) {
            case "order":
                saveOrder(parsedMessage.user, parsedMessage.data)
            case "task":
                processTask(parsedMessage.user, parsedMessage.data)

        }


        const {connId, request} = parsedMessage;

        console.log("incoming message from " + message);
        const client = clients[connId];

        if (client.readyState === WebSocket.OPEN && request === ":)") {
            console.log("sending a joke");
            client.send(JSON.stringify({type: 'joke', response: jokes[Math.floor(Math.random() * jokes.length)]}));
        }
    });

    // When a client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


function getAll(tablename, callback) {
    let res;
    conn.query('SELECT * FROM ' + tablename, (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error fetching users');
            return;
        }
        callback(err, results)

    });
}

function getSummaryOfDrinks(month, callback) {
    let query = "SELECT types.typ, count(drinks.ID) as pocet,people.name as osoba FROM `drinks` JOIN people on drinks.id_people=people.ID JOIN types on drinks.id_types=types.ID";
    if (month > 0 && month < 13) {
        query += " WHERE MONTH( `date` ) = " + month;
    }
    query += " group by types.typ"

    let res;
    conn.query(query, (err) => {
        if (err) {


            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error fetching users');
            return;
        }
        console.log(results);
        callback(err, results)

    });
}


function saveOrder(username, data) {
    let date_time = new Date();
    const date = date_time.getFullYear() + "-" + (date_time.getMonth() + 1) + "-" + date_time.getDate();

    conn.query("select id from Customer where username=" + username), (err, customer_id) => {
        if (err) {
            // res.status(500).send('Error fetching users');
            return;
        }

        let drinks = data.drinks;

        let query = `INSERT INTO DrinkOrder (date, customer_id, drink_id) values `;

        for (drink of drinks) {
            query += `${(i === 0) ? "" : ","}('${customer_id}','${drink.drinkId}','${drink.amount}','${date}') `
        }

        console.log(query);

        conn.query(query), (err, results) => {
            if (err) {
                //res.status(500).send('Error saving drinks');
                return;
            }
            console.log(results);
        }
    }


}


responseData = {}
responseData.terminal = {drinks: [], joined: []}
responseData.tasks = []

let date_time = new Date();

let year = date_time.getFullYear();
let month = date_time.getMonth() + 1;

conn.query("select Customer.username, Drink.name as drink_name, sum(DrinkOrder.amount) as amount from DrinkOrder inner join Drink on DrinkOrder.drink_id = Drink.id \n" +
    "inner join Customer on DrinkOrder.customer_id = Customer.id\n" +
    "where month(DrinkOrder.order_date)=" + (month) + " and year(DrinkOrder.order_date)=" + (year) + "\n" +
    "group by Customer.username, Drink.name", (err, results) => {


    results.map(a => a.username)

    for (username of [...new Set(results.map(a => a.username))]) {
        // drinks.push({username: username, drinkData: []})

        responseData.terminal.drinks[username] = []
    }

    for (data of results) {
        responseData.terminal.drinks[data.username].push({drinkName: data.drink_name, amount: data.amount})
    }

    // console.log(responseData.terminal.drinks);


    conn.query("select Customer.username from Customer where month(Customer.register_date) =" + month + " and year(Customer.register_date) =" + year, (err, results) => {
        responseData.terminal.joined = results.map(a => a.username);
        console.log(responseData)

        conn.query("select Customer.username, TaskType.task_text, TaskType.id as task_type_id from CustomerTask inner join Customer on CustomerTask.customer_id = Customer.id right join TaskType on CustomerTask.task_type_id = TaskType.id", (err, results) => {

            for (data of results)
            {
                responseData.tasks.push({"task"});
            }


        })
    })
})


function sendToCustomers(responseData)
{
    let json = JSON.stringify(responseData);

    for(client of clients)
    {
        client.send(json);
    }


}

// setInterval(() => {
//
//     let data =
//         {
//             terminal:
//                 {
//                     drinks: [],
//                     joined: []
//                 }
//
//         }
//
//
//     for (client of clients) {
//
//
//     }
// }, 20)


function processTask(username, data) {
    if (data.action === "register") {
        conn.query("insert into")
    }
}

const PORT = 8082;
server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
