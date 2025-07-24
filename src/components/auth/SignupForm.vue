<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { useQueryClient } from '@tanstack/vue-query';

const router = useRouter();
const username = ref('');
const password = ref('');
const email = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const showConfirmation = ref(false);
const confirmationCode = ref('');

const handleSignup = async () => {
  const queryClient = useQueryClient()
  if (!username.value || !password.value || !email.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await signUp({
      username: username.value,
      password: password.value,
      options: {
        userAttributes: {
          email: email.value,
        },
        autoSignIn: true,
      },
    });
    
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    toast.success('Signup successful! Please check your email for confirmation code.');
    showConfirmation.value = true;
  } catch (err) {
    console.error('Error signing up:', err);
    error.value = err.message || 'Failed to sign up. Please try again.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleConfirmation = async () => {
  if (!confirmationCode.value) {
    error.value = 'Please enter the confirmation code';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await confirmSignUp({
      username: username.value,
      confirmationCode: confirmationCode.value,
    });
    
    toast.success('Account confirmed! You can now login.');
    router.push('/login');
  } catch (err) {
    console.error('Error confirming signup:', err);
    error.value = err.message || 'Failed to confirm account. Please try again.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-2xl">
        {{ showConfirmation ? 'Confirm Account' : 'Create an Account' }}
      </CardTitle>
      <CardDescription>
        {{ showConfirmation ? 'Enter the confirmation code sent to your email' : 'Enter your details to create a new account' }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form v-if="!showConfirmation" @submit.prevent="handleSignup" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="username"
            type="text"
            placeholder="johndoe"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="johndoe@example.com"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input 
            id="password" 
            v-model="password"
            type="password" 
            required 
          />
        </div>
        <div class="grid gap-2">
          <Label for="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            v-model="confirmPassword"
            type="password" 
            required 
          />
        </div>
        <div v-if="error" class="text-sm text-destructive">
          {{ error }}
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          {{ loading ? 'Signing up...' : 'Sign up' }}
        </Button>
      </form>

      <form v-else @submit.prevent="handleConfirmation" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="confirmationCode">Confirmation Code</Label>
          <Input
            id="confirmationCode"
            v-model="confirmationCode"
            type="text"
            placeholder="Enter code from your email"
            required
          />
        </div>
        <div v-if="error" class="text-sm text-destructive">
          {{ error }}
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          {{ loading ? 'Confirming...' : 'Confirm Account' }}
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        Already have an account?
        <router-link to="/login" class="text-primary hover:underline">
          Login
        </router-link>
      </div>
    </CardContent>
  </Card>
</template>
