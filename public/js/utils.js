
function fetch_data(parms, Link) {
    let link= Link;
    if(!link) {
        link= "http://127.0.0.1:3000";
    }
    return new Promise((resolve, reject) => {
        let xhr= new XMLHttpRequest();
        let url_parms= "";
        Object.keys(parms).forEach( key => {
            url_parms+= key+"=" +parms[key]+"&";
        });
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if(this.status == 200) {
                    resolve(JSON.parse(this.responseText));
                }
                else {
                    reject(JSON.parse(this.responseText));
                }
            }
        };
        xhr.open("POST", link+"?"+url_parms, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(url_parms);
    });
}




function setCookie(cname, cvalue, ex_days) {
    var d = new Date();
    let exdays= ex_days;
    if(!ex_days) {
        ex_days= 5;
    };
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}


let notify_int= null;
function notify(msg) {
    if(!msg) {
        return;
    }
    let msg_box= document.getElementById("notify");
    if(notify_int) {
        clearInterval(notify_int);
    }
    msg_box.innerText= msg;
    msg_box.style.display= "block";
    msg_box.style.top= "7%";
    setInterval (() => {
        msg_box.style.display= "none";
        msg_box.style.top= "5%";
    }, 2000);
}