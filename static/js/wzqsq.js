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
  props: ['artical', 'comments'],
  //用户是否点过赞了
  data: function () {
    return {
      praised: this.artical.isUserPraised,
      content: '',
      show: false,
    }
  },
  template: `
  <li class="blog-post">
  <h3>{{ artical.title }}</h3>
  <p>{{ artical.content }} &nbsp;</p>
  <p>赞:{{ artical.articalpraise }}</p>
  <button v-on:click="Parse(artical.id)">
      {{ praised==true ? 'unpraise' : 'praise' }}
  </button>
  <button v-on:click="show = !show;showComment(artical.id);">comments</button>
  <button v-on:click="deleteArtical(artical.id)">delete</button><br /><br />
  <div id="comment_wrap" v-if="show">
      <div id="comment_write">
          <form id="add_comment" method="POST" v-on:submit.prevent="addComment">
              <textarea rows="8" v-model="content" name="content" cols="30"
                  style="resize:none;"></textarea>
              <button type="submit">提交</button>
          </form>
      </div>
      <div id="comment_view">
          <comment-post v-for="comment in comments" :key="comment.id" v-bind:comment="comment"></comment-post>
      </div>
      <br />
  </div>
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
          this.artical.articalpraise += this.praised ? -1 : 1;
          this.praised = !this.praised;
          console.log(result.data.msg);
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    showComment: function (articalid) {
      senddata = {
        articalid: articalid,
        username: userconfig.username,
      };
      var that = this;
      recvdata = axios.post('/getComments', senddata).then((result) => {
        that.comments = result.data;

      }).catch((err) => {
        console.log(err);
      });
    },
  }
})

Vue.component('comment-post', {
  props: ['comment'],
  template: `
  <p>{{comment.content}} &nbsp;&nbsp;&nbsp;&nbsp;赞:{{comment.praisecount}}</p>
  <button v-on:click="CommentParse(artical.id)">
    {{ is_user_praise==true ? 'unpraise' : 'praise' }}
  </button>
  `,
  methods: {
    CommentParse: function (artical_id) {
      var url = '/commentPraise';
      if (this.praised) {
        url = '/unPraiseComment';
      }
      recvdata = axios.post(url, {
        username: userconfig.username,
        articalid: aritcalid
      }).then((result) => {
        if (result.data.msg == 'ok') {
          this.comment.praisecount += this.comment.ispraise ? -1 : 1;
          this.comment.ispraise = !this.comment.ispraise;
        } else {
          console.log(result.data.msg);
        }
      }).catch((err) => {
        console.log(err);
      });
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
  name: 'addartical',
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
  name: 'articals',
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