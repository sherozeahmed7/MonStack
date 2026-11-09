import mongoose from 'mongoose';
const {Schema,model}=mongoose;
export const User=model('User',new Schema({name:{type:String,required:true},email:{type:String,unique:true,required:true},passwordHash:{type:String,required:true}},{timestamps:true}));
export const Session=model('Session',new Schema({tokenHash:{type:String,unique:true},userId:{type:Schema.Types.ObjectId,ref:'User'},expiresAt:{type:Date,expires:0}}));
const resume=new Schema({owner:{type:Schema.Types.ObjectId,required:true,index:true},company:{type:String,required:true},role:String,market:String,jd:String,resume:{type:Schema.Types.Mixed,required:true},sourceText:String,research:Schema.Types.Mixed,suggestions:Schema.Types.Mixed,jdSkills:[String],status:{type:String,enum:['Draft','Applied','Interview','Offer','Archived'],default:'Draft'}},{timestamps:true});
resume.index({owner:1,updatedAt:-1});
export const Resume=model('Resume',resume);
