<script setup>
import { ref, onMounted } from 'vue';
import { listProducts } from '../graphql/queries';
import { useRouter } from 'vue-router';
import api from '../utils/api-client';

const router = useRouter();

const products = ref([]);
const loading = ref(true);
const error = ref('');

// Fetch all products when component is mounted
const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await api.graphql({
      query: listProducts,
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

// Navigate to product detail page
const viewProductDetails = (productId) => {
  router.push(`/product/${productId}`);
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="product-list">
    <h1>Products</h1>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="loading" class="loading">
      Loading products...
    </div>
    
    <div v-else-if="products.length === 0" class="no-products">
      <p>No products found.</p>
      <router-link to="/create-product" class="create-link">Create a product</router-link>
    </div>
    
    <div v-else class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
        @click="viewProductDetails(product.id)"
      >
        <div v-if="product.imageUrl" class="product-image">
          <img :src="product.imageUrl" :alt="product.title" />
        </div>
        <div v-else class="product-image placeholder">
          <span>No image</span>
        </div>
        
        <div class="product-info">
          <h2 class="product-title">{{ product.title }}</h2>
          <p class="product-description">{{ product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description }}</p>
          <p class="product-date">Created: {{ new Date(product.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
    
    <div class="create-product-button">
      <router-link to="/create-product" class="create-button">+ Create New Product</router-link>
    </div>
  </div>
</template>

<style scoped>
.product-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.no-products {
  text-align: center;
  padding: 40px;
}

.create-link {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  background-color: white;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #757575;
}

.product-info {
  padding: 15px;
}

.product-title {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.product-description {
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.product-date {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.create-product-button {
  margin-top: 30px;
  text-align: center;
}

.create-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.create-button:hover {
  background-color: #388e3c;
}
</style>
