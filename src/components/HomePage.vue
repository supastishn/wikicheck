<script setup lang="ts">
// Add user state
import { account } from '../utils/appwrite';
import { ref, onMounted } from 'vue';
import { functions } from '../utils/appwrite'

const statement = ref('')
const result = ref<any>(null)
const errorResult = ref<string | null>(null)
const isLoading = ref(false)
const selectedModel = ref('medium') // Default to medium

const user = ref<any>(null);
onMounted(async () => {
  try {
    user.value = await account.get();
  } catch {
    user.value = null;
  }
});

// Modify checkStatement function
const checkStatement = async () => {
  if (!statement.value.trim()) return

  isLoading.value = true
  result.value = null
  errorResult.value = null

  // Add model enforcement and auth check
  const effectiveModel = user.value ? selectedModel.value : 'lite';

  try {
    const res = await functions.createExecution(
      'llm-search',
      JSON.stringify({
        statement: statement.value,
        model: effectiveModel  // Use enforced model
      }),
      false,
      '/',
      'POST' as any,
      {'Content-Type': 'application/json'}
    )

    // Handle error responses first
    if (res.responseStatusCode !== 200) {
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

    <!-- Add badge for non-logged-in users -->
    <div class="auth-notice" v-if="!user">
      🟡 Free users: Using Lite model only. <router-link to="/login">Log in</router-link> for full features
    </div>

    <div class="input-container">
      <textarea 
        v-model="statement"
        placeholder="Enter statement to verify..."
        rows="4"
      ></textarea>
      <div class="controls-row">
        <!-- Add authentication check to model dropdown -->
        <div class="model-option">
          <span class="model-label">Model:</span>
          <select 
            v-model="selectedModel" 
            class="model-dropdown"
            :disabled="!user"  // Disable when not logged in
          >
            <option value="lite">Lite: Fastest but less accurate</option>
            <option value="medium">Medium: Balanced speed & accuracy</option>
            <option value="pro">Pro: Most accurate, slower</option>
          </select>
        </div>
        <div class="spacer"></div>
        <button 
          @click="checkStatement"
          :disabled="isLoading || !statement.trim()"
        >
          {{ isLoading ? 'Checking...' : 'Verify' }}
        </button>
      </div>
    </div>

    <div v-if="result" class="result">
      <div 
        class="status" 
        :class="{
          'green-status': result.color === 'green',
          'orange-status': result.color === 'orange',
          'blue-status': result.color === 'blue',
          'purple-status': result.color === 'purple',
          'red-status': result.color === 'red'
        }"
      >
        {{ result.status }}
      </div>
      <div class="explanation">
        {{ result.explanation }}
      </div>
      <div v-if="result.sources" class="sources">
        <h3>Sources</h3>
        <div v-html="result.sources"></div>
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
  background: var(--card-bg);
  font-size: 1.2rem;
  font-weight: 500;
  min-height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
  color: var(--text-dark);
}

/* Add to the style section */
.explanation {
  /* Add text to wrap properly around brackets */
  white-space: pre-line; 
}

/* Make citation brackets less intrusive */
.explanation [class*="citation"] {
  font-size: 0.75em;
  vertical-align: super;
  margin: 0 0.15em;
}

/* Optional: styling for sources */
.sources-list {
  margin-top: 15px;
}
.sources-list a {
  display: block;
  margin: 8px 0;
  padding-left: 5px;
  border-left: 2px solid var(--primary);
}

.sources a {
  color: var(--primary);
  text-decoration: none;
  display: block;
  margin: 5px 0;
}
.sources a:hover {
  text-decoration: underline;
}
.sources-list a {
  display: block;
  margin: 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<style scoped>
/* Add auth notice styling */
.auth-notice {
  background: rgba(255, 240, 158, 0.3);
  border: 1px solid rgba(255, 217, 61, 0.5);
  border-radius: var(--rounded-sm);
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
</style>
<style scoped>
.controls-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.model-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--rounded-full);
  padding: 0.15rem 0.15rem 0.15rem 1rem;
  transition: all 0.3s;
  margin-right: 0.5rem;
}

.model-option:hover {
  background: rgba(255, 255, 255, 0.2);
}

.spacer {
  flex: 1;
}

button {
  margin-left: 1rem;
}

.model-label {
  color: var(--text-light);
  font-size: 0.95rem;
  white-space: nowrap;
}

.model-dropdown {
  background: transparent;
  border: none;
  color: var(--text-dark);
  padding: 0.8rem 0.5rem;
  width: 100%;
  cursor: pointer;
  appearance: none;
  flex: 1;
}
</style>
