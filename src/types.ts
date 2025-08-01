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
