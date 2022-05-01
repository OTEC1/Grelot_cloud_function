import * as functions from "firebase-functions";
var Pushy = require('pushy');
require('dotenv').config()


export const DynamicpostRender = functions.https.onRequest(async (req,res) => {
        
       let i = req.query.i!;
       let d= req.query.d!;
       let c = req.query.c!;
       let blog = "Kokocraft.ng";


     
 
    const ua = req.headers['user-agent'];
    console.log(ua, "LOG");


    if( ua === "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"){
            res.status(200).send(`<!doctype html xmlns="http://www.w3.org/1999/xhtml"
                                            xmlns:og="http://ogp.me/ns#"
                                            xmlns:fb="https://www.facebook.com/2008/fbml">
                                            <head>
                                            <title>${blog} </title>
                                            <meta property="og:url"           content="https://us-central1-webpack-4414a.cloudfunctions.net/dynamicpostRender"/>
                                            <meta property="og:type"          content="website" />
                                            <meta property="og:title"         content=${blog} />
                                            <meta property="og:description"   content="Kokocraft.ng  home of exquisite Apparels" />
                                            <meta property="og:image"         content=${i} />
                                            <meta property="og:image:type"    content="image/jpeg"/>
                                            <meta property="og:image:width:   content="100%"/>
                                            <meta property="og:image:height:  content="200"/>
                                            </head>
                                            <img src="${i}"/>
                                            <h5>${i}</h5>
                                            </html>`);
     } else
            res.redirect(redireactUrl(d,c))  
})




 



function redireactUrl(d:any, c:any){
    let url:any;
        if(c === "P")
          url="https://webflystore.web.app/model/"+d+"/"+c
        
    return url
}


type PayloadGrelot ={
    User:{
        to:string
    }

    payload:{
        id: string,
        email:string,
        item:string,
        doc_id:string,
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





var PUSHY_KOKO = new Pushy(process.env.PUSHY_WEBFLY_KEY);
export const Notificationwebflystore = functions.https.onRequest(async (request, response) => {
     let e:PayloadGrelot = request.body   
     PUSHY_KOKO.sendPushNotification(e.payload, e.User.to, e.options,function (err: any, id:any){
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

