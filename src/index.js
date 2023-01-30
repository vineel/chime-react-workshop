import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import MyApp from './App';
import { ThemeProvider } from 'styled-components';
import {
  isVideoTransformDevice,
  VideoInputDevice,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';

import {
  MeetingProvider,
  VideoTileGrid,
  PreviewVideo,
  lightTheme,
  useMeetingManager,
  useVideoInputs,
  useBackgroundBlur,
  BackgroundBlurProvider,
  useLocalVideo,
  DeviceLabels,
}
  from 'amazon-chime-sdk-component-library-react';

const apiUrl = 'https://xrgbvpxre0.execute-api.us-east-1.amazonaws.com/Prod/meetingInfo';

async function getMeetingInfo(meetingId) {
  const url = apiUrl + "?m=" + meetingId;
  console.log("Fetching", url)
  const response = await fetch(url);
  return await response.json()
}

const joinMeeting = async (meetingManager) => {
  // Fetch the meeting and attendee data
  const data = await getMeetingInfo("testMeeting");
  console.log("Data:", data);

  const meetingSessionConfiguration = new MeetingSessionConfiguration(
    data.Meeting,
    data.Attendee
  );
  const options = {
    deviceLabels: DeviceLabels.AudioAndVideo,
  };

  // Use the join API to create a meeting session
  await meetingManager.join(meetingSessionConfiguration);
  console.log("Created meeting session:", data.Meeting, "for:  ", data.Attendee);

  // At this point you can let users setup their devices, or start the session immediately
  await meetingManager.start();
  meetingManager.invokeDeviceProvider(DeviceLabels.AudioAndVideo);
  console.log("Meeting started");
};

const leaveMeeting = async () => {
  await meetingManager.leave();
}

const MyBlurryApp = () => {
  const meetingManager = useMeetingManager();
  const { setIsVideoEnabled, isVideoEnabled, toggleVideo } = useLocalVideo();
  const { selectedDevice } = useVideoInputs();
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } = useBackgroundBlur();
  const [isVideoTransformCheckBoxOn, setisVideoTransformCheckBoxOn] = useState(false);

  useEffect(async function toggleBgBlur() {
    let currentDevice = selectedDevice;
    if (isVideoTransformCheckBoxOn) {
      currentDevice = await createBackgroundBlurDevice(selectedDevice);
    } else {
      currentDevice = await selectedDevice.intrinsicDevice();
    }
    await meetingManager.startVideoInputDevice(currentDevice);
  }, [isVideoTransformCheckBoxOn]);

  // join a meeting from the query string
  const queryString = window.location.search;
  console.log("QueryString:", queryString);
  const urlParams = new URLSearchParams(queryString);
  var user = urlParams.get('user');
  console.log("User...", user);

  const onBackgroundBlurClick = () => {
    setisVideoTransformCheckBoxOn((current) => !current);
  };

  const appContent = (
    <div>
      {isBackgroundBlurSupported && (
        <div>
          <button id='join' onClick={() => {joinMeeting(meetingManager)}}>
            Join Meeting
          </button>
          <button onClick={onBackgroundBlurClick}>
            {isVideoTransformDevice(selectedDevice)
              ? 'Background Blur Enabled'
              : 'Enable Background Blur'}
          </button>
          <button onClick={toggleVideo}>
          {isVideoEnabled ? 'Stop your video' : 'Start your video'}
        </button>
        </div>
      )}
      <hr></hr>
      Preview Video
      <div className="previewVideo">
      <PreviewVideo />
      </div> 
      <hr></hr>
      <div className="videoTileGrid">
        VideoTileGrid
        <VideoTileGrid layout='standard' noRemoteVideoView='No remote video, please join a meeting from another browser' />
      </div>
    </div>
  );
  return appContent;
};

const Root = () => (
  <ThemeProvider theme={lightTheme}>
    <BackgroundBlurProvider>
      <MeetingProvider>
        <MyBlurryApp />
      </MeetingProvider>
    </BackgroundBlurProvider>
  </ThemeProvider>
);

window.addEventListener('load', () => {
  ReactDOM.render(Root(), document.getElementById('root'));
});
