import { db } from "../config/firebase";
import * as functions from "firebase-functions";





//Start of monclaris functions
type  RegisterUsers = {
    User:{
        name:string,
        phone:number,
        email:string,
        password:string,
        doc_id:string,
    },

}


export const Registeruser = functions.https.onRequest(async  (request,response) => {
        try{
            let e: RegisterUsers = request.body

            

            let f = db.collection("MonclarisRegister").doc();
            e.User.doc_id = f.id;
            f.set(e);
            response.json({
                message : "New User Registered"
             })
        }catch(err){
            response.json({
                message: err as Error
            })
        }
})
//End of monclaris



