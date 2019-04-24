var app4 = new Vue({
    el: '#app-4',
    data: {
        todos: [{
                text: 'Learn JavaScript'
            },
            {
                text: 'Learn Vue'
            },
            {
                text: 'Build something awesome'
            }
        ]
    }
})
var app5 = new Vue({
    el: '#app-5',
    data: {
        message: 'hello vueee',
    },
    methods: {
        reverseMessage: function () {
            this.message = this.message.split('').reverse().join('');
        }
    },
})

Vue.component('todo-item', {
    props: ['todo'],
    template: '<li>{{todo.text}}</li>',
});

var app7 = new Vue({
    el: '#app-7',
    data: {
        groceryList:[
            {id:3, text:'蔬菜'},
            {id:2, text:'水果'},
            {id:1, text:'菠萝'},
        ]
    }
})
function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}

var userapp = new Vue({
    el: '#userapp',
    data:{
        username: getCookie('username'),
    }
})