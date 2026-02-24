export type TicketData = {
  redId: string // 上票号
  id: string // 下票号
  startStation: string // 出发地
  endStation: string // 目的地
  checkGate?: string // 检票口
  ticketOffice: string // 售票点
  trainNumber: string // 车次
  price: number // 价格
  date: string // 日期
  time: string // 时间


  // 座位信息
  seatType: string // 席别
  berth: string // 铺位
  seatCarriage: string // 车厢号
  seatNumber: string // 座位号

  // 乘客信息
  passengerName: string // 姓名
  passengerId: string // 身份证号

  // 其他信息
  qrCodeId: string // 二维码内容
  isChild?: boolean // 是否儿童票
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
