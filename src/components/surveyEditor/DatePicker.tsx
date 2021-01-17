import React, { useState, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { APP_THEME, APP_FONTS } from '../../constants';
import LocalizationContext from '../../context/localizationContext';
import { formatISOStringToCalendarDateString } from '../../utility/date';

type DatePickerPropType = {
  title: string;
  value: string;
  onValueChange(date: string): void;
  disabled?: boolean;
};

function DatePicker(props: DatePickerPropType) {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const { t } = useContext(LocalizationContext);

  const { onValueChange, title, value, disabled } = props;
  const { container, titleLabel, innerContainer, buttonStyle, valueLabel, iconView, placeholderLabel } = styles;

  return (
    <View style={container}>
      <Text style={titleLabel}>{title}</Text>
      <View style={innerContainer}>
        <TouchableOpacity
          style={buttonStyle}
          disabled={disabled}
          onPress={() => {
            setIsDatePickerVisible(true);
          }}
        >
          <Text style={value ? valueLabel : placeholderLabel}>
            {value ? formatISOStringToCalendarDateString(value) : t('SELECT')}
          </Text>
          <View style={iconView}>
            <Icon name="calendar" size={18} color={APP_THEME.APP_BASE_FONT_COLOR} type="antdesign" />
          </View>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        confirmTextIOS={t('CONFIRM')}
        cancelTextIOS={t('CANCEL')}
        headerTextIOS={title}
        date={value ? new Date(value) : undefined}
        isVisible={isDatePickerVisible}
        onConfirm={date => {
          onValueChange(date.toISOString());
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  titleLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
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
