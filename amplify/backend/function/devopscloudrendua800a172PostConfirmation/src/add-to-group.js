// const {
//   CognitoIdentityProviderClient,
//   AdminAddUserToGroupCommand,
//   GetGroupCommand,
//   CreateGroupCommand,
// } = require('@aws-sdk/client-cognito-identity-provider');

// const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});

// /**
//  * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
//  */
// exports.handler = async (event) => {
//   const groupParams = {
//     GroupName: process.env.GROUP,
//     UserPoolId: event.userPoolId,
//   };
//   const addUserParams = {
//     GroupName: process.env.GROUP,
//     UserPoolId: event.userPoolId,
//     Username: event.userName,
//   };
//   /**
//    * Check if the group exists; if it doesn't, create it.
//    */
//   try {
//     await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
//   } catch (e) {
//     await cognitoIdentityServiceProvider.send(new CreateGroupCommand(groupParams));
//   }
//   /**
//    * Then, add the user to the group.
//    */
//   await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addUserParams));

//   return event;
// };
const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  GetGroupCommand,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  // Use the same logic as custom.js
  const userSelectedGroup = event.request.userAttributes['custom:role'] || 'User';
  
  const groupParams = {
    GroupName: userSelectedGroup, // Don't use process.env.GROUP
    UserPoolId: event.userPoolId,
  };
  const addUserParams = {
    GroupName: userSelectedGroup, // Don't use process.env.GROUP
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };
  
  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
  } catch (e) {
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand(groupParams));
  }
  
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addUserParams));

  return event;
};