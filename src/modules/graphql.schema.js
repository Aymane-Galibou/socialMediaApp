import { GraphQLObjectType, GraphQLSchema } from "graphql";
import {postQuery,postMutation } from "./graphql/fields.js";



export const graphSchema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"RootQueryType",
        fields:{
            ...postQuery
        }
    }),
    mutation:new GraphQLObjectType({
        name:"RootMutationType",
        fields:{
            ...postMutation
        }
    })
})