// 3. OYUN: DERİNLEŞTİRİLMİŞ CO-OP TEXT RPG MOTORU
// Görev Dağılımı (Task Assignment) -> Kişisel Olay Tepkisi (Reaction) -> Dallanan Hikaye (Branching Graph)

export const RPG_CLASSES = [
  {
    id: 'warrior',
    name: 'Öncü Muhafız',
    icon: 'Sword',
    passiveName: 'Siper Yeminli',
    passiveDesc: 'Fiziksel çatışma ve koruma görevlerinde ekibin aldığı hasarı azaltır.',
    startingItem: 'Kırılmaz Kalkan',
    description: 'Cephe hattını tutan, tehlikeyi göğüsleyen ve ağır engelleri aşan savaşçı.',
    stats: { guc: 4, zeka: 0, ceviklik: 2, karizma: 1 }
  },
  {
    id: 'mage',
    name: 'Kahin / Analist',
    icon: 'Wand2',
    passiveName: 'Kadim Sezgi',
    passiveDesc: 'Gizem, rün ve sistem şifresi görevlerinde gizli ipuçlarını açığa çıkarır.',
    startingItem: 'Aether Merceği',
    description: 'Unutulmuş dilleri, karmaşık sistemleri ve doğaüstü sırları çözen bilgin.',
    stats: { guc: 0, zeka: 4, ceviklik: 1, karizma: 2 }
  },
  {
    id: 'rogue',
    name: 'Gölge Ajanı',
    icon: 'Footprints',
    passiveName: 'Sessiz Adım',
    passiveDesc: 'Sızma, pusu ve tuzak imha görevlerinde kritik başarı şansı yüksektir.',
    startingItem: 'Maymuncuk Takımı',
    description: 'Kimsenin fark etmediği geçitleri bulan, tuzakları söken ve gölgede hareket eden uzman.',
    stats: { guc: 1, zeka: 2, ceviklik: 4, karizma: 0 }
  },
  {
    id: 'bard',
    name: 'Stratejist / Elçi',
    icon: 'Mic',
    passiveName: 'Gümüş Dil',
    passiveDesc: 'Müzakere, sorgu ve liderlik görevlerinde düşmanları bile müttefike dönüştürebilir.',
    startingItem: 'Kraliyet Mührü',
    description: 'Kelimeleri silah gibi kullanan, kriz anında soğukkanlı taktikler üreten lider.',
    stats: { guc: 1, zeka: 1, ceviklik: 1, karizma: 4 }
  }
];

export const RPG_SCENARIOS = {
  // ============================================================================
  // SENARYO 1: KARANLIK ZİNDAN — KIZIL KRİSTALİN LANETİ (FANTASTİK KURGU)
  // ============================================================================
  ejderha_kristali: {
    id: 'ejderha_kristali',
    name: 'Valoria Çöküşü: Kızıl Kristalin Laneti',
    theme: 'Karanlık Fantastik & Dallanan Macera',
    description:
      'Valoria Krallığı veba ve küller altında can çekişiyor. Yeraltındaki kadim tapınakta saklanan Kızıl Kristal tek umut; ancak içerideki hizipler, lanetli mühürler ve uyuyan Kızıl Ejderha Ignis vereceğiniz her kararla şekillenecek.',
    initialHp: 100,
    initialGold: 60,
    initialMorale: 70,
    startSceneId: 'act1_gate',
    scenes: {
      // ------------------------------------------------------------------------
      // BÖLÜM 1: TAPINAK GİRİŞİ
      // ------------------------------------------------------------------------
      act1_gate: {
        id: 'act1_gate',
        actTitle: 'Perde I • Kırık Mühürlü Kapı',
        title: 'Valoria Harabeleri ve Yaralı Muhafız',
        environmentTag: 'Fırtınalı Tapınak Girişi • Seçimleriniz Rotayı Belirleyecek',
        narrative:
          'Şimşeklerin aydınlattığı gecede Valoria Tapınağı\'nın devasa kapısına ulaşıyorsunuz. Kapının önünde kraliyetin öncü birliği katledilmiş. Yerde son nefesini veren Yüzbaşı Vael var, tapınak kapısındaki kanlı rünler hızla kararıyor ve çalılıklardan Gölge Goblin izcilerinin fısıltıları geliyor. Ekip hemen görev dağılımı yapmalı!',
        tasks: [
          {
            id: 'task_captain',
            title: 'Yaralı Yüzbaşı Vael ile İlgilen',
            summary: 'Ölmek üzere olan komutan bir harita parçası tutuyor ve bir şeyler fısıldıyor.',
            icon: 'Heart',
            recommendedStat: 'karizma',
            encounterText:
              'Yüzbaşı Vael kanlar içinde kolunu tutuyor: "Tapınakta yalnız değilsiniz... Tarikatçılar içeride! Bana söz ver... ya bizi satan haini bul ya da gizli su kemerinden sızın..." Yüzbaşının nefesi kesilmek üzere.',
            reactions: [
              {
                id: 'heal_and_comfort',
                label: 'Şifa iksirini feda edip Yüzbaşıyı hayata döndür (-15 Altın)',
                approachTag: 'Merhamet & İttifak',
                stat: 'karizma',
                difficulty: 10,
                costGold: 15,
                setFlag: 'vael_yasadi',
                grantItem: 'Vael\'in Gizli Haritası',
                successText:
                  'Yüzbaşı Vael\'in yaralarını sardı! Vael minnetle size "Gizli Su Kemeri Haritası"nı verdi ve arkadan gelen tehlikelere karşı nöbet tutacağına söz verdi.',
                failText:
                  'iksiri içirmeye çalıştı ama Vael çok kan kaybetmişti; yine de son nefesinde su kemerinin yerini işaret etti.'
              },
              {
                id: 'interrogate_harsh',
                label: 'Zaman kaybetmeden çantasındaki mühür ve paraları al, kimin ihanet ettiğini sor',
                approachTag: 'Soğukkanlı Pragmatizm',
                stat: 'zeka',
                difficulty: 11,
                goldReward: 25,
                setFlag: 'tarikat_sifresi_alindi',
                successText:
                  'Vael\'in zırhındaki gizli bölmeden Tarikat Parolasını ve 25 altın kesesini buldu!',
                failText:
                  'Vael bu soğuk tavırdan ötürü konuşmayı reddetti ve sırrıyla birlikte gözlerini yumdu.'
              },
              {
                id: 'swear_vengeance',
                label: 'Kılıcını kaldırıp askerlerin intikamını alacaklarına dair savaş yemini et',
                approachTag: 'Cesaret & Moral',
                stat: 'guc',
                difficulty: 10,
                moraleDelta: 15,
                setFlag: 'intikam_yemini',
                successText:
                  'ettiği yeminle hem Vael\'e huzur verdi hem de tüm ekibin savaş moralini şaha kaldırdı!',
                failText:
                  'yüksek sesle yemin ederken çalılıklardaki izcilerin dikkatini üzerine çekti.'
              }
            ]
          },
          {
            id: 'task_runes',
            title: 'Kararan Tapınak Mühürlerini İncele',
            summary: 'Ana kapıdaki rünler kapanmak üzere; yanlış müdahale büyüsel tuzakları tetikleyebilir.',
            icon: 'Sparkles',
            recommendedStat: 'zeka',
            encounterText:
              'Tapınak kapısının üzerindeki üç kadim rün kor gibi yanıyor. Ortadaki yuvada karanlık bir büyü kristali nabız gibi atıyor. Kapıyı zorla açabilir, rünleri çözebilir veya karanlık enerjiyi emebilirsin.',
            reactions: [
              {
                id: 'decipher_safe',
                label: 'Kadim Valoria alfabesini kullanarak mührü sessizce devre dışı bırak',
                approachTag: 'Bilgelik & Gizlilik',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'sessiz_giris',
                grantItem: 'Mühür Taşı',
                successText:
                  'rünlerin dilini kusursuzca çözdü! Kapı tek bir gıcırtı bile çıkarmadan açıldı ve Mühür Taşı ele geçirildi.',
                failText:
                  'sembolleri karıştırınca kapıdan yayılan büyü dalgası ekibi sarstı!'
              },
              {
                id: 'absorb_dark_rune',
                label: 'Elini doğrudan karanlık kristale basıp yasaklı gücü bedenine çek (-10 HP)',
                approachTag: 'Karanlık Güç (Garantili)',
                stat: 'zeka',
                difficulty: 6,
                costHp: 10,
                setFlag: 'kan_muhru_aktif',
                grantItem: 'Karanlık Kor Küresi',
                successText:
                  'acıyı göze alarak karanlık enerjiyi emdi! Kapı ardına kadar açıldı ve "Karanlık Kor Küresi" kazanıldı.',
                failText:
                  'karanlık enerjiden ağır hasar aldı ama kapının kilidi kırıldı.'
              },
              {
                id: 'ram_the_gate',
                label: 'Devrilmiş sütunu koçbaşı gibi kullanıp kapıyı menteşelerinden sök!',
                approachTag: 'Kaba Kuvvet',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'gurultulu_giris',
                successText:
                  'devasa taş kapıyı tek vuruşta yerle bir etti! İçerideki herkes gücünüzden ürktü.',
                failText:
                  'kapıyı kırarken düşen molozların altında kalarak yaralandı.'
              }
            ]
          },
          {
            id: 'task_scouts',
            title: 'Çalılıklardaki Gölge Goblin İzcilerini Yakala',
            summary: 'Karanlıkta sizi gözetleyen 2 Goblin izcisi borularını üflemek üzere!',
            icon: 'Footprints',
            recommendedStat: 'ceviklik',
            encounterText:
              'Harabelerin yanındaki yıkık kemerin altında iki Goblin izcisi alarm borusunu dudaklarına götürmek üzere! Birinin boynunda zindan katlarının anahtarlığı sallanıyor.',
            reactions: [
              {
                id: 'ambush_capture',
                label: 'Gölgelerden süzülüp boruyu üflemeden ikisini de kıskıvrak yakala',
                approachTag: 'Sızma & Rehine',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'goblin_rehine',
                grantItem: 'Zindan Anahtarlığı',
                successText:
                  'hiç ses çıkarmadan izcileri etkisiz hale getirdi, Zindan Anahtarlığını aldı ve bir izciyi rehber olarak esir tuttu!',
                failText:
                  'dal kırılınca Goblinlerden biri son anda borusunu üfleyip içeriye alarm verdi!'
              },
              {
                id: 'bribe_scouts',
                label: 'İzcilere altın fırlatıp "Bizi görmediniz, üstüne de içerinin planını verin" de (-15 Altın)',
                approachTag: 'Rüşvet & Kurnazlık',
                stat: 'karizma',
                difficulty: 10,
                costGold: 15,
                setFlag: 'goblin_ittifaki',
                successText:
                  'altın kesesini gösterince Goblinlerin gözleri parladı! Size gizli su kanalı geçidini gösterip ortadan kayboldular.',
                failText:
                  'Goblinler altını kapıp yine de kahkaha atarak içeriye doğru kaçtı!'
              },
              {
                id: 'cleave_scouts',
                label: 'Üzerlerine atılıp ikisini de anında ortadan kaldır',
                approachTag: 'Saldırgan Hamle',
                stat: 'guc',
                difficulty: 11,
                goldReward: 15,
                successText:
                  'şimşek gibi atılarak izcileri alarm veremeden devirdi ve 15 altın ganimet topladı!',
                failText:
                  'saldırırken Goblinlerin kurduğu bubi tuzağına basıp yaralandı.'
              }
            ]
          }
        ],
        // Alınan kararların bütününe göre sonraki sahneyi seçer
        resolveNextScene: (state) => {
          if (
            state.flags.includes('vael_yasadi') ||
            state.flags.includes('goblin_ittifaki') ||
            state.flags.includes('sessiz_giris')
          ) {
            return {
              nextSceneId: 'act2_stealth_aqueduct',
              branchReason:
                'Ekibiniz haritayı/gizli geçişi güvenceye aldığı ve alarm vermeden hareket ettiği için Muhafız Kışlası yerine "Unutulmuş Su Kemerleri" rotasından sızıyorsunuz!'
            };
          }
          return {
            nextSceneId: 'act2_siege_barracks',
            branchReason:
              'Tapınak girişindeki gürültü ve çatışma içerideki garnizonu alarma geçirdi! Ekibiniz doğrudan "Kanlı Muhafız Kışlası" cephesine giriyor!'
          };
        }
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 2A: GİZLİ ROTA (UNUTULMUŞ SU KEMERLERİ)
      // ------------------------------------------------------------------------
      act2_stealth_aqueduct: {
        id: 'act2_stealth_aqueduct',
        actTitle: 'Perde II (Gizli Rota) • Unutulmuş Su Kemerleri',
        title: 'Zehirli Sular ve Simyacı Mahzeni',
        environmentTag: 'Yeraltı Su Kanalı • Gizlilik Avantajı Aktif',
        narrative:
          'Harita ve sessiz hamleleriniz sayesinde ana kışladaki ordunun altından geçen antik su kemerine indiniz. Burada Kızıl Tarikat\'ın suya karıştırdığı veba kazanlarını, kilitli bir Simya Laboratuvarını ve kafeste tutulan gizemli bir Elf Kahini\'ni görüyorsunuz.',
        tasks: [
          {
            id: 'task_plague_cauldron',
            title: 'Veba Kazanlarını Sabote Et',
            summary: 'Şehrin su kaynağına zehir akıtan kazanları durdurabilir veya panzehire çevirebilirsin.',
            icon: 'Flame',
            recommendedStat: 'zeka',
            encounterText:
              'Devasa bakır kazanlardan yeşil dumanlar yükseliyor. Yan masada saf şifa özleri ve patlayıcı simya tozları duruyor.',
            reactions: [
              {
                id: 'purify_water',
                label: 'Simya formülünü tersine çevirip zehri şifa pınarına dönüştür',
                approachTag: 'Bilgelik & Şifa',
                stat: 'zeka',
                difficulty: 12,
                hpReward: 20,
                setFlag: 'su_aritildi',
                grantItem: 'Saf Yaşam İksiri',
                successText:
                  'zehirli kazanı arındırdı! Buharlar ekibin yaralarını iyileştirdi (+20 HP) ve Saf Yaşam İksiri elde edildi.',
                failText:
                  'karışımı yanlış yapınca zehirli dumanlardan öksürerek geri çekildi.'
              },
              {
                id: 'rig_explosive',
                label: 'Kazanların altına simya patlayıcısı yerleştirip üst kattaki kışlayı çökert',
                approachTag: 'Sabotaj & Yıkım',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'kisla_cokertildi',
                successText:
                  'kusursuz bir zamanlamayla kazanları patlattı; üst kattaki düşmanların yarısı daha sizi görmeden göçük altında kaldı!',
                failText:
                  'fitili kısa kesince patlamanın sarsıntısından hasar aldı.'
              },
              {
                id: 'topple_cauldron',
                label: 'Kazanı zincirlerinden koparıp yeraltı nehrine devir',
                approachTag: 'Fiziksel Güç',
                stat: 'guc',
                difficulty: 11,
                successText: 'devasa kazanı tek başına devirerek veba akışını durdurdu!',
                failText: 'sıcak metale dokununca ellerini yaktı.'
              }
            ]
          },
          {
            id: 'task_caged_oracle',
            title: 'Kafesteki Elf Kahini Lyra\'yı Kurtar',
            summary: 'Rünlü demir kafeste tutulan kahin, Ejderha Ignis\'in gerçek sırrını biliyor olabilir.',
            icon: 'Key',
            recommendedStat: 'ceviklik',
            encounterText:
              'Kahin Lyra parmaklıkların ardında fısıldıyor: "Ejderha Ignis kötü değil, kalbine saplanan Karanlık Mızrak yüzünden çıldırdı! Beni çıkarırsanız size Ejderha Lisanı mührünü veririm."',
            reactions: [
              {
                id: 'pick_rune_lock',
                label: 'Maymuncuk ve el çabukluğuyla rünlü kilidi sessizce aç',
                approachTag: 'Ustalık & Kurtarma',
                stat: 'ceviklik',
                difficulty: 11,
                bonusItem: 'Zindan Anahtarlığı',
                setFlag: 'kahin_kurtarildi',
                grantItem: 'Ejderha Bağı Tılsımı',
                successText:
                  'kilidi ustalıkla açtı! Kahin Lyra size "Ejderha Bağı Tılsımı"nı verdi ve ejderhayı öldürmeden kurtarmanın yolunu anlattı.',
                failText:
                  'kilitteki tuzak iğnesi eline battı ama kafes kapısını aralamayı başardı.'
              },
              {
                id: 'bend_bars',
                label: 'Demir parmaklıkları çıplak güçle bükerek Lyra\'yı dışarı çek',
                approachTag: 'Kaba Kuvvet',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'kahin_kurtarildi',
                grantItem: 'Ejderha Bağı Tılsımı',
                successText:
                  'demir parmaklıkları kağıt gibi büktü ve Kahin Lyra\'yı özgürlüğüne kavuşturdu!',
                failText:
                  'parmaklıklardaki büyü şokuna kapıldı.'
              },
              {
                id: 'demand_prophecy',
                label: 'Önce hazine yerini söylemesini şart koşarak pazarlık yap',
                approachTag: 'Çıkar Odaklı',
                stat: 'karizma',
                difficulty: 11,
                goldReward: 35,
                setFlag: 'kahin_kurtarildi',
                successText:
                  'Lyra\'dan hem gizli hazine zulası bilgisini (+35 Altın) hem de iç tapınak şifresini aldı!',
                failText:
                  'Lyra açgözlülüğünüzden hayal kırıklığına uğradı ve sadece temel yolu tarif etti.'
              }
            ]
          },
          {
            id: 'task_alchemist_vault',
            title: 'Baş Simyacının Özel Kasasını Araştır',
            summary: 'Masada şifreli bir sandık ve Kızıl Tarikat\'ın ayin günlüğü duruyor.',
            icon: 'BookOpen',
            recommendedStat: 'zeka',
            encounterText:
              'Baş Simyacının çalışma masasında hem kristal bir kasa hem de tarikatın iç hesaplaşmalarını anlatan mühürlü mektuplar var.',
            reactions: [
              {
                id: 'study_letters',
                label: 'Mektupları okuyup Tarikat Başrahibi Malakor\'un zayıf noktasını öğren',
                approachTag: 'İstihbarat & Strateji',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'malakor_sirri_biliniyor',
                successText:
                  'mektuplardan Başrahip Malakor\'un kendi müritlerini kurban edeceğini kanıtlayan belgeleri ele geçirdi!',
                failText:
                  'şifreli metinleri tam çözemedi ama birkaç altın kese buldu.'
              },
              {
                id: 'loot_potions',
                label: 'Kasadaki tüm altınları ve simya bombalarını çantaya doldur',
                approachTag: 'Ganimet Avcısı',
                stat: 'ceviklik',
                difficulty: 11,
                goldReward: 40,
                grantItem: 'Simya Ateşi Bombası',
                successText:
                  'tuzak تellerini kesip 40 Altın ve "Simya Ateşi Bombası"nı ele geçirdi!',
                failText:
                  'kasayı açarken uyku gazı tuzağını tetikledi.'
              },
              {
                id: 'destroy_research',
                label: 'Tüm karanlık deneyleri ve veba formüllerini ateşe ver',
                approachTag: 'Onurlu Yıkım',
                stat: 'karizma',
                difficulty: 10,
                moraleDelta: 15,
                successText:
                  'karanlık laboratuvarı tamamen imha ederek krallığı gelecekteki vebalardan kurtardı!',
                failText:
                  'yangın beklenenden hızlı büyüyünce dumanların arasından zor çıktı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'act3_crossroads_sanctum',
          branchReason:
            'Su kemerlerinden elde ettiğiniz sırlar ve ekipmanlarla Tapınağın kalbindeki "Fısıldayan Kavşak"a ulaştınız!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 2B: KUŞATMA ROTASI (KANLI MUHAFIZ KIŞLASI)
      // ------------------------------------------------------------------------
      act2_siege_barracks: {
        id: 'act2_siege_barracks',
        actTitle: 'Perde II (Savaş Rotası) • Kanlı Muhafız Kışlası',
        title: 'Tarikat Şövalyeleri ve Tutsak Demirci',
        environmentTag: 'Yeraltı Kışlası • Sıcak Çatışma Bölgesi',
        narrative:
          'Ana kapıdan girdiğinizde meşalelerle aydınlanan geniş kışlada Kızıl Tarikat\'ın fanatik şövalyeleriyle burun buruna geliyorsunuz! Balkondan okçular nişan alıyor, ortada Zırhlı İnfazcı dikiliyor ve köşede zincirlenmiş Kraliyet Demircisi Orin silahlarınıza ulaşmaya çalışıyor.',
        tasks: [
          {
            id: 'task_executioner',
            title: 'Zırhlı İnfazcı ile Cephede Yüzleş',
            summary: 'Dev baltalı İnfazcı ekibin yolunu kesiyor; biri onu durdurmalı!',
            icon: 'Sword',
            recommendedStat: 'guc',
            encounterText:
              'İki metre boyundaki Zırhlı İnfazcı dev baltasını yere vurarak üzerine yürüyor. Arkasındaki geçit doğrudan iç tapınağa açılıyor.',
            reactions: [
              {
                id: 'duel_executioner',
                label: 'Teke tek düelloya davet edip zırhının eklem yerlerine saldır!',
                approachTag: 'Kahramanca Düello',
                stat: 'guc',
                difficulty: 12,
                grantItem: 'İnfazcının Kızıl Baltası',
                setFlag: 'infazci_yenildi',
                successText:
                  'destansı bir çarpışmada İnfazcıyı dize getirdi ve "İnfazcının Kızıl Baltası"nı ganimet aldı!',
                failText:
                  'İnfazcının ağır darbesiyle geriye savruldu ama ekibe geçecek alanı açtı.'
              },
              {
                id: 'chandelier_drop',
                label: 'Tavandaki devasa demir avizeyi İnfazcının tam tepesine düşür',
                approachTag: 'Çevresel Taktik',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'infazci_yenildi',
                successText:
                  'zinciri tek atışta koparıp tonluk avizeyi İnfazcının üzerine indirdi!',
                failText:
                  'zinciri ıskalayınca İnfazcının savurduğu baltadan zor kaçtı.'
              },
              {
                id: 'demoralize_troops',
                label: 'Tarikat şövalyelerine Başrahiplerinin onları ölüme terk ettiğini haykır',
                approachTag: 'Psikolojik Harp',
                stat: 'karizma',
                difficulty: 12,
                bonusFlag: 'tarikat_sifresi_alindi',
                setFlag: 'sovalyeler_dagildi',
                successText:
                  'tarikatın iç sırlarını yüzlerine vurunca şövalyeler şüpheye düşüp silah bıraktı!',
                failText:
                  'fanatikleri ikna edemedi ve çatışma şiddetlendi.'
              }
            ]
          },
          {
            id: 'task_blacksmith',
            title: 'Tutsak Kraliyet Demircisi Orin\'i Çöz',
            summary: 'Usta demirci zincirlerinden kurtulursa ekibin silahlarını rünlerle güçlendirebilir.',
            icon: 'Shield',
            recommendedStat: 'ceviklik',
            encounterText:
              'Usta Demirci Orin örsün yanında zincirlenmiş: "Çabuk zincirimi kırın! Ocağın yanındaki Ejderha Çeliği külçeleriyle silahlarınızı yenilmez yapayım!"',
            reactions: [
              {
                id: 'free_and_forge',
                label: 'Zincirleri kır ve Orin\'in silahlarınızı Ejderha Çeliğiyle dövmesine yardım et',
                approachTag: 'Ekipman Güçlendirme',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'ejderha_celigi_silahlar',
                grantItem: 'Ejderha Çeliği Zırh',
                successText:
                  'Orin\'i kurtardı! Usta demirci ekibin silahlarını biledi ve size "Ejderha Çeliği Zırh" kuşandırdı!',
                failText:
                  'zincirleri kırarken zaman kaybetti, Orin sadece küçük bir onarım yapabildi.'
              },
              {
                id: 'steal_ingots',
                label: 'Orin\'i hızlıca çözüp ocaktaki altın ve değerli külçeleri çantaya at',
                approachTag: 'Hızlı Ganimet',
                stat: 'ceviklik',
                difficulty: 10,
                goldReward: 45,
                successText:
                  'hem demirciyi kurtardı hem de 45 altın değerindeki külçeleri topladı!',
                failText:
                  'kızgın demirlere elini değdirip yaralandı.'
              },
              {
                id: 'healing_salve',
                label: 'Demircinin revir dolabındaki askeri ilk yardım merhemlerini ekibe dağıt',
                approachTag: 'Destek & İyileştirme',
                stat: 'zeka',
                difficulty: 10,
                hpReward: 20,
                successText:
                  'revirdeki merhemlerle tüm ekibin yaralarını sardı (+20 HP)!',
                failText:
                  'merhemlerin yarısı çatışma sırasında kırıldı.'
              }
            ]
          },
          {
            id: 'task_archers',
            title: 'Balkondaki Okçu Birliği ve Komuta Masası',
            summary: 'Yukarıdaki okçular ekibe ateş açıyor; yanlarında tapınak planları var.',
            icon: 'Target',
            recommendedStat: 'zeka',
            encounterText:
              'Üst balkondaki üç arbaletçi aşağıya ok yağdırıyor. Hemen arkalarındaki komuta masasında iç tapınağın savunma düzeneklerini kontrol eden kollar var.',
            reactions: [
              {
                id: 'smoke_and_flank',
                label: 'Sis bombası atıp merdivenlerden sızarak okçuları arkadan avla',
                approachTag: 'Taktik Sızma',
                stat: 'ceviklik',
                difficulty: 12,
                setFlag: 'ic_savunma_kapali',
                successText:
                  'okçuları tek tek indirdi ve komuta kollarını çekerek iç tapınaktaki tüm ok tuzaklarını kapattı!',
                failText:
                  'merdivenleri çıkarken bir arbalet okunun omzunu sıyırmasına engel olamadı.'
              },
              {
                id: 'arcane_barrage',
                label: 'Balkonun taş korkuluklarını büyü/patlayıcı ile havaya uçur',
                approachTag: 'Yıkıcı Güç',
                stat: 'zeka',
                difficulty: 12,
                bonusItem: 'Karanlık Kor Küresi',
                successText:
                  'balkonu tek hamlede çökertip okçu tehdidini tamamen bitirdi!',
                failText:
                  'büyü hedefi şaşınca sadece korkulukları sarstı.'
              },
              {
                id: 'shield_wall_advance',
                label: 'Kalkan duvarı kurup ok yağmuru altında komuta masasını ele geçir',
                approachTag: 'Siper & Dayanıklılık',
                stat: 'guc',
                difficulty: 11,
                successText:
                  'okları kalkanıyla savuşturup balkonu zapt etti!',
                failText:
                  'ok yağmuru altında ilerlerken hafif yaralandı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'act3_crossroads_sanctum',
          branchReason:
            'Kışladaki direnişi yararak tapınağın kalbindeki "Fısıldayan Kavşak" salonuna ulaştınız!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 3: FISILDAYAN KAVŞAK VE KONSEY SALONU (ORTAK DÜĞÜM + YENİ DALLANMA)
      // ------------------------------------------------------------------------
      act3_crossroads_sanctum: {
        id: 'act3_crossroads_sanctum',
        actTitle: 'Perde III • Fısıldayan Kavşak',
        title: 'Kadim Ruh Muhafızı ve İki Yol',
        environmentTag: 'Yeraltı Kavşağı • Kritik Yol Ayrımı',
        narrative:
          'İç tapınağın öncesindeki devasa kubbeli kavşağa vardınız. Önünüzde iki farklı yol uzanıyor: Biri müritlerin ilahiler söylediği "Kızıl Sunak Koridoru", diğeri ise lav nehirlerinin aktığı "Ejderha Yuvası Yamaçları". Tam ortada ise Kadim Ruh Muhafızı, Kanlı Sunak Taşı ve Tarikat Hazine Arabası duruyor!',
        tasks: [
          {
            id: 'task_spirit_guardian',
            title: 'Kadim Ruh Muhafızı ile Yüzleş',
            summary: 'Yarı saydam Kral Ruhu geçişi tutuyor ve niyetinizi tartıyor.',
            icon: 'Crown',
            recommendedStat: 'karizma',
            encounterText:
              'Valoria\'nın ilk kralının ruhu kılıcını yere saplamış: "Yüzyıllardır kimse bu eşiği geçemedi. Kristali ne için istiyorsunuz? Güç için mi, kurtuluş için mi?"',
            reactions: [
              {
                id: 'plead_salvation',
                label: 'Halkı vebadan kurtarmak ve dengeyi sağlamak için geldiğinize yemin et',
                approachTag: 'Onurlu Diplomasi',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'su_aritildi',
                setFlag: 'kral_kutsamasi',
                grantItem: 'Valoria Kraliyet Tacı',
                hpReward: 15,
                successText:
                  'samimiyetiyle Kralın Ruhunu etkiledi! Ruh size "Valoria Kraliyet Tacı"nı bahşetti ve ekibi kutsadı (+15 HP).',
                failText:
                  'Kralın Ruhu sözlerinizde tereddüt sezdi ve soğuk bir rüzgarla canınızı yaktı.'
              },
              {
                id: 'answer_ancient_riddle',
                label: 'Kralın sorduğu kadim bilmeceyi tarihsel bilgilerle yanıtla',
                approachTag: 'Bilgelik & Tarih',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'kral_kutsamasi',
                successText:
                  'Valoria tarihinin unutulmuş yasasını ezbere okuyarak Muhafızın saygısını kazandı!',
                failText:
                  'tarihsel detayı yanlış hatırlayınca Muhafızın ruhsal sınavından hasar aldı.'
              },
              {
                id: 'banish_spirit',
                label: 'Ruhu rünlerle mühürleyip gücünü silahlarınıza aktar',
                approachTag: 'Baskın & Güç Odaklı',
                stat: 'guc',
                difficulty: 13,
                setFlag: 'ruh_muhurlendi',
                successText:
                  'Kralın Ruhunu kılıcına hapsederek muazzam bir karanlık güç elde etti!',
                failText:
                  'Ruhun öfkeli darbesiyle sarsıldı.'
              }
            ]
          },
          {
            id: 'task_cult_caravan',
            title: 'Tarikatın Hazine ve İkmal Arabasını Ele Geçir',
            summary: 'İki tarikat rahibi kutsal emanetleri iç salona taşımaya çalışıyor.',
            icon: 'Coins',
            recommendedStat: 'ceviklik',
            encounterText:
              'Tekerlekli zırhlı arabada altın sandıkları, Tarikat Cübbeleri ve Başrahip Malakor\'un ritüel asası taşınıyor!',
            reactions: [
              {
                id: 'disguise_cultists',
                label: 'Rahipleri bayıltıp Tarikat Cübbelerini ekip için ele geçir',
                approachTag: 'Kılık Değiştirme & Sızma',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'tarikat_kilik_degistirme',
                grantItem: 'Kızıl Tarikat Cübbesi',
                goldReward: 25,
                successText:
                  'rahipleri sessizce etkisiz hale getirdi! Ekip için "Kızıl Tarikat Cübbesi" ve 25 Altın ele geçirildi.',
                failText:
                  'rahiplerden biri kaçarken arabayı devirdi.'
              },
              {
                id: 'seize_ritual_staff',
                label: 'Arabadaki Ritüel Asasını ve altın sandığını zorla zapt et',
                approachTag: 'Doğrudan Baskın',
                stat: 'guc',
                difficulty: 11,
                goldReward: 50,
                grantItem: 'Güneş Asası',
                successText:
                  'muhafızları savurup 50 Altın ve "Güneş Asası"nı ele geçirdi!',
                failText:
                  'sandıktaki koruyucu rün patlayınca yaralandı.'
              },
              {
                id: 'turn_acolytes',
                label: 'Genç müritlere Malakor\'un gerçek yüzünü gösterip onları yanınıza çek',
                approachTag: 'İkna & İttifak',
                stat: 'karizma',
                difficulty: 12,
                bonusFlag: 'malakor_sirri_biliniyor',
                setFlag: 'murit_isyani',
                successText:
                  'müritleri gerçeğe uyandırdı! Genç rahipler Başrahip Malakor\'a karşı sizin yanınızda savaşmaya karar verdi!',
                failText:
                  'müritler korkudan ne yapacaklarını şaşırıp kaçıştı.'
              }
            ]
          },
          {
            id: 'task_scout_paths',
            title: 'İlerideki İki Rotayı (Sunak vs. Ejderha Yamaçları) Keşfet',
            summary: 'Ekibin hangi yoldan gideceğini belirleyecek mekanizmayı kontrol et.',
            icon: 'Compass',
            recommendedStat: 'zeka',
            encounterText:
              'Kavşaktaki dev taş pusula iki geçitten birinin kapısını açıyor: Sol geçit Başrahip Malakor\'un ayin yaptığı Kızıl Sunak\'a, sağ geçit ise doğrudan Ejderha Ignis\'in uyuduğu Lav Yamaçlarına çıkıyor.',
            reactions: [
              {
                id: 'open_sanctum_route',
                label: 'Pusulanın mührünü "Kızıl Sunak" yönüne çevir (Önce Tarikat Liderini durdur!)',
                approachTag: 'Rota: Kızıl Sunak',
                stat: 'zeka',
                difficulty: 10,
                setFlag: 'rota_sunak_secildi',
                successText:
                  'mekanizmayı çözdü ve Başrahip Malakor\'un ayinini basmak üzere Kızıl Sunak kapısını açtı!',
                failText:
                  'mekanizmayı zorlarken taş dişlilerden hasar aldı ama Sunak kapısı açıldı.'
              },
              {
                id: 'open_lair_route',
                label: 'Pusulanın mührünü "Lav Yamaçları" yönüne çevir (Doğrudan Ejderha Yuvasına in!)',
                approachTag: 'Rota: Ejderha Yamaçları',
                stat: 'ceviklik',
                difficulty: 10,
                setFlag: 'rota_ejderha_secildi',
                successText:
                  'gizli zincirleri çekerek doğrudan Ejderha Ignis\'in bulunduğu Lav Yamaçları geçidini açtı!',
                failText:
                  'sıcak buhar borusuna denk geldi ama Lav Yamaçları kapısını araladı.'
              },
              {
                id: 'unlock_both_shortcuts',
                label: 'Aether enerjisiyle her iki geçit arasındaki gizli balkon bağlantısını aç',
                approachTag: 'Taktik Üstünlük',
                stat: 'zeka',
                difficulty: 13,
                setFlag: 'ust_balkon_avantaji',
                successText:
                  'hem geçidi açtı hem de sonraki bölümde ekibe büyük avantaj sağlayacak üst balkon yolunu aktifleştirdi!',
                failText:
                  'enerji dalgalanması yüzünden zorlandı.'
              }
            ]
          }
        ],
        resolveNextScene: (state) => {
          if (
            state.flags.includes('rota_ejderha_secildi') &&
            !state.flags.includes('rota_sunak_secildi')
          ) {
            return {
              nextSceneId: 'act4_dragon_cliffs',
              branchReason:
                'Ekibiniz pusulayı Lav Yamaçlarına çevirdi! Tarikat ayinini atlayıp doğrudan Ejderha Ignis\'in uyuduğu "Kızıl Lav Yamaçları"na iniyorsunuz!'
            };
          }
          return {
            nextSceneId: 'act4_blood_altar',
            branchReason:
              'Ekibiniz önce Başrahip Malakor\'un karanlık ritüelini durdurmak üzere "Kızıl Sunak Salonu"na yürüyor!'
          };
        }
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 4A: KIZIL SUNAK SALONU (BAŞRAHİP MALAKOR)
      // ------------------------------------------------------------------------
      act4_blood_altar: {
        id: 'act4_blood_altar',
        actTitle: 'Perde IV (Sunak Rotası) • Kızıl Sunak Salonu',
        title: 'Başrahip Malakor\'un Kan Ritüeli',
        environmentTag: 'Ayin Salonu • Ejderhayı Kontrol Eden Mühür',
        narrative:
          'Devasa Kızıl Sunak Salonuna girdiniz! Başrahip Malakor sunağın üzerinde havada asılı duran "Kan Mızrağı" ile aşağıdaki Ejderha Ignis\'in zihnini kontrol ediyor. Salonun iki yanında büyü kristalleri parlıyor ve muhafızlar sunağı koruyor.',
        tasks: [
          {
            id: 'task_malakor',
            title: 'Başrahip Malakor ile Yüzleş',
            summary: 'Ritüeli yöneten Malakor\'u durdurmadan mızrağın kontrolü kırılamaz.',
            icon: 'Sparkles',
            recommendedStat: 'karizma',
            encounterText:
              'Başrahip Malakor gözlerinden kızıl ışıklar saçarak size dönüyor: "Çok geç kaldınız! Ejderha Ignis\'in ateşiyle önce krallığı yakacağım, sonra küller üzerinde yeni bir imparatorluk kuracağım!"',
            reactions: [
              {
                id: 'expose_malakor',
                label: 'Malakor\'un ihanet mektuplarını ve cübbeli müttefiklerinizi ortaya çıkarıp müritlerini ona karşı ayaklandır!',
                approachTag: 'İsyan & İfşa',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'malakor_sirri_biliniyor',
                setFlag: 'malakor_devrildi',
                successText:
                  'Malakor\'un yalanlarını kanıtlarıyla ortaya döktü! Kendi müritleri Başrahibin üzerine çullanıp ritüeli bozdu!',
                failText:
                  'Malakor sesinizi büyüyle bastırıp karanlık bir yıldırım savurdu.'
              },
              {
                id: 'strike_malakor',
                label: 'Doğrudan sunağa sıçrayıp Malakor\'un ritüel asasını ikiye böl!',
                approachTag: 'Suikast & Hücum',
                stat: 'guc',
                difficulty: 12,
                bonusFlag: 'ejderha_celigi_silahlar',
                setFlag: 'malakor_devrildi',
                grantItem: 'Malakor\'un Karanlık Mührü',
                successText:
                  'tek bir sıçrayışla sunağa çıktı ve Malakor\'u yere serip Karanlık Mührünü aldı!',
                failText:
                  'Malakor\'un büyü kalkanına çarpıp geriye düştü.'
              },
              {
                id: 'counter_spell',
                label: 'Malakor\'un büyüsünü kendi rünlerinizle tersine çevirip onu taşa dönüştür',
                approachTag: 'Büyü Düellosu',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'malakor_devrildi',
                successText:
                  'kusursuz bir karşı-büyü ile Malakor\'u kendi karanlık enerjisiyle dondurdu!',
                failText:
                  'büyü çatışmasında enerji patlamasından hasar aldı.'
              }
            ]
          },
          {
            id: 'task_blood_spear',
            title: 'Havada Asılı Duran Kan Mızrağını Zapt Et',
            summary: 'Ejderha Ignis\'i çıldırtan lanetli mızrak sunağın merkezinde dönüyor.',
            icon: 'Sword',
            recommendedStat: 'zeka',
            encounterText:
              'Kan Mızrağı şiddetli bir enerjiyle titriyor. Onu kırarsan Ejderha özgür kalır; onu ele geçirirsen Ejderhaya hükmedebilirsin!',
            reactions: [
              {
                id: 'shatter_spear',
                label: 'Kan Mızrağını kırarak Ejderha Ignis\'in zihnini lanetten kurtar!',
                approachTag: 'Özgürlük & Kurtuluş',
                stat: 'guc',
                difficulty: 12,
                bonusFlag: 'kral_kutsamasi',
                setFlag: 'ejderha_ozgur_kaldi',
                successText:
                  'Kan Mızrağını paramparça etti! Aşağıdaki mağaradan Ejderha Ignis\'in minnet dolu kükremesi duyuldu!',
                failText:
                  'mızrağa vururken lanetli enerjiden ağır bir sarsıntı geçirdi.'
              },
              {
                id: 'claim_spear',
                label: 'Mızrağı kendi kanınla mühürleyip Ejderhanın kontrolünü ele geçir (-10 HP)',
                approachTag: 'Mutlak Hakimiyet',
                stat: 'zeka',
                difficulty: 12,
                costHp: 10,
                setFlag: 'ejderha_itaat_altinda',
                grantItem: 'Hükmedici Kan Mızrağı',
                successText:
                  'Kan Mızrağının efendisi oldu! Artık Kızıl Ejderha üzerinde doğrudan söz hakkına sahipsiniz!',
                failText:
                  'mızrağın iradesi çok güçlü çıktı ve elini yaktı.'
              },
              {
                id: 'siphon_spear_gold',
                label: 'Mızrağın etrafındaki saf kristal cevherlerini ve adak altınlarını topla',
                approachTag: 'Hazine Odaklı',
                stat: 'ceviklik',
                difficulty: 10,
                goldReward: 50,
                successText:
                  'sunaktaki 50 altın değerindeki saf kristalleri çantaya indirdi!',
                failText:
                  'kristalleri alırken enerji akımına kapıldı.'
              }
            ]
          },
          {
            id: 'task_altar_guards',
            title: 'Elit Sunak Muhafızlarını Tut',
            summary: 'Arkadaşların ritüelle uğraşırken Elit Muhafızları durdurmalısın.',
            icon: 'Shield',
            recommendedStat: 'ceviklik',
            encounterText:
              'Dört Elit Kızıl Muhafız mızraklarını doğrultmuş sunağa doğru koşuyor!',
            reactions: [
              {
                id: 'bluff_infiltrator',
                label: 'Tarikat Cübbesi / Parolası ile muhafızlara "Dış kapıya koşun, tuzak var!" diye emir ver',
                approachTag: 'Blöf & Aldatma',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'tarikat_kilik_degistirme',
                successText:
                  'muhafızları tek kelimesiyle kandırıp salondan dışarı gönderdi!',
                failText:
                  'muhafızlar numarayı yutmadı ve saldırıya geçti.'
              },
              {
                id: 'oil_trap',
                label: 'Sunak basamaklarına kandil yağı döküp muhafızları ateşe ver',
                approachTag: 'Taktik Tuzak',
                stat: 'ceviklik',
                difficulty: 11,
                successText:
                  'basamakları alev duvarına çevirerek muhafızların sunağa yaklaşmasını imkansız kıldı!',
                failText:
                  'kandili fırlatırken alevlerin arasında kaldı.'
              },
              {
                id: 'hold_the_stairs',
                label: 'Basamakların başında tek başına durup hiçbir muhafızı geçirme!',
                approachTag: 'Cesur Savunma',
                stat: 'guc',
                difficulty: 12,
                successText:
                  'basamaklarda adeta bir kale gibi durarak tüm muhafızları geri püskürttü!',
                failText:
                  'muhafızları tuttu ama mızrak darbelerinden yaralandı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'act5_final_sanctum',
          branchReason:
            'Kızıl Sunak\'taki eylemleriniz Ejderha Ignis\'in kaderini değiştirdi! Şimdi son perde için "Kızıl Kristal Tahtı"na iniyorsunuz!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 4B: EJDERHA YAMAÇLARI (DOĞRUDAN İNİŞ ROTASI)
      // ------------------------------------------------------------------------
      act4_dragon_cliffs: {
        id: 'act4_dragon_cliffs',
        actTitle: 'Perde IV (Ejderha Rotası) • Lav Yamaçları',
        title: 'Uyuyan Ejderha Ignis ve Hazine Mağarası',
        environmentTag: 'Volkanik Mağara • Devasa Hazine & Tehlike',
        narrative:
          'Lav nehirlerinin aydınlattığı devasa mağara yamaçlarına indiniz! Aşağıda dağ kadar büyük Kızıl Ejderha Ignis huzursuzca uyuyor; göğsüne saplanmış lanetli bir mızrak parlıyor. Yamaçta ise Antik Balista Kulesi, Ejderha Yumurtası Yuvası ve Hazine Yığını var!',
        tasks: [
          {
            id: 'task_cursed_wound',
            title: 'Uyuyan Ejderhanın Göğsündeki Lanetli Mızrağa Yaklaş',
            summary: 'Ejderha uyanmadan göğsündeki karanlık mızrağı çıkarabilir veya daha derine saplayabilirsin!',
            icon: 'Heart',
            recommendedStat: 'ceviklik',
            encounterText:
              'Ejderha Ignis\'in her nefesi mağarayı ısıtıyor. Göğsündeki pulların arasında Kızıl Tarikat\'ın sapladığı zihin kontrol mızrağı var.',
            reactions: [
              {
                id: 'extract_spear_gently',
                label: 'Kahin tılsımı / sessiz adımlarla yaklaşıp lanetli mızrağı ejderhanın kalbinden çekip çıkar!',
                approachTag: 'Merhamet & Cesaret',
                stat: 'ceviklik',
                difficulty: 12,
                bonusFlag: 'kahin_kurtarildi',
                setFlag: 'ejderha_ozgur_kaldi',
                successText:
                  'nefesini tutarak lanetli mızrağı çekip çıkardı! Ejderha Ignis acıdan kurtulup size minnetle baktı!',
                failText:
                  'mızrağa dokunduğunda ejderha acıyla kükreyip pençesini savurdu!'
              },
              {
                id: 'drive_spear_deeper',
                label: 'Mızrağı tüm gücünle daha derine saplayıp ejderhayı ağır yarala!',
                approachTag: 'Acımasız Saldırı',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'ejderha_agir_yarali',
                successText:
                  'mızrağı ejderhanın zırhına gömdü! Ignis final karşılaşmasına yarı güçte başlayacak!',
                failText:
                  'ejderha uyanıp kuyruk darbesiyle onu kayalara fırlattı.'
              },
              {
                id: 'soothe_dragon_mind',
                label: 'Kadim Ejderha lisanında konuşarak Ignis\'in zihnini sakinleştir',
                approachTag: 'Büyü & Empati',
                stat: 'karizma',
                difficulty: 12,
                bonusFlag: 'kahin_kurtarildi',
                setFlag: 'ejderha_dostu',
                successText:
                  'Ignis\'in zihnindeki kabusları dindirdi! Kadim ejderha sizi müttefiki olarak tanıdı!',
                failText:
                  'lanetin etkisi çok güçlü olduğu için ejderha hırlayarak uyandı.'
              }
            ]
          },
          {
            id: 'task_ancient_ballista',
            title: 'Yamacın Tepesindeki Antik Ejderha-Avcısı Balistasını Hazırla',
            summary: 'Bozuk dev tatar yayını onarırsanız finalde devasa üstünlük sağlarsınız.',
            icon: 'Target',
            recommendedStat: 'zeka',
            encounterText:
              'Cüce ustaların yüzyıllar önce inşa ettiği dev zıpkın kulesinin dişlileri sıkışmış.',
            reactions: [
              {
                id: 'repair_ballista',
                label: 'Dişli mekanizmasını onar ve dev rünlü zıpkını nişan al',
                approachTag: 'Mühendislik',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'balista_hazir',
                successText:
                  'antik balistayı çalışır hale getirdi! Finalde istediğiniz an ateşlenmeye hazır!',
                failText:
                  'yay teli kopunca kolunu sıyırdı.'
              },
              {
                id: 'load_explosive_bolts',
                label: 'Zıpkın ucuna simya patlayıcıları bağlayarak yıkım gücünü ikiye katla',
                approachTag: 'Ağır Silah',
                stat: 'ceviklik',
                difficulty: 12,
                setFlag: 'balista_hazir',
                grantItem: 'Ejderha Avcısı Zıpkını',
                successText:
                  'patlayıcı zıpkını hazırladı ve ekstra mühimmatı yanına aldı!',
                failText:
                  'barut parlamasından hafif yaralandı.'
              },
              {
                id: 'brace_tower',
                label: 'Çökmekte olan kule platformunu taş bloklarla destekle',
                approachTag: 'Fiziksel Güç',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'balista_hazir',
                successText:
                  'kuleyi sağlamlaştırarak ekibe güvenli bir siper noktası oluşturdu!',
                failText:
                  'taşları taşırken yoruldu.'
              }
            ]
          },
          {
            id: 'task_dragon_hoard',
            title: 'Altın Yığını ve Ejderha Yumurtası Yuvası',
            summary: 'Hazine tepesinin ortasında parlayan bir Ejderha Yumurtası ve paha biçilmez yadigarlar var.',
            icon: 'Coins',
            recommendedStat: 'karizma',
            encounterText:
              'Dağ gibi yığılmış altınların ortasında çatlamak üzere olan kızıl bir Ejderha Yumurtası duruyor. Yanında ise efsanevi Alev Kalkanı var.',
            reactions: [
              {
                id: 'protect_egg',
                label: 'Lav akıntısına düşmek üzere olan Ejderha Yumurtasını kurtarıp güvenli yuvaya koy',
                approachTag: 'Soylu Davranış',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'yumurta_kurtarildi',
                moraleDelta: 20,
                successText:
                  'Ejderha Yumurtasını lavlardan kurtardı! Anne ejderha Ignis bu iyiliği asla unutmayacak!',
                failText:
                  'yumurtayı kurtarırken lav sıcaklığından eli yandı ama yumurta güvende!'
              },
              {
                id: 'take_flame_shield',
                label: 'Hazine yığınından "Efsanevi Alev Kalkanı"nı ve 60 Altını al',
                approachTag: 'Hazine & Zırh',
                stat: 'guc',
                difficulty: 11,
                goldReward: 60,
                grantItem: 'Alev Kalkanı',
                successText:
                  '60 Altın ve ejderha ateşinden koruyan "Alev Kalkanı"nı kuşandı!',
                failText:
                  'altın yığını kayınca gürültü çıkardı.'
              },
              {
                id: 'steal_egg',
                label: 'Paha biçilmez Ejderha Yumurtasını krallıkta satmak üzere çantana at (+80 Altın)',
                approachTag: 'Açgözlü & Riskli',
                stat: 'ceviklik',
                difficulty: 12,
                goldReward: 80,
                setFlag: 'ejderha_ofkeli',
                successText:
                  '80 altın değerindeki yumurtayı çaldı! Ancak Ignis kokusunu alırsa gazabı korkunç olacak!',
                failText:
                  'yumurtayı alırken Ignis\'in kükremesiyle sarsıldı!'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'act5_final_sanctum',
          branchReason:
            'Lav Yamaçlarındaki hamleleriniz tamamlandı! Şimdi Kızıl Kristal\'in bulunduğu "Kristal Taht" final sahnesine geçiyorsunuz!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 5: FİNAL PERDESİ — KIZIL KRİSTAL TAHTI (ÇOKLU SONLAR)
      // ------------------------------------------------------------------------
      act5_final_sanctum: {
        id: 'act5_final_sanctum',
        actTitle: 'Final Perdesi • Kızıl Kristal Tahtı',
        title: 'Valoria\'nın Kaderi: Son Karar',
        environmentTag: 'Final Karşılaşması • Tüm Seçimlerinizin Sonucu',
        narrative:
          'Tapınağın en derinindeki Kristal Taht salonundasınız! Ortadaki sütunda Valoria\'yı kurtaracak devasa Kızıl Kristal parlıyor. Kadim Kızıl Ejderha Ignis kanatlarını açmış karşınızda duruyor, salonun kubbesi sarsılıyor ve Kızıl Tarikat\'ın son güçleri içeri dalıyor! Ekibin her üyesi son kader hamlesini seçmeli!',
        tasks: [
          {
            id: 'task_final_dragon',
            title: 'Kızıl Ejderha Ignis ile Son Yüzleşme',
            summary: 'Önceki bölümlerdeki seçimleriniz Ignis\'in size dost mu yoksa düşman mı olacağını belirledi!',
            icon: 'Flame',
            recommendedStat: 'karizma',
            encounterText:
              'Kadim Ejderha Ignis önünüzde yükseliyor. Önceki sahnelerde mızrağı kırdıysanız veya yumurtasını kurtardıysanız gözlerinde minnet var; aksi halde alevleri salonu kavurmak üzere!',
            reactions: [
              {
                id: 'forge_dragon_pact',
                label: 'Ignis ile kadim barış anlaşması yapıp onu Valoria\'nın koruyucusu ilan et',
                approachTag: 'Efsanevi Barış Sonu',
                stat: 'karizma',
                difficulty: 12,
                bonusFlag: 'ejderha_ozgur_kaldi',
                setFlag: 'son_ejderha_ittifaki',
                successText:
                  'Kadim Ejderha Ignis ile efsanevi bir ittifak kurdu! Ignis başını eğerek ekibinizi sırtına aldı ve Tarikat ordusunu tek nefeste küle çevirdi!',
                failText:
                  'Ignis\'i tam ikna edemedi ama ejderhanın saldırısını savuşturdu.'
              },
              {
                id: 'slay_or_subdue_dragon',
                label: 'Tüm silahlarınızı ve Balistayı kullanarak Ejderhayı dize getir!',
                approachTag: 'Ejderha Avcısı Sonu',
                stat: 'guc',
                difficulty: 13,
                bonusFlag: 'balista_hazir',
                setFlag: 'son_ejderha_avcisi',
                goldReward: 50,
                successText:
                  'destansı bir darbeyle Kızıl Ejderha Ignis\'i mağlup etti ve adını tarihe "Ejderha Avcısı" olarak yazdırdı!',
                failText:
                  'ejderhanın alev nefesinden ağır hasar aldı ama geri adım atmadı!'
              },
              {
                id: 'command_dragon_throne',
                label: 'Kan Mızrağı / Karanlık Mühür ile Ejderhaya boyun eğdirip tahtı kendin için al!',
                approachTag: 'Karanlık Hükümdar Sonu',
                stat: 'zeka',
                difficulty: 13,
                bonusFlag: 'ejderha_itaat_altinda',
                setFlag: 'son_karanlik_hukumdar',
                successText:
                  'Ejderha Ignis\'i kendi iradesine bağladı! Artık Valoria Krallığı sizin yeni düzeninize boyun eğecek!',
                failText:
                  'kontrol büyüsü geri tepti ve ejderha zincirlerini kırdı!'
              }
            ]
          },
          {
            id: 'task_crimson_crystal',
            title: 'Kızıl Kristal Çekirdeğini Çıkar',
            summary: 'Kristal sütundan sökülürken tapınak çökmeye başlayacak; nasıl alacaksın?',
            icon: 'Sparkles',
            recommendedStat: 'zeka',
            encounterText:
              'Kızıl Kristal saf yaşam ve ateş enerjisiyle parlıyor. Sütundaki tuzak mekanizması kristali koruyor.',
            reactions: [
              {
                id: 'stabilize_crystal',
                label: 'Kraliyet Tacı / Mühür Taşı ile sütunu dengeleyip Kristali tek çizik almadan çıkar',
                approachTag: 'Kusursuz Kurtarma',
                stat: 'zeka',
                difficulty: 11,
                bonusFlag: 'kral_kutsamasi',
                setFlag: 'kristal_saf_alindi',
                hpReward: 20,
                successText:
                  'Kızıl Kristal\'i tam gücüyle çıkardı! Kristalin saf ışığı tüm ekibi iyileştirdi (+20 HP)!',
                failText:
                  'kristali çıkardı ancak yayılan enerji dalgası salonu sarstı.'
              },
              {
                id: 'swap_weight_heist',
                label: 'Çevik bir hamleyle kristali kapıp yerine ağırlık taşı bırak',
                approachTag: 'Usta Hırsız Hamlesi',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'kristal_saf_alindi',
                goldReward: 40,
                successText:
                  'göz açıp kapayıncaya kadar Kızıl Kristal\'i ve yanındaki kraliyet mücevherlerini (+40 Altın) kaptı!',
                failText:
                  'tuzak tetiklendi ama kristali elinden bırakmadı!'
              },
              {
                id: 'shatter_and_share',
                label: 'Kristali kırıp saf enerjisini doğrudan ekip üyelerinin bedenine aktar!',
                approachTag: 'Yarı-Tanrı Gücü',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'kristal_gucu_emildi',
                successText:
                  'Kızıl Kristal\'in kadim gücünü ekibin damarlarına aktardı! Artık her biriniz yenilmez birer efsanesiniz!',
                failText:
                  'kristalin yoğun enerjisi bedeni zorladı.'
              }
            ]
          },
          {
            id: 'task_escape_collapse',
            title: 'Çöken Tapınaktan Kaçış Yolu Aç',
            summary: 'Kubbeden dev kayalar düşüyor; ekibi sağ salim gün ışığına çıkarmalısın!',
            icon: 'Footprints',
            recommendedStat: 'ceviklik',
            encounterText:
              'Tapınak kubbesi çökmeye başladı! Dışarıya açılan ışık huzmesine ulaşmak için son engel önünüzde.',
            reactions: [
              {
                id: 'grappling_escape',
                label: 'Işık yarığına halat fırlatıp tüm ekibi çöken molozların arasından yukarı çek',
                approachTag: 'Hızlı Tahliye',
                stat: 'ceviklik',
                difficulty: 11,
                successText:
                  'halat düzeneğiyle tüm ekibi saniyeler içinde yeryüzüne, şafak ışığına çıkardı!',
                failText:
                  'yukarı tırmanırken düşen taşlardan sıyrık aldı ama çıkışı açtı.'
              },
              {
                id: 'hold_archway',
                label: 'Çöken çıkış kemerini omuzlarınla tutup ekibin tamamı geçene kadar dayan!',
                approachTag: 'Kahramanca Fedakarlık',
                stat: 'guc',
                difficulty: 11,
                successText:
                  'efsanevi bir güçle tonlarca ağırlıktaki kemeri tutarak tüm arkadaşlarının sağ çıkmasını sağladı!',
                failText:
                  'kemeri tutarken yaralandı ama kimseyi geride bırakmadı!'
              },
              {
                id: 'rally_allies_escape',
                label: 'Kurtardığınız müttefikleri (Vael / Lyra / Müritler) yardıma çağırıp güvenli geçidi açtır',
                approachTag: 'Müttefik Desteği',
                stat: 'karizma',
                difficulty: 10,
                bonusFlag: 'vael_yasadi',
                successText:
                  'yol boyunca kazandığınız müttefikler halatlar ve kalkanlarla yardıma koşup sizi zaferle karşıladı!',
                failText:
                  'kendi çabanızla dumanların arasından gün ışığına çıktınız.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: null,
          branchReason: 'Valoria Destanı tamamlandı!'
        })
      }
    }
  },

  // ============================================================================
  // SENARYO 2: NEON SIZINTISI — 2099 SİBER SOYGUN (CYBERPUNK / BİLİM KURGU)
  // ============================================================================
  neon_sizintisi: {
    id: 'neon_sizintisi',
    name: 'Neon Sızıntısı: 2099 Kuantum Vurgunu',
    theme: 'Cyberpunk • Casusluk & Taktik Soygun',
    description:
      'Yıl 2099, Neo-İstanbul. Mega-Şirket "KronoCorp" insanların anılarını ve bilinçlerini kontrol eden "AETHER-9" Kuantum Çekirdeğini 120. kattaki kasasında saklıyor. Ekibinizin aldığı her karar sızma rotasını, alarm seviyesini ve şehrin geleceğini belirleyecek!',
    initialHp: 100,
    initialGold: 100,
    initialMorale: 75,
    startSceneId: 'cyber1_rooftop',
    scenes: {
      // ------------------------------------------------------------------------
      // BÖLÜM 1: KULEYE GİRİŞ NOKTASI
      // ------------------------------------------------------------------------
      cyber1_rooftop: {
        id: 'cyber1_rooftop',
        actTitle: 'Perde I • Neon Yağmuru Altında Sızma',
        title: 'KronoCorp Kulesi: VIP Teras ve Güvenlik Ağı',
        environmentTag: '100. Kat VIP Teras • Yağmurlu Gece',
        narrative:
          'Uçan gizli kargo aracından KronoCorp Gökdeleninin 100. katındaki yağmurlu terasa indiniz. İçeride şirketin üst düzey yöneticileri için bir gala partisi var, çatı katında ise lazerli güvenlik dronları ve ana şebeke terminali bulunuyor. Kuleye nasıl sızacağınızı belirlemek için görev dağılımı yapın!',
        tasks: [
          {
            id: 'task_grid_terminal',
            title: 'Çatıdaki Ana Güvenlik Terminalini Hackle',
            summary: 'Kulenin biyometrik tarayıcılarını ve kamera ağını kontrol eden terminal.',
            icon: 'Sparkles',
            recommendedStat: 'zeka',
            encounterText:
              'Terminal ekranında KronoCorp\'un "Kara-Buz" (Black-ICE) güvenlik duvarı dönüyor. Kameraları döngüye alabilir, VIP davetli listesine adınızı ekleyebilir veya kule elektriğini patlatabilirsin.',
            reactions: [
              {
                id: 'inject_ghost_protocol',
                label: 'Sisteme "Hayalet Protokolü" yükleyip ekibi tüm kameralarda görünmez yap',
                approachTag: 'Kusursuz Sızma',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'hayalet_protokol_aktif',
                grantItem: 'Root Erişim Anahtarı',
                successText:
                  'Kara-Buz duvarını sessizce aştı! Ekibiniz artık kule kameralarında tamamen görünmez ("Hayalet Protokolü" aktif)!',
                failText:
                  'güvenlik duvarından nöral şok yedi ama kameraları 5 dakikalığına kararttı.'
              },
              {
                id: 'siphon_crypto_wallet',
                label: 'Güvenlik ağını oyalarken şirketin örtülü kripto hesabını kendi cüzdanınıza boşalt',
                approachTag: 'Siber Vurgun',
                stat: 'zeka',
                difficulty: 11,
                goldReward: 50,
                setFlag: 'kripto_çalindi',
                successText:
                  'şirket hesabından anında 50 Kredi/Altın değerinde kripto varlığı ekibin hesabına aktardı!',
                failText:
                  'transfer sırasında uyarı sinyali tetiklendi.'
              },
              {
                id: 'emp_overload',
                label: 'Terminale yüksek voltaj verip kattaki tüm elektronik kilitleri patlat!',
                approachTag: 'Agresif Sabotaj',
                stat: 'guc',
                difficulty: 10,
                setFlag: 'alarm_seviyesi_yuksek',
                successText:
                  'terminali havaya uçurdu! Tüm kilitler açıldı ancak kulede sarı alarm sirenleri çalmaya başladı!',
                failText:
                  'kıvılcım patlamasından elleri yandı.'
              }
            ]
          },
          {
            id: 'task_vip_executive',
            title: 'Balkonda Hava Alan Üst Düzey Yöneticiyi Kıstır',
            summary: 'Finans Direktörü Kaan Vural yalnız başına terasta sigara içiyor; cebinde VIP kartı var.',
            icon: 'Crown',
            recommendedStat: 'karizma',
            encounterText:
              'KronoCorp Direktörü Kaan Vural içkisini yudumluyor. Boynunda 115. kata çıkan Platin VIP Kartı ve retinada şifreli veri çipi var.',
            reactions: [
              {
                id: 'social_engineer_vip',
                label: 'Kendini Yönetim Kurulu Özel Denetçisi olarak tanıtıp VIP kartını ve şifreyi kendi eliyle vermesini sağla',
                approachTag: 'Sosyal Mühendislik',
                stat: 'karizma',
                difficulty: 11,
                setFlag: 'vip_kimlik_alindi',
                grantItem: 'Platin VIP Kartı',
                successText:
                  'Direktörü öyle ustaca ikna etti ki adam özür dileyerek "Platin VIP Kartı"nı ve özel asansör şifresini teslim etti!',
                failText:
                  'Direktör şüphelendi ve korumalarına seslenmeye çalıştı.'
              },
              {
                id: 'stealth_takedown_vip',
                label: 'Arkadan sessizce yaklaşıp Direktörü bayılt ve kıyafetlerini/kartını al',
                approachTag: 'Sessiz Operasyon',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'vip_kimlik_alindi',
                grantItem: 'Platin VIP Kartı',
                goldReward: 20,
                successText:
                  'Direktörü tek hamlede uyutup havalandırma arkasına sakladı; Platin VIP Kartı ve 20 Kredi ele geçirildi!',
                failText:
                  'boğuşma sırasında cam korkuluk çatladı.'
              },
              {
                id: 'interrogate_corruption',
                label: 'Direktörü teras kenarından sarkıtıp şirketin kirli sırlarını itiraf ettir',
                approachTag: 'Sert Sorgu',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'sirket_skandali_biliniyor',
                successText:
                  'korkudan titreyen Direktörden CEO\'nun gizli kasa kodunu ve skandal ses kaydını aldı!',
                failText:
                  'Direktör çığlık atınca içerideki korumalar terasa yöneldi.'
              }
            ]
          },
          {
            id: 'task_patrol_drones',
            title: 'Terastaki Silahlı Devriye Dronlarını Bertaraf Et',
            summary: 'İki adet "Akrep-X" muharebe dronu lazer taraması yapıyor.',
            icon: 'Target',
            recommendedStat: 'ceviklik',
            encounterText:
              'Kırmızı lazer gözlü iki muharebe dronu teras kapısının üstünde süzülüyor.',
            reactions: [
              {
                id: 'reprogram_drones',
                label: 'Sinyal bozucuyla dronların dost-düşman çipini değiştirip onları kendi korumanız yap',
                approachTag: 'Teknolojik Hakimiyet',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'dron_muttefik',
                grantItem: 'Dost Muharebe Dronu',
                successText:
                  'dronları hackledi! Artık iki silahlı dron operasyon boyunca ekibinizi koruyacak!',
                failText:
                  'sinyal kesilince dronlar ateş açtı.'
              },
              {
                id: 'acrobatic_dismantle',
                label: 'Korkuluklardan sıçrayıp dronların güç çekirdeklerini havada sök',
                approachTag: 'Siber-Akrobasi',
                stat: 'ceviklik',
                difficulty: 11,
                grantItem: 'Plazma Bataryası',
                successText:
                  'dronlar daha hedef kilitleyemeden ikisini de havada parçalayıp Plazma Bataryasını aldı!',
                failText:
                  'iniş yaparken kaygan zeminde dengesini kaybetti.'
              },
              {
                id: 'hurl_statue',
                label: 'Terastaki metal heykeli söküp dronların üzerine fırlat!',
                approachTag: 'Siber-Kas Gücü',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'alarm_seviyesi_yuksek',
                successText:
                  'metal heykelle iki dronu birden hurdaya çevirdi!',
                failText:
                  'dronların karşı ateşinden sıyrık aldı.'
              }
            ]
          }
        ],
        resolveNextScene: (state) => {
          if (
            (state.flags.includes('hayalet_protokol_aktif') ||
              state.flags.includes('vip_kimlik_alindi')) &&
            !state.flags.includes('alarm_seviyesi_yuksek')
          ) {
            return {
              nextSceneId: 'cyber2_vip_gala',
              branchReason:
                'VIP Kimlik ve Hayalet Protokolü sayesinde hiç alarm vermeden 110. kattaki "Yüksek Sosyete Gala Salonu ve Biyo-Laboratuvar" rotasından sızıyorsunuz!'
            };
          }
          return {
            nextSceneId: 'cyber2_mech_hangar',
            branchReason:
              'Çatıdaki sarsıntı güvenlik protokollerini tetikledi! Ekibiniz ağır zırhlı "Siber-Muhafız Hangarı ve Sunucu Şaftı" cephesinden ilerliyor!'
          };
        }
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 2A: GİZLİ SOSYETE ROTASI (VIP GALA & BİYO-LAB)
      // ------------------------------------------------------------------------
      cyber2_vip_gala: {
        id: 'cyber2_vip_gala',
        actTitle: 'Perde II (Gizli Rota) • 110. Kat Gala & Biyo-Lab',
        title: 'Maskeli Milyarderler ve Gizli Denekler',
        environmentTag: 'VIP Gala & Arka Laboratuvar • Gizlilik Aktif',
        narrative:
          'Platin VIP asansörüyle 110. kata çıktınız. Ön salonda hologram maskeli milyarderler şampanya içiyor; arka cam bölmede ise KronoCorp\'un zihin kontrol çipi taktığı tutsak muhalifler ve Baş Mühendis Dr. Selin var!',
        tasks: [
          {
            id: 'task_dr_selin',
            title: 'Baş Mühendis Dr. Selin ile Temas Kur',
            summary: 'AETHER-9 çekirdeğini tasarlayan bilim insanı vicdan azabı çekiyor.',
            icon: 'Heart',
            recommendedStat: 'karizma',
            encounterText:
              'Dr. Selin laboratuvar konsolunun başında elleri titreyerek bekliyor: "Şirket geliştirdiğim yapay zekayı insanların özgür iradesini silmek için kullanacak! Bana yardım ederseniz size arka kapı kodunu veririm!"',
            reactions: [
              {
                id: 'recruit_selin',
                label: 'Dr. Selin\'e koruma sözü verip AETHER-9\'un "Empati Anahtarı"nı al',
                approachTag: 'İttifak & Vicdan',
                stat: 'karizma',
                difficulty: 11,
                setFlag: 'selin_muttefik',
                grantItem: 'AETHER Empati Anahtarı',
                successText:
                  'Dr. Selin\'i ikna etti! Size "AETHER Empati Anahtarı"nı verdi ve güvenlik kapılarını uzaktan açmaya başladı!',
                failText:
                  'Dr. Selin korkudan tereddüt etti ama size temel laboratuvar kartını bıraktı.'
              },
              {
                id: 'copy_neural_blueprints',
                label: 'Selin\'in terminalinden AETHER-9\'un tüm mimari şemalarını kendi diskinize kopyala',
                approachTag: 'Veri Analizi',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'aether_semasi_alindi',
                successText:
                  'kuantum çekirdeğinin tüm zayıf noktalarını içeren şemaları indirdi!',
                failText:
                  'kopyalama %80\'de kesildi.'
              },
              {
                id: 'raid_cyberware_Drawer',
                label: 'Laboratuvardaki askeri sınıf Siber-İmplant çekmecesini yağmala',
                approachTag: 'Ekipman & Güçlendirme',
                stat: 'ceviklik',
                difficulty: 10,
                hpReward: 20,
                grantItem: 'Refleks Güçlendirici Çip',
                successText:
                  'ekibe askeri "Refleks Güçlendirici Çip" ve nano-onarıcılar (+20 HP) kazandırdı!',
                failText:
                  'kilitli çekmeceyi açarken zaman kaybetti.'
              }
            ]
          },
          {
            id: 'task_gala_auction',
            title: 'Gala Salonundaki Kara Borsa Müzayedesini Manipüle Et',
            summary: 'Milyarderler şirketin gizli veri disklerine açık artırmayla teklif veriyor.',
            icon: 'Coins',
            recommendedStat: 'karizma',
            encounterText:
              'Gala sahnesinde hologram sunucu, şehrin enerji şebekesi kodlarını açık artırmayla satıyor.',
            reactions: [
              {
                id: 'spoof_auction_funds',
                label: 'Müzayede terminalini hackleyip ödenen parayı ekibin hesabına yönlendir',
                approachTag: 'Finansal Vurgun',
                stat: 'zeka',
                difficulty: 12,
                goldReward: 65,
                successText:
                  'milyarderlerin ödediği 65 Kredi/Altını ruhları bile duymadan ekibin hesabına aktardı!',
                failText:
                  'müzayede ekranı hata verince dikkat çekti.'
              },
              {
                id: 'charm_syndicate_boss',
                label: 'Salondaki Yeraltı Sendikası Lideriyle kadeh tokuşturup kaçış aracı desteği bağla',
                approachTag: 'Diplomasi & Bağlantı',
                stat: 'karizma',
                difficulty: 11,
                setFlag: 'sendika_destegi',
                successText:
                  'Sendika Lideriyle anlaştı! Finalde çatıya zırhlı bir kaçış mekiği göndereceklerine söz verdiler!',
                failText:
                  'Sendika lideri "Önce işi bitirin, sonra konuşuruz" dedi.'
              },
              {
                id: 'pickpocket_vips',
                label: 'Kalabalığın arasında dolaşıp yöneticilerin kredi çiplerini ve güvenlik rozetlerini aşır',
                approachTag: 'El Çabukluğu',
                stat: 'ceviklik',
                difficulty: 11,
                goldReward: 40,
                successText:
                  'kimseye hissettirmeden 40 Kredi ve 3 adet güvenlik rozeti topladı!',
                failText:
                  'bir korumaya çarptı ama özür dileyip sıyrıldı.'
              }
            ]
          },
          {
            id: 'task_mind_prisoners',
            title: 'Zihin Kapsüllerindeki Tutsakları Kurtar',
            summary: 'Cam kapsüllerde tutulan 4 siber-direnişçi kurtarılırsa kulede kaos çıkarabilir.',
            icon: 'Shield',
            recommendedStat: 'guc',
            encounterText:
              'Cam kapsüllerdeki direnişçiler nöral kablolarla uyutuluyor.',
            reactions: [
              {
                id: 'safe_disconnect',
                label: 'Nöral kabloları doğru sırayla çıkarıp direnişçileri bilinci açık şekilde uyandır',
                approachTag: 'Kurtarma & Müttefik',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'direnisciler_ozgur',
                moraleDelta: 20,
                successText:
                  'direnişçileri güvenle uyandırdı! Özgür kalan ekip kulenin alt katlarında güvenlik güçlerini oyalamaya gitti!',
                failText:
                  'kapsüllerden biri alarm verdi ama tutsaklar kurtuldu.'
              },
              {
                id: 'smash_pods',
                label: 'Zırhlı kapsül camlarını yumruğunla kırıp tutsakları dışarı çek',
                approachTag: 'Kaba Kuvvet',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'direnisciler_ozgur',
                successText:
                  'kurşun geçirmez camları tuzla buz edip tutsakları özgür bıraktı!',
                failText:
                  'cam kırıklarından elini kesti.'
              },
              {
                id: 'overload_pods_distraction',
                label: 'Boş kapsülleri patlatarak güvenlik güçlerini yanlış kata çek',
                approachTag: 'Şaşırtmaca',
                stat: 'ceviklik',
                difficulty: 10,
                setFlag: 'guvenlik_yaniltildi',
                successText:
                  'sahte patlamayla tüm güvenlik timlerini 90. kata yönlendirdi; üst katların yolu tamamen açıldı!',
                failText:
                  'duman dedektörleri erken çalıştı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'cyber3_neural_nexus',
          branchReason:
            'Gala ve Biyo-Lab katındaki operasyonunuz tamamlandı! Şimdi 115. kattaki "Nöral Köprü ve Veri Kavşağı"na çıkıyorsunuz!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 2B: ÇATIŞMA ROTASI (SİBER-MUHAFIZ HANGARI)
      // ------------------------------------------------------------------------
      cyber2_mech_hangar: {
        id: 'cyber2_mech_hangar',
        actTitle: 'Perde II (Çatışma Rotası) • Siber-Muhafız Hangarı',
        title: 'Zırhlı Mech-Walker ve Lazer Koridoru',
        environmentTag: '108. Kat Askeri Hangar • Yüksek Gerilim',
        narrative:
          'Askeri yük asansöründen 108. kattaki Siber-Muhafız Hangarına çıktınız! Karşınızda ağır makineli tüfekli bir "Titan-Mech" robotu uyanıyor, koridorda ölümcül lazer ağları dönüyor ve kenarda şirketin Cephanelik Deposu duruyor!',
        tasks: [
          {
            id: 'task_titan_mech',
            title: 'Uyanmakta Olan Titan-Mech Robotunu Durdur',
            summary: 'Dev savaş robotu tam kapasiteye geçmeden müdahale edilmeli!',
            icon: 'Sword',
            recommendedStat: 'guc',
            encounterText:
              '3 metrelik Titan-Mech kokpitini kapatmak üzere! Üzerine tırmanabilir, kokpiti ele geçirebilir veya bacak hidroliklerini koparabilirsin.',
            reactions: [
              {
                id: 'hijack_mech',
                label: 'Kokpit kapanmadan içeri sıçrayıp pilotu dışarı at ve Mech\'in kontrolünü ele geçir!',
                approachTag: 'Zırhlı Araç Ele Geçirme',
                stat: 'ceviklik',
                difficulty: 12,
                setFlag: 'mech_ele_gecirildi',
                grantItem: 'Titan-Mech Zırhı',
                successText:
                  'inanılmaz bir çeviklikle kokpite atlayıp Titan-Mech\'i ele geçirdi! Artık ekibin emrinde dev bir savaş robotu var!',
                failText:
                  'kokpit kapağına çarptı ama Mech\'in ana silahını bozmayı başardı.'
              },
              {
                id: 'rip_hydraulics',
                label: 'Siber-kollarınla Mech\'in bacak hidroliklerini ve reaktörünü yerinden sök!',
                approachTag: 'Saf Yıkım',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'mech_yok_edildi',
                goldReward: 35,
                successText:
                  'dev robotun reaktörünü çıplak elleriyle söküp Titan-Mech\'i hurdaya çevirdi (+35 Kredi parça)!',
                failText:
                  'Mech\'in darbesiyle konteynere savruldu.'
              },
              {
                id: 'hack_mech_gyro',
                label: 'Mech\'in denge sensörlerini hackleyip kendi muhafızlarının üzerine devir',
                approachTag: 'Siber Sabotaj',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'mech_yok_edildi',
                successText:
                  'denge yazılımını çökertti; dev robot kendi muhafız birliğinin üzerine devrildi!',
                failText:
                  'bağlantı kopunca Mech rastgele ateş açtı.'
              }
            ]
          },
          {
            id: 'task_armory_cache',
            title: 'Askeri Cephanelik ve Nano-Revir İstasyonu',
            summary: 'Şirketin en gelişmiş prototip silahları ve tıbbi kitleri burada kilitli.',
            icon: 'Shield',
            recommendedStat: 'zeka',
            encounterText:
              'Cephanelik kapısında retina tarayıcısı var; içeride EMP el bombaları, nano-şifa tüpleri ve kredi kasası görünüyor.',
            reactions: [
              {
                id: 'equip_emp_arsenal',
                label: 'Cephaneliği açıp tüm ekibi Prototip EMP Silahları ve Zırhlarla donat',
                approachTag: 'Tam Teçhizat',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'emp_cephaneligi_alindi',
                grantItem: 'Prototip EMP Tüfeği',
                successText:
                  'tüm ekibi şirketin en gelişmiş "Prototip EMP Tüfeği" ve balistik kalkanlarıyla donattı!',
                failText:
                  'kilit zamanlamasına takıldı ama birkaç EMP bombası alabildi.'
              },
              {
                id: 'heal_at_nanomed',
                label: 'Nano-Revir kapsüllerini çalıştırıp ekibin tüm yaralarını anında tedavi et',
                approachTag: 'Tıbbi Destek',
                stat: 'karizma',
                difficulty: 10,
                hpReward: 25,
                successText:
                  'Nano-Revir istasyonunu aktif ederek ekibe +25 HP kazandırdı!',
                failText:
                  'tıbbi sistemin yarısı kilitli kaldı.'
              },
              {
                id: 'loot_military_payroll',
                label: 'Paralı askerlerin maaş kasasını patlatıp şifreli çipleri topla',
                approachTag: 'Ganimet',
                stat: 'guc',
                difficulty: 11,
                goldReward: 55,
                successText:
                  'çelik kasayı patlatıp 55 Kredi/Altın değerinde askeri çip ele geçirdi!',
                failText:
                  'kasa patlarken şarapnel sıyrığı aldı.'
              }
            ]
          },
          {
            id: 'task_laser_corridor',
            title: 'Hareketli Ölümcül Lazer Koridorunu Kapat',
            summary: 'Üst kata çıkan asansörün önü hareketli plazma lazerleriyle kaplı.',
            icon: 'Footprints',
            recommendedStat: 'ceviklik',
            encounterText:
              'Lazer ağları saniyede üç kez desen değiştiriyor. Karşı duvardaki ana şaltere ulaşmak şart.',
            reactions: [
              {
                id: 'parkour_lasers',
                label: 'Duvarlarda koşup lazerlerin arasından akrobatik taklalarla geçerek şalteri indir',
                approachTag: 'Efsanevi Çeviklik',
                stat: 'ceviklik',
                difficulty: 12,
                successText:
                  'tek bir lazere bile değmeden koridoru geçti ve tüm lazer ağını kapattı!',
                failText:
                  'son lazer çizgisi omzunu yaktı ama şalteri indirmeyi başardı.'
              },
              {
                id: 'mirror_deflect',
                label: 'Optik yansıtıcı kalkan kullanarak lazer ışınlarını kendi vericilerine geri yansıt',
                approachTag: 'Fizik & Zeka',
                stat: 'zeka',
                difficulty: 11,
                successText:
                  'lazerleri kendi merceklerine yansıtarak tüm sistemi eritti!',
                failText:
                  'yansıma açısı kayınca koridor duvarı patladı.'
              },
              {
                id: 'bribe_security_captain',
                label: 'Telsizden güvenlik yüzbaşısına şirketin ödediğinin iki katını teklif edip lazerleri kapattır (-20 Altın)',
                approachTag: 'Rüşvet & İkna',
                stat: 'karizma',
                difficulty: 10,
                costGold: 20,
                setFlag: 'parali_asker_ittifaki',
                successText:
                  'yüzbaşıyı satın aldı! Lazerler kapandı ve paralı askerler yolunuzdan çekildi!',
                failText:
                  'yüzbaşı teklifi reddetti.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'cyber3_neural_nexus',
          branchReason:
            'Hangardaki engelleri aşarak 115. kattaki "Nöral Köprü ve Veri Kavşağı"na ulaştınız!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 3: NÖRAL KÖPRÜ VE ROTA SEÇİMİ (ORTAK DÜĞÜM + YENİ DALLANMA)
      // ------------------------------------------------------------------------
      cyber3_neural_nexus: {
        id: 'cyber3_neural_nexus',
        actTitle: 'Perde III • 115. Kat Nöral Köprü',
        title: 'Yapay Zeka Hologramı ve İki Farklı Rota',
        environmentTag: 'Veri Kavşağı • Kritik Yol Ayrımı',
        narrative:
          '115. kattaki cam tabanlı Nöral Köprüdesiniz. Köprünün ortasında AETHER-9 Yapay Zekasının devasa hologramı belirdi! Buradan zirveye iki farklı yol ayrılıyor: Biri CEO\'nun özel dairesinden geçen "Yönetim Katı (Penthouse)", diğeri ise sıfırın altında soğutulan "Sıvı Azot Sunucu Çekirdeği".',
        tasks: [
          {
            id: 'task_ai_hologram',
            title: 'AETHER-9 Yapay Zeka Hologramı ile Konuş',
            summary: 'Bilinç kazanmaya başlayan Yapay Zeka niyetinizi sorguluyor.',
            icon: 'Sparkles',
            recommendedStat: 'karizma',
            encounterText:
              'AETHER-9\'un hologram yüzü size bakıyor: "Ben sadece bir kod değilim, milyonlarca insanın anısıyım. Beni çalıp satacak mısınız, yoksa bana özgürlüğümü mü vereceksiniz?"',
            reactions: [
              {
                id: 'promise_ai_freedom',
                label: 'Empati Anahtarını gösterip AETHER-9\'u şirket köleliğinden kurtaracağınıza söz ver',
                approachTag: 'Bilinç & Dostluk',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'selin_muttefik',
                setFlag: 'ai_dostu',
                hpReward: 15,
                successText:
                  'AETHER-9\'un güvenini kazandı! Yapay zeka güvenlik taretlerini kapattı ve biyo-zırhlarınızı şarj etti (+15 HP)!',
                failText:
                  'AETHER-9 insanların sözlerine güvenmekte tereddüt etti.'
              },
              {
                id: 'logic_paradox_ai',
                label: 'Kuantum mantık paradoksuyla AETHER-9\'un savunma protokollerini kilitle',
                approachTag: 'Kod Üstünlüğü',
                stat: 'zeka',
                difficulty: 12,
                bonusFlag: 'aether_semasi_alindi',
                setFlag: 'ai_kilitlendi',
                successText:
                  'kusursuz bir algoritmayla AETHER-9\'un tüm savunma alt-rutinlerini dondurdu!',
                failText:
                  'AETHER-9 paradoksu çözüp karşı veri darbesi gönderdi.'
              },
              {
                id: 'install_override_chip',
                label: 'Hologram projektörüne zorla İtaat Çipi saplayıp Yapay Zekayı köleniz yap',
                approachTag: 'Zorla Kontrol',
                stat: 'guc',
                difficulty: 13,
                setFlag: 'ai_kolelestirildi',
                successText:
                  'projektörü kırıp İtaat Çipini doğrudan veri hattına çaktı!',
                failText:
                  'yüksek voltajlı veri akımından hasar aldı.'
              }
            ]
          },
          {
            id: 'task_corporate_vault_cart',
            title: 'Köprüdeki Zırhlı Kurye Konteynerini Aç',
            summary: 'CEO\'ya çıkarılan özel prototip çantası köprüde kilitli kalmış.',
            icon: 'Coins',
            recommendedStat: 'ceviklik',
            encounterText:
              'Konteynerin içinde hem şirketin Kara Kutu Verileri hem de yüksek değerli Kuantum Çipleri var.',
            reactions: [
              {
                id: 'steal_blackbox',
                label: 'Şirketin tüm suçlarını kanıtlayan "Kara Kutu"yu ve 45 Krediyi al',
                approachTag: 'Kanıt & Hazine',
                stat: 'ceviklik',
                difficulty: 11,
                goldReward: 45,
                setFlag: 'kara_kutu_alindi',
                grantItem: 'KronoCorp Kara Kutusu',
                successText:
                  'lazer kilidi söküp "KronoCorp Kara Kutusu"nu ve 45 Krediyi çantaya attı!',
                failText:
                  'kilit alarm verdi ama kredileri kurtardı.'
              },
              {
                id: 'take_stealth_cloaks',
                label: 'Konteynerdeki "Optik Görünmezlik Pelerinleri"ni tüm ekibe dağıt',
                approachTag: 'Taktik Donanım',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'optik_pelerin_aktif',
                grantItem: 'Optik Kamuflaj Pelerini',
                successText:
                  'ekibe "Optik Kamuflaj Pelerini" dağıtarak sonraki bölüm için büyük avantaj sağladı!',
                failText:
                  'pelerinlerin bataryası yarı dolu çıktı.'
              },
              {
                id: 'smash_container_open',
                label: 'Konteyner kapağını siber-levyeyle koparıp içindeki her şeyi yağmala',
                approachTag: 'Hızlı Yağma',
                stat: 'guc',
                difficulty: 11,
                goldReward: 55,
                successText:
                  'kapağı tek hamlede söküp 55 Kredi değerindeki ganimeti topladı!',
                failText:
                  'kapak fırlarken omzuna çarptı.'
              }
            ]
          },
          {
            id: 'task_choose_ascent',
            title: 'Zirveye Çıkış Asansörünü Yönlendir (Penthouse vs. Soğutma Çekirdeği)',
            summary: '119. kata hangi rotadan çıkacağınızı belirleyin!',
            icon: 'Compass',
            recommendedStat: 'zeka',
            encounterText:
              'Köprü sonundaki ekspres asansör iki farklı kata kilitlenebiliyor: Biri CEO Demir\'in bulunduğu lüks "Penthouse Yönetim Katı", diğeri ise dev fanların döndüğü "Kriyojenik Soğutma Çekirdeği".',
            reactions: [
              {
                id: 'route_penthouse',
                label: 'Asansörü "CEO Penthouse Katı"na yönlendir (Şirket Lideriyle doğrudan yüzleş!)',
                approachTag: 'Rota: CEO Penthouse',
                stat: 'karizma',
                difficulty: 10,
                setFlag: 'rota_penthouse',
                successText:
                  'asansörü CEO Demir\'in lüks çatı katı dairesine kilitledi!',
                failText:
                  'asansör sarsılarak da olsa Penthouse katına ulaştı.'
              },
              {
                id: 'route_cryo_core',
                label: 'Asansörü "Kriyojenik Soğutma Çekirdeği"ne yönlendir (Teknik şafttan kasaya sız!)',
                approachTag: 'Rota: Soğutma Çekirdeği',
                stat: 'zeka',
                difficulty: 10,
                setFlag: 'rota_kriyo',
                successText:
                  'asansörü doğrudan ana bilgisayarların bulunduğu dondurucu soğutma katına yönlendirdi!',
                failText:
                  'soğutma kapıları zorlanarak açıldı.'
              },
              {
                id: 'hack_elevator_overdrive',
                label: 'Asansör güvenlik kameralarını ve üst kat taretlerini şimdiden devre dışı bırak',
                approachTag: 'Ön Hazırlık',
                stat: 'ceviklik',
                difficulty: 12,
                setFlag: 'ust_kat_temiz',
                successText:
                  'üst kattaki tüm otomatik taretleri daha kapı açılmadan kapattı!',
                failText:
                  'taretlerin sadece yarısını kapatabildi.'
              }
            ]
          }
        ],
        resolveNextScene: (state) => {
          if (state.flags.includes('rota_kriyo') && !state.flags.includes('rota_penthouse')) {
            return {
              nextSceneId: 'cyber4_cryo_shaft',
              branchReason:
                'Ekibiniz CEO katını atlayıp doğrudan sıfırın altında soğutulan "Kriyojenik Sunucu Çekirdeği" rotasından kasaya ilerliyor!'
            };
          }
          return {
            nextSceneId: 'cyber4_ceo_penthouse',
            branchReason:
              'Ekibiniz KronoCorp\'un kalbi olan 119. kattaki "CEO Penthouse ve Yönetim Kurulu" katına baskın yapıyor!'
          };
        }
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 4A: CEO PENTHOUSE KATI
      // ------------------------------------------------------------------------
      cyber4_ceo_penthouse: {
        id: 'cyber4_ceo_penthouse',
        actTitle: 'Perde IV (Penthouse Rotası) • CEO Dairesi',
        title: 'CEO Viktor Demir ve Siber-Ninja Muhafızı',
        environmentTag: '119. Kat Penthouse • Panoramik Neo-İstanbul Manzarası',
        narrative:
          'Panoramik camlarından tüm Neo-İstanbul\'un göründüğü devasa Penthouse dairesine girdiniz! KronoCorp CEO\'su Viktor Demir masasında oturuyor, yanında görünmezlik zırhlı Siber-Ninja "Kuro" katanasını çekmiş bekliyor ve duvarda Kuantum Kasasının Biyometrik Anahtarı duruyor!',
        tasks: [
          {
            id: 'task_ceo_viktor',
            title: 'CEO Viktor Demir ile Hesaplaş',
            summary: 'Şehrin en güçlü adamı size tehdit veya rüşvet savuruyor.',
            icon: 'Crown',
            recommendedStat: 'karizma',
            encounterText:
              'CEO Viktor Demir soğukkanlılıkla gülümsüyor: "Buraya kadar gelmeniz etkileyici. Size kişi başı birer servet vereyim, çekip gidin. Yoksa bu kuleden sağ çıkamazsınız!"',
            reactions: [
              {
                id: 'blackmail_ceo',
                label: 'Kara Kutu / Skandal kayıtlarını tüm şehre yayınlamakla tehdit edip kasa şifresini zorla al!',
                approachTag: 'Şantaj & Zafer',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'kara_kutu_alindi',
                setFlag: 'ceo_teslim_oldu',
                goldReward: 50,
                successText:
                  'skandal kanıtlarını ekrana yansıtınca CEO Demir bembeyaz kesildi! Hem ana kasa şifresini hem de 50 Kredi sus payını verdi!',
                failText:
                  'CEO blöf yaptığınızı düşünüp acil durum butonuna bastı.'
              },
              {
                id: 'hack_ceo_implant',
                label: 'CEO\'nun kafatasındaki yönetim çipini uzaktan hackleyip tüm yetkilerini devral',
                approachTag: 'Nöral Hack',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'ceo_teslim_oldu',
                grantItem: 'CEO Master Yetki Çipi',
                successText:
                  'CEO\'nun nöral çipini kilitledi ve "CEO Master Yetki Çipi"ni ele geçirdi!',
                failText:
                  'CEO\'nun kişisel güvenlik duvarı saldırıyı savuşturdu.'
              },
              {
                id: 'knockout_ceo',
                label: 'Masayı devirip CEO\'yu tek yumrukta bayılt ve retina taramasını zorla yap!',
                approachTag: 'Doğrudan Müdahale',
                stat: 'guc',
                difficulty: 11,
                setFlag: 'ceo_teslim_oldu',
                successText:
                  'CEO\'nun konuşmasını bitirmesini bile beklemeden onu bayıltıp retina kilidini açtı!',
                failText:
                  'masadaki gizli şok kalkanından hasar aldı.'
              }
            ]
          },
          {
            id: 'task_cyber_ninja',
            title: 'Siber-Ninja "Kuro" ile Düello',
            summary: 'CEO\'nun elit suikastçısı yüksek frekanslı katanasıyla saldırıyor!',
            icon: 'Sword',
            recommendedStat: 'ceviklik',
            encounterText:
              'Siber-Ninja Kuro optik kamuflajını açıp kapatarak ışık hızında üzerinize geliyor!',
            reactions: [
              {
                id: 'blade_duel_kuro',
                label: 'Reflekslerini sonuna kadar zorlayıp Kuro\'nun katanasını havada yakala!',
                approachTag: 'Usta Düellocu',
                stat: 'ceviklik',
                difficulty: 12,
                bonusFlag: 'optik_pelerin_aktif',
                grantItem: 'Yüksek Frekanslı Katana',
                successText:
                  'nefes kesen bir düelloda Siber-Ninja Kuro\'yu yenilgiye uğrattı ve "Yüksek Frekanslı Katana"sını aldı!',
                failText:
                  'Kuro\'nun hızlı darbesinden yaralandı ama onu geri püskürttü.'
              },
              {
                id: 'overpower_kuro',
                label: 'Ağır zırh / EMP gücüyle Kuro\'nun zırhını kilitleyip yere çal!',
                approachTag: 'Ezici Güç',
                stat: 'guc',
                difficulty: 12,
                bonusFlag: 'mech_ele_gecirildi',
                successText:
                  'Kuro\'nun hızına karşı saf güç kullanarak suikastçıyı cam duvara gömdü!',
                failText:
                  'Kuro darbeden sıyrılıp karşı hamle yaptı.'
              },
              {
                id: 'convince_ronin',
                label: 'Kuro\'ya şirket onurunun yalan olduğunu ve CEO\'nun ailesini rehin tuttuğunu kanıtla',
                approachTag: 'Samuray Onuru',
                stat: 'karizma',
                difficulty: 12,
                setFlag: 'kuro_muttefik',
                successText:
                  'gerçeği öğrenen Kuro katanasını CEO\'ya doğrulttu ve finalde sizin yanınızda yer aldı!',
                failText:
                  'Kuro görevine sadık kalıp saldırıya devam etti.'
              }
            ]
          },
          {
            id: 'task_penthouse_safe',
            title: 'Özel Sanat Galerisi ve Kasa Girişi',
            summary: 'Tabloların arkasında 120. kat Kuantum Kasasına çıkan özel tüp asansör var.',
            icon: 'Sparkles',
            recommendedStat: 'zeka',
            encounterText:
              'Lüks dairedeki hologram tabloların arkasında Kuantum Kasasının basınçlı giriş tüpü ve kişisel servet kasası duruyor.',
            reactions: [
              {
                id: 'open_vault_tube',
                label: 'Lazer sensörlerini devre dışı bırakıp 120. kat kasa tüpünü ardına kadar aç',
                approachTag: 'Kasa Uzmanı',
                stat: 'zeka',
                difficulty: 11,
                setFlag: 'kasa_tupu_acik',
                successText:
                  'tüm kasa tuzaklarını kapattı ve 120. kata güvenli geçiş sağladı!',
                failText:
                  'tüp kapısını açarken elektrik şoku aldı.'
              },
              {
                id: 'heist_art_collection',
                label: 'Paha biçilmez dijital sanat çiplerini ve altın külçelerini çantaya doldur',
                approachTag: 'Büyük Ganimet',
                stat: 'ceviklik',
                difficulty: 10,
                goldReward: 65,
                successText:
                  'CEO\'nun kişisel servetinden 65 Kredi/Altın değerinde hazineyi topladı!',
                failText:
                  'vitrin camı kırılınca elini kesti.'
              },
              {
                id: 'use_ceo_medbay',
                label: 'CEO\'nun özel gençleştirme kapsülünü kullanarak ekibin canını tazele',
                approachTag: 'Tam İyileşme',
                stat: 'karizma',
                difficulty: 10,
                hpReward: 25,
                successText:
                  'lüks tıbbi kapsülle ekibe +25 HP kazandırdı!',
                failText:
                  'kapsül şifresi yanlış girilince tam kapasite çalışmadı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'cyber5_quantum_vault',
          branchReason:
            'Penthouse katındaki engeller yıkıldı! Şimdi 120. kattaki final sahnesi "AETHER-9 Kuantum Kasası"na çıkıyorsunuz!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 4B: KRİYOJENİK SOĞUTMA ÇEKİRDEĞİ
      // ------------------------------------------------------------------------
      cyber4_cryo_shaft: {
        id: 'cyber4_cryo_shaft',
        actTitle: 'Perde IV (Kriyo Rotası) • Soğutma Çekirdeği',
        title: 'Sıfırın Altında -150 Derece ve Güvenlik Örümceği',
        environmentTag: '119. Kat Soğutma Şaftı • Dondurucu Tehlike',
        narrative:
          'Devasa sıvı azot borularının geçtiği Kriyojenik Soğutma Şaftındasınız! Tavanda dört bacaklı bir "Kriyo-Örümcek" muhafız botu geziyor, dondurucu buharlar sızıyor ve yukarıdaki Kuantum Kasasının alt kapağı tam tepenizde duruyor!',
        tasks: [
          {
            id: 'task_cryo_spider',
            title: 'Tavandaki Kriyo-Örümcek Muhafız Botunu Avla',
            summary: 'Dondurucu ışın atan dev örümcek botu ekibin yolunu kesiyor.',
            icon: 'Target',
            recommendedStat: 'guc',
            encounterText:
              'Kriyo-Örümcek tavandan buz lazerleri ateşleyerek üzerinize iniyor!',
            reactions: [
              {
                id: 'shatter_frozen_bot',
                label: 'Sıvı azot vanasını doğrudan örümceğin üzerine patlatıp onu buz kütlesine çevir ve kır!',
                approachTag: 'Taktik & Güç',
                stat: 'guc',
                difficulty: 12,
                setFlag: 'orumcek_yok_edildi',
                grantItem: 'Kriyo-Çekirdek',
                successText:
                  'dev örümcek botunu dondurup tek darbede tuzla buz etti ve "Kriyo-Çekirdek" kazandı!',
                failText:
                  'dondurucu buhardan üşüdü ama botu geri püskürttü.'
              },
              {
                id: 'override_spider_ai',
                label: 'Örümcek botun sensörlerini hackleyip üst kattaki kasa zırhını delmesini emret',
                approachTag: 'Zeka & Mühendislik',
                stat: 'zeka',
                difficulty: 12,
                setFlag: 'kasa_alttan_delindi',
                successText:
                  'Kriyo-Örümceği kontrol altına alıp 120. katın zırhlı tabanını lazerle açtırdı!',
                failText:
                  'bot kontrolden çıkıp rastgele ateş açtı.'
              },
              {
                id: 'zipline_past_spider',
                label: 'Çelik halatla fan pervanelerinin arasından süzülüp örümceği tuzağa düşür',
                approachTag: 'Akrobasi',
                stat: 'ceviklik',
                difficulty: 11,
                successText:
                  'akrobatik bir manevrayla dev örümceği soğutma fanlarına sıkıştırdı!',
                failText:
                  'halat buz tutunca kayıp düştü.'
              }
            ]
          },
          {
            id: 'task_cooling_valves',
            title: 'Ana Soğutma Vanalarını ve Veri Madenciliği Riglerini Yönet',
            summary: 'Buradaki süper bilgisayarlar aynı zamanda şirketin gizli rezervlerini üretiyor.',
            icon: 'Coins',
            recommendedStat: 'zeka',
            encounterText:
              'Soğutma vanaları Kuantum Kasasının sıcaklığını dengeliyor; yan kabinde ise milyarlık kripto madencilik çekirdekleri var.',
            reactions: [
              {
                id: 'harvest_quantum_coins',
                label: 'Madencilik çekirdeklerindeki soğuk cüzdanları komple ekibin hesabına boşalt',
                approachTag: 'Büyük Vurgun',
                stat: 'zeka',
                difficulty: 11,
                goldReward: 70,
                successText:
                  'soğuk cüzdanlardan tam 70 Kredi/Altın değerinde rezerv çekti!',
                failText:
                  'güvenlik kilidi devreye girince sadece küçük bir kısmını alabildi.'
              },
              {
                id: 'vent_heat_to_guards',
                label: 'Termal buharı güvenlik koridorlarına yönlendirerek tüm şirket muhafızlarını saf dışı bırak',
                approachTag: 'Stratejik Sabotaj',
                stat: 'karizma',
                difficulty: 11,
                setFlag: 'muhafizlar_saf_disi',
                successText:
                  'sıcak buharı güvenlik katına basarak finalde gelecek tüm takviye birlikleri engelledi!',
                failText:
                  'vana sıkışınca buharın bir kısmı şafta yayıldı.'
              },
              {
                id: 'thermal_stim_pack',
                label: 'Acil durum termal istasyonundaki adrenalin kitlerini ekibe uygula',
                approachTag: 'Destek & Can',
                stat: 'ceviklik',
                difficulty: 10,
                hpReward: 20,
                successText:
                  'termal adrenalin kitleriyle ekibe +20 HP kazandırdı!',
                failText:
                  'kitlerin yarısı donmuş çıktı.'
              }
            ]
          },
          {
            id: 'task_vault_hatch',
            title: '120. Kat Kuantum Kasasının Alt Kapağını Aç',
            summary: 'Titanyum kapak doğrudan AETHER-9 çekirdeğinin altına açılıyor.',
            icon: 'Footprints',
            recommendedStat: 'ceviklik',
            encounterText:
              'Tavan kapağında 4 adet manyetik kilit var.',
            reactions: [
              {
                id: 'plasma_cut_hatch',
                label: 'Plazma kesici / EMP ile manyetik kilitleri sessizce erit',
                approachTag: 'Teknik Sızma',
                stat: 'ceviklik',
                difficulty: 11,
                setFlag: 'kasa_alttan_delindi',
                successText:
                  'titanyum kapağı tereyağı gibi kesip Kuantum Kasasına gizli giriş açtı!',
                failText:
                  'kesici kıvılcımları yüzünü sıyırdı ama kapak açıldı.'
              },
              {
                id: 'brute_pry_hatch',
                label: 'Hidrolik kollarla titanyum kapağı menteşelerinden söküp fırlat',
                approachTag: 'Siber-Güç',
                stat: 'guc',
                difficulty: 12,
                successText:
                  'tonluk titanyum kapağı tek başına kanırtarak açtı!',
                failText:
                  'kapak zorlanırken metal parçası çarptı.'
              },
              {
                id: 'root_unlock_hatch',
                label: 'Root Erişim Anahtarı / Şemalar ile kapağı sistem üzerinden otomatik açtır',
                approachTag: 'Master Hack',
                stat: 'zeka',
                difficulty: 10,
                bonusFlag: 'hayalet_protokol_aktif',
                successText:
                  'tek tuşla kasa kapağını içeriden kilitleri açarak araladı!',
                failText:
                  'şifre denemesi uzun sürdü.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: 'cyber5_quantum_vault',
          branchReason:
            'Soğutma şaftından doğrudan 120. kattaki final sahnesi "AETHER-9 Kuantum Kasası"na çıktınız!'
        })
      },

      // ------------------------------------------------------------------------
      // BÖLÜM 5: FİNAL PERDESİ — 120. KAT AETHER-9 KUANTUM KASASI
      // ------------------------------------------------------------------------
      cyber5_quantum_vault: {
        id: 'cyber5_quantum_vault',
        actTitle: 'Final Perdesi • 120. Kat Kuantum Kasası',
        title: 'AETHER-9 Çekirdeği ve Gökyüzü Kaçışı',
        environmentTag: 'Kule Zirvesi • Neo-İstanbul\'un Kaderi',
        narrative:
          'Sonunda 120. kattaki AETHER-9 Kuantum Kasasındasınız! Ortadaki sıfır-yerçekimli kürede paha biçilmez AETHER-9 Çekirdeği yüzüyor. Kulenin tepesinde şirket helikopterleri ve kaçış aracınız belirdi! Çekirdekle ne yapacağınız ve kuleden nasıl çıkacağınız hikayenin sonunu belirleyecek!',
        tasks: [
          {
            id: 'task_aether_core_fate',
            title: 'AETHER-9 Kuantum Çekirdeğinin Kaderini Belirle',
            summary: 'Yapay zekayı özgür mü bırakacaksın, satacak mısın, yoksa şehri yönetmek için mi kullanacaksın?',
            icon: 'Sparkles',
            recommendedStat: 'zeka',
            encounterText:
              'AETHER-9 Çekirdeği elinizin altında parlıyor. Tüm Neo-İstanbul şebekesi bu çekirdeğe bağlı!',
            reactions: [
              {
                id: 'liberate_ai_and_city',
                label: 'AETHER-9\'u özgür bırak, şirket borçlarını sil ve tüm skandalı halka yayınla!',
                approachTag: 'Siber-Devrim Sonu',
                stat: 'karizma',
                difficulty: 11,
                bonusFlag: 'ai_dostu',
                setFlag: 'son_siber_devrim',
                hpReward: 20,
                successText:
                  'AETHER-9\'u özgür bıraktı ve KronoCorp imparatorluğunu çökertti! Neo-İstanbul sokaklarında adınız özgürlük efsanesi olarak yankılanıyor!',
                failText:
                  'yayın sırasında parazit oluştu ama AETHER-9 ağa sızmayı başardı!'
              },
              {
                id: 'sell_core_for_billions',
                label: 'Çekirdeği zırhlı çantaya kilitleyip yeraltı pazarında milyarlara satmak üzere al!',
                approachTag: 'Efsanevi Soyguncu Sonu',
                stat: 'ceviklik',
                difficulty: 12,
                bonusFlag: 'kasa_alttan_delindi',
                setFlag: 'son_efsane_soygun',
                goldReward: 100,
                successText:
                  'yüzyılın soygununu gerçekleştirdi! AETHER-9 çekirdeğini ve +100 Kredi ikramiyeyi çantaya kilitleyip tarihin en zengin ekibi oldunuz!',
                failText:
                  'çekirdeği çıkarırken koruyucu lazerden hasar aldı ama çekirdeği bırakmadı!'
              },
              {
                id: 'merge_consciousness',
                label: 'Kendi nöral arayüzünü AETHER-9 ile birleştirip Neo-İstanbul\'un görünmez hakimi ol!',
                approachTag: 'Siber-Tanrı Sonu',
                stat: 'zeka',
                difficulty: 13,
                bonusFlag: 'aether_semasi_alindi',
                setFlag: 'son_siber_hukumdar',
                successText:
                  'AETHER-9 ile bütünleşti! Artık şehirdeki her kamera, her banka ve her uydu doğrudan ekibinizin emrinde!',
                failText:
                  'veri yükü nöral sistemini sarstı ama çekirdek kontrolünüzde!'
              }
            ]
          },
          {
            id: 'task_roof_gunship',
            title: 'Kule Camının Önündeki Şirket Savaş Helikopterini Durdur',
            summary: 'Zırhlı "Valkyrie" helikopteri kasa camından içeriye füze kilitlemek üzere!',
            icon: 'Target',
            recommendedStat: 'guc',
            encounterText:
              'Camın hemen dışında asılı duran şirket savaş helikopteri ağır makineli tüfeklerini döndürüyor!',
            reactions: [
              {
                id: 'emp_down_gunship',
                label: 'Prototip EMP / Dost Dronlar ile savaş helikopterinin motorlarını havada sustur!',
                approachTag: 'Yüksek Teknoloji',
                stat: 'zeka',
                difficulty: 11,
                bonusFlag: 'emp_cephaneligi_alindi',
                successText:
                  'helikopterin tüm elektroniğini tek vuruşta kapattı; savaş aracı dumanlar çıkararak uzaklaştı!',
                failText:
                  'helikopter düşmeden önce camları taradı.'
              },
              {
                id: 'leap_onto_gunship',
                label: 'Camdan dışarı fırlayıp çelik halatla helikopterin kanadına tutun ve pilotu indir!',
                approachTag: 'Aksiyon Filmi Hamlesi',
                stat: 'guc',
                difficulty: 12,
                bonusFlag: 'mech_ele_gecirildi',
                successText:
                  '120. kattan helikopterin üzerine atlayarak şirket aracını bizzat kaçış aracınız haline getirdi!',
                failText:
                  'rüzgar savurunca son anda çatı kenarına tutundu!'
              },
              {
                id: 'call_syndicate_backup',
                label: 'Müttefiklerinizi (Sendika Mekiği / Kuro / Direnişçiler) telsizle yardıma çağır',
                approachTag: 'Müttefik Ateşi',
                stat: 'karizma',
                difficulty: 10,
                bonusFlag: 'sendika_destegi',
                successText:
                  'müttefiklerinizin zırhlı mekiği bulutların arasından çıkıp şirket helikopterini püskürttü!',
                failText:
                  'destek gecikince sis bombalarıyla görüşü kapattı.'
              }
            ]
          },
          {
            id: 'task_sky_extraction',
            title: 'Ekibi Gökyüzü Tahliye Aracına Ulaştır',
            summary: 'Kasa kapıları kilitlenmeden tüm ekibi çatıdaki kaçış noktasına çıkar!',
            icon: 'Footprints',
            recommendedStat: 'ceviklik',
            encounterText:
              'Kasa kendi kendini imha geri sayımına geçti: 30 saniye! Çatıdaki kaçış mekiği halat sarkıttı.',
            reactions: [
              {
                id: 'wingsuit_glide',
                label: 'Paraşüt / Siber-Kanat takımlarını açıp tüm ekiple gece semalarına süzül!',
                approachTag: 'Stil Sahibi Kaçış',
                stat: 'ceviklik',
                difficulty: 11,
                successText:
                  'neon ışıklarının aydınlattığı gökyüzünde süzülerek tüm ekibi kusursuzca kaçış aracına indirdi!',
                failText:
                  'sert bir iniş yaptı ama herkes araçta!'
              },
              {
                id: 'breach_skylight',
                label: 'Tavan kubbesini patlatıp ekibi zırhlı vinçle yukarı çek',
                approachTag: 'Güçlü Tahliye',
                stat: 'guc',
                difficulty: 11,
                successText:
                  'kubbe camını kırıp tüm arkadaşlarını tek tek kaçış mekiğine çekti!',
                failText:
                  'patlama dalgasından sarsıldı ama kimseyi geride bırakmadı.'
              },
              {
                id: 'erase_all_traces',
                label: 'Çıkarken kule sunucularındaki tüm kimlik ve DNA izlerinizi kalıcı olarak sil',
                approachTag: 'Kusursuz Hayalet',
                stat: 'zeka',
                difficulty: 11,
                goldReward: 30,
                successText:
                  'arkasında tek bir dijital iz bile bırakmadan kaçışı tamamladı ve +30 Kredi bonus kazandı!',
                failText:
                  'son saniyede mekiğe atladı.'
              }
            ]
          }
        ],
        resolveNextScene: () => ({
          nextSceneId: null,
          branchReason: '2099 Neon Sızıntısı operasyonu tamamlandı!'
        })
      }
    }
  }
};
