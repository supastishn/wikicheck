<template>
  <div class="account-page">
    <h2>Account</h2>
    <div v-if="user" class="profile-card">
      <div class="profile-initials">
        {{ userInitials }}
      </div>
      <div class="profile-details">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
    </div>
    <button @click="logout" class="logout-btn">Log out</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { account } from '../utils/appwrite';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref<any>(null);

const userInitials = computed(() => {
  if (!user.value) return ''
  return user.value.name
    ? user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)
    : user.value.email.substring(0,2).toUpperCase()
});

onMounted(async () => {
  try {
    user.value = await account.get();
  } catch (error) {
    router.push('/login');
  }
});

const logout = async () => {
  try {
    await account.deleteSession('current');
    router.push('/login');
  } catch (error) {
    console.error('Logout failed', error);
  }
};
</script>

<style scoped>
.account-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.profile-initials {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #646cff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-details {
  text-align: left;
  flex: 1;
}

.logout-btn {
  padding: 0.8rem 1.5rem;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
</style>
