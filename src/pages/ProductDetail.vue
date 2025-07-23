<script setup>
import { ref, onMounted } from 'vue';
import { getProduct } from '../graphql/queries';
import { useRouter, useRoute } from 'vue-router';
import api from '../utils/api-client';

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
  <div class="product-detail">
    <div class="back-button">
      <button @click="goBack">← Back to Products</button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
      <div class="error-actions">
        <button @click="goBack">Return to Products</button>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading">
      Loading product details...
    </div>
    
    <div v-else-if="product" class="product-container">
      <div class="product-header">
        <h1>{{ product.title }}</h1>
        <p class="product-date">Created: {{ new Date(product.createdAt).toLocaleDateString() }}</p>
      </div>
      
      <div class="product-content">
        <div class="product-image-container">
          <img 
            v-if="product.imageUrl" 
            :src="product.imageUrl" 
            :alt="product.title" 
            class="product-image"
          />
          <div v-else class="product-image-placeholder">
            No image available
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-description">
            <h2>Description</h2>
            <p>{{ product.description }}</p>
          </div>
          
          <div class="product-metadata">
            <p><strong>Product ID:</strong> {{ product.id }}</p>
            <p><strong>Last Updated:</strong> {{ new Date(product.updatedAt).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.back-button button {
  background: none;
  border: none;
  color: #1976d2;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 0;
  font-size: 16px;
}

.back-button button:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.error-actions {
  margin-top: 15px;
}

.error-actions button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.product-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.product-header h1 {
  margin-top: 0;
  margin-bottom: 10px;
}

.product-date {
  color: #666;
  margin: 0;
}

.product-content {
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.product-image-container {
  width: 100%;
  
  @media (min-width: 768px) {
    width: 40%;
  }
}

.product-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 300px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
}

.product-info {
  padding: 20px;
  
  @media (min-width: 768px) {
    width: 60%;
  }
}

.product-description h2 {
  margin-top: 0;
  margin-bottom: 15px;
}

.product-description p {
  line-height: 1.6;
  margin-top: 0;
}

.product-metadata {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.product-metadata p {
  margin: 5px 0;
}
</style>
