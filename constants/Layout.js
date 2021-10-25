import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,

  defaultFontSize: 18,
  defaultPaddingHorizontal: 20,
  defaultMarginHorizontal: 20,

  elementStyle: {
    paddingHorizontal: 20, width: '100%', marginTop: 10
  },
};
