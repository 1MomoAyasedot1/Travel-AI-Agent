<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 从路由里拿参数
const city = route.query.city
const budget = route.query.budget
const days = route.query.days

const aiData = ref(null)
const loading = ref(true)

// 页面加载时，自动请求数据
onMounted(async () => {
  if (!city) {
    showToast('缺少目的地参数')
    router.back()
    return
  }

  try {
    // 直接调用后端的推荐接口，拿到最新鲜的数据！
    const response = await fetch('/api/travel/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: city,
        days: Number(days),
        budget: Number(budget)
      })
    })

    const resJson = await response.json()
    
    // 解析数据（处理可能存在的 rawJson）
    let finalData = resJson.data
    if (finalData?.rawJson && typeof finalData.rawJson === 'string') {
        try {
            const realContent = JSON.parse(finalData.rawJson)
            finalData = { ...finalData, ...realContent }
        } catch (e) {
            console.warn('解析额外 JSON 失败', e)
        }
    }
    
    aiData.value = finalData

  } catch (error) {
    console.error('获取行程失败:', error)
    showToast('获取行程失败')
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-container">
    <van-nav-bar title="规划详情" left-arrow @click-left="goBack" />
    
    <div class="content-card">
      <div class="header-title">🗺️ {{ city || '未知' }} 行程计划</div>

      <div class="info-list">
        <div class="info-item"><span class="label">📍 目的地</span><span class="value">{{ city }}</span></div>
        <div class="info-item"><span class="label">💰 预算</span><span class="value">{{ budget }} 元</span></div>
        <div class="info-item"><span class="label">📅 天数</span><span class="value">{{ days }} 天</span></div>
      </div>

      <!-- ====== 数据展示区 ====== -->
      <div v-if="aiData" class="ai-result-box">
        
        <div v-if="aiData.dailyItinerary && aiData.dailyItinerary.length > 0" class="section">
          <div 
            v-for="(item, index) in aiData.dailyItinerary" 
            :key="index" 
            class="day-card"
          >
            <div class="day-header">
              <span class="day-title">🎯 第 {{ item.day }} 天</span>
              <span class="day-date">{{ item.date || '全天行程' }}</span>
            </div>
            
            <div class="day-content">
              <div v-if="item.morning" class="period-item">
                <div class="period-title"><van-icon name="sun" color="#e6a23c"/> 上午</div>
                <p><strong>景点：</strong>{{ item.morning.spot || '未安排' }}</p>
                <p><strong>介绍：</strong>{{ item.morning.description || '暂无介绍' }}</p>
                <div class="tags">
                  <van-tag plain type="primary">门票: {{ item.morning.ticket || '免费' }}</van-tag>
                  <van-tag plain type="success">交通: {{ item.morning.transportation || '建议步行/公交' }}</van-tag>
                </div>
              </div>

              <div v-if="item.afternoon" class="period-item">
                <div class="period-title"><van-icon name="fire" color="#ee0a24"/> 下午</div>
                <p><strong>景点：</strong>{{ item.afternoon.spot || '未安排' }}</p>
                <p><strong>介绍：</strong>{{ item.afternoon.description || '暂无介绍' }}</p>
                <div class="tags">
                  <van-tag plain type="primary">门票: {{ item.afternoon.ticket || '免费' }}</van-tag>
                  <van-tag plain type="success">交通: {{ item.afternoon.transportation || '建议步行/公交' }}</van-tag>
                </div>
              </div>

              <div v-if="item.evening" class="period-item">
                <div class="period-title"><van-icon name="moon" color="#1989fa"/> 晚上</div>
                <p><strong>活动：</strong>{{ item.evening.spot || '自由活动' }}</p>
                <p><strong>介绍：</strong>{{ item.evening.description || '暂无介绍' }}</p>
                <div class="tags">
                  <van-tag plain type="primary">费用: {{ item.evening.ticket || '免费' }}</van-tag>
                  <van-tag plain type="success">交通: {{ item.evening.transportation || '建议步行/公交' }}</van-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="aiData.rawJson">
           <van-empty description="数据存在但无法识别为行程" />
        </div>

       <div v-if="aiData.budgetBreakdown" class="section">
        <div class="section-title">💰 预算明细</div>
        <div class="budget-list">
          
          <div v-if="aiData.budgetBreakdown.accommodation" class="budget-item">
            <span class="budget-label">🏨 住宿</span>
            <span class="budget-value">{{ aiData.budgetBreakdown.accommodation }}元</span>
          </div>

          <div v-if="aiData.budgetBreakdown.food" class="budget-item">
            <span class="budget-label">🍜 餐饮</span>
            <span class="budget-value">{{ aiData.budgetBreakdown.food }}元</span>
          </div>

          <div v-if="aiData.budgetBreakdown.transportation" class="budget-item">
            <span class="budget-label">🚗 交通</span>
            <span class="budget-value">{{ aiData.budgetBreakdown.transportation }}元</span>
          </div>

          <div v-if="aiData.budgetBreakdown.tickets" class="budget-item">
            <span class="budget-label">🎫 门票</span>
            <span class="budget-value">{{ aiData.budgetBreakdown.tickets }}元</span>
          </div>
          <div v-if="aiData.budgetBreakdown.other" class="budget-item">
            <span class="budget-label">📦 其他</span>
            <span class="budget-value">{{ aiData.budgetBreakdown.other }}元</span>
          </div>
          <div class="budget-total">
            <span class="budget-label">💰 总预算</span>
            <span class="budget-total-value">{{ aiData.totalBudget }}元</span>
          </div>
          </div>
        </div>

      </div>

      <div v-else-if="loading">
        <van-loading type="spinner" color="#1989fa" vertical>正在规划行程，请稍候...</van-loading>
      </div>

      <div v-else>
        <van-empty description="暂无行程数据，请返回重试" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.detail-container { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 20px; }
.content-card { background-color: #fff; border-radius: 12px; margin: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
.header-title { font-size: 20px; font-weight: 600; color: #323233; margin-bottom: 20px; text-align: center; }
.info-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 30px; padding: 0 10px; }
.info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; }
.info-item .label { color: #999; font-size: 15px; }
.info-item .value { color: #323233; font-weight: 500; font-size: 15px; }
.section { margin-top: 24px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.day-card { background: #f9f9f9; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #eee; }
.day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #ddd; padding-bottom: 12px; margin-bottom: 12px; }
.day-title { font-size: 16px; font-weight: bold; color: #333; }
.day-date { font-size: 13px; color: #999; }
.period-item { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
.period-item:last-child { margin-bottom: 0; }
.period-title { font-weight: 600; color: #333; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.period-item p { margin: 4px 0; font-size: 14px; line-height: 1.5; color: #555; }
.tags { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
.budget-list { background-color: #f7f8fa; border-radius: 8px; padding: 8px 16px; }
.budget-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e8e8e8; }
.budget-item:last-of-type { border-bottom: none; }
.budget-label { font-size: 14px; color: #646566; }
.budget-value { font-size: 14px; color: #323233; }
.budget-total { display: flex; justify-content: space-between; padding: 16px 0 8px; border-top: 1px solid #e8e8e8; margin-top: 4px; }
.budget-total .budget-label { font-weight: 600; color: #323233; }
.budget-total-value { font-size: 18px; font-weight: 600; color: #ee0a24; }
</style>