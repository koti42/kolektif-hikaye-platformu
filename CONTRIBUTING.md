# Katkıda Bulunma Kılavuzu

Kolektif Yaratıcı Hikaye Platformu'na katkıda bulunmak istediğiniz için teşekkür ederiz! Bu belge, projeye katkıda bulunmak isteyenler için rehber niteliğindedir.

## Nasıl Katkıda Bulunabilirsiniz?

### 1. Sorunları Bildirin

Projede bir hata bulduysanız veya bir özellik öneriniz varsa, lütfen GitHub üzerinden bir "issue" açın. Issue açarken aşağıdaki bilgileri sağlamaya çalışın:

- Hatanın açık bir açıklaması
- Hatayı yeniden oluşturmak için adımlar
- Beklenen davranış ve gerçekleşen davranış
- Ekran görüntüleri (mümkünse)
- Kullandığınız tarayıcı, işletim sistemi ve sürüm bilgileri

### 2. Pull Request Gönderin

Kodu iyileştirmek veya yeni özellikler eklemek için pull request gönderebilirsiniz:

1. Projeyi fork edin
2. Kendi fork'unuzdan bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. GitHub üzerinden bir Pull Request açın

### 3. Kod Standartları

Projeye katkıda bulunurken aşağıdaki standartlara uymanızı rica ederiz:

#### Backend (Next.js)

- TypeScript tip güvenliğine dikkat edin
- ESLint ve Prettier kurallarına uyun
- Fonksiyonlar ve sınıflar için JSDoc yorumları ekleyin
- Birim testleri yazın

#### Frontend (Vue.js)

- Vue 3 Composition API stilini kullanın
- TypeScript tip güvenliğine dikkat edin
- Bileşenleri küçük ve yeniden kullanılabilir tutun
- CSS sınıfları için BEM metodolojisini takip edin

#### Admin Panel (PHP Filament)

- PSR-12 kod standartlarına uyun
- Laravel best practice'lerini takip edin
- Filament bileşenlerini dokümanlarına uygun şekilde kullanın

### 4. Commit Mesajları

Commit mesajlarınızı açıklayıcı ve anlaşılır tutun. Aşağıdaki formata uymanızı öneririz:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Örnek:
```
feat(auth): kullanıcı kayıt formuna captcha eklendi

- Google reCAPTCHA v3 entegrasyonu yapıldı
- Form doğrulama mantığı güncellendi
- Hata mesajları iyileştirildi

Closes #123
```

Tip olarak şunları kullanabilirsiniz:
- `feat`: Yeni bir özellik
- `fix`: Hata düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod stilini etkileyen değişiklikler (boşluklar, biçimlendirme, vb.)
- `refactor`: Hata düzeltmeyen ve yeni özellik eklemeyen kod değişiklikleri
- `perf`: Performansı artıran değişiklikler
- `test`: Test ekleme veya düzenleme
- `chore`: Yapılandırma dosyaları, derleme süreci vb. değişiklikler

### 5. Dallanma (Branching) Stratejisi

Projede aşağıdaki dallanma stratejisini kullanıyoruz:

- `main`: Üretim ortamı için kararlı sürüm
- `develop`: Geliştirme dalı, tüm özellik dalları buradan ayrılır ve buraya birleştirilir
- `feature/*`: Yeni özellikler için
- `bugfix/*`: Hata düzeltmeleri için
- `hotfix/*`: Üretim ortamındaki kritik hataların acil düzeltmeleri için
- `release/*`: Sürüm hazırlıkları için

### 6. Sürüm Numaralandırma

Proje, [Semantic Versioning](https://semver.org/) (SemVer) standardını takip etmektedir:

- MAJOR sürüm: Geriye dönük uyumsuz API değişiklikleri yapıldığında
- MINOR sürüm: Geriye dönük uyumlu bir şekilde işlevsellik eklendiğinde
- PATCH sürüm: Geriye dönük uyumlu hata düzeltmeleri yapıldığında

## Davranış Kuralları

Bu projeye katılan herkesin, [Katkıda Bulunanlar Davranış Kuralları](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) kurallarına uyması beklenmektedir.

## Lisans

Projeye katkıda bulunarak, katkılarınızın projenin lisansı altında yayınlanacağını kabul etmiş olursunuz. Detaylar için `LICENSE` dosyasına bakın. 