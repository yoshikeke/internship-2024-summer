<script setup>
import parameterDescriptor from "../parameterDescriptor.js";
</script>

<template>
    <div class="section">
        <div class="param" id="delayTime">
            <h5>{{ params.delayTime.name }}</h5>
            <input
                type="range"
                :min="params.delayTime.minValue"
                :max="params.delayTime.maxValue"
                step="0.01"
                v-model="delayTime"
            >
            <h5>{{ delayTime }}</h5>
        </div>
        <div class="param" id="feedback">
            <h5>{{ params.feedback.name }}</h5>
            <input
                type="range"
                :min="params.feedback.minValue"
                :max="params.feedback.maxValue"
                step="0.01"
                v-model="feedback"
            >
            <h5>{{ feedback }}</h5>
        </div>
        <div class="param" id="delayMix">
            <h5>{{ params.delayMix.name }}</h5>
            <input
                type="range"
                :min="params.delayMix.minValue"
                :max="params.delayMix.maxValue"
                step="0.01"
                v-model="delayMix"
            >
            <h5>{{ delayMix }}</h5>
        </div>
    </div>
</template>

<script>
export default {
    name: "DelayUI",
    data() {
        return {
          params: parameterDescriptor.parameters,
          delayTime: parameterDescriptor.parameters.delayTime.defaultValue,  
          feedback: parameterDescriptor.parameters.feedback.defaultValue, 
          delayMix: parameterDescriptor.parameters.delayMix.defaultValue,  

        };
    },
    methods: {
        // 必要なメソッドをここに追加
    }
};
</script>
