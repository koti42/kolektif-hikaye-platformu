# GitHub'a Yükleme Talimatları

Bu belge, Kolektif Yaratıcı Hikaye Platformu projesini GitHub'a yüklemek için gerekli adımları içermektedir.

## 1. GitHub Deposu Oluşturma

1. GitHub hesabınıza giriş yapın.
2. Sağ üst köşedeki "+" simgesine tıklayın ve "New repository" seçeneğini seçin.
3. Depo adı olarak "kolektif-hikaye-platformu" girin.
4. Açıklama olarak "Kullanıcıların ortaklaşa interaktif hikayeler oluşturabileceği dinamik bir platform" yazın.
5. Depoyu "Public" olarak ayarlayın.
6. "Initialize this repository with a README" seçeneğini işaretlemeyin.
7. "Create repository" düğmesine tıklayın.

## 2. Yerel Depoyu Hazırlama

Aşağıdaki komutları terminal üzerinden çalıştırın:

```bash
# Proje dizinine gidin
cd /Users/mehmet/Desktop/Projeler/story-time

# Git deposunu başlatın (eğer başlatılmamışsa)
git init

# Tüm dosyaları ekleyin
git add .

# İlk commit'i oluşturun
git commit -m "İlk commit: Kolektif Yaratıcı Hikaye Platformu"
```

## 3. GitHub Deposuna Bağlanma ve Yükleme

GitHub'da oluşturduğunuz deponun URL'sini kullanarak aşağıdaki komutları çalıştırın:

```bash
# GitHub deposunu uzak depo olarak ekleyin
git remote add origin https://github.com/KULLANICI_ADINIZ/kolektif-hikaye-platformu.git

# Yerel depoyu GitHub'a yükleyin
git push -u origin main
```

Not: Eğer ana dalınız "master" ise, son komutu şu şekilde değiştirin:
```bash
git push -u origin master
```

## 4. GitHub Üzerinde Doğrulama

1. GitHub'da deponuzu ziyaret edin: `https://github.com/KULLANICI_ADINIZ/kolektif-hikaye-platformu`
2. Tüm dosyaların başarıyla yüklendiğinden emin olun.
3. README.md dosyasının depo ana sayfasında görüntülendiğini kontrol edin.

## 5. GitHub Pages (Opsiyonel)

Eğer frontend uygulamasını GitHub Pages üzerinde yayınlamak isterseniz:

1. GitHub deposunda "Settings" sekmesine gidin.
2. Sol menüden "Pages" seçeneğini bulun.
3. "Source" bölümünde "Deploy from a branch" seçeneğini seçin.
4. Branch olarak "main" veya "master" seçin ve "/docs" klasörünü belirtin.
5. "Save" düğmesine tıklayın.

Not: GitHub Pages'i kullanmak için, Vue.js uygulamasını build etmeniz ve çıktıyı `/docs` klasörüne kopyalamanız gerekecektir.