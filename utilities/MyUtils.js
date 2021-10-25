export default {
  toLocaleString: (a) => {return (a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))},
  isEmpty: (obj) => {//오브젝트를 체크한다. 다른 다라타입은 false
    if(Object.keys(obj).length === 0) return true;
    return false;
  },
  isAvailable: (obj) => {//오브젝트를 체크한다. 다른 다라타입은 false
    if(Object.keys(obj).length === 0) return false;
    return true;
  },
  getDateString: (date, showtime=false) => {
    const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
    let dd = date.getDate();
    let mm = date.getMonth()+1;//january is 0
    let yyyy = date.getFullYear();

    if(dd<10) dd = '0'+dd;
    if(mm<10) mm = '0'+mm;
    let result = yyyy + '-' + mm + '-' + dd + '-' + weekNames[date.getDay()];
    if(showtime) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      if(hours<10) hours = '0'+hours;
      if(minutes<10) minutes = '0'+minutes;
      if(seconds<10) seconds = '0'+seconds;
      result += ' ' + hours + '-' + minutes + '-' + seconds;
    }
    return result;
  },
  getDateStringKr: (date, showtime=false) => {
    const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
    let dd = date.getDate();
    let mm = date.getMonth()+1;//january is 0
    let yyyy = date.getFullYear();

    if(dd<10) dd = '0'+dd;
    if(mm<10) mm = '0'+mm;
    let result = yyyy + '년 ' + mm + '월 ' + dd + '일 ' + weekNames[date.getDay()] + '요일';
    if(showtime) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      if(hours<10) hours = '0'+hours;
      if(minutes<10) minutes = '0'+minutes;
      if(seconds<10) seconds = '0'+seconds;
      result += ' ' + hours + ':' + minutes;
    }
    return result;
  },
  getNoonTime: (t) => {
    let noon = 'AM ';
    let tarray = t.split(':');
    let hours = parseInt(tarray[0]);
    if(hours > 12) {
      noon = 'PM ';
      hours -= 12;
    }
    let pad = (n, width) => {
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
    return noon + this.pad(hours, 2) + ':' + this.pad(tarray[1], 2);
  },
  numberOfDays: (year, month) => {
    switch(month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        return 31;
      case 4: case 6: case 9: case 11:
        return 30;
      case 2:
        if(((year%400)==0||(year%4)==0&&(year%100)!=0)){
          return 29;
        }
        return 28;
    }
  },
  compareDate: (from, to) => {
    let diffMs = Math.abs(to - from); // milliseconds between now & from
    let diffDays = Math.floor(diffMs / 86400000); // days
    let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return {days: diffDays, hours: diffHrs, minutes: diffMins};
  },
  checkEmailStyle: (str) => {
    var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    if (regExp.test(str)) return true;
    else return false;
  },
  resizeOnRatio: (width, height, maxSize) => {
    let resize = {width: width, height: height};
    if(width > height) {
      if(width > maxSize) {
        //xh = wy => xh/w = y
        resize.height = maxSize*resize.height/resize.width;
        resize.width = maxSize;
      }
    } else {
      if(height > maxSize) {
        //xh = wy => x = wy/h
        resize.width = resize.width*maxSize/resize.height;
        resize.height = maxSize;
      }
    }
    return resize;
  },
  parallelSync: async(items, callback) => {
    await Promise.all(
      items.map(async(item) => {
        await callback(item);
      })
    );
  }
}
