import React from 'react';
import useDocumentMeta from '../hooks/useDocumentMeta';

const Kvkk = () => {
  useDocumentMeta({
    title: 'KVKK | Teskilat ICOM',
    description: 'Çalışan Adaylarının Kişisel Verilerine İlişkin Aydınlatma Metni',
    canonicalPath: '/kvkk'
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="glass-panel p-8 md:p-12 rounded-xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-display font-bold mb-4 text-white">
              ÇALIŞAN ADAYLARININ KİŞİSEL VERİLERİNE İLİŞKİN<br/>AYDINLATMA METNİ
            </h1>
            <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300">
            <p>
              Kozyatağı Mah. Kaya Sultan Sok. A No:83/1 İç Kapı No:2 Kadıköy, İstanbul adresinde mukim TEŞKİLAT İLETİŞİM HİZMETLERİ A.Ş. (“Şirketimiz” veya “TEŞKİLAT”) olarak, kişisel verilerinizin hukuka uygun olarak korunmasına ve işlenmesine oldukça önem vermekteyiz. Bu kapsamda, TEŞKİLAT’a başvuran çalışan adaylarına (“siz”) ait kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) ve ilgili mevzuata uygun olarak aşağıda açıklanan kapsamda işleyeceğiz.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• İşlediğimiz Kişisel Veriler</h3>
            <p>Şirketimiz, iş başvurularını değerlendirme sürecinde aşağıdaki kişisel verilerinizi işleyebilecektir:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Ad, soyad, cinsiyet, T.C. Kimlik Numarası, medeni durum, doğum tarihi, uyruk, ev adresi, telefon numarası, e-posta,</li>
              <li>Aile yakınlarınızın adı, soyadı ve telefon numaraları,</li>
              <li>Eğitim bilgileriniz, katılmış olunan seminer bilgileri, sertifika bilgileri, yabancı dil bilgileri, bilgisayar bilgileri, ehliyet bilgileri, geçmiş iş deneyimleri, askerlik durumu,</li>
              <li>Engellilik durumu, sahip olunan kronik hastalıklar ve geçirilen sağlık operasyonları,</li>
              <li>Dernek ve vakıf üyelik bilgileriniz,</li>
              <li>Hobiler, yapılan kültürel ve sosyal aktiviteler,</li>
              <li>Daha önceki işyerinde alınan ve/veya beklenen maaş bilgileriniz.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Kişisel Verilerinizi İşleme Amaçlarımız</h3>
            <p className="mb-4">
              Şirketimiz, veri sorumlusu olarak, kişisel verilerinizi Kişisel Verilerin Korunması Kanunu’na ve ilgili mevzuata uygun olarak işlemekle yükümlüdür. Kişisel verileriniz sadece belirli, açık ve meşru amaçlarla ve hukuka ve dürüstlük kurallarına uygun olarak işlenecektir. Ayrıca Şirketimiz kişisel verilerinizi işleme amacıyla bağlantılı, sınırlı ve ölçülü olarak işlemeye ve işlediği verilerin doğru ve güncel olmasına özen gösterecektir.
            </p>
            <p>
              Şirketimiz, iş başvurularınızı değerlendirmek ve işe alım süreçlerini yürütebilmek, sizlerle görüşmeler yapabilmek, iş üsluplarınızı ve öğrenme stillerinizi öğrenebilmek ve yasal mevzuattan kaynaklanan yükümlülükleri yerine getirmek amacıyla kişisel verilerinizi işlemektedir.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Kişisel Verilerinizi Toplama Yöntemi ve Hukuki Sebebi</h3>
            <p className="mb-4">
              Şirketimiz, kişisel verilerinizi sözlü olarak, fiziki form, fotokopi, e-posta, telefon ve Yenibiris.com ve LinkedIn gibi kariyer siteleri de dahil olmak üzere fiziki ve elektronik ortamlar üzerinden toplayabilmektedir.
            </p>
            <p>
              Kişisel verileriniz; kanunlarda açıkça öngörülmesi, sözleşmenin kurulması ve ifası, hukuki yükümlülüğün yerine getirilmesi, Şirket’in hakkını tesis etmesi, savunması ve koruması, Şirket’in meşru menfaati için gerekli olması gibi Kanun’un 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayalı olarak işlenmekte ve aktarılmaktadır.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Kişisel Verilerinizin Aktarılması ve Aktarılma Amacı</h3>
            <p>
              Kişisel verileriniz, yukarıda belirtilen amaçlar dahilinde yurt içi ve yurt dışındaki hizmet sağlayıcılarımıza, tedarikçilerimize ve hissedarlarımıza ve açık rıza verdiğiniz takdirde üçüncü taraf firmalara Kanun’un 8. ve 9. maddelerinde belirtilen hukuki sebeplere dayalı olarak aktarılabilecektir.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Kişisel Verilerinizin Saklanması</h3>
            <p>Şirketimiz, kişisel verilerinizi,</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>ilgili mevzuatta öngörülen süre,</li>
              <li>işlendikleri amaç için gerekli olan süre, veya</li>
              <li>Kanun madde 5/2(e)’de belirtilen olası bir uyuşmazlıkta Şirketin hakkını tesis edebilmesi, kullanabilmesi ve savunabilmesi sebebine dayalı olarak gereken süre</li>
            </ul>
            <p>
              boyunca muhafaza edecektir. Bu kapsamda, Şirketimiz öncelikle mevzuatta kişisel verilerin saklanması için öngörülen süre boyunca, bir süre belirtilmemişse, yukarıda belirtilen diğer amaçlar için gerekli olan süre boyunca kişisel verilerinizi saklama hakkına sahiptir. Bu sürelerin sona ermesi ve Şirketin kişisel verilerinizi işlemek için herhangi bir hukuki sebebi kalmaması halinde kişisel verileriniz derhal silinecek, yok edilecek veya anonim hale getirilecektir. Daha fazla bilgi için Kişisel Verileri Saklama ve İmha Politikamıza bakabilirsiniz.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Kişisel Verilerinize İlişkin Haklarınız</h3>
            <p>Kişisel veri sahibi olarak, Kanun’un 11. maddesi uyarınca kişisel verilerinize ilişkin aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>6698 sayılı Kanun ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerinizin silinmesini veya yok edilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde bu zararın giderilmesini talep etme.</li>
            </ul>
            <p>
              Bu haklarınıza ilişkin taleplerinizi, internet sitemizdeki İlgili Kişi Başvuru Formu’nu doldurarak iletebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kvkk;
