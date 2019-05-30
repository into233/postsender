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

Vue.component('count-button', {
    data: function () {
        return {
            count: 0,
        }
    },
    template: '<button v-on:click="count++">click {{count}} times</button>'
});
new Vue({
    el: '#comment-demo1'
});

var app7 = new Vue({
    el: '#app-7',
    data: {
        groceryList: [{
                id: 3,
                text: '蔬菜'
            },
            {
                id: 2,
                text: '水果'
            },
            {
                id: 1,
                text: '菠萝'
            },
        ]
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

var userapp = new Vue({
    el: '#userapp',
    data: {
        username: getCookie('username'),
        userid:getCookie('userid'),
    }
})

var example = new Vue({
    el: '#example',
    data: {
        message: 'NoitTion',
    },
    computed: {
        whoami: function () {
            console.log(this);
            return 'whoai';
        },
        reversemessage: function () {
            return this.message.split('').reverse().join('');
        }
    },
    methods: {
        reversemsg: function () {
            this.message = this.message.split('').reverse().join('');
        },

    }
})
var getuser = new Vue({
    el: '#getuser',
    data: {
        userid: '',
        data: "please input the id/question...",
    },
    watch: {
        userid: function (lastid, currentid) {
            this.debouncedGetAnswer();
        },
    },
    created: function () {
        this.debouncedGetAnswer = _.debounce(this.useridchange, 500);
    },
    methods: {
        useridchange: function () {
            if (this.userid.indexOf('?') === -1) {
                this.data = "question must end with ?";
                return;
            }
            this.data = "thinking";
            var vm = this;
            axios.get("https://yesno.wtf/api").then((result) => {
                vm.data = result.data.answer;
            }).catch((err) => {
                vm.data = "oh this api doesn't work" + err;
            });
        }
    }
})


var getuser2 = new Vue({
    el: '#getuser2',
    data: {
        userid: '',
        data: "please input the id/question...",
    },
    watch: {
        userid: function (lastid, currentid) {
            this.debouncedGetAnswer();
        },
    },
    created: function () {
        this.debouncedGetAnswer = _.debounce(this.useridchange, 500);
    },
    methods: {
        useridchange: function () {
            if (isNaN(parseInt(this.userid))) {
                this.data = "user id must be number";
                return;
            }
            this.data = "loading...";
            var vm = this;
            axios.get("/getuser/" + this.userid).then((result) => {
                vm.data = result.data || "查无此人";
            }).catch((err) => {
                vm.data = "oh this api doesn't work";
                console.log(err);
            });
        }
    }
})