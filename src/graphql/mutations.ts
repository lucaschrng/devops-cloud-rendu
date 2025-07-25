/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
    id
    username
    email
    firstName
    lastName
    products {
      nextToken
      __typename
    }
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
    id
    username
    email
    firstName
    lastName
    products {
      nextToken
      __typename
    }
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
    id
    username
    email
    firstName
    lastName
    products {
      nextToken
      __typename
    }
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createProduct = /* GraphQL */ `mutation CreateProduct(
  $input: CreateProductInput!
  $condition: ModelProductConditionInput
) {
  createProduct(input: $input, condition: $condition) {
    id
    title
    description
    imageUrl
    owner {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    ownerId
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateProductMutationVariables,
  APITypes.CreateProductMutation
>;
export const updateProduct = /* GraphQL */ `mutation UpdateProduct(
  $input: UpdateProductInput!
  $condition: ModelProductConditionInput
) {
  updateProduct(input: $input, condition: $condition) {
    id
    title
    description
    imageUrl
    owner {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    ownerId
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateProductMutationVariables,
  APITypes.UpdateProductMutation
>;
export const deleteProduct = /* GraphQL */ `mutation DeleteProduct(
  $input: DeleteProductInput!
  $condition: ModelProductConditionInput
) {
  deleteProduct(input: $input, condition: $condition) {
    id
    title
    description
    imageUrl
    owner {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    ownerId
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteProductMutationVariables,
  APITypes.DeleteProductMutation
>;
export const createComment = /* GraphQL */ `mutation CreateComment(
  $input: CreateCommentInput!
  $condition: ModelCommentConditionInput
) {
  createComment(input: $input, condition: $condition) {
    id
    content
    product {
      id
      title
      description
      imageUrl
      ownerId
      createdAt
      updatedAt
      __typename
    }
    productId
    author {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    authorId
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCommentMutationVariables,
  APITypes.CreateCommentMutation
>;
export const updateComment = /* GraphQL */ `mutation UpdateComment(
  $input: UpdateCommentInput!
  $condition: ModelCommentConditionInput
) {
  updateComment(input: $input, condition: $condition) {
    id
    content
    product {
      id
      title
      description
      imageUrl
      ownerId
      createdAt
      updatedAt
      __typename
    }
    productId
    author {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    authorId
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCommentMutationVariables,
  APITypes.UpdateCommentMutation
>;
export const deleteComment = /* GraphQL */ `mutation DeleteComment(
  $input: DeleteCommentInput!
  $condition: ModelCommentConditionInput
) {
  deleteComment(input: $input, condition: $condition) {
    id
    content
    product {
      id
      title
      description
      imageUrl
      ownerId
      createdAt
      updatedAt
      __typename
    }
    productId
    author {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
      owner
      __typename
    }
    authorId
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCommentMutationVariables,
  APITypes.DeleteCommentMutation
>;
