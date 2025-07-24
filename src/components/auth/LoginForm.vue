<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();
const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await signIn({
      username: username.value,
      password: password.value,
    });
    
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    toast.success('Login successful!');
    router.push('/profile');
  } catch (err) {
    console.error('Error signing in:', err);
    error.value = err.message || 'Failed to sign in. Please check your credentials.';
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
        Login
      </CardTitle>
      <CardDescription>
        Enter your credentials below to login to your account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleLogin" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Username or Email</Label>
          <Input
            id="username"
            v-model="username"
            type="text"
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
        <div v-if="error" class="text-sm text-destructive">
          {{ error }}
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          {{ loading ? 'Logging in...' : 'Login' }}
        </Button>
      </form>
      <div class="mt-4 text-center text-sm">
        Don't have an account?
        <router-link to="/signup" class="text-primary hover:underline">
          Sign up
        </router-link>
      </div>
    </CardContent>
  </Card>
</template>
