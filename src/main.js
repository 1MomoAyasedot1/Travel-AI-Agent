import { createApp } from 'vue'
import App from './App.vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import router from './router'
import { Tabbar, TabbarItem } from 'vant';
import NavBar from 'vant'
import { NoticeBar } from 'vant';
import Field from 'vant'
import Popup from 'vant'
import Picker from 'vant'
import Button from 'vant';
import Grid from 'vant';
import GridItem from 'vant';
import Icon from 'vant';
import { showToast } from 'vant';

const app = createApp(App)
app.use(Vant)
app.use(router)
app.use(Tabbar);
app.use(TabbarItem);
app.use(NavBar);
app.use(NoticeBar);
app.use(Field);
app.use(Popup); 
app.use(Picker);
app.use(Button);
app.use(Grid);
app.use(GridItem);
app.use(Icon);
app.use(showToast);
app.mount('#app')

