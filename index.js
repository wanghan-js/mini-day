export const Day = class {
  constructor(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    } else {
      // 有可能是 Date, Day, timestamp, undefined
      date = date || new Date();
    }
    this.d = new Date(+date);
  }

  clone() {
    return new Day(this);
  }

  year(num) {
    if (num === undefined) {
      return this.d.getFullYear();
    } else {
      const day = this.clone();
      day.d.setFullYear(num);
      return day;
    }
  }

  month(num) {
    if (num === undefined) {
      return this.d.getMonth() + 1;
    } else {
      const day = this.clone();
      day.d.setMonth(num - 1);
      return day;
    }
  }

  // 在一年内是第几周，以每周周日代表该周
  // 如果该年第一天不是周日，则该天代表的该周为上一年的最后一周
  week(num) {
    // 先算出该年的第一天是周几
    const weekDayOfFirstDay = this.startOf('year').weekDay();
    // 再算出该年第一周的周日是第几天
    let dayIndexOfFirstWeek;
    if (weekDayOfFirstDay === 0) {
      // 说明第一天是周日
      dayIndexOfFirstWeek = 1;
    } else {
      dayIndexOfFirstWeek = 7 - weekDayOfFirstDay + 1;
    }
    if (num === undefined) {
      // 算出该天是一年中的第几天
      const dayIndex = this.dayOfYear();
      const days = dayIndex - dayIndexOfFirstWeek + 1;
      if (days <= 0) {
        return this.add('year', -1)
          .endOf('year')
          .week();
      } else {
        return Math.ceil(days / 7);
      }
    } else {
      const startOfTheWeek = (num - 1) * 7 + dayIndexOfFirstWeek;
      return this.dayOfYear(startOfTheWeek);
    }
  }

  // num = [0, 6]
  weekDay(num) {
    if (num === undefined) {
      return this.d.getDay();
    } else {
      const delta = num - this.weekDay();
      return this.add('day', delta);
    }
  }

  day(num) {
    if (num === undefined) {
      return this.d.getDate();
    } else {
      const day = this.clone();
      day.d.setDate(num);
      return day;
    }
  }

  dayOfYear(num) {
    if (num === undefined) {
      const MillsOfDay = 24 * 60 * 60 * 1000;
      const firstDay = this.startOf('year');
      const thisDay = this.startOf('day');
      return (thisDay - firstDay) / MillsOfDay + 1;
    } else {
      return this.startOf('year').day(num);
    }
  }

  hour(num) {
    if (num === undefined) {
      return this.d.getHours();
    } else {
      const day = this.clone();
      day.d.setHours(num);
      return day;
    }
  }

  minute(num) {
    if (num === undefined) {
      return this.d.getMinutes();
    } else {
      const day = this.clone();
      day.d.setMinutes(num);
      return day;
    }
  }

  second(num) {
    if (num === undefined) {
      return this.d.getSeconds();
    } else {
      const day = this.clone();
      day.d.setSeconds(num);
      return day;
    }
  }

  millisecond(num) {
    if (num === undefined) {
      return this.d.getMilliseconds();
    } else {
      const day = this.clone();
      day.d.setMilliseconds(num);
      return day;
    }
  }

  isLeapYear() {
    const year = this.year();
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  }

  isSame(unit, d) {
    if (unit === 'year') {
      return this.year() === d.year();
    } else if (unit === 'month') {
      return this.isSame('year', d) && this.month() === d.month();
    } else if (unit === 'week') {
      return this.isSame('year', d) && this.week() === d.week();
    } else if (unit === 'day') {
      return this.isSame('year', d) && this.isSame('month', d) && this.day() === d.day();
    } else if (unit === 'time') {
      return +this === +d;
    } else {
      return false;
    }
  }

  isThis(unit) {
    const d = new Day();
    return this.isSame(unit, d);
  }

  startOf(unit) {
    let day = this.clone();
    if (unit === 'year') {
      day = day.month(1).startOf('month');
    } else if (unit === 'month') {
      day = day.day(1).startOf('day');
    } else if (unit === 'week') {
      day = day.weekDay(0).startOf('day');
    } else if (unit === 'day') {
      day.d.setHours(0, 0, 0, 0);
    }
    return day;
  }

  endOf(unit) {
    let day = this.clone();
    if (unit === 'year') {
      day = day.month(12).endOf('month');
    } else if (unit === 'month') {
      // 月末是第几天
      let _day;
      switch (this.month()) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
          _day = 31;
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          _day = 30;
          break;
        case 2:
          _day = this.isLeapYear() ? 29 : 28;
          break;
        default:
          _day = 30;
          break;
      }
      day = day.day(_day).endOf('day');
    } else if (unit === 'week') {
      day = day.weekDay(6).endOf('day');
    } else if (unit === 'day') {
      day.d.setHours(23, 59, 59, 999);
    }
    return day;
  }

  add(unit, num) {
    let day = this.clone();
    if (unit === 'year') {
      day = day.year(day.year() + num);
    } else if (unit === 'month') {
      day = day.month(day.month() + num);
    } else if (unit === 'week') {
      day = day.add('day', 7 * num);
    } else if (unit === 'day') {
      day = day.day(day.day() + num);
    }
    return day;
  }

  isBefore(d) {
    return this < d;
  }

  isAfter(d) {
    return this > d;
  }

  isBetween(days, inclusive = true) {
    const [d1, d2] = days;
    if (inclusive) {
      return !this.isBefore(d1) && !this.isAfter(d2);
    } else {
      return this.isAfter(d1) && this.isBefore(d2);
    }
  }

  // 参数 isFixedLines 表示是否固定显示 6 行
  calendar(isFixedLines = true) {
    const days = [];
    const firstDay = this.startOf('month').startOf('week');
    if (isFixedLines) {
      for (let i = 0; i < 42; i++) {
        days.push(firstDay.add('day', i));
      }
    } else {
      const lastDay = this.endOf('month')
        .endOf('week')
        .startOf('day');
      for (let d = firstDay; d <= lastDay; d = d.add('day', 1)) {
        days.push(d);
      }
    }

    const weeks = [];
    const weekCount = days.length / 7;
    for (let i = 0; i < weekCount; i++) {
      weeks.push(days.slice(i * 7, (i + 1) * 7));
    }
    return weeks;
  }

  format(s) {
    const chs = 'YMDdHhmsa';
    const result = [];
    let lastCh = '';
    for (const ch of s) {
      if (result.length > 0) {
        const lastNode = result[result.length - 1];
        if (chs.includes(ch)) {
          // 看看这个特殊字符是否跟上一个字符是一样的
          if (ch === lastCh) {
            lastNode[0] += ch;
          } else {
            // 新的特殊字符
            const newNode = [ch, ''];
            result.push(newNode);
          }
        } else {
          lastNode[1] += ch;
        }
      } else {
        const node = ['', ''];
        if (chs.includes(ch)) {
          node[0] += ch;
        } else {
          node[1] += ch;
        }
        result.push(node);
      }
      lastCh = ch;
    }
    const weekValue = '日一二三四五六';
    const monthValue = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const map = {
      YY: String(this.year()).slice(2),
      YYYY: this.year(),
      M: this.month(),
      MM: Day.padZero(this.month()),
      MMM: monthValue[this.month() - 1],
      MMMM: monthValue[this.month() - 1] + '月',
      D: this.day(),
      DD: Day.padZero(this.day()),
      d: this.weekDay(),
      dd: weekValue[this.weekDay()],
      ddd: '周' + weekValue[this.weekDay()],
      dddd: '星期' + weekValue[this.weekDay()],
      H: this.hour(),
      HH: Day.padZero(this.hour()),
      h: this.hour() === 12 ? 12 : this.hour() % 12,
      hh: Day.padZero(this.hour() === 12 ? 12 : this.hour() % 12),
      m: this.minute(),
      mm: Day.padZero(this.minute()),
      s: this.second(),
      ss: Day.padZero(this.second()),
      a: this.hour() < 12 ? '上午' : '下午',
    };
    const str = result.reduce((acc, node) => {
      let s;
      if (node[0] in map) {
        s = map[node[0]];
      } else {
        s = '';
      }
      return acc + s + node[1];
    }, '');
    return str;
  }

  valueOf() {
    return +this.d;
  }

  static padZero(num) {
    return num < 10 ? `0${num}` : num;
  }
};
