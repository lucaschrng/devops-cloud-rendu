// Custom GraphQL queries for enhanced functionality
export const listProductsWithComments = /* GraphQL */ `
  query ListProductsWithComments(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        imageUrl
        ownerId
        createdAt
        updatedAt
        comments {
          items {
            id
          }
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const getProductWithComments = /* GraphQL */ `
  query GetProductWithComments($id: ID!) {
    getProduct(id: $id) {
      id
      title
      description
      imageUrl
      ownerId
      createdAt
      updatedAt
      comments {
        items {
          id
          content
          createdAt
          author {
            id
            username
            firstName
            lastName
            __typename
          }
          __typename
        }
        nextToken
        __typename
      }
      __typename
    }
  }
`;

export const getProductSafe = /* GraphQL */ `
  query GetProductSafe($id: ID!) {
    getProduct(id: $id) {
      id
      title
      description
      imageUrl
      ownerId
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const commentsByProductIdSafe = /* GraphQL */ `
  query CommentsByProductIdSafe(
    $productId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsByProductId(
      productId: $productId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        content
        productId
        authorId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const createCommentSafe = /* GraphQL */ `
  mutation CreateCommentSafe(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
      id
      content
      productId
      authorId
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
