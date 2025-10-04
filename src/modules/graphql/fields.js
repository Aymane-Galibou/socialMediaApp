import { GraphQLID,GraphQLList,GraphQLString} from "graphql";
import * as PT from "./type.js";
import * as PR from './resolve.js'


export const postQuery = { 

  getOnePostField:{
    type: PT.postType,
    args: {
      postId: {
        type: GraphQLID,
      },
    },
    resolve: PR.getOnePost,
  },
  getAllPostsField:{
        type: new GraphQLList(PT.postType),
        resolve:PR.getAllPosts

  }

}

export const postMutation = {
  likePostField: {
    type: PT.postType,
    args: {
      postId: {
        type: GraphQLID,
      },
      authorization:{
        type:GraphQLString
      },
      accessRole:{
        type:new GraphQLList(GraphQLString)
      }

    },
    resolve: PR.likePost,
  },
}; 

