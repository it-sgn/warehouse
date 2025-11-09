<template>
  <v-card>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #no-data>
          <v-alert type="info" title="Info">
            Data Barang Tidak Sesuai
          </v-alert>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: 'Kode Barang', key: 'kodeBarang' },
  { title: 'Nama Barang', key: 'namaBarang' },
  { title: 'Qty', key: 'qty' }
])

</script>