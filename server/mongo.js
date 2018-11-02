// mongodb://<dbuser>:<dbpassword>@ds249233.mlab.com:49233/ticketer

const {MongoClient, ObjectID}= require("mongodb");

const URL= "mongodb://johnchakder:h67te5gcelt@ds249233.mlab.com:49233/ticketer";
const DB= "ticketer";

let insert= (collection, data)=>{
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tError while Connecting to Mongodb\n\n`);
                return;
            };
            const db= client.db(DB);
            db.collection(collection).insert(data , (err, res) => {
                if(err) {
                    reject(`\n\n\tUnable To Insert to ${collection}..\n\n`);
                    return;
                }
                //console.log(JSON.stringify(res, undefined, 2));
                if(res.result.ok) {
                    resolve(res);
                }else {
                    reject(res);
                }
            });
            client.close();
        });
    });
};


let insertIfNotExist= (collection, query_json, data) => {
	return new Promise((resolve, reject) => {
		
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tError while Connecting to Mongodb\n\n`);
                return;
            };
            const db= client.db(DB);

            db.collection(collection).find(
                query_json
            ).toArray()
            .then(data => {
                if(data.length == 0) {
                    db.collection(collection).insert(data, (err, res) => {
                        if(err) {
                            reject("\n\n Unable to insert \n\n");
                            client.close();
                            return;
                        } else {
                            if(res.result.ok) {
                                resolve(res);
                                client.close();
                                return;
                            }
                            else {
                                reject(res);
                                client.close();
                                return;
                            }
                        }
                    })
                } else {
                    reject("\n\n Already exists \n\n");
                    client.close();
                }
            }).catch( err => {
                reject(err);
                client.close();
                return;
            });
        });
	});
};


let find= (collection, query_json) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tUnable To Connect..\n\n`);
                return;
            };
            const db= client.db(DB);

            db.collection(collection).find(
                query_json
            ).toArray()
            .then(data => {
                resolve(data);
            }).catch(e => reject(e));
            client.close();
        })
    });
};

let updateOne= (collection, query, update) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tUnable To Connect..\n\n`);
                return;
            };
            const db= client.db(DB);
        
            db.collection(collection).findOneAndUpdate(query, update, {
                returnOriginal: false,
            }).then((res) =>{
                resolve(res);
                client.close();
                return;
            }).catch(err => {
                reject(err);
                client.close();
                return;
            });
        });
    });
};

let updateAll= (collection, query, update) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tUnable To Connect..\n\n`);
                return;
            };
            const db= client.db(DB);
        
            db.collection(collection).updateMany(query, update, {
                returnOriginal: false,
            }).then((res) =>{
                resolve(res.result.nModified);
                client.close();
                return;
            }).catch(err => {
                reject(err);
                client.close();
                return;
            });
        });
    });
};

let deleteOne= (collection, query) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tUnable To Connect..\n\n`);
                return;
            };
            const db= client.db(DB);

            db.collection(collection).findOneAndDelete( 
                query
            ).then(res=> {
                resolve(res);
                client.close();
                return;
            }).catch(err => {
                reject(err);
                client.close();
                return;
            });
        })
    })
};

let deleteAll= (collection, query) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect( URL ,{useNewUrlParser: true}, (err, client) => {
            if(err) {
                reject(`\n\n\tUnable To Connect..\n\n`);
                return;
            };
            const db= client.db(DB);

            db.collection(collection).deleteMany( 
                query
            ).then(res=> {
                resolve(res.result.n);
                client.close();
                return;
            }).catch(err => {
                reject(err);
                client.close();
                return;
            });
        })
    })
};


module.exports= {
    insert,
    insertIfNotExist,
    find,
    updateOne,
    updateAll,
    deleteOne,
    deleteAll
}