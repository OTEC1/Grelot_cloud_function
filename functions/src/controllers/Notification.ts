import * as functions from 'firebase-functions';
var Pushy = require('pushy');




export type NotificationPayload ={
   
    Key:{
      token:number,
    },
 
    User:{
        to:string
    }
    payload:{
        email:string,
        body:string,
        doc_id:string,
        pic:string,
        stake_id:string,
    },
     options: {
        notification: {
            badge: number,
            sound: string,
            email:string,
            pic:string,
            stake_id:string,
            body:string,
        },
    };
}











export const SendNofication =  functions.https.onRequest(async (req,res) => {

    let obj:NotificationPayload = req.body;

    let payload:any = await RouteAppsNotification(obj);
      res.json({message:payload})

});

   


function LoopAuthKeyParameterBased(param:number){

        if(param == 0)
            return process.env.PUSHY_TOKCOIN_KEY;
        else
            if(param == 1)
              return process.env.PUSHY_BEEPPOINT_KEY;
        else
            if(param == 2)
              return process.env.PUSHY_WEBFLY_KEY;
        else
            if(param == 3)
               return process.env.PUSHY_GRELOT_KEY;

};







async function RouteAppsNotification(payload:any):Promise<any>{

    let obj:NotificationPayload = payload;
    var api = new Pushy(LoopAuthKeyParameterBased(obj.Key.token));

        api.sendPushNotification(obj.payload, obj.User.to, obj.options,function (err: any, id:any){
            if(err)
              return {code:404,msg:err}
            else
              return {code:201,msg:id}
        });
};










export async function SendUpdate(e:NotificationPayload) {

    let payload:any =  await RouteAppsNotification(e);

    if(payload.code === 404)
         console.log("Error Occurred "+payload.msg) //send by user.email
    else
          console.log("Sent  Succesfully  to "+payload.msg)
}





