// mongodb://<dbuser>:<dbpassword>@ds249233.mlab.com:49233/ticketer

const {MongoClient, ObjectID}= require("mongodb");
let URL= null;
let DB= null;

let init= (url, db) =>{
    return new Promise((resolve, reject) => {
        if(!url || !db) {
            return reject("Invalid Parameter...");
        }

        URL= url;
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject({
                    code: -1,
                    cause: `Database Error`,
                    details: `mongo : Unable to connect to mongodb " ${DB} " `,
                });
                return;
            };
            DB= client.db(db);
            process.on("exit", function() {
                client.close();
                console.log("\n\tDatabase Connection closed\n")
            });
            resolve("Database Connected...");
        });
    });
};


let insert= (collection, data)=>{
    return new Promise((resolve, reject) => {
            if(!DB) {
                reject({
                    code: -1,
                    cause: `Database Error`,
                    details: `mongo : Unable to connect to mongodb " ${DB} " `,
                });
                return;
            }
            DB.collection(collection).insert(data , (err, res) => {
                if(err) {
                    reject({
                        code: -2,
                        cause: `Internal Error`,
                        details: `mongo : Unable to insert to ${collection}`,
                    });
                    //client.close();
                    return;
                }
                //console.log(JSON.stringify(res, undefined, 2));
                if(res.result.ok) {
                    resolve(res);
                }else {
                    reject({
                        code: -3,
                        cause: `Internal Error`,
                        details: `mongo : Unable to insert to ${collection}, res.result is not ok`,
                    });
                }
            });
            //client.close();
        });
};


let insertIfNotExist= (collection, query_json, data) => {
	return new Promise((resolve, reject) => {
        if(!DB) {
            reject({
                code: -1,
                cause: `Database Error`,
                details: `mongo : Unable to connect to mongodb " ${DB} " `,
            });
            return;
        }

        DB.collection(collection).find(
                query_json
            ).toArray()
            .then(resu => {
                if(resu.length == 0) {
                    DB.collection(collection).insert(data, (err, res) => {
                        if(err) {
                            reject({
                                code: -3,
                                cause: `Internal Error`,
                                details: `mongo : Unable to Insert to mongodb.. `,
                            });
                            //client.close();
                            return;
                        } else {
                            if(res.result.ok) {
                                resolve(res);
                                //client.close();
                                return;
                            }
                            else {
                                reject({
                                    code: -4,
                                    cause: `Database Error`,
                                    details: `mongo : Unable to insert to ${collection}, res.result is not ok`,
                                });
                                //client.close();
                                return;
                            }
                        }
                    });
                } else {
                    reject({
                        code: -2,
                        cause: `Query Error`,
                        details: `mongo :  The query already exists `,
                    });
                    //client.close();
                    return;
                }
            }).catch( err => {
                reject({
                    code: -3,
                    cause: `Internal Error`,
                    details: `mongo : Unable to Insert to mongodb.. `,
                });
                //client.close();
                return;
            });
        });
};


let find= (collection, query_json) => {
    return new Promise((resolve, reject) => {
        if(!DB) {
            reject({
                code: -1,
                cause: `Database Error`,
                details: `mongo : Unable to connect to mongodb " ${DB} " `,
            });
            return;
        }

            DB.collection(collection).find(
                query_json
            ).toArray()
            .then(data => {
                resolve(data);
            }).catch(e => reject({
                code: -2,
                cause: `Internal Error`,
                details: `mongo : Unable to Find... " `,
            }));
            //client.close();
        })
};

let updateOne= (collection, query, update) => {
    return new Promise((resolve, reject) => {
        if(!DB) {
            reject({
                code: -1,
                cause: `Database Error`,
                details: `mongo : Unable to connect to mongodb " ${DB} " `,
            });
            return;
        }
            DB.collection(collection).findOneAndUpdate(query, update, {
                returnOriginal: false,
            }).then((res) =>{
                resolve(res);
                //client.close();
                return;
            }).catch(err => {
                reject({
                    code: -2,
                    cause: `Internal Error`,
                    details: `mongo : Could not find in the query" `,
                });
                //client.close();
                return;
            });
        });
};

let updateAll= (collection, query, update) => {
    return new Promise((resolve, reject) => {
        if(!DB) {
            reject({
                code: -1,
                cause: `Database Error`,
                details: `mongo : Unable to connect to mongodb " ${DB} " `,
            });
            return;
        }
            
            DB.collection(collection).updateMany(query, update, {
                returnOriginal: false,
            }).then((res) =>{
                resolve(res.result.nModified);
                //client.close();
                return;
            }).catch(err => {
                reject({
                    code: -2,
                    cause: `Internal Error`,
                    details: `mongo : Could not find in the query" `,
                });
                //client.close();
                return;
            });
        });
};

let deleteOne= (collection, query) => {
    return new Promise((resolve, reject) => {
        

            DB.collection(collection).findOneAndDelete( 
                query
            ).then(res=> {
                resolve(res);
                //client.close();
                return;
            }).catch(err => {
                reject({
                    code: -2,
                    cause: `Internal Error`,
                    details: `mongo : Could not delete as the query" `,
                });
                //client.close();
                return;
            });
        })
};

let deleteAll= (collection, query) => {
    return new Promise((resolve, reject) => {
        if(!DB) {
            reject({
                code: -1,
                cause: `Database Error`,
                details: `mongo : Unable to connect to mongodb " ${DB} " `,
            });
            return;
        }

            DB.collection(collection).deleteMany( 
                query
            ).then(res=> {
                resolve(res.result.n);
                //client.close();
                return;
            }).catch(err => {
                reject({
                    code: -2,
                    cause: `Internal Error`,
                    details: `mongo : Could not delete as the query" `,
                });
                //client.close();
                return;
            });
        })
};


module.exports= {
    init,
    insert,
    insertIfNotExist,
    find,
    updateOne,
    updateAll,
    deleteOne,
    deleteAll
}