import parameterDescriptor from "./src/parameterDescriptor"

class SynthesizerWorklet extends AudioWorkletProcessor {
    constructor(options) {
        // The super constructor call is required.
        super();

        this.sampleRate = parseFloat(options.processorOptions.sampleRate);
        this.interpolation = 9.99e-1; /* [0, 1) */

        this.desc = parameterDescriptor;
        this.params = this.desc.parameters;

        /* Oscillator */
        this.oscType = this.params.oscType.defaultValue;
        this.frequency = parseFloat(this.params.frequency.defaultValue) / this.sampleRate;
        this.iFrequency = this.frequency; /* Interpolated Frequency */
        this.phase = 0.0;

        /* Filter */
        this.filterType = this.params.filterType.defaultValue;
        this.cutoff = parseFloat(this.params.cutoff.defaultValue) / this.sampleRate;
        this.iCutoff = this.cutoff; /* Interpolated Cutoff */
        this.resonance = parseFloat(this.params.resonance.defaultValue);
        this.iResonance = this.resonance; /* Interpolated Resonance */
        this.update = 0;

        this.filterZ1 = 0.0;
        this.filterZ2 = 0.0;

        this.updateFilterCoefficients();

        /* Amp */
        this.noteOn = false;
        this.volume = this.convertVolume(parseFloat(this.params.volume.defaultValue));
        this.iVolume = this.volume; /* Interpolated Volume */

        /* Delay */
        this.delayTime = 0;  // デフォルトのディレイタイム（秒）
        this.feedback = 0;   // デフォルトのフィードバック量　１のときに100％
        this.delayMix = 0;   // １のときにディレイ音しか聞こえない
        
        /* Distortion */
        this.distortion = this.params.distortion.defaultValue;
        
        /* Tremoro */
        this.tremoroRate = 0; // LFOの周波数 
        this.tremoroPhase = 0;     // LFOの位相
        this.sampleRate = sampleRate; // オーディオコンテキストのサンプルレート

        /* Vibrato */
        this.vibratoRate = 0;
        this.vibratoDepth = 0;
        this.vibratoPhase = 0;


        this.port.onmessage = (event) => {
            const data = event.data;
            if (data.type == "noteOn") {
                this.noteOn = data.value;
            }
            else if (data.type == "param") {
                this.setParameter(data.value);
            }
        };
    }
    process(inputs, outputs, parameters) {
        let output = outputs[0][0];
        this.processOscillator(output);
        this.processDistortion(output);
        this.processTremoro(output);
        this.processVibrato(output);
        this.processDelay(output);
        this.processFilter(output);
        this.processAmp(output);
        return true;
    }
    processVibrato(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            const vibratoLFO = Math.sin(2 * Math.PI * this.vibratoRate * this.vibratoPhase / this.sampleRate);
            const pitchModulation = 1.0 + this.vibratoDepth * vibratoLFO;
            this.iFrequency = this.frequency * pitchModulation;
            buffer[i] = buffer[i] * pitchModulation;
            this.vibratoPhase += 1;
            if (this.vibratoPhase >= this.sampleRate / this.vibratoRate) {
                this.vibratoPhase = 0;
            }
        }
    }
    processDelay(buffer) {
        // 初回実行時にディレイバッファを作成
        if (!this.delayBuffer) {
            this.delayBuffer = new Float32Array(this.sampleRate * 5); // 5秒分のディレイバッファ
            this.delayBufferIndex = 0; // バッファのインデックスを初期化
        }
    
        for (let i = 0; i < buffer.length; i++) {
            // 現在のバッファ位置に対応するディレイバッファの位置を計算
            const delaySamples = Math.floor(this.delayTime * this.sampleRate);
            const delayIndex = (this.delayBufferIndex - delaySamples + this.delayBuffer.length) % this.delayBuffer.length;
    
            // ディレイされた信号と現在の信号をミックス
            const delayedSample = this.delayBuffer[delayIndex];
            const wetSignal = delayedSample * this.feedback;
            const drySignal = buffer[i];
    
            // 最終出力を計算
            buffer[i] = (drySignal * (1 - this.delayMix)) + (wetSignal * this.delayMix);
    
            // ディレイバッファを更新
            this.delayBuffer[this.delayBufferIndex] = drySignal + wetSignal;
    
            // インデックスを次に進める
            this.delayBufferIndex = (this.delayBufferIndex + 1) % this.delayBuffer.length;
        }
    }
    
    processTremoro(buffer){
        for (let i = 0; i < buffer.length; i++) {
            const tremoroValue = Math.sin(2 * Math.PI * this.tremoroRate * this.tremoroPhase / this.sampleRate);
            buffer[i] = buffer[i] * (0.5 * (tremoroValue + 1));  
            this.tremoroPhase += 1;
            if (this.tremoroPhase >= this.sampleRate / this.tremoroRate) {
                this.tremoroPhase = 0;
            }
        }
    }
    
    processDistortion(buffer){
        for(let i = 0; i < buffer.length; ++i){
            if(Math.abs(buffer[i]) > this.distortion){
                if(buffer[i] > 0){
                    buffer[i] = this.distortion;
                    buffer[i] /= this.distortion;
                }else{
                    buffer[i] = -this.distortion;
                    buffer[i] /= this.distortion;
                }
            }
        }
    }
    processOscillator(buffer) {
        switch (this.oscType) {
            case this.desc.oscTypes.polyblep.index:
                this.generateSawtooth(buffer);
                
                break;
            case this.desc.oscTypes.sawtooth.index:
                
                this.generateSawtooth(buffer);
                break;
            case this.desc.oscTypes.square.index:
                
                this.generateSawtooth(buffer);
                for (let i = 0; i < buffer.length; ++i){
                    if(buffer[i] < 0){
                        buffer[i] = -1;
                    }else{
                        buffer[i] = 1;
                    }
                }
                break;
            case this.desc.oscTypes.sine.index:
                this.generateSawtooth(buffer);
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = Math.cos(Math.PI * buffer[i]);
                }
                break;
            case this.desc.oscTypes.triangle.index:
                
                this.generateSawtooth(buffer);
                for (let i = 0; i < buffer.length; ++i) {
                    if(buffer[i] < 0){
                        buffer[i] *= -1;
                    }
                    buffer[i] = buffer[i] * 2 - 1;
                }
                break;
            case this.desc.oscTypes.pseudo_sine.index:
                
                this.generateSawtooth(buffer);
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = buffer[i] * 4 * (Math.abs(buffer[i]) - 1);
                }
                break;
            default:
                console.log("Invalid Oscillator Type!");
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = 0.0;
                }
                break;
        }
    }
    processFilter(buffer) {
        let input;
        for (let i = 0; i < buffer.length; ++i) {
            input = buffer[i];
            buffer[i] = this.filterZ1 + this.filterB0 * input;
            this.filterZ1 = this.filterZ2 + this.filterB1 * input + this.filterA1 * buffer[i];
            this.filterZ2 = this.filterB2 * input + this.filterA2 * buffer[i];
            if (++this.update > 16) {
                this.update = 0;
                this.iCutoff += (this.cutoff - this.iCutoff) * 1.0e-2;
                this.iResonance += (this.resonance - this.iResonance) * 1.0e-2;
                this.updateFilterCoefficients();
            }
        }
    }
    processAmp(buffer) {
        
        if (this.noteOn) {
            for (let i = 0; i < buffer.length; ++i) {
                this.iVolume += (this.volume - this.iVolume) * (1.0 - this.interpolation);
                buffer[i] *= this.iVolume;
            }
        }
        else {
            for (let i = 0; i < buffer.length; ++i) {
                this.iVolume = this.volume;
                buffer[i] = 0.0;
            }
        }
    }
    generateSawtooth(buffer) {
        let frequency = this.iFrequency;
        let phase = this.phase;
        for (let i = 0; i < buffer.length; ++i) {
            frequency += (this.frequency - frequency) * (1.0 - this.interpolation);
            phase += frequency;
            if (phase >= 1.0) {
                phase -= Math.floor(phase);
            }
            buffer[i] = 2.0 * phase - 1.0;
        }
        this.iFrequency = frequency;
        this.phase = phase;
    }
    updateFilterCoefficients() {
        const w = 2.0 * Math.PI * this.iCutoff;
        const c = Math.cos(w);
        const s = Math.sin(w) / this.iResonance;
        const a0 = s + 2.0;
        switch (this.filterType) {
            case this.desc.filterTypes.bypass.index:
                this.filterB0 = 1.0;
                this.filterB1 = 0.0;
                this.filterB2 = 0.0;
                this.filterA1 = 0.0;
                this.filterA2 = 0.0;
                break;
            case this.desc.filterTypes.lowpass.index:
                this.filterB0 = (1.0 - c) / a0;
                this.filterB1 = this.filterB0 * 2.0;
                this.filterB2 = this.filterB0;
                this.filterA1 = 4.0 * c / a0;
                this.filterA2 = (s - 2.0) / a0;
                break;
            case this.desc.filterTypes.highpass.index:
                this.filterB0 = (1.0 + c) / a0;
                this.filterB1 = this.filterB0 * -2.0
                this.filterB2 = this.filterB0;
                this.filterA1 = 4.0 * c / a0;
                this.filterA2 = (s - 2.0) / a0;
                break;
            case this.desc.filterTypes.bandpass.index:
                this.filterB0 = s / a0;
                this.filterB1 = 0;
                this.filterB2 = this.filterB0 * -1.0;
                this.filterA1 = 4.0 * c / a0;
                this.filterA2 = (s - 2.0) / a0;
                break;
            case this.desc.filterTypes.bandstop.index:
                this.filterB0 = 2.0 / a0;
                this.filterB1 = -4.0 * c / a0;
                this.filterB2 = this.filterB0;
                this.filterA1 = 4.0 * c / a0;
                this.filterA2 = (s - 2.0) / a0;
                break;
            default:
                console.log("Invalid Filter Type!");
                this.filterB0 = 0.0;
                this.filterB1 = 0.0;
                this.filterB2 = 0.0;
                this.filterA1 = 0.0;
                this.filterA2 = 0.0;
                break;
        }
    }
    
    
    setParameter(parameter) {
        switch (parameter.id) {
            case this.params.oscType.id:
                this.oscType = parameter.value;
                break;
            case this.params.frequency.id:
                this.frequency = parseFloat(parameter.value) / this.sampleRate;
                break;
            case this.params.filterType.id:
                this.filterType = parameter.value;
                this.iCutoff = this.cutoff;
                this.iResonance = this.resonance;
                this.filterZ1 = 0.0;
                this.filterZ2 = 0.0;
                break;
            case this.params.cutoff.id:
                this.cutoff = parseFloat(parameter.value) / this.sampleRate;
                break;
            case this.params.resonance.id:
                this.resonance = parseFloat(parameter.value);
                break;
            case this.params.volume.id:
                this.volume = this.convertVolume(parseFloat(parameter.value));
                break;
            case this.params.delayTime.id:
                this.delayTime = parseFloat(parameter.value);
                break;
            case this.params.feedback.id:
                this.feedback = parseFloat(parameter.value);
                break;
            case this.params.delayMix.id:
                this.delayMix = parseFloat(parameter.value);
                break;
            case this.params.distortion.id:
                this.distortion = parseFloat(parameter.value);
                break;
            case this.params.tremoroRate.id:
                this.tremoroRate = parseFloat(parameter.value);
                break;
            case this.params.vibratoRate.id:
                this.vibratoRate = parseFloat(parameter.value);
                break;
            case this.params.vibratoDepth.id:
                this.vibratoDepth = parseFloat(parameter.value);
                break;
            default:
                break;
        }
    }
    convertVolume(volume) {
        return volume > 0.0 ? 10.0 ** ((volume - 1.0) * 2.5) : 0.0;
    }
}
registerProcessor('synthesizer-worklet', SynthesizerWorklet);