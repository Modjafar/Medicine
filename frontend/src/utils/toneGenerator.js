/**
 * Tone Generator Service
 * Generates alarm sounds using Web Audio API
 * Useful for testing without audio files
 */

export const generateAlarmToneToBlob = async (duration = 2000) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const audioBuffer = audioContext.createBuffer(1, sampleRate * (duration / 1000), sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Generate square wave pattern for alarm sound
    const frequency = 900; // Hz - typical alarm frequency
    const samplesPerWave = sampleRate / frequency;

    for (let i = 0; i < audioBuffer.length; i++) {
        // Create pulse effect (on/off pattern)
        const wavePosition = (i % (samplesPerWave * 2)) / samplesPerWave;
        const isOn = wavePosition < 1;

        // Square wave generation
        channelData[i] = isOn ? 0.3 : -0.3;

        // Fade out at the end
        const progress = i / audioBuffer.length;
        if (progress > 0.9) {
            channelData[i] *= 1 - (progress - 0.9) / 0.1;
        }
    }

    // Create audio blob
    const offlineContext = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    // Convert to WAV blob
    const wavBlob = await bufferToWave(renderedBuffer);
    return URL.createObjectURL(wavBlob);
};

/**
 * Convert AudioBuffer to WAV blob
 */
const bufferToWave = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const channelData = [];

    for (let i = 0; i < numChannels; i++) {
        channelData.push(audioBuffer.getChannelData(i));
    }

    let offset = 0;
    let pos = 0;

    const setUint16 = (data, pos, intValue) => {
        data[pos] = intValue & 0xFF;
        data[pos + 1] = (intValue >> 8) & 0xFF;
    };

    const setUint32 = (data, pos, intValue) => {
        data[pos] = intValue & 0xFF;
        data[pos + 1] = (intValue >> 8) & 0xFF;
        data[pos + 2] = (intValue >> 16) & 0xFF;
        data[pos + 3] = (intValue >> 24) & 0xFF;
    };

    const interleave = (inputL, inputR) => {
        let index = 0;
        const buffer = new Float32Array(inputL.length + inputR.length);
        let inputIndex = 0;

        while (index < buffer.length) {
            buffer[index++] = inputL[inputIndex];
            buffer[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return buffer;
    };

    const floatTo16BitPCM = (output, offset, input) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const buffer = new ArrayBuffer(44 + audioBuffer.length * numChannels * bytesPerSample);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length - 8
    setUint32(view, 4, 36 + audioBuffer.length * numChannels * bytesPerSample);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    setUint32(view, 16, 16);
    // sample format (raw)
    setUint16(view, 20, format);
    // channel count
    setUint16(view, 22, numChannels);
    // sample rate
    setUint32(view, 24, sampleRate);
    // avg. byte rate
    setUint32(view, 28, sampleRate * numChannels * bytesPerSample);
    // block-align
    setUint16(view, 32, numChannels * bytesPerSample);
    // 16-bit mono
    setUint16(view, 34, bitDepth);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    setUint32(view, 40, audioBuffer.length * numChannels * bytesPerSample);

    let index = 0;
    const volume = 0.8;
    while (index < audioBuffer.length) {
        for (let i = 0; i < numChannels; i++) {
            const sample = channelData[i][index];
            let s16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(44 + index * 2, s16 * volume, true);
        }
        index++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
};

export default {
    generateAlarmToneToBlob,
};
