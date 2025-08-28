import { StyleSheet } from 'react-native';
import { Colors } from './theme';

// Shared input theme for all auth screens
export const inputTheme = {
  colors: {
    text: '#050505',
    placeholder: Colors.light.text.tertiary,
    onSurface: '#050505',
    primary: Colors.primary.main,
    error: Colors.status.error.main,
  }
};

// Shared styles for auth screens
export const authStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  gradientContainer: {
    borderRadius: 15,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: Colors.primary.main,
    borderRadius: 30,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#FFFFFF',
  },
  link: {
    marginLeft: 4,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timerText: {
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
}); 

// Default export
export default {
  inputTheme,
  authStyles
}; 