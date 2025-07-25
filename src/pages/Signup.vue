<script setup>
import { Amplify } from 'aws-amplify';
import awsconfig from '../amplifyconfiguration.json';
import SignupForm from '@/components/auth/SignupForm.vue';

Amplify.configure(awsconfig);
</script>

<template>
  <div class="container mx-auto py-12 px-4 flex items-center justify-center min-h-[80vh]">
    <SignupForm />
  </div>
</template>
