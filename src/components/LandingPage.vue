<template>
  <div class="landing-page">
    <div class="hero">
      <h1>WikiCheck Fact Verification</h1>
      <p>Instantly verify claims with reliable sources</p>
      <div class="cta">
        <router-link to="/fact-check" class="cta-primary">Try Now</router-link>
        <router-link to="/login" class="cta-secondary">Log In</router-link>
      </div>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <h2>Fast Verification</h2>
        <p>Get real-time fact-checks in seconds using advanced AI</p>
      </div>
      <div class="feature-card">
        <h2>Reliable Sources</h2>
        <p>Verified by multiple trusted references</p>
      </div>
      <div class="feature-card">
        <h2>History Tracking</h2>
        <p>Save and review your verification history</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.8rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #888;
  margin-bottom: 2rem;
}

.cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cta-primary, .cta-secondary {
  padding: 0.8rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.cta-primary {
  background: #646cff;
  color: white;
}

.cta-primary:hover {
  background: #535bf2;
}

.cta-secondary {
  border: 1px solid #646cff;
  color: #646cff;
}

.cta-secondary:hover {
  background: rgba(100, 108, 255, 0.1);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}
</style>
