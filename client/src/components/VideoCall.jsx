/**
 * VideoCall — Jitsi Meet iframe.
 *
 * Agreed prop: <VideoCall roomId={roomId} />
 *
 * Uses the public Jitsi instance (meet.jit.si) so no API key is needed.
 * The roomId is used as the Jitsi meeting name so both users land in the
 * same call automatically when they join the same room.
 */
export default function VideoCall({ roomId }) {
  if (!roomId) return null;

  // Prefix with "codesync-" so the meeting name is unique to this app
  const meetingName = `codesync-${roomId}`;
  const src = `https://meet.jit.si/${meetingName}#config.startWithAudioMuted=true&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","hangup","chat","tileview"]`;

  return (
    <div style={styles.wrapper}>
      <iframe
        src={src}
        style={styles.iframe}
        allow="camera; microphone; fullscreen; display-capture"
        title="Video Call"
      />
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    height: '100%',
    minHeight: '260px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#12141f',
    border: '1px solid #2e3247',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
};
