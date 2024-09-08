<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
  <h3 class="section-title">Tremoro</h3>

  <div class="section">
    
    <div class="param" id="tremoroRate">
      <h5>{{ params.tremoroRate.name }}</h5>
      <input type="range" :min="minLogTremoroRate" :max="maxLogTremoroRate" :step="0.01"
        v-model="logTremoroRate" @input="tremoroRateChanged" />
      <div>{{ tremoroRate }} Hz</div>
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
      logTremoroRate: parameterDescriptor.parameters.tremoroRate.defaultValue === 0 ? 0 : Math.log(parameterDescriptor.parameters.tremoroRate.defaultValue),
      minLogTremoroRate: 0,  // Allow the LFO rate to be 0
      maxLogTremoroRate: Math.log(parameterDescriptor.parameters.tremoroRate.maxValue),
    };
  },
  methods: {
    tremoroRateChanged(event) {
      // Handle the case where logtremoroRate is 0
      let tremoroRate;
      if (this.logTremoroRate === 0) {
        tremoroRate = 0;
      } else {
        tremoroRate = Math.round(Math.exp(this.logTremoroRate) * 100) / 100;
      }

      if (this.tremoroRate !== tremoroRate) {
        this.tremoroRate = tremoroRate;
        const param = { id: this.params.tremoroRate.id, value: this.tremoroRate };
        this.$emit("parameterChanged", param);
      }
    },
  }
}
</script>

<style scoped></style>
