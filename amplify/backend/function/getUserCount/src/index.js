/* Amplify Params - DO NOT EDIT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIENDPOINTOUTPUT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIIDOUTPUT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIKEYOUTPUT
	API_DEVOPSCLOUDRENDU_USERTABLE_ARN
	API_DEVOPSCLOUDRENDU_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const tableName = `User-${process.env.API_DEVOPSCLOUDRENDU_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`;
        
        const params = {
            TableName: tableName,
            Select: 'COUNT'
        };
        
        const command = new ScanCommand(params);
        const result = await dynamodb.send(command);

        return result.Count;
    } catch (error) {
        console.error('Error getting user count:', error);
        throw new Error('Failed to get user count');
    }
};