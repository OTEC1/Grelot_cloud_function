import * as functions from "firebase-functions";
import { admin, db } from "../config/firebase";
import { auth, firestore } from "firebase-admin";
import * as bycrypt from 'bcryptjs'
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



type PaymentModel = {
    UserInvestment:{
        amount:number,
        user: string,
        status: boolean,
        timestamp:any
    }
}

type  Newuser = {
    User:{
        usertoken:string,
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



type ExistingUser = {
    User:{
        email:string,
        passwordhash:string,
        usertype:string
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
                    'Douches', 'Tick fringe material', 'Zucuba', 'Lycra', 'Vevelt', 'Crepe','Chiffon',' Stretching  Slik', 'Stretching tafeta','Lace'];
                     
         response.json({
            message:list
        })
})




export const listofUserAgeGrade = functions.https.onRequest(async (request, response) => {

        let list = ['Target audience','All', 'male',  'female','Both male and female', 'Elderly female','Elderly male','Both Elderly male and female','male kids','female kids','Both kids male and female'];

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
     
          let user: Newuser = req.body
             admin.auth()
                    .createUser({
                            email: user.User.email,  
                            emailVerified:false,
                            phoneNumber:user.User.whatappnumber,
                            password:user.User.password,
                            displayName: user.User.usertype,
                            disabled:false,
                        }).then(async (useRecord) => {

                                user.User.usertoken = useRecord.uid!;
                                let docs = db.collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc(user.User.usertype).collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc(useRecord.uid!);
                                user.User.doc_id = docs.id;
                                user.User.password ="N/A"
                                docs.set(user);
                                return  res.json({
                                    message: user.User.usertoken ? "Account created" : "Error creating user !"            
                                  })
                         })
                            .catch(err => {
                                return   res.json({
                                    message: err as Error           
                    })
            })
})









export const LoginUser = functions.https.onRequest(async (req,res) =>{
    
    const idToken = req.body.idToken.toString();
    const csrfToken = req.body.csrfToken.toString();
    console.log(idToken,"   |   ",csrfToken ,  "   |  " , req.cookies.csrftoken);

    // if (csrfToken !== req.cookies.csrftoken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST! 1 ');
    //     return;
    // }

    const expiresIn = 60 * 60 * 24 * 1 * 1000;
    admin.auth().createSessionCookie(idToken,{expiresIn})
        .then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly:true, secure:true};
            res.cookie('session',sessionCookie,options);
            res.end(JSON.stringify({ status: 'success' }));
          }, (error) => {
            res.status(401).send('UNAUTHORIZED REQUEST! 2 ');
        })

})




export const VerifyUser = functions.https.onRequest(async (req, res) => {
let idToken = req.body.idToken.toString();
      admin.auth().verifyIdToken(idToken)
                .then((decoderToken) => {
                    const expiresIn = 60 * 60 * 24 * 1 * 1000;
                      if(new Date().getTime()/ 1000 - decoderToken.auth_time < 5 * 60)
                        return auth().createSessionCookie(idToken,{expiresIn})
                    })
                 res.status(401).send('Recent Sign in is required ');

})  




export const GetUserDetails = functions.https.onRequest(async (req,res) => {
      let user:ExistingUser = req.body;
         admin.auth().getUserByEmail(user.User.email)
            .then(async (useRecord) => {
                let docs = db.collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc(user.User.usertype)
                        .collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!)
                             .doc(useRecord.uid!);
                                let X = (await docs.get()).data();
                                  const map = new Map(Object.entries(X!));
                                     const data = Object.fromEntries(map);
                                        res.send({message:  data })
                     }).catch(err1 => {
                          res.json({message: err1 as Error })
           })
})








export const Sign_in_user_google = functions.https.onRequest(async(req,res) => {
    let user:ExistingUser = req.body
       admin.auth()
            .getUserByEmail(user.User.email)
                .then(async (record) => {
                     let docs = db.collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc(user.User.usertype).collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc(record.uid)
                        return  res.json({message: (await docs.get()).exists ? (await docs.get()).data()   :  remove(user,res) })
                }).catch(err1 => {
                     return res.json({message: err1 as Error })
      })
})



async function remove(user: ExistingUser,res: functions.Response<any>) {
    let operation;
      let use = await admin.auth().getUserByEmail(user.User.email);
        if(use.email)
            operation = await admin.auth().deleteUser(use.uid);
 return "Account Doesn't exist !";
}






export const  VendorInvest = functions.https.onRequest(async(req,res) => {
           let e:PaymentModel = req.body
           //Validate amount token on both client and server
           const doc_id = db.collection(process.env.REACT_APP_VENDOR_INVESTMENT!).doc();
               doc_id.set(e)
                    .then(response => {
                        return res.json({
                            message: response.writeTime.toDate()
                        })
                    }).catch(err => {
                        return res.json({
                             message: err as Error
                        })
                    });
            
}) 




export const  GetVendorInvest = functions.https.onRequest(async(req,res) => {
     let e:PaymentModel = req.body
      admin.auth().getUser(e.UserInvestment.user!)
                    .then(async (r)=> {
                        let e:PaymentModel [] = [];
                         const data = await db.collection(process.env.REACT_APP_VENDOR_INVESTMENT!).orderBy("UserInvestment.timestamp","desc").get();
                           data.forEach((docs:any) => e.push(docs.data()))
                              return res.json({ message: e})      
                             }).catch(err => {
                               return res.json({message: err as Error}) 
                             })
});


export const Paid_cart_uploaded = functions.https.onRequest(async(req,res) => {

  
})

 
export const  UserlocationPhoneNumber = functions.https.onRequest(async(req,response) => {         
        response.json({
            message: process.env.IPDATA!
     })
})



export const  DynamicpostRenderPost = functions.https.onRequest(async (req,res) => {

    
})








    // let card:any;   
    //  card = {
    //     method: 'GET',
    //     url: process.env.IPDATA_END!+process.env.IPDATA!,
    //   };
    //   let data = await axios.request(card);    
    //   const res = await data.data;