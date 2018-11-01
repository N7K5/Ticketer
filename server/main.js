
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
//     console.log(res);
// })
// .catch((err) => {
//     console.log(err);
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



app.post("/seller/register", (req, res) => {
    let mail= req.param("mail");
    let pass= req.param("pass");
    let name= req.param("name");

    /* Cheak if mail is valid */
    let mailExp= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let mailIsValid = false;
    if(mail) {
        mail= mail.toLowerCase().trim();
        mailIsValid= mailExp.test(String(mail))?true:false;
        
    };

    /* cheak if pass exists than hash pass */
    let hashedPass= null;
    if(pass.length>7 && mailIsValid) {
        hashedPass= utils.MD5(mail+pass);
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
    }
    else {
        res.statusCode= 400;
        res.send({
            code: -2,
            status: "Bad Request",
            details: "Error in POST parameters...",
        });
    }
});




app.listen(PORT, () => {
    console.log(`\n\n\tListening on PORT ${PORT}\n\n`);
});



