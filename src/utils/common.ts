/*
 * Train Ticket Generator 中国铁路火车票生成器.
 * Copyright (C) 2024-present FoskyM<i@fosky.top>
 * https://github.com/FoskyM/train-ticket-generator
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This file is created by FoskyM on 2025/10/21.
 */

const maskedId = (idCard: string) => {
  return idCard.slice(0, 10) + '****' + idCard.slice(14)
}

const getStationSpacing = (stationText: string): number => {
  if (stationText.length >= 4) {
    return -6
  } else if (stationText.length == 3) {
    return 10
  } else {
    return 65
  }
}
export { maskedId, getStationSpacing }
