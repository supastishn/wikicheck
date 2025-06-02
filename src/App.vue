<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'

const statement = ref('')
const result = ref('')
const isLoading = ref(false)

const checkStatement = () => {
  if (!statement.value.trim()) return
  
  isLoading.value = true
  result.value = ''
  
  // Simulate API call delay
  setTimeout(() => {
    // Random verification (50% true, 50% false)
    const isFact = Math.random() > 0.5
    result.value = isFact ? '✅ Verified Fact' : '❌ False Information'
    isLoading.value = false
  }, 800)
}
</script>

<template>
  <Navbar />
  <div class="fact-checker">
    <h1>Fact Checker</h1>
    
    <div class="input-container">
      <textarea 
        v-model="statement"
        placeholder="Enter statement to verify..."
        rows="4"
      ></textarea>
      
      <button 
        @click="checkStatement"
        :disabled="isLoading || !statement.trim()"
      >
        {{ isLoading ? 'Checking...' : 'Verify' }}
      </button>
    </div>
    
    <div v-if="result" class="result">
      {{ result }}
    </div>
  </div>
</template>

<style scoped>
.fact-checker {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 1.5rem;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #646cff;
  font-size: 1rem;
  resize: vertical;
}

button {
  align-self: flex-end;
  padding: 0.6em 1.2em;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #535bf2;
}

.result {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f8f8f8;
  font-size: 1.2rem;
  font-weight: 500;
  min-height: 60px;
  border: 1px solid #eaeaea;
}

/* Navbar styles moved to Navbar.vue */
</style>
