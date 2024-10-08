document.getElementById('uploadFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('txtContentBox').value = e.target.result;
      };
      reader.readAsText(file);
  } else {
      alert('Silakan unggah file TXT yang valid.');
  }
});

document.getElementById('convertTxtToVcfButton').addEventListener('click', function() {
  const txtContent = document.getElementById('txtContentBox').value.trim();
  const adminName = document.getElementById('adminNameInput').value.trim() || 'Admin';
  const navyName = document.getElementById('navyNameInput').value.trim() || 'Navy';
  const anggotaName = document.getElementById('anggotaNameInput').value.trim() || 'Anggota';
  const filename = document.getElementById('vcfFilenameInput').value.trim() || 'kontak';
  const separateAdmin = document.getElementById('separateAdminToggle').checked;
  const numberingEnabled = document.getElementById('numberingToggle').checked; // Penomoran untuk nama kontak

  // Cek apakah isi textarea kosong
  if (!txtContent) {
      alert('Isi textarea tidak boleh kosong! Harap unggah file atau masukkan teks manual.');
      return;
  }

  const lines = txtContent.split('\n').map(line => line.trim());
  let vcfContentAdminNavy = '';
  let vcfContentAnggota = '';
  let currentCategory = '';
  let contactIndexAdminNavy = 1;
  let contactIndexAnggota = 1;
  let totalContacts = lines.filter(line => line && /^\d+$/.test(line)).length; // Hitung total kontak (nomor telepon)
  
  // Fungsi untuk menentukan jumlah digit berdasarkan total kontak
  const determineDigitCount = (index) => {
      if (totalContacts < 10) {
          return String(index).padStart(2, '0'); // Jika kontak < 10, gunakan 2 digit
      } else if (totalContacts < 1000) {
          return String(index).padStart(3, '0'); // Jika kontak < 1000, gunakan 3 digit
      } else {
          return String(index).padStart(4, '0'); // Jika kontak < 10000, gunakan 4 digit
      }
  };

  lines.forEach(line => {
      const lowerCaseLine = line.toLowerCase();

      // Kategori Admin
      if (['admin', '管理号', '管理', '管理员', '管理號'].includes(lowerCaseLine)) {
          currentCategory = adminName;
          contactIndexAdminNavy = 1; // Reset index for admin
      } 
      // Kategori Navy
      else if (['navy', '水軍', '小号', '水军', '水軍'].includes(lowerCaseLine)) {
          currentCategory = navyName;
          contactIndexAdminNavy = 1; // Reset index for navy
      } 
      // Kategori Anggota
      else if (['anggota', '数据', '客户', '底料', '进群资源'].includes(lowerCaseLine)) {
          currentCategory = anggotaName;
          contactIndexAnggota = 1; // Reset index for anggota
      } 
      // Jika line berisi nomor telepon
      else if (line) {
          let phoneNumber = line;
          if (!phoneNumber.startsWith('+')) {
              phoneNumber = '+' + phoneNumber;
          }

          let contactName = currentCategory;

          // Logika penomoran dinamis
          if (numberingEnabled) {
              if (currentCategory === adminName || currentCategory === navyName) {
                  contactName += `-${determineDigitCount(contactIndexAdminNavy)}`; // Tambah nomor urut dengan 0
              } else {
                  contactName += `-${determineDigitCount(contactIndexAnggota)}`; // Tambah nomor urut dengan 0
              }
          } else {
              // Jika checkbox dimatikan, gunakan penomoran seperti A1, A2, A3, dll.
              if (currentCategory === adminName || currentCategory === navyName) {
                  contactName += `${contactIndexAdminNavy}`;
              } else {
                  contactName += `${contactIndexAnggota}`;
              }
          }

          const vcfEntry = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;

          // Tambahkan ke kontak Admin/Navy atau Anggota
          if (currentCategory === adminName || currentCategory === navyName) {
              vcfContentAdminNavy += vcfEntry;
              contactIndexAdminNavy++;
          } else {
              vcfContentAnggota += vcfEntry;
              contactIndexAnggota++;
          }
      }
  });

  // Simpan file jika ada kontak Admin/Navy
  if (separateAdmin && vcfContentAdminNavy) {
      const blobAdminNavy = new Blob([vcfContentAdminNavy], { type: 'text/vcard' });
      const urlAdminNavy = URL.createObjectURL(blobAdminNavy);
      const aAdminNavy = document.createElement('a');
      aAdminNavy.href = urlAdminNavy;
      aAdminNavy.download = `${filename}_Admin.vcf`;
      aAdminNavy.click();
      URL.revokeObjectURL(urlAdminNavy);
  }

  // Simpan file Anggota (jika ada) atau kontak Admin/Navy yang tidak dipisah
  if (vcfContentAnggota || (!separateAdmin && vcfContentAdminNavy)) {
      const blobAnggota = new Blob([vcfContentAnggota || vcfContentAdminNavy], { type: 'text/vcard' });
      const urlAnggota = URL.createObjectURL(blobAnggota);
      const aAnggota = document.createElement('a');
      aAnggota.href = urlAnggota;
      aAnggota.download = `${filename}.vcf`;
      aAnggota.click();
      URL.revokeObjectURL(urlAnggota);
  }
});
