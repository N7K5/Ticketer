const base64= false;

const URL= "mongodb://johnchakder:h67te5gcelt@ds249233.mlab.com:49233/ticketer";
const DB= "ticketer";

const express= require("express");
const {ObjectID}= require("mongodb");
const mongo= require(__dirname+"/mongo");
const utils= require(__dirname+"/utils");
const env_vars= require(__dirname+"/env_vars");


const PORT= process.env.PORT || 3000;

let app= express();

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
    let event_name= req.param("event").toLocaleLowerCase().trim();
    let details= req.param("details") || " ";
    let no_of_ticket= parseInt(req.param("no_of_ticket"));
    let expires= parseInt(req.param("expires"));

    let timeStamp = Math.round((new Date()).getTime());



    if(token.length!= env_vars.token_length || event_name.length<2 || no_of_ticket<0 || expires<timeStamp) {
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
            error: e,
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
        search_query.event_name= event_name.toLocaleLowerCase().trim();
    }

    mongo.find(env_vars.seller_ticket_details, search_query)
    .then(ticket_array => {
        let res_arr= [];
        for(item of ticket_array) {
            res_arr.push({
                event_name: item.event_name,
                created_by: item.created_by,
                details: item.details,
                no_of_ticket: item.no_of_ticket,
                avail_tickets: item.avail_tickets,
                expires: item.expires,
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



