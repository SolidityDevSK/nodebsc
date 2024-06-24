const _ = require('lodash');


let data = [
    {
        "ItemId": "2",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "e-bike",
    },
    {
        "ItemId": "3",
        "From": "0x8b195d2A84E5d4287645206C551E6495209E1936",
        "DomainName": "nfts",
    },
    {
        "ItemId": "4",
        "From": "0x8b195d2A84E5d4287645206C551E6495209E1936",
        "DomainName": "hotels",
    },
    {
        "ItemId": "5",
        "From": "0xc08c559F694665Ee34dF6a1BC2AD588e03A9D4a5",
        "DomainName": "x",
    },
    {
        "ItemId": "6",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "sahibinden",
    },
    {
        "ItemId": "7",
        "From": "0x8b195d2A84E5d4287645206C551E6495209E1936",
        "DomainName": "privatejet",
    },
    {
        "ItemId": "8",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "auction",
    },
    {
        "ItemId": "9",
        "From": "0x8b195d2A84E5d4287645206C551E6495209E1936",
        "DomainName": "internet",
    },
    {
        "ItemId": "10",
        "From": "0x8b195d2A84E5d4287645206C551E6495209E1936",
        "DomainName": "business",
    },
    {
        "ItemId": "11",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "tesla",
    },
    {
        "ItemId": "12",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "investing",
    },
    {
        "ItemId": "13",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "xiaomi",
    },
    {
        "ItemId": "14",
        "From": "0xc08c559F694665Ee34dF6a1BC2AD588e03A9D4a5",
        "DomainName": "youtube",
    },
    {
        "ItemId": "15",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "bitcoin",
    },
    {
        "ItemId": "16",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "binance",
    },
    {
        "ItemId": "17",
        "From": "0xc08c559F694665Ee34dF6a1BC2AD588e03A9D4a5",
        "DomainName": "amazon",
    },
    {
        "ItemId": "18",
        "From": "0x14c67B7ed6929aD27a857C1561d92CA71175Dd75",
        "DomainName": "spacex",
    },
    {
        "ItemId": "19",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "opensea",
    },
    {
        "ItemId": "20",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "ethereum",
    },
    {
        "ItemId": "21",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "toys",
    },
    {
        "ItemId": "22",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "trendyol",
    },
    {
        "ItemId": "23",
        "From": "0xBE1d0381E8F4f60B467EB9030BfF0cc6Ac824232",
        "DomainName": "datarecovery",
    },
    {
        "ItemId": "24",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "thy",
    },
    {
        "ItemId": "25",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "nvidia",
    },
    {
        "ItemId": "26",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "ferrari",
    },
    {
        "ItemId": "27",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "teknosa",
    },
    {
        "ItemId": "28",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "paradigm",
    },
    {
        "ItemId": "29",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "google",
    },
    {
        "ItemId": "30",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "000",
    },
    {
        "ItemId": "31",
        "From": "0x1f58b116d96aa5DDdfb649d58efb6653049A4F6A",
        "DomainName": "spotify",
    },
    {
        "ItemId": "32",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "aramco",
    },
    {
        "ItemId": "33",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "apple",
    },
    {
        "ItemId": "34",
        "From": "0xe1Ea6c146c8E88653D4E0358D6D4F328d077a594",
        "DomainName": "galatasaray",
    },
    {
        "ItemId": "35",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "volkswagen",
    },
    {
        "ItemId": "36",
        "From": "0xF126F3D4AD77B605C1075f5C91E408b2746A259a",
        "DomainName": "trendyol",
    },
    {
        "ItemId": "37",
        "From": "0x1f58b116d96aa5DDdfb649d58efb6653049A4F6A",
        "DomainName": "instagram",
    },
    {
        "ItemId": "38",
        "From": "0xF126F3D4AD77B605C1075f5C91E408b2746A259a",
        "DomainName": "yemeksepeti",
    },
    {
        "ItemId": "39",
        "From": "0xF126F3D4AD77B605C1075f5C91E408b2746A259a",
        "DomainName": "samsung",
    },
    {
        "ItemId": "40",
        "From": "0xF126F3D4AD77B605C1075f5C91E408b2746A259a",
        "DomainName": "google",
    },
    {
        "ItemId": "41",
        "From": "0x1f58b116d96aa5DDdfb649d58efb6653049A4F6A",
        "DomainName": "tesla",
    },
    {
        "ItemId": "42",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "aselsan",
    },
    {
        "ItemId": "43",
        "From": "0x0A5F76836Fcf24507AeC48618766B8e632868862",
        "DomainName": "ai",
    },
    {
        "ItemId": "44",
        "From": "0x1f58b116d96aa5DDdfb649d58efb6653049A4F6A",
        "DomainName": "vk",
    },
    {
        "ItemId": "45",
        "From": "0xc08c559F694665Ee34dF6a1BC2AD588e03A9D4a5",
        "DomainName": "x",
    },
    {
        "ItemId": "46",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "aliexpress",
    },
    {
        "ItemId": "47",
        "From": "0xc08c559F694665Ee34dF6a1BC2AD588e03A9D4a5",
        "DomainName": "youtube",
    },
    {
        "ItemId": "48",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "brolyz",
    },
    {
        "ItemId": "49",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "nvidia",
    },
    {
        "ItemId": "50",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "thy",
    },
    {
        "ItemId": "51",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "aromco",
    },
    {
        "ItemId": "52",
        "From": "0x14c67B7ed6929aD27a857C1561d92CA71175Dd75",
        "DomainName": "reddit",
    },
    {
        "ItemId": "53",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "ferrari",
    },
    {
        "ItemId": "54",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "bankofamerica",
    },
    {
        "ItemId": "55",
        "From": "0x1f58b116d96aa5DDdfb649d58efb6653049A4F6A",
        "DomainName": "telegram",
    },
    {
        "ItemId": "56",
        "From": "0x6A32A05BF6c3f5c6fbF1901D613AB051379E0495",
        "DomainName": "fenerbahce",
    },
    {
        "ItemId": "57",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "bitcoin",
    },
    {
        "ItemId": "58",
        "From": "0x139ec04B68EfD097d9D35e95b5Dd5b7F1af36dc9",
        "DomainName": "microsoft",
    },
    {
        "ItemId": "59",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "meta",
    },
    {
        "ItemId": "60",
        "From": "0xdaF3c5C52ac433cDcf6aeEdB2fe61F4601fd4fa3",
        "DomainName": "whatsapp",
    },
    {
        "ItemId": "61",
        "From": "0x8b69701cd05053Ff1bcc41B413592b2B1e326F5a",
        "DomainName": "isimsoyisim",
    },
    {
        "ItemId": "62",
        "From": "0x1129E41DC935260e04fF0eC169CD3835e44f5A99",
        "DomainName": "sahibinden",
    },
    {
        "ItemId": "63",
        "From": "0x1129E41DC935260e04fF0eC169CD3835e44f5A99",
        "DomainName": "defacto",
    },
    {
        "ItemId": "64",
        "From": "0x1129E41DC935260e04fF0eC169CD3835e44f5A99",
        "DomainName": "mustafakemalataturk",
    },
    {
        "ItemId": "65",
        "From": "0x1129E41DC935260e04fF0eC169CD3835e44f5A99",
        "DomainName": "vakko",
    }
]

const groupedByDomain = _.groupBy(data, 'DomainName');

// Aynı DomainName'e sahip itemleri filtrele
const filtered = _.filter(groupedByDomain, group => group.length > 1);

// Sonuçları düzleştir
const result = _.flatten(filtered);

console.log(result);