<template>
  <div class="auth-container glass">
    <h2>Welcome Back</h2>
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
      <button type="submit" class="btn">Log in</button>
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
  max-width: 500px;
  min-width: 40vw;
  margin: 0 auto;
  padding: 3rem;
  background: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .auth-container {
    width: 95%;
    min-width: unset;
    padding: 2rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin: 0 auto 1.5rem auto;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-weight: 500;
}

input {
  width: 85%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--text-dark);
  border-radius: var(--rounded-full);
  font-size: 1rem;
  transition: border 0.2s;
}

input:focus {
  border: 1.5px solid var(--primary);
  outline: none;
}

button, .btn {
  margin-top: 1rem;
}

.auth-link {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  margin-top: 1rem;
}

.error-message {
  color: var(--error);
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 1rem;
  border-radius: var(--rounded-sm);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}
</style>
