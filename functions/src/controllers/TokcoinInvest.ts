import {db, db_sec, admin, sec_admin} from '../config/firebase' 
import * as functions from 'firebase-functions'
import * as crypto from 'crypto'
require('dotenv').config();


type User = {
  User:{
    amount:number,
    investor_id:string,
    email:string,
    phone:string,
    dateSignUp:string,
    token:string,
    key:number,
    account:number
    }
} 







export const  AuthBal = functions.https.onRequest(async (req,res) => {
    let user:User = req.body;
    let tracking:any;
    let data:any
    if(MACHINE_CHECK(req,res)){
       const doc = db_sec.collection(process.env.REACT_APP_PLATFORM!).doc(process.env.REACT_APP_TABLE!);
         let get = await doc.collection(process.env.REACT_APP_INVESTORS_LIST!).doc(user.User.key == 0 ? DechiperData(user.User.investor_id) : user.User.investor_id).get();

         if(get.exists)
            data = CheckForNode(get.data())

           if((await doc.get()).data() != null)
              tracking = CheckForNode((await doc.get()).data())
              
            if(user.User.key == 0 && get.exists)
                res.json({message:{User:{bal:data.User.amount,track:tracking.Platform.count}}});
           else 
              if(user.User.key == 1 && get.exists)  
                  if(data.User.investor_id == user.User.investor_id && data.User.email == user.User.email)
                       res.json({message:ChiperData(data.User.investor_id)})
                    else
                       res.json({message:"Wrong Credentails"})
              else
                  res.json({messae:"Invalid command !"})
         
       }
   }
)


export const AuthInvestorWithdraw = functions.https.onRequest(async (req,res) => {
    let user:User = req.body;
    const doc = db_sec.collection(process.env.REACT_APP_PLATFORM!).doc(process.env.REACT_APP_TABLE!).collection(process.env.REACT_APP_INVESTORS_LIST!).doc(user.User.token);
    if(MACHINE_CHECK(req,res)){
        if((await doc.get()).exists){
         let get = await doc.get();
          let data:any = CheckForNode(get.data())
            if(doc.id &&  data.User.investor_id == user.User.token){
                if(data.User.amount >= user.User.amount && data.User.amount > 0){
                      doc.update("User.amount",Action(0,data.User.amount,user.User.amount,"N"));
                        doc.collection(process.env.REACT_APP_PLATFORM!).doc().set({User:{timestamp:Date.now(),amount:user.User.amount,date:DateHumanFormated()}});
                    res.json({message:"Account Debited"})
                }else
                    res.json({message:"Insufficient funds !"})
              }else
                res.json({message: "Wrong Credentails"})
            }
            else
              res.json({message:"Unknown User"})
        }
      }
)





export const PullInvestorTransaciation = functions.https.onRequest(async (req,res) => {
  let user:User = req.body;
  let trasn_list = []
  if(MACHINE_CHECK(req,res)){
      const doc = db_sec.collection(process.env.REACT_APP_PLATFORM!).doc(process.env.REACT_APP_TABLE!).collection(process.env.REACT_APP_INVESTORS_LIST!).doc(DechiperData(user.User.token));
              if((await doc.get()).exists){
                let get = await doc.get();
                  let data:any = CheckForNode(get.data())
                    if(doc.id &&  data.User.investor_id == DechiperData(user.User.token)){     
                          let list = await doc.collection(process.env.REACT_APP_PLATFORM!).listDocuments();
                            for(let y=0; y<list.length; y++)
                                trasn_list.push((await list[y].get()).data());
                          res.json({message:{map:{trasn_list}}});
                      } else
                          res.json({message: "Wrong Credentails"})
                } else
                      res.json({message:"Unknown User"})
          }
     }
)




function MACHINE_CHECK(req: functions.Request<any>, res:functions.Response<any>): boolean {
  var user_agents = JSON.parse(process.env.REACT_APP_BROWSERS!);
     let nope:boolean = false;
        if(req.headers['user-agent']?.toString().includes(user_agents![user_agents!.length-1].toString())) 
             nope = true;
           else
              res.json({message: "Unauthorized request !"})
 return nope;
}



function CheckForNode(X:any){
    const map  = new Map(Object.entries(X));
    const data = Object.fromEntries(map);
    return data;
}



function DateHumanFormated():string {
    return  new Date().toISOString().split('T')[0]
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