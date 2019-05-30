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
      mcomments: this.comments,
      msg: '',
      isarticalShow:true,
    }
  },
  template: `
  <li class="blog-post" v-if="isarticalShow">
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
            <form id="add_comment" method="POST" v-on:submit.prevent="addComment(artical.id)">
                <textarea rows="8" v-model="content" name="content" cols="30"
                    style="resize:none;"></textarea>
                <button type="submit">提交</button>
                <p>{{msg}}</p>
            </form>
        </div>
        <div id="comment_view">
            <comment-post v-for="comment in mcomments" :key="comment.id" v-bind:comment="comment" v-bind:artical="artical"></comment-post>
        </div>
        <br />
    </div>
  </li>
`,
  methods: {
    deleteArtical:function(articalid){
      var url = '/deleteArtical';
      axios.post(url, {articalid:articalid}).then((result)=>{
        if(result.data.msg == 'ok'){
          this.msg = 'success delete';
          this.isarticalShow = false;
        }else{
          this.msg = 'unknown error';
        }
      }).catch((err)=>{
        this.msg = err;
        console.log(err);
      })
    },
    addComment: function (articalid) {
      var url = '/addComment'
      if (this.content != undefined && this.content != '' && this.content.length >= 7) {
        this.msg = '';
        axios.post(url, {
          articalid:articalid,
          content:this.content,
        }).then((result)=>{
          if(result.data.msg == 'ok'){
            this.msg = 'done';
            this.showComment();
          }else{
            this.msg = 'unknown error';
          }
        }).catch((err)=>{
          console.log(err);
          this.msg = err;
        })
      } else {
        this.msg = '评论不能为少于7个字符';
      }
    },
    //TODO 删除, 点赞, 显示评论
    Parse: function (aritcalid) {
      var url = '/articalpraise';
      if (this.praised) {
        url = '/unPraiseArtical';
      }
      axios.post(url, {
        userid: userconfig.userid,
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
      this.mcomments = null;
      if (!this.show)
        return;
      senddata = {
        articalid: articalid,
        userid:userconfig.userid
      };
      var that = this;
      axios.post('/getComments', senddata).then((result) => {
        that.mcomments = result.data.data;
      }).catch((err) => {
        console.log(err);
      });
    },
  }
})

Vue.component('comment-post', {
  props: ['comment', 'artical'],
  data: function () {
    return {
      content: this.comment.content,
      isUserPraise: this.comment.isUserPraise,
      commentPraise: this.comment.commentPraise,
      articalid: this.artical.id,
      mcomment: this.comment,
    }
  },
  template: `
  <div>
  <p>{{content}} &nbsp;&nbsp;&nbsp;&nbsp;赞:{{commentPraise}}</p>
  <button v-on:click="CommentParse(comment.id)">
    {{ isUserPraise==true ? 'unpraise' : 'praise' }}
  </button>
  </div>
  `,
  methods: {
    CommentParse: function (comentid) {
      var url = '/commentPraise';
      if (this.isUserPraise) {
        url = '/unPraiseComment';
      }
      axios.post(url, {
        username: userconfig.userid,
        commentid: comentid,
      }).then((result) => {
        if (result.data.msg == 'ok') {
          this.commentPraise += this.isUserPraise ? -1 : 1;
          this.isUserPraise = !this.isUserPraise;
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
    userid:getCookie('id')
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
      axios.post('/addArtical', {
        title: this.title,
        content: this.content
      }).then((result) => {
        if (result.data.msg == 'ok') {
          that.msg = 'done';
          articals.initdata();
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
        userid: userconfig.userid
      };
      var that = this;
      axios.post('/getArticals', senddata).then((result) => {
        that.articals = result.data.data;

      }).catch((err) => {
        console.log(err);
      });
    },
  },
  created: function () {
    this.initdata();
  },
})