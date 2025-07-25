const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  GetGroupCommand,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const {
  DynamoDBClient,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb');

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});
const dynamodbClient = new DynamoDBClient({});

/**
 * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event, context) => {
  // Get the group from user attributes, fallback to default
  const userSelectedGroup = event.request.userAttributes['custom:role'] || 'User';
  console.log(`User selected group: ${userSelectedGroup}`); 
  console.log(`User selected group: ${userSelectedGroup}`);
  const groupParams = {
    GroupName: userSelectedGroup,
    UserPoolId: event.userPoolId,
  };
  const addUserParams = {
    GroupName: userSelectedGroup,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };
  
  /**
   * Check if the group exists; if it doesn't, create it.
   */
  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
    console.log(`Group ${userSelectedGroup} already exists`);
  } catch (e) {
    console.log(`Creating new group: ${userSelectedGroup}`);
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand({
      ...groupParams,
      Description: `Auto-created group for ${userSelectedGroup} users`
    }));
  }
  
  /**
   * Then, add the user to the group.
   */
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addUserParams));
  console.log(`User ${event.userName} added to group ${userSelectedGroup}`);

  /**
   * Add user to DynamoDB table using Amplify-provided table name
   */
  const userItem = {
    TableName: process.env.API_DEVOPSCLOUDRENDU_USERTABLE_NAME,
    Item: {
      id: { S: event.userName },
      email: { S: event.request.userAttributes.email },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
      groupName: { S: userSelectedGroup },
      __typename: { S: 'User' },
      ...(event.request.userAttributes.given_name && {
        firstName: { S: event.request.userAttributes.given_name }
      }),
      ...(event.request.userAttributes.family_name && {
        lastName: { S: event.request.userAttributes.family_name }
      }),
      // Add the user-selected group as a field
      ...(event.request.userAttributes['custom:role'] && {
        userType: { S: event.request.userAttributes['custom:role'] }
      }),
    },
  };

  try {
    await dynamodbClient.send(new PutItemCommand(userItem));
    console.log('User successfully added to DynamoDB table:', process.env.API_DEVOPSCLOUDRENDU_USERTABLE_NAME);
  } catch (error) {
    console.error('Error adding user to DynamoDB:', error);
  }

  return event;
};