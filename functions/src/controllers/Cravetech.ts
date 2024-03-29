import * as functions from 'firebase-functions'
import {db, db_sec, admin, sec_admin} from '../config/firebase' 
import * as nodemailer from "nodemailer"
import { v4 as uuid } from 'uuid'
import axios from "axios";
import * as crypto from 'crypto'
import { NotificationPayload, SendUpdate} from './Notification';
require('dotenv').config()







type Register = {
    User:{
        IMEI:string, 
        email:string, 
        user_id:string,
        password:any,
        avatar:number,
        timeStamp:number,
        device_token:string
    },
    User_details:{
        bankselected:string, 
        Nameonaccount:string, 
        bal:number,
        gas:number,
        bankaccountno:string
     },
     User_locations:{
        user_ip: string,
        country_code: string,
        country_city: string, 
        country_name: string
    }
}



type Loging = {
    User:{
        mail:string,
        pass:string,
        dv:string,
    }
}



type H = {
    Platform:{
        count:0;
    }
}



type Investor = {
    User:{
        amount:number,
        investor_id:string,
        name:string,
        email:string,
        phone:string,
        dateSignUp:string,
        key:string,
        account:number
    }
}

type GroupWithdrawal = {
    User:{
        doc_id:string,
        user_id:string,
        email:string,
        IMEI:string
    }
}



type Calculator = {
    User:{
        amount:number
        id:number
    }
}


type GroupUser = {
    User:{
        email:string,
        IMEI:string,
        user_id:string,
        group_id:string,
        group_mail:string,
        hour:number,
        bot_size:number,
        doc_id:string,
        loss:number,
        profit:number,
        input:number,
        Self:boolean,
        once:boolean
    }
}


type Withdrawals = {
    User:{
        user_id:string,
        email:string,
        IMEI:string,
        amount:number
    }
}

type Purchase = {
    User:{
        doc_id:string,
        user_id:string,
        email:string,
        IMEI:string,
        serial:number,
        amount:number,
    }
}

type GroupCreation = {
    User:{
        members_emails:any,
        email:string,
        IMEI:string,
        user_id:string,
        groupName:string,
        amount:number,
        liquidator_size:number,
        miner_stake:number;
        timestamp:any,
        doc_id:any,
        profit:number,
        loss:number,
        liquidity:number,
        active:boolean,
        odd:number,
        avatar:number
    }
}



type UserRequest = {
    User:{
        user_id:string,
        email:string,
        IMEI:string,
        doc_id:string,
        creator_email:string,
        category:string,
        guest_avatar:number
    }
}



type UserUpdate = {
    User:{
        user_id:string,
        email:string,
        IMEI:string,
        avatar:string,
    }
}




type UserNoRequest = {
    User:{
        user_id:string,
        email:string,
        IMEI:string,
        isGroup:boolean,
        isUser:boolean,
        isBot:boolean,
        creator:any[],
        user_selected:any[],
        creator_id:string,
        doc_id:string
    }
}

type CheckUserStat = {
    User:{
        list: [],
        email:string,
        IMEI:string,
        user_id:string,
        category:string,
        section:number,
        id:number
    }
}




type QuestionObj = {
    sessionID :string,
    email:string,
    IMEI:string,
    user_id:string,
    category:string,
    section:number,
    id:number
}

type Qs = {
    Q:{
        Category: string,
        question: string,
        a1: string,
        a2: string,
        a3: string,
        a4: string,  
        id:number
    }
}



export const RegisterNewUser = functions.https.onRequest(async (req,res) => {
   
     try{
           let user: Register = req.body     
               if(MACHINE_CHECK(req)){
                              sec_admin.createUser({ 
                                    email: user.User.email,  
                                    emailVerified:false,
                                    password:user.User.password,
                                    displayName:ChiperData(user.User.password),
                                    disabled:false,
                               }).then(async (record) => {
                                    user.User.user_id = record.uid;
                                    user.User.timeStamp = Date.now();
                                    user.User.device_token = "n/a";
                                    user.User.password = "n/a"; 

                                    user.User_details.bal = 0;
                                    user.User_details.gas = 0;
                                    user.User.IMEI = uuid()+"_"+Date.now()+"_"+uuid()

                                    if(await REMOVENODE(user,1,db_sec,record.email) &&  await REMOVENODE(null,2,db,record.email))
                                           return res.json({message: "Account created"})
                                    else
                                           return res.json({message: "Account not created !"});
                                 

                                }).catch((err => {
                                    return  res.json({message: err as Error })
                            }))
                  }else
                       Cancel([],res);
                }catch(err){
                    res.json({ message: err as Error})
         }
})








export const SignInWithEmail = functions.https.onRequest(async (req,res) => {
    let user: GroupWithdrawal = req.body;
     let user_node = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
        if((await user_node.get()).exists){
            sec_admin.verifyIdToken(user.User.user_id)
                .then(async (resP) => {
                   let m:any = CheckForNode((await user_node.get()).data());
                          res.json({message:{User:{email:m.User.User.email, IMEI:ChiperData(m.User.User.IMEI), user_id:ChiperData(m.User.User.user_id), avatar:m.User.User.avatar}}});    
                       }).catch(err => {

                        const actionCode = {url:'https://cravetech-9b39c.web.app',handleCodeInApp: true,};  

                            sec_admin.generateSignInWithEmailLink(user.User.email!,actionCode)
                              .then((responese) => {
                                let errand;
   
                                var smtpConfig = {
                                    host: process.env.HOST,
                                    port: 465,
                                    secure: true, 
                                    auth: {
                                        user: process.env.USER,
                                        pass: process.env.PASSWORD
                                }};
                                
                            const transport = nodemailer.createTransport(smtpConfig);
                        
                            var mailOptions = {
                                from: process.env.USER,
                                to: user.User.email,
                                subject:"Tokcoin Signin Link",
                                text: responese.toString(),
                            };
            
                            transport.sendMail(mailOptions,function(error, info){
                                   if (error) 
                                       errand = error.toString();
                                   else 
                                       errand = 'Email sent: ' + info.response;
                                 res.json({message: errand})
                                })
                    
                        }).catch(err => {
                            res.json({message: err as Error})
                       })
                    })
            }else { 
                sec_admin.getUserByEmail(user.User.email)
                     .then(use => {
                            sec_admin.deleteUser(use.uid)
                                .then(() =>  res.json({message:"Account Doesn't exist !"})).catch(err  => res.json({message:"Error deleting user !"}))
                           }).catch(err => {
                            res.json({message: "Error occured finding user !"})
                     })}
                          
})










export const  SignInWithEmailAndPassord = functions.https.onRequest(async (req,res) => {
     let user: Loging = req.body;     
       sec_admin.getUserByEmail(user.User.mail)
               .then(async (auths) => {
                  if(user.User.pass === DechiperData(auths.displayName!)){
                    let exists = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.mail);
                       if((await exists.get()).data()){
                            let done = (await exists.update("User.device_token",user.User.dv)).writeTime
                                if(done){
                                  let data:any = CheckForNode((await exists.get()).data());
                                    res.json({message:{User:{email:data.User.email, IMEI:ChiperData(data.User.IMEI), user_id:ChiperData(data.User.user_id), avatar:data.User.avatar}}});    
                                }else
                                  res.json({message: "Pls reinstall your device !"});
                            }else
                               res.json({message: "No account found !"});
                         }else
                            res.json({message: "Password or email combination not correct !"});
             }).catch(err => {
                  res.json({message: "No account associated with request !"});
            })
     
})









export const VnodeDeal = functions.https.onRequest(async (req,res) => {
    
    if(MACHINE_CHECK(req)){
        const info ="Per hour duration";
         const infoB ="Select bots size";
          let hours = [];
           let bots = [];

            hours.unshift({info:"Please select", t:""});
              bots.unshift({info:"Please select", t:""});

            for(let n =1; n <=6; n++){
                hours.push({info:info, t:n});
                    bots.push({info:infoB, t:n})
                }
         res.json({message:[{n1:hours,n2:bots}]});
    }
})








async function PlatformSave(data:any){
    let cloud = db_sec.collection(process.env.REACT_APP_PLATFORM!).doc(process.env.REACT_APP_TABLE!)
        if((await cloud.get()).exists){
            let bal:any = CheckForNode((await cloud.get()).data());
              if(bal.Platform.count + data.Platform.count >= 700)
                  UpdatePayment((bal.Platform.count+data.Platform.count)/7,cloud);
              else
                   cloud.update("Platform.count", Action(1,bal.Platform.count,parseInt(data.Platform.count),"N"));
           cloud.update("Platform.backup", Action(1,bal.Platform.backup ? bal.Platform.backup : bal.Platform.count,parseInt(data.Platform.count),"N"));
        }else 
              cloud.set(data);
     cloud.collection(process.env.REACT_APP_USER_DEBIT!).doc().set({nodes:{date:DateHumanFormated(),timestamp:Date.now(),amount:data.Platform.count}})    
}



async function UpdatePayment(arg0: number, cloud:FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) {
        cloud.update("Platform.count",0);
           let docs =  cloud.collection(process.env.REACT_APP_INVESTORS_LIST!);
            (await docs.get()).forEach((v) => {
                    let doc:any = CheckForNode(v.data());
                          docs.doc(doc.User.investor_id)
                                .update("User.amount",Action(1,arg0,doc.User.amount,"N"))
            })      
        }







  

export const AddInvestor = functions.https.onRequest(async (req,res) => {
    let invest:Investor = req.body;
    if((req.headers['user-agent']?.toString().includes(process.env.REACT_APP_MACHINE!.toString())) && invest.User.key == process.env.REACT_APP_AUTHKEY!){
            let doc_ref =   db_sec.collection(process.env.REACT_APP_PLATFORM!).doc(process.env.REACT_APP_TABLE!).collection(process.env.REACT_APP_INVESTORS_LIST!);
              if((await doc_ref.listDocuments()).length <= 6){
                 let doc =  doc_ref.doc(Date.now().toString());
                   invest.User.amount = 0;
                    invest.User.dateSignUp = DateHumanFormated();
                      invest.User.investor_id = doc.id
                        doc.set(invest);
                     res.json({message: doc.id})
        }
        else 
             res.json({message: "Pls send a valid payload"})
        
   }

})






export const updateUser = functions.https.onRequest(async (req,res) => {
    let user: UserUpdate = req.body;
       if(await Isvalid(user.User,res,req))
            res.json({message: (await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).update("User.avatar",user.User.avatar)).writeTime ? "Updated" : "Error occurred"})
});




export const UserFund = functions.https.onRequest(async (req,res) => {
    try{
         let user:CheckUserStat = req.body
                if(await Isvalid(user.User,res,req)){
                    let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
                       if((await docs.get()).exists){
                            const data:any = CheckForNode((await docs.get()).data());
                                res.json({message:{bal:data.User_details.bal,gas:data.User_details.gas,avatar:data.User.avatar}});
                            }
                            else 
                                res.json({message:"Account not found"})
                 }
          }catch(err){
            res.json({message: err as Error})
      }
});




export const Groupstatus = functions.https.onRequest(async (req,res) => {
    let time_stamp_list = [];
     let users = sec_admin.listUsers();
       let user = (await users).users;
        for(let y=0; y < user.length; y++){
          let hold = await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user[y].email!).collection(user[y].email!+"_stakes").listDocuments();
           for(let p=0; p < hold.length; p++){  
              let mine:any = CheckForNode((await hold[y].get()).data())
                let doc = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user[y].email!).collection(user[y].email!+"_stakes").doc(mine.User.doc_id).get();
                    let time:any = CheckForNode((await doc).data());
                        var stamp = Date.now() - +(new Date(time.User.timestamp));
                        time_stamp_list.push({node:{email:user[y].email!,doc_id:time.User.doc_id,timestamp:time.User.timestamp}})
                    }   
            }
            res.json({message:time_stamp_list})
        
})  
  
 



export const CloudHandler = functions.runWith({timeoutSeconds:300,memory:"512MB",}).https.onRequest(async (req,res) => {
    if(req.body.toString() === process.env.REACT_APP_HEADER &&  req.headers['user-agent']?.toString() === process.env.REACT_APP_USER_AGENT){   
         let liveVnodes = await db_sec.collection(process.env.REACT_APP_LIVE_INSTANCES!).listDocuments();
           if(liveVnodes.length > 0 &&  liveVnodes.length <= 100){
              for(let n = 0; n < liveVnodes.length; ++n){
                    await sleep(200);        
                        let p:any = CheckForNode((await liveVnodes[n].get()).data()); 
                         let g = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(p.User.group_mail).collection(p.User.group_mail+"_stakes").doc(p.User.group_id);
                            let vn =  db_sec.collection(process.env.REACT_APP_LIVE_INSTANCES!).doc(p.User.doc_id);
                            
                            let u = DocLookUp(db_sec,p.User.email)
    
                              if((await g.get()).exists && (await u.get()).exists){
                                let w:any = CheckForNode((await g.get()).data());
                                    let q:any = CheckForNode((await u.get()).data());      
                                
                              
                                 if(p.User.Self && p.User.input > 0 && w.User.liquidity > Action(3,w.User.odd,p.User.input,"N") && w.User.active) {
                                    if(!p.User.once){
                                          if(q.User_details.gas > p.User.input)
                                              CalculateAndFund(g,u,vn,p,w,q);

                                                  else {
                                                      
                                                    let e:NotificationPayload ={

                                                        payload: {
                                                            email: q.User.email,
                                                            stake_id: p.User.doc_id,
                                                            pic: q.User.avater,
                                                            body: "Low on gas virtual node " + p.User.doc_id + " suspended !",
                                                            doc_id: ''
                                                          }, 
                                                                    options: { 
                                                                            notification: 
                                                                                    { pic: "", 
                                                                                        badge: 1, 
                                                                                        sound: "ping.aiff", 
                                                                                        email: q.User.email, 
                                                                                        stake_id: p.User.doc_id, 
                                                                                        body: "Low on gas virtual node " + p.User.doc_id + " suspended !" 
                                                                                    } 
                                                                      },

                                                            Key: {  
                                                                token: 0
                                                            },
                                                          
                                                            User: {
                                                                to: q.User.device_token,
                                                            }
                                                        }
                                                 
                                                      SendUpdate(e)


                                                }
                                    }else 
                                          if(p.User.once){
                                              CalculateAndFund(g,u,vn,p,w,q); 
                                                 vn.delete();
                                        }    

                                         if(n === liveVnodes.length-1)
                                            res.json({message: "ok"});

                                    }else
                                        if(!p.User.Self && p.User.input <= 0  && w.User.liquidity > w.User.miner_stake && w.User.active){
                                            if(q.User_details.gas > w.User.miner_stake){
                                               if(p.User.bot_size <= 6){
                                                    if(SendOff([],100, p.User.bot_size).includes(SendOff([],100, 1)[0])){
                                                           g.update("User.loss",Action(3,w.User.miner_stake,w.User.odd,"N")+w.User.loss);
                                                             g.update("User.liquidity",Action(0,w.User.liquidity,Action(3,w.User.miner_stake,w.User.odd,"N"),"N"));
                                                               u.update("User_details.bal",Looper(Action(3,w.User.miner_stake,w.User.odd,"N"))+q.User_details.bal);
                                                                vn.update("User.profit",Action(1,w.User.miner_stake,p.User.profit,"N"));
                                                            }
                                                            else{
                                                                g.update("User.profit",Action(1,w.User.profit,w.User.miner_stake,"N"));
                                                                    u.update("User_details.gas",Action(0,q.User_details.gas,w.User.miner_stake,"N"));
                                                                      vn.update("User.loss",Action(1,w.User.miner_stake,p.User.loss,"N"));
                                                            }
                                                            if(n === liveVnodes.length-1)
                                                                res.json({message: "ok"});
                                                    }else { 
                                           
                                                      


                                                           let e:NotificationPayload ={

                                                                payload: {
                                                                    email: q.User.email,
                                                                    stake_id: p.User.doc_id,
                                                                    pic: q.User.avater,
                                                                    body: "Invalid virtual node cancel or your account would be suspended !",
                                                                    doc_id: ''
                                                                }, 
                                                                        options: { 
                                                                                notification: 
                                                                                        { pic: "", 
                                                                                            badge: 1, 
                                                                                            sound: "ping.aiff", 
                                                                                            email: q.User.email, 
                                                                                            stake_id: p.User.doc_id, 
                                                                                            body: "Invalid virtual node cancel or your account would be suspended !" 
                                                                                        } 
                                                                          },
    
                                                                Key: {  
                                                                    token: 0
                                                                },
                                                              
                                                                User: {
                                                                    to: q.User.device_token,
                                                                }
                                                            }
                                                     

                                                            SendUpdate(e);
                                                              DeactiveAccout(q.User.user_id,"Invalid request last warning !",res);
                                                              
                                                    }
                                                 }else {

                                                                
                                                           let e:NotificationPayload ={

                                                            payload: {
                                                                email: q.User.email,
                                                                stake_id: p.User.doc_id,
                                                                pic: q.User.avater,
                                                                body: "You are low on gas pls purchase !",
                                                                doc_id: ''
                                                            }, 
                                                                    options: { 
                                                                            notification: 
                                                                                    { pic: "", 
                                                                                        badge: 1, 
                                                                                        sound: "ping.aiff", 
                                                                                        email: q.User.email, 
                                                                                        stake_id: p.User.doc_id, 
                                                                                        body: "You are low on gas pls purchase !" 
                                                                                    } 
                                                                      },

                                                            Key: {  
                                                                token: 0
                                                            },
                                                          
                                                            User: {
                                                                to: q.User.device_token,
                                                            }
                                                        }
                                                 

                                                        SendUpdate(e);
                                                        
                                                           res.json({message: "User Stake dropped !"});   
                                                 }
                                                     
                                            }else {
                                                g.update("User.active",false);
                                                    for(let m=0;  m < [w.User.members_emails].length; m++) {

                                                        let dump:any = CheckForNode((await DocLookUp(db_sec,w.User.members_emails[m]).get()).data())  
                                                        
                                                                let e:NotificationPayload ={

                                                                    payload: {
                                                                        email: q.User.email,
                                                                        stake_id: p.User.doc_id,
                                                                        pic: q.User.avater,
                                                                        body: "Group "+w.User.groupName+" is low on gas group suspended !",
                                                                        doc_id: ''
                                                                    }, 
                                                                            options: { 
                                                                                    notification: 
                                                                                            { pic: "", 
                                                                                                badge: 1, 
                                                                                                sound: "ping.aiff", 
                                                                                                email: q.User.email, 
                                                                                                stake_id: p.User.doc_id, 
                                                                                                body: "Group "+w.User.groupName+" is low on gas group suspended !!" 
                                                                                            } 
                                                                              },
        
                                                                    Key: {  
                                                                        token: 0
                                                                    },
                                                                  
                                                                    User: {
                                                                        to: dump.User.device_token,
                                                                    }
                                                                }
                                                         
                                                                  
                                                          
        
                                                                SendUpdate(e);


                                                                    g.update("User.members_emails",[w.User.members_emails[0]]);  
                                                                        if(m == [w.User.members_emails].length-1)
                                                                            res.json({message: "Group Stake Suspended !"})
                                                    }
                                        }          
                            }
                            else
                            console.log("");
                            //return p.User.email initial deposit
                    }
                }else
                    res.json({message: "No available spot pls try again later !"})
         }else 
                res.json({message: "Unauthorized Request !"})
  
})







function CalculateAndFund(g: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, u: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, vn: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, p: any, w: any, q: any) {
    
    if(SendOff([],100, 3).includes(SendOff([],100, 1)[0])){
        g.update("User.loss",Action(3,p.User.input,w.User.odd,"N")+w.User.loss);
         g.update("User.liquidity",Action(0,w.User.liquidity,Action(3,p.User.input,w.User.odd,"N"),"N"));
          u.update("User_details.bal",Looper(Action(3,p.User.input,w.User.odd,"N"))+q.User_details.bal);
            vn.update("User.profit",Action(1,Action(3,p.User.input,w.User.odd,"N"),p.User.profit,"N"));
        }
        else{
            g.update("User.profit",Action(1,w.User.profit,Action(3,p.User.input,w.User.odd,"N"),"N"));
                u.update("User_details.gas",Action(0,q.User_details.gas,Action(3,p.User.input,w.User.odd,"N"),"N"));
                    vn.update("User.loss",Action(1,Action(3,p.User.input,w.User.odd,"N"),p.User.loss,"N"));
        }
}



function sleep(ms:number){
    return new Promise(res => setTimeout(res,ms))
  }





export const AddHandler = functions.https.onRequest(async (req,res) => {
    let user:GroupUser = req.body;
       if(await Isvalid(user.User,res,req)){
            let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.group_mail).collection(user.User.group_mail+"_stakes").doc(user.User.group_id);
              let  account = db_sec.collection(process.env.REACT_APP_LIVE_INSTANCES!).doc(); 
                 let users = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);

                  let use:any = CheckForNode((await users.get()).data());
                    let o:any = CheckForNode((await group.get()).data());
                    
                        user.User.doc_id = account.id;
                        user.User.loss = 0;
                        user.User.profit = 0;
                        
                    if(user.User.Self && user.User.input && o.User.active && account.id){
                        user.User.hour = 0;
                        user.User.bot_size = user.User.input > 0 &&  user.User.input <= 10 ? 1 : user.User.input > 10 && user.User.input <=20  ? 2 : user.User.input > 20  && user.User.input <= 30 ? 3 : 4;
                            if(o.User.liquidity > Action(3,o.User.odd,user.User.input,"N")){
                                if(user.User.input < use.User_details.gas){
                                    account.set(user)
                                        users.update("User_details.gas",Action(0,user.User.input,use.User_details.gas,"N"))
                                          res.json({message:[{n1:"Spot added"}]})
                                  }else
                                       res.json({message:[{n1:"Spot not added pls purchase gas !"}]})
                        }else
                            res.json({message:[{n1:"Sorry group is low on funds !"}]})
                      }else
                          if(account.id && user.User.bot_size <=6 && CheckBoT(use,user) && o.User.active){
                            user.User.Self = false;
                              user.User.input = 0;
                                account.set(user);
                                  PlatformSave({Platform:{count:LoadUp(user.User.bot_size)/2}});
                                    group.update("User.profit",Action(1, user.User.bot_size != 1 ? LoadUp(user.User.bot_size)/2 : 0, o.User.profit,"N"))
                                        users.update("User_details.gas", Action(0, user.User.bot_size != 1 ? LoadUp(user.User.bot_size) : 0,use.User_details.gas,"N"))
                                      res.json({message:[{n1:"Spot added"}]})
                            }else
                                res.json({message:[{n1: !CheckBoT(use,user) ? "Spot not added !" : "Insufficient funds pls purchase gas !"}]})
        }
});



function CheckBoT(use:any, user:any){
  return  use.User_details.gas >= (Action(0,use.User_details.gas,LoadUp(user.User.bot_size),"N"))
}




export const  VNODES = functions.https.onRequest(async (req,res) => {
    let user:GroupWithdrawal = req.body;
      let raw:GroupUser  [] = []
         if(await Isvalid(user.User,res,req)){
            let data = await db_sec.collection(process.env.REACT_APP_LIVE_INSTANCES!).where("User.email","==",user.User.email).get();
                 data.forEach((doc: any) => raw.push(doc.data()));   
                    res.json({message:raw})
            }
        }
);








export const  CA = functions.https.onRequest(async (req,res) => {
    let c:Calculator = req.body;
        if(c.User.id === 1)
            res.json({message:LoadUp(c.User.amount)}) 
        else 
            res.json({message:PlusQuater(c.User.amount)})

});







let list = [
             {serial:987654569,mode:"regular",amount:100},
             {serial:43212567,mode:"buget",amount:200},
             {serial:765436789,mode:"whip",amount:500},
             {serial:87654569,mode:"semi whip",amount:1000},
             {serial:54309823,mode:"chief whip",amount:2000}
            ]



export const Voches = functions.https.onRequest(async (req,res) => {
      let user:GroupWithdrawal = req.body;
         if(await Isvalid(user.User,res,req))
                res.json({message:list})
         
})




export const purchasevoches = functions.https.onRequest(async (req,res) => {
    let reply = false;
    let user:Purchase = req.body;
        if(await Isvalid(user.User,res,req)){
                for(let m = 0; m < list.length; m++)
                     if(user.User.serial === list[m].serial)
                            reply = true;
            
        if(reply)
           res.json({message: "Paystack"})
        else
            res.json({message: "No auth"})
           
        }else
            DeactiveAccout(user.User.user_id,"Invalid request warning ",res);
})





export const WithdrawfundsFromGroup = functions.https.onRequest(async (req,res) => {
    let user:GroupWithdrawal = req.body;
          if(await Isvalid(user.User,res,req)){
               let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(process.env.REACT_APP_JOINED_GROUP!).doc(user.User.doc_id);    
                 if((await account.get()).exists){
                        let m:any = CheckForNode((await account.get()).data());
                            let group:any = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(m.User.email).collection(m.User.email+"_stakes").doc(m.User.doc_id);
                                let filter:any = CheckForNode((await group.get()).data()); 
                                     DeactiveAccout(DechiperData(user.User.user_id),"",res);
                                        RunFun(filter,user,group,res,m.User.doc_id);
                         }else
                            DeactiveAccout(DechiperData(user.User.user_id),"Invalid request last warning !",res);
                }
        }
)




export const creator_cancel = functions.https.onRequest(async (req,res) => {
    
    try{
         let user:GroupCreation = req.body;
          if(await Isvalid(user.User,res,req)){
              let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(user.User.email+"_stakes").doc(user.User.doc_id);
                 if((await group.get()).exists){
                    let filter:any = CheckForNode((await group.get()).data());
                        if(filter.User.members_emails[0].toString() === user.User.email){
                             DeactiveAccout(DechiperData(user.User.user_id),"",res); 
                                RunFun(filter,user,group,res,null);
                         }else
                             DeactiveAccout(DechiperData(user.User.user_id),"Permission denied last warning !",res);
                    }else
                        DeactiveAccout(DechiperData(user.User.user_id),"Group doesn't exist last warning",res);
                }
        }catch(err ){
            res.json({message: err as Error})
        }
})






function RunFun(filter:any, user:any, group:any, res:functions.Response<any>, doc: any) {
    if(loopuser(filter.User.members_emails, user.User.email)){
          DeactiveAccout(DechiperData(user.User.user_id),"",res);
           if(Divide(filter.User.members_emails,filter.User.profit)[0] !== 0)
                SendOutFunds(Platform(Divide(filter.User.members_emails, filter.User.profit)), filter.User,user,res,1,doc,group);    
            else{
                  SendOutFunds([],filter.User,user,res,2,doc,group);
                     res.json({message: "No profit at this time left anyway !"}); 
            }
       }else
            DeactiveAccout(DechiperData(user.User.user_id),"You are not a valid member last warning !",res);
}





async function SendOutFunds(profit: number[], use: any, user: any, res: functions.Response<any>,init:number, doc_node:any, group_ref:any) {
    
                 //check for group liq
                   let check:any = CheckForNode((await group_ref.get()).data());
                    if(Remove(check.User.members_emails,user.User.email).length <= 0){
                          UpdateUserAccount(res,user,1,"Account funded",undefined,4,check.User.liquidity+check.User.profit,0)
                             group_ref.delete(); 
                       }else{
                             group_ref.update({User:{
                                    members_emails: Remove(use.members_emails,user.User.email), 
                                    email:use.email,
                                    IMEI:use.IMEI,
                                    user_id:use.user_id,
                                    groupName: use.groupName,
                                    amount: use.amount,
                                    liquidator_size: use.liquidator_size, 
                                    miner_stake: use.miner_stake,
                                    timestamp: use.timestamp,
                                    doc_id: use.doc_id,
                                    profit: init !== 2 ? Math.floor(Action(0,profit[0],use.profit,"N")) : 0,
                                    loss: use.loss,
                                    liquidity: Action(0,use.liquidity,use.amount,"N"),
                                    active: false,
                                    odd: use.odd
                                 }});  
                                    

                            UpdateUsersNodes(use.members_emails,doc_node,user.User.email);

                            //check if group.members_emails.length <= 0  ? run script : continue flow           
                            //check for user account funder (i.e) app or group 
                            //also check for for crediting or debiting or zero group funds at request time.  
                                if(Action(0,use.profit,profit[0],"N") !== 0) 
                                    UpdateUserAccount(res,user,init !== 2 ? 1 : 2,"Account funded",undefined, init !== 2 ? 5 : 4 ,init !== 2 ? profit[0] : use.amount,use.amount);
                
                }
         
                                 
                                 
}





async function UpdateUsersNodes(members: any[], id:any,email:any){
    console.log("M1",members);
    if(id !== null)
        for(let i =0; i < members.length; i++){ 
            let e:string = members[i];
            let node = await sec_admin.getUser(e);
                if(node){
                    let soc = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(node.email!).collection(process.env.REACT_APP_JOINED_GROUP!);
                       let snapshot = await soc.where('User.doc_id', "==", id).get();
                            if(!snapshot.empty){
                                snapshot.forEach((doc) =>{
                                    db_sec.collection(process.env.REACT_APP_USER_DB!).doc(e).collection(process.env.REACT_APP_JOINED_GROUP!).doc(doc.id)
                                        .update("User.members_emails",members);
                        
                        })}}
             }

             if(email !== null)
               Remove(members,email)
}






export const  User_action = functions.https.onRequest(async (req,res) => {
    let list:any = []
    let user:UserNoRequest =  req.body;
      if(await Isvalid(user.User,res,req)){

        if(!user.User.isUser && !user.User.isGroup && user.User.isBot && user.User.user_selected.length > 0 && user.User.creator.length > 0)
             caculate(res,user,0,user.User.creator,user.User.user_selected,2);
        else
            if(user.User.isUser && !user.User.isGroup && !user.User.isBot && user.User.user_selected.length > 0){
                if(await Debit_account(user,1))
                    caculate(res,user,getRandom(100),[],[],1);
                    else{
                        list.push({m1: "Insufficient funds pls purchase gas !"});
                          res.json({message: list})
                    }
            }else 
                if(user.User.isBot && user.User.creator.length <= 0 && user.User.user_selected.length <= 0){
                    if(await Debit_account(user,1))
                        res.json({message: SendOff(list,parseInt(process.env.REACT_APP_FIGURE_COUNT!),12)})
                    else{
                        list.push({m1: "Insufficient funds pls purchase gas !"})
                          res.json({message: list})
                    }
               }                 
           }
})




async function Debit_account(user:UserNoRequest,node:number){
    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
        let admindoc = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
            if((await doc_.get()).exists){
               const data:any = CheckForNode((await doc_.get()).data());
                  const adata:any = CheckForNode((await admindoc.get()).data());
                    if(data.User_details.gas >= parseInt(process.env.REACT_APP_TOKENS!)){
                       doc_.update("User_details.gas", Action(0,adata.debit,data.User_details.gas,"N"));
                          return true;
                        }
                         else
                            return false;
                    }
}







async function caculate(res: functions.Response<any>, user:UserNoRequest, ran:number,scores:number[],select:number[],i:number) {
    let list = [];
    let indopotency = false;
    if(i === 1){
        //console.log(user.User.user_selected, ran);
        for(let d = 0; d < user.User.user_selected.length; d++)
            if(user.User.user_selected[d].toString() == ran.toString()){
                Account(res,user,1,ran);
                indopotency = true;
            }
        if(!indopotency){
              list.unshift({m1:"Sorry you didn't win this stage ",m2:ran});
            return res.json({message:list})
        }
    }
    else 
        if(select.length <= 3 && i === 2){
          let lucky =[],bet;
            for(let m=0; m<scores.length; m++)
                lucky.push(scores[getRandom(scores.length)]);
                  bet = getRandom(scores.length);
            for(let i=0; i<select.length; i++)
                 if(select[i] === lucky[bet]){
                    Account(res,user,1,lucky[bet]);  
                    indopotency = true;
                 }
            if(!indopotency) {
                    //check for rough request
                    list.unshift({m1:"Sorry you didn't win this stage ",m2:lucky[bet]})
                return res.json({message:list}) 
            }     
       }
        else
            DeactiveAccout(user.User.user_id,"Invalid data !",res);
}








async function Account(res: functions.Response<any>, user: UserNoRequest,i:number,rt:any) {
    let list = [];
      let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
           if((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).get()).exists){
                  const data:any = CheckForNode((await doc_.get()).data());
                     if(data.User_details.gas >= parseInt(process.env.REACT_APP_TOKENS!)){
                        if(i === 1)
                            UpdateUserAccount(res,user,i,"You won this stage number returned",rt,3,0,0);
                        else
                            UpdateUserAccount(res,user,i,"Sorry you didn't win this stage ! number returned",rt,3,0,0);
                       }else{
                          list.push({error: "Insufficient funds pls purchase gas !"})
                             res.json({message: list})
                      }
             }
}







async function UpdateUserAccount(res: functions.Response<any>, user:any, i:number, ms:string, rt:any, credit_node:number, withdrawel_node:number, gas_rt:number) {

    let messages = [];
    let platform:any;
    let adata:any;

    if(rt !== undefined)
        messages.push({m1:ms,m2:rt})
    else
        messages.push(ms);

    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
      if(credit_node === 3)
            platform = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
        if((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).get()).exists){
                const data:any = CheckForNode((await doc_.get()).data());
                    if(credit_node === 3)
                        adata = CheckForNode((await platform.get()).data());
                        if(i ===  1){ 
                            //withdrawel_node can be group payload
                            //still needs more check
                            //check if its for platform call or withrawal call for debiting
                            doc_.update("User_details.bal", Action(1, credit_node == 3 ? Looper(adata.credit) : credit_node === 2 ? withdrawel_node : Looper(withdrawel_node), data.User_details.bal,"F"));
                                if(credit_node === 5)
                                    doc_.update("User_details.gas", Action(1,gas_rt,data.User_details.gas,"N"));
                                return res.json({message:messages})
                        }else
                            if(i ===  2){ //still needs more check   
                                //check if its for platform call or group call for crediting
                                doc_.update("User_details.gas",  credit_node !== 4 ?  Action(0,adata.debit,data.User_details.gas,"N") : Action(1,withdrawel_node,data.User_details.gas,"N"));
                                return res.json({message:messages})
                            }
                    }else 
                        return  res.json({message: "Account not found"})
}







export const ExchangeFunds = functions.https.onRequest(async (req,res) => {
    let user:Withdrawals = req.body;
      if(await Isvalid(user.User,res,req)){
             let user_node =  db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
                 if((await user_node.get()).exists){
                     let m:any = CheckForNode((await user_node.get()).data());
                         if(m.User_details.bal > user.User.amount && user.User.amount > 0){
                             //Sell gas or spot to friend nodes by email and ID
                        }else
                            res.json({message: "Insufficient funds !"});    
                        }
                }});




async function UniqueList(max:number){
    const set = new Set();
      while(set.size < max){
        set.add(Math.floor(Math.random() * max) + 1);
      }
    return set;
}




export const GroupCreate = functions.https.onRequest(async (req,res) => {
    let members: any[] = [];
    let count_live_stake: number[] = [];
    let user: GroupCreation = req.body;
     if(await Isvalid(user.User,res,req)){
           sec_admin.getUser(DechiperData(user.User.user_id))
               .then(async (use) => {
            
                    let users = (await admin.auth().listUsers()).users;
                    for(let u=0; u < users.length; u++)
                            count_live_stake.push((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(users[u].email!).collection(users[u].email+"_stakes").listDocuments()).length);    
            
                    if(count_live_stake.reduce(function(a, b) { return a + b; }, 0) >= 100)
                            res.json({message:"No available spot pls try again later !"})
                        else{
                            let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(use.email!)
                              const da:any = CheckForNode((await docs.get()).data());
                                    if(da.User_details.gas > user.User.amount){
                                        let m =  docs.collection(use.email+"_stakes").doc()
                                             user.User.doc_id = m.id;
                                               members.unshift(user.User.email);
                                                 user.User.timestamp = Date.now();
                                                  user.User.members_emails = members;
                                                   user.User.IMEI = DechiperData(user.User.IMEI)
                                                    user.User.user_id = DechiperData(user.User.user_id)
                                                     if(!user.User.active && user.User.amount > 0){
                                                        if(user.User.liquidity < user.User.amount){
                                                            user.User.liquidity = user.User.amount;
                                                                user.User.active = user.User.liquidator_size === 1 ? true : false
                                                                    if(user.User.profit === 0 && user.User.loss === 0){
                                                                        user.User.profit = 0;
                                                                        user.User.loss = 0;
                                                                        m.set(user);
                                                                        docs.update("User_details.gas",Action(0,user.User.amount,da.User_details.gas,"N"));
                                                                              DeactiveAccout(use.uid,"",res);
                                                                            if(m.id)
                                                                                res.json({message: `Group ${user.User.groupName} created`})
                                                                            else
                                                                                res.json({message: `Group ${user.User.groupName} creation failed !`})
                                                                        }else
                                                                        DeactiveAccout(use.uid,"Invalid request do not try this again",res);
                                                                }else
                                                                DeactiveAccout(use.uid,"Invalid request do not try this again",res);
                                                        }
                                                        else
                                                            DeactiveAccout(use.uid,"Invalid request do not try this again",res);
                                            }else
                                                res.json({message: "Insufficient funds pls purchase gas !"})
                                }            
                    })
                    .catch(err => {
                        res.json({message: err})
                })
                
       }    
       
})








export const JoinGroupCheck = functions.https.onRequest(async (req,res) =>{
        try{
            let  user: UserRequest = req.body;
              let grouplist:any [] = [];
                 if(await Isvalid(user.User,res,req)){
                    let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
                        let creator =   db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.creator_email).collection(user.User.creator_email+"_stakes").doc(user.User.doc_id)
                         if((await creator.get()).exists){

                           let Usercheck:any = CheckForNode((await account.get()).data());
                             let groupcheck:any = CheckForNode((await creator.get()).data());

                             for(let m = 0; m < groupcheck.User.members_emails.length; m++)
                                  grouplist.push(groupcheck.User.members_emails[m]);
                            
                                 if(grouplist.length < groupcheck.User.liquidator_size)
                                   {
                                    if(Usercheck.User_details.gas > groupcheck.User.amount)
                                        {
                                           if(!groupcheck.User.members_emails.includes(user.User.email))
                                                {
                                                    grouplist.push(user.User.email);
                                                       creator.update("User.members_emails",grouplist);
                                                             creator.update("User.liquidity",Action(1,parseInt(groupcheck.User.liquidity),groupcheck.User.amount,"N"));
                                                                 account.update("User_details.gas",Action(0,groupcheck.User.amount,Usercheck.User_details.gas,"N"));
                                                                        let j = account.collection(process.env.REACT_APP_JOINED_GROUP!).doc();
                                                                              j.set({User:{timestamp:groupcheck.User.timestamp, members_emails:grouplist, groupName:groupcheck.User.groupName,doc_id:groupcheck.User.doc_id,ref_id:j.id,email:user.User.creator_email}});
                                                                               if(groupcheck.User.liquidator_size.toString() === grouplist.length.toString())
                                                                                       creator.update("User.active",true);    
                                                                                         UpdateUsersNodes(grouplist,creator.id,null);
                                                                                            res.json({message:"You have been accepted"});           
                                                }
                                                 else
                                                    res.json({message: "Sorry you already added !"})
                                     }else
                                        res.json({message: "Insufficient funds pls purchase more gas !"})
                               }else
                                   res.json({message: "Group already compelete !"})
                            }
                            else
                               res.json({message: "Group doesn't exists !"})
                  }
           }catch(err){
              res.json({message: err as Error})
        }
})









export const GetListOfCreatedGroup = functions.https.onRequest(async (req,res) => {
    let user:GroupWithdrawal = req.body;
     let raw1:any [] = []
     let raw2:any [] = []
       if(await Isvalid(user.User,res,req)){
               let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(user.User.email+"_stakes").get();
                   let  joined = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(process.env.REACT_APP_JOINED_GROUP!).get();
                       let doc1 = (await account).docs;
                         let doc2 = (await joined).docs;
                            doc1.forEach((doc: any) => raw1.push(doc.data()));  
                                doc2.forEach((doc: any) => raw2.push(doc.data())); 
                                    res.json({message: {listA:{raw1},listB:raw2.length > 0 ? await innerLoop(raw2) : 0}})
              }
})







async function innerLoop(raw2: any[]): Promise<any>{
    let node:any;
    let raw:any [] = []
        for(let m=0; m<raw2.length; m++){
            node = CheckForNode(raw2[m]);
                let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(node.User.email).collection(node.User.email+"_stakes").doc(node.User.doc_id).get();
                if((await group).exists){ 
                    let nodes:any = CheckForNode((await group).data());
                        let e ={User:{
                                    members_emails:nodes.User.members_emails, 
                                    email:nodes.User.email,
                                    user_id:nodes.User.user_id,
                                    groupName:nodes.User.groupName,
                                    liquidator_size:nodes.User.liquidator_size,
                                    profit:nodes.User.profit, 
                                    loss:nodes.User.loss,       
                                    liquidity:nodes.User.liquidity,
                                    ref_id:node.User.ref_id, 
                                    doc_id:node.User.doc_id, 
                                }}
                      raw.push(e);
                  }
            }
            return raw;  
}






export const LoadActiveGroup = functions.https.onRequest(async (req,res) => {
        let m: GroupWithdrawal = req.body;
        let pick:any;
         let users:GroupWithdrawal [] = [];
         let r:any
         if(await Isvalid(m.User,res,req)){
             let docs = await db_sec.collection(process.env.REACT_APP_USER_DB!).listDocuments();
                 for(let e=0; e<docs.length; e++){
                    let check:any = CheckForNode((await docs[e].get()).data());
                      const groups = await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(check.User.email!).collection(check.User.email!+"_stakes").listDocuments();
                        for(let i=0; i<groups.length; i++){
                           let view:any = CheckForNode((await groups[i].get()).data());
                            if(view.User.active == true && !view.User.members_emails.includes(m.User.email)){
                                if(view.User.members_emails.length > 1)
                                    pick = CheckForNode((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(view.User.members_emails.slice(-1)[0]!).get()).data())
                              users.push(Chiper(view.User,view.User.members_emails.length > 1 ? pick.User.avatar : 0))
                            }
                        }

                    if(e == docs.length-1)
                       res.json({message:users})  
                }
        }
})






export const LoadInactiveGroup = functions.https.onRequest(async (req,res) => {
        let m: GroupWithdrawal = req.body;
        let pick:any;
        let users:GroupWithdrawal [] = [];
            if(await Isvalid(m.User,res,req)){
                let docs = await db_sec.collection(process.env.REACT_APP_USER_DB!).listDocuments();
                for(let e=0; e<docs.length; e++){
                   let check:any = CheckForNode((await docs[e].get()).data());
                     const groups = await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(check.User.email!).collection(check.User.email!+"_stakes").listDocuments();
                       for(let i=0; i< groups.length; i++){
                          let view:any = CheckForNode((await groups[i].get()).data());
                           if(!view.User.active){
                              if(view.User.members_emails.length > 1)
                                  pick = CheckForNode((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(view.User.members_emails.slice(-1)[0]!).get()).data())
                             users.push(Chiper(view.User,view.User.members_emails.length > 1 ? pick.User.avatar : 0))
                           }  
               }
        }
        res.json({message:users})  
    }
})








function Chiper(d: any, o: any){
  let e = {User:{
           members_emails:d.members_emails,
           email:d.email,
           IMEI:d.IMEI,
           user_id:d.user_id,
           groupName:d.groupName,
           amount:d.amount,
           liquidator_size:d.liquidator_size,
           miner_stake:d.miner_stake,
           timestamp:d.timeStamp,
           doc_id:d.doc_id,
           profit:d.profit,
           loss:d.loss,
           liquidity:d.liquidity,
           active:d.active,
           odd:d.odd,
           guest_avatar:o,
           avatar:d.avatar,
           }
       }
       return e;
   }



function getRandom(length: any):number {
   return Math.floor(Math.random() * length)
}






function CheckForNode(X:any){
    const map  = new Map(Object.entries(X));
    const data = Object.fromEntries(map);
    return data;
}




function SendOff(list: any,size:number,cons:number) {
    while (true) {
        list.push(getRandom(size))
        if(uniq(list).length === cons)
              return uniq(list);
    }
}



function uniq(a:any) {
    return Array.from(new Set(a));
 }




 async function Isvalid (body: any,  response: functions.Response<any>, request: functions.Request<any>) {
    let docs = db.collection(process.env.REACT_APP_USER_DB!).doc(body.email);
        if((await docs.get()).exists){
            let res =  db_sec.collection(process.env.REACT_APP_USER_DB!).doc(body.email);
                let data:any = CheckForNode((await res.get()).data())
                    if(DechiperData(body.user_id) === data.User.user_id && DechiperData(body.IMEI) === data.User.IMEI && body.email === data.User.email && MACHINE_CHECK(request) && await UseraccountActive(body.user_id,response))
                        if(!(await sec_admin.getUser(data.User.user_id)).disabled)   
                                return true;
                        else
                                return  response.json({message: [{error: "Your account has been disabled !"}]});
                    else
                        Cancel([], response);
        }else
            Cancel([], response);
}








function MACHINE_CHECK(req:  functions.Request<any>) {
  return  LOOP(req) ? true : false;
}
function LOOP(req: functions.Request<any>): boolean {
    var user_agents = JSON.parse(process.env.REACT_APP_BROWSERS!);
    let nope:boolean = false;
     for(let n = 0; n < user_agents!.length; n++)
        if(req.headers['user-agent']?.toString().includes(user_agents![n].toString())) 
             nope = true;
 return nope;
}




function Cancel(list: any[], response: functions.Response<any>) {
    list.push({error: "Unauthorized Request !"});
return  response.json({message: list});
}




function Remove(members_emails: any[], doc:String):any [] {
    let lists = [];
         for(let i = 0; i < members_emails.length; i++)
             if(members_emails[i].toString() != doc)
                lists.push(members_emails[i]);
  return lists;
}





async function UseraccountActive(user_id:any,res:functions.Response<any>) {
     let user = await sec_admin.getUser(DechiperData(user_id));
        if(!user.disabled)
            return true;
        else
            res.json({message: "Your account has been disabled !"})
    
}







async function DeactiveAccout(user_id:string, msg:string, res:functions.Response<any>){
        let doc = db_sec.collection(process.env.REACT_APP_PENARITY_TABLE!).doc(user_id);  
            if(!(await doc.get()).exists && msg.trim().length <= 0)
                doc.set({User:{count:0}});
            else
              if((await doc.get()).exists && msg.trim().length <= 0)
                  doc.update({User:{count:0}});
                else
                   if((await doc.get()).exists && msg.trim().length > 0){
                    let out:any = CheckForNode((await doc.get()).data());
                       doc.update({User:{count:out.User.count+1}});
                }

            if((await doc.get()).exists)
                QuickCheck(user_id,msg,res,doc); 
            else
                res.json({message:msg})


};




async function QuickCheck(user_id:string, ms: string, res: functions.Response<any>,doc:any){
        if((await doc.get()).exists && checkstats((await doc.get()).data()))
              sec_admin.updateUser(user_id,{disabled:true});
        ms.length > 0 ?  (await sec_admin.getUser(user_id)).disabled ? res.json({message:"Your account has been disabled !"}) :  res.json({message:ms}) : null
        
};




function checkstats(m:any):boolean{ 
        let p:any = CheckForNode(m);
      return  p.User.count >= 2 ? true:false;
}


function Looper(credit:any){
    let count = 0;
    let store = 0;
    let amount = credit;
        for(let m = 0; m < credit; m++){
            count ++;
                if(count >= 10){      
                    store += 1;
                    amount -= 10;
                    count = 0;
                }
         if(m === credit-1){
             store = amount >= 5 ? store+.5 : store
            return store;
        }
    }
}




function Action(id:any,acct:any,bal:any,u:string):number{
    let e:any = 0;
     if(id == 1)
         e = acct  + bal;
       else
          if(id == 0)
             e = acct - bal;  
    else
      if(id == 3)
         e = acct * bal; 
             
    return u === "F" ? e.toString().includes("-") ? parseFloat(e.toString().replace("-","")) : parseFloat(e)  :  e.toString().includes("-") ? parseInt(e.toString().replace("-","")) : parseInt(e) 
} 





function Divide(users: any[], amount:number):any[]{
    let sum = [];
    let s = users.length;
    sum.push(Math.floor(amount/s));
       if(amount%s!== 0)
            sum.push(Math.floor(amount%s));
        return sum;
}




function Platform(money:any){
    let fund = [];
     fund.push(money[0]);
       if(!Number.isNaN(money[1]) && money[1] !== undefined && money[1] !== null)
            PlatformSave({Platform:{count:parseInt(money[1])}});
    return fund;
}




function loopuser(users: any[],user:any){
    return  users.includes(user);
}






async function REMOVENODE(user:any, n:number, dual_db:any, record:any) {
   return  (await dual_db.collection(process.env.REACT_APP_USER_DB!).doc(record).set(n === 1 ? user : {User:{email:record}})).writeTime;
}





function LoadUp(am:number){
    return am != 1 ? am * 10  : 0;
}



function DateHumanFormated(): string {
    return  new Date().toISOString().split('T')[0]
  }




  function DocLookUp(db_dual: FirebaseFirestore.Firestore, email: any) {
    return db_dual.collection(process.env.REACT_APP_USER_DB!).doc(email);
 }






function ChiperData(data: any){
    let cipher = crypto.createCipheriv(process.env.REACT_APP_KEY_ALGO!, process.env.REACT_APP_KEY_ENC!, process.env.REACT_APP_KEY_IV!);
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted.toString();
}   



 function DechiperData(chiper_text:string){
    let decipher = crypto.createDecipheriv(process.env.REACT_APP_KEY_ALGO!,process.env.REACT_APP_KEY_ENC!, process.env.REACT_APP_KEY_IV!);
    let decrypted = decipher.update(chiper_text.toString(), "base64", "utf8");
    return decrypted + decipher.final("utf8");
 }



 function PlusQuater(amount:number){
    return amount+2.5;
}
 










//------------------------------------------------------Q&A--------------------------------------------------//
export const ManageUserAcct = functions.https.onRequest(async (req,res) => {
    try{
      let user: CheckUserStat  = req.body;
      let raw_data:any [] = []
                if(await Isvalid(user.User,res,req)){
                        if(user.User.category.trim().length > 0 && user.User.list.length >= 5){
                            let docs = await db.collection("CreavatechQ_"+user.User.category).doc(user.User.category).collection("CreavatechQ_"+user.User.category).get();
                            docs.forEach((doc: any) => raw_data.push(doc.data()));  

                            let answer_lists = [];
                            for(let e =0; e < user.User.list.length; e++){
                                    let a:any = user.User.list[e];
                                        for(let m=0; m < raw_data.length; m++){
                                            if(a.question_id.toString() === raw_data[m].Q.id.toString()){
                                                if(a.answer_selected.toString() === raw_data[m].Q.answers[0].toString())
                                                    answer_lists.push(1);        
                                        }
                                    }                       
                                }
                                if(answer_lists.length === 5)                  
                                      UpdateUserAccount(res,user,1,"You won this stage",undefined,3,0,0); 
                                else
                                      UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right ",undefined,3,0,0);
                        }
                        else
                            UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right ",undefined,3,0,0); 
                    }

                }catch(err){
                  res.json({message: err as Error})
                }
});









export const GenerateRandom = functions.https.onRequest(async (req,res) => {
    let user:UserRequest = req.body;
      let listres = [];
       if(await Isvalid(user.User,res,req)){
          let table = "CreavatechQ_"+user.User.category;
              let count = await UniqueList((await db.collection(table).doc(user.User.category).collection(table).listDocuments()).length);
                 const array: any[] = [];
                     count.forEach(v => array.push(v));
                       if(array){
                          let doc = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection("qanda").doc(user.User.category);
                              if(!(await doc.get()).exists){
                                      doc.set({Count:array,timestamp: Date.now()});
                                        listres.push({error:"All set !"});
                                  res.json({message: listres})
                              }else{
                                  let m:any = CheckForNode((await doc.get()).data());
                                      if(m.Count.length > 0){
                                          let ls = m.Count.pop();
                                           AuthUserRequest(res,user,ls,doc,m.Count,m.timestamp);
                                          }else
                                              if(m.Count.length <= 0){
                                                  var date = new Date(m.timestamp);
                                                    if(date.toLocaleDateString() === new Date().toLocaleDateString()){
                                                         listres.push({error:"Pls wait while we reset your Questions"})
                                                           res.json({message: listres})
                                                    }else{
                                                         doc.update({Count:array,timestamp: Date.now()});
                                                          listres.push({error:"All Reset !"});
                                                             res.json({message: listres})
                      }
                  }
               }
            }
          }
})





//Check user bal and gas 
async function AuthUserRequest(res: functions.Response<any>,data: any,id:any,documents:any,Count:any,tamp:any){
let raw_data:Qs [] = [];
let list:any [] = [];
  let doc = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(data.User.email);
      if((await doc.get()).exists){
              const user_data:any = CheckForNode((await doc.get()).data());
                  if(user_data.User_details.gas > parseInt(process.env.REACT_APP_TOKENS!)){
                          let docs = await db.collection("CreavatechQ_"+data.User.category).doc(data.User.category).collection("CreavatechQ_"+data.User.category).where("Q.id","==",id).get();
                            docs.forEach((doc: any) => raw_data.push(doc.data()));   
                              documents.set({Count:Count,timestamp:tamp});
                                res.json({message:raw_data})
                          } else { 
                              list.push({error: "Insufficient funds pls purchase gas !"})
                              res.json({message: list})
                        }
                  }
                  else {
                      list.push({error: "Account Doesn't exist !"});
                      res.json({message: list});
                  }
   
};




let n = 0;
export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data: QuestionObj = req.body;
    let category = data.category;
    let list: any[] = [];
    let id: number;
        if(data.category === "Sports")
                id = 21;
            else if(data.category === "Music")
                id = 12;
            else if(data.category === "General")
                    id = 9;
            else if(data.category === "Vehicles")
                    id = 28;
            else if(data.category === "Politics")
                    id = 24;
            else if (data.category === "History")
                    id = 23;
            else if(data.category === "Science")
                    id = 17;
            else if(data.category === "Religion")
                    id = 9;


            if(await Isvalid(data,res,req)){
                      axios.get(process.env.REACT_APP_TABLE1!,{headers:{'X-RapidAPI-Host': process.env.REACT_APP_HOSTS!,'X-RapidAPI-Key': process.env.REACT_APP_API_AUTH!}
                           }).then(responseQ => { 
                            console.log("1");
                                    axios.get(   
                                         id === 17 ?
                                         `https://opentdb.com/api.php?amount=50&category=17`
                                         :
                                         id === 24 ? 
                                            `https://opentdb.com/api.php?amount=50&category=24` 
                                         :
                                         id === 23 ?
                                            `https://opentdb.com/api.php?amount=50&category=23`
                                        : 
                                         id === 28 ?
                                            `https://opentdb.com/api.php?amount=50&category=28`
                                        : 
                                         id === 21 ? 
                                            `https://opentdb.com/api.php?amount=50&category=21&type=multiple` 
                                         :
                                           "https://opentdb.com/api.php?amount=50&category="+data.id+"&difficulty=hard&type=multiple"

                                           )
                                        .then(response => {
                                            console.log("2");
                                                     if(category === "Music"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Music")
                                                            return res.json({ message:  list.length})
                                                     }else  
                                                        if(category === "Vehicles"){
                                                            n = 0; 
                                                            addToList(Pack(response.data.results,2,list), "Vehicles")
                                                            return res.json({message:  list.length})
                                                    }else 
                                                        if(category === "Politics"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Politics")
                                                            return res.json({message: list.length})
                                                    }else 
                                                          if(category === "History"){
                                                                 n = 0;
                                                                 addToList(Pack(response.data.results,2,list),"History")
                                                                return res.json({message:  list.length})
                                                    }else 
                                                        if(category === "Science"){
                                                            for(let y=0; y < response.data.results.length; y++)
                                                                    list.push(response.data.results[y])
                                                               Q1(res,list);
                                                       }                                                            
                                                        else
                                                           if(category === "General"){
                                                                n = 0;
                                                                for(let y=0; y < responseQ.data.length; y++)
                                                                    Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"General",list,1)
                                                                    addToList(list,"General")
                                                                    return res.json({ message: list.length})
                                                          }else 
                                                             if(category === "Sports"){  
                                                                 n = 0;  
                                                                 for(let y=0; y < response.data.results.length; y++)
                                                                     Model("",response.data.results[y],"Sports",list,2)
                                                                 for(let s= 0; s < responseQ.data.length; s++)
                                                                      if(formatAnd(responseQ.data[s].Category) === "Sports")
                                                                           Model(responseQ.data[s], response.data.results[getRandom(response.data.results.length)],"Sports",list,3)
                                                             addToList(list,"Sports")
                                                             return res.json({message: list.length}) 
                                                          }    
                                                            else
                                                                 if(category === "Religion"){
                                                                    n = 0;
                                                                    console.log("3")
                                                                    for(let y=0; y < responseQ.data.length; y++)
                                                                         Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"Religion",list,3)
                                                                    addToList(list,"Religion")
                                                                    res.json({message: list.length})
                                                                }
                                                        }).catch(err => {
                                                            res.json({
                                                                message : err as Error
                                                           })
                                                      })
                                        
                                         })
                                         .catch(err  => res.json({message: err as Error}))                                
          }
        else  {
                list.push({error: "Unauthorized Request ! "});
                res.json({message: list});
        }
})




function formatAnd(url:string){
    return url.substring(0,url.indexOf("&")).trim();
 }




function Model(model:any,model2:any,arg1:string,list:any[],i:number) {
      if(i === 1)
            QuestionModel(model,model2,list,i);
        else 
           if(i === 3){
              if(formatAnd(model.Category) === arg1)
                 QuestionModel(model,model2,list,i);
            }else
                 if(i === 2)
                    QuestionModel(model,model2,list,i);    
                 
}



function QuestionModel(model: any, model2: any, list: any[],i:number) {
          n++;
            if(i === 1 || i === 3){
                        const Qs:any = {
                            Q:{
                                Category: model.Category,
                                question: model.Question,
                                answers: Group(model.Answer+"r",model2.incorrect_answers[0],model2.incorrect_answers[1],model2.incorrect_answers[2],1), 
                                id:n
                            }
                        }
                        list.push(Qs);
                }
                else  
                    if(i === 2){
                        if(model2.incorrect_answers.length === 3){

                                const Qs:any = {
                                        Q:{
                                            Category: model2.category,
                                            question: model2.question,  
                                            answers: Group(model2.correct_answer+"r",model2.incorrect_answers[0],model2.incorrect_answers[1], model2.incorrect_answers[2],1),
                                            id:n
                                        }
                                }
                                list.push(Qs);

                            }
                            else {
                                const Qs:any = {
                                    Q:{
                                        Category: model2.category,
                                        question: model2.question,
                                        answers: Group(model2.correct_answer+"r",model2.incorrect_answers[0],"","",2),
                                        id:n
                                    }
                             }
                             list.push(Qs);
                            }
                       
         }
}







function Q1(resP: functions.Response<any>, list:any[]){
            axios.get(`https://opentdb.com/api.php?amount=50&category=18`)
               .then(res => {
                    for(let i = 0; i <res.data.results.length; i++)
                         list.push(res.data.results[i])
                      Q2(resP,list)
                 }).catch(err => {
                    resP.json({
                        message: err as Error
                   })
                 })
}

function Q2(res: functions.Response<any>,list:any[]){
    axios.get(`https://opentdb.com/api.php?amount=50&category=19`)
        .then(resP => {
            for(let i = 0; i <resP.data.results.length; i++)
                list.push(resP.data.results[i])
            Q3(res,list)
           }).catch(err => {
             res.json({
                message: err as Error
            })
    })
}

function Group (a1:any,a2:any,a3:any,a4:any,i:number){
    let answer = [];
    if(i === 1){
        answer.push(a1);
        answer.push(a2);
        answer.push(a3);
        answer.push(a4);
     }else{
        answer.push(a1);
        answer.push(a2);
     }
    return answer;
}
function Q3(res: functions.Response<any>, list:any[]) {
    let pack: any[] = []
    
    axios.get(`https://opentdb.com/api.php?amount=10&category=30`)
               .then(resP => {
                    for(let i = 0; i <resP.data.results.length; i++)
                          list.push(resP.data.results[i]);
    
                           for(let y = 0; y < list.length; y++)
                                 {

                                    if(list[y].incorrect_answers.length === 3){
                                        const Qs:any = {
                                                Q:{
                                                    Category: list[y].category,
                                                    question: list[y].question,
                                                    answers: Group(list[y].correct_answer+"r",list[y].incorrect_answers[0],list[y].incorrect_answers[1],list[y].incorrect_answers[2],1),
                                                    id:y+1
                                                }
                                        }
                                        pack.push(Qs);
                                    }
                                    else {
                                        const Qs:any = {
                                            Q:{
                                                Category: list[y].category,
                                                question: list[y].question,
                                                answers: Group(list[y].correct_answer+"r",list[y].incorrect_answers[0],"","",2),
                                                id:y+1
                                            }
                                     }
                                     pack.push(Qs);
                                    }
                                } 
                           addToList(pack,"Science")
                          return res.json({message: pack.length})
                    }).catch(err => {
                        res.json({
                            message: err as Error
                    })
              })
       
}





function Pack(results: any, arg1: number, list: any[]):any[] {
    for(let y=0; y < results.length; y++)
           Model("",results[y],"",list,arg1)
    return list;
}




function addToList(arg0: any[], arg1: string) {
    let table = "CreavatechQ_"+arg1;
    for(let m = 0; m < arg0.length; m++){
        let doc = db.collection(table).doc(arg1).collection(table).doc();
         doc.set(arg0[m]);
    }
}











//-----------------------------------------End of Q&A --------------------------------------//







