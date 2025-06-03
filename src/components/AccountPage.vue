<template>
  <div class="account-page glass">
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
    <button @click="logout" class="logout-btn btn">Log out</button>
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
    ? user.value.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0,2)
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
  background: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-md);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--rounded-md);
  border: 1px solid rgba(255, 255, 255, 0.18);
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
  box-shadow: var(--shadow-md);
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
  border-radius: var(--rounded-full);
  cursor: pointer;
  font-size: 1rem;
  box-shadow: var(--shadow-md);
  margin-top: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
</style>
