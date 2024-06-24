const fs = require('fs');

// JSON dosyasını oku
fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  try {
    // JSON verisini JavaScript nesnesine çevir
    const jsonData = JSON.parse(data);

    // domainName kısmını güncelle
    const updatedJson = jsonData.map(item => {
      return {
        ...item,
        DomainName: item.DomainName.toLowerCase()
      };
    });

    // Güncellenmiş veriyi updateJson dosyasına kaydet
    fs.writeFile('updateJson.json', JSON.stringify(updatedJson, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Veriler başarıyla güncellendi ve updateJson.json dosyasına kaydedildi.');
    });

  } catch (error) {
    console.error('Hata:', error);
  }
});