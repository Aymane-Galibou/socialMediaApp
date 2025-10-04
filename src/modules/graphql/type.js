import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from "graphql";
import { userModel } from "../../DB/models/user.model.js";

const attachementType = new GraphQLObjectType({
  name: "attachementType",
  fields: {
    secure_url: {
      type: GraphQLString,
    },
    public_id: {
      type: GraphQLString,
    },
    _id: {
      type: GraphQLID,
    },
  },
});
export const userType = new GraphQLObjectType({
  name: "userType",
  fields: {
    name: {
      type: GraphQLString,
    },
    _id: {
      type: GraphQLID,
    },
    image: {
      type: attachementType,
    },
    email: {
      type: GraphQLString,
    },
    role: {
      type: GraphQLString,
    },
  },
});

export const postType = new GraphQLObjectType({
  name: "postType",
  fields: {
    content: {
      type: GraphQLString,
    },
    userId: {
      type: GraphQLString,
    },
    userInfo:{
      type:userType,
      resolve:async(parent,args)=>{
        const user=await userModel.findOne({_id:parent.userId})
        return user
      }
    },
    attachements: {
      type: new GraphQLList(attachementType),
    },
    deletedBy: {
      type: GraphQLID,
    },
    likes: {
      type: new GraphQLList(GraphQLID),
    },
    isDeleted: {
      type: GraphQLBoolean,
    },
  },
});
