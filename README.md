# Ticketer, A ticket booking application as E.Com. project


## routs for rest server (ALL ROUTS ARE POST) :--

### REGISTER:
###### Returns a json with "status: 1" when succeed, or other status code with a "details: error_msg"
#### /register/seller : Register a new seller
#####    parameters (POST):-
                mail: eMail Address (needs to be valid)
                pass: Password (should be at least 8 chars long)
                name: Name of Seller (can be anything in UTF-8)

#### /register/user : Register a new seller
#####    parameters (POST):-
                mail: eMail Address (needs to be valid)
                pass: Password (should be at least 8 chars long)
                name: Name of User (can be anything in UTF-8)



### login:
###### Returns a json with "status: 1" with a login token when succeed, or other status code with a "details: error_msg"
#### /login/seller : login for seller
#####    parameters (POST):-
                mail: eMail Address 
                pass: Password 

#### /login/user : login for seller
#####    parameters (POST):-
                mail: eMail Address 
                pass: Password 



### ADD Ticket (For Seller):
###### return a json with "status: 1" when succeed, or other status code with a "details: error_msg"
#### /seller/addticket: 
#####    parameters (POST):-
                token: token when logged in
                event_name: Name of Event
                details: details of event
                no_of_ticket: No of tickets to be added
                expires: expire Date of event (Should be UNIX Timestamp)
                cost: Cost of each ticket


                
### Search a Ticket (For user) (Need not t be logged in):
###### return a json with "status: 1" and "event: array of event JSON" when succeed, or other status code with a "details: error_msg"
#### /getavailticket:
#####    parameters (POST):-
                expires: expire date of ticket (Not mandatory)
                cteated_by: seller name of ticket (Not mandatory)
                event_name: Event name of ticket (Not mandatory)



### Buy Ticket (For User) :
###### return a json with "status: 1" when succeed, or other status code with a "details: error_msg"
#### /user/buyticket:
#####    parameters (POST):-
                token: token when logged in
                id: id of a perticular ticket (can be found via /getavailticket route)
                no: no of ticket to buy



### Add Balance :
###### return a json with "status: 1" when succeed, or other status code with a "details: error_msg"
#### /addbalance/user or /addbalance/seller:
#####    parameters (POST):-
                token: token when logged in
                bal: Balance to add



### Get Profile DATA :
###### return a json with "status: 1" and "data: JSON object of user data" when succeed, or other status code with a "details: error_msg"
#### /profile/user or /profile/seller
#####    parameters (POST):-
                token: token when logged in