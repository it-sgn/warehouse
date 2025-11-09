<script setup>
// Hapus impor RouterLink karena tidak digunakan di template ini.
import { onMounted, watch, ref, computed } from 'vue';
import { RouterView } from 'vue-router' // Simpan RouterView
import { useKeycloak } from '@josempgon/vue-keycloak';

const {
 keycloak, // The Keycloak instance
 isAuthenticated, // Reactive boolean for auth status
 username, // Reactive string for username
 // Hapus 'token' jika tidak digunakan langsung di script ini
} = useKeycloak();
// const uppercaseUsername = computed(() => {
//     // Memastikan username.value ada sebelum memanggil toUpperCase()
//     return username.value ? username.value.toUpperCase() : '';
// });
const toCamelCase = (str) => {
  if (!str) return '';
  return str.split(/[\s_-]+/) // Pisahkan berdasarkan spasi, underscore, atau tanda hubung
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Computed property untuk menampilkan username dalam format CamelCase
const camelCaseUsername = computed(() => {
    // Anda mungkin hanya ingin mengkapitalisasi huruf pertama jika username hanya satu kata.
    // Atau, jika username Anda berisi underscore/tanda hubung, gunakan toCamelCase.
    
    const uname = username.value;
    if (!uname) return '';
    
    // Pilihan 1: Hanya kapitalisasi huruf pertama (biasanya cukup untuk username tunggal)
    return uname.charAt(0).toUpperCase() + uname.slice(1);
    
    // Pilihan 2: Jika username bisa berupa "john-doe" dan ingin menjadi "JohnDoe"
    // return toCamelCase(uname); 
});


// Definisikan fungsi logout
const logout = () => {
 // Keycloak logout akan mengarahkan pengguna ke halaman login/landing Keycloak secara default.
 keycloak.value.logout();
};

</script>

<template>
 <v-app>
    <v-app-bar color="primary" dark elevate-on-scroll>
      <v-toolbar-title>PG GLENMORE</v-toolbar-title>
      <v-spacer></v-spacer>

   <template v-if="isAuthenticated">
<v-chip color="success" class="mr-3" density="comfortable" label>
  <v-icon start icon="mdi-check-decagram"></v-icon>
  <!-- Username: <strong> {{ camelCaseUsername }} </strong> -->
  <strong class="text-white">{{ camelCaseUsername }}</strong>
</v-chip>

<v-btn color="white" variant="flat" @click="logout">
  LOGOUT
</v-btn>
   </template>

  </v-app-bar>

  <v-main>
   <router-view />
  </v-main>
 </v-app>
</template>