import * as functions from 'firebase-functions'
import {db, db_sec, admin, sec_admin} from '../config/firebase' 
import * as nodemailer from "nodemailer"
import { v4 as uuid } from 'uuid'
import axios from "axios";
import { auth, messaging } from 'firebase-admin';
require('dotenv').config()



type Register = {
    User:{
        IMEI:string, 
        email:string, 
        user_id:string,
        password:any,
        avatar:number,
        timeStamp:number,
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


type GroupWithdrawal = {
    User:{
        doc_id:string,
        user_id:string,
        email:string,
        IMEI:string
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
        serial:number
    }
}

type GroupCreation = {
    User:{
        members_ids:any,
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
        odd:number
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
    }
}



type UserNoRequest = {
    User:{
        user_id:string,
        email:string,
        IMEI:string,
        isGroup:false,
        isUser:false,
        isBot:false,
        creator:[],
        user_selected:[],
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


type GroupStatus = {
    User:{
        email:string,
        IMEI:string,
        user_id:string,
        doc_id:string,
        creator_email:string
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
        a1:  string,
        a2:  string,
        a3:  string,
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
                                        disabled:false,
                                    }).then(async (record) => {
                                            user.User.password = "N/A";
                                            user.User.user_id = record.uid;
                                            user.User.timeStamp = Date.now();
                                        if(user.User_details.bal === 0  && user.User_details.gas === 0){
                                                user.User_details.bal = 0;
                                                user.User_details.gas = 0;
                                                user.User.IMEI = uuid()+"_"+Date.now()+"_"+uuid()
                                                    if(await REMOVENODE(null,2,db,record.email)){
                                                         if(await REMOVENODE(user,1,db_sec,record.email))
                                                           return res.json({message: "Account created"})
                                                    }else
                                                        return res.json({message: "Account wasn't created !"});
                                            }else
                                                return res.json({message: "Account wasn't created !!"});


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
                            res.json({message:m.User});
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









export const UserFund = functions.https.onRequest(async (req,res) => {
    try{
         let user:CheckUserStat = req.body
                if(await Isvalid(user.User,res,req)){
                    let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
                    if((await docs.get()).exists){
                            const data:any = CheckForNode((await docs.get()).data());
                                    res.json({message: data.User_details})
                            }
                            else 
                                res.json({message:"Account not found"})
                 }
          }catch(err){
            res.json({message: err as Error})
      }
});










//Check user session ID and auth id on call
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
                                      UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right !",undefined,3,0,0);
                        }
                        else
                            UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right !",undefined,3,0,0); 
                    }

                }catch(err){
                  res.json({message: err as Error})
                }
});







export const  Group_action = functions.https.onRequest(async (req,res) => {
    let list:any = [] 
    let user:UserNoRequest = req.body;
    if(await Isvalid(user.User,res,req)){
        if(user.User.isGroup && user.User.isBot && user.User.creator.length <= 0)
            res.json({message: SendOff(list,parseInt(process.env.REACT_APP_FIGURE_COUNT!),8)})
         else  
             if(user.User.isGroup && user.User.isBot && user.User.creator.length > 0) 
                    console.log()

    }
})




let list = [{serial:987654569,mode:"regular",amount:5},
            {serial:43212567,mode:"buget",amount:10},
             {serial:765436789,mode:"whip",amount:25},
             {serial:87654569,mode:"semi whip",amount:35},
             {serial:54309823,mode:"chief whip",amount:45},
             {serial:74512575,mode:"gold",amount:50},
             {serial:19812575,mode:"premium",amount:75}
            ];

export const Voches = functions.https.onRequest(async (req,res) => {
      let user:GroupWithdrawal = req.body;
         if(await Isvalid(user.User,res,req))
                res.json({message:list})
         
})



export const WithdrawfundsFromGroup = functions.https.onRequest(async (req,res) => {
    let user:GroupWithdrawal = req.body;
          if(await Isvalid(user.User,res,req)){
               let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(process.env.REACT_APP_JOINED_GROUP!).doc(user.User.doc_id);    
                 if((await account.get()).exists){
                        let m:any = CheckForNode((await account.get()).data());
                            let group:any = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(m.User.email).collection(m.User.email+"_stakes").doc(m.User.doc_id);
                                let filter:any = CheckForNode((await group.get()).data()); 
                                     DeactiveAccout(user.User.user_id,1,"",res);
                                        RunFun(filter,user,group,account,res,m.User.doc_id);
                         }else
                            DeactiveAccout(user.User.user_id,0,"Invalid request last warning !",res);
                }
        }
)




export const Group_Creator_Cancel = functions.https.onRequest(async (req,res) => {
    try{
         let user:GroupCreation = req.body;
          if(await Isvalid(user.User,res,req)){
              let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).collection(user.User.user_id+"_stakes").doc(user.User.doc_id);
                 if((await group.get()).exists){
                    let filter:any = CheckForNode((await group.get()).data());
                            if(filter.User.members_ids[0].toString() === user.User.user_id){
                                DeactiveAccout(user.User.user_id,1,"",res);
                                  RunFun(filter,user,group,filter.User.members_ids.length <= 0  ?  group : null, res,null);
                            }else
                                DeactiveAccout(user.User.user_id,0,"Permission denied last warning !",res);
                    }else
                        DeactiveAccout(user.User.user_id,0,"Group doesn't exist last warning",res);
                }
        }catch(err ){
            res.json({message: err as Error})
        }
})








export const purchasevoches = functions.https.onRequest(async (req,res) => {
    let reply = false;
    let user:Purchase = req.body;
        if(await Isvalid(user.User,res,req))
                for(let m = 0; m < list.length; m++)
                     if(user.User.serial === list[m].serial)
                            reply = true;
            
        if(!reply)
            console.log();
            //Paystack
        else
            res.json({message: "Invalid Vochce"}) //warning script
})






function RunFun(filter:any, user:any, group:any, account:any, res:functions.Response<any>, doc: any) {
    if(loopuser(filter.User.members_ids, user.User.user_id)){
          DeactiveAccout(user.User.user_id,1,"",res);
           if(Divide(filter.User.members_ids,filter.User.profit)[0] !== 0)
                SendOutFunds(Platform(Divide(filter.User.members_ids, filter.User.profit)), filter.User,user,res,group,account,1,doc);    
            else{
                SendOutFunds([],filter.User,user,res,group,account,2,doc);
                  res.json({message: "No profit at this time left anyway !"}); 
            }
       }else
            DeactiveAccout(user.User.user_id,0,"You are not a valid member last warning !",res);
}





function SendOutFunds(profit: number[], group: any, user: any, res: functions.Response<any>,  group_state: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,account:any, init:number, doc_node:any) {
                     group_state.update({User:{
                                    members_ids: Remove(group.members_ids,user.User.user_id), 
                                    email:group.email,
                                    IMEI:group.IMEI,
                                    user_id:group.user_id,
                                    groupName: group.groupName,
                                    amount: group.amount,
                                    liquidator_size: group.liquidator_size, 
                                    miner_stake: group.miner_stake,
                                    timestamp: group.timestamp,
                                    doc_id: group.doc_id,
                                    profit: init !== 2 ? Math.floor(Action(2,group.profit,profit[0])) : 0,
                                    loss: group.loss,
                                    liquidity: Action(2,group.liquidity,group.amount),
                                    active:false,
                                    odd: group.odd
                                 }});  

                                 if(account !== null)
                                      account.delete(); 
                                
                                 UpdateUsersNodes(Remove(group.members_ids,user.User.user_id),doc_node);

                    //check if group.members_ids.length <= 0  ? run script : continue flow           
                   //check for user account funder (i.e) app or group 
                   //also check for for crediting or debiting or zero group funds at request time.  
                  if(Action(2,group.profit,profit[0]) !== 0) 
                     UpdateUserAccount(res,user,init !== 2 ? 1 : 2,"Account funded",undefined, init !== 2 ? 5 : 4 ,init !== 2 ? profit[0] : group.amount,group.amount);
                                
                                 
                                 
}





async function UpdateUsersNodes(members: any[], id:any){
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
                                        .update("User.members_ids",members);
                        
                        })}}
             }
}






export const  User_action = functions.https.onRequest(async (req,res) => {
    let list:any = []
    let user:UserNoRequest =  req.body;
      if(await Isvalid(user.User,res,req)){
         if(user.User.isUser && user.User.user_selected.length > 0){
              if(await Debit_account(user))
                 caclulate(res,user,getRandom(100),[],[],1);
                 else{
                    list.push({m1: "Insufficient funds pls purchase gas !"})
                     res.json({message: list})
                }
         }else 
            if(user.User.isBot && user.User.creator.length <= 0 && user.User.user_selected.length <= 0){
                if(await Debit_account(user))
                      res.json({message: SendOff(list,parseInt(process.env.REACT_APP_FIGURE_COUNT!),12)})
                 else{
                    list.push({m1: "Insufficient funds pls purchase gas !"})
                      res.json({message: list})
                 }
         }
         else
            if(user.User.isBot && user.User.creator.length > 0 && user.User.user_selected.length > 0) 
              if(await Debit_account(user))
                 caclulate(res,user,0,user.User.creator,user.User.user_selected,2);
            else{
                 list.push({m1: "Insufficient funds pls purchase gas !"})
                    res.json({message: list})
                 }
           }
})




async function Debit_account(user:UserNoRequest){
    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email);
      let admindoc = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
          if((await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email).get()).exists){
               const data:any = CheckForNode((await doc_.get()).data());
                  const adata:any = CheckForNode((await admindoc.get()).data());
                if(data.User_details.gas >= parseInt(process.env.REACT_APP_TOKENS!)){
                    doc_.update("User_details.gas", Action(2,adata.debit,data.User_details.gas));
                    return true;
                }else
                    return false;
        }
}



function caclulate(res: functions.Response<any>, user:UserNoRequest, ran:number,scores:number[],select:number[],i:number) {
    let list = [];
    let indopotency = false;
    if(i === 1){
        //console.log(user.User.user_selected, ran);
        for(let d = 0; d < user.User.user_selected.length; d++)
            if(user.User.user_selected[d] === ran.toString()){
                Account(res,user,1,ran);
                indopotency = true;
            }
        if(!indopotency){
              list.unshift({m1:"Sorry you didn't win this stage !",m2:ran});
            return res.json({message:list})
        }
    }
    else 
        if(select.length <= 3 && i === 2){
          let lucky = [],bet;
            for(let m=0; m<scores.length; m++)
                lucky.push(scores[getRandom(scores.length)]);
            bet = getRandom(scores.length);
            for(let i=0; i<select.length; i++)
                 if(select[i] === lucky[bet]){
                    Account(res,user,1,lucky[bet]);  
                    indopotency = true;
                 }
        if(!indopotency) {//check for rough request
                  list.unshift({m1:"Sorry you didn't win this stage !",m2:lucky[bet]})
               return res.json({message:list}) 
        }
            
              
    }
    else
        res.json({message: "Invalid data !"}) //disable & freeze funds account 
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
                                //check if its for app call or withrawal call for debiting
                                doc_.update("User_details.bal", Action(1, credit_node == 3 ? Looper(adata.credit) : credit_node === 2 ? withdrawel_node : Looper(withdrawel_node), data.User_details.bal));
                                    if(credit_node === 5)
                                       doc_.update("User_details.gas", Action(1,gas_rt,data.User_details.gas));
                                    return res.json({message:messages})
                            }else
                                if(i ===  2){ //still needs more check   
                                    //check if its for app call or group call for crediting
                                    doc_.update("User_details.gas",  credit_node !== 4 ?  Action(2,adata.debit,data.User_details.gas) : Action(1,withdrawel_node,data.User_details.gas));
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
                                if(m.User_details.bal > user.User.amount){
                                    //Sell gas or spot to friend nodes by email and ID
                                } else
                                        res.json({message: "Insufficient funds !"});
                                
                        }
                }});




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



async function UniqueList(max:number){
    const set = new Set();
      while(set.size < max){
        set.add(Math.floor(Math.random() * max) + 1);
      }
    return set;
}




export const GroupCreate = functions.https.onRequest(async (req,res) => {
    let members: any[] = [];
    let user: GroupCreation = req.body;
    // if(await Isvalid(user.User,res,req)){
           sec_admin.getUser(user.User.user_id)
            .then(async (use) => {
                    let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.email)
                       const da:any = CheckForNode((await docs.get()).data());
                             if(da.User_details.gas > user.User.amount){
                                  let m =  docs.collection(user.User.email+"_stakes").doc()
                                  user.User.doc_id = m.id;
                                    members.unshift(user.User.user_id);
                                      user.User.timestamp = Date.now();
                                       user.User.members_ids = members;
                                        if(!user.User.active && user.User.amount > 0){
                                            if(user.User.liquidity < user.User.amount){
                                                    user.User.liquidity = user.User.amount;
                                                    user.User.active = user.User.liquidator_size === 1 ? true : false
                                                    if(user.User.profit === 0 && user.User.loss === 0){
                                                        user.User.profit = 0;
                                                        user.User.loss = 0;
                                                        m.set(user);
                                                          docs.update("User_details.gas",Action(2,user.User.amount,da.User_details.gas));
                                                             DeactiveAccout(use.uid,1,"",res);
                                                            if(m.id)
                                                                res.json({message: `Group ${user.User.groupName} created`})
                                                            else
                                                                res.json({message: `Group ${user.User.groupName} creation failed !`})
                                                        }else
                                                            DeactiveAccout(use.uid,0,"Invalid request do not try this again",res);
                                                }else
                                                    DeactiveAccout(use.uid,0,"Invalid request do not try this again",res);
                                            }
                                            else
                                                 DeactiveAccout(use.uid,0,"Invalid request do not try this again",res);
                                  }else
                                     res.json({message: "Insufficient funds pls purchase gas !"})
                                  
                    })
                    .catch(err => {
                        res.json({message: err})
                })
        //}    
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
                             let Groupcheck:any = CheckForNode((await creator.get()).data());

                             for(let m = 0; m < Groupcheck.User.members_ids.length; m++)
                                  grouplist.push(Groupcheck.User.members_ids[m]);

                               if(Groupcheck.User.members_ids.length <= Groupcheck.User.liquidator_size)
                                   {
                                    if(Usercheck.User_details.gas > Groupcheck.User.amount)
                                        {
                                           if(!Groupcheck.User.members_ids.includes(user.User.user_id))
                                                {
                                                    grouplist.push(user.User.user_id);
                                                       creator.update("User.members_ids",grouplist);
                                                             creator.update("User.liquidity",Action(1,Groupcheck.User.liquidity,Groupcheck.User.amount));
                                                                 account.update("User_details.gas",Action(2,Groupcheck.User.amount,Usercheck.User_details.gas));
                                                                      let j =  account.collection(process.env.REACT_APP_JOINED_GROUP!).doc();
                                                                              j.set({User:{timestamp:Groupcheck.User.timestamp, members_ids:grouplist, groupName:Groupcheck.User.groupName,doc_id:Groupcheck.User.doc_id,ref_id:j.id,email:user.User.creator_email}});
                                                                              if(Groupcheck.User.liquidator_size === grouplist.length)
                                                                                       creator.update("User.active",true);    
                                                                                         UpdateUsersNodes(grouplist,creator.id);
                                                                                            res.json({message:"You have been accepted"});           
                                                }
                                                 else
                                                    res.json({message: "Sorry you already added !"})
                                     }else
                                        res.json({message: "Insufficient funds pls purchase more gas !"})
                               }else
                                   res.json({message: "Group already complete !"})
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
                  let nodes:any = CheckForNode((await group).data());
                        let e ={User:{
                                    members_ids:nodes.User.members_ids, 
                                    email:nodes.User.email,
                                    user_id:nodes.User.user_id,
                                    groupName:nodes.User.groupName,
                                    liquidator_size:nodes.User.liquidator_size,
                                    profit:nodes.User.profit, 
                                    loss:nodes.User.loss,       
                                    liquidity:nodes.User.liquidity,
                                    ref_id:node.User.ref_id, 
                                }}
                      raw.push(e);
            }
            return raw;
           
}





export const ViewGroup = functions.https.onRequest(async (req,res) => {
      let m:GroupStatus = req.body;
         if(await Isvalid(m.User,res,req)){
                let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(m.User.email).collection(m.User.email+"_stakes").doc(m.User.doc_id)
                    res.json({message: (await group.get()).data()})
          }
})






export const LoadActiveGroup = functions.https.onRequest(async (req,res) => {
        let m: GroupWithdrawal = req.body;
        let list:any = [];
            if(await Isvalid(m.User,res,req)){
                let docs = db_sec.collection(process.env.REACT_APP_USER_DB!);
                  const response = await docs.get();
                    response.forEach(async (doc) => {
                        let u:any = CheckForNode(doc.data());
                          list.push(u.User.email);
                 })        
                 LoopForGroups(list,res,docs,1); 
        }
})




export const LoadInactiveGroup = functions.https.onRequest(async (req,res) => {
        let m: GroupWithdrawal = req.body;
        let list:any = [];
            if(await Isvalid(m.User,res,req)){
                let docs = db_sec.collection(process.env.REACT_APP_USER_DB!);
                  const response = await docs.get();
                    response.forEach(async (doc) => {
                        let u:any = CheckForNode(doc.data());
                        if(m.User.email !== u.User.email){
                            list.push(u.User.email);
                             LoopForGroups(list,res,docs,2);
                        } 
                 })        
        }
})





async function LoopForGroups(list: any[], res: functions.Response<any>, docs: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>, call:number) {

    let groups:GroupCreation [] = [];
    for(let y=0; y < list.length; y++){
         const groupRef = docs.doc(list[y].toString()).collection(list[y].toString()+"_stakes");
         const snapshot = await groupRef.where('User.active', '==', call === 1 ? true : false).get();
         if (snapshot.empty) 
              console.log('NMD');
          else
            snapshot.forEach((doc:any) => {
                groups.push(doc.data());
            });
    }
    res.json({message: groups})
}






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







function getRandom(length: any):number {
   return Math.floor(Math.random() * length)
}



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
                    if(body.user_id === data.User.user_id && body.IMEI === data.User.IMEI && body.email === data.User.email && MACHINE_CHECK(request) && await UseraccountActive(body.user_id,response))
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




let user_agents = ['Chrome','Firefox','Edg','MSIE','okhttp/3.14.9'];
function LOOP(req: functions.Request<any>): boolean {
    let nope:boolean = false;
     for(let n = 0; n < user_agents.length; n++)
        if(req.headers['user-agent']?.toString().includes(user_agents[n].toString())) 
             nope = true;
 return nope;
}




function Cancel(list: any[], response: functions.Response<any>) {
    list.push({error: "Unauthorized Request !"});
return  response.json({message: list});
}




function Remove(members_ids: any[], doc:String):any [] {
    let lists = [];
         for(let i = 0; i < members_ids.length; i++)
             if(members_ids[i].toString() != doc)
                lists.push(members_ids[i]);
  return lists;
}





async function UseraccountActive(user_id: any,res: functions.Response<any>) {
     let user = await sec_admin.getUser(user_id);
        if(!user.disabled)
            return true;
        else
            res.json({message: "Your account has been disabled !"})
    
}




async function DeactiveAccout(user_id:string, init:number, msg:string, res:functions.Response<any>){
    let doc = db_sec.collection(process.env.REACT_APP_PENARITY_TABLE!).doc(user_id);  
        if(!(await doc.get()).exists && init === 0)
             doc.set({User:{count:1}});
        else
            if((await doc.get()).exists && init === 0)
                  doc.update({User:{count:2}});

        if((await doc.get()).exists)
            QuickCheck(user_id,msg,res,doc); 
        else
            res.json({message:msg})

};




async function QuickCheck(user_id:string, ms: string, res: functions.Response<any>,doc:any){
        if((await doc.get()).exists && checkstats((await doc.get()).data()))
              sec_admin.updateUser(user_id,{disabled:true});
        ms.length > 0 ?  (await admin.auth().getUser(user_id)).disabled ? res.json({message:"Your account has been disabled !"}) :  res.json({message:ms}) : null
        
};




function checkstats(m:any):boolean{ 
        let p:any = CheckForNode(m);
      return  p.User.count === 2 ? true:false;
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
             store = amount >= 5 ? store+1 : store
            return store;
        }
    }
}




function Action(id:any,acct:any,bal:any):any{
    let e = 0;
     if(id === 1)
         e = acct  + bal;
       else
           e = acct - bal; 
return  parseFloat(e.toString().includes("-") ? e.toString().replace("-","") : e.toString());      
} 





function Divide(users: any[], amount:number):any[]{
    let sum = [];
    sum.push(Math.floor(amount/users.length));
    let  rem = amount%users.length;
       if(rem.toString() !== "0")
            sum.push(Math.floor(rem));
        return sum;
}




function Platform(money:any){
    let fund = [];
     fund.push(money[0]);
       if(money[1] !== NaN && money[1] !== undefined && money[1] !== null)
          Collector(0,money[1]);
    return fund;
}




function loopuser(users: any[],user:any){
    return  users.includes(user);
}




function Collector(user_id: any, profit: number) {
    console.log("Store"+ profit)
}




async function REMOVENODE(user:any, n:number, dual_db:any, record:any) {
   return  (await dual_db.collection(process.env.REACT_APP_USER_DB!).doc(record).set(n === 1 ? user : {User:{email:record}})).writeTime;
}






