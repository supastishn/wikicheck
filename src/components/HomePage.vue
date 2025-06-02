<script setup lang="ts">
import { ref } from 'vue'

const statement = ref('')
const result = ref('')
const isLoading = ref(false)

const checkStatement = () => {
  if (!statement.value.trim()) return

  isLoading.value = true
  result.value = ''

  setTimeout(() => {
    const isFact = Math.random() > 0.5
    result.value = isFact ? '✅ Verified Fact' : '❌ False Information'
    isLoading.value = false
  }, 800)
}
</script>

<template>
  <div class="fact-checker glass">
    <h1>Fact<span class="highlight">Checker</span></h1>

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
  margin: 0 auto;
  padding: 3rem;
  text-align: center;
  background: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-md);
}

h1 {
  margin-bottom: 1.5rem;
}

.highlight {
  background: linear-gradient(90deg, #f72585, #b5179e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
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
  border-radius: var(--rounded-sm);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 1rem;
  resize: vertical;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: var(--text-dark);
  transition: border 0.2s;
}

textarea:focus {
  border: 1.5px solid var(--primary);
  outline: none;
}

button {
  align-self: flex-end;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  color: #fff;
}

.result {
  padding: 1.5rem;
  border-radius: var(--rounded-sm);
  background-color: #f8f8f8;
  font-size: 1.2rem;
  font-weight: 500;
  min-height: 60px;
  border: 1px solid #eaeaea;
  margin-top: 1rem;
}
</style>
