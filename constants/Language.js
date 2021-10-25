import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js'

i18n.translations = {
  en: {
    SignIn: 'SignIn',
    SignUp: 'SignUp',
    inputYourEmail: 'input your email',
    inputPassword: 'input Password',
    inputPasswordAgain: 'input Password Again',
    nickName: 'Nickname',
    inputYourNickname: 'input your nickname',
    NotInEmailFormat: 'Not in email format',
    AtLeast6Digits: 'Must be at least 6 digits',
    PasswordDoNotMatch: 'Passwords do not match',
    AlreadyHaveAccount: 'You already have an account',
    ResendEmailVerification: 'Resend verification Email',
    SentEmailVerification: 'Sent a verification Email',
    EmailNotVerified: 'Email has not been Verified',
    AlreadyVerified: 'Already Verified',
    InvalidEmailOrPassword: 'Invalid Email or Password',
    PasswordReset: 'Password Reset',
    SendPasswordResetEmail: 'Send Password Reset Email',
    ResetEMailSentSuccessfully: 'EMail has been sent successfully',
    SingUpSuccessMessage: 'Congratulations on signing up.\nPlease log in after email verification!!',
    gotoSignIn: 'go to SignIn',
    Save: 'Save',
    Cancel: 'Cancel',
    Close: 'Close',
    Change: 'Change',
    Delete: 'Delete',
    Home: 'Home',
    Diary: 'Diary',
    Keeping: 'Keeping Diary',
    inputTitle: 'input title...',
    inputContent: 'input content...',
    done: 'Done',
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  ko: {
    SignIn: '로그인',
    SignUp: '회원가입',
    inputYourEmail: '이메일을 입력하세요',
    inputPassword: '비밀번호를 입력하세요',
    inputPasswordAgain: '비밀번호를 한번 더 입력해주세요',
    nickName: '별명',
    inputYourNickname: '별명을 입력해 주세요',
    NotInEmailFormat: '이메일 형식이 아닙니다',
    AtLeast6Digits: '6자리 이상 이어야 합니다',
    PasswordDoNotMatch: '비밀번호가 일치 하지 않습니다',
    AlreadyHaveAccount: '이미 계정이 있습니다',
    ResendEmailVerification: '인증메일 다시 보내기',
    SentEmailVerification: '인증메일을 보냈습니다',
    EmailNotVerified: '이메일 인증이 되지 않았습니다',
    AlreadyVerified: '이미 인증되었습니다',
    InvalidEmailOrPassword: '잘못된 아이디 혹은 비밀번호 입니다',
    PasswordReset: '비밀번호 재설정',
    SendPasswordResetEmail: '비밀번호 재설정 메일 보내기',
    ResetEMailSentSuccessfully: '이메일을 성공적으로 보냈습니다',
    SingUpSuccessMessage: '회원가입을 축하합니다.\n이메일 인증을 한뒤 로그인 해주세요!!',
    gotoSignIn: '로그인하러 가기',
    Save: '저장',
    Cancel: '취소',
    Close: '닫기',
    Change: '수정',
    Delete: '삭제',
    Home: '홈',
    Diary: '다이어리',
    Keeping: '쓰기',
    inputTitle: '제목을 입력하세요',
    inputContent: '내용을 입력하세요',
    done: '완료',
    weekDays: ['일', '월', '화', '수', '목', '금', '토']
  }
}

function Language() {
  i18n.locale = RNLocalize.getLocales()[1].languageCode;
  // i18n.locale = 'ko';
  i18n.fallback = true;
  console.log('set language i18n');
}
export default Language;
