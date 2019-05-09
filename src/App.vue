<template>
  <div id="app">
    <Auth v-if="!loggedIn"  v-bind:loginBasic="loginBasic" v-bind:loginWithCustomOAuth="loginWithCustomOAuth" msg="Login" />
    <Account v-if="loggedIn"  v-bind:logoutUser="logoutUser" v-bind:username="username"  />
    <ChatBox v-if="loggedIn" v-bind:sendMessage="sendMessage" v-bind:currentId="userId" v-bind:messages="roomMessages" />
  </div>
</template>

<script>
import axios from 'axios';

import rcApi from './api'
let api = null

import Auth from './components/Auth.vue'
import ChatBox from './components/ChatBox.vue'
import Account from './components/Account.vue'

import settings from './settings';

export default {
  name: 'app',
  components: {
    Account,
    Auth,
    ChatBox
  },
  data() {
    return {
      host: 'localhost:3000',
      webSocketUrl: settings.socketUrl,
      connectedToApi: true,
      loggedIn: false,
      userId: 'aaa',
      authToken: '',
      username: window.localStorage.getItem('username') || 'aaa',
      password: '',
      roomName: 'general',
      roomId: 'GENERAL',
      roomConnected: false,
      newMessage: '',
      messages: [],
      roomMessages: [ // fake data
        {"_id":"1556998652503","rid":"GENERAL","msg":"Hello 1","ts":{"$date":1556998652571},"u":{"_id":"aaa","username":"aaa","name":"User aaa"},"_updatedAt":{"$date":1556998652625},"mentions":[],"channels":[]},
        {"_id":"1556998652503","rid":"GENERAL","msg":"Hello 2","ts":{"$date":1556998652571},"u":{"_id":"9D35huFxq7A4LnqT9","username":"bbb","name":"User aaa"},"_updatedAt":{"$date":1556998652625},"mentions":[],"channels":[]},
        {"_id":"1556998652503","rid":"GENERAL","msg":"Hello 3","ts":{"$date":1556998652571},"u":{"_id":"9D35huFxq7A4LnqT9","username":"ddd","name":"User aaa"},"_updatedAt":{"$date":1556998652625},"mentions":[],"channels":[]},
        {"_id":"1556998652503","rid":"GENERAL","msg":"Hello 4","ts":{"$date":1556998652571},"u":{"_id":"aaa","username":"aaa","name":"User aaa"},"_updatedAt":{"$date":1556998652625},"mentions":[],"channels":[]},
        {"_id":"1556998652503","rid":"GENERAL","msg":"Hello 5","ts":{"$date":1556998652571},"u":{"_id":"9D35huFxq7A4LnqT9","username":"ccc","name":"User aaa"},"_updatedAt":{"$date":1556998652625},"mentions":[],"channels":[]}  
      ],
      errors: [],
      useSsl: false,
    }
  },
  mounted() {
    api = rcApi.connectToRocketChat (this.webSocketUrl)
    api.onError (error => this.errors.push (error))
    api.onCompletion (() => console.log ("finished"))
    api.onMessage (message => {
      console.log('onMessage', message);

      // store message from server chat
      this.messages.push (message);
      
    })
    // ping server to keepAlive
    api.connectToServer ()
      .subscribe (() => {
          api.keepAlive ().subscribe(); // Ping Server
        },
        (error) => {
          console.log('ping server error', error);
          this.errors.push (error)
        }
      )
  },
  watch: {
    
  },
  methods: {
    login() {
      console.log('login with token');
    },
    async loginWithCustomOAuth(userId, username){
      var data = {
        "serviceName": settings.serviceName, // Tên của Custom OAuth service
        "accessToken": "access-token",
        "expiresIn": 200000,
        identity: {
            id: userId, //một chuỗi duy nhất đi theo một username duy nhất từ Custom OAuth service
            username: username, // username
            roles: ['user']
        }
      };

      this.username = username;
      try {
        const response = await axios.post(`${settings.serverUrl}/api/v1/login`, data);

        console.log(response);

        if(response.status === 200 && response.data.status=== 'success'){

          // store in localStorage
          window.localStorage.setItem('authToken', response.data.data.authToken);
          window.localStorage.setItem('userId', response.data.data.userId);

          this.authToken = response.data.data.authToken;
          this.userId = response.data.data.userId;

          // do more
        }
      }catch (error) {
        console.error(error);
      }
    },
    loginWithOAuth(){
      console.log('login with OAuth');
    },
    loginBasic() {
      console.log('login with password');
    },
    logoutUser(){
      console.log('logout');
    },
    loadHistory() {
      console.log('load room history');
    },
    connectRoom() {
      console.log('stream a room');
    },
    sendMessage() {
      console.log('send new message');
    },
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#chatboxList .message .mention-link{
  color: #d08484 !important ;
}
</style>
