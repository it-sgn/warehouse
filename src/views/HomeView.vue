<template>    
  <v-container
    fluid
    class="pa-0 fill-height"
    style="max-width: 90vw; margin: 0 auto;"
  >
    <!-- Search & Actions -->
    <v-card flat tile class="pa-4 mb-4">
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            label="Cari Nama Barang"
            prepend-icon="mdi-magnify"
            clearable
            outlined
            density="compact"
          />
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-end flex-wrap">
          <v-btn color="primary" class="mr-2 mb-2" @click="onSearch" density="comfortable">
            <v-icon left>mdi-magnify</v-icon> Cari
          </v-btn>

          <v-btn color="grey" class="mr-2 mb-2" @click="reset" density="comfortable">
            <v-icon left>mdi-refresh</v-icon> Reset
          </v-btn>

          <v-btn
            v-if="isAdmin"
            color="success"
            class="mb-2"
            density="comfortable"
            @click="showUploadDialog = true"
          >
            <v-icon left>mdi-file-excel</v-icon> Import Excel
          </v-btn>
        </v-col>

        <v-col cols="12" md="2" class="text-right text-subtitle-1 mt-2 mt-md-0">
          Total: <strong>{{ totalQty }}</strong>
        </v-col>
      </v-row>
    </v-card>              
<!-- upload -->
<v-dialog v-model="showUploadDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="headline d-flex justify-space-between align-center">
          Import Data Barang dari Excel
          <v-btn icon @click="closeUploadDialog" variant="text" size="small">
              <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="barangStore.uploadError"
            type="error"
            class="mb-4"
            density="compact"
            border="start"
          >
            {{ barangStore.uploadError }}
          </v-alert>

          <v-alert
            v-if="barangStore.uploadSuccess"
            type="success"
            class="mb-4"
            density="compact"
            border="start"
          >
            Data barang berhasil diimport!
          </v-alert>

          <p class="mb-4">Pilih file **.xlsx** atau **.csv** untuk diunggah.</p>
          <v-file-input
            v-model="selectedFile"
            label="Pilih File Excel"
            accept=".xlsx,.csv"
            prepend-icon="mdi-paperclip"
            outlined
            density="compact"
            show-size
            :rules="[v => !!v || 'File harus dipilih']"
            @update:model-value="barangStore.clearError()"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closeUploadDialog"
            :disabled="barangStore.uploadLoading"
          >
            Tutup
          </v-btn>
          <v-btn
            color="success"
            @click="handleUpload"
            :disabled="!selectedFile || barangStore.uploadLoading" 
            :loading="barangStore.uploadLoading"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Daftar Barang -->
    <v-card
      v-if="isAuthenticated"
      class="w-100 elevation-3 pa-2"
      flat
    >
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
        <span>📦 Daftar Barang</span>
        <v-progress-circular
          v-if="barangStore.loading"
          indeterminate
          color="primary"
          size="20"
        />
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="barangStore.error"
          type="error"
          border="start"
          variant="tonal"
          class="mb-4"
        >
          {{ barangStore.error }}
        </v-alert>

        <v-data-table-server
  v-model:items-per-page="barangStore.itemsPerPage"
  :items="barangStore.listBarang"
  :items-length="barangStore.totalItems"
  :loading="barangStore.loading"
  :page="barangStore.currentPage"
  :headers="headers"
  item-value="id"
  density="compact"
  class="elevation-1 rounded-lg striped-table"
  no-data-text="Tidak ada data barang yang tersedia."
  @update:options="loadItems"
>
  <!-- ✅ Kolom Nomor Urut -->
  <template #item.no="{ index }">
    {{ (barangStore.currentPage - 1) * barangStore.itemsPerPage + index + 1 }}
  </template>
</v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'; // Import 'ref' dan 'computed'
import { useKeycloak } from '@josempgon/vue-keycloak';
import { useBarangStore } from '@/stores/barang.js'; 

const { keycloak, isAuthenticated, username, token } = useKeycloak();
const barangStore = useBarangStore();

// --- STATE LOKAL ---
const search = ref(''); // Untuk v-model pada text-field pencarian
const showUploadDialog = ref(false); // Untuk dialog upload
// Upload
const selectedFile = ref(null)
const uploadMsg = ref('')
const uploadSuccess = ref(false)
const totalQty = computed(() => {
  // Hitung total item yang ada di listBarang (sesuai permintaan 1 record)
  // Perlu dicatat: ini menghitung item yang ditampilkan, bukan total stok
  return barangStore.listBarang.length; 
});

// const totalQty = computed(() => {
//     // Ini seharusnya mengambil total kuantitas dari store Anda
//     // Menggunakan contoh sederhana:
//     return barangStore.listBarang.reduce((sum, item) => sum + item.qty, 0); 
// });

// --- LOGIKA ROLE ADMIN ---
const isAdmin = computed(() => {
    // Ganti 'admin-role-name' dengan nama role yang sebenarnya untuk admin
    // pada Keycloak Anda. Contoh umum mungkin 'admin' atau 'app-admin'.
    // keycloak.value.hasResourceRole() atau keycloak.value.hasRealmRole()
    // tergantung konfigurasi Anda. Kita asumsikan role ada di realm.
    
    // Pastikan keycloak.value ada sebelum mencoba memanggil hasRealmRole
    return keycloak.value && keycloak.value.hasRealmRole('admin'); 
   
    
    // Jika role Anda adalah "resource role" (role client), gunakan:
    // return keycloak.value && keycloak.value.hasResourceRole('admin', 'nama-client-anda');
});


const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Kode Barang', align: 'start', key: 'kodeBarang' },
  { title: 'Nama Barang', align: 'start', key: 'namaBarang' },
  { title: 'Qty', align: 'end', key: 'qty' },
];
// --- FUNGSI ---
/**
 * Memuat data barang dengan dukungan pagination dan pencarian.
 * @param {object} options - Opsi dari v-data-table-server.
 * @param {string} keyword - Kata kunci pencarian (opsional, default: keyword terakhir di store).
 */
// ✅ PERBAIKAN: Menambahkan parameter keyword dengan default dari store
const loadItems = (options, keyword = barangStore.searchKeyword) => {
  if (token.value && isAuthenticated.value) {
    // ✅ PERBAIKAN: Meneruskan keyword ke store action
    barangStore.fetchBarang(token.value, options.page, options.itemsPerPage, keyword);
  }
};

const onSearch = () => {
    // ✅ PERBAIKAN: Muat ulang data, reset ke halaman 1, dan gunakan nilai input 'search'
    loadItems({
        page: 1, 
        itemsPerPage: barangStore.itemsPerPage,
        
    }, search.value); // Gunakan nilai dari v-model 'search'
    
};

const reset = () => {
    // Reset nilai input lokal
    search.value = '';
    
    // ✅ PERBAIKAN: Muat ulang data, reset ke halaman 1, dengan keyword kosong
    loadItems({
        page: 1, 
        itemsPerPage: barangStore.itemsPerPage,
    }, ''); // Keyword kosong
};

// Pastikan watch dan onMounted menggunakan keyword terakhir dari store (sudah otomatis)
watch(token, (newToken) => {
  if (isAuthenticated.value && newToken) {
    // Saat token berubah, muat ulang dengan state terakhir (termasuk keyword terakhir)
    loadItems({
      page: barangStore.currentPage,
      itemsPerPage: barangStore.itemsPerPage,
    });
  }
}, { immediate: true });

onMounted(() => {
  if (isAuthenticated.value && token.value) {
    // Saat komponen dimuat, muat ulang dengan state terakhir (termasuk keyword terakhir)
    loadItems({
      page: barangStore.currentPage,
      itemsPerPage: barangStore.itemsPerPage,
    });
  }
  //  console.log(isAdmin)
});
// ✅ FUNGSI BARU UNTUK MENANGANI UPLOAD
const handleUpload = async () => {
    if (!selectedFile.value || !token.value) {
        return; 
    }
    
    // Panggil aksi di Pinia Store
    await barangStore.importBarangExcel(token.value, selectedFile.value);
    
    if (barangStore.uploadSuccess) {
        // Muat ulang data barang setelah upload berhasil (kembali ke halaman 1)
        loadItems({
            page: 1, 
            itemsPerPage: barangStore.itemsPerPage,
        });
        
        // Bersihkan input file setelah berhasil
        selectedFile.value = null; 
        // ✅ PERBAIKAN: Tutup dialog setelah berhasil upload
        setTimeout(() => {
            closeUploadDialog();
        }, 1000); // Memberi waktu 1.5 detik agar user sempat melihat pesan sukses
    }
};

// ✅ FUNGSI BARU UNTUK MENUTUP DIALOG & RESET STATE
const closeUploadDialog = () => {
    showUploadDialog.value = false;
    selectedFile.value = null; // Reset file
    barangStore.uploadSuccess = false; // Reset status sukses
    barangStore.clearError(); // Bersihkan error (termasuk uploadError)
}
const logout = () => keycloak.value.logout();
const login = () => keycloak.value.login();
</script>

<style scoped>
.v-container {
  width: 90vw !important;
  max-width: 90vw !important;
  margin: 0 auto;
}

.v-card {
  width: 100%;
}

/* Zebra row style */
.striped-table tr:nth-child(even) {
  background-color: #f9fafb !important;
}

.striped-table tr:hover {
  background-color: #e3f2fd !important;
  transition: 0.2s ease;
}

.v-data-table {
  width: 100%;
  overflow-x: auto;
  border-radius: 10px;
}

.v-data-table thead th {
  background-color: #f3f4f6 !important;
  font-weight: bold;
}
</style>
