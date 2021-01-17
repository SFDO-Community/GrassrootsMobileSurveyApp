import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { APP_THEME, APP_FONTS } from '../constants';

const styles = StyleSheet.create({
  inputStyle: {
    padding: 10,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    flex: 8,
    backgroundColor: 'white',
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 2
  },
  searchBarContainer: {
    minHeight: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row'
  }
});

const SearchBar = ({ value, onChangeText, placeholder }) => {
  const { searchBarContainer, inputStyle } = styles;
  return (
    <View style={searchBarContainer}>
      <TextInput
        underlineColorAndroid="transparent"
        placeholder={placeholder}
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export { SearchBar };