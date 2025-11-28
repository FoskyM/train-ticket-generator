export type TicketData = {
  id: string // 火车票 ID
  redId: string // 左上角红色 ID
  ticketOffice: string // 售票点
  startStation: string // 出发地
  endStation: string // 目的地
  trainNumber: string // 车次
  date: string // 日期
  time: string // 时间
  price: number // 价格

  // 座位信息
  seatType: string // 座位类型
  seatCarriage: string // 车厢号
  seatNumber: string // 座位号

  // 乘客信息
  passengerName: string // 姓名
  passengerId: string // 身份证号

  // 其他信息
  seatTypeCustom?: string // 自定义座位类型
  checkGate?: string // 检票口
  isStudent?: boolean // 是否学生票
  isDiscount?: boolean // 是否优惠票

  [key: string]: any
}

/**
 * 字体配置
 */
export type FontConfig = {
  family: string // 字体族
  size: number // 字号(px)
  weight?: string | number // 字重
}

/**
 * 磨损效果配置
 */
export type WearEffectConfig = {
  enabled: boolean // 是否启用磨损效果
  intensity: number // 磨损强度 0-1
}

/**
 * 票据样式配置 - 用于各种票据组件导出
 */
export type TicketStyleConfig = {
  // 字体配置
  fonts: {
    station: FontConfig // 站名
    stationPinyin: FontConfig // 站名拼音
    trainNumber: FontConfig // 车次
    date: FontConfig // 日期时间
    seatInfo: FontConfig // 座位信息
    price: FontConfig // 价格
    passenger: FontConfig // 乘客信息
    label: FontConfig // 标签文字（年月日开车号等）
    notice: FontConfig // 报销提示
    ticketId: FontConfig // 票据ID
    redId: FontConfig // 红色ID
    checkGate: FontConfig // 检票口
    backTitle: FontConfig // 背面标题
    backContent: FontConfig // 背面内容
    [key: string]: FontConfig // 索引签名，允许字符串索引
  }
  // 磨损效果配置
  wearEffect: WearEffectConfig
  [key: string]: any
}

/**
 * 样式配置字段定义 - 用于动态表单渲染
 */
export type StyleFieldInfo = {
  label: string
  key: string
  sizeMin: number
  sizeMax: number
}

/**
 * 样式字段分组 - 用于表单分组显示
 */
export type StyleFieldGroup = {
  fields: StyleFieldInfo[]
}

/**
 * 票据组件暴露的配置接口
 */
export interface TicketComponentExpose {
  defaultStyleConfig: TicketStyleConfig
  styleFieldGroups: StyleFieldGroup[]
}

export type FieldInfoColumn = {
  label: string
  colSpan: number
  onlyEnglishAndNumber?: boolean
  onlyChinese?: boolean
  maxLength?: number
  maxValue?: number
  data?: any
  disabled?: boolean
} & (
  | {
      type: 'text' | 'date' | 'time' | 'float' | 'number' | 'checkbox'
    }
  | {
      type: 'select'
      data: Array<{ label: string; key: string | number }>
    }
)
export type FieldInfoData = Record<string, FieldInfoColumn>
