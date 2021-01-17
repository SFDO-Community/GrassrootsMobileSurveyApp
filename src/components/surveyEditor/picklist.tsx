import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { APP_THEME, APP_FONTS, L10N_PREFIX } from '../../constants';
import LocalizationContext from '../../context/localizationContext';
import { getPicklistValues } from '../../services/describe';

type PicklistPropType = {
  fieldName: string;
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  hideNone?: boolean;
};

function Picklist(props: PicklistPropType) {
  const [options, setOptions] = useState([]);
  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const setPicklistValues = async () => {
      const storedOptions = await getPicklistValues(props.fieldName);
      setOptions(storedOptions.map(o => ({ label: o.label, value: o.value })));
    };
    setPicklistValues();
  }, []);

  const { onValueChange, value, disabled, fieldName } = props;

  const displayLabel = () => {
    return t(`${L10N_PREFIX.PageLayoutItem}${fieldName}`);
  };

  return (
    <View
      style={{
        padding: 10,
        width: '100%',
      }}
    >
      <Text style={styles.titleLabel}>{displayLabel()}</Text>
      {options.length > 0 && (
        <RNPickerSelect
          disabled={disabled}
          value={value}
          items={options}
          style={pickerSelectStyles}
          // dropDownStyle={{ backgroundColor: '#FFF' }}
          //placeholder={{}}
          onValueChange={value => {
            onValueChange(value);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    color: 'black',
  },
  inputAndroid: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export { Picklist };
