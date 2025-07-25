<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserCount } from '../graphql/queries';
import { useRouter } from 'vue-router';
import api from '../utils/api-client';
import Card from './ui/card/Card.vue';

const router = useRouter();

const userCount = ref(0);
const loading = ref(true);
const error = ref('');

const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await api.graphql({
      query: getUserCount,
    });

    userCount.value = response.data.users.totalCount;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Failed to load users. Please try again later.';
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchUsers();
});

</script>

<template>
<div class="m-auto p-4">
  <Card class="flex flex-col p-4">
    <p class="font-bold">User Count</p>
    <p>Total Users: {{ userCount }}</p>
  </Card>
</div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
