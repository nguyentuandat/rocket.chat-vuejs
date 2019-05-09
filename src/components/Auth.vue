<template>
  <div class="hello">
    <h1>Đăng nhập</h1>

    <form method="post" action="" v-on:submit.prevent="loginBS">
      <input type="text" required id="username" v-model="username" name="username" autocomplete="username" placeholder="Username: aaa" />
      <input type="password" required id="password" v-model="password" name="password" autocomplete="current-password" placeholder="Password: 111111" />
      <input type="submit" value="Đăng nhập" />
    </form>
  </div>
</template>

<script>
export default {
  name: 'Auth',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  props: {
    msg: String,
    loginBasic: Function,
  },
  methods: {
    loginBS: function() {
      this.loginBasic(this.username, this.password)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
