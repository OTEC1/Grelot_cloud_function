import * as functions from "firebase-functions";
import { admin, db } from "../config/firebase";
import { firestore } from "firebase-admin";
import * as bycrypt from 'bcryptjs'
import axios from "axios";
var Pushy = require('pushy');
require('dotenv').config()



//grelot function start
type member = {
    data:string,
}

type Payload ={
    User:{
        to:string
    }
    payload:{
        id: string,
        email:string,
        item:string,
        pic:string,
    },
     options: {
        notification: {
            badge: number,
            sound: string,
            id: string,
            email:string,
            item:string,
            pic:string,
            body:string,
        },
    };
}




type GetDatas = {
    Client: {
        doc_id:string,
        email:string,
    },
    ClientAction: {
        thumb: number,
        image: string,
    }
}




type  Newuser = {

    User:{
        Usertoken:string,
        businessaddress:string,
        businessname:string,
        devicetokeen:string,
        email:string,
        img_url:string,
        usertype:string,
        whatappnumber:string,
        password:string,
        doc_id:string,
    }
}



export const Grelot_lock = functions.https.onRequest(async (request,response) => {
        try{
           let intake =  {"p1":process.env.REACT_APP_P1, "p2":process.env.REACT_APP_P2, "p3":process.env.REACT_APP_P4}
               response.status(200).send(intake);
        }catch (err) {
              response.status(400).send(`Error Occurred ${err as Error}`)
        }
})


export  const records = functions.https.onRequest(async (request, response) => {
            let e:member = request.body;
             const citiesRef =  db.collection(process.env.REACT_APP_VENDORPOST!).doc(e.data);
             const service =  (await citiesRef.get()).data();

             response.json({
                message: service
            })
})




export  const thumbs = functions.https.onRequest(async (request, response) => {
       
            let e:GetDatas = request.body;
            const data =  db.collection(process.env.REACT_APP_VENDORPOST!).doc(e.Client.doc_id).collection(process.env.REACT_APP_REACTION!).doc(e.Client.doc_id); 
             if(!(await data.get()).exists)
                 data.set(e);
            else
                data.update("ClientAction.thumb", firestore.FieldValue.increment(e.ClientAction.thumb))

               response.json({
                message: e.ClientAction.thumb
            })
})




export const listofproducts = functions.https.onRequest(async (request, response) => {
        let list = ['Ad Category','Damax', 'Canvas material', 'Cutain for shirt', 'Cutain for House', 'Bridal satin', 
                    'Douches', 'Tick fringe material', 'Zucuba', 'Lycra', 'Vevelt', 'Crepe','Chiffon',' Stretching  Slik', 'Stretching tafeta'];
                     
         response.json({
            message:list
        })
})




export const listofUserAgeGrade = functions.https.onRequest(async (request, response) => {

        let list = ['Target audience','All', 'male',  'female','Both male and female', 'Elderly female','Elderly male','Both Elderly male and female','male kids','female kid','Both kids male and female'];

         response.json({
            message:list
        })
})



var PUSHYAPI = new Pushy(process.env.PUSHY_GRELOT_KEY);
export const Notificationpush = functions.https.onRequest(async (request, response) => {
     let e:Payload = request.body   
     PUSHYAPI.sendPushNotification(e.payload, e.User.to, e.options,function (err: any, id:any){
     if(err){
     response.json({
            message: "Error Occurred "+err
        })
     }
     
      response.json({
            message: "Sent  Succesfully  to "+id
        })
      })
})





export  const  pushyapi = functions.https.onRequest(async (request, respones) => {
       let e: member = request.body;
       let res;
       if(e.data  === "1")
           res = process.env.PUSHY_GRELOT_KEY;
         respones.json({
            message: res
        })
})




export const Sign_up_new_user = functions.https.onRequest(async(req,res) => {
        try{
            let user: Newuser = req.body
            admin.auth()
                  .createUser({
                            email: user.User.email,  
                            emailVerified:false,
                            phoneNumber:user.User.whatappnumber,
                            password:user.User.password,
                            displayName: user.User.businessname,
                            disabled:false,

                        }).then(async (useRecord) => {

                                user.User.Usertoken = useRecord.uid!;
                              
                                let docs = db.collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!)
                                            .doc(user.User.usertype)
                                              .collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc();

                                user.User.doc_id = docs.id;
                                user.User.password = await bycrypt.hash(user.User.password, 12)
                                docs.set(user);

                                  res.json({
                                    message: user.User.Usertoken ? "Account created " : "Error creating user !"            
                            })
                         })
                            .catch(err => {

                                  res.json({
                                    message: err as Error           
                            })
                            })
                    
          }catch(err){

             res.json({
                message: err as Error
            })
         }
})






export const Paid_cart_uploaded = functions.https.onRequest(async(req,res) => {

  
})



 
export const  UserlocationPhoneNumber = functions.https.onRequest(async(req,response) => {         
    let card:any;   
     card = {
        method: 'GET',
        url: process.env.IPDATA_END!+process.env.IPDATA!,
      };

      let data = await axios.request(card);    
      const res = await data.data;
        response.json({
            message:res
     })
})

