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
      roomMessages: [],
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

      if(message.msg=== 'changed' && message.collection === 'stream-room-messages'
        && message.fields !== undefined && message.fields.args !== undefined){
        Array.prototype.push.apply(this.roomMessages, message.fields.args);
        this.roomMessages.splice(this.roomMessages.length);
      }
      
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

    // check logged in
    const rc_expiry = window.localStorage.getItem('rc_expiry');
    let now = new Date ().getTime ();

    if(now < rc_expiry){
      const rc_token = window.localStorage.getItem('authToken');
      const rc_id = window.localStorage.getItem('userId');
      this.userId = rc_id;
      this.authToken = rc_token;
      this.login();
    }
  },
  watch: {
    loggedIn: function (val, oldVal) {
      // init room, get room history
      if(val === true && oldVal === false){
        this.loadHistory();
        this.connectRoom();
      }
    }
  },
  methods: {
    login() {
      // console.log('login with token');
      if (!this.loggedIn) {
        api.loginWithAuthToken (this.authToken)
          .subscribe (apiEvent => {
            if (apiEvent.msg === 'result') {
              // success
              this.messages.push (apiEvent.msg)

              window.localStorage.setItem('rc_expiry', apiEvent.result.tokenExpires.$date);
              this.loggedIn = true
            }
          }, (error) => {
            this.errors.push (error)
          })
      }
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
      window.localStorage.setItem('username', username);

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
          this.login();
        }
      }catch (error) {
        console.error(error);
      }
    },
    loginWithOAuth(){
      console.log('login with OAuth');
    },
    loginBasic(username, password) {
      if (!this.loggedIn) {
        api.login (username, password)
          .subscribe (apiEvent => {
            if (apiEvent.msg === 'result' && apiEvent.result !== undefined) {
              // success
              console.log('token exp', new Date (apiEvent.result.tokenExpires.$date));
              this.messages.push (apiEvent.msg)
              this.loggedIn = true;
              this.userId = apiEvent.result.id;
              this.authToken = apiEvent.result.token;
              window.localStorage.setItem('username', username);
              this.username = username;
              window.localStorage.setItem('userId', apiEvent.result.id);
              window.localStorage.setItem('authToken', apiEvent.result.token);
              window.localStorage.setItem('rc_expiry', apiEvent.result.tokenExpires.$date);
              
            } else {
              console.log('Auth fail');
            }
          }, (error) => {
            console.log('Can not log in right now');
            this.errors.push (error)
          })
      }
    },
    logoutUser(){
      console.log('logout');
      api.callMethod('logout')
      .subscribe (() => {
        window.localStorage.removeItem('userId');
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('rc_expiry');
        this.loggedIn = false;
      });
    },
    loadHistory() {
      console.log('load room history');
      api.callMethod('loadHistory', this.roomId, null, 50)
        .subscribe (apiEvent => {
          if (apiEvent.msg === 'result' && apiEvent.result !== undefined && apiEvent.result.messages !== undefined) {
            this.roomMessages = apiEvent.result.messages.reverse();
          }
        });
    },
    connectRoom() {
      console.log('stream a room');
      if (!this.roomConnected) {
        api.sendMessage ({
          "msg": "sub",
          "id": '' + new Date ().getTime (),
          "name": "stream-room-messages",
          "params": [
            this.roomId,
            false
          ]
        })
      }
    },
    sendMessage(msg) {
      console.log('send new message');
      api.sendMessage ({
        "msg": "method",
        "method": "sendMessage",
        "id": '' + new Date ().getTime (),
        "params": [
          {
            "_id": '' + new Date ().getTime (),
            "rid": this.roomId,
            "msg": msg
          }
        ]
      })
      this.newMessage = ''
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
