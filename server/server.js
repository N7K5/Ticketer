const base64= false;

const URL= "mongodb://johnchakder:h67te5gcelt@ds249233.mlab.com:49233/ticketer";
const DB= "ticketer";

const express= require("express");
const {ObjectID}= require("mongodb");
const path= require("path");
const mongo= require(__dirname+"/mongo");
const utils= require(__dirname+"/utils");
const env_vars= require(__dirname+"/env_vars");


const PORT= process.env.PORT || 3000;

let app= express();

app.use(express.static(__dirname + "/../public"));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use((req, res, next) => {

    console.log(new Date().toString()+" "+ req.method);
    console.log(req.originalUrl+"\n");
    next();
});


// mongo.insert("asd", {
//     asd: "asd"
// })
// .then((res)=> {
//     console.log("res\n\n", res);
// })
// .catch((err) => {
//     console.log("err\n\n", err);
// });


// mongo.find("asd", {
// }).then(data => console.log(data));



// mongo.updateOne("asd", {
//     asd:"Updated ASD",
// }, {
//     $set: {
//         asd: "asd"
//     }
// }).then((res) => {
//     console.log("SUCCESS \n\n")
//     console.log(res);
// }).catch(err => {
//     console.log("Error \n\n");
//     console.log(err);
// });


// mongo.updateAll("asd", {
//     asd: "Updated ASD"
// }, {
//     $set: {
//                asd: "OLD asd"
//            }
// }).then(res => {
//     console.log(res);
// }).catch(err => {
//     console.log("ERR");
// })

// mongo.deleteOne("asd", {
//     asd: "OLD asd"
// }).then(res => console.log(res))
// .catch(e => console.log(e)); 

// mongo.deleteAll("asd", {
//     asd: "asd"
// }).then(res => console.log(res))
// .catch(e => console.log(e)); 


// mongo.insertIfNotExist("asd", {
//     asd: "as"
// }, {
//     pico: "asas",
//     asd: "as"
// }).then(data => console.log(data));



app.post("/register/:type", (req, res) => {
    let mail= req.param("mail");
    let pass= req.param("pass");
    let name= req.param("name");
    if(base64) {
        pass= atob(pass);
        mail= atob(mail);
        name= atob(name);
    }

    let loginType= req.params.type;
    if(loginType.toLowerCase().trim() == "seller") {
        userCollection= env_vars.seller_data;
    } else if(loginType.toLowerCase().trim() == "user") {
        userCollection= env_vars.user_data;
    } else {
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in requested URL...",
        });
    }


    /* Cheak if mail is valid */
    let mailIsValid = utils.isValidMail(mail);
    if(mail) {
        mail= mail.toLowerCase().trim();
    };

    /* cheak if pass exists than hash pass */
    let hashedPass= null;
    if(pass.length>7 && mailIsValid) {
        hashedPass= utils.hashPass(mail, pass);
    };

    /* send response */
    if(hashedPass && name && name.length>2) {
        mongo.find(userCollection, {
            mail
        }).then(resArr => {
            if(resArr.length == 0) {
                mongo.insert(userCollection, {
                    mail,
                    pass: hashedPass,
                    name,
                    balance: 0,
                }).then( ()=> {
                    res.send({
                        code: 1,
                        status: "Success",
                        details: "Registration Successfull.",
                    });
                })
            } else {
                res.send({
                    code: -1,
                    status: "Error",
                    details: "The Mail id Already Exists... ",
                })
            }
        }).catch(() => {
            res.statusCode= 500;
            res.send({
                code: -3,
                status: "Internal Error",
                details: "Something happend while connection to DataBase...",
            });
        })
    } else {
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        });
    }
});




app.post("/login/:type", (req, res) => {
    let mail= req.param("mail");
    let pass= req.param("pass");
    if(base64) {
        pass= atob(pass);
        mail= atob(mail);
    }

    console.log(mail, pass);

    let loginType= req.params.type;
    let tokenCollection= null;
    let userCollection= null;

    if(loginType.toLowerCase().trim() == "seller") {
        tokenCollection= env_vars.seller_login_tokens;
        userCollection= env_vars.seller_data;
    } else if(loginType.toLowerCase().trim() == "user") {
        tokenCollection= env_vars.user_login_tokens;
        userCollection= env_vars.user_data;
    } else {
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in requested URL...",
        });
    }

    if(mail) {
        mail= mail.toLowerCase().trim();
    }

    if(mail && pass) {
        mongo.find(userCollection, {
            mail,
            pass: utils.hashPass(mail, pass),
        }).then((data) => {
            if(data.length>0) { // registered user..
                let orig_id= data[0]._id.toString();
                let token= utils.makeRandomString(env_vars.token_length);

                mongo.find(tokenCollection, {
                    orig_id,
                }).then(login_data => {
                    if(login_data.length != 0) { // already token given, so update
                        mongo.updateAll(tokenCollection, {
                            orig_id,
                        }, {
                            $set:{
                                token
                            }
                        }).then(data => {
                            res.send({
                                code: 1,
                                status: "success",
                                details: "Updated to New Token",
                                token,
                            });
                        }).catch(e => {
                            res.send({
                                code:-2,
                                status: "Internal Error",
                                details: "error while updating previous token...",
                            })
                        });
                    } else { // give him new token
                        mongo.insert(tokenCollection, {
                            orig_id,
                            token,
                        }).then(data => {
                            res.send({
                                code: 1,
                                status: "success",
                                details: "New Token Generated",
                                token,
                            });
                        }).catch(e => {
                            res.send({
                                code:-2,
                                status: "Internal Error",
                                details: "error while storing new token...",
                            })
                        });
                    }
                }).catch(e => {
                    res.statusCode= 500;
                    res.send({
                        code: -2,
                        status: "Internal Error",
                        details: "error while searching for pervious tokens...",
                    })
                })
            } else { // Not a registered user..
                res.statusCode= 400;
                res.send({
                    code: -1,
                    status: "Bad Request",
                    details: "Couldnot Varify Email or Password..",
                });
            }
        }).catch(e => {
            res.send(e);
        })
    } else { // error in params
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        });
    }
});




app.post("/seller/addticket", (req, res) => {
    let token= req.param("token");
    let event_name= req.param("event").toLowerCase().trim();
    let details= req.param("details") || " ";
    let no_of_ticket= parseInt(req.param("no_of_ticket"));
    let expires= parseInt(req.param("expires"));
    let cost= parseInt(req.param("cost"));

    let timeStamp = Math.round((new Date()).getTime());



    if(token.length!= env_vars.token_length || event_name.length<2 || no_of_ticket<0 || expires<timeStamp || isNaN(cost)) {
        res.statusCode= 400;
        if(expires<timeStamp) {
            console.log(`timeastamp problem.. current ${timeStamp} expires ${expires}`);
        }
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        });
        return;
    }

    mongo.cheakIfValidToken(env_vars.seller_login_tokens, token)
    .then(valid_user => {
        return mongo.find(env_vars.seller_data, {
            _id: ObjectID(valid_user._id),
        })
    })
    .then(user_data => {
        return mongo.insert(env_vars.seller_ticket_details, {
            event_name,
            created_by: user_data[0].name.toLowerCase().trim(),
            details,
            no_of_ticket,
            avail_tickets: no_of_ticket,
            creator_id: user_data[0]._id.toString(),
            expires,
            cost
        })
    })
    .then(inserted => {
        res.send({
            code: 1,
            status: "Success",
            details: `${no_of_ticket} Tickets were added...`,
        })
    })
    .catch(e => {
        res.send({
            code: -1,
            status: "Invalid Token",
            details: "Session has Expired.. Login again..",
            //error: e,
        });
    });

});



app.post("/getavailticket", (req, res) => {
    let expires= parseInt(req.param("expires"));
    let created_by= req.param("created_by");
    let event_name= req.param("event_name");

    let search_query= {};
    if(expires) {
        search_query.expires= expires;
    }
    if(created_by) {
        search_query.created_by= created_by.toLowerCase().trim();
    }
    if(event_name) {
        search_query.event_name= event_name.toLowerCase().trim();
    }

    mongo.find(env_vars.seller_ticket_details, search_query)
    .then(ticket_array => {
        let res_arr= [];
        for(item of ticket_array) {
            res_arr.push({
                id: item._id.toString(),
                event_name: item.event_name,
                created_by: item.created_by,
                details: item.details,
                no_of_ticket: item.no_of_ticket,
                avail_tickets: item.avail_tickets,
                expires: item.expires,
                cost: item.cost,
            });
        }
        res.send({
            code: 1,
            status: "Success",
            details: `${ticket_array.length} events were found...`,
            events: res_arr,
        });
        return ;
    }).catch(e => {
        res.send({
            code: -2,
            status: "DB Error",
            details: "Unable to search for tickets...",
        });
        return;
    })
});



app.post("/user/buyticket", (req, res) => {
    let token= req.param("token");
    let ticketId= req.param("id");
    let total_buys= parseInt(req.param("no"));

    if(!total_buys || isNaN(total_buys) || total_buys<1) {
        total_buys= 1;
    }

    if(!token || !ticketId || !total_buys) {
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        });
        return;
    }

    mongo.cheakIfValidToken(env_vars.user_login_tokens, token)
    .then(valid_user => {
        return mongo.find(env_vars.user_data, {
            _id: ObjectID(valid_user._id),
        })
    })
    .then(user_data => {
            mongo.find(env_vars.seller_ticket_details, {
                _id: ObjectID(ticketId),
            })
            .then(ticket_arr => {
                if(ticket_arr.length<1 || user_data.length<1) {
                    return res.send({
                        code: -2,
                        status: "Invalid request",
                        details: "Tickets not found... Try Again",
                    });
                }
                // let all_data= {
                //     user_data,
                //     ticket_arr
                // }
                // res.send(all_data);
                // return ;
                let total_cost= total_buys* parseInt(ticket_arr[0].cost);
                if(user_data[0].balance> total_cost) {
                    // * reduce balance and add to baught ticket *
 
                    baught_tickets= [];
                    if(user_data[0].baught_tickets) {
                        baught_tickets= user_data[0].baught_tickets;
                    }
                    baught_tickets.push({
                        transaction_id: utils.makeRandomString(12),
                        ticket: ticket_arr[0],
                        no_of_ticket: total_buys,
                        time: Math.round((new Date()).getTime()),
                    })
                    mongo.updateOne(env_vars.user_data, {
                        _id: ObjectID(user_data[0]._id),
                    }, {
                        $set: {
                            baught_tickets
                        },
                        $inc: {
                            balance: -(total_cost),
                        }
                    })
                    // * increase seller's balance *
                    .then(nUpdated => {
                        return mongo.updateOne(env_vars.seller_data, {
                            _id: ObjectID(ticket_arr[0].creator_id)
                        }, {
                            $inc: {
                                balance: total_cost,
                            },
                        })
                    })
                    // * Decrease no of available tickets *
                    .then(nUpdated => {
                        return mongo.updateOne(env_vars.seller_ticket_details, {
                            _id: ticket_arr[0]._id,
                        }, {
                            $inc: {
                                avail_tickets: -(total_buys),
                            }
                        })
                    })
                    .then(nUpdated => {
                        res.send({
                            code: 1,
                            status: "Success",
                            details: `Purchesed ${total_buys} Ticket(s)`,
                        })
                        return ;
                    })
                    .catch(e => {
                        res.send({
                            code: -2,
                            status: "Internal Error",
                            details: "Error while execution chained queries.. This is BAD...",
                        })
                    })
                    
                } else {
                    res.send({
                        code: -2,
                        status: "Unable to buy",
                        details: "Does Not have enough balance... reacharge your account",
                    });
                    return ;
                }
            })
            .catch(e => {
                res.send({
                    code: -2,
                    status: "Invalid request",
                    details: "Invalid Ticket ID... Try Again",
                });
            })
    })
    .catch(e => {
        res.send({
            code: -1,
            status: "Invalid Token",
            details: "Session has Expired.. Login again..",
            //error: e,
        });
    })
});


app.post("/addbalance/:type", (req, res) => {
    let loginType= req.params.type.trim().toLowerCase();
    let token= req.param("token");
    let balance= parseInt(req.param("bal"));
    let token_collection, data_collection;

    if(loginType== "seller") {
        token_collection= env_vars.seller_login_tokens;
        data_collection= env_vars.seller_data;
    } else if(loginType == "user") {
        token_collection= env_vars.user_login_tokens;
        data_collection= env_vars.user_data;
    } else {
        res.statusCode= 400;
        res.send ({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        })
        return;
    }
    if(balance<1) {
        res.send ({
            code: -3,
            status: "Bad Request",
            details: "Invalid Balance...",
        });
        return;
    }

    mongo.cheakIfValidToken(token_collection, token)
    .then(valid_user => {
        return mongo.updateOne(data_collection, {
            _id: ObjectID(valid_user._id),
        }, {
            $inc: {
                balance,
            }
        })
    })
    .then(done => {
        res.send({
            code: 1,
            status: "Success",
            details: `Recharge of ${balance} Successfull..`,
        });
        return ;
    })
    .catch( e => {
        res.send({
            code: -1,
            status: "Invalid Token",
            details: "Session has Expired.. Login again..",
            //error: e,
        });
    });

});


app.post("/profile/:type", (req, res) => {
    token= req.param("token");
    let token_collection, data_collection;

    let loginType= req.params.type.trim().toLowerCase();

    if(loginType== "seller") {
        token_collection= env_vars.seller_login_tokens;
        data_collection= env_vars.seller_data;
    } else if(loginType == "user") {
        token_collection= env_vars.user_login_tokens;
        data_collection= env_vars.user_data;
    } else {
        res.statusCode= 400;
        res.send ({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        })
        return;
    }

    mongo.cheakIfValidToken(token_collection, token)
    .then(valid_user => {
        return mongo.find(data_collection, {
            _id: ObjectID(valid_user._id)
        })
    })
    .then(user_arr => {
        if(loginType== "seller") {
            res.send({
                code: 1,
                status: "Success",
                details: "fetched Data Successfully",
                data: {
                    name:user_arr[0].name,
                    mail: user_arr[0].mail,
                    balance: user_arr[0].balance,
                }
            })
            return;
        }
        else {
            res.send({
                code: 1,
                status: "Success",
                details: "fetched Data Successfully",
                data: {
                    name:user_arr[0].name,
                    mail: user_arr[0].mail,
                    balance: user_arr[0].balance,
                    baught_tickets: user_arr[0].baught_tickets,
                }
            })
            return;
        }
    })
    .catch(e => {
        res.send({
            code: -1,
            status: "Invalid Token",
            details: "Session has Expired.. Login again..",
            //error: e,
        });
    })
});



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/../public/index.html"));
})





mongo.init(URL, DB)
.then((res) => {
    console.log("\n\t",res);
    app.listen(PORT, () => {
        console.log(`\tListening on PORT ${PORT}\n\n`);
    });
})
.catch(e => {
    console.log(e);
})



