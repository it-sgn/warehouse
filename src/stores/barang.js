import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_API_URL = 'http://sgn-glm.zone.id:8001/v1/barang'; 

export const useBarangStore = defineStore('barang', {
state: () => ({
        // ✅ PERBAIKAN: Inisialisasi semua state yang digunakan di template
        listBarang: [],
        totalItems: 0, // Inisialisasi sebagai Number/String yang valid (0)
        currentPage: 1, // Inisialisasi
        itemsPerPage: 10, // Inisialisasi
        loading: false,
        error: null,
        searchKeyword: '',
    }),

    actions: {
        async fetchBarang(token, page = 1, items = 10, keyword = '') {
            if (!token) {
                this.error = 'Token autentikasi tidak tersedia.';
                return;
            }
            
            this.loading = true;
            this.error = null;
            
            // Update state pagination dan keyword
            this.currentPage = page;
            this.itemsPerPage = items;
            this.searchKeyword = keyword; // Simpan keyword yang baru untuk konsistensi

            try {
                let API_URL;
                let isSearchEndpoint = false; // Flag untuk menandai endpoint pencarian

                // Pilih endpoint berdasarkan ada/tidaknya keyword
                if (this.searchKeyword) {
                    // ✅ PERBAIKAN URL PENCARIAN (Menghapus pn dan pSize)
                    const encodedKeyword = encodeURIComponent(this.searchKeyword);
                    API_URL = `${BASE_API_URL}/by-nama/${encodedKeyword}`; // Endpoint yang mengembalikan satu objek/array
                    isSearchEndpoint = true;
                } else {
                    // Jika tidak ada keyword, gunakan endpoint 'list' (dengan pagination)
                    API_URL = `${BASE_API_URL}/list?pn=${page}&pSize=${items}`;
                }

                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                // ✅ PERBAIKAN: Menangani respons API yang berbeda
                if (isSearchEndpoint) {
    let barangDitemukan = [];
    let total = 0;

    // 1. Cek jika respons adalah objek tunggal (hasil pencarian tepat)
    if (response.data && !Array.isArray(response.data)) {
        barangDitemukan = [response.data]; // Masukkan objek tunggal ke dalam array
        total = 1;

    // 2. Cek jika respons adalah array (dan kita hanya ambil 1 record pertama)
    //    Ini mengasumsikan API /by-nama bisa mengembalikan array walau niatnya "exact match"
    } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Ambil hanya record pertama sesuai permintaan
        barangDitemukan = [response.data[0]]; 
        total = 1; 

    // 3. Array kosong (tidak ditemukan)
    } else {
        barangDitemukan = [];
        total = 0;
    }

    this.listBarang = barangDitemukan;
    this.totalItems = total;
    this.currentPage = 1; // Pencarian tidak terpaut pagination
    
    if (total === 0) {
        this.error = `Barang dengan nama "${this.searchKeyword}" tidak ditemukan.`;
    }
                    
                } else {
                    // Mode List (dengan Pagination)
                    // Asumsi struktur data: response.data.total & response.data.barangList
                    if (response.data) {
                        this.listBarang = response.data.barangList || [];
                        this.totalItems = response.data.total || 0; 
                    } else {
                        this.listBarang = [];
                        this.totalItems = 0;
                    }
                }
                
            } catch (err) {
                console.error('Error saat mengambil data barang:', err);
                if (err.response && err.response.status === 401) {
                    this.error = 'Gagal Autentikasi. Token tidak valid atau kedaluwarsa.';
                } 
                // Jika error 404 (Not Found) pada pencarian, kita bisa menganggapnya sebagai tidak ada data
                else if (this.searchKeyword && err.response && err.response.status === 404) {
                    this.error = `Barang dengan nama "${this.searchKeyword}" tidak ditemukan.`;
                }
                else {
                    this.error = 'Data tidak ditemukan atau Gagal mengambil data dari server.';
                }
                this.listBarang = [];
                this.totalItems = 0; // Reset total items saat terjadi error
            } finally {
                this.loading = false;
            }
        },
    // ✅ AKSI BARU: Import Excel
        async importBarangExcel(token, file) {
            if (!token) {
                this.uploadError = 'Token autentikasi tidak tersedia.';
                return;
            }
            if (!file) {
                this.uploadError = 'File belum dipilih.';
                return;
            }
            
            this.uploadLoading = true;
            this.uploadError = null;
            this.uploadSuccess = false;
            
            const API_URL = `${BASE_API_URL}/upload-excel`; // Endpoint asumsi

            const formData = new FormData();
            formData.append('file', file); // Sesuaikan key 'file' dengan yang diharapkan backend

            try {
                const response = await axios.post(API_URL, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data', // Penting untuk upload file
                    },
                });

                this.uploadSuccess = true;
                
            } catch (err) {
                console.error('Error saat mengunggah file:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    this.uploadError = `Gagal Upload: ${err.response.data.message}`;
                } else if (err.response && err.response.status === 401) {
                    this.uploadError = 'Gagal Autentikasi. Token tidak valid atau kedaluwarsa.';
                } else {
                    this.uploadError = 'Gagal mengunggah file ke server.';
                }
                this.uploadSuccess = false;
            } finally {
                this.uploadLoading = false;
            }
        },
    // Aksi untuk Membersihkan state error
    clearError() {
        this.error = null;
    }
  },
});