<template>
  <div class="history-document-page">
    <div v-if="loading" class="loading">Loading document...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h2>Fact Check Result</h2>
      <div class="history-document glass">
        <div class="statement">{{ documentData.statement }}</div>
        <div 
          class="status" 
          :class="documentData.color + '-status'"
        >
          {{ documentData.status }}
        </div>
        <div class="explanation">{{ documentData.explanation }}</div>
        <div class="sources" v-html="documentData.sources"></div>
        <div class="timestamp">
          Verified on: {{ formatDate(documentData.$createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { databases } from '../utils/appwrite';
import { useRoute } from 'vue-router';

const documentId = ref('');
const documentData = ref<any>(null);
const loading = ref(true);
const error = ref('');

const route = useRoute();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  documentId.value = route.params.id as string;
  
  try {
    const response = await databases.getDocument(
      "factchecks",
      "checks",
      documentId.value
    );
    
    documentData.value = response;
  } catch (err) {
    error.value = 'Failed to load document. It may not exist.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.history-document-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: var(--error);
}

.history-document {
  padding: 1.5rem;
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-sm);
}

.statement {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.status {
  font-weight: bold;
  margin-bottom: 1rem;
}

.explanation {
  margin-bottom: 1rem;
  white-space: pre-line;
  line-height: 1.6;
}

.sources {
  margin-bottom: 1rem;
}

.timestamp {
  text-align: right;
  font-size: 0.8rem;
  color: #888;
}
</style>
