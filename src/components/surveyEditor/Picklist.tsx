import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { APP_THEME } from '../../constants';
import { getPicklistValues } from '../../services/database/metadata';

type PicklistPropType = {
  fieldName: string;
  fieldLabel: JSX.Element;
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  hideNone?: boolean;
};

function Picklist(props: PicklistPropType) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const setPicklistValues = async () => {
      const storedOptions = await getPicklistValues(props.fieldName);
      setOptions(storedOptions.map(o => ({ label: o.label, value: o.value })));
    };
    setPicklistValues();
  }, []);

  const { onValueChange, value, disabled, fieldLabel } = props;

  return (
    <View
      style={{
        padding: 10,
        width: '100%',
      }}
    >
      {fieldLabel}
      {options.length > 0 && (
        <RNPickerSelect
          disabled={disabled}
          value={value}
          items={options}
          style={pickerSelectStyles}
          // dropDownStyle={{ backgroundColor: APP_THEME.APP_WHITE }}
          // placeholder={{}}
          onValueChange={value => {
            onValueChange(value);
          }}
        />
      )}
    </View>
  );
}

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
