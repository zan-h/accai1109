import { useRef, useState } from "react";
import { convertWebMBlobToWav } from "../lib/audioUtils";

function useAudioDownload() {
  // Ref to store the MediaRecorder instance.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Ref to collect all recorded Blob chunks.
  const recordedChunksRef = useRef<Blob[]>([]);
  // Track resources so we can tear them down cleanly.
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const resetChunks = () => {
    recordedChunksRef.current = [];
  };

  const teardownMediaStreams = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn("Failed to stop microphone track", err);
        }
      });
    }
    micStreamRef.current = null;
  };

  const teardownAudioContext = async () => {
    const ctx = audioContextRef.current;
    if (ctx) {
      try {
        await ctx.close();
      } catch (err) {
        console.warn("Failed to close audio context", err);
      }
    }
    audioContextRef.current = null;
  };

  /**
   * Starts recording by combining the provided remote stream with
   * the microphone audio.
   * @param remoteStream - The remote MediaStream (e.g., from the audio element).
   */
  const startRecording = async (remoteStream: MediaStream) => {
    if (isRecording || mediaRecorderRef.current) {
      return;
    }

    resetChunks();
    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Error getting microphone stream:", err);
      // Fallback to an empty MediaStream if microphone access fails.
      micStream = new MediaStream();
    }

    // Create an AudioContext to merge the streams.
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const destination = audioContext.createMediaStreamDestination();

    // Connect the remote audio stream.
    try {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      remoteSource.connect(destination);
    } catch (err) {
      console.error("Error connecting remote stream to the audio context:", err);
    }

    // Connect the microphone audio stream.
    try {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    } catch (err) {
      console.error("Error connecting microphone stream to the audio context:", err);
    }

    const options = { mimeType: "audio/webm" };
    try {
      const mediaRecorder = new MediaRecorder(destination.stream, options);
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        teardownMediaStreams();
        teardownAudioContext().catch((error) => {
          console.warn("Audio context cleanup failed", error);
        });
      };
      // Start recording without a timeslice.
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      micStreamRef.current = micStream;
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting MediaRecorder with combined stream:", err);
      // If we failed to start, make sure we clean up the resources we created.
      teardownMediaStreams();
      await teardownAudioContext();
    }
  };

  /**
   * Stops the MediaRecorder, if active.
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // Request any final data before stopping.
      mediaRecorderRef.current.requestData();
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping MediaRecorder:", err);
      }
      mediaRecorderRef.current = null;
    }
    if (isRecording) {
      setIsRecording(false);
    }
  };

  /**
   * Initiates download of the recording after converting from WebM to WAV.
   * If the recorder is still active, we request its latest data before downloading.
   */
  const downloadRecording = async () => {
    // If recording is still active, request the latest chunk.
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      // Request the current data.
      mediaRecorderRef.current.requestData();
      // Allow a short delay for ondataavailable to fire.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (recordedChunksRef.current.length === 0) {
      console.warn("No recorded chunks found to download.");
      return;
    }
    
    // Combine the recorded chunks into a single WebM blob.
    const webmBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

    try {
      // Convert the WebM blob into a WAV blob.
      const wavBlob = await convertWebMBlobToWav(webmBlob);
      const url = URL.createObjectURL(wavBlob);

      // Generate a formatted datetime string (replace characters not allowed in filenames).
      const now = new Date().toISOString().replace(/[:.]/g, "-");

      // Create an invisible anchor element and trigger the download.
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `realtime_agents_audio_${now}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the blob URL after a short delay.
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Error converting recording to WAV:", err);
    } finally {
      resetChunks();
    }
  };

  return {
    startRecording,
    stopRecording,
    downloadRecording,
    isRecording,
  };
}

export default useAudioDownload;
