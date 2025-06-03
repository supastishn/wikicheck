<script setup lang="ts">
import { ref } from 'vue'
import { functions } from '../utils/appwrite'

const statement = ref('')
const result = ref<any>(null)
const errorResult = ref<string | null>(null)
const isLoading = ref(false)

const checkStatement = async () => {
  if (!statement.value.trim()) return

  isLoading.value = true
  result.value = null
  errorResult.value = null

  try {
    const res = await functions.createExecution(
      'llm-search',
      JSON.stringify({ statement: statement.value }),
      false,
      '',
      'POST',
      {'Content-Type': 'application/json'}
    )

    // Handle error responses first
    if (res.status !== 200) {
      try {
        if (res.responseBody) {
          const errorResponse = JSON.parse(res.responseBody);
          if (errorResponse.error) {
            throw new Error(errorResponse.error);
          }
        }
      } catch (e) {
        // Fall through to XML parsing
      }
    }

    if (res.responseBody) {
      // Check if response is XML
      if (res.responseBody.startsWith('<factcheck>')) {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(res.responseBody, "application/xml")

        result.value = {
          color: xmlDoc.querySelector('color')?.textContent || 'black',
          status: xmlDoc.querySelector('status')?.textContent || 'Unknown',
          explanation: xmlDoc.querySelector('explanation')?.textContent || '',
          sources: xmlDoc.querySelector('sources')?.textContent || ''
        }
      } else {
        // Handle JSON errors that didn't parse above
        try {
          const errorResponse = JSON.parse(res.responseBody);
          throw new Error(errorResponse.error || 'Unknown error from server');
        } catch (e) {
          throw new Error('Invalid response format from server');
        }
      }
    } else {
      throw new Error('Empty response from server');
    }
  } catch (error) {
    console.error('Verification failed', error)
    if (error instanceof Error) {
      errorResult.value = error.message
    } else {
      result.value = {
        color: 'black',
        status: 'Error',
        explanation: 'Failed to verify statement'
      }
    }
  } finally {
    isLoading.value = false
  }
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
      <div class="status" :style="{ color: result.color }">
        {{ result.status }}
      </div>
      <div class="explanation">
        {{ result.explanation }}
      </div>
      <div v-if="result.sources" class="sources">
        <h3>Sources</h3>
        <pre>{{ result.sources }}</pre>
      </div>
    </div>
    <div v-else-if="errorResult" class="result error">
      <div class="status" style="color: black">Error</div>
      <div class="explanation">{{ errorResult }}</div>
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
