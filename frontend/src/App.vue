<template>
  <div id="app">
    <!-- 页面内容部分，使用 Vue Router 来展示不同的页面 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
/* 页面整体布局 */
#app {
  background-color: #669985;
  background: url('/src/assets/background.jpg');
  background-size: cover;
  font-family: "Helvetica Neue";
}

</style>
