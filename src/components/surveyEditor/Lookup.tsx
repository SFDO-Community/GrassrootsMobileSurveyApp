import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/themed';
import { StackNavigationProp } from '@react-navigation/stack';

import { StackParamList } from '../../Router';
import { getRecords } from '../../services/database/database';
import { APP_THEME, APP_FONTS, DB_TABLE } from '../../constants';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;

type LookupPropType = {
  fieldName: string;
  fieldLabel: JSX.Element;
  title: string;
  value: string;
  navigation: SurveyEditorNavigationProp;
  disabled?: boolean;
};

function Lookup({ fieldName, fieldLabel, title, value, navigation, disabled }: LookupPropType) {
  const [lookupToName, setLookupToName] = useState('');

  useEffect(() => {
    const load = async () => {
      if (value) {
        const records = (await getRecords(DB_TABLE.CONTACT, `where id = '${value}'`)) || [{ name: 'Not Found' }];
        setLookupToName(records[0].name);
      } else {
        setLookupToName('');
      }
    };
    load();
  }, [value]);

  return (
    <View style={{ paddingBottom: 8, width: '100%' }}>
      <View style={{ paddingLeft: 10, paddingTop: 10 }}>{fieldLabel}</View>
      <TouchableOpacity
        onPress={() => {
          if (!disabled) navigation.navigate('Lookup', { fieldName, title });
        }}
      >
        <Input
          value={lookupToName}
          pointerEvents="none"
          inputContainerStyle={styles.inputContainerStyle}
          renderErrorMessage={false}
          rightIcon={{ name: 'search', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
          inputStyle={styles.inputStyle}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  labelStyle: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  inputContainerStyle: {
    height: 40,
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR,
  },
  inputStyle: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

export { Lookup };
