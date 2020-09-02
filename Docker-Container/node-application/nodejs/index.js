const express = require('express');
var bodyParser = require("body-parser"); 

//create cache with node-cache
let nodeCache = require('node-cache');
let cache = new nodeCache({ stdTTL: 100, checkperiod: 600 });


const app = express();


//start app on port 3000
app.listen(3000, () => console.log('listening at 3000'));

app.set("view engine", "ejs"); 
app.set("views", __dirname + "/views"); 
app.use(bodyParser.urlencoded({ extended: false })); 


const {Pool,Client} = require('pg');
const { response } = require('express');

//Use POSTGRES_URL env for connectionString
const connectionString = process.env.POSTGRES_URL

//async function is needed for kubernetes because pods may start differently 
async function initPostgres() {
    let success = false
    //Set Cache time to 6000 seconds
    const CACHE_DURATION = 6000;
    const CACHE_KEY = 'CACHE_KEY';
    while (!success){
        try{
            //The database query will be stored in the cache and only be displayed if the cache read was successfull
            value = cache.get(CACHE_KEY);
            if (value == undefined){
                const client = new Client({
                    connectionString:connectionString
                })
                
                await client.connect()
                console.log("Verbindung hergestellt")
                // In practice here would be just queried for the last 192 entries
                // because the new data will just be inserted not updated in sense of the CR principle
                await client.query('SELECT * FROM average', (err, res) => {
                    if (err) {
                        response.end();
                        return;
                    }
                    //console.log(res.rows)
                    var myJSONString = JSON.stringify(res.rows)
                    cache.set(CACHE_KEY, myJSONString, CACHE_DURATION);
                    console.log("Cache set")
                })
            }else{
                success = true
                console.log("Cache read")
                app.get("/", (req, res) => { res.render("index", { data: value }); });
            }
        } catch{
            //If postgres is not reacheable yet try again in 1 Second
            console.log("Error connecting to Postgresql, retrying in 1 second")
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
}

initPostgres()