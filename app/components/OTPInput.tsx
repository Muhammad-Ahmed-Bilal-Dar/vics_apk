import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 6, disabled = false }) => {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, idx: number) => {
    if (/^[0-9]?$/.test(text)) {
      let newValue = value.split('');
      newValue[idx] = text;
      let joined = newValue.join('').slice(0, length);
      onChange(joined);
      if (text && idx < length - 1) {
        inputs.current[idx + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={ref => { inputs.current[idx] = ref; }}
          style={[
            styles.input,
            value[idx] ? styles.filled : null,
            inputs.current[idx]?.isFocused?.() ? styles.focused : null,
          ]}
          value={value[idx] || ''}
          onChangeText={text => handleChange(text, idx)}
          onKeyPress={e => handleKeyPress(e, idx)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          textAlign="center"
          autoFocus={idx === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 5,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 32,
    color: '#050505',
    backgroundColor: '#fff',
    marginHorizontal: 2,
    textAlign: 'center',
  },
  focused: {
    borderColor: '#2196f3',
    shadowColor: '#2196f3',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filled: {
    borderColor: '#2196f3',
  },
});

export default OTPInput; 