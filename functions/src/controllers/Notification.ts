
var Pushy = require('pushy');

type Payload ={
   
    User:{
        to:string
    }
    payload:{
        email:string,
        body:string,
        doc_id:string,
        pic:string,
    },
     options: {
        notification: {
            badge: number,
            sound: string,
            email:string,
            pic:string,
            body:string,
        },
    };
}



export function SendUpdate(pushy_key: string | undefined,e:Payload, user:any) {
    var api = new Pushy(pushy_key);
            api.sendPushNotification(e.payload, user.device_token, e.options,function (err: any, id:any){
                if(err)
                    console.log("Error Occurred "+err) //send by user.email
                else
                    console.log("Sent  Succesfully  to "+id)
            });
}
