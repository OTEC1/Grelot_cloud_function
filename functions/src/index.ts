import * as functions from "firebase-functions";
import { dynamicpostRender, webdealitAddMovie, webdealitAddMusic, webdealitAddPost, webdealitGetAllPost, webdealitGetAllPostByOrientation, webdealitGetAllPostByViews, webdealitGetMovie, webdealitGetMovieBydownloadCount, webdealitGetMovieByName, webdealitGetMovieUpdatedownloadCount, webdealitGetMusic, webdealitGetMusicByArtiseName, webdealitGetMusicByArtiseSort, webdealitGetMusicByLink, webdealitGetMusicByMusictitle, webdealitGetPostbylink, webdealitGetSignleUserPost, webdealitHomePageTopList, webdealitPostByTitle, webdealitRidirectUrl, webdealitSignInUser, webdealitVisitCount, webdealitVisitGetCount, Webdealit_Genre, webdealit_lock, webdealit_Movie_categories, webdealit_RegisterUser, webdealit_thumbsUp_and_views } from "./controllers/Webflyclick";
import { Grelot_lock, records, reaction_count, listofproducts, listofUserAgeGrade, pushyapi, Sign_up_new_user, Paid_cart_uploaded, Notificationpush, UserlocationPhoneNumber,Sign_in_user_google, LoginUser, GetUserDetails, VerifyUser, Addvendorinvestment, GetvendorInvestment, Uploadproducts,dynamicpostrender2} from "./controllers/Grelot";
import {AuthUserSession,RegisterNewUser,UserFund,ManageUserAcct,GroupCreate,JoinGroupCheck,WithdrawfundsFromGroup,GetListOfCreatedGroup,LoadActiveGroup,LoadInactiveGroup, Group_action, User_action,Voches, creator_cancel,purchasevoches,ExchangeFunds, SignInWithEmail,GenerateRandom} from './controllers/Cravetech';
import { Noman_id_genrator, ImgResize, DeletePost,getTimeStamp, getUserAgent} from "./controllers/Noman";
import { DynamicpostRender, Notificationwebflystore } from "./controllers/Webflystore";
import { Registeruser } from "./controllers/Monclaris";
import cookieParser = require("cookie-parser");
import  * as express from 'express';
import * as cors1 from 'cors';
const cors = cors1(({ origin: true }));









let q:any;
q = true;
const domain1 = (p:number) => {
  return p === 1 ? "https://cravetech-9b39c.web.app"  : "http://localhost:3000"
}

const Cravetech = express();
var corsOptions = {
    origin: domain1(1),
    credentials : true
   }

Cravetech.use(cors1(corsOptions));
Cravetech.use(function (req, res, next) {	
    res.setHeader('Access-Control-Allow-Origin', domain1(1));    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');   
    res.setHeader('Access-Control-Allow-Credentials', q);    
    next();
});
Cravetech.use(cookieParser());
Cravetech.use(attachCsrfToken1('/', 'csrfToken', (Math.random()* 100000000000000000).toString()));
function attachCsrfToken1(url:any, cookie:any, value:any) {
    return function(req:any, res:any, next:any) {
      if (req.url === url) {
        res.cookie(cookie, value);
      }
      next();
    }
  }


Cravetech.post("/AuthUserSession", AuthUserSession);
Cravetech.post("/RegisterNewUser", RegisterNewUser);
Cravetech.post("/GroupCreation",GroupCreate);
Cravetech.post("/JoinGroupCheck",JoinGroupCheck);
Cravetech.post("/LeaveGroup",WithdrawfundsFromGroup);
Cravetech.post("/GetListOfCreatedGroup",GetListOfCreatedGroup);
Cravetech.post("/LoadActiveGroup",LoadActiveGroup)
Cravetech.post("/LoadInactiveGroup",LoadInactiveGroup);
Cravetech.post("/bot_mine",Group_action);
Cravetech.post("/user_mine",User_action);
Cravetech.post("/SignInWithEmail",SignInWithEmail);
Cravetech.post("/purchasevoches",purchasevoches);
Cravetech.post("/ExchangeFunds",ExchangeFunds);
Cravetech.post("/creatorcancel",creator_cancel);
Cravetech.post("/Userfunds", UserFund);
Cravetech.post("/Voches",Voches);

Cravetech.post("", GenerateRandom);
Cravetech.post("", ManageUserAcct);

exports.Cravetech = functions.https.onRequest(Cravetech);






const Webflystore = express();
Webflystore.use(cors);
Webflystore.post("/DynamicpostRender", DynamicpostRender);
Webflystore.post("/Notificationwebflystore", Notificationwebflystore);
exports.Webflystore = functions.https.onRequest(Webflystore);





const WebflyClick = express();
WebflyClick.use(cors);
WebflyClick.post("/webdealitAddPost",webdealitAddPost);
WebflyClick.get("/webdealitGetAllPost",webdealitGetAllPost);
WebflyClick.post("/webdealitGetPostbylink",webdealitGetPostbylink);
WebflyClick.get("/webdealitGetAllPostByViews",webdealitGetAllPostByViews);
WebflyClick.post("/webdealitGetAllPostByOrientation",webdealitGetAllPostByOrientation);
WebflyClick.post("/webdealitPostByTitle",webdealitPostByTitle);
WebflyClick.post("/webdealitGetSignleUserPost",webdealitGetSignleUserPost);
WebflyClick.post("/webdealit_thumbsUp_and_views",webdealit_thumbsUp_and_views);
WebflyClick.post("/webdealit_RegisterUser",webdealit_RegisterUser);
WebflyClick.post("/webdealitSignInUser",webdealitSignInUser);
WebflyClick.get("/webdealit_Movie_categories",webdealit_Movie_categories);
WebflyClick.get("/webdealit_lock",webdealit_lock);
WebflyClick.post("/webdealitAddMovie",webdealitAddMovie);
WebflyClick.get("/webdealitGetMovie",webdealitGetMovie);
WebflyClick.get("/webdealitGetMovieBydownloadCount",webdealitGetMovieBydownloadCount);
WebflyClick.get("/webdealitGetMovieByName",webdealitGetMovieByName);
WebflyClick.post("/webdealitGetMovieUpdatedownloadCount",webdealitGetMovieUpdatedownloadCount);
WebflyClick.post("/webdealitAddMusic",webdealitAddMusic);
WebflyClick.get("/webdealitGetMusic",webdealitGetMusic);
WebflyClick.get("webdealitGetMusicByArtiseSort",webdealitGetMusicByArtiseSort);
WebflyClick.post("/webdealitGetMusicByArtiseName",webdealitGetMusicByArtiseName);
WebflyClick.post("/webdealitGetMusicByMusictitle",webdealitGetMusicByMusictitle);
WebflyClick.post("/webdealitGetMusicByLink",webdealitGetMusicByLink);
WebflyClick.get("/Webdealit_Genre",Webdealit_Genre);
WebflyClick.post("/webdealitVisitCount",webdealitVisitCount);
WebflyClick.get("/webdealitVisitGetCount",webdealitVisitGetCount);
WebflyClick.get("/webdealitHomePageTopList",webdealitHomePageTopList);
WebflyClick.get("/webdealitRidirectUrl",webdealitRidirectUrl);
WebflyClick.get("/dynamicpostRender",dynamicpostRender);
exports.WebflyClick = functions.https.onRequest(WebflyClick);



const Noman = express();
Noman.use(cors);
Noman.get("/Noman_id_genrator",Noman_id_genrator);
Noman.post("/ImgResize",ImgResize);
Noman.post("/DeletePost",DeletePost);
Noman.get("/getTimeStamp",getTimeStamp);
Noman.get("/getUserAgent",getUserAgent);
exports.Noman = functions.https.onRequest(Noman);





const Monclaris = express();
Monclaris.use(cors);
Monclaris.post("Registeruser",Registeruser);
exports.Monclaris = functions.https.onRequest(Monclaris);





let v:any;
v = true;
const domain2 = (n:number) => {
  return n === 1 ? "https://grelots-ad690.web.app"  : "http://localhost:3000"
}

const Grelot = express();
var corsOptions = {
    origin: domain2(2),
    credentials : true
   }

Grelot.use(cors1(corsOptions));
Grelot.use(function (req, res, next) {	
    res.setHeader('Access-Control-Allow-Origin', domain2(2));    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');   
    res.setHeader('Access-Control-Allow-Credentials', v);    
    next();
});
Grelot.use(cookieParser());
Grelot.use(attachCsrfToken('/', 'csrfToken', (Math.random() * 100000000000000000).toString()));
function attachCsrfToken(url:any, cookie:any, value:any) {
    return function(req:any, res:any, next:any) {
      if (req.url === url) {
        res.cookie(cookie, value);
      }
      next();
    }
  }

Grelot.get("/Grelot_lock",Grelot_lock);
Grelot.post("/records",records);
Grelot.post("/thumbs",reaction_count);

Grelot.get("/listofproducts",listofproducts);
Grelot.post("/Paid_cart_uploaded",Paid_cart_uploaded);


Grelot.get("/listofUserAgeGrade",listofUserAgeGrade);
Grelot.post("/pushyapi",pushyapi);
Grelot.post("/Sign_up_new_user",Sign_up_new_user);
Grelot.post("/Notificationpush",Notificationpush);
Grelot.get("/UserlocationPhoneNumber",UserlocationPhoneNumber);
Grelot.post("/Sign_in_user_google",Sign_in_user_google);
Grelot.post("/LoginUser", LoginUser);
Grelot.post("/GetUserDetails", GetUserDetails);
Grelot.post("/VerifyUser", VerifyUser);


Grelot.post("/VendorInvest",Addvendorinvestment);
Grelot.post("/GetVendorInvest",GetvendorInvestment);

Grelot.post("/dynamicpostRender", dynamicpostrender2);
Grelot.post("/Uploadproducts",Uploadproducts);


exports.Grelot = functions.https.onRequest(Grelot);







