export default {
  socketUrl: process.env.VUE_APP_SOCKET_URL || 'wss://localhost:3000/websocket',
  serverUrl: process.env.VUE_APP_SERVER_CHAT_URL || 'http://localhost:3000/',
  serviceName: process.env.VUE_APP_OAUTH_SERVICE_NAME
}