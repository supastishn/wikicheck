<template>
  <div class="auth-container">
    <h2>Login to WikiCheck</h2>
    <form @submit.prevent="handleLogin">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" required>
      </div>
      <button type="submit">Log in</button>
      <p class="auth-link">
        Don't have an account? 
        <router-link to="/register">Register</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { account } from '../utils/appwrite';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter both email and password';
    return;
  }

  try {
    await account.createEmailPasswordSession(email.value, password.value);
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.';
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
