import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getActiveToken } from '../../utils/auth';

const VideoCallPanel = ({ appointmentId, onCallEnd, userType = 'patient' }) => {
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Initialize Agora client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setClient(agoraClient);

        // Set up event listeners
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-unpublished', handleUserUnpublished);
        agoraClient.on('user-left', handleUserLeft);
        agoraClient.on('connection-state-changed', handleConnectionStateChanged);

        // Join the video call
        await joinCall(agoraClient);

      } catch (err) {
        console.error(' Failed to initialize video call:', err);
        setError('Failed to initialize video call. Please check your connection.');
        setCallStatus('failed');
      }
    };

    if (appointmentId) {
      initializeClient();
    }

    return () => {
      leaveCall();
    };
  }, [appointmentId]);

  // Duration timer
  useEffect(() => {
    if (callStatus === 'active') {
      callStartTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus]);

  const joinCall = async (agoraClient) => {
    try {
      setCallStatus('connecting');

      // Get token from backend
      const response = await fetch('/api/video/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getActiveToken()}`
        },
        body: JSON.stringify({
          appointmentId,
          channelName: `appointment_${appointmentId}`,
          role: userType === 'doctor' ? 'host' : 'audience'
        })
      });

      const { token, channelName, appId, callId } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to get video call token');
      }

      // Join channel
      await agoraClient.join(appId, channelName, token, null);

      // Create and publish local tracks
      const [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish tracks
      await agoraClient.publish([videoTrack, audioTrack]);

      setIsJoined(true);
      setCallStatus('waiting');

      // Notify backend about joining
      await fetch('/api/video/join-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getActiveToken()}`
        },
        body: JSON.stringify({
          callId,
          userType
        })
      });

    } catch (err) {
      console.error(' Failed to join call:', err);
      setError('Failed to join video call. Please try again.');
      setCallStatus('failed');
    }
  };

  const leaveCall = async () => {
    try {
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (client) {
        await client.leave();
      }

      setIsJoined(false);
      setCallStatus('ended');
      
      if (onCallEnd) {
        onCallEnd({
          duration: callDuration,
          endReason: 'completed'
        });
      }

    } catch (err) {
      console.error(' Error leaving call:', err);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    try {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => {
          const exists = prev.find(u => u.uid === user.uid);
          if (!exists) {
            return [...prev, user];
          }
          return prev;
        });

        // Play remote video
        if (remoteVideoRef.current && user.videoTrack) {
          user.videoTrack.play(remoteVideoRef.current);
        }

        setCallStatus('active');
      }

      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }

    } catch (err) {
      console.error(' Error handling user published:', err);
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    }
  };

  const handleUserLeft = (user) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    if (remoteUsers.length === 1) {
      setCallStatus('waiting');
    }
  };

  const handleConnectionStateChanged = (curState, revState, reason) => {
    console.log('Connection state changed:', curState, reason);
    if (curState === 'DISCONNECTED') {
      setCallStatus('disconnected');
    } else if (curState === 'CONNECTED') {
      setCallStatus('active');
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'active': return 'text-green-500';
      case 'waiting': return 'text-yellow-500';
      case 'connecting': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'active': return 'Connected';
      case 'waiting': return 'Waiting for other participant...';
      case 'connecting': return 'Connecting...';
      case 'failed': return 'Connection failed';
      case 'disconnected': return 'Disconnected';
      default: return 'Initializing...';
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Call Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-10">
        <div className="flex justify-between items-center">
          <div>
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            {callStatus === 'active' && (
              <div className="text-sm text-gray-300 mt-1">
                Duration: {formatDuration(callDuration)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">SmartVet Consultation</div>
            <div className="text-xs text-gray-400">Appointment #{appointmentId.slice(-8)}</div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote Video (Main) */}
        <div 
          ref={remoteVideoRef}
          className="w-full h-full bg-gray-900 flex items-center justify-center"
        >
          {remoteUsers.length === 0 && callStatus !== 'active' && (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <div className="text-lg font-medium">Waiting for {userType === 'doctor' ? 'patient' : 'doctor'} to join...</div>
              <div className="text-sm text-gray-300 mt-2">
                {userType === 'doctor' ? 'Patient' : 'Doctor'} will appear here once they join
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {isJoined && (
          <div className="absolute top-20 right-4 w-40 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <div 
              ref={localVideoRef}
              className="w-full h-full"
            >
              {!isVideoOn && (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-white text-2xl">📹</div>
                </div>
              )}
            </div>
            <div className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-50 px-1 rounded">
              You
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-6">
        <div className="flex justify-center space-x-4">
          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            disabled={!isJoined}
          >
            {isVideoOn ? '📹' : '📵'}
          </button>

          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioOn 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            disabled={!isJoined}
          >
            {isAudioOn ? '🎤' : '🔇'}
          </button>

          {/* End Call */}
          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            disabled={!isJoined}
          >
            📞
          </button>
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-white text-sm">
          <div>Participants: {remoteUsers.length + 1}</div>
          {callStatus === 'active' && (
            <div className="text-green-400">
              ✅ Call in progress - High quality connection
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallPanel;