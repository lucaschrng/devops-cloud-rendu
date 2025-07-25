/* Amplify Params - DO NOT EDIT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIENDPOINTOUTPUT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIIDOUTPUT
	API_DEVOPSCLOUDRENDU_GRAPHQLAPIKEYOUTPUT
	API_DEVOPSCLOUDRENDU_PRODUCTTABLE_ARN
	API_DEVOPSCLOUDRENDU_PRODUCTTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const tableName = process.env.API_DEVOPSCLOUDRENDU_PRODUCTTABLE_NAME;
        
        console.log('Table name:', tableName);
        
        const params = {
            TableName: tableName,
            Select: 'COUNT'
        };
        
        const command = new ScanCommand(params);
        const result = await dynamodb.send(command);
        
        console.log('Scan result:', result);
        
        return result.Count;
    } catch (error) {
        console.error('Error getting product count:', error);
        throw new Error('Failed to get product count');
    }
};