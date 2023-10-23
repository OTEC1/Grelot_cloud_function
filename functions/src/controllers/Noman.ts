import * as functions from "firebase-functions";
import { v4 as uuid } from 'uuid';
import * as cloudinary from 'cloudinary';
import * as AWS from 'aws-sdk';



export const Noman_id_genrator = functions.https.onRequest(async (request, respones)=> {
    respones.json({
        message: uuid()
    })
})



type BaseUrl = {
url:string,  
publicface:string,
}

//Image Resizer
export const ImgResize = functions.https.onRequest((request, respones)=>{
    let  e: BaseUrl = request.body;
    //console.log(e.publicface, e.url);
    cloudinary.v2.config({
        cloud_name:process.env.REACT_APP_CLOUNDINARY_NAME,
        api_key:process.env.REACT_APP_CLOUDINARY_KEY,
        api_secret:process.env.REACT_APP_CLOUNDINARY_SECRET
    })

    cloudinary.v2.uploader.upload(e.url,
        {public_id:e.publicface},
        function(err,result){
                console.log(err);
                return respones.json({
                    message: result?.url
                })
             
            });
});






export const DeleteCloud = functions.https.onRequest((request, respones)=>{
    let  e: BaseUrl = request.body;
    //console.log(e.publicface, e.url);
    cloudinary.v2.config({
        cloud_name:process.env.REACT_APP_CLOUNDINARY_NAME,
        api_key:process.env.REACT_APP_CLOUDINARY_KEY,
        api_secret:process.env.REACT_APP_CLOUNDINARY_SECRET
    })
    cloudinary.v2.uploader.destroy(e.publicface,
        function(err,result){
              if(err)
                   return respones.json({
                    message: err
                  })
                if(result)
                    return respones.json({
                        message: result?.url
                 })
        });
});






type VideoConstrants = {
 url: any,
 thumbnail:string
}



const bucket = new AWS.S3({
accessKeyId: process.env.REACT_APP_P1,
secretAccessKey: process.env.REACT_APP_P2,
apiVersion: process.env.REACT_APP_API_VERSION,
httpOptions: {timeout: 0}
});



export const DeletePost = functions.https.onRequest(async (request,response) => {
        let e: VideoConstrants = request.body;
        console.log(e.url);
                    const   params = {
                        Bucket: process.env.REACT_APP_P4!,
                        Key:  e.thumbnail
                    };
    
                        bucket.deleteObject(params)
                          .on('httpDone', (e) => { 
                             response.json({
                                message : "Thumnail Deleted"
                            })
                         })
                            .send((err) => {
                            if(err) {
                                 response.json({
                                    message : "Snap error occurred: " +err
                                })
                            }
                        });
})



export const getTimeStamp =  functions.https.onRequest(async (request,res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({timestamp: Date.now()}));

});



export const getUserAgent = functions.https.onRequest(async (req,res) => {
    res.json({agent:  req.headers['user-agent']})
})

