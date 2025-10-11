import mongoose, { Schema, model } from "mongoose";

export const genderTypes={
    male:"male",
    female:"female",
    other:"other"
}

export const rolesTypes={
    user:"user",
    admin:"admin",
    superAdmin:"superAdmin"
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },   
     pendingEmail: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: rolesTypes.user,
      enum: Object.values(rolesTypes),
    },
    gender:{
        type:String,
        enum:Object.values(genderTypes),
        default:genderTypes.other,
    },
    image:{
      secure_url:String,
      public_id:String,
    },
    updatedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    coverImage:{
        type:[String],
    },
    confirmed:{
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    otpEmail:{
      type:String
    },
    otpnewEmail:{
      type:String
    },
    otpoldEmail:{
      type:String
    },
    otpPassword:{
      type:String
    },
    passwordChangedAt:Date,
    viewers:[
      {
        userId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"users"
        },
        time:[Date]
      }
    ],
  friends:[{type:mongoose.Schema.Types.ObjectId,ref:"users"}]
  },
  {
    timestamps: true,
  }
);
// userSchema.pre("save",function(next,doc){
//   console.log("=============================pre log================================");
//   next()
// })
// userSchema.post("save",function(doc,next){
//   console.log("=============================after log================================");
//   next()
// })

export const userModel = mongoose.models.users|| model("users", userSchema);
