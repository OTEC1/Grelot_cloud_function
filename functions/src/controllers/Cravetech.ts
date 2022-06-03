import * as functions from 'firebase-functions'
import {db, db_sec, admin, sec_admin} from '../config/firebase' 
import axios from "axios";
import { v4 as uuid } from 'uuid'
import e = require('express');
require('dotenv').config()



type Register = {
    User:{
        IMEI:string, 
        email:string, 
        user_id:string,
        password:any,
        avatar:number,
        UserCategory:any, 
    },
    User_details:{
        bankSelected:string, 
        NameOnAccount:string, 
        bal:number,
        gas:number,
        bankAccountNo:string
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
        creator:string
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
        creator_id:string
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





export const AuthUserRequestSize = functions.https.onRequest(async (req,res) => {
    let data:CheckUserStat = req.body
        if(await Isvalid(data.User,res,req)){
            let table = "CreavatechQ_"+data.User.category;
            let doc = db.collection(table).doc(data.User.category).collection(table).listDocuments();
                res.json({message: (await doc).length})
        }
         
})








export const RegisterNewUser = functions.https.onRequest(async (req,res) => {
    try{
         if(req.headers['user-agent'] === process.env.REACT_APP_MACHINE){
                 let user: Register = req.body
                      sec_admin.createUser({ 
                                    email: user.User.email,  
                                    emailVerified:false,
                                    password:user.User.password,
                                    disabled:false,
                                }).then(async (useRecord) => {

                                    user.User.password = "";
                                    user.User.user_id = useRecord.uid;
                                    //Check for rough users
                                    user.User_details.bal = 0;
                                    user.User_details.gas = 0;
                                    user.User.IMEI = uuid()+"_"+ Date.now()

                                    let doc = (await db.collection(process.env.REACT_APP_USER_DB!).doc(useRecord.uid).set(user)).writeTime;
                                    let doc_sec = (await db_sec.collection(process.env.REACT_APP_USER_DB!).doc(useRecord.uid).set(user)).writeTime;;
                                    if(doc && doc_sec)
                                          return  res.json({message: "Account created"})
                                    else
                                           return res.json({message: "Account wasn't created !"})

                                    }).catch((err => {
                                        return  res.json({message: err as Error })
                                }))
                         }
                           else
                               res.json({message: "Unauthorized Request !"})
                }catch(err){
                    res.json({ message: err as Error})
         }
})








export const UserFund = functions.https.onRequest(async (req,res) => {
    try{
         let user:CheckUserStat = req.body
         if(req.headers['user-agent'] === process.env.REACT_APP_MACHINE){
                if(await Isvalid(user.User,res,req)){
                    let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
                    if((await docs.get()).exists){
                            const data:any = CheckForNode((await docs.get()).data());
                                if(data.User_details.gas > parseInt(process.env.REACT_APP_TOKENS!))
                                    res.json({message: true})
                                else
                                    res.json({message: false})
                            }
                            else 
                                res.json({message:"Account not found"})
                        }
                            else
                                res.json({message:"Unauthorized Request !"});
                 }
          }catch(err){
            res.json({message: err as Error})
      }
})






//Check user session ID and auth id on call
export const ManageUserAcct = functions.https.onRequest(async (req,res) => {
    try{
      let user: CheckUserStat  = req.body;
      let raw_data:any [] = []
                if(await Isvalid(user.User,res,req)){
                        if(user.User.category.trim().length > 0){
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
                                      UpdateUserAccount(res,user,1,"You won this stage",undefined); 
                                else
                                      UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right !",undefined);
                        }
                        else
                            UpdateUserAccount(res,user,2,"Sorry you didn't get all 5 answers right !",undefined); 
                    }

                }catch(err){
                  res.json({message: err as Error})
                }
})






export const WithdrawfundsFromGroup = functions.https.onRequest(async (req,res) => {
    let user:GroupWithdrawal = req.body;
       if(await Isvalid(user.User,res,req)){
           let sum = [];
               let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).collection(process.env.REACT_APP_JOINED_GROUP!).doc(user.User.doc_id);
                let m:any = CheckForNode((await account.get()).data());
                  let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(m.User.members_ids[0]).collection(m.User.members_ids[0]+"_stakes").doc(m.User.doc_id)
                    
                      //Nw check phone logic
      
              }
})





export const  User_action = functions.https.onRequest(async (req,res) => {
    let list:any = []
    let user:UserNoRequest =  req.body;
//retofit check
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
                      res.json({message: SendOff(list,100,12)})
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
    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
    let admindoc = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
        if((await db.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).get()).exists){
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
    let indopotency = false;
    if(i === 1)
    {
        for(let d = 0; d < user.User.user_selected.length; d++)
            if(user.User.user_selected[d] === ran){
                Account(res,user,1,ran);
                indopotency = true;
            }
        if(!indopotency)
            return res.json({message:{m1:"Sorry you didn't win this stage !",m2:ran}})
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
        if(!indopotency) //check for rough request
               return res.json({message:{m1:"Sorry you didn't win this stage !",m2:lucky[bet]}}) 
            
              
    }
    else
        res.json({message: "Invalid data !"}) //disable & freeze funds account 
}




export const  Group_action = functions.https.onRequest(async (req,res) => {
    let list:any = [] 
    let user:UserNoRequest = req.body;
    if(await Isvalid(user.User,res,req)){
        if(user.User.isGroup && user.User.isBot && user.User.creator.length <= 0)
            res.json({message: SendOff(list,100,8)})
         else  
             if(user.User.isGroup && user.User.isBot && user.User.creator.length > 0) 
                    console.log()

    }
})





export const Voches = functions.https.onRequest(async (req,res) => {

    let list = [{serial:987654569,mode:"regular",amount:5},{serial:43212567,mode:"buget",amount:10},{serial:765436789,mode:"whip",amount:25},{serial:87654569,mode:"semi whip",amount:35},{serial:54309823,mode:"chief whip",amount:45},{serial:74512575,mode:"gold",amount:50},{serial:19812575,mode:"premium",amount:75}]

    let user:GroupWithdrawal = req.body;
         if(await Isvalid(user.User,res,req)){
                res.json({message:list})
         }
})




async function Account(res: functions.Response<any>, user: UserNoRequest,i:number,rt:any) {
    let list = [];
    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
           if((await db.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).get()).exists){
                  const data:any = CheckForNode((await doc_.get()).data());
                     if(data.User_details.gas >= parseInt(process.env.REACT_APP_TOKENS!)){
                        if(i === 1)
                            UpdateUserAccount(res,user,i,"You won this stage number returned",rt);
                        else
                            UpdateUserAccount(res,user,i,"Sorry you didn't win this stage ! number returned",rt);
                       }else{
                          list.push({error: "Insufficient funds pls purchase gas !"})
                             res.json({message: list})
                      }
             }
}






async function UpdateUserAccount(res: functions.Response<any>,user:any, i:number,ms:string,rt:any) {
    let messages;

    if(rt !== undefined)
        messages = {m1:ms,m2:rt}
    else
        messages = ms;

    let doc_ = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
       let admindoc = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
           if((await db.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).get()).exists){
                  const data:any = CheckForNode((await doc_.get()).data());
                      const adata:any = CheckForNode((await admindoc.get()).data());
                     if(i ===  1){ //still needs more check
                          doc_.update("User_details.bal", Action(1,adata.credit,data.User_details.bal));
                            return res.json({message:messages})
                      }else
                         if(i ===  2){ //still needs more check   
                            doc_.update("User_details.gas", Action(2,adata.debit,data.User_details.gas));
                              return res.json({message:messages})
                          }
                     }else 
                          return  res.json({message: "Account not found"})
}






//Check user bal and gas 
export const AuthUserRequest = functions.https.onRequest(async (req,res) => {
    let data: CheckUserStat = req.body;
    let raw_data:Qs [] = [];
    let list:any [] = [];
    if(await Isvalid(data.User,res,req)){
        let doc = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(data.User.user_id);
        if((await doc.get()).exists){
                const user_data:any = CheckForNode((await doc.get()).data());
                    if(user_data.User_details.gas > parseInt(process.env.REACT_APP_TOKENS!)){
                        let docs = await db.collection("CreavatechQ_"+data.User.category).doc(data.User.category).collection("CreavatechQ_"+data.User.category).where("Q.id","==",data.User.id).get();
                        docs.forEach((doc: any) => raw_data.push(doc.data()));   
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
           }else{
             list.push({error: "Unauthorized Request !"});
               res.json({message: list});
        }
         
})




async function Isvalid (body: any,  response: functions.Response<any>, request: functions.Request<any>) {
    let list = [];
        let docs = db.collection(process.env.REACT_APP_USER_DB!).doc(body.user_id);
             if((await docs.get()).exists){
                     let data:any = CheckForNode((await docs.get()).data())
                             let res = await  sec_admin.getUser(body.user_id)
                                if(res.email && request.headers['user-agent'] === process.env.REACT_APP_MACHINE){
                                     if(body.user_id === data.User.user_id && body.IMEI === data.User.IMEI && body.email === data.User.email)
                                            return true
                                 }else{
                                        list.push({error: "Unauthorized Request !"});
                                      return  response.json({message: list});
                                      }
                                }else{
                                    list.push({error: "Unauthorized Request !"});
                                    return response.json({message: list});
                                }
}





export const Vault = functions.https.onRequest(async (req,res) => {
    let members: any[] = [];
    let user: GroupCreation = req.body;
    if(await Isvalid(user.User,res,req)){
         sec_admin.getUser(user.User.user_id)
            .then(async (use) => {
                    let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id)
                       const data:any = CheckForNode((await docs.get()).data());
                             if(data.User_details.gas > user.User.amount){
                                  let m =  docs.collection(user.User.user_id+"_stakes").doc()
                                  user.User.doc_id = m.id;
                                    members.push(user.User.user_id);
                                      user.User.timestamp = Date.now();
                                       user.User.members_ids = members;
                                         user.User.liquidity = user.User.amount;
                                         user.User.active = user.User.liquidator_size === 1 ? true : false
                                           //Check for rough users
                                            user.User.profit = 0;
                                               user.User.loss = 0;
                                                 m.set(user);
                                     docs.update("User_details.gas",Action(2,user.User.amount,data.User_details.gas))
                                    if(m.id)
                                        res.json({message: `Group ${user.User.groupName} created`})
                                    else
                                        res.json({message: `Group ${user.User.groupName} creation failed !`})

                                  }else
                                     res.json({message: "Insufficient funds pls purchase gas !"})
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
                    let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
                        let creator =   db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.creator).collection(user.User.creator+"_stakes").doc(user.User.doc_id)
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
                                                           account.update("User_details.gas",Action(2,Groupcheck.User.amount,Usercheck.User_details.gas));
                                                                    creator.update("User.liquidity",Action(1,Groupcheck.User.liquidity,Groupcheck.User.amount));
                                                                        account.collection(process.env.REACT_APP_JOINED_GROUP!).doc()
                                                                                    .set({User:{timestamp:Groupcheck.User.timestamp, members_ids:grouplist, groupName:Groupcheck.User.groupName,
                                                                                                 doc_id:Groupcheck.User.doc_id}});
                                                                                 if(Groupcheck.User.liquidator_size === grouplist.length)
                                                                                       creator.update("User.active",true);    
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
               let  account = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).collection(user.User.user_id+"_stakes").get();
                   let  joined = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id).collection(process.env.REACT_APP_JOINED_GROUP!).get();
                       let doc1 =   (await account).docs;
                         let doc2 =   (await joined).docs;
                          doc1.forEach((doc: any) => raw1.push(doc.data()));  
                             doc2.forEach((doc: any) => raw2.push(doc.data()));  
                                   res.json({message: {listA:{raw1},listB:{raw2}}})
              }
})






export const ViewGroup = functions.https.onRequest(async (req,res) => {
      let m:GroupStatus = req.body;
         if(await Isvalid(m.User,res,req)){
                let group = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(m.User.creator_id).collection(m.User.creator_id+"_stakes").doc(m.User.doc_id)
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
                          list.push(u.User.user_id);
                           LoopForGroups(list,res,docs,1); 
                 })        
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
                          list.push(u.User.user_id);
                           LoopForGroups(list,res,docs,2); 
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














function Action(id:any,acct:any,bal:number):Number{
    let e = 0;
     if(id === 1)
         e = acct  + bal;
       else
           e = acct - bal; 
return  parseInt(e.toString().includes("-") ? e.toString().replace("-","") : e.toString());
      
} 





let n = 0;
export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data: QuestionObj = req.body;
    let category = data.category;
    let list: any[] = [];
    let id: number;
        if(data.category == "Sports")
                id = 21;
            else if(data.category == "Music")
                id = 12;
            else if(data.category == "General")
                    id = 9;
            else if(data.category == "Vehicles")
                    id = 28;
            else if(data.category == "Politics")
                    id = 24;
            else if (data.category == "History")
                    id = 23;
            else if(data.category == "Science")
                    id = 17;
            else if(data.category == "Religion")
                    id = 9;


           if(await Isvalid(data,res,req)){
               if(data.section == 1){
                    axios.get(process.env.REACT_APP_TABLE1!,{headers:{'X-RapidAPI-Host': process.env.REACT_APP_HOSTS!,'X-RapidAPI-Key': process.env.REACT_APP_API_AUTH!}
                           }).then(responseQ => { 
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
                                           `https://opentdb.com/api.php?amount=50&category=${id}&difficulty=hard&type=multiple`

                                        )
                                        .then(response => {
                                                     if(category == "Music"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Music")
                                                            return res.json({ message:  list.length})
                                                     }else  
                                                        if(category == "Vehicles"){
                                                            n = 0; 
                                                            addToList(Pack(response.data.results,2,list), "Vehicles")
                                                            return res.json({message:  list.length})
                                                    }else 
                                                        if(category == "Politics"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Politics")
                                                            return res.json({message: list.length})
                                                    }else 
                                                          if(category == "History"){
                                                                 n = 0;
                                                                 addToList(Pack(response.data.results,2,list),"History")
                                                                return res.json({message:  list.length})
                                                    }else 
                                                        if(category == "Science"){
                                                            for(let y=0; y < response.data.results.length; y++)
                                                                    list.push(response.data.results[y])
                                                               Q1(res,list);
                                                       }                                                            
                                                        else
                                                           if(category == "General"){
                                                                n = 0;
                                                                for(let y=0; y < responseQ.data.length; y++)
                                                                    Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"General",list,1)
                                                                    addToList(list,"General")
                                                                    return res.json({ message: list.length})
                                                          }else 
                                                             if(category == "Sports"){  
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
                                                                 if(category == "Religion"){
                                                                    n = 0;
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
                                }
                else 
                   DB_STORE();
          }
        else  {
                list.push({error: "Unauthorized Request ! "});
                res.json({message: list});
        }
})




function DB_STORE() {
    throw new Error('Function not implemented.');
}



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







function Pack(results: any, arg1: number, list: any[]):any[] {
    for(let y=0; y < results.length; y++)
           Model("",results[y],"",list,arg1)
    return list;
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



function addToList(arg0: any[], arg1: string) {
    let table = "CreavatechQ_"+arg1;
    for(let m = 0; m < arg0.length; m++){
        let doc = db.collection(table).doc(arg1).collection(table).doc();
         doc.set(arg0[m]);
    }
}





function CheckForNode(X:any) {
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
















