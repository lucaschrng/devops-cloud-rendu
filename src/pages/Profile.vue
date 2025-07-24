<script setup>
import { ref, onMounted } from 'vue';
import { Amplify } from 'aws-amplify';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import awsconfig from '../amplifyconfiguration.json';

Amplify.configure(awsconfig);

const userAttributes = ref({});
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');

// Form fields
const formData = ref({
  name: '',
  family_name: '',
  email: '',
  phone_number: '',
  birthdate: '',
  gender: '',
  picture: '',
  profile: '',
  preferred_username: '',
});

async function loadUserAttributes() {
  loading.value = true;
  message.value = '';
  error.value = '';
  
  try {
    const attributes = await fetchUserAttributes();
    userAttributes.value = attributes;
    console.log('User attributes:', attributes);
    
    // Populate form data with existing attributes
    Object.keys(formData.value).forEach(key => {
      if (attributes[key]) {
        formData.value[key] = attributes[key];
      }
    });
    
    // Always populate email if available
    if (attributes.email) {
      formData.value.email = attributes.email;
    }
    
  } catch (err) {
    console.error('Error fetching user attributes:', err);
    error.value = 'Failed to load user profile. Please try again later.';
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  saving.value = true;
  message.value = '';
  error.value = '';
  
  try {
    // Filter out empty values
    const updatedAttributes = {};
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key] && formData.value[key].trim() !== '') {
        updatedAttributes[key] = formData.value[key];
      }
    });
    
    // Don't update email as it requires verification
    delete updatedAttributes.email;
    
    if (Object.keys(updatedAttributes).length === 0) {
      message.value = 'No changes to save';
      saving.value = false;
      return;
    }
    
    await updateUserAttributes({
      userAttributes: updatedAttributes
    });
    
    message.value = 'Profile updated successfully!';
    await loadUserAttributes(); // Reload attributes to confirm changes
  } catch (err) {
    console.error('Error updating user attributes:', err);
    error.value = err.message || 'Failed to update profile. Please try again later.';
  } finally {
    saving.value = false;
  }
}

// Load user attributes when component mounts
onMounted(loadUserAttributes);
</script>

<template>
  <div class="profile-container">
    <h1>Your Profile</h1>
    
    <div v-if="loading" class="loading">
      Loading your profile...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveProfile" class="profile-form">
      <div v-if="message" class="success-message">
        {{ message }}
      </div>
      
      <div class="form-group">
        <label for="email">Email (cannot be changed)</label>
        <input 
          id="email" 
          v-model="formData.email" 
          type="email" 
          disabled
        />
      </div>
      
      <div class="form-group">
        <label for="name">First Name</label>
        <input 
          id="name" 
          v-model="formData.name" 
          type="text" 
          placeholder="Enter your first name"
        />
      </div>
      
      <div class="form-group">
        <label for="family_name">Last Name</label>
        <input 
          id="family_name" 
          v-model="formData.family_name" 
          type="text" 
          placeholder="Enter your last name"
        />
      </div>
      
      <div class="form-group">
        <label for="birthdate">Birthdate</label>
        <input 
          id="birthdate" 
          v-model="formData.birthdate" 
          type="date" 
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="formData.gender">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="picture">Profile Picture URL</label>
        <input 
          id="picture" 
          v-model="formData.picture" 
          type="url" 
          placeholder="Enter URL to your profile picture"
        />
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="saving" 
          class="save-button"
        >
          {{ saving ? 'Saving...' : 'Save Profile' }}
        </button>
      </div>
    </form>
    
    <div class="back-link">
      <router-link to="/">Back to Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-message, .success-message {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.loading {
  background-color: #f0f0f0;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.profile-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  margin-top: 30px;
}

.save-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #1976d2;
}

.save-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}

.back-link a {
  color: #2196f3;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>
