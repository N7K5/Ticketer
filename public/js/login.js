
/* 
    current mode can be-
    1 for sign in as user
    2 for sign up as user
    3 for sign in as seller
    4 for sign up as seller
*/
var currentMode= 1;

const LOGIN_S= "http://127.0.0.1:3000/login/seller";

let btn_sign_in= document.getElementById("btn_sign_in");

let data_mail= document.getElementById("d_mail");
let data_pass= document.getElementById("d_pass");
let data_name= document.getElementById("d_name");

btn_sign_in.addEventListener("click", () => {
    let d_m= data_mail.value;
    let d_p= data_pass.value;
    let d_n= data_name.value;
    switch(currentMode) {
        case 1:
            fetch_data({
                mail: d_m,
                pass: d_p,
            }, LOGIN_S)
            .then(res => {
                if(res.code) {
                    if(res.code== 1) {
                        setCookie("token", res.token);
                        notify(res.details);
                    } else if(res.details) {
                        notify(res.details);
                    }
                }
                else {
                    notify(res);
                }
            })
            .catch(e => {
                console.log(e);
            })
    };

}, false);