import React from 'react';
import {Modal, StyleSheet, TouchableOpacity, View, TextInput, ActivityIndicator, ScrollView} from 'react-native';
import {Image, Button, Text, Icon, Input} from 'react-native-elements';
import { CommonActions } from '@react-navigation/native';
import update from 'react-addons-update';
import Colors from '../constants/Colors'
import Layout from '../constants/Layout';
import firestore from '@react-native-firebase/firestore';
import i18n from 'i18n-js'
import Feather from 'react-native-vector-icons/Feather';
import MyUtils from '../utilities/MyUtils';

export default class DiaryScreen extends React.Component {
  constructor(props) {
    super(props);

    this.today = new Date();
    this.selectedDiary = null;
    this.calendarChecker = null;
    this.state = {
      titleOfDiary: '',
      weeks: [],
      disableEditViewTouch: false,
      currentCalendar: {year: this.today.getFullYear(), month: this.today.getMonth()},
      currentPiece: {title: '', content: '', dayCount: 0, pieceRef: '', date: ''},
      visibleEditView: false,
      loadingDiaries: true
    }

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      const {piece} = this.props.route.params;
      if(piece !== undefined) {
        console.log('piece =', piece);
        this.checkDay(piece.dayCount, true, piece.ref);
        this.props.navigation.dispatch({...CommonActions.setParams({piece: undefined}), source: this.props.route.key})
      } else {
        console.log('there is no piece!!');
      }
    });
  }

  componentDidMount() {
    const {diary} = this.props.route.params;
    console.log('selectedDiary =', diary);
    this.selectedDiary = diary;
    if(this.selectedDiary.year !== this.today.getFullYear()) {
      this.today = new Date(this.selectedDiary.year, this.today.getMonth(), this.today.getDate());
      this.setState({currentCalendar: {year: this.today.getFullYear(), month: this.today.getMonth()}}, () => {
        this.setState({titleOfDiary: this.selectedDiary.title});
        this.findCalendarCheckers(this.selectedDiary);
      });
    } else {
      this.setState({titleOfDiary: this.selectedDiary.title});
      this.findCalendarCheckers(this.selectedDiary);
    }
  }
  componentWillUnmount() {
  }

  findDayInWeek = (year, month, dayCount) => {
    let start = new Date(year, month, 1);
    let dayOffset = start.getDay();
    let whatDay = dayOffset + dayCount-1;
    let row = parseInt(whatDay/7);
    let column = whatDay%7;
    console.log('whatDay = ' + whatDay + ', row = ' + row + ', column = ' + column);
    return {row: row, column: column, content: this.state.weeks[row][column]};
  }
  gotoKeeping = (dayCount, pieceId=null) => {
    let pickDay = new Date(this.state.currentCalendar.year, this.state.currentCalendar.month, dayCount);
    let thisDay = [pickDay.getFullYear(), (pickDay.getMonth()), pickDay.getDate(), pickDay.getDay()];
    let params = {prevRouteName: this.props.route.name, dayCount: dayCount, thisDay: thisDay, diaryId: this.selectedDiary.docId, pieceId: pieceId};
    this.props.navigation.navigate('Keeping', params);
  }
  onPressDay = (dayCount) => {
    const dayInWeek = this.findDayInWeek(this.state.currentCalendar.year, this.state.currentCalendar.month, dayCount);
    if(dayInWeek.content.checkDay) {
      console.log('week =', dayInWeek.content);
      firestore().collection('pieces').doc(dayInWeek.content.ref).get().then(doc => {
        if(doc.exists) {
          const piece = doc.data();
          let updatedAt = piece.updatedAt.toDate();//이걸로 할력고 함
          let weekDay = i18n.t('weekDays')[updatedAt.getDay()];
          let pieceDate = updatedAt.getFullYear() + '-' + (updatedAt.getMonth()+1) + '-' + updatedAt.getDate() + '-' + weekDay;
          console.log('pieceDate =', pieceDate);
          this.setState({currentPiece: {title: piece.title, content: piece.content, dayCount: dayCount, pieceId: doc.id, date: pieceDate}, visibleEditView: true});
        }
      }).catch(error => {console.error("Error getting document:", error)})
    } else {
      this.gotoKeeping(dayCount);
    }
  }
  checkDay = (dayCount, check, ref=null) => {
    let dayInWeek = this.findDayInWeek(this.state.currentCalendar.year, this.state.currentCalendar.month, dayCount);
    dayInWeek.content.checkDay = check;
    if(ref !== null) {
      dayInWeek.content.ref = ref;
    }
    this.setState({weeks: update(this.state.weeks, {[dayInWeek.row]: {[dayInWeek.column]: {$set: dayInWeek.content}}})}, () => {
    });
  }

  findCalendarCheckers = (diary) => {
    console.log('currentCalendar =', this.state.currentCalendar);
    const diaryRef = firestore().collection('diaries').doc(diary.docId);
    firestore().collection('calendarCheckers').where('diary', '==', diaryRef).where('month', '==', this.state.currentCalendar.month+1).get().then(querySnapshot => {
      let checkedDays = [];
      this.calendarChecker = null;
      querySnapshot.forEach(doc => {
        this.calendarChecker = doc.data();
      });
      if(this.calendarChecker !== null) {
        checkedDays = this.calendarChecker.checkedDays.sort((a, b) => {
          return a.day - b.day;
        });
      }
      console.log('checkedDays =', checkedDays);
      let c=0;
      let allDays = [];
      let numberOfDays = MyUtils.numberOfDays(this.state.currentCalendar.year, this.state.currentCalendar.month+1);
      for(let i=0; i<numberOfDays; i++) {
        if(checkedDays.length > 0 && c < checkedDays.length) {
          if((i+1) == checkedDays[c].day) {
            // allDays.push(true);
            allDays.push({check: true, ref: checkedDays[c].ref});
            c++;
          } else {
            allDays.push({check: false});
          }
        } else {
          allDays.push({check: false});
        }
      }
      console.log('allDays =', allDays);
      console.log('allDays length = ', allDays.length);

      this.setState({checkedDays: checkedDays}, () => {
        this.makeCalendar(this.state.currentCalendar.year, this.state.currentCalendar.month+1, allDays);
      });
    })
  }

  moveMonth = (move) => {
    let calendar = this.state.currentCalendar;
    if(move == 'prev') {
      calendar.month = (calendar.month-1) < 0 ? 11 : (calendar.month-1);
    } else if(move == 'next') {
      calendar.month = (calendar.month+1) > 11 ? 0 : (calendar.month+1);
    }
    this.setState({currentCalendar: calendar}, () => {
      this.findCalendarCheckers(this.selectedDiary);
    });
  }

  YearMonthView = (props) => {
    const {currentCalendar, moveMonth} = props;
    let yearmonth = '';
    if(i18n.locale == 'ko') {
      yearmonth = currentCalendar.year + '년 ' + (currentCalendar.month+1) + '월';
    }
    return (
      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
        <TouchableOpacity onPress={moveMonth.bind(this, 'prev')}>
          <Feather name='chevron-left' size={30} color={Colors.tintColor} />
        </TouchableOpacity>
        <Text style={styles.day}>{yearmonth}</Text>
        <TouchableOpacity onPress={moveMonth.bind(this, 'next')}>
          <Feather name='chevron-right' size={30} color={Colors.tintColor} />
        </TouchableOpacity>
      </View>
    )
  }
  WeekView = () => {
    let ar = i18n.t('weekDays');
    let weekDays = [
      {whatDay: ar[0], style: {...styles.day, color: 'red'}},
      {whatDay: ar[1], style: styles.day},{whatDay: ar[2], style: styles.day},{whatDay: ar[3], style: styles.day},{whatDay: ar[4], style: styles.day},{whatDay: ar[5], style: styles.day},
      {whatDay: ar[6], style: {...styles.day, color: Colors.tintColor}},
    ];
    let fontSize = (i18n.locale == 'ko') ? 24 : 12;
    weekDays.forEach(day => {day.style = {...day.style, fontSize: fontSize}});

    return (
      <View style={{flexDirection: 'row'}}>
        {weekDays.map(day => <View style={{flex: 1}}><Text style={day.style}>{day.whatDay}</Text></View>)}
      </View>
    )
  }

  makeCalendar = (year, month, checkAllDays) => {
    let numberOfDays = MyUtils.numberOfDays(year, month);
    console.log('numberOfDays =', numberOfDays);

    let weeks = new Array();
    let start = new Date(year, month-1, 1);
    let dayCount=1, dayOffset = start.getDay();
    console.log('start.getDay() =', start.getDay());

    let weekCount = parseInt((dayOffset+numberOfDays)/7);
    weekCount += ((dayOffset+numberOfDays)%7) > 0 ? 1 : 0;
    console.log('weekCount =', weekCount);
    for(let i=0; i<weekCount; i++) {
      let days = new Array();
      for (let d = 0; d < 7; d++) {
        let dayColor = 'dimgray';
        if(d === 0) {
          dayColor = 'red';
        } else if(d === 6) {
          dayColor = Colors.tintColor;
        }
        if(d >= dayOffset && dayCount <= numberOfDays) {
          let checkDay = checkAllDays.length > 0 ? {checkDay: checkAllDays[dayCount-1].check, ref: checkAllDays[dayCount-1].ref} : {checkDay: false};
          if(year == this.today.getFullYear() && month == (this.today.getMonth()+1) && this.today.getDate() == dayCount) {
            days.push({type: 'today', dayCount: dayCount, dayColor: dayColor, ...checkDay});
          } else {
            days.push({type: 'anotherDay', dayCount: dayCount, dayColor: dayColor, ...checkDay});
          }
          dayCount++;
        } else {
          days.push({type: 'blank', dayCount: dayCount, dayColor: dayColor, checkDay: false});
        }
      }
      weeks.push(days);
      dayOffset=0;
    }
    this.setState({weeks: weeks});
  }

  PresentCalendar = (props) => {
    const {weeks} = props;

    function PresentDay(props) {
      const {type, dayCount, dayColor, checkDay, onPress} = props;
      if(type == 'today') {
        return (
          <TouchableOpacity style={{flex: 1, alignItems: 'center', borderWidth: 0.5, borderRadius: 40, borderColor: dayColor}} onPress={onPress.bind(this, dayCount)}>
            <Text style={{...styles.day, color: dayColor}}>{dayCount}</Text>
            <View style={{position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 2, backgroundColor: '#4BB543', opacity: checkDay ? 1 :0}}></View>
          </TouchableOpacity>
        )
      } else if(type == 'anotherDay') {
        return (
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}}  onPress={onPress.bind(this, dayCount)}>
            <Text style={{...styles.day, color: dayColor}}>{dayCount}</Text>
            <View style={{position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#4BB543', opacity: checkDay == true ? 1 : 0}}></View>
          </TouchableOpacity>
        )
      } else {
        return (
          <View style={{flex: 1}}>
            <Text style={{...styles.day, color: dayColor}}> </Text>
          </View>
        )
      }
    }

    if(weeks.length <= 0) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        </View>
      )
    } else {
      return (
        weeks.map((week, index) => {
          return (
            <View key={index} style={{flexDirection: 'row'}}>
              {week.map(day => <PresentDay type={day.type} dayCount={day.dayCount} dayColor={day.dayColor} checkDay={day.checkDay} onPress={this.onPressDay} />)}
            </View>
          )
        })
      )
    }
  }

  movePiece = (move) => {
    let pieceDate = firestore.Timestamp.fromDate(new Date(this.state.currentCalendar.year, this.state.currentCalendar.month, this.state.currentPiece.dayCount));
    const diaryRef = firestore().collection('diaries').doc(this.selectedDiary.docId);
    const terms = move == 'prev' ? {compareTime: '<', orderBy: 'desc'} : {compareTime: '>', orderBy: 'asc'};
    firestore().collection('pieces').where('diaryRef', '==', diaryRef).where('updatedAt', terms.compareTime, pieceDate).orderBy('updatedAt', terms.orderBy).limit(1).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if(doc.exists) {
          const piece = doc.data();
          let updatedAt = piece.updatedAt.toDate();//이걸로 할력고 함
          let weekDay = i18n.t('weekDays')[updatedAt.getDay()];
          let pieceDate = updatedAt.getFullYear() + '-' + (updatedAt.getMonth()+1) + '-' + updatedAt.getDate() + '-' + weekDay;
          console.log('pieceDate =', pieceDate);
          this.setState({currentPiece: {title: piece.title, content: piece.content, dayCount: piece.day, pieceId: doc.id, date: pieceDate}});
        }
      });
    })
  }
  changePiece = () => {
    this.setState({visibleEditView: false}, () => {
      this.gotoKeeping(this.state.currentPiece.dayCount, this.state.currentPiece.pieceId);
    });
  }
  deletePiece = async () => {
    console.log('deletePiece id =', this.state.currentPiece.pieceId);
    this.setState({disableEditViewTouch: true}, async () => {
      let piece = await (async (id) => {
        return new Promise(resolve => {
          firestore().collection('pieces').doc(id).get().then(doc => {
            if(doc.exists) {
              resolve(doc.data());
            } else {
              resolve(null);
            }
          }).catch(error => {
            console.error('Error document: ', error);
            resolve(null);
          })
        })
      })(this.state.currentPiece.pieceId);

      if(piece !== null) {
        firestore().collection('pieces').doc(this.state.currentPiece.pieceId).delete().then(() => {
          piece.calendarCheckerRef.update({'checkedDays': firestore.FieldValue.arrayRemove({day: piece.day, ref: this.state.currentPiece.pieceId})}).then(() => {
            console.log("Document successfully updated!");
            this.checkDay(piece.day, false);
            //다음 이나 이전에 piece를 찾아서 있으면 그걸 보여준다.
            //없다면 그냥 닫음
            this.setState({disableEditViewTouch: false, visibleEditView: false});
          }).catch(error => {console.error("Error updating document: ", error)});
        }).catch(error => {console.error("Error removing document: ", error)})
      }
    })
  }

  EditView = (props) => {
    const {piece, visibleModal, disableTouch} = props;
    return (
      <Modal animationType='slide' transparent={true} visible={visibleModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={() => {this.setState({visibleEditView: false})}} disabled={disableTouch}>
                <Feather name='x' size={30} color='dimgray' />
              </TouchableOpacity>
            </View>
            <Text style={{fontSize: 22, fontWeight: 'bold'}}>{piece.title}</Text>
            <Text style={{fontSize: 18, alignSelf: 'flex-end', marginBottom: 10}}>{piece.date}</Text>
            <ScrollView>
              <Text style={{fontSize: 20}}>{piece.content}</Text>
            </ScrollView>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20}}>
              <TouchableOpacity onPress={this.movePiece.bind(this, 'prev')} disabled={disableTouch}>
                <Feather name='chevron-left' size={30} color={Colors.tintColor} />
              </TouchableOpacity>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={{marginRight: 15}} onPress={this.changePiece.bind(this)} disabled={disableTouch}>
                  <Text style={{fontSize: 20, color: Colors.tintColor}}>{i18n.t('Change')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{marginLeft: 15}} onPress={this.deletePiece.bind(this)} disabled={disableTouch}>
                  <Text style={{fontSize: 20, color: 'tomato'}}>{i18n.t('Delete')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={this.movePiece.bind(this, 'next')} disabled={disableTouch}>
                <Feather name='chevron-right' size={30} color={Colors.tintColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <Text style={styles.day}>{this.state.titleOfDiary}</Text>
          <this.YearMonthView currentCalendar={this.state.currentCalendar} moveMonth={this.moveMonth} />
          <this.WeekView />
          <this.PresentCalendar weeks={this.state.weeks} />
          <this.EditView piece={this.state.currentPiece} disableTouch={this.state.disableEditViewTouch} visibleModal={this.state.visibleEditView} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  day: {
    textAlign: 'center', fontSize: 24, margin: 10
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: (Layout.window.width * 0.95),
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  textAreaContainer: {
    width: Layout.window.width-100,
    height: Layout.window.height/2,
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 5,
    marginVertical: 10
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start"
  }
});
