import { Amplify } from 'aws-amplify';
import { generateClient, type GraphQLResult } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsconfig from '../amplifyconfiguration.json';

// Configure Amplify
Amplify.configure(awsconfig);

// Create the base client
const baseClient = generateClient();

interface GraphQLOptions {
  query: string;
  variables?: Record<string, any>;
  authMode?: 'userPool' | 'apiKey' | 'iam' | 'oidc';
  authToken?: string;
}

/**
 * Enhanced GraphQL client that automatically adds authentication tokens
 * to all requests when the user is logged in
 */
export const api = {
  /**
   * Execute a GraphQL operation with automatic authentication
   * @param options - GraphQL operation options
   * @returns Promise with GraphQL response
   */
  graphql: async <T = any>(options: GraphQLOptions): Promise<GraphQLResult<T>> => {
    try {
      // Try to get the current auth session
      const { tokens } = await fetchAuthSession();
      
      // If we have a valid token, add it to the request
      if (tokens?.idToken) {
        return await baseClient.graphql({
          query: options.query,
          // @ts-ignore
          variables: options.variables,
          authMode: 'userPool',
          authToken: tokens.idToken.toString()
        }) as GraphQLResult<T>;
      }
    } catch (error) {
      console.log('Not authenticated or error fetching session:', error);
      // Continue without auth token if there's an error getting the session
    }
    
    // Fall back to default client behavior if not authenticated
    return await baseClient.graphql({
      query: options.query,
      // @ts-ignore
      variables: options.variables,
      authMode: options.authMode
    }) as GraphQLResult<T>;
  }
};

export default api;
