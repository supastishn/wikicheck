<template>
  <div class="auth-container">
    <h2>Create Account</h2>
    <form @submit.prevent="handleRegister">
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
const router = useRouter();

const handleRegister = async () => {
  try {
    await account.create('unique()', email.value, password.value, name.value);
    await account.createEmailSession(email.value, password.value);
    router.push('/');
  } catch (error) {
    alert('Registration failed. Please try again.');
  }
};
</script>

<style scoped>
/* Same styles as Login.vue */
.auth-container {
  max-width: 1200px;
  margin: 8rem auto 2rem;
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
</style>
