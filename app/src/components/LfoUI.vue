<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
  <h3 class="section-title">Tremoro</h3>

  <div class="section">
    
    <div class="param" id="tremoroRate">
      <h5>{{ params.tremoroRate.name }}</h5>
      <input type="range" :min="minLogTremoroRate" :max="maxLogTremoroRate" :step="(maxLogTremoroRate - minLogTremoroRate) / 500" 
        v-model="logTremoroRate" @input="tremoroRateChanged" />
      <div>{{ tremoroRate.toFixed(3) }} Hz</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TremoroUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,
      
      tremoroRate: parameterDescriptor.parameters.tremoroRate.defaultValue,

      // for log scale slider (tremoroRate)
      logTremoroRate: Math.log(parameterDescriptor.parameters.tremoroRate.defaultValue),
      minLogTremoroRate: Math.log(0.001),  // Avoid log(0) and allow 0 in linear scale
      maxLogTremoroRate: Math.log(parameterDescriptor.parameters.tremoroRate.maxValue),
    };
  },
  methods: {
    tremoroRateChanged(event) {
      // Handle the case where logTremoroRate is close to 0
      let tremoroRate = Math.exp(this.logTremoroRate);

      if (tremoroRate < 0.01) tremoroRate = 0; // Set a threshold to treat small values as 0

      if (this.tremoroRate != tremoroRate) {
        this.tremoroRate = tremoroRate;
        const param = { id: this.params.tremoroRate.id, value: this.tremoroRate };
        this.$emit("parameterChanged", param);
      }
    },
  }
}
</script>

<style scoped></style>
