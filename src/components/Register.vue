<template>
  <div class="auth-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleRegister">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="name" type="text" id="name" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" required>
      </div>
      <button type="submit">Create Account</button>
      <p class="auth-link">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { account } from '../utils/appwrite';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = '';
  try {
    await account.create('unique()', email.value, password.value, name.value);
    await account.createEmailPasswordSession(email.value, password.value);
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || 'Registration failed. Please try again.';
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 600px;
  min-width: 40vw;
  margin: 0 auto;
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .auth-container {
    width: 95%;
    min-width: unset;
  }
}

.form-group {
  margin-bottom: 1rem;
  max-width: 600px;
  margin: 0 auto 1rem auto;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 85%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.8rem;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.auth-link {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  margin-top: 1rem;
}

.error-message {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
