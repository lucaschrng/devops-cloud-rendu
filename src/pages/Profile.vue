<script setup>
import { ref, computed } from 'vue';
import { Amplify } from 'aws-amplify';
import { fetchUserAttributes, signOut, updateUserAttributes } from 'aws-amplify/auth';
import awsconfig from '../amplifyconfiguration.json';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, LogOutIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDate, parseDate, getLocalTimeZone, today, DateFormatter } from '@internationalized/date'
import { toDate } from 'reka-ui/date'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

Amplify.configure(awsconfig);

const placeholder = ref();
const queryClient = useQueryClient();

// Define form schema with zod
const formSchema = toTypedSchema(z.object({
  email: z.email().optional(),
  name: z.string().min(1, 'First name is required').max(50).optional(),
  family_name: z.string().min(1, 'Last name is required').max(50).optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  picture: z.url().optional().or(z.string().length(0)),
  profile: z.string().optional(),
  preferred_username: z.string().optional(),
}));

// Initialize form with vee-validate
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: '',
    name: '',
    family_name: '',
    birthdate: '',
    gender: '',
    picture: '',
    profile: '',
    preferred_username: '',
  }
});

// Use Vue Query to fetch user attributes
const { isLoading, error: queryError, data: userAttributes } = useQuery({
  queryKey: ['userAttributes'],
  queryFn: async () => {
    try {
      const attributes = await fetchUserAttributes();
      
      // Set form values when attributes are loaded
      if (attributes) {
        // Map given_name to name if it exists
        if (attributes.given_name) {
          attributes.name = attributes.given_name;
        }
        
        form.setValues(attributes);
      }
      
      return attributes;
    } catch (err) {
      console.error('Error fetching user attributes:', err);
      throw new Error('Failed to load user profile');
    }
  },
  refetchOnWindowFocus: false,
});

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const birthdate = computed({
  get: () => form.values.birthdate ? parseDate(form.values.birthdate) : undefined,
  set: val => val,
})

// Use Vue Query to update user attributes
const updateAttributesMutation = useMutation({
  mutationFn: async (updatedAttributes) => {
    return await updateUserAttributes({
      userAttributes: updatedAttributes
    });
  },
  onSuccess: () => {
    toast.success('Profile updated successfully!');
  },
  onError: (error) => {
    toast.error(`Failed to update profile: ${error.message || 'Please try again later'}`);
  }
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    // Map form values back to Cognito attribute names
    const updatedAttributes = {};
    Object.keys(values).forEach(key => {
      if (values[key] && String(values[key]).trim() !== '') {
        updatedAttributes[key] = values[key];
    }
    });
    
    // Don't update email as it requires verification
    delete updatedAttributes.email;
    
    if (Object.keys(updatedAttributes).length === 0) {
      toast.info('No changes to save');
      return;
    }
    
    // Execute the mutation
    await updateAttributesMutation.mutateAsync(updatedAttributes);
  } catch (err) {
    console.error('Error in form submission:', err);
  }
});

const router = useRouter();
const handleSignOut = async () => {
  try {
    await signOut();
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    queryClient.clear();
    router.push('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Your Profile</h1>
    
    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-3 text-muted-foreground">Loading your profile...</span>
    </div>
    
    <div v-else-if="queryError" class="p-4 mb-6 border border-destructive/50 text-destructive rounded-md bg-destructive/10">
      <p class="font-medium">{{ queryError.message }}</p>
    </div>
    
    <form v-else @submit="onSubmit" class="space-y-6 bg-card p-6 rounded-lg shadow-sm">
      <div v-if="updateAttributesMutation.isLoading" class="p-4 mb-6 border border-blue-500/50 text-blue-700 rounded-md bg-blue-50">
        <p class="font-medium">Saving your profile...</p>
      </div>
      
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email (cannot be changed)</FormLabel>
          <FormControl>
            <Input 
              v-bind="componentField" 
              type="email" 
              disabled
            />
          </FormControl>
        </FormItem>
      </FormField>
      
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input 
              v-bind="componentField" 
              type="text" 
              placeholder="Enter your first name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <FormField v-slot="{ componentField }" name="family_name">
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input 
              v-bind="componentField" 
              type="text" 
              placeholder="Enter your last name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <FormField name="birthdate">
        <FormItem>
          <FormLabel>Birthdate</FormLabel>
          <Popover>
            <PopoverTrigger as-child>
              <FormControl>
                <Button
                  variant="outline" :class="cn(
                    'w-[240px] ps-3 text-start font-normal',
                    !birthdate && 'text-muted-foreground',
                  )"
                >
                  <span>{{ birthdate ? df.format(toDate(birthdate)) : "Pick a date" }}</span>
                  <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                v-model:placeholder="placeholder"
                :model-value="birthdate"
                calendar-label="Date of birth"
                initial-focus
                :min-value="new CalendarDate(1900, 1, 1)"
                :max-value="today(getLocalTimeZone())"
                @update:model-value="(v) => {
                  if (v) {
                    form.setFieldValue('birthdate', v.toString())
                  }
                  else {
                    form.setFieldValue('birthdate', undefined)
                  }
                }"
              />
            </PopoverContent>
          </Popover>
          <input hidden>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField v-slot="{ componentField }" name="preferred_username">
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input 
                v-bind="componentField" 
                type="text" 
                placeholder="Enter your username"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        
        <FormField v-slot="{ componentField }" name="gender">
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      
      <FormField v-slot="{ componentField }" name="picture">
        <FormItem>
          <FormLabel>Profile Picture URL</FormLabel>
          <FormControl>
            <Input 
              v-bind="componentField" 
              type="url" 
              placeholder="Enter URL to your profile picture"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <div class="flex justify-end space-x-4 mt-6">
        <Button 
          type="submit" 
          :disabled="saving"
          class="min-w-[120px]"
        >
          {{ saving ? 'Saving...' : 'Save Profile' }}
        </Button>
      </div>
    </form>
    
    <div class="mt-6 text-center">
      <Button variant="destructive" @click="handleSignOut">
        <LogOutIcon class="h-4 w-4" />
        Logout
      </Button>
    </div>
  </div>
</template>
