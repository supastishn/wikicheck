<template>
  <div class="padding">
    <nav class="navbar">
      <div class="navbar-title">WikiCheck</div>
      <div class="navbar-links">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for static navbar
</script>

<style scoped>
.padding {
  position: fixed;
  top: 1.2rem;
  left: 0;
  width: 100vw;
  z-index: 100;
  padding-left: 2vw;
  padding-right: 2vw;
  box-sizing: border-box;
}

.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #646cff;
  color: #fff;
  padding: 1rem 2rem;
  margin-bottom: 0;
  box-sizing: border-box;
  border-radius: 50%;
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.navbar-links a {
  color: #fff;
  text-decoration: none;
  margin-left: 1.5rem;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-links a:hover {
  color: #ffd700;
}
</style>
