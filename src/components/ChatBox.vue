<template>
  <div class="hello">
    <h1>Chat Box</h1>
    <div class="chatbox">
      <ul id="chatboxList">

        <li class="message" v-for="(message, messageIndex) in messages" :key="messageIndex">
          <div v-bind:class="message.groupable !== undefined ? 'system-message' : ''">
            <div v-bind:class="message.u._id === currentId ? 'me' : ''" >
            <div class="info">
              <avatar v-bind:username="message.u.username"></avatar>
              <span class="author">{{ message.u.username}}</span>
              <span class="time" v-if="formatMessage (message).formattedDate">
              {{formatMessage (message).formattedDate}}</span>
            </div>
            <div v-if="message.groupable === undefined" class="content" v-html="formatMsg(message)">
              
              {{formatMsg(message)}}
            </div>
            <div v-else class="content">{{ message.u.username }} vừa tham gia phòng chat</div>
            </div>
          </div>
        </li>
      </ul>
      <form class="chat-form" method="post" action="" v-on:submit.prevent="sendMsg">
        <input type="text" v-model="newMessage" required id="txtMessage" name="message" placeholder="Nhập nôi dung" />
        <button type="submit" v-on:click="sendMsg" value="Gửi" >Gửi</button>
      </form>
    </div>
    
  </div>
</template>

<script>
import moment from 'moment'

import Avatar from 'vue-avatar'

export default {
  name: 'ChatBox',
  data() {
    return {
      newMessage: '',
    }
  },
  props: {
    msg: String,
    messages: Array,
    sendMessage: Function,
    currentId: String,
  },
  components: {
    Avatar
  },
  updated: function () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been re-rendered
      this.scrollToEnd();
    })
  },
  methods: {
    sendMsg: function() {
      console.log('send new message action');
    },
    scrollToEnd: function() {    	
      var container = this.$el.querySelector("#chatboxList");
      container.scrollTop = container.scrollHeight;
    },
    formatMsg(message){
      return message.msg;
    },
    formatMessage(message) {
      let result = {message}
      if (message !== undefined &&
        message.ts !== undefined &&
        message.ts.$date !== undefined
      ) {
        result.formattedDate = moment(message.ts.$date).locale("vi").fromNow();// new Date (message.ts.$date)
      }
      return result
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chatbox{
  background:#fff;
  width: 500px;
  /* height: 500px; */
  /* overflow: auto; */
  /* padding: 15px; */
  position: relative;
  margin: 0 auto;
  margin-bottom: 100px;
  border: 1px solid #84d1ae;
  border-radius: 5px;
  
}
.chat-form{
  /* position: absolute; */
  bottom: 0px;
  left:0;
  background: #84d1ae;
  /* width: 100%; */
  padding: 20px;
}
.chat-form #txtMessage{
  height: 35px;
  width: 300px;
  outline: none;
  border: none;
  margin-top: -1px;
}
.chat-form button{
  height: 37px;
  width: 100px;
  border: none;
  background: #f3e720;
  cursor: pointer;
}
.chat-form button:hover{
  background: #f37220;
}
#chatboxList{
  height: 500px;
  overflow: auto;
  padding: 15px;
}
#chatboxList .message{
  width:100%;
  display:block;
  padding: 5px 0;
  text-align: left;
  margin: 0 0 20px 0;
  position: relative;
  overflow: hidden;
}
#chatboxList .message .me{
  text-align: right;
}
#chatboxList .system-message{
  zoom: 0.6;
  opacity: 0.5;
}
#chatboxList .message .info {
  padding-left: 60px;
  position: relative;
}
#chatboxList .message .me .vue-avatar--wrapper{
  display: none !important;
}
.vue-avatar--wrapper{
  position: absolute;
  left: 0;
  top: 5px;
}
#chatboxList .message .info .author{
  font-size: .8rem;
  color:#42b983;
  padding-right: 15px;
}
#chatboxList .message .info .time{
  font-size: .6rem;
  color:#666;
}
#chatboxList .message .content {
  margin-left: 60px;
  background: #f1f0f0;
  padding: 5px 10px;
  border-radius: 20px;
  /* box-shadow: 0px 1px 0px 0px rgba(0,0,0,0.1); */
  max-width: 300px;
  display:block;
  float:left;

}
#chatboxList .message .me .content {
  float: right;
}

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
