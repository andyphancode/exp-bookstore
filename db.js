/** Database config for database. */


const { Client } = require("pg");
const {DB_URI} = require("./config");




try {
    let db = new Client({
        host: "/var/run/postgresql/",
        database: DB_URI    
    });
    db.connect();
    module.exports = db;
} catch {
    let db = new Client({
      connectionString : `postgresql:///${DB_URI}`
    })
    db.connect();
    module.exports = db;  
}



