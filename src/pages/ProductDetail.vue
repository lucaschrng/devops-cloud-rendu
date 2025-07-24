<script setup>
import { ref, onMounted } from 'vue';
import { getProduct } from '../graphql/queries';
import { useRouter, useRoute } from 'vue-router';
import api from '../utils/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const product = ref(null);
const loading = ref(true);
const error = ref('');

// Fetch product details when component is mounted
const fetchProductDetails = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const productId = route.params.id;
    if (!productId) {
      throw new Error('Product ID is missing');
    }
    
    const response = await api.graphql({
      query: getProduct,
      variables: { id: productId }
    });
    
    product.value = response.data.getProduct;
    
    if (!product.value) {
      throw new Error('Product not found');
    }
  } catch (err) {
    console.error('Error fetching product details:', err);
    if (err.toString().includes('Product not found')) {
      error.value = 'Product not found.';
    } else {
      error.value = 'Failed to load product details. Please try again later.';
    }
  } finally {
    loading.value = false;
  }
};

// Navigate back to product list
const goBack = () => {
  router.push('/products');
};

onMounted(() => {
  fetchProductDetails();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Back button -->
    <Button 
      variant="ghost" 
      class="mb-6 flex items-center gap-2" 
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Products
    </Button>
    
    <!-- Error state -->
    <Card v-if="error" class="mb-6 border-destructive">
      <CardHeader>
        <CardTitle class="text-destructive">Error</CardTitle>
        <CardDescription>{{ error }}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button @click="goBack">Return to Products</Button>
      </CardFooter>
    </Card>
    
    <!-- Loading state -->
    <div v-else-if="loading" class="space-y-6">
      <div class="flex items-center space-x-4">
        <Skeleton class="h-12 w-[250px]" />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton class="h-[300px] w-full rounded-lg" />
        <div class="space-y-4">
          <Skeleton class="h-8 w-3/4" />
          <Skeleton class="h-32 w-full" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-2/3" />
        </div>
      </div>
    </div>
    
    <!-- Product details -->
    <div v-else-if="product">
      <Card>
        <CardHeader>
          <div class="flex justify-between items-start">
            <div>
              <CardTitle class="text-2xl">{{ product.title }}</CardTitle>
              <CardDescription class="flex items-center gap-1 mt-1">
                <Calendar class="h-3.5 w-3.5" />
                Created: {{ new Date(product.createdAt).toLocaleDateString() }}
              </CardDescription>
            </div>
            <Badge variant="outline">
              ID: {{ product.id.substring(0, 8) }}...
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product image -->
            <div class="overflow-hidden rounded-md border bg-muted">
              <img 
                v-if="product.imageUrl" 
                :src="product.imageUrl" 
                :alt="product.title" 
                class="h-full w-full object-cover aspect-video"
              />
              <div 
                v-else 
                class="flex items-center justify-center h-full w-full aspect-video text-muted-foreground"
              >
                No image available
              </div>
            </div>
            
            <!-- Product description -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-medium mb-2">Description</h3>
                <p class="text-muted-foreground whitespace-pre-line">{{ product.description }}</p>
              </div>
              
              <div class="pt-4 border-t">
                <p class="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock class="h-3.5 w-3.5" />
                  Last updated: {{ new Date(product.updatedAt).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<!-- No need for scoped styles as we're using Tailwind CSS with shadcn-vue -->
