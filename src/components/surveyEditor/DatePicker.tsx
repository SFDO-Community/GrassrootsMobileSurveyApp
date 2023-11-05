import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { APP_THEME, APP_FONTS } from '../../constants';
import { useLocalizationContext } from '../../context/localizationContext';
import { formatISOStringToCalendarDateString } from '../../utility/date';

type DatePickerPropType = {
  title: string;
  mode: 'date' | 'time' | 'datetime';
  fieldLabel: JSX.Element;
  value: string;
  onValueChange(date: string): void;
  disabled?: boolean;
};

function DatePicker(props: DatePickerPropType) {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const { t } = useLocalizationContext();

  const { onValueChange, value, disabled, fieldLabel, mode } = props;
  const { container, innerContainer, buttonStyle, valueLabel, iconView, placeholderLabel } = styles;

  const toSalesforceTimeValue = (date: Date): string => {
    return `${date.toTimeString().split(' ')[0]}.000Z`;
  };

  const toDateValue = (value: string): Date => {
    if (value && mode === 'date') {
      return new Date(value);
    } else if (value && mode === 'time') {
      return new Date(`1990-01-01T${value}`);
    }
    return undefined;
  };

  const displayValue = (value: string): string => {
    if (value && mode === 'date') {
      return formatISOStringToCalendarDateString(value);
    } else if (value && mode === 'time') {
      return value.substring(0, 5);
    }
    return t('SELECT');
  };

  return (
    <View style={container}>
      {fieldLabel}
      <View style={innerContainer}>
        <TouchableOpacity
          style={buttonStyle}
          disabled={disabled}
          onPress={() => {
            setIsDatePickerVisible(true);
          }}
        >
          <Text style={value ? valueLabel : placeholderLabel}>{displayValue(value)}</Text>
          <View style={iconView}>
            <Icon
              name={mode === 'time' ? 'clockcircleo' : 'calendar'}
              size={18}
              color={APP_THEME.APP_BASE_FONT_COLOR}
              type="antdesign"
            />
          </View>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        confirmTextIOS={t('CONFIRM')}
        cancelTextIOS={t('CANCEL')}
        // headerTextIOS={title}
        date={toDateValue(value)}
        mode={mode}
        isVisible={isDatePickerVisible}
        onConfirm={date => {
          if (mode !== 'time') {
            onValueChange(date.toISOString());
          } else {
            onValueChange(toSalesforceTimeValue(date));
          }
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  innerContainer: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    alignItems: 'center',
    paddingLeft: 10,
    width: '100%',
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
    color: APP_THEME.APP_DARK_FONT_COLOR,
  },
  iconView: {
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

export { DatePicker };
