<script setup>
  import { Authenticator } from "@aws-amplify/ui-vue";
  import "@aws-amplify/ui-vue/styles.css";

  import { Amplify } from 'aws-amplify';
  import awsconfig from '../amplifyconfiguration.json';
  
  import { Button } from '@/components/ui/button';

  Amplify.configure(awsconfig);
</script>

<template>
  <Authenticator>
    <template v-slot="{ user, signOut }">
      <div class="max-w-3xl mx-auto p-6 text-center">
        <h1 class="text-3xl font-bold mb-6">Hello {{ user.username }}!</h1>
        
        <div class="flex justify-center gap-4">
          <Button asChild variant="default">
            <router-link to="/profile">Edit Profile</router-link>
          </Button>
          <Button @click="signOut" variant="destructive">Sign Out</Button>
        </div>
      </div>
    </template>
  </Authenticator>
</template>
