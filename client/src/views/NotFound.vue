<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Sayfa Bulunamadı</h2>
      <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  text-align: center;
  padding: 2rem;
}

.not-found-content {
  max-width: 500px;
}

.not-found h1 {
  font-size: 6rem;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.not-found h2 {
  font-size: 2rem;
  margin: 1rem 0;
}

.not-found p {
  margin-bottom: 2rem;
  color: var(--text-color-secondary);
}
</style> 