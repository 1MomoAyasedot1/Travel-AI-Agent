<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant'; 

const router = useRouter();

const showCityPicker = ref(false);
const FormData = reactive({
  "city": "",
  "budget": "",
  "days": ""
})

const onConfirm = (selectedValues) => {
  FormData.city = selectedValues.selectedValues[0] || selectedValues.value
  showCityPicker.value = false
}

const onCancel = () => {
  showCityPicker.value = false
}

const AllCities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
  '南京', '武汉', '苏州', '长沙', '天津', '郑州', '济南', '青岛',
  '大连', '沈阳', '哈尔滨', '长春', '福州', '厦门', '南昌', '合肥',
  '昆明', '贵阳', '南宁', '桂林', '海口', '三亚', '丽江', '大理',
  '西安', '兰州', '乌鲁木齐', '拉萨', '呼和浩特', '太原', '石家庄'
]
const columns = AllCities.map(city => ({ text: city, value: city }))

const handleSubmit = async () => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  };

  const cityStr = formatValue(FormData.city);
  const budgetStr = formatValue(FormData.budget);
  const daysStr = formatValue(FormData.days);

  if (!cityStr) {
    showToast('请选择目的地');
    return;
  }
  if (!budgetStr) {
    showToast('请输入预算');
    return;
  }
  if (!daysStr) {
    showToast('请输入天数');
    return;
  }

  const budgetNum = Number(budgetStr);
  const daysNum = Number(daysStr);

  if (budgetNum <= 100) {
    showToast('预算需大于100元');
    return;
  }
  if (daysNum <= 0 || daysNum > 30) {
    showToast('请输入1到30天之间的天数');
    return;
  }

  showLoadingToast({ message: 'AI正在规划中...', forbidClick: true })

  try {
    const response = await fetch('/api/travel/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        city: cityStr,
        budget: budgetNum,
        days: daysNum
      })
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const aiResult = await response.json()
    const resultStr = encodeURIComponent(JSON.stringify(aiResult))

    closeToast()

    router.push({
      path: '/detail',
      query: {
        city: cityStr,
        budget: budgetStr,
        days: daysStr,
        result: resultStr
      }
    })
  } catch (error) {
    closeToast()
    console.error('AI规划失败:', error)
    showToast('AI规划失败，请重试')
  }
}

const hotCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆']

const gopage = (path) => {
  router.push(path)
}

const selectCity = (city) => {
  FormData.city = city
}
</script>

<template>
  <div class='page-container'>
    <van-nav-bar title="智能旅游助手" />
    <div class='page-content'>
      <van-notice-bar
        left-icon="volume-o"
        text="基于AI的智能景点介绍与行程规划系统"
      />
    </div>
    <div class='page-card'>
      <div class="section-title">规划你的旅程</div>
      <van-field
        @click="showCityPicker = true"
        v-model="FormData.city"
        label="目的地"
        placeholder="请选择城市"
        readonly
      />
      <van-field
        v-model="FormData.budget"
        label="预算(元)"
        placeholder="请输入预算"
        type="number"
      />
      <van-field
        v-model="FormData.days"
        label="天数(天)"
        placeholder="请输入天数"
        type="number"
      />
      <van-button
        type="primary"
        block
        round
        icon="success"
        @click="handleSubmit"
      >
        开始规划
      </van-button>
    </div>
    <div class='page-card'>
      <div class="section-title">快捷入口</div>
      <div class="quick-entry">
        <div @click="gopage('/chat')" class="quick-item">
          <van-icon name="chat-o" size="32" color="#999" />
          <span>AI对话</span>
        </div>
        <div @click="gopage('/profile')" class="quick-item">
          <van-icon name="user-o" size="32" color="#999" />
          <span>我的</span>
        </div>
      </div>
    </div>
    <div class='page-card'>
      <div class="section-title">热门目的地</div>
      <div class="hot-cities">
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item @click="selectCity(city)" v-for="city in hotCities" :key="city">
            <div class="city-tag" :class="{'active': city === FormData.city}">
              {{ city }}
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </div>
    <div class="bottom-spacer"></div>
  </div>
  <van-popup
    round
    position="bottom"
    v-model:show="showCityPicker"
  >
    <van-picker
      title="选择城市"
      :columns="columns"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </van-popup>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.page-content {
  padding: 16px;
}
.page-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 16px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}
.quick-entry {
  display: flex;
  justify-content: space-around;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
}
.quick-item span {
  font-size: 14px;
  color: #646566;
}

.hot-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin-top: 10px;
}

.hot-cities .van-grid-item__content {
  background-color: transparent !important;
}

.hot-cities .city-tag {
  padding: 4px 14px;
  font-size: 13px;
  line-height: 1.4;
  border-radius: 16px;
  color: #333;
  transition: all 0.2s;
}

.hot-cities .city-tag.active {
  background-color: #1989fa !important;
  color: #ffffff !important;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(25, 137, 250, 0.3);
}

.bottom-spacer {
  height: 50px;
} 
</style>