# Voice input

Install `@tacta/voice-input` with core; import `@tacta/voice-input/register`.

```html
<tacta-voice-input></tacta-voice-input>
```

Click the microphone to request recording. Interim text emits `dictation-preview`;
confirming emits `transcript`, and `dictation-active` reports recording state. Cancel
discards the interim result. `disabled` and `context` control availability and cleanup.
The selected core locale supplies the recognition language.

The component supports the browser's SpeechRecognition/webkitSpeechRecognition boundary
and an injectable recognition factory for testing or application integration. Import
speech-session types from `@tacta/voice-input/voice-input/speech-session`.
Unsupported browsers display a disabled control. Microphone access starts only with
user interaction and browser permission. Depending on the browser, speech processing
may use a remote service; Tacta does not supply an offline transcription backend.
Chat re-exports this component for compatibility.
