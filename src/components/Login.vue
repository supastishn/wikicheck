<template>
  <div class="auth-container">
    <h2>Login to WikiCheck</h2>
    <form @submit.prevent="handleLogin">
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
const router = useRouter();

const handleLogin = async () => {
  try {
    await account.createEmailSession(email.value, password.value);
    router.push('/');
  } catch (error) {
    alert('Login failed. Please check your credentials.');
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
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
  width: 85%;
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
  width: 85%;
  text-align: center;
  margin-top: 1rem;
}
</style>
