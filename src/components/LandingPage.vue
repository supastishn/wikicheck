<template>
  <div class="landing-page">
    <div class="hero">
      <h1>Unlock <span class="highlight">Reliable Fact Verification</span></h1>
      <p>AI-powered verification backed by credible sources</p>
      <div class="cta">
        <router-link to="/fact-check" class="cta-btn primary">Try Now</router-link>
        <router-link to="/login" class="cta-btn secondary">Log In</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card glass">
        <div class="icon">🔥</div>
        <h2>Instant Verification</h2>
        <p>Real-time results powered by AI technology</p>
      </div>
      <div class="feature-card glass">
        <div class="icon">🔗</div>
        <h2>Reliable Sources</h2>
        <p>Verified by multiple trusted references</p>
      </div>
      <div class="feature-card glass">
        <div class="icon">🕑</div>
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
  background: linear-gradient(135deg, #f0f4ff 0%, #d9e0ff 100%);
  border-radius: var(--rounded-md);
  padding: 5rem 2rem;
  margin-bottom: 4rem;
  text-align: center;
}

/* For dark mode */
.dark .hero {
  background: linear-gradient(135deg, #1a1a5e 0%, #0d0d2b 100%);
}

.hero h1 {
  font-size: 2.8rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.highlight {
  background: linear-gradient(90deg, #f72585, #b5179e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero p {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cta-btn {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.9rem 2.5rem;
  border-radius: var(--rounded-full);
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.cta-btn.primary {
  background: linear-gradient(145deg, #03c803, #028802);
  color: white;
  box-shadow: var(--shadow-md);
}

.cta-btn.primary:hover {
  background: linear-gradient(145deg, #028802, #03c803);
}

.cta-btn.secondary {
  background: transparent;
  border: 2px solid var(--text-dark);
  color: var(--text-dark);
}

.cta-btn.secondary:hover {
  background: rgba(255,255,255,0.1);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  background: var(--card-bg);
  border-radius: var(--rounded-md);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>
