<template>
  <div class="history-page">
    <h2>Verification History</h2>
    <div v-if="loading" class="loading">Loading history...</div>
    <div v-else-if="history.length === 0" class="empty">No verification history yet</div>
    <div v-else>
      <div v-for="item in history" :key="item.$id" class="history-item glass">
        <div class="statement">{{ item.statement }}</div>
        <div 
          class="status" 
          :class="item.color + '-status'"
        >
          {{ item.status }}
        </div>
        <div class="explanation">{{ item.explanation }}</div>
        <div class="sources" v-html="item.sources"></div>
        <div class="timestamp">{{ new Date(item.$createdAt).toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { databases } from '../utils/appwrite';
import { account } from '../utils/appwrite';
import { Query } from 'appwrite';

interface HistoryItem {
  $id: string;
  $createdAt: string;
  statement: string;
  status: string;
  explanation: string;
  sources: string;
  color: string;
}

const history = ref<HistoryItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const user = await account.get();
    const response = await databases.listDocuments(
      "factchecks",
      "checks",
      [
        Query.equal('user_id', user.$id),
        Query.limit(100),
        Query.offset(0),
        Query.orderDesc('$createdAt')
      ]
    );
    
    history.value = response.documents as unknown as HistoryItem[];
  } catch (error) {
    console.error("Failed to load history", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.empty {
  color: #888;
}

.history-item {
  background: var(--card-bg);
  border-radius: var(--rounded-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s;
}

.history-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.statement {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
}

.status {
  font-weight: bold;
  margin-bottom: 0.8rem;
}

.explanation {
  margin-bottom: 1rem;
  color: var(--text-light);
  line-height: 1.5;
}

.sources {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.timestamp {
  font-size: 0.8rem;
  color: #888;
  text-align: right;
}

.sources a {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary);
  text-decoration: none;
}

.sources a:hover {
  text-decoration: underline;
}
</style>
