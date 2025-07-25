<script setup>
import { ref, computed } from 'vue';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { createProduct } from '../graphql/mutations';
import { getUser, listUsers } from '../graphql/queries';
import { createUser } from '../graphql/mutations';
import { useRouter } from 'vue-router';
import api from '../utils/api-client';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { toast } from 'vue-sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const imageFile = ref(null);
const imagePreview = ref('');
const errorMessage = ref('');

// Form validation schema
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must not exceed 100 characters' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(1000, { message: 'Description must not exceed 1000 characters' }),
    image: z.any().optional(),
  })
);

// Form setup
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    description: ''
  },
});

// Authentication is now handled by the router guard

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Clear image preview
const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = '';
  
  // Clear the file input by recreating it
  const fileInput = document.getElementById('product-image');
  if (fileInput) {
    fileInput.value = '';
  }
};

const onSubmit = async (values) => {
  try {
    form.setFieldValue('isSubmitting', true);
    errorMessage.value = '';
    
    // Get the current session which includes the JWT token
    const { tokens } = await fetchAuthSession();
    if (!tokens) {
      errorMessage.value = 'Authentication session expired. Please log in again.';
      toast.error('Session expired', {
        description: 'Please log in again to continue',
      });
      form.setFieldValue('isSubmitting', false);
      return;
    }
    
    // Get current Cognito user
    const cognitoUser = await getCurrentUser();
    console.log('Current Cognito user:', cognitoUser);
    
    // Try to get user from DynamoDB, but don't fail if it doesn't exist
    let userId = cognitoUser.userId; // Default to Cognito user ID
    try {
      const userResponse = await api.graphql({
        query: getUser,
        variables: { id: cognitoUser.userId }
      });
      
      if (userResponse.data.getUser) {
        userId = userResponse.data.getUser.id;
        console.log('Found existing user:', userResponse.data.getUser);
      }
    } catch (userError) {
      console.log('User not found in DynamoDB, using Cognito user ID directly');
      // We'll use the Cognito user ID directly for now
      // The user creation should happen through a different mechanism (like a Lambda trigger)
      toast.info('User profile setup needed', {
        description: 'Some features may be limited until profile is complete',
      });
    }
    
    let imageUrl = '';
    console.log(imageFile.value, 'Image file selected:', imageFile.value);
    
    if (imageFile.value) {
      console.log('Uploading image:', imageFile.value);
      
      // Use correct Amplify v6 path structure
      const fileName = `public/${Date.now()}-${imageFile.value.name}`;
      
      try {
        console.log('Attempting S3 upload with public path...');
      
        const uploadResult = await uploadData({
          path: fileName, 
          data: imageFile.value,
          options: {
            contentType: imageFile.value.type
          }
        }).result;

        console.log('Image uploaded successfully:', uploadResult);

        const result = await getUrl({
          path: fileName  
        });
        
        console.log('Image URL generated:', result);
        imageUrl = result.url.toString();
        
      } catch (storageError) {
        console.error('Public upload failed, trying protected:', storageError);
     
        try {
          const protectedFileName = `protected/${cognitoUser.userId}/${Date.now()}-${imageFile.value.name}`;
          
          const uploadResult = await uploadData({
            path: protectedFileName,
            data: imageFile.value,
            options: {
              contentType: imageFile.value.type
            }
          }).result;

          const result = await getUrl({
            path: protectedFileName
          });
          
          imageUrl = result.url.toString();
          console.log('Protected upload successful');
          
        } catch (protectedError) {
          console.error('Both upload methods failed:', protectedError);
          toast.warning('Image upload failed', {
            description: `Storage permissions issue: ${protectedError.message || 'Unknown error'}`,
          });
          imageUrl = '';
        }
      }
    }

    const productInput = {
      title: values.title,
      description: values.description,
      imageUrl: imageUrl || null,
      ownerId: userId
    };

    console.log('Creating product with input:', productInput);
    
    try {
      const response = await api.graphql({
        query: createProduct,
        variables: { input: productInput }
      });
      
      console.log('Product created successfully:', response.data.createProduct);
      
      toast.success('Product created successfully', {
        description: 'Redirecting to products page...',
      });
      
      // Redirect to products page after successful creation
      router.push('/products');
      
    } catch (graphqlError) {
      // Check if the product was created but there are owner field errors
      const hasOwnerErrors = graphqlError.errors && graphqlError.errors.some(error => 
        error.message.includes('Cannot return null for non-nullable type') && 
        error.path && error.path.includes('owner')
      );
      
      const hasProductData = graphqlError.data && graphqlError.data.createProduct;
      
      if (hasOwnerErrors && hasProductData) {
        console.warn('Product created but with owner field errors (User record missing in DynamoDB):', graphqlError);
        
        toast.success('Product created successfully', {
          description: 'Redirecting to products page... (Note: User profile setup needed)',
        });
        
        // Redirect to products page since the product was actually created
        router.push('/products');
      } else {
        // Re-throw if it's a different error
        throw graphqlError;
      }
    }
  } catch (error) {
    console.error('Error creating product:', error);
    errorMessage.value = 'Failed to create product. Please try again.';
    toast.error('Failed to create product', {
      description: 'Please try again later',
    });
  } finally {
    form.setFieldValue('isSubmitting', false);
  }
};

const isSubmitting = computed(() => form.meta.value.isSubmitting);
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Back button -->
      <Button 
        variant="ghost" 
        class="mb-6 flex items-center gap-2" 
        @click="router.push('/products')"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Products
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>Add a new product to your catalog</CardDescription>
        </CardHeader>
        
        <CardContent>
          <!-- Error message -->
          <div 
            v-if="errorMessage" 
            class="bg-destructive/15 text-destructive p-4 rounded-md mb-6"
          >
            {{ errorMessage }}
          </div>
          
          <!-- Product form -->
          <Form 
            :validation-schema="formSchema" 
            @submit="onSubmit" 
            class="space-y-6"
          >
            <!-- Title field -->
            <FormField
              v-slot="{ componentField, errors, value }"
              name="title"
            >
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    v-bind="componentField" 
                    placeholder="Enter product title" 
                  />
                </FormControl>
                <FormDescription>
                  Give your product a clear, descriptive title
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            
            <!-- Description field -->
            <FormField
              v-slot="{ componentField, errors, value }"
              name="description"
            >
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    v-bind="componentField" 
                    placeholder="Enter product description" 
                    rows="5"
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            
            <!-- Image upload field -->
            <FormField
              name="image"
              v-slot="{ componentField }"
            >
              <FormItem class="space-y-2">
                <FormLabel for="product-image">Product Image</FormLabel>
                
                <div class="flex items-center gap-4">
                  <label 
                    for="product-image" 
                    class="flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 cursor-pointer"
                  >
                    <Upload class="h-4 w-4" />
                    <span>Choose file</span>
                  </label>
                  
                  <Input 
                    id="product-image" 
                    type="file" 
                    accept="image/*" 
                    @change="handleImageChange"
                    class="hidden"
                  />
                  
                  <Button 
                    v-if="imagePreview" 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    @click="clearImage"
                  >
                    Remove
                  </Button>
                </div>
                
                <!-- Image preview -->
                <div 
                  v-if="imagePreview" 
                  class="mt-4 border rounded-md overflow-hidden max-w-md"
                >
                  <img 
                    :src="imagePreview" 
                    alt="Product preview" 
                    class="w-full h-auto max-h-64 object-contain"
                  />
                </div>
                
                <FormDescription>
                  Optional. Upload an image of your product.
                </FormDescription>
              </FormItem>
            </FormField>
            
            <!-- Submit button -->
            <Button 
              type="submit" 
              class="w-full" 
              :disabled="isSubmitting"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitting ? 'Creating...' : 'Create Product' }}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
