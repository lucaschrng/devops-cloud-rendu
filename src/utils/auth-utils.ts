import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export interface UserRole {
  isAdmin: boolean;
  isUser: boolean;
  groups: string[];
}

/**
 * Get the current user's roles from Cognito User Pool groups
 */
export const getUserRoles = async (): Promise<UserRole> => {
  try {
    const session = await fetchAuthSession();
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
    
    return {
      isAdmin: groups.includes('Admin'),
      isUser: groups.includes('User'),
      groups
    };
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return {
      isAdmin: false,
      isUser: false,
      groups: []
    };
  }
};

/**
 * Check if the current user has admin privileges
 */
export const isUserAdmin = async (): Promise<boolean> => {
  const roles = await getUserRoles();
  return roles.isAdmin;
};

/**
 * Check if the current user can create products
 */
export const canCreateProducts = async (): Promise<boolean> => {
  return await isUserAdmin();
};

/**
 * Check if the current user can comment on products
 */
export const canCommentOnProducts = async (): Promise<boolean> => {
  const roles = await getUserRoles();
  return roles.isAdmin || roles.isUser;
};

/**
 * Get current user information
 */
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    const roles = await getUserRoles();
    
    return {
      user,
      roles
    };
  } catch (error) {
    console.error('Error getting current user info:', error);
    throw error;
  }
};

/**
 * Ensure user exists in DynamoDB, create if not
 */
export const ensureUserExists = async () => {
  try {
    const cognitoUser = await getCurrentUser();
    console.log('Current Cognito user:', cognitoUser);
    
    // Check if user exists in DynamoDB
    const { getUser } = await import('../graphql/queries');
    const { createUser } = await import('../graphql/mutations');
    const api = (await import('../utils/api-client')).default;
    
    try {
      const userResponse = await api.graphql({
        query: getUser,
        variables: { id: cognitoUser.userId }
      });
      
      if (userResponse.data.getUser) {
        console.log('User exists in DynamoDB');
        return userResponse.data.getUser;
      }
    } catch (error) {
      console.log('User not found in DynamoDB, creating...');
      console.log('Search error details:', error);
    }
    
    // Create user if doesn't exist
    const userInput = {
      id: cognitoUser.userId,
      username: cognitoUser.username,
      email: cognitoUser.signInDetails?.loginId || 'unknown@example.com',
      firstName: '',
      lastName: ''
    };
    
    console.log('Attempting to create user with input:', userInput);
    
    const createUserResponse = await api.graphql({
      query: createUser,
      variables: { input: userInput }
    });
    
    if (createUserResponse.errors) {
      console.error('GraphQL errors during user creation:', createUserResponse.errors);
      throw new Error(`User creation failed: ${createUserResponse.errors[0]?.message}`);
    }
    
    console.log('Created user in DynamoDB:', createUserResponse.data.createUser);
    return createUserResponse.data.createUser;
    
  } catch (error: any) {
    console.error('Error ensuring user exists:', error);
    
    // Log more details about the error
    if (error?.errors) {
      console.error('GraphQL errors:', error.errors);
      error.errors.forEach((err: any, index: number) => {
        console.error(`Error ${index + 1}:`, err.message, err.path);
      });
    }
    
    throw error;
  }
};

/**
 * Try to ensure user exists in DynamoDB, but don't fail if it doesn't work
 */
export const tryEnsureUserExists = async (): Promise<boolean> => {
  try {
    await ensureUserExists();
    return true;
  } catch (error) {
    console.warn('Could not ensure user exists, continuing anyway:', error);
    return false;
  }
};
