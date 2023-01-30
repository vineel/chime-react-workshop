import React from 'react';
import {
  useMeetingManager,
  PreviewVideo,
  useLocalVideo,
  VideoTileGrid,
  ContentShare,
  DeviceLabels,
  useToggleLocalMute,
  useLocalAudioOutput,
  useContentShareControls,
  useMeetingStatus
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

var url = window.location.href.split('?')[0];
var apiUrl = url + "meetingInfo"; // assumes meetingInfo is using the same API GW

//******** change this to point to the correct Api Gateway URL for testing **************************
// apiUrl = 'https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/Prod/meetingInfo';
apiUrl = 'https://xrgbvpxre0.execute-api.us-east-1.amazonaws.com/Prod/meetingInfo';
//******** change this to point to the correct Api Gateway URL for testing **************************
//******** IMPORTANT: comment out the apiURL line before deploying to production

console.log(apiUrl);

const MyApp = () => {
  const meetingManager = useMeetingManager();
  const { setIsVideoEnabled, isVideoEnabled, toggleVideo } = useLocalVideo();

  const queryString = window.location.search;
  console.log("QueryString:", queryString);
  const urlParams = new URLSearchParams(queryString);
  var user = urlParams.get('user');
  console.log("User...", user);

  async function getMeetingInfo(meetingId) {
    const url = apiUrl + "?m=" + meetingId;
    console.log("Fetching", url)
    const response = await fetch(url);
    return await response.json()
  }

  const joinMeeting = async () => {

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


  const MeetingView = () => (
    <div>
      <MeetingButtons />
      <div id='video'>
        <div
          className='gridVideo'
          style={{
            marginTop: '2rem',
            height: '20rem',
            width: '53rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <VideoTileGrid layout='standard' noRemoteVideoView='No remote video' />
        </div>
        <div
          className='previewVideo'
          style={{
            marginTop: '10rem',
            height: '10rem',
            width: '25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PreviewVideo />
        </div>
      </div>
    </div>
  );



  const MeetingButtons = () => {
    const { toggleContentShare } = useContentShareControls();
    const { muted, toggleMute } = useToggleLocalMute();
    const { isAudioOn, toggleAudio } = useLocalAudioOutput();
    const meetingStatus = useMeetingStatus();

    return (
      <div>
        <button id='join' onClick={joinMeeting}>
          Join Meeting
        </button>
        <button onClick={toggleVideo}>
          {isVideoEnabled ? 'Stop your video' : 'Start your video'}
        </button>
        <button onClick={toggleMute}>{muted ? 'Unmute mic' : 'Mute mic'}</button>
        <button onClick={toggleAudio}>
          {isAudioOn ? 'Speaker Off' : 'Speaker On'}
        </button>
        <button onClick={leaveMeeting}>Exit Meeting</button>
        <p>Meeting Status: {meetingStatus}</p>
        <p>
          {isVideoEnabled ? 'LocalVideo is enabled' : 'LocalVideo is disabled'}
        </p>
      </div>
    );
  };

  return MeetingView();
};

export default MyApp
