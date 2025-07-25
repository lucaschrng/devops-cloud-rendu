<script setup>
import { ref, onMounted } from 'vue';
import { listProducts } from '../graphql/queries';
import { listProductsWithComments } from '../graphql/custom-queries';
import { useRouter } from 'vue-router';
import api from '../utils/api-client';
import { canCreateProducts } from '../utils/auth-utils';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowRight, MessageCircle } from 'lucide-vue-next';

const router = useRouter();

const products = ref([]);
const loading = ref(true);
const error = ref('');
const canCreate = ref(false);

// Fetch all products when component is mounted
const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await api.graphql({
      query: listProductsWithComments,
      variables: {
        limit: 100 // Adjust as needed
      }
    });
    
    products.value = response.data.listProducts.items;
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = 'Failed to load products. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Check if user can create products
const checkCreatePermissions = async () => {
  try {
    canCreate.value = await canCreateProducts();
  } catch (error) {
    console.error('Error checking create permissions:', error);
    canCreate.value = false;
  }
};

// Navigate to product detail page
const viewProductDetails = (productId) => {
  router.push(`/product/${productId}`);
};

onMounted(() => {
  fetchProducts();
  checkCreatePermissions();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Products</h1>
      <router-link v-if="canCreate" to="/create-product">
        <Button>
          <PlusCircle class="mr-2 h-4 w-4" />
          Create Product
        </Button>
      </router-link>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
      <p>{{ error }}</p>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="flex flex-col space-y-3">
        <Skeleton class="h-[200px] w-full rounded-lg" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <Card v-else-if="products.length === 0" class="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>No products found</CardTitle>
        <CardDescription>
          {{ canCreate ? 'Get started by creating your first product' : 'No products available at the moment' }}
        </CardDescription>
      </CardHeader>
      <CardFooter v-if="canCreate">
        <router-link to="/create-product" class="w-full">
          <Button class="w-full">
            <PlusCircle class="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </router-link>
      </CardFooter>
    </Card>
    
    <!-- Products grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="product in products" 
        :key="product.id" 
        class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        @click="viewProductDetails(product.id)"
      >
        <!-- Product image -->
        <div class="aspect-video w-full overflow-hidden bg-muted">
          <img 
            v-if="product.imageUrl" 
            :src="product.imageUrl" 
            :alt="product.title" 
            class="h-full w-full object-cover transition-all hover:scale-105"
          />
          <div v-else class="h-full w-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        </div>
        
        <CardHeader>
          <CardTitle class="line-clamp-1">{{ product.title }}</CardTitle>
          <CardDescription class="line-clamp-2">
            {{ product.description }}
          </CardDescription>
        </CardHeader>
        
        <CardFooter class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="text-xs">
              {{ new Date(product.createdAt).toLocaleDateString() }}
            </Badge>
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle class="h-3 w-3" />
              {{ product.comments?.items?.length || 0 }}
            </div>
          </div>
          <Button variant="ghost" size="sm" class="gap-1">
            View
            <ArrowRight class="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<!-- No need for scoped styles as we're using Tailwind CSS with shadcn-vue -->
