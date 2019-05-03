// [{
//   "id": 3,
//   "title": "",
//   "content": "for test collect",
//   "imagedir": "",
//   "createdAt": "2019-04-24 23:10:58",
//   "updatedAt": "2019-04-24 23:10:58",
//   "UserId": 1,
//   "CollectId": null
// }]
Vue.component('artical-post', {
  props: ['artical'],
  //用户是否点过赞了
  data: function () {
    return {
      praised: this.artical.isUserPraised
    }
  },
template: `
  <li class="blog-post">
  <h3>{{ artical.title }}</h3>
  <p>{{ artical.content }} &nbsp;</p>
  <p>赞:{{ artical.articalpraise }}</p>
  <button v-on:click="parse(artical.id)">
      {{ praised==true ? 'unpraise' : 'praise' }}
  </button>
  <button v-on:click="showcomment(artical.id)">comments</button>
  <button v-on:click="delete(artical.id)">delete</button>
</li>
`,
methods: {
  //TODO 删除, 点赞, 显示评论
  Parse: function (aritcalid) {
    var url = '/articalpraise';
    if (this.praised) {
      url = '/unPraiseArtical';
    }
    recvdata = axios.post(url, {
      username: userconfig.username,
      articalid: aritcalid
    }).then((result) => {
      if (result.data.msg == 'ok') {
        this.artical.articalpraise += this.praised ? -1 : 1;
        this.praised = !this.praised;
      } else {
        console.log(result.data.msg);
      }
    }).catch((err) => {
      console.log(err);
    });
  },
  showComment:function(articalid){
    
  }
}
})

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}
var userconfig = new Vue({
  el: '#nav_bar',
  data: {
    username: getCookie('username'),
  }
})
var addartical = new Vue({
  name:'addartical',
  el: '#add_artical',
  data: {
    title: '',
    content: '',
    msg: ''
  },
  methods: {
    addartical: function () {
      var that = this;
      recvdata = axios.post('/addArtical', {
        title: this.title,
        content: this.content
      }).then((result) => {
        if (result.data.msg == 'ok') {
          that.msg = 'done';
        } else {
          that.msg = 'error';
        }
      }).catch((err) => {
        that.msg = 'error';
        console.log(err);
      });
    }
  }
})

var articals = new Vue({
  name:'articals',
  el: '#articals',
  data: {
    articals: [],
    page: 0,
    size: 10,
  },
  methods: {

    initdata: function () {
      senddata = {
        page: this.page,
        size: this.size,
        username: userconfig.username
      };
      var that = this;
      recvdata = axios.post('/getArticals', senddata).then((result) => {
        that.articals = result.data;

      }).catch((err) => {
        console.log(err);
      });
    },
  },
  created: function () {
    this.initdata();
  },
})