const URL= "mongodb://johnchakder:h67te5gcelt@ds249233.mlab.com:49233/ticketer";
const DB= "ticketer";

const express= require("express");
const mongo= require(__dirname+"/mongo");
const utils= require(__dirname+"/utils");


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



app.post("/seller/register", (req, res) => {
    let mail= req.param("mail");
    let pass= req.param("pass");
    let name= req.param("name");

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
        mongo.find("seller", {
            mail
        }).then(resArr => {
            if(resArr.length == 0) {
                mongo.insert("seller", {
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




app.post("/seller/login", (req, res) => {
    let mail= req.param("mail");
    let pass= req.param("pass");

    if(mail) {
        mail= mail.toLowerCase().trim();
    }

    if(mail && pass) {
        mongo.find("seller", {
            mail,
            pass: utils.hashPass(mail, pass),
        }).then((data) => {
            if(data.length>0) { // registered user..
                let orig_id= data[0]._id.toString();
                let token= utils.makeRandom(12);

                mongo.find("login_tokens", {
                    orig_id,
                }).then(login_data => {
                    if(login_data.length != 0) { // already token given, so update
                        mongo.updateAll("login_tokens", {
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
                        mongo.insert("login_tokens", {
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
                    details: "Couldnot Varify Email..",
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



