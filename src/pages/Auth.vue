<script setup>
  import { Authenticator } from "@aws-amplify/ui-vue";
  import "@aws-amplify/ui-vue/styles.css";

  import { Amplify } from 'aws-amplify';
  import awsconfig from '../amplifyconfiguration.json';

  Amplify.configure(awsconfig);
</script>

<template>
  <Authenticator>
    <template v-slot="{ user, signOut }">
      <div class="auth-container">
        <h1>Hello {{ user.username }}!</h1>
        
        <div class="button-group">
          <router-link to="/profile" class="profile-button">Edit Profile</router-link>
          <button @click="signOut" class="sign-out-button">Sign Out</button>
        </div>
      </div>
    </template>
  </Authenticator>
</template>

<style scoped>
.auth-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.profile-button {
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  transition: background-color 0.3s;
}

.profile-button:hover {
  background-color: #1976d2;
}

.sign-out-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sign-out-button:hover {
  background-color: #d32f2f;
}
</style>