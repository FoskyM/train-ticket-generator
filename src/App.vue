<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TicketReceipt from '@/components/TicketReceipt.vue';

const tabs = ref([
  { label: '蓝票(报销凭证)', key: 'receipt' },
  { label: '蓝票(5代磁介质实名车票)', key: 'ticket5g' },
  { label: '蓝票(4代磁介质非实名车票)', key: 'ticket4g'},
  { label: '红票(3代软质车票)', key: 'ticket3g'},
  { label: '红票(2代软质一维码车票)', key: 'ticket2g'},
  { label: '纸板票(1代纸板火车票)', key: 'ticket1g'}
]);

const activeTab = ref('receipt');

type TicketData = {
  id: string; // 火车票 ID
  redId: string; // 左上角红色 ID
  ticketOffice: string; // 售票点
  startStation: string; // 出发地
  endStation: string; // 目的地
  trainNumber: string; // 车次
  date: string; // 日期
  time: string; // 时间
  price: number; // 价格

  // 座位信息
  seatType: string; // 座位类型
  seatCarriage: string; // 车厢号
  seatNumber: string; // 座位号

  // 乘客信息
  passengerName: string; // 姓名
  passengerId: string; // 身份证号

  // 其他信息
  seatTypeCustom?: string; // 自定义座位类型
  checkGate?: string; // 检票口
  isStudent?: boolean; // 是否学生票
  isDiscount?: boolean; // 是否优惠票
};

const seatTypeList = ref([
  '商务座',
  '一等座',
  '二等座',
  '无座',
  '硬座',
  '硬卧',
  '软卧',
]);

const fieldInfo = ref({
  id: { label: '火车票 ID', type: 'text', colSpan: 2 },
  redId: { label: '红色 ID', type: 'text', colSpan: 2 },
  ticketOffice: { label: '售票点', type: 'text', colSpan: 1 },
  startStation: { label: '出发地', type: 'text', colSpan: 1 },
  endStation: { label: '目的地', type: 'text', colSpan: 1 },
  trainNumber: { label: '车次', type: 'text', colSpan: 1 },
  date: { label: '日期', type: 'date', colSpan: 1 },
  time: { label: '时间', type: 'time', colSpan: 1 },
  price: { label: '价格', type: 'float', colSpan: 1 },
  seatType: {
    label: '座位类型',
    type: 'select',
    data: seatTypeList,
    colSpan: 1,
  },
  seatCarriage: { label: '车厢号', type: 'text', colSpan: 1 },
  seatNumber: { label: '座位号', type: 'text', colSpan: 1 },
  passengerName: { label: '乘客姓名', type: 'text', colSpan: 1 },
  passengerId: { label: '身份证号', type: 'text', colSpan: 1 },

  seatTypeCustom: { label: '自定义座位类型', type: 'text', colSpan: 1 },
  checkGate: { label: '检票口', type: 'text', colSpan: 1 },
  isStudent: { label: '学生票', type: 'checkbox', colSpan: 1 },
  isDiscount: { label: '优惠票', type: 'checkbox', colSpan: 1 },
});

const ticketInfo = ref<TicketData>({
  id: '5166430030905Q041902',
  redId: 'Z160Q041902',
  ticketOffice: '临高南',
  startStation: '临高南',
  endStation: '海口东',
  trainNumber: 'D7162',
  date: '2018-09-04',
  time: '13:02',
  price: 24.0,
  seatType: '二等座',
  seatCarriage: '03',
  seatNumber: '16B',
  passengerName: '张三',
  passengerId: '370921199024131424',

  seatTypeCustom: '二等座始发改签',
  checkGate: '2号检票口',
  isStudent: false,
  isDiscount: true,
});

const generateFormFields = () => {
  const fields = [];
  for (const key in ticketInfo.value) {
    const value = ticketInfo.value[key];
    fields.push({
      key,
      label: fieldInfo.value[key].label,
      type: fieldInfo.value[key].type,
      colSpan: fieldInfo.value[key].colSpan,
      disabled: false
    });
  }
  for (const field of fields) {
    if (field.type === 'select') {
      field.data = fieldInfo.value[field.key].data;
    } else if (field.type === 'float') {
      field.type = 'number';
      field.step = '0.01';
    } else if (field.type === 'number') {
      field.step = '1';
    }
  }
  return fields;
};

const formFields = generateFormFields();

watch(() => ticketInfo.value.isStudent, (value) => {
  if (value) {
    ticketInfo.value.isDiscount = true;
    fieldInfo.value.isDiscount.disabled = true;
  } else {
    fieldInfo.value.isDiscount.disabled = false;
  }
}, { deep: true });
</script>

<template>
  <div class="container px-5 py-24 mx-auto my-auto h-full">
    <div
      class="items-center justify-between p-4 rounded-lg bg-white shadow-indigo-50 shadow-md"
    >
      <h2 class="text-2xl font-bold mb-4">火车票生成器</h2>
      <div>
        <form>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              v-for="field in formFields"
              :key="field.key"
              :class="`col-span-${field.colSpan}`"
              class="space-y-2"
            >
              <label
                :for="field.key"
                class="block text-sm font-medium text-gray-700"
                >{{ field.label }}</label
              >
              <template v-if="field.type === 'select'">
                <select
                  v-model="ticketInfo[field.key]"
                  :id="field.key"
                  :disabled="field.disabled"
                  class="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="item in field.data" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </template>
              <template v-else-if="field.type === 'checkbox'">
                <div class="flex items-center">
                  <input
                    :type="field.type"
                    :id="field.key"
                    :disabled="fieldInfo[field.key].disabled"
                    v-model="ticketInfo[field.key]"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    :for="field.key"
                    class="ml-2 block text-sm text-gray-900 select-none"
                    >{{ field.label }}</label
                  >
                </div>
              </template>
              <template v-else>
                <input
                  :type="field.type"
                  :step="field.step || null"
                  :id="field.key"
                  :disabled="field.disabled"
                  v-model="ticketInfo[field.key]"
                  class="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </template>
            </div>
          </div>
        </form>
      </div>

      <div class="py-2"></div>

      <div>
        <div class="tab text-sm">
          <div class="tab-item" v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="{ active: activeTab === tab.key }">{{ tab.label }}</div>
        </div>
      </div>

      <div class="py-2"></div>

      <div>
        <div class="ticket-container py-4">
          <TicketReceipt :ticketInfo="ticketInfo" v-if="activeTab == 'receipt'"/>

          <template v-else>
            <h2 class="text-2xl">
              其它车票仍在开发中，敬请期待！
            </h2>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
