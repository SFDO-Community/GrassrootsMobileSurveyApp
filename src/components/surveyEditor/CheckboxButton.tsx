import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { APP_THEME } from '../../constants';

type CheckboxButtonPropType = {
  title: JSX.Element;
  onPress(): void;
  selected: boolean;
  disabled?: boolean;
};

/**
 * Checkbox form input component for survey
 */
function CheckboxButton(props: CheckboxButtonPropType) {
  const { title, onPress, selected, disabled } = props;

  return (
    <TouchableOpacity style={styles.containerStyle} disabled={disabled} onPress={onPress}>
      <Icon
        name={selected ? 'check-box' : 'check-box-outline-blank'}
        size={30}
        color={APP_THEME.APP_BASE_COLOR}
        type="material"
      />
      <View style={{ marginBottom: -5 }}>{title}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { CheckboxButton };
