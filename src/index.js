import React from 'react';
import ReactDOM from 'react-dom';
import MyApp from './App';
import { ThemeProvider } from 'styled-components';
import {
  MeetingProvider,
  lightTheme,
}
from 'amazon-chime-sdk-component-library-react';

const Root = () => (
  <ThemeProvider theme={lightTheme}>
    <MeetingProvider>
      <MyApp />
    </MeetingProvider>
  </ThemeProvider>
);

window.addEventListener('load', () => {
  ReactDOM.render(Root(), document.getElementById('root'));
});
