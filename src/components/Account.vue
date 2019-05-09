<template>
  <div>
    <span>Welcome <b>{{ username }}! </b></span> <button v-on:click="logout">Đăng xuất</button>
  </div>
</template>

<script>
export default {
  name: 'Account',
  props: {
    logoutUser: Function,
    username: String,
  },
  methods: {
    logout(){
      console.log('logout action');
      this.logoutUser();
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
